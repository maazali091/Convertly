import React, { useEffect, useState } from "react";
import { PDFDocument } from "pdf-lib";
import { AlertTriangle, Check, Download, FileDown, Lock, RotateCcw, Zap } from "lucide-react";
import { supabase } from "../lib/supabase";
import LimitReached from "../components/LimitReached";

function CompressPdf() {
  const [file, setFile] = useState(null);
  const [compressionLevel, setCompressionLevel] = useState("recommended");
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressedFile, setCompressedFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // FORMAT FILE SIZE
  const formatFileSize = (bytes) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // CLEAN OUTPUT URL
  useEffect(() => {
    return () => {
      if (compressedFile?.url) {
        URL.revokeObjectURL(compressedFile.url);
      }
    };
  }, [compressedFile]);

  // HANDLE FILE CHANGE
  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      return;
    }
    setError("");
    setSuccess("");
    if (compressedFile?.url) {
      URL.revokeObjectURL(compressedFile.url);
    }
    setCompressedFile(null);
    const isPdf =
      selectedFile.type === "application/pdf" ||
      selectedFile.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setFile(null);
      setError(
        "Please select a valid PDF file."
      );
      event.target.value = "";
      return;
    }
    setFile(selectedFile);
    event.target.value = "";
  };

  // REMOVE FILE
  const handleRemove = () => {
    if (compressedFile?.url) {
      URL.revokeObjectURL(compressedFile.url);
    }
    setFile(null);
    setCompressedFile(null);
    setError("");
    setSuccess("");
  };

  // CHECK CONVERSION LIMIT
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

  // CONSUME CONVERSION
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
        "Your PDF was compressed, but we could not update your conversion usage."
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

  // COMPRESS PDF
  const handleCompress = async () => {
    if (!file) {
      setError("Please upload a PDF file first.");
      return;
    }
    setIsCompressing(true);
    setError("");
    setSuccess("");

    if (compressedFile?.url) {
      URL.revokeObjectURL(compressedFile.url);
    }
    setCompressedFile(null);
    try {
      await checkConversionLimit();
      const arrayBuffer = await file.arrayBuffer();

      const pdf = await PDFDocument.load(
        arrayBuffer,
        {
          ignoreEncryption: false,
        }
      );

      // 3. Compress PDF
      const compressedBytes = await pdf.save({
        useObjectStreams: true,
        addDefaultPage: false,
        objectsPerTick:
          compressionLevel === "maximum"
            ? 100
            : 50,
      });

      // 4. Create blob
      const blob = new Blob(
        [compressedBytes],
        {
          type: "application/pdf",
        }
      );

      // 5. Create download URL
      const url = URL.createObjectURL(blob);

      // 6. File size calculation
      const originalSize = file.size;
      const compressedSize = blob.size;
      const savedBytes = originalSize - compressedSize;
      let percentage = 0;
      if (originalSize > 0) {
        percentage =
          (savedBytes / originalSize) * 100;
      }
      // 7. Output name
      const outputName =
        file.name.replace(
          /\.pdf$/i,
          ""
        ) + "-compressed.pdf";
      // 8. Count ONLY after successful conversion
      try {
        await consumeConversion();
      } catch (usageError) {
        URL.revokeObjectURL(url);
        throw usageError;
      }
      // 9. Save output
      setCompressedFile({
        url,
        name: outputName,
        originalSize,
        compressedSize,
        percentage,
      });
      // 10. Success message
      if (compressedSize < originalSize) {
        setSuccess(
          `PDF compressed successfully. File size reduced by ${Math.max(
            percentage,
            0
          ).toFixed(1)}%.`
        );
      } else {
        setSuccess(
          "PDF was processed successfully, but this PDF was already highly optimized."
        );
      }
    } catch (err) {
      console.error(
        "PDF compression error:",
        err
      );

      setError(
        err?.message ||
        "PDF compression failed. Please try another PDF file."
      );
    } finally {
      setIsCompressing(false);
    }
  };

  // CONVERT AGAIN
  const handleConvertAgain = () => {
    if (compressedFile?.url) {
      URL.revokeObjectURL(
        compressedFile.url
      );
    }
    setCompressedFile(null);
    setError("");
    setSuccess("");
  };

  return (
    <main className="min-h-screen bg-white px-4 py-10 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-7 text-center">
          <div className="mb-3 inline-flex rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
            PDF Tools
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Compress PDF
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500 dark:text-slate-400">
            Reduce the size of your PDF while
            keeping it easy to share and download.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          {!file ? (
            <label htmlFor="compress-pdf-upload" className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-11 text-center transition hover:border-blue-500 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-blue-500 dark:hover:bg-blue-500/5">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <FileDown size={27} />
              </div>
              <h2 className="text-base font-semibold">
                Upload your PDF
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Select a PDF file to compress
              </p>
              <span className="mt-4 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
                Choose PDF
              </span>
              <input id="compress-pdf-upload" type="file" accept=".pdf,application/pdf" onChange={handleFileChange} className="hidden"/>
            </label>
          ) : (
            <>
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
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button type="button" onClick={handleRemove} className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/10" >
                  Remove
                </button>
              </div>
              {!compressedFile && (
                <div className="mt-5">
                  <div className="mb-3">
                    <h2 className="text-sm font-semibold">
                      Compression level
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      Choose how aggressively you
                      want to optimize the PDF.
                    </p>
                  </div>
                  <div className="space-y-2.5">
                    <label className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-3 transition ${compressionLevel === "recommended" ? "border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-500/10"
                          : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
                        }`}>
                      <input type="radio" name="compression" value="recommended"
                        checked={compressionLevel === "recommended"}
                        onChange={(e) =>setCompressionLevel(e.target.value)}
                        className="mt-1 accent-blue-600"/>
                      <div>
                        <p className="text-sm font-semibold">
                          Recommended
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          Good balance between file
                          size and document quality.
                        </p>
                      </div>
                    </label>
                    <label className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-3 transition ${compressionLevel === "maximum"
                          ? "border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-500/10"
                          : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"}`}>
                      <input type="radio" name="compression" value="maximum"
                        checked={compressionLevel === "maximum"}
                        onChange={(e) => setCompressionLevel(e.target.value)}
                        className="mt-1 accent-blue-600"/>
                      <div>
                        <p className="text-sm font-semibold">
                          Maximum compression
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          Try to minimize the resulting
                          PDF size as much as possible.
                        </p>
                      </div>
                    </label>
                  </div>
                  <button type="button" onClick={handleCompress} disabled={isCompressing}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
                    {isCompressing ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Compressing PDF...
                      </>
                    ) : (
                      <>
                        <Zap size={17} />
                        Compress PDF
                      </>
                    )}
                  </button>
                </div>
              )}
              {compressedFile && (
                <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900/50 dark:bg-green-950/30">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-600 text-white">
                      <Check size={18} />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-green-800 dark:text-green-300">
                        Compression complete
                      </h2>
                      <p className="mt-0.5 text-xs text-green-700 dark:text-green-400">
                        Your compressed PDF is ready.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="rounded-lg border border-green-100 bg-white p-2.5 dark:border-green-900/40 dark:bg-slate-900">
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Original
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {formatFileSize(
                          compressedFile.originalSize
                        )}
                      </p>
                    </div>
                    <div className="rounded-lg border border-green-100 bg-white p-2.5 dark:border-green-900/40 dark:bg-slate-900">
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Compressed
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {formatFileSize(
                          compressedFile.compressedSize
                        )}
                      </p>
                    </div>
                    <div className="rounded-lg border border-green-100 bg-white p-2.5 dark:border-green-900/40 dark:bg-slate-900">
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Reduction
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-green-600 dark:text-green-400">
                        {Math.max(
                          compressedFile.percentage,
                          0
                        ).toFixed(1)}
                        %
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 rounded-lg border border-green-100 bg-white p-3 dark:border-green-900/40 dark:bg-slate-900">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Output file
                    </p>
                    <p className="mt-1 truncate text-xs font-semibold text-slate-800 dark:text-slate-100">
                      {compressedFile.name}
                    </p>
                  </div>
                  <a href={compressedFile.url} download={compressedFile.name} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700">
                    <Download size={17} />
                    Download Compressed PDF
                  </a>
                  <button type="button" onClick={handleConvertAgain}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
                    <RotateCcw size={16} />
                    Compress Again
                  </button>
                </div>
              )}
            </>
          )}
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
          {success && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-600 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-400">
              <Check size={18} className="mt-0.5 shrink-0" />
              <span>{success}</span>
            </div>
          )}
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-2 text-blue-600 dark:text-blue-400">
              <Zap size={20} />
            </div>
            <h3 className="text-sm font-semibold">
              Fast
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Process your PDF directly in
              the browser.
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
              Your document stays on your
              device.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-900">
            <div className="mb-2 text-blue-600 dark:text-blue-400">
              <FileDown size={20} />
            </div>
            <h3 className="text-sm font-semibold">
              Smaller files
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Compare the original and
              processed file size.
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

          Compression results depend on
          the original PDF. PDFs containing
          already-compressed images may not
          become significantly smaller.

        </div>

      </div>
    </main>
  );
}

export default CompressPdf;