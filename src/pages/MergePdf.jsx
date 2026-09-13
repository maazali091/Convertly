import React, { useRef, useState } from "react";
import {
  Upload,
  Download,
  X,
  CheckCircle,
  Loader2,
  Zap,
  Lock,
  FileText,
  AlertTriangle,
  FileType,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Merge,
} from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { supabase } from "../lib/supabase";

function MergePdf() {
  const inputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [merging, setMerging] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [dragIndex, setDragIndex] = useState(null);

  // ─────────────────────────────────────────────
  // Handle files
  // ─────────────────────────────────────────────

  const handleFiles = (selectedFiles) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    setError("");

    const pdfFiles = Array.from(selectedFiles).filter(
      (file) =>
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf")
    );

    if (pdfFiles.length === 0) {
      setError("Please select PDF files only.");
      return;
    }

    if (pdfFiles.length < 2) {
      setError("Please select at least 2 PDF files to merge.");
      return;
    }

    // Add new files to existing list with unique IDs
    const newFiles = pdfFiles.map((file) => ({
      file,
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
    }));

    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    setDownloadUrl("");
    setProgress(0);
  };

  const handleInputChange = (e) => {
    handleFiles(e.target.files);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  // ─────────────────────────────────────────────
  // Reorder files
  // ─────────────────────────────────────────────

  const moveFile = (index, direction) => {
    const newIndex = direction === "up" ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= files.length) return;

    const newFiles = [...files];
    const temp = newFiles[index];
    newFiles[index] = newFiles[newIndex];
    newFiles[newIndex] = temp;

    setFiles(newFiles);
    setDownloadUrl("");
  };

  const handleDragStart = (index) => {
    setDragIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();

    if (dragIndex === null || dragIndex === index) return;

    const newFiles = [...files];
    const draggedItem = newFiles[dragIndex];
    newFiles.splice(dragIndex, 1);
    newFiles.splice(index, 0, draggedItem);

    setFiles(newFiles);
    setDragIndex(index);
    setDownloadUrl("");
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  // ─────────────────────────────────────────────
  // Merge PDFs
  // ─────────────────────────────────────────────

  const mergePdfs = async () => {
    if (files.length < 2) return;

    setMerging(true);
    setError("");
    setProgress(0);

    try {
      // 1. Check session & usage
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        setError("Please log in to continue.");
        return;
      }

      const {
        data: usageData,
        error: usageError,
      } = await supabase.functions.invoke("rapid-handler", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (usageError || !usageData?.success) {
        setError(
          usageData?.message ||
          "Unable to check your conversion limit."
        );
        return;
      }

      if (usageData.usage.remaining <= 0) {
        setError(
          "You have reached your daily conversion limit. Upgrade to Pro to continue."
        );
        return;
      }

      // 2. Create a new PDF document
      const mergedPdf = await PDFDocument.create();

      // 3. Copy pages from each PDF
      for (let i = 0; i < files.length; i++) {
        const file = files[i].file;
        const arrayBuffer = await file.arrayBuffer();

        // Load the source PDF
        const sourcePdf = await PDFDocument.load(arrayBuffer, {
          ignoreEncryption: true,
          updateMetadata: false,
        });

        // Copy all pages from source to merged PDF
        const pages = await mergedPdf.copyPages(
          sourcePdf,
          sourcePdf.getPageIndices()
        );

        // Add each page to the merged PDF
        pages.forEach((page) => {
          mergedPdf.addPage(page);
        });

        // Update progress
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }

      // 4. Save the merged PDF
      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setDownloadUrl(url);
      setProgress(100);

      // 5. Consume conversion credit
      const {
        data: consumeData,
        error: consumeError,
      } = await supabase.rpc("consume_conversion");

      if (consumeError || !consumeData?.success) {
        console.error(
          "Usage could not be updated:",
          consumeError || consumeData
        );
      }
    } catch (err) {
      console.error(err);

      if (err.message?.includes("encrypted")) {
        setError(
          "One or more PDF files are password-protected. Please remove the password and try again."
        );
      } else {
        setError(
          "Something went wrong while merging your PDF files."
        );
      }
    } finally {
      setMerging(false);
    }
  };

  // ─────────────────────────────────────────────
  // Download merged PDF
  // ─────────────────────────────────────────────

  const downloadPdf = async () => {
    if (!downloadUrl || downloading) return;

    setDownloading(true);

    await new Promise((resolve) => setTimeout(resolve, 700));

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `merged-${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setDownloading(false);
    }, 800);
  };

  // ─────────────────────────────────────────────
  // Remove single file
  // ─────────────────────────────────────────────

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    setDownloadUrl("");
    setError("");
    setProgress(0);
  };

  // ─────────────────────────────────────────────
  // Remove all
  // ─────────────────────────────────────────────

  const removeAll = () => {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }

    setFiles([]);
    setDownloadUrl("");
    setError("");
    setProgress(0);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  // ─────────────────────────────────────────────
  // Get total size
  // ─────────────────────────────────────────────

  const getTotalSize = () => {
    const totalBytes = files.reduce((sum, item) => sum + item.file.size, 0);
    return (totalBytes / 1024 / 1024).toFixed(2);
  };

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-white px-4 py-10 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100 sm:py-12">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-7 text-center">
          <div className="mb-3 inline-flex rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
            PDF Tools
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Merge PDF
          </h1>

          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500 dark:text-slate-400">
            Combine multiple PDF files into one single document.
          </p>
        </div>

        {/* Main card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          {/* Upload area */}
          {files.length === 0 && (
            <label
              htmlFor="merge-pdf-upload"
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add(
                  "border-blue-500",
                  "bg-blue-50",
                  "dark:bg-blue-500/5"
                );
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove(
                  "border-blue-500",
                  "bg-blue-50",
                  "dark:bg-blue-500/5"
                );
              }}
              onDrop={handleDrop}
              className="block cursor-pointer rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-11 text-center transition hover:border-blue-500 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-blue-500 dark:hover:bg-blue-500/5"
            >
              <div className="mb-4 flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                  <Upload size={27} />
                </div>
              </div>

              <h2 className="text-base font-semibold">
                Upload your PDF files
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Drag & drop or click to browse
              </p>

              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                Select at least 2 PDF files
              </p>

              <span className="mt-4 inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
                Choose PDF Files
              </span>

              <input
                ref={inputRef}
                id="merge-pdf-upload"
                type="file"
                accept=".pdf,application/pdf"
                multiple
                onChange={handleInputChange}
                className="hidden"
              />
            </label>
          )}

          {/* Files selected */}
          {files.length > 0 && (
            <>
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold">
                    {files.length}{" "}
                    {files.length === 1 ? "PDF File" : "PDF Files"} selected
                  </h2>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Total size: {getTotalSize()} MB • Drag to reorder
                  </p>
                </div>

                <div className="flex gap-2">
                  <label
                    htmlFor="add-more-pdfs"
                    className="shrink-0 cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
                  >
                    Add more
                  </label>
                  <button
                    type="button"
                    onClick={removeAll}
                    className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/10"
                  >
                    Remove all
                  </button>
                </div>

                <input
                  id="add-more-pdfs"
                  type="file"
                  accept=".pdf,application/pdf"
                  multiple
                  onChange={handleInputChange}
                  className="hidden"
                />
              </div>

              {/* File list */}
              <div className="space-y-2">
                {files.map((item, index) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center justify-between rounded-xl border p-3 transition ${dragIndex === index
                      ? "border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-500/10"
                      : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60"
                      } cursor-move`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex flex-col items-center gap-1">
                        <GripVertical size={16} className="text-slate-400" />
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {index + 1}
                        </span>
                      </div>

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                        <FileType size={20} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                          {item.file.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {(item.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 ml-3">
                      <button
                        type="button"
                        onClick={() => moveFile(index, "up")}
                        disabled={index === 0}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed dark:hover:bg-slate-700 dark:hover:text-slate-200"
                        aria-label="Move up"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveFile(index, "down")}
                        disabled={index === files.length - 1}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed dark:hover:bg-slate-700 dark:hover:text-slate-200"
                        aria-label="Move down"
                      >
                        <ArrowDown size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="ml-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                        aria-label={`Remove ${item.file.name}`}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Merge button */}
              {!downloadUrl && (
                <button
                  type="button"
                  onClick={mergePdfs}
                  disabled={merging || files.length < 2}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {merging ? (
                    <>
                      <Loader2 size={19} className="animate-spin" />
                      Merging... {progress > 0 && `${progress}%`}
                    </>
                  ) : (
                    <>
                      <Merge size={18} />
                      Merge {files.length} PDF Files
                    </>
                  )}
                </button>
              )}

              {/* Progress bar */}
              {/* {merging && (
                <div className="mt-4">
                  <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )} */}

              {/* Result */}
              {downloadUrl && (
                <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-center dark:border-green-900/50 dark:bg-green-950/30">
                  <CheckCircle
                    size={40}
                    className="mx-auto text-green-600 dark:text-green-400"
                  />

                  <h3 className="mt-2 text-base font-semibold text-green-800 dark:text-green-300">
                    Merge complete
                  </h3>

                  <p className="mt-1 text-xs text-green-700 dark:text-green-400">
                    Your {files.length} PDF files have been merged successfully.
                  </p>

                  <button
                    type="button"
                    onClick={downloadPdf}
                    disabled={downloading}
                    className="mt-4 inline-flex min-w-40 items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-70"
                  >
                    {downloading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download size={18} />
                        Download Merged PDF
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 text-blue-600 dark:text-blue-400">
              <Zap size={22} />
            </div>
            <h3 className="text-sm font-semibold">Fast</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
              Merge your PDFs directly in your browser.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 text-green-600 dark:text-green-400">
              <Lock size={22} />
            </div>
            <h3 className="text-sm font-semibold">Private</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
              Your files never leave your device.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 text-purple-600 dark:text-purple-400">
              <Merge size={22} />
            </div>
            <h3 className="text-sm font-semibold">Reorder files</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
              Drag and drop to arrange files in any order.
            </p>
          </div>
        </div>

        {/* Note */}
        <div className="mt-5 rounded-xl bg-slate-50 px-5 py-4 text-xs leading-5 text-slate-500 dark:border dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          <strong className="font-semibold text-slate-800 dark:text-slate-200">
            Note:
          </strong>{" "}
          Files are merged in the order shown above. Password-protected PDFs
          cannot be merged. The maximum file size is 100MB per PDF.
        </div>
      </div>
    </main>
  );
}

export default MergePdf;