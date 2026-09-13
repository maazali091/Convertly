import React, { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  Download,
  FileImage,
  Lock,
  RotateCcw,
  Upload,
  Zap,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { supabase } from "../lib/supabase";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

// =========================================
// COMPONENT
// =========================================

function PdfToJpg() {
  const inputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [selectedPages, setSelectedPages] = useState([]);
  const [quality, setQuality] = useState(0.9);

  const [isConverting, setIsConverting] = useState(false);

  const [outputFiles, setOutputFiles] = useState([]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================
  // CLEANUP OUTPUT URLS
  // =========================================

  const revokeOutputUrls = () => {
    outputFiles.forEach((output) => {
      if (output?.url) {
        URL.revokeObjectURL(output.url);
      }
    });
  };

  useEffect(() => {
    return () => {
      outputFiles.forEach((output) => {
        if (output?.url) {
          URL.revokeObjectURL(output.url);
        }
      });
    };
  }, [outputFiles]);

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
  // HANDLE PDF FILE
  // =========================================

  const handleFile = async (selectedFile) => {
    if (!selectedFile) {
      return;
    }

    setError("");
    setSuccess("");

    revokeOutputUrls();

    setOutputFiles([]);
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
      const buffer = await selectedFile.arrayBuffer();

      const pdf = await pdfjsLib
        .getDocument({
          data: new Uint8Array(buffer),
        })
        .promise;

      const count = pdf.numPages;

      if (!count) {
        throw new Error("The selected PDF contains no pages.");
      }

      setFile(selectedFile);
      setPageCount(count);

      // Select all pages by default
      setSelectedPages(
        Array.from(
          {
            length: count,
          },
          (_, index) => index + 1
        )
      );
    } catch (error) {
      console.error("PDF loading error:", error);

      setFile(null);
      setPageCount(0);
      setSelectedPages([]);

      setError(
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
  // PAGE SELECTION
  // =========================================

  const togglePage = (pageNumber) => {
    setError("");
    setSuccess("");

    revokeOutputUrls();
    setOutputFiles([]);

    setSelectedPages((previous) => {
      if (previous.includes(pageNumber)) {
        return previous.filter(
          (page) => page !== pageNumber
        );
      }

      return [...previous, pageNumber].sort(
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

    revokeOutputUrls();
    setOutputFiles([]);

    setSelectedPages(
      Array.from(
        {
          length: pageCount,
        },
        (_, index) => index + 1
      )
    );
  };

  // =========================================
  // DESELECT ALL
  // =========================================

  const deselectAll = () => {
    setError("");
    setSuccess("");

    revokeOutputUrls();
    setOutputFiles([]);

    setSelectedPages([]);
  };

  // =========================================
  // REMOVE PDF
  // =========================================

  const handleRemove = () => {
    revokeOutputUrls();

    setFile(null);
    setPageCount(0);
    setSelectedPages([]);
    setOutputFiles([]);
    setError("");
    setSuccess("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  // =========================================
  // CONVERT ONE PAGE TO JPG
  // =========================================

  const convertPageToJpg = async (
    pdf,
    pageNumber,
    baseName
  ) => {
    const page = await pdf.getPage(pageNumber);

    const scale = 2;

    const viewport = page.getViewport({
      scale,
    });

    const canvas = document.createElement("canvas");

    const context = canvas.getContext("2d", {
      alpha: false,
    });

    if (!context) {
      throw new Error(
        "Unable to create canvas context."
      );
    }

    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);

    // White background
    context.fillStyle = "#ffffff";

    context.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    await page.render({
      canvasContext: context,
      viewport,
    }).promise;

    const blob = await new Promise(
      (resolve, reject) => {
        canvas.toBlob(
          (result) => {
            if (result) {
              resolve(result);
            } else {
              reject(
                new Error(
                  "Unable to create JPG image."
                )
              );
            }
          },
          "image/jpeg",
          quality
        );
      }
    );

    const url = URL.createObjectURL(blob);

    return {
      url,
      blob,
      name: `${baseName}-page-${pageNumber}.jpg`,
      pageNumber,
    };
  };

  // =========================================
  // CONVERT PDF
  // =========================================

  const handleConvert = async () => {
    // ---------------------------------------
    // BASIC VALIDATION
    // ---------------------------------------

    if (!file) {
      setError("Please upload a PDF file first.");
      return;
    }

    if (selectedPages.length === 0) {
      setError("Please select at least one page.");
      return;
    }

    // ---------------------------------------
    // START CONVERSION
    // ---------------------------------------

    setIsConverting(true);

    setError("");
    setSuccess("");

    revokeOutputUrls();
    setOutputFiles([]);

    try {
      // -------------------------------------
      // LOAD PDF
      // -------------------------------------

      const buffer = await file.arrayBuffer();

      const pdf = await pdfjsLib
        .getDocument({
          data: new Uint8Array(buffer),
        })
        .promise;

      const baseName = file.name.replace(
        /\.pdf$/i,
        ""
      );

      const newFiles = [];

      // -------------------------------------
      // CONVERT SELECTED PAGES
      // -------------------------------------

      for (const pageNumber of selectedPages) {
        const output = await convertPageToJpg(
          pdf,
          pageNumber,
          baseName
        );

        newFiles.push(output);
      }

      // -------------------------------------
      // DATABASE DAILY LIMIT
      // -------------------------------------
      //
      // IMPORTANT:
      // We consume the conversion only AFTER
      // the actual conversion succeeds.
      //
      // This means if PDF processing fails,
      // the user's daily conversion is NOT used.
      //

      const { data: usageResult, error: usageError } =
        await supabase.rpc("consume_conversion");

      if (usageError) {
        console.error(
          "Usage error:",
          usageError
        );

        // Clean generated files because
        // database verification failed.
        newFiles.forEach((output) => {
          if (output?.url) {
            URL.revokeObjectURL(output.url);
          }
        });

        throw new Error(
          "Unable to verify your daily conversion limit. Please try again."
        );
      }

      // -------------------------------------
      // LIMIT REACHED
      // -------------------------------------

      if (!usageResult?.success) {
        newFiles.forEach((output) => {
          if (output?.url) {
            URL.revokeObjectURL(output.url);
          }
        });

        throw new Error(
          usageResult?.message ||
          "Daily conversion limit reached."
        );
      }

      // -------------------------------------
      // SUCCESS
      // -------------------------------------

      setOutputFiles(newFiles);

      setSuccess(
        `${newFiles.length} ${newFiles.length === 1
          ? "page has"
          : "pages have"
        } been converted to JPG successfully.`
      );
    } catch (error) {
      console.error(
        "PDF to JPG conversion error:",
        error
      );

      setOutputFiles([]);

      setError(
        error?.message ||
        "PDF to JPG conversion failed. Please try another PDF file."
      );
    } finally {
      setIsConverting(false);
    }
  };

  // =========================================
  // DOWNLOAD ALL
  // =========================================

  const downloadAll = async () => {
    if (outputFiles.length === 0) {
      return;
    }

    if (outputFiles.length === 1) {
      const link = document.createElement("a");

      link.href = outputFiles[0].url;
      link.download = outputFiles[0].name;

      document.body.appendChild(link);

      link.click();

      link.remove();

      return;
    }

    for (const output of outputFiles) {
      const link = document.createElement("a");

      link.href = output.url;
      link.download = output.name;

      document.body.appendChild(link);

      link.click();

      link.remove();

      await new Promise((resolve) =>
        setTimeout(resolve, 150)
      );
    }
  };

  // =========================================
  // UI
  // =========================================

  return (
    <main className="min-h-screen bg-white px-4 py-10 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100 sm:py-12">
      <div className="mx-auto max-w-3xl">

        {/* HEADER */}

        <div className="mb-7 text-center">

          <div className="mb-3 inline-flex rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
            PDF Tools
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            PDF to JPG
          </h1>

          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500 dark:text-slate-400">
            Convert PDF pages into high-quality JPG
            images directly in your browser.
          </p>

        </div>

        {/* MAIN CARD */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">

          {!file ? (

            /* UPLOAD */

            <label
              htmlFor="pdf-jpg-upload"
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-11 text-center transition hover:border-blue-500 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-blue-500 dark:hover:bg-blue-500/5"
              onDragOver={(event) => {
                event.preventDefault();

                event.currentTarget.classList.add(
                  "border-blue-500",
                  "bg-blue-50",
                  "dark:bg-blue-500/5"
                );
              }}
              onDragLeave={(event) => {
                event.currentTarget.classList.remove(
                  "border-blue-500",
                  "bg-blue-50",
                  "dark:bg-blue-500/5"
                );
              }}
              onDrop={(event) => {
                event.preventDefault();

                event.currentTarget.classList.remove(
                  "border-blue-500",
                  "bg-blue-50",
                  "dark:bg-blue-500/5"
                );

                handleFile(
                  event.dataTransfer.files?.[0]
                );
              }}
            >

              <div className="mb-4 flex justify-center">

                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                  <Upload size={27} />
                </div>

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
                id="pdf-jpg-upload"
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />

            </label>

          ) : (

            <>

              {/* FILE INFO */}

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
                  onClick={handleRemove}
                  className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  Remove
                </button>

              </div>

              {/* PAGE SELECT */}

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
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
                    >
                      Select all
                    </button>

                    <button
                      type="button"
                      onClick={deselectAll}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
                    >
                      Clear
                    </button>

                  </div>

                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">

                  {Array.from(
                    {
                      length: pageCount,
                    },
                    (_, index) => {

                      const pageNumber =
                        index + 1;

                      const isSelected =
                        selectedPages.includes(
                          pageNumber
                        );

                      return (
                        <button
                          key={pageNumber}
                          type="button"
                          onClick={() =>
                            togglePage(
                              pageNumber
                            )
                          }
                          className={`relative flex min-h-32 flex-col items-center justify-center rounded-xl border-2 p-3 transition ${isSelected
                            ? "border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-500/10"
                            : "border-slate-200 bg-slate-50 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/60 dark:hover:border-slate-700"
                            }`}
                        >

                          {isSelected && (
                            <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                              <Check size={12} />
                            </div>
                          )}

                          <div className="mb-2 flex h-16 w-12 items-center justify-center rounded-md border border-slate-300 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">

                            <FileImage
                              size={22}
                              className="text-blue-500"
                            />

                          </div>

                          <span className="text-xs font-semibold">
                            Page {pageNumber}
                          </span>

                        </button>
                      );
                    }
                  )}

                </div>

              </div>

              {/* QUALITY */}

              <div className="mt-5">

                <div className="mb-3">

                  <h2 className="text-sm font-semibold">
                    JPG quality
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Higher quality creates larger image
                    files.
                  </p>

                </div>

                <div className="grid grid-cols-3 gap-2">

                  {[
                    {
                      value: 0.7,
                      label: "Standard",
                    },
                    {
                      value: 0.9,
                      label: "Recommended",
                    },
                    {
                      value: 1,
                      label: "High",
                    },
                  ].map((option) => (

                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setQuality(option.value);

                        revokeOutputUrls();

                        setOutputFiles([]);

                        setSuccess("");
                      }}
                      className={`rounded-xl border-2 px-3 py-2.5 text-xs font-semibold transition ${quality === option.value
                        ? "border-blue-500 bg-blue-50 text-blue-600 dark:border-blue-500 dark:bg-blue-500/10 dark:text-blue-400"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700"
                        }`}
                    >
                      {option.label}
                    </button>

                  ))}

                </div>

              </div>

              {/* CONVERT / SUCCESS */}

              {!outputFiles.length ? (

                <button
                  type="button"
                  onClick={handleConvert}
                  disabled={
                    isConverting ||
                    selectedPages.length === 0
                  }
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {isConverting ? (

                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Converting...
                    </>

                  ) : (

                    <>
                      <FileImage size={17} />
                      Convert to JPG
                    </>

                  )}

                </button>

              ) : (

                /* SUCCESS */

                <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900/50 dark:bg-green-950/30">

                  <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-600 text-white">
                      <Check size={18} />
                    </div>

                    <div>

                      <h2 className="text-sm font-semibold text-green-800 dark:text-green-300">
                        Conversion complete
                      </h2>

                      <p className="mt-0.5 text-xs text-green-700 dark:text-green-400">
                        {outputFiles.length} JPG{" "}
                        {outputFiles.length === 1
                          ? "image is"
                          : "images are"}{" "}
                        ready.
                      </p>

                    </div>

                  </div>

                  {/* DOWNLOAD BUTTONS */}

                  <div className="mt-4 grid gap-2 sm:grid-cols-2">

                    {outputFiles.map((output) => (

                      <a
                        key={output.name}
                        href={output.url}
                        download={output.name}
                        className="flex items-center justify-center gap-2 rounded-xl border border-green-200 bg-white px-4 py-2.5 text-xs font-semibold text-green-700 transition hover:bg-green-100 dark:border-green-900/50 dark:bg-slate-900 dark:text-green-400 dark:hover:bg-green-950/40"
                      >

                        <Download size={15} />

                        Page {output.pageNumber}

                      </a>

                    ))}

                  </div>

                  <button
                    type="button"
                    onClick={downloadAll}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
                  >

                    <Download size={17} />

                    Download All JPGs

                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      revokeOutputUrls();

                      setOutputFiles([]);

                      setSuccess("");
                    }}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  >

                    <RotateCcw size={16} />

                    Convert Again

                  </button>

                </div>

              )}

            </>
          )}

          {/* ERROR */}

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">

              <AlertTriangle
                size={18}
                className="mt-0.5 shrink-0"
              />

              <span>{error}</span>

            </div>
          )}

          {/* SUCCESS MESSAGE */}

          {success && !outputFiles.length && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-600 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-400">

              <Check
                size={18}
                className="mt-0.5 shrink-0"
              />

              <span>{success}</span>

            </div>
          )}

        </div>

        {/* FEATURES */}

        <div className="mt-5 grid gap-3 sm:grid-cols-3">

          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">

            <div className="mb-2 text-blue-600 dark:text-blue-400">
              <Zap size={20} />
            </div>

            <h3 className="text-sm font-semibold">
              Fast
            </h3>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Convert PDF pages directly in your
              browser.
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
              <FileImage size={20} />
            </div>

            <h3 className="text-sm font-semibold">
              JPG images
            </h3>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Download converted pages individually
              or together.
            </p>

          </div>

        </div>

        {/* NOTE */}

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">

          <strong className="text-slate-700 dark:text-slate-300">
            Note:
          </strong>{" "}
          Each successful PDF conversion counts as
          one daily conversion, regardless of how
          many pages you select. Your conversion
          limit is managed securely by the database.

        </div>

      </div>
    </main>
  );
}

export default PdfToJpg;