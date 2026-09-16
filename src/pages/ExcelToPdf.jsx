import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  FileSpreadsheet,
  Lock,
  FileText,
  Download,
  Check,
  AlertTriangle,
  Loader2,
  Trash2,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import LimitReached from "../components/LimitReached";

function ExcelToPdf() {
  const [file, setFile] = useState(null);
  const [sheets, setSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [isConverting, setIsConverting] = useState(false);
  const [convertedFile, setConvertedFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // -----------------------------------------
  // Cleanup converted PDF URL
  // -----------------------------------------

  useEffect(() => {
    return () => {
      if (convertedFile?.url) {
        URL.revokeObjectURL(convertedFile.url);
      }
    };
  }, [convertedFile]);

  // -----------------------------------------
  // Format file size
  // -----------------------------------------

  const formatFileSize = (bytes) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // -----------------------------------------
  // Check login + conversion limit
  // Same system as JPG → PDF
  // -----------------------------------------

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
      usageData.usage.remaining <= 0
    ) {
      throw new Error(
        "You have reached your daily conversion limit. Upgrade to Pro to continue."
      );
    }

    return true;
  };

  // -----------------------------------------
  // Consume conversion
  // Database RPC
  // -----------------------------------------

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
        "Your PDF was created, but we could not update your conversion usage."
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

  // -----------------------------------------
  // Upload Excel
  // -----------------------------------------

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    setError("");
    setSuccess("");

    if (convertedFile?.url) {
      URL.revokeObjectURL(convertedFile.url);
    }

    setConvertedFile(null);
    setSheets([]);
    setSelectedSheet("");

    const fileName = selectedFile.name.toLowerCase();

    const isExcel =
      fileName.endsWith(".xlsx") ||
      fileName.endsWith(".xls") ||
      fileName.endsWith(".csv");

    if (!isExcel) {
      setFile(null);
      setError(
        "Please select an Excel file (.xlsx, .xls) or CSV file."
      );
      event.target.value = "";
      return;
    }

    try {
      const arrayBuffer =
        await selectedFile.arrayBuffer();

      const workbook = XLSX.read(arrayBuffer, {
        type: "array",
      });

      const sheetNames = workbook.SheetNames;

      if (!sheetNames.length) {
        throw new Error("No worksheets found.");
      }

      setFile(selectedFile);
      setSheets(sheetNames);
      setSelectedSheet(sheetNames[0]);
    } catch (err) {
      console.error("Excel loading error:", err);

      setFile(null);
      setError(
        "Unable to read this Excel file. Please try another file."
      );
    }

    // Allow selecting same file again
    event.target.value = "";
  };

  // -----------------------------------------
  // Remove file
  // -----------------------------------------

  const handleRemove = () => {
    if (convertedFile?.url) {
      URL.revokeObjectURL(convertedFile.url);
    }

    setFile(null);
    setSheets([]);
    setSelectedSheet("");
    setConvertedFile(null);
    setError("");
    setSuccess("");
  };

  // -----------------------------------------
  // Convert Excel → PDF
  // -----------------------------------------

  const handleConvert = async () => {
    if (!file) {
      setError("Please upload an Excel file first.");
      return;
    }

    if (!selectedSheet) {
      setError("Please select a worksheet.");
      return;
    }

    setIsConverting(true);
    setError("");
    setSuccess("");

    if (convertedFile?.url) {
      URL.revokeObjectURL(convertedFile.url);
    }

    setConvertedFile(null);

    try {
      // ---------------------------------------
      // 1. Check login + daily conversion limit
      // ---------------------------------------

      await checkConversionLimit();

      // ---------------------------------------
      // 2. Read Excel file
      // ---------------------------------------

      const arrayBuffer =
        await file.arrayBuffer();

      const workbook = XLSX.read(arrayBuffer, {
        type: "array",
      });

      const worksheet =
        workbook.Sheets[selectedSheet];

      if (!worksheet) {
        throw new Error(
          "Selected worksheet was not found."
        );
      }

      // ---------------------------------------
      // 3. Convert worksheet to rows
      // ---------------------------------------

      const rows = XLSX.utils.sheet_to_json(
        worksheet,
        {
          header: 1,
          defval: "",
          raw: false,
        }
      );

      if (!rows.length) {
        throw new Error(
          "The selected worksheet is empty."
        );
      }

      const cleanRows = rows.filter((row) =>
        row.some(
          (cell) =>
            cell !== null &&
            cell !== undefined &&
            String(cell).trim() !== ""
        )
      );

      if (!cleanRows.length) {
        throw new Error(
          "The selected worksheet does not contain any data."
        );
      }

      // ---------------------------------------
      // 4. Create PDF
      // ---------------------------------------

      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(selectedSheet, 14, 15);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);

      doc.text(file.name, 14, 21);

      doc.setTextColor(0);

      const header = cleanRows[0];
      const body = cleanRows.slice(1);

      autoTable(doc, {
        head: [header],
        body,
        startY: 27,

        theme: "grid",

        styles: {
          fontSize: 7,
          cellPadding: 2,
          overflow: "linebreak",
          valign: "middle",
        },

        headStyles: {
          fontSize: 7,
          fontStyle: "bold",
        },

        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },

        margin: {
          top: 27,
          right: 10,
          bottom: 12,
          left: 10,
        },

        tableWidth: "auto",

        didDrawPage: () => {
          const pageNumber =
            doc.internal.getNumberOfPages();

          doc.setFontSize(8);
          doc.setTextColor(120);

          doc.text(
            `Page ${pageNumber}`,
            doc.internal.pageSize.getWidth() - 25,
            doc.internal.pageSize.getHeight() - 6
          );

          doc.setTextColor(0);
        },
      });

      // ---------------------------------------
      // 5. Generate PDF blob
      // ---------------------------------------

      const pdfBlob = doc.output("blob");

      // ---------------------------------------
      // 6. Consume conversion
      // Supabase PostgreSQL database
      // ---------------------------------------

      await consumeConversion();

      // ---------------------------------------
      // 7. Create browser download URL
      // ---------------------------------------

      const url =
        URL.createObjectURL(pdfBlob);

      const outputName =
        file.name.replace(
          /\.(xlsx|xls|csv)$/i,
          ""
        ) + ".pdf";

      setConvertedFile({
        url,
        name: outputName,
        size: pdfBlob.size,
      });

      // ---------------------------------------
      // 8. Success
      // ---------------------------------------

      setSuccess(
        "Excel file converted to PDF successfully."
      );
    } catch (err) {
      console.error(
        "Excel to PDF conversion error:",
        err
      );

      setError(
        err?.message ||
        "Excel to PDF conversion failed. Please try another file."
      );
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 px-4 py-10 text-slate-900 dark:text-slate-100">
      <div className="mx-auto max-w-4xl">

        {/* ───────────────── HEADER ───────────────── */}

        <div className="mb-7 text-center">

          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 dark:bg-blue-950/40 px-4 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400">
            <FileSpreadsheet size={15} />
            Document Converter
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Excel to PDF
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500 dark:text-slate-400">
            Convert Excel spreadsheets into clean,
            printable PDF documents directly in your
            browser.
          </p>
        </div>

        {/* ───────────────── MAIN CARD ───────────────── */}

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm sm:p-6">

          {/* ───────────────── UPLOAD ───────────────── */}

          {!file ? (
            <label
              htmlFor="excel-upload"
              className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-6 py-12 text-center transition hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20"
            >

              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400">
                <FileSpreadsheet size={28} />
              </div>

              <h2 className="text-lg font-semibold">
                Upload your Excel file
              </h2>

              <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                Supports XLS, XLSX and CSV
              </p>

              <span className="mt-4 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
                Choose Excel File
              </span>

              <input
                id="excel-upload"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          ) : (
            <>
              {/* ───────────────── FILE INFO ───────────────── */}

              <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 p-4">

                <div className="flex min-w-0 items-center gap-3">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400">
                    <FileSpreadsheet size={22} />
                  </div>

                  <div className="min-w-0">

                    <p className="truncate font-semibold text-slate-800 dark:text-slate-100">
                      {file.name}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {formatFileSize(file.size)}
                    </p>

                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemove}
                  className="inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <Trash2 size={16} />
                  Remove
                </button>

              </div>

              {/* ───────────────── SHEET SELECT ───────────────── */}

              {!convertedFile &&
                sheets.length > 1 && (
                  <div className="mt-5">

                    <label
                      htmlFor="sheet-select"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Select worksheet
                    </label>

                    <select
                      id="sheet-select"
                      value={selectedSheet}
                      onChange={(e) => {
                        setSelectedSheet(
                          e.target.value
                        );

                        setConvertedFile(null);
                        setSuccess("");
                        setError("");
                      }}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-slate-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    >
                      {sheets.map((sheet) => (
                        <option
                          key={sheet}
                          value={sheet}
                        >
                          {sheet}
                        </option>
                      ))}
                    </select>

                  </div>
                )}

              {/* ───────────────── SELECTED SHEET ───────────────── */}

              {!convertedFile && (
                <div className="mt-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-4 py-3">

                  <div className="flex items-center justify-between gap-3">

                    <div>

                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Selected worksheet
                      </p>

                      <p className="mt-0.5 font-semibold">
                        {selectedSheet}
                      </p>

                    </div>

                    {sheets.length > 1 && (
                      <span className="rounded-full bg-blue-100 dark:bg-blue-950/50 px-2.5 py-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                        {sheets.length} sheets
                      </span>
                    )}

                  </div>

                </div>
              )}

              {/* ───────────────── CONVERT BUTTON ───────────────── */}

              {!convertedFile ? (
                <button
                  type="button"
                  onClick={handleConvert}
                  disabled={isConverting}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isConverting ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Converting Excel...
                    </>
                  ) : (
                    <>
                      <FileText size={18} />
                      Convert to PDF
                    </>
                  )}
                </button>
              ) : (
                /* ───────────────── RESULT ───────────────── */

                <div className="mt-5 rounded-xl border border-green-200 dark:border-green-900/60 bg-green-50 dark:bg-green-950/20 p-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-600 text-white">
                      <Check size={18} />
                    </div>

                    <div>

                      <h2 className="font-semibold text-green-800 dark:text-green-400">
                        Conversion complete
                      </h2>

                      <p className="text-sm text-green-700 dark:text-green-500">
                        Your PDF is ready to download.
                      </p>

                    </div>

                  </div>

                  <div className="mt-3 rounded-lg border border-green-100 dark:border-slate-700 bg-white dark:bg-slate-900 p-3">

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Output file
                    </p>

                    <p className="mt-1 truncate text-sm font-semibold">
                      {convertedFile.name}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {formatFileSize(
                        convertedFile.size
                      )}
                    </p>

                  </div>

                  <a
                    href={convertedFile.url}
                    download={convertedFile.name}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700"
                  >
                    <Download size={18} />
                    Download PDF
                  </a>

                </div>
              )}
            </>
          )}

          {/* ───────────────── ERROR ───────────────── */}

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
          {/* ───────────────── SUCCESS ───────────────── */}

          {success && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-green-200 dark:border-green-900/60 bg-green-50 dark:bg-green-950/25 px-4 py-3 text-sm text-green-600 dark:text-green-400">

              <Check
                size={18}
                className="mt-0.5 shrink-0"
              />

              <span>{success}</span>

            </div>
          )}

        </div>

        {/* ───────────────── FEATURES ───────────────── */}

        <div className="mt-6 grid gap-3 sm:grid-cols-3">

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">

            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <FileSpreadsheet size={19} />
            </div>

            <h3 className="font-semibold">
              Excel support
            </h3>

            <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">
              Supports XLS, XLSX and CSV files.
            </p>

          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">

            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400">
              <Lock size={19} />
            </div>

            <h3 className="font-semibold">
              Private
            </h3>

            <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">
              Your spreadsheet is processed locally.
            </p>

          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">

            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <FileText size={19} />
            </div>

            <h3 className="font-semibold">
              Printable PDF
            </h3>

            <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">
              Worksheets are formatted into clean PDF tables.
            </p>

          </div>

        </div>

        {/* ───────────────── NOTE ───────────────── */}

        <div className="mt-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/70 px-4 py-4 text-sm leading-6 text-slate-500 dark:text-slate-400">

          <strong className="text-slate-700 dark:text-slate-200">
            Note:
          </strong>{" "}
          This converter focuses on spreadsheet data and
          table formatting. Advanced Excel features such as
          charts, formulas, macros, merged-cell styling and
          complex formatting may not be reproduced exactly.

        </div>

      </div>
    </main>
  );
}

export default ExcelToPdf;