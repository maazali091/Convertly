import React, { useEffect, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import { supabase } from "../lib/supabase";
import {
  AlertTriangle,
  Check,
  Download,
  Lock,
  RotateCcw,
  Scissors,
  Upload,
  Zap,
} from "lucide-react";
import LimitReached from "../components/LimitReached";

function SplitPdf() {
  const inputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [selectedPages, setSelectedPages] = useState([]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [outputFile, setOutputFile] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================
  // FORMAT FILE SIZE
  // =========================================

  const formatFileSize = (bytes) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // =========================================
  // CLEAN OUTPUT URL
  // =========================================

  const revokeOutputUrl = () => {
    if (outputFile?.url) {
      URL.revokeObjectURL(outputFile.url);
    }
  };

  useEffect(() => {
    return () => {
      if (outputFile?.url) {
        URL.revokeObjectURL(outputFile.url);
      }
    };
  }, [outputFile]);

  // =========================================
  // HANDLE PDF FILE
  // =========================================

  const handleFile = async (selectedFile) => {
    if (!selectedFile) {
      return;
    }

    setError("");
    setSuccess("");

    revokeOutputUrl();
    setOutputFile(null);
    setSelectedPages([]);

    const isPdf =
      selectedFile.type === "application/pdf" ||
      selectedFile.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setFile(null);
      setPageCount(0);

      setError("Please select a valid PDF file.");
      return;
    }

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();

      const pdf = await PDFDocument.load(arrayBuffer);

      const count = pdf.getPageCount();

      if (!count) {
        throw new Error("This PDF does not contain any pages.");
      }

      setFile(selectedFile);
      setPageCount(count);

      // Select all pages by default
      setSelectedPages(
        Array.from(
          {
            length: count,
          },
          (_, index) => index
        )
      );
    } catch (err) {
      console.error("PDF loading error:", err);

      setFile(null);
      setPageCount(0);
      setSelectedPages([]);

      setError(
        err?.message ||
        "Unable to read this PDF. Please try another PDF file."
      );
    }
  };

  // =========================================
  // FILE INPUT
  // =========================================

  const handleFileChange = (event) => {
    handleFile(event.target.files?.[0]);

    if (event.target) {
      event.target.value = "";
    }
  };

  // =========================================
  // REMOVE FILE
  // =========================================

  const removeFile = () => {
    revokeOutputUrl();

    setFile(null);
    setPageCount(0);
    setSelectedPages([]);
    setOutputFile(null);

    setError("");
    setSuccess("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  // =========================================
  // TOGGLE PAGE
  // =========================================

  const togglePage = (pageIndex) => {
    setError("");
    setSuccess("");

    revokeOutputUrl();
    setOutputFile(null);

    setSelectedPages((previous) => {
      if (previous.includes(pageIndex)) {
        return previous.filter(
          (page) => page !== pageIndex
        );
      }

      return [...previous, pageIndex].sort(
        (a, b) => a - b
      );
    });
  };

  // =========================================
  // SELECT ALL
  // =========================================

  const selectAll = () => {
    setError("");
    setSuccess("");

    revokeOutputUrl();
    setOutputFile(null);

    setSelectedPages(
      Array.from(
        {
          length: pageCount,
        },
        (_, index) => index
      )
    );
  };

  // =========================================
  // DESELECT ALL
  // =========================================

  const deselectAll = () => {
    setError("");
    setSuccess("");

    revokeOutputUrl();
    setOutputFile(null);

    setSelectedPages([]);
  };

  // =========================================
  // =========================================
  // CHECK CONVERSION LIMIT
  // =========================================

  const checkConversionLimit = async () => {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.access_token) {
      throw new Error("Please log in to continue.");
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
      console.error("Usage check error:", usageError);
      throw new Error(
        usageData?.message ||
        "Unable to check your conversion limit."
      );
    }

    if (
      usageData?.usage &&
      Number(usageData.usage.remaining) <= 0
    ) {
      throw new Error(
        "You have reached your daily conversion limit. Upgrade to Pro to continue."
      );
    }

    return true;
  };

  // =========================================
  // CONSUME CONVERSION
  // =========================================

  const consumeConversion = async () => {
    const {
      data: consumeData,
      error: consumeError,
    } = await supabase.rpc("consume_conversion");

    if (consumeError) {
      console.error(
        "Conversion usage update error:",
        consumeError
      );
      throw new Error(
        "Your PDF was split, but we could not update your conversion usage."
      );
    }

    if (!consumeData?.success) {
      throw new Error(
        consumeData?.message ||
        "Unable to update your conversion usage."
      );
    }

    return consumeData;
  };

  // SPLIT PDF
  // =========================================

  const handleSplit = async () => {
    if (!file) {
      setError("Please upload a PDF file first.");
      return;
    }

    if (selectedPages.length === 0) {
      setError("Please select at least one page.");
      return;
    }

    setIsProcessing(true);
    setError("");
    setSuccess("");

    revokeOutputUrl();
    setOutputFile(null);

    try {
      // 1. Check login + daily conversion limit
      await checkConversionLimit();

      // 2. Read source PDF
      const arrayBuffer = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(arrayBuffer);

      // 3. Create new PDF
      const newPdf = await PDFDocument.create();

      const copiedPages = await newPdf.copyPages(
        sourcePdf,
        selectedPages
      );

      copiedPages.forEach((page) => {
        newPdf.addPage(page);
      });

      // 4. Generate PDF
      const pdfBytes = await newPdf.save({
        useObjectStreams: true,
      });

      const blob = new Blob([pdfBytes], {
        type: "application/pdf",
      });

      // 5. Create download URL
      const url = URL.createObjectURL(blob);

      const originalName =
        file.name.replace(/\.pdf$/i, "");

      const outputName =
        `${originalName}-split.pdf`;

      // 6. Count ONLY after successful conversion
      try {
        await consumeConversion();
      } catch (usageError) {
        URL.revokeObjectURL(url);
        throw usageError;
      }

      // 7. Save output
      setOutputFile({
        url,
        name: outputName,
        size: blob.size,
      });

      // 8. Success
      setSuccess(
        `${selectedPages.length} ${selectedPages.length === 1
          ? "page has"
          : "pages have"
        } been extracted successfully.`
      );
    } catch (err) {
      console.error("PDF split error:", err);

      setError(
        err?.message ||
        "PDF splitting failed. Please try another PDF file."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // CONVERT AGAIN
  // =========================================

  const convertAgain = () => {
    revokeOutputUrl();

    setOutputFile(null);
    setSuccess("");
    setError("");
  };

  // =========================================
  // UI
  // =========================================

  return (
    <main className="min-h-screen bg-white px-4 py-10 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100 sm:py-12">
      <div className="mx-auto max-w-4xl">

        {/* =====================================
            HEADER
        ===================================== */}

        <div className="mb-7 text-center">

          <div className="mb-3 inline-flex rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
            PDF Tools
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Split PDF
          </h1>

          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500 dark:text-slate-400">
            Select the pages you need and create a new PDF
            containing only those pages.
          </p>

        </div>

        {/* =====================================
            MAIN CARD
        ===================================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">

          {/* ===================================
              UPLOAD
          =================================== */}

          {!file ? (

            <label
              htmlFor="split-pdf-upload"
              className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-11 text-center transition hover:border-blue-500 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-blue-500 dark:hover:bg-blue-500/5"
              onDragOver={(event) => {
                event.preventDefault();

                event.currentTarget.classList.add(
                  "border-blue-500",
                  "bg-blue-50"
                );
              }}
              onDragLeave={(event) => {
                event.currentTarget.classList.remove(
                  "border-blue-500",
                  "bg-blue-50"
                );
              }}
              onDrop={(event) => {
                event.preventDefault();

                event.currentTarget.classList.remove(
                  "border-blue-500",
                  "bg-blue-50"
                );

                handleFile(
                  event.dataTransfer.files?.[0]
                );
              }}
            >

              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <Upload size={27} />
              </div>

              <h2 className="text-base font-semibold">
                Upload your PDF
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Drag & drop or click to browse
              </p>

              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                PDF files only
              </p>

              <span className="mt-4 inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
                Choose PDF
              </span>

              <input
                ref={inputRef}
                id="split-pdf-upload"
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />

            </label>

          ) : (

            <>
              {/* =================================
                  FILE INFO
              ================================= */}

              <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/60">

                <div className="flex min-w-0 items-center gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-[10px] font-bold text-red-600 dark:bg-red-500/10 dark:text-red-400">
                    PDF
                  </div>

                  <div className="min-w-0">

                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {file.name}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {pageCount}{" "}
                      {pageCount === 1
                        ? "page"
                        : "pages"}{" "}
                      ·{" "}
                      {formatFileSize(file.size)}
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={removeFile}
                  className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  Remove
                </button>

              </div>

              {/* =================================
                  PAGE SELECTION
              ================================= */}

              {!outputFile && (

                <div className="mt-5">

                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">

                    <div>

                      <h2 className="text-sm font-semibold">
                        Select pages
                      </h2>

                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {selectedPages.length} of{" "}
                        {pageCount} selected
                      </p>

                    </div>

                    <div className="flex gap-2">

                      <button
                        type="button"
                        onClick={selectAll}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                      >
                        Select all
                      </button>

                      <button
                        type="button"
                        onClick={deselectAll}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                      >
                        Clear
                      </button>

                    </div>

                  </div>

                  {/* PAGE GRID */}

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">

                    {Array.from(
                      {
                        length: pageCount,
                      },
                      (_, index) => {

                        const isSelected =
                          selectedPages.includes(
                            index
                          );

                        return (
                          <button
                            key={index}
                            type="button"
                            onClick={() =>
                              togglePage(index)
                            }
                            className={`relative flex min-h-32 flex-col items-center justify-center rounded-xl border-2 p-3 transition ${isSelected
                                ? "border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-500/10"
                                : "border-slate-200 bg-slate-50 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/50 dark:hover:border-slate-700"
                              }`}
                          >

                            {isSelected && (
                              <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
                                <Check size={13} />
                              </div>
                            )}

                            <div className="mb-2 flex h-16 w-11 items-center justify-center rounded-md border border-slate-300 bg-white shadow-sm dark:border-slate-600 dark:bg-slate-700">
                              <span className="text-[10px] font-bold text-red-500">
                                PDF
                              </span>
                            </div>

                            <span className="text-xs font-semibold">
                              Page {index + 1}
                            </span>

                          </button>
                        );
                      }
                    )}

                  </div>

                </div>

              )}

              {/* =================================
                  ACTION / SUCCESS
              ================================= */}

              {!outputFile ? (

                <button
                  type="button"
                  onClick={handleSplit}
                  disabled={
                    isProcessing ||
                    selectedPages.length === 0
                  }
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {isProcessing ? (

                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Splitting PDF...
                    </>

                  ) : (

                    <>
                      <Scissors size={17} />
                      Split PDF
                    </>

                  )}

                </button>

              ) : (

                <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900/50 dark:bg-green-950/30">

                  <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-600 text-white">
                      <Check size={18} />
                    </div>

                    <div>

                      <h2 className="text-sm font-semibold text-green-800 dark:text-green-300">
                        Split complete
                      </h2>

                      <p className="mt-0.5 text-xs text-green-700 dark:text-green-400">
                        Your new PDF is ready to download.
                      </p>

                    </div>

                  </div>

                  <div className="mt-4 rounded-lg border border-green-100 bg-white p-3 dark:border-green-900/40 dark:bg-slate-900">

                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Output file
                    </p>

                    <p className="mt-1 truncate text-sm font-semibold">
                      {outputFile.name}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {formatFileSize(outputFile.size)}
                    </p>

                  </div>

                  <a
                    href={outputFile.url}
                    download={outputFile.name}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
                  >
                    <Download size={17} />
                    Download Split PDF
                  </a>

                  <button
                    type="button"
                    onClick={convertAgain}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <RotateCcw size={16} />
                    Change Pages
                  </button>

                </div>

              )}

            </>

          )}

          {/* =====================================
              ERROR
          ===================================== */}

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

          {/* =====================================
              SUCCESS
          ===================================== */}

          {success && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-600 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-400">

              <Check
                size={18}
                className="mt-0.5 shrink-0"
              />

              <span>{success}</span>

            </div>
          )}

        </div>

        {/* =====================================
            FEATURES
        ===================================== */}

        <div className="mt-5 grid gap-3 sm:grid-cols-3">

          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">

            <div className="mb-2 text-blue-600 dark:text-blue-400">
              <Scissors size={20} />
            </div>

            <h3 className="text-sm font-semibold">
              Select pages
            </h3>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Choose exactly which pages you want.
            </p>

          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">

            <div className="mb-2 text-blue-600 dark:text-blue-400">
              <Lock size={20} />
            </div>

            <h3 className="text-sm font-semibold">
              Private
            </h3>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Your PDF stays on your device.
            </p>

          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">

            <div className="mb-2 text-blue-600 dark:text-blue-400">
              <Zap size={20} />
            </div>

            <h3 className="text-sm font-semibold">
              Fast
            </h3>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Process PDFs directly in your browser.
            </p>

          </div>

        </div>

        {/* =====================================
            NOTE
        ===================================== */}

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">

          <strong className="text-slate-700 dark:text-slate-300">
            Note:
          </strong>{" "}
          Your selected pages are extracted into a new PDF.
          Each successful split operation counts as one
          conversion according to your account's daily
          conversion limit.

        </div>

      </div>
    </main>
  );
}

export default SplitPdf;