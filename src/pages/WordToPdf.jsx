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
} from "lucide-react";
import { jsPDF } from "jspdf";
import { renderAsync } from "docx-preview";
import html2canvas from "html2canvas";
import { supabase } from "../lib/supabase";
import LimitReached from "../components/LimitReached";

function WordToPdf() {
  const inputRef = useRef(null);
  const previewContainerRef = useRef(null); // hidden container for rendering

  const [files, setFiles] = useState([]);
  const [converting, setConverting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  // ─────────────────────────────────────────────
  // Handle files
  // ─────────────────────────────────────────────

  const handleFiles = (selectedFiles) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    setError("");

    const wordFiles = Array.from(selectedFiles).filter(
      (file) =>
        file.name.toLowerCase().endsWith(".docx") ||
        file.name.toLowerCase().endsWith(".doc")
    );

    if (wordFiles.length === 0) {
      setError("Please select Word documents (.docx or .doc).");
      return;
    }

    // For simplicity, we only support .docx for actual conversion
    // (docx-preview does not support .doc)
    const supportedFiles = wordFiles.filter((file) =>
      file.name.toLowerCase().endsWith(".docx")
    );

    if (supportedFiles.length === 0) {
      setError("Only .docx files are supported for conversion.");
      return;
    }

    setFiles(supportedFiles);
    setDownloadUrl("");
  };

  const handleInputChange = (e) => {
    handleFiles(e.target.files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  // ─────────────────────────────────────────────
  // Convert Word to PDF
  // ─────────────────────────────────────────────

  const convertToPdf = async () => {
    if (files.length === 0) return;

    setConverting(true);
    setError("");

    try {
      // 1. Check session & usage (same as JPG to PDF)
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

      // 2. Create PDF document
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: "a4",
      });

      // 3. Process each Word file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const arrayBuffer = await file.arrayBuffer();

        // Render the docx into a hidden container
        const container = document.createElement("div");
        container.style.width = "800px";
        container.style.position = "absolute";
        container.style.left = "-9999px";
        container.style.top = "0";
        container.style.backgroundColor = "#ffffff";
        container.style.color = "#000000";
        container.style.padding = "40px";

        // Add inline styles to avoid oklch color issues
        container.style.setProperty('color-scheme', 'light');

        document.body.appendChild(container);

        await renderAsync(arrayBuffer, container);

        // Replace any oklch colors with standard colors
        const elements = container.querySelectorAll('*');
        elements.forEach(el => {
          const computedStyle = window.getComputedStyle(el);
          const color = computedStyle.color;
          const backgroundColor = computedStyle.backgroundColor;

          // Check if color contains oklch and replace with black
          if (color && color.includes('oklch')) {
            el.style.color = '#000000';
          }

          // Check if background color contains oklch and replace with white
          if (backgroundColor && backgroundColor.includes('oklch')) {
            el.style.backgroundColor = '#ffffff';
          }
        });

        // Wait for all images to load
        await new Promise((resolve) => {
          const images = container.querySelectorAll('img');
          let loadedImages = 0;
          const totalImages = images.length;

          if (totalImages === 0) {
            resolve();
            return;
          }

          images.forEach(img => {
            if (img.complete) {
              loadedImages++;
              if (loadedImages === totalImages) resolve();
            } else {
              img.onload = () => {
                loadedImages++;
                if (loadedImages === totalImages) resolve();
              };
              img.onerror = () => {
                loadedImages++;
                if (loadedImages === totalImages) resolve();
              };
            }
          });
        });

        // Capture the rendered content as an image
        const canvas = await html2canvas(container, {
          scale: 2, // higher quality
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false, // Disable logging
          allowTaint: true,
          foreignObjectRendering: false,
          // Fix for oklch colors
          onclone: (clonedDoc) => {
            const clonedElements = clonedDoc.querySelectorAll('*');
            clonedElements.forEach(el => {
              const styles = clonedDoc.defaultView.getComputedStyle(el);

              // Replace oklch colors with standard colors
              if (styles.color.includes('oklch')) {
                el.style.color = '#000000';
              }
              if (styles.backgroundColor.includes('oklch')) {
                el.style.backgroundColor = '#ffffff';
              }
              if (styles.borderColor.includes('oklch')) {
                el.style.borderColor = '#cccccc';
              }

              // Remove any custom properties that might contain oklch
              const computedStyles = el.style;
              for (let j = 0; j < computedStyles.length; j++) {
                const prop = computedStyles[j];
                const value = computedStyles.getPropertyValue(prop);
                if (value && value.includes('oklch')) {
                  el.style.removeProperty(prop);
                }
              }
            });
          }
        });

        // Remove the temporary container
        document.body.removeChild(container);

        // Convert canvas to JPEG data URL
        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;

        // Add page to PDF (if not first page, add new page)
        if (i > 0) {
          pdf.addPage([imgWidth, imgHeight], "portrait");
        } else {
          // First page: set page size to match image
          pdf.deletePage(1);
          pdf.addPage([imgWidth, imgHeight], "portrait");
        }

        pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
      }

      // 4. Generate blob and download URL
      const blob = pdf.output("blob");
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

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
      setError(
        "Something went wrong while converting your Word documents. Please try again with a simpler document or contact support."
      );
    } finally {
      setConverting(false);
    }
  };

  // ─────────────────────────────────────────────
  // Download PDF
  // ─────────────────────────────────────────────

  const downloadPdf = async () => {
    if (!downloadUrl || downloading) return;

    setDownloading(true);

    await new Promise((resolve) => setTimeout(resolve, 700));

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = "convertly-word-docs.pdf";
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
            Word to PDF
          </h1>

          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500 dark:text-slate-400">
            Convert multiple Word documents into one high-quality PDF.
          </p>
        </div>

        {/* Main card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          {/* Upload area */}
          {files.length === 0 && (
            <label
              htmlFor="word-pdf-upload"
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
                Upload your Word documents
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Drag & drop or click to browse
              </p>

              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                .docx files only
              </p>

              <span className="mt-4 inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
                Choose Files
              </span>

              <input
                ref={inputRef}
                id="word-pdf-upload"
                type="file"
                accept=".docx,.doc"
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
                    {files.length === 1 ? "Document" : "Documents"} selected
                  </h2>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Each document will become a separate PDF page.
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
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                        <FileText size={20} />
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
              {!downloadUrl && (
                <button
                  type="button"
                  onClick={convertToPdf}
                  disabled={converting}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {converting ? (
                    <>
                      <Loader2 size={19} className="animate-spin" />
                      Converting...
                    </>
                  ) : (
                    <>
                      <FileText size={18} />
                      Convert {files.length}{" "}
                      {files.length === 1 ? "Document" : "Documents"} to PDF
                    </>
                  )}
                </button>
              )}

              {/* Result */}
              {downloadUrl && (
                <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-center dark:border-green-900/50 dark:bg-green-950/30">
                  <CheckCircle
                    size={40}
                    className="mx-auto text-green-600 dark:text-green-400"
                  />

                  <h3 className="mt-2 text-base font-semibold text-green-800 dark:text-green-300">
                    Conversion complete
                  </h3>

                  <p className="mt-1 text-xs text-green-700 dark:text-green-400">
                    Your {files.length}{" "}
                    {files.length === 1 ? "document is" : "documents are"} ready.
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
                        Download PDF
                      </>
                    )}
                  </button>
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
              Convert your documents directly in your browser.
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
              <FileText size={22} />
            </div>
            <h3 className="text-sm font-semibold">Multiple documents</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
              Combine several Word files into one PDF.
            </p>
          </div>
        </div>

        {/* Note */}
        <div className="mt-5 rounded-xl bg-slate-50 px-5 py-4 text-xs leading-5 text-slate-500 dark:border dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          <strong className="font-semibold text-slate-800 dark:text-slate-200">
            Note:
          </strong>{" "}
          Each Word document is placed on its own PDF page. The page size matches
          the rendered content dimensions. Only .docx files are supported.
        </div>
      </div>
    </main>
  );
}

export default WordToPdf;






// UPDATE public.usage
// SET conversions_count = 0
// WHERE user_id = '2bd1e446-7870-48eb-812e-d9e10e805b0a'
//   AND usage_date = CURRENT_DATE;


// SELECT *
// FROM public.usage
// WHERE user_id = '2bd1e446-7870-48eb-812e-d9e10e805b0a'
//   AND usage_date = CURRENT_DATE;