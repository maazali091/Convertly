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
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import { supabase } from "../lib/supabase";
import LimitReached from "../components/LimitReached";

// Configure PDF.js worker - Use local worker from node_modules
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

function PdfToWord() {
  const inputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [converting, setConverting] = useState(false);
  const [downloadUrls, setDownloadUrls] = useState([]);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  // ─────────────────────────────────────────────
  // Handle files
  // ─────────────────────────────────────────────

  const handleFiles = (selectedFiles) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    setError("");

    const pdfFiles = Array.from(selectedFiles).filter(
      (file) => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
    );

    if (pdfFiles.length === 0) {
      setError("Please select PDF files only.");
      return;
    }

    setFiles(pdfFiles);
    setDownloadUrls([]);
    setProgress(0);
  };

  const handleInputChange = (e) => {
    handleFiles(e.target.files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  // ─────────────────────────────────────────────
  // Convert PDF to Word
  // ─────────────────────────────────────────────

  const convertToWord = async () => {
    if (files.length === 0) return;

    setConverting(true);
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

      // 2. Process each PDF file
      const urls = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const arrayBuffer = await file.arrayBuffer();

        // Load PDF document with explicit worker configuration
        const loadingTask = pdfjsLib.getDocument({
          data: arrayBuffer,
          useWorkerFetch: false,
          isEvalSupported: false,
          useSystemFonts: true,
        });

        const pdf = await loadingTask.promise;

        // Extract text from all pages
        let fullText = "";

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();

          // Combine text items with proper spacing
          let pageText = "";
          let lastY = null;

          textContent.items.forEach((item) => {
            if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
              pageText += "\n";
            }
            pageText += item.str + " ";
            lastY = item.transform[5];
          });

          fullText += pageText + "\n\n--- Page " + pageNum + " ---\n\n";
        }

        // Create Word document (simplified .docx using HTML content)
        const wordContent = createWordDocument(fullText, file.name);
        const blob = new Blob([wordContent], {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });

        const url = URL.createObjectURL(blob);
        urls.push({
          url,
          name: file.name.replace(/\.pdf$/i, "") + ".docx",
        });

        // Update progress
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }

      setDownloadUrls(urls);

      // 3. Consume conversion credit
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
      setError(
        "Something went wrong while converting your PDF files."
      );
    } finally {
      setConverting(false);
    }
  };

  // ─────────────────────────────────────────────
  // Create Word document (simplified .docx)
  // ─────────────────────────────────────────────

  const createWordDocument = (text, fileName) => {
    // Create a simple .docx file using HTML content
    // This is a simplified version - for production, use docx library
    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" 
            xmlns:w="urn:schemas-microsoft-com:office:word" 
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>${fileName}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          body { font-family: 'Calibri', sans-serif; font-size: 12pt; line-height: 1.5; }
          p { margin: 0 0 10pt 0; }
          .page-break { page-break-before: always; }
        </style>
      </head>
      <body>
        ${text.split("\n").map(line => `<p>${escapeHtml(line) || "&nbsp;"}</p>`).join("")}
      </body>
      </html>
    `;

    return htmlContent;
  };

  // ─────────────────────────────────────────────
  // Helper: Escape HTML
  // ─────────────────────────────────────────────

  const escapeHtml = (text) => {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  };

  // ─────────────────────────────────────────────
  // Download Word files
  // ─────────────────────────────────────────────

  const downloadAll = async () => {
    if (downloadUrls.length === 0 || downloading) return;

    setDownloading(true);

    await new Promise((resolve) => setTimeout(resolve, 700));

    // Download files one by one
    for (let i = 0; i < downloadUrls.length; i++) {
      const { url, name } = downloadUrls[i];

      const link = document.createElement("a");
      link.href = url;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Small delay between downloads
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    setTimeout(() => {
      setDownloading(false);
    }, 800);
  };

  const downloadSingle = async (index) => {
    if (downloading) return;

    setDownloading(true);

    await new Promise((resolve) => setTimeout(resolve, 700));

    const { url, name } = downloadUrls[index];

    const link = document.createElement("a");
    link.href = url;
    link.download = name;
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
    setDownloadUrls([]);
    setError("");
    setProgress(0);
  };

  // ─────────────────────────────────────────────
  // Remove all
  // ─────────────────────────────────────────────

  const removeAll = () => {
    downloadUrls.forEach(({ url }) => {
      URL.revokeObjectURL(url);
    });

    setFiles([]);
    setDownloadUrls([]);
    setError("");
    setProgress(0);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
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
            PDF to Word
          </h1>

          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500 dark:text-slate-400">
            Convert your PDF documents into editable Word files.
          </p>
        </div>

        {/* Main card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          {/* Upload area */}
          {files.length === 0 && (
            <label
              htmlFor="pdf-word-upload"
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
                PDF files only
              </p>

              <span className="mt-4 inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
                Choose PDF Files
              </span>

              <input
                ref={inputRef}
                id="pdf-word-upload"
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
                    Each PDF will be converted to a Word document.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={removeAll}
                  className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  Remove all
                </button>
              </div>

              {/* File list */}
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/60"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                        <FileType size={20} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                          {file.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="ml-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                      aria-label={`Remove ${file.name}`}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Convert button */}
              {!downloadUrls.length && (
                <button
                  type="button"
                  onClick={convertToWord}
                  disabled={converting}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {converting ? (
                    <>
                      <Loader2 size={19} className="animate-spin" />
                      Converting... {progress > 0 && `${progress}%`}
                    </>
                  ) : (
                    <>
                      <FileText size={18} />
                      Convert {files.length}{" "}
                      {files.length === 1 ? "PDF" : "PDFs"} to Word
                    </>
                  )}
                </button>
              )}

              {/* Progress bar */}
              {/* {converting && (
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
              {downloadUrls.length > 0 && (
                <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900/50 dark:bg-green-950/30">
                  <CheckCircle
                    size={40}
                    className="mx-auto text-green-600 dark:text-green-400"
                  />

                  <h3 className="mt-2 text-base font-semibold text-green-800 dark:text-green-300">
                    Conversion complete
                  </h3>

                  <p className="mt-1 text-xs text-green-700 dark:text-green-400">
                    {downloadUrls.length}{" "}
                    {downloadUrls.length === 1 ? "file is" : "files are"} ready.
                  </p>

                  {/* Individual file downloads */}
                  <div className="mt-4 space-y-2">
                    {downloadUrls.map((file, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => downloadSingle(index)}
                        disabled={downloading}
                        className="flex w-full items-center justify-between rounded-lg border border-green-200 bg-white px-4 py-2.5 text-sm transition hover:bg-green-100 disabled:opacity-70 dark:border-green-800 dark:bg-slate-900 dark:hover:bg-green-900/20"
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          <FileText size={16} className="text-green-600 dark:text-green-400" />
                          <span className="truncate">{file.name}</span>
                        </span>
                        <Download size={16} className="ml-2 shrink-0 text-green-600 dark:text-green-400" />
                      </button>
                    ))}
                  </div>

                  {/* Download all button */}
                  {downloadUrls.length > 1 && (
                    <button
                      type="button"
                      onClick={downloadAll}
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
                          Download All ({downloadUrls.length})
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {/* Error */}
          {error && (
            error.includes("daily conversion limit") ? (
              <LimitReached message={error} />
            ) : (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )
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
              Convert your PDF files directly in your browser.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 text-green-600 dark:text-green-400">
              <Lock size={22} />
            </div>
            <h3 className="text-sm font-semibold">Private</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
              Your documents never leave your device.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 text-purple-600 dark:text-purple-400">
              <FileText size={22} />
            </div>
            <h3 className="text-sm font-semibold">Editable output</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
              Get editable Word documents from your PDFs.
            </p>
          </div>
        </div>

        {/* Note */}
        <div className="mt-5 rounded-xl bg-slate-50 px-5 py-4 text-xs leading-5 text-slate-500 dark:border dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          <strong className="font-semibold text-slate-800 dark:text-slate-200">
            Note:
          </strong>{" "}
          Text extraction works best with text-based PDFs. Scanned documents
          or image-based PDFs may require OCR for conversion.
        </div>
      </div>
    </main>
  );
}

export default PdfToWord;