// import { supabase } from "../lib/supabase";
// import React, { useEffect, useState } from "react";
// import * as XLSX from "xlsx";
// import * as pdfjsLib from "pdfjs-dist";
// import {
//   Upload,
//   FileText,
//   FileSpreadsheet,
//   Lock,
//   Zap,
//   CheckCircle2,
//   Download,
//   X,
//   AlertCircle,
//   ArrowRight,
// } from "lucide-react";

// // PDF.js worker
// pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
//   "pdfjs-dist/build/pdf.worker.min.mjs",
//   import.meta.url
// ).toString();

// function PdfToExcel() {
//   const [file, setFile] = useState(null);
//   const [isConverting, setIsConverting] = useState(false);
//   const [convertedFile, setConvertedFile] = useState(null);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   // -----------------------------------------
//   // Cleanup converted file URL
//   // -----------------------------------------

//   useEffect(() => {
//     return () => {
//       if (convertedFile?.url) {
//         URL.revokeObjectURL(convertedFile.url);
//       }
//     };
//   }, [convertedFile]);

//   // -----------------------------------------
//   // Format file size
//   // -----------------------------------------

//   const formatFileSize = (bytes) => {
//     if (bytes < 1024) {
//       return `${bytes} B`;
//     }

//     if (bytes < 1024 * 1024) {
//       return `${(bytes / 1024).toFixed(1)} KB`;
//     }

//     return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
//   };

//   // -----------------------------------------
//   // Upload PDF
//   // -----------------------------------------

//   const handleFileChange = (event) => {
//     const selectedFile = event.target.files?.[0];

//     if (!selectedFile) return;

//     setError("");
//     setSuccess("");

//     if (convertedFile?.url) {
//       URL.revokeObjectURL(convertedFile.url);
//     }

//     setConvertedFile(null);

//     const isPdf =
//       selectedFile.type === "application/pdf" ||
//       selectedFile.name.toLowerCase().endsWith(".pdf");

//     if (!isPdf) {
//       setFile(null);
//       setError("Please select a valid PDF file.");
//       event.target.value = "";
//       return;
//     }

//     setFile(selectedFile);

//     event.target.value = "";
//   };

//   // -----------------------------------------
//   // Remove PDF
//   // -----------------------------------------

//   const handleRemove = () => {
//     if (convertedFile?.url) {
//       URL.revokeObjectURL(convertedFile.url);
//     }

//     setFile(null);
//     setConvertedFile(null);
//     setError("");
//     setSuccess("");
//   };

//   // -----------------------------------------
//   // Extract text from PDF
//   // -----------------------------------------

//   const extractPdfText = async (pdfFile) => {
//     const arrayBuffer = await pdfFile.arrayBuffer();

//     const pdf = await pdfjsLib.getDocument({
//       data: arrayBuffer,
//     }).promise;

//     const allRows = [];

//     for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
//       const page = await pdf.getPage(pageNumber);
//       const textContent = await page.getTextContent();

//       const items = textContent.items
//         .filter((item) => item.str && item.str.trim())
//         .map((item) => ({
//           text: item.str.trim(),
//           x: item.transform[4],
//           y: item.transform[5],
//         }));

//       const rowMap = new Map();

//       items.forEach((item) => {
//         const roundedY = Math.round(item.y);

//         if (!rowMap.has(roundedY)) {
//           rowMap.set(roundedY, []);
//         }

//         rowMap.get(roundedY).push(item);
//       });

//       const rows = Array.from(rowMap.entries())
//         .sort((a, b) => b[0] - a[0])
//         .map(([, rowItems]) =>
//           rowItems
//             .sort((a, b) => a.x - b.x)
//             .map((item) => item.text)
//         );

//       rows.forEach((row) => {
//         if (row.length > 0) {
//           allRows.push(row);
//         }
//       });

//       if (pageNumber < pdf.numPages) {
//         allRows.push([]);
//       }
//     }

//     return allRows;
//   };

//   // -----------------------------------------
//   // Normalize rows
//   // -----------------------------------------

//   const normalizeRows = (rows) => {
//     const maxColumns = Math.max(...rows.map((row) => row.length), 1);

//     return rows.map((row) => {
//       const normalized = [...row];

//       while (normalized.length < maxColumns) {
//         normalized.push("");
//       }

//       return normalized;
//     });
//   };

//   // -----------------------------------------
//   // Convert PDF → Excel
//   // -----------------------------------------

//   const handleConvert = async () => {
//     if (!file) {
//       setError("Please upload a PDF file first.");
//       return;
//     }

//     setIsConverting(true);
//     setError("");
//     setSuccess("");

//     if (convertedFile?.url) {
//       URL.revokeObjectURL(convertedFile.url);
//     }

//     setConvertedFile(null);

//     try {
//       // -----------------------------------------
//       // Extract PDF data
//       // -----------------------------------------

//       const rows = await extractPdfText(file);

//       if (!rows.length) {
//         throw new Error("No readable text was found in this PDF.");
//       }

//       const cleanRows = rows.filter((row) =>
//         row.some(
//           (cell) =>
//             cell !== null &&
//             cell !== undefined &&
//             String(cell).trim() !== ""
//         )
//       );

//       if (!cleanRows.length) {
//         throw new Error("No readable data was found in this PDF.");
//       }

//       const normalizedRows = normalizeRows(cleanRows);

//       // -----------------------------------------
//       // Create worksheet
//       // -----------------------------------------

//       const worksheet = XLSX.utils.aoa_to_sheet(normalizedRows);

//       const columnCount = normalizedRows[0]?.length || 1;

//       worksheet["!cols"] = Array.from(
//         { length: columnCount },
//         (_, index) => {
//           let maxLength = 10;

//           normalizedRows.forEach((row) => {
//             const value = row[index] || "";

//             maxLength = Math.max(
//               maxLength,
//               String(value).length
//             );
//           });

//           return {
//             wch: Math.min(maxLength + 2, 40),
//           };
//         }
//       );

//       // -----------------------------------------
//       // Create workbook
//       // -----------------------------------------

//       const workbook = XLSX.utils.book_new();

//       XLSX.utils.book_append_sheet(
//         workbook,
//         worksheet,
//         "PDF Data"
//       );

//       // -----------------------------------------
//       // Generate XLSX
//       // -----------------------------------------

//       const excelArray = XLSX.write(workbook, {
//         bookType: "xlsx",
//         type: "array",
//       });

//       const blob = new Blob([excelArray], {
//         type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//       });

//       // -----------------------------------------
//       // Consume daily conversion
//       // -----------------------------------------

//       const { data: usageResult, error: usageError } =
//         await supabase.rpc("consume_conversion");

//       if (usageError) {
//         console.error("Usage error:", usageError);

//         throw new Error(
//           "Unable to verify your daily conversion limit. Please try again."
//         );
//       }

//       if (!usageResult?.success) {
//         throw new Error(
//           usageResult?.message ||
//           "Daily conversion limit reached."
//         );
//       }

//       // -----------------------------------------
//       // Create download URL
//       // -----------------------------------------

//       const url = URL.createObjectURL(blob);

//       const outputName =
//         file.name.replace(/\.pdf$/i, "") + ".xlsx";

//       setConvertedFile({
//         url,
//         name: outputName,
//         size: blob.size,
//       });

//       setSuccess(
//         "PDF converted to Excel successfully."
//       );
//     } catch (err) {
//       console.error("PDF to Excel error:", err);

//       setError(
//         err?.message ||
//         "PDF to Excel conversion failed. Please try another PDF."
//       );
//     } finally {
//       setIsConverting(false);
//     }
//   };

//   return (
//     <main className="min-h-screen bg-gray-50 px-4 py-16 text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
//       <div className="mx-auto max-w-3xl">
//         {/* HEADER */}

//         <div className="mb-10 text-center">
//           <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
//             <FileSpreadsheet size={17} strokeWidth={2.2} />
//             Document Converter
//           </div>

//           <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
//             PDF to Excel
//           </h1>

//           <p className="mx-auto mt-4 max-w-xl text-slate-500 dark:text-slate-400">
//             Extract readable PDF text and convert it into an editable Excel spreadsheet.
//           </p>
//         </div>

//         {/* MAIN CARD */}

//         <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-950/30 sm:p-8">
//           {/* UPLOAD */}

//           {!file ? (
//             <label
//               htmlFor="pdf-to-excel-upload"
//               className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center transition hover:border-blue-500 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-blue-500 dark:hover:bg-blue-950/20"
//             >
//               <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-950/40">
//                 <FileText
//                   size={34}
//                   strokeWidth={2}
//                   className="text-red-500 dark:text-red-400"
//                 />
//               </div>

//               <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
//                 Upload your PDF
//               </h2>

//               <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
//                 Select a PDF containing readable text or tables
//               </p>

//               <span className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
//                 <Upload size={17} />
//                 Choose PDF
//               </span>

//               <input
//                 id="pdf-to-excel-upload"
//                 type="file"
//                 accept=".pdf,application/pdf"
//                 onChange={handleFileChange}
//                 className="hidden"
//               />
//             </label>
//           ) : (
//             <>
//               {/* FILE INFO */}

//               <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
//                 <div className="flex min-w-0 items-center gap-4">
//                   <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-950/40">
//                     <FileText
//                       size={25}
//                       className="text-red-500 dark:text-red-400"
//                     />
//                   </div>

//                   <div className="min-w-0">
//                     <p className="truncate font-semibold text-slate-800 dark:text-white">
//                       {file.name}
//                     </p>

//                     <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
//                       {formatFileSize(file.size)}
//                     </p>
//                   </div>
//                 </div>

//                 <button
//                   type="button"
//                   onClick={handleRemove}
//                   className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
//                 >
//                   <X size={16} />
//                   Remove
//                 </button>
//               </div>

//               {/* CONVERT / DOWNLOAD */}

//               {!convertedFile ? (
//                 <button
//                   type="button"
//                   onClick={handleConvert}
//                   disabled={isConverting}
//                   className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
//                 >
//                   {isConverting ? (
//                     <>
//                       <svg
//                         className="h-5 w-5 animate-spin"
//                         viewBox="0 0 24 24"
//                         fill="none"
//                       >
//                         <circle
//                           cx="12"
//                           cy="12"
//                           r="9"
//                           stroke="currentColor"
//                           strokeWidth="3"
//                           className="opacity-30"
//                         />

//                         <path
//                           d="M21 12a9 9 0 0 0-9-9"
//                           stroke="currentColor"
//                           strokeWidth="3"
//                           strokeLinecap="round"
//                         />
//                       </svg>

//                       Converting PDF...
//                     </>
//                   ) : (
//                     <>
//                       Convert to Excel
//                       <ArrowRight size={18} />
//                     </>
//                   )}
//                 </button>
//               ) : (
//                 /* DOWNLOAD */

//                 <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-5 dark:border-green-900/60 dark:bg-green-950/20">
//                   <div className="flex items-center gap-3">
//                     <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-white dark:bg-green-500">
//                       <CheckCircle2 size={21} />
//                     </div>

//                     <div>
//                       <h2 className="font-semibold text-green-800 dark:text-green-400">
//                         Conversion complete
//                       </h2>

//                       <p className="text-sm text-green-700 dark:text-green-500">
//                         Your Excel file is ready.
//                       </p>
//                     </div>
//                   </div>

//                   <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
//                     <p className="text-xs text-slate-500 dark:text-slate-400">
//                       Output file
//                     </p>

//                     <p className="mt-1 truncate text-sm font-semibold text-slate-800 dark:text-white">
//                       {convertedFile.name}
//                     </p>

//                     <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
//                       {formatFileSize(convertedFile.size)}
//                     </p>
//                   </div>

//                   <a
//                     href={convertedFile.url}
//                     download={convertedFile.name}
//                     className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3.5 font-semibold text-white transition hover:bg-green-700"
//                   >
//                     <Download size={19} />
//                     Download Excel
//                   </a>
//                 </div>
//               )}
//             </>
//           )}

//           {/* ERROR */}

//           {error && (
//             <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/60 dark:bg-red-950/20 dark:text-red-400">
//               <AlertCircle size={18} className="mt-0.5 shrink-0" />
//               <span>{error}</span>
//             </div>
//           )}

//           {/* SUCCESS */}

//           {success && (
//             <div className="mt-5 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600 dark:border-green-900/60 dark:bg-green-950/20 dark:text-green-400">
//               <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
//               <span>{success}</span>
//             </div>
//           )}
//         </div>

//         {/* FEATURES */}

//         <div className="mt-8 grid gap-4 sm:grid-cols-3">
//           <div className="rounded-xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900">
//             <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-950/40">
//               <FileSpreadsheet
//                 size={21}
//                 className="text-green-600 dark:text-green-400"
//               />
//             </div>

//             <h3 className="font-semibold text-slate-900 dark:text-white">
//               Excel output
//             </h3>

//             <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
//               Creates an editable XLSX spreadsheet.
//             </p>
//           </div>

//           <div className="rounded-xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900">
//             <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/40">
//               <Lock
//                 size={21}
//                 className="text-emerald-600 dark:text-emerald-400"
//               />
//             </div>

//             <h3 className="font-semibold text-slate-900 dark:text-white">
//               Private
//             </h3>

//             <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
//               Processing happens directly in your browser.
//             </p>
//           </div>

//           <div className="rounded-xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900">
//             <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/40">
//               <Zap
//                 size={21}
//                 className="text-amber-500 dark:text-amber-400"
//               />
//             </div>

//             <h3 className="font-semibold text-slate-900 dark:text-white">
//               Fast
//             </h3>

//             <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
//               No server upload is required.
//             </p>
//           </div>
//         </div>

//         {/* NOTE */}

//         <div className="mt-8 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-100 p-5 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
//           <AlertCircle
//             size={19}
//             className="mt-0.5 shrink-0 text-blue-500 dark:text-blue-400"
//           />

//           <p>
//             <strong className="text-slate-700 dark:text-slate-200">
//               Note:
//             </strong>{" "}
//             This browser-based version works best with PDFs containing selectable text and simple tables. Scanned or image-only PDFs will require OCR for accurate Excel conversion.
//           </p>
//         </div>
//       </div>
//     </main>
//   );
// }

// export default PdfToExcel;




import { supabase } from "../lib/supabase";
import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import * as pdfjsLib from "pdfjs-dist";
import {
  Upload,
  FileText,
  FileSpreadsheet,
  Lock,
  Zap,
  CheckCircle2,
  Download,
  X,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

// PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

function PdfToExcel() {
  const [file, setFile] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [convertedFile, setConvertedFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // -----------------------------------------
  // Cleanup converted file URL
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
  // Upload PDF
  // -----------------------------------------

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    setError("");
    setSuccess("");

    if (convertedFile?.url) {
      URL.revokeObjectURL(convertedFile.url);
    }

    setConvertedFile(null);

    const isPdf =
      selectedFile.type === "application/pdf" ||
      selectedFile.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setFile(null);
      setError("Please select a valid PDF file.");
      event.target.value = "";
      return;
    }

    setFile(selectedFile);

    event.target.value = "";
  };

  // -----------------------------------------
  // Remove PDF
  // -----------------------------------------

  const handleRemove = () => {
    if (convertedFile?.url) {
      URL.revokeObjectURL(convertedFile.url);
    }

    setFile(null);
    setConvertedFile(null);
    setError("");
    setSuccess("");
  };

  // -----------------------------------------
  // Extract text from PDF
  // -----------------------------------------

  const extractPdfText = async (pdfFile) => {
    const arrayBuffer = await pdfFile.arrayBuffer();

    const pdf = await pdfjsLib.getDocument({
      data: arrayBuffer,
    }).promise;

    const allRows = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();

      const items = textContent.items
        .filter((item) => item.str && item.str.trim())
        .map((item) => ({
          text: item.str.trim(),
          x: item.transform[4],
          y: item.transform[5],
        }));

      const rowMap = new Map();

      items.forEach((item) => {
        const roundedY = Math.round(item.y);

        if (!rowMap.has(roundedY)) {
          rowMap.set(roundedY, []);
        }

        rowMap.get(roundedY).push(item);
      });

      const rows = Array.from(rowMap.entries())
        .sort((a, b) => b[0] - a[0])
        .map(([, rowItems]) =>
          rowItems
            .sort((a, b) => a.x - b.x)
            .map((item) => item.text)
        );

      rows.forEach((row) => {
        if (row.length > 0) {
          allRows.push(row);
        }
      });

      if (pageNumber < pdf.numPages) {
        allRows.push([]);
      }
    }

    return allRows;
  };

  // -----------------------------------------
  // Normalize rows
  // -----------------------------------------

  const normalizeRows = (rows) => {
    const maxColumns = Math.max(...rows.map((row) => row.length), 1);

    return rows.map((row) => {
      const normalized = [...row];

      while (normalized.length < maxColumns) {
        normalized.push("");
      }

      return normalized;
    });
  };

  // -----------------------------------------
  // -----------------------------------------
  // Check conversion limit
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
      Number(usageData.usage.remaining) <= 0
    ) {
      throw new Error(
        "You have reached your daily conversion limit. Upgrade to Pro to continue."
      );
    }

    return true;
  };

  // -----------------------------------------
  // Consume conversion
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
        "Your Excel file was created, but we could not update your conversion usage."
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

  // Convert PDF → Excel
  // -----------------------------------------

  const handleConvert = async () => {
    if (!file) {
      setError("Please upload a PDF file first.");
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
      // 1. Check login + daily conversion limit
      await checkConversionLimit();

      // 2. Extract PDF data
      const rows = await extractPdfText(file);

      if (!rows.length) {
        throw new Error(
          "No readable text was found in this PDF."
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
          "No readable data was found in this PDF."
        );
      }

      const normalizedRows =
        normalizeRows(cleanRows);

      // 3. Create worksheet
      const worksheet =
        XLSX.utils.aoa_to_sheet(
          normalizedRows
        );

      const columnCount =
        normalizedRows[0]?.length || 1;

      worksheet["!cols"] = Array.from(
        { length: columnCount },
        (_, index) => {
          let maxLength = 10;

          normalizedRows.forEach((row) => {
            const value = row[index] || "";

            maxLength = Math.max(
              maxLength,
              String(value).length
            );
          });

          return {
            wch: Math.min(
              maxLength + 2,
              40
            ),
          };
        }
      );

      // 4. Create workbook
      const workbook =
        XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "PDF Data"
      );

      // 5. Generate XLSX
      const excelArray = XLSX.write(
        workbook,
        {
          bookType: "xlsx",
          type: "array",
        }
      );

      const blob = new Blob(
        [excelArray],
        {
          type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }
      );

      // 6. Create download URL
      const url =
        URL.createObjectURL(blob);

      const outputName =
        file.name.replace(
          /\.pdf$/i,
          ""
        ) + ".xlsx";

      // 7. Count ONLY after successful conversion
      try {
        await consumeConversion();
      } catch (usageError) {
        URL.revokeObjectURL(url);
        throw usageError;
      }

      // 8. Save output
      setConvertedFile({
        url,
        name: outputName,
        size: blob.size,
      });

      setSuccess(
        "PDF converted to Excel successfully."
      );
    } catch (err) {
      console.error(
        "PDF to Excel error:",
        err
      );

      setError(
        err?.message ||
        "PDF to Excel conversion failed. Please try another PDF."
      );
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-16 text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      <div className="mx-auto max-w-3xl">
        {/* HEADER */}

        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
            <FileSpreadsheet size={17} strokeWidth={2.2} />
            Document Converter
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            PDF to Excel
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-slate-500 dark:text-slate-400">
            Extract readable PDF text and convert it into an editable Excel spreadsheet.
          </p>
        </div>

        {/* MAIN CARD */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-950/30 sm:p-8">
          {/* UPLOAD */}

          {!file ? (
            <label
              htmlFor="pdf-to-excel-upload"
              className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center transition hover:border-blue-500 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-blue-500 dark:hover:bg-blue-950/20"
            >
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-950/40">
                <FileText
                  size={34}
                  strokeWidth={2}
                  className="text-red-500 dark:text-red-400"
                />
              </div>

              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Upload your PDF
              </h2>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Select a PDF containing readable text or tables
              </p>

              <span className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
                <Upload size={17} />
                Choose PDF
              </span>

              <input
                id="pdf-to-excel-upload"
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          ) : (
            <>
              {/* FILE INFO */}

              <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-950/40">
                    <FileText
                      size={25}
                      className="text-red-500 dark:text-red-400"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-800 dark:text-white">
                      {file.name}
                    </p>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemove}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                >
                  <X size={16} />
                  Remove
                </button>
              </div>

              {/* CONVERT / DOWNLOAD */}

              {!convertedFile ? (
                <button
                  type="button"
                  onClick={handleConvert}
                  disabled={isConverting}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isConverting ? (
                    <>
                      <svg
                        className="h-5 w-5 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="9"
                          stroke="currentColor"
                          strokeWidth="3"
                          className="opacity-30"
                        />

                        <path
                          d="M21 12a9 9 0 0 0-9-9"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </svg>

                      Converting PDF...
                    </>
                  ) : (
                    <>
                      Convert to Excel
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              ) : (
                /* DOWNLOAD */

                <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-5 dark:border-green-900/60 dark:bg-green-950/20">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-white dark:bg-green-500">
                      <CheckCircle2 size={21} />
                    </div>

                    <div>
                      <h2 className="font-semibold text-green-800 dark:text-green-400">
                        Conversion complete
                      </h2>

                      <p className="text-sm text-green-700 dark:text-green-500">
                        Your Excel file is ready.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Output file
                    </p>

                    <p className="mt-1 truncate text-sm font-semibold text-slate-800 dark:text-white">
                      {convertedFile.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {formatFileSize(convertedFile.size)}
                    </p>
                  </div>

                  <a
                    href={convertedFile.url}
                    download={convertedFile.name}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3.5 font-semibold text-white transition hover:bg-green-700"
                  >
                    <Download size={19} />
                    Download Excel
                  </a>
                </div>
              )}
            </>
          )}

          {/* ERROR */}

          {error && (
            <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/60 dark:bg-red-950/20 dark:text-red-400">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div className="mt-5 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600 dark:border-green-900/60 dark:bg-green-950/20 dark:text-green-400">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
              <span>{success}</span>
            </div>
          )}
        </div>

        {/* FEATURES */}

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-950/40">
              <FileSpreadsheet
                size={21}
                className="text-green-600 dark:text-green-400"
              />
            </div>

            <h3 className="font-semibold text-slate-900 dark:text-white">
              Excel output
            </h3>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Creates an editable XLSX spreadsheet.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/40">
              <Lock
                size={21}
                className="text-emerald-600 dark:text-emerald-400"
              />
            </div>

            <h3 className="font-semibold text-slate-900 dark:text-white">
              Private
            </h3>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Processing happens directly in your browser.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/40">
              <Zap
                size={21}
                className="text-amber-500 dark:text-amber-400"
              />
            </div>

            <h3 className="font-semibold text-slate-900 dark:text-white">
              Fast
            </h3>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              No server upload is required.
            </p>
          </div>
        </div>

        {/* NOTE */}

        <div className="mt-8 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-100 p-5 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          <AlertCircle
            size={19}
            className="mt-0.5 shrink-0 text-blue-500 dark:text-blue-400"
          />

          <p>
            <strong className="text-slate-700 dark:text-slate-200">
              Note:
            </strong>{" "}
            This browser-based version works best with PDFs containing selectable text and simple tables. Scanned or image-only PDFs will require OCR for accurate Excel conversion.
          </p>
        </div>
      </div>
    </main>
  );
}

export default PdfToExcel;