import React, { useRef, useState } from "react";
import {
  Upload,
  Download,
  X,
  CheckCircle,
  Loader2, Zap, Lock, FileImage, FileText, AlertTriangle,
} from "lucide-react";
import { jsPDF } from "jspdf";
import { supabase } from "../lib/supabase";
import LimitReached from "../components/LimitReached";

function JpgToPdf() {
  const inputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
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

    const imageFiles = Array.from(selectedFiles).filter((file) =>
      file.type.startsWith("image/")
    );

    if (imageFiles.length === 0) {
      setError("Please select JPG, JPEG or PNG image files.");
      return;
    }

    setFiles(imageFiles);

    const previewUrls = imageFiles.map((file) =>
      URL.createObjectURL(file)
    );

    setPreviews(previewUrls);
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
  // Convert to PDF
  // ─────────────────────────────────────────────

  const convertToPdf = async () => {
    if (files.length === 0) return;

    setConverting(true);
    setError("");

    try {
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

      let pdf;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        const img = new Image();
        const imageUrl = URL.createObjectURL(file);

        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = imageUrl;
        });

        const orientation =
          img.width > img.height
            ? "landscape"
            : "portrait";

        const width = img.width;
        const height = img.height;

        if (i === 0) {
          pdf = new jsPDF({
            orientation,
            unit: "px",
            format: [width, height],
          });
        } else {
          pdf.addPage(
            [width, height],
            orientation
          );
        }

        pdf.addImage(
          img,
          "JPEG",
          0,
          0,
          width,
          height
        );

        URL.revokeObjectURL(imageUrl);
      }

      const blob = pdf.output("blob");
      const url = URL.createObjectURL(blob);

      setDownloadUrl(url);

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
        "Something went wrong while converting your images."
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

    await new Promise((resolve) =>
      setTimeout(resolve, 700)
    );

    const link = document.createElement("a");

    link.href = downloadUrl;
    link.download = "convertly-images.pdf";

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
    if (previews[index]) {
      URL.revokeObjectURL(previews[index]);
    }

    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter(
      (_, i) => i !== index
    );

    setFiles(newFiles);
    setPreviews(newPreviews);
    setDownloadUrl("");
    setError("");
  };

  // ─────────────────────────────────────────────
  // Remove all
  // ─────────────────────────────────────────────

  const removeAll = () => {
    previews.forEach((url) =>
      URL.revokeObjectURL(url)
    );

    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }

    setFiles([]);
    setPreviews([]);
    setDownloadUrl("");
    setError("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <main className="min-h-screen bg-white px-4 py-10 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100 sm:py-12">
      <div className="mx-auto max-w-4xl">

        {/* ───────────────── HEADER ───────────────── */}

        <div className="mb-7 text-center">
          <div className="mb-3 inline-flex rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
            PDF Tools
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            JPG to PDF
          </h1>

          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500 dark:text-slate-400">
            Convert multiple JPG images into one
            high-quality PDF.
          </p>
        </div>

        {/* ───────────────── MAIN CARD ───────────────── */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">

          {/* UPLOAD */}

          {files.length === 0 && (
            <label
              htmlFor="jpg-pdf-upload"
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
                Upload your images
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Drag & drop or click to browse
              </p>

              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                JPG, JPEG or PNG
              </p>

              <span className="mt-4 inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
                Choose Images
              </span>

              <input
                ref={inputRef}
                id="jpg-pdf-upload"
                type="file"
                accept="image/jpeg,image/png"
                multiple
                onChange={handleInputChange}
                className="hidden"
              />
            </label>
          )}

          {/* FILES */}

          {files.length > 0 && (
            <>
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold">
                    {files.length}{" "}
                    {files.length === 1
                      ? "Image"
                      : "Images"}{" "}
                    selected
                  </h2>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Each image will become a separate PDF
                    page.
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

              {/* IMAGE GRID */}

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60"
                  >
                    <div className="flex h-36 items-center justify-center bg-white dark:bg-slate-900">
                      <img
                        src={previews[index]}
                        alt={file.name}
                        className="h-full w-full object-contain"
                      />
                    </div>

                    <div className="border-t border-slate-200 p-2.5 dark:border-slate-800">
                      <p className="truncate text-xs font-medium text-slate-800 dark:text-slate-100">
                        {file.name}
                      </p>

                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {(file.size / 1024 / 1024).toFixed(
                          2
                        )}{" "}
                        MB
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 shadow-sm transition hover:bg-red-50 dark:bg-slate-900/95 dark:hover:bg-red-500/10"
                      aria-label={`Remove ${file.name}`}
                    >
                      <X
                        size={14}
                        className="text-red-500"
                      />
                    </button>
                  </div>
                ))}
              </div>

              {/* CONVERT */}

              {!downloadUrl && (
                <button
                  type="button"
                  onClick={convertToPdf}
                  disabled={converting}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {converting ? (
                    <>
                      <Loader2
                        size={19}
                        className="animate-spin"
                      />
                      Converting...
                    </>
                  ) : (
                    <>
                      <FileText size={18} />
                      Convert{" "}
                      {files.length}{" "}
                      {files.length === 1
                        ? "Image"
                        : "Images"}{" "}
                      to PDF
                    </>
                  )}
                </button>
              )}

              {/* RESULT */}

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
                    {files.length === 1
                      ? "image is"
                      : "images are"}{" "}
                    ready.
                  </p>

                  <button
                    type="button"
                    onClick={downloadPdf}
                    disabled={downloading}
                    className="mt-4 inline-flex min-w-40 items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-70"
                  >
                    {downloading ? (
                      <>
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />
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

          {/* ERROR */}

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

        {/* ───────────────── FEATURES ───────────────── */}

        <div className="mt-6 grid gap-4 sm:grid-cols-3">

          {/* Fast */}

          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 text-blue-600 dark:text-blue-400">
              <Zap size={22} />
            </div>

            <h3 className="text-sm font-semibold">
              Fast
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
              Convert your images directly in your browser.
            </p>
          </div>

          {/* Private */}

          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 text-green-600 dark:text-green-400">
              <Lock size={22} />
            </div>

            <h3 className="text-sm font-semibold">
              Private
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
              Your images are processed directly in your browser.
            </p>
          </div>

          {/* Multiple Images */}

          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 text-purple-600 dark:text-purple-400">
              <FileImage size={22} />
            </div>

            <h3 className="text-sm font-semibold">
              Multiple images
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
              Combine multiple JPG and PNG images into one PDF.
            </p>
          </div>

        </div>

        {/* ───────────────── NOTE ───────────────── */}

        <div className="mt-5 rounded-xl bg-slate-50 px-5 py-4 text-xs leading-5 text-slate-500 dark:border dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          <strong className="font-semibold text-slate-800 dark:text-slate-200">
            Note:
          </strong>{" "}
          Each selected image is placed on its own PDF page.
          The page size follows the dimensions and orientation
          of the original image.
        </div>

      </div>
    </main>
  );
}

export default JpgToPdf;