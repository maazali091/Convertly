import React, { useState } from "react";
import { PDFDocument, degrees } from "pdf-lib";
import {
    RotateCw,
    Rotate3D,
    FileText,
    Trash2,
    Download,
    CheckCircle,
    Lock,
    Zap,
    AlertCircle,
    Loader2,
    ArrowRight,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import LimitReached from "../components/LimitReached";

function RotatePdf() {
    const [file, setFile] = useState(null);
    const [rotation, setRotation] = useState(90);
    const [isRotating, setIsRotating] = useState(false);
    const [rotatedFile, setRotatedFile] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // ─────────────────────────────────────────────
    // Format file size
    // ─────────────────────────────────────────────

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;

        if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(1)} KB`;
        }

        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    // ─────────────────────────────────────────────
    // Handle PDF selection
    // ─────────────────────────────────────────────

    const handleFileChange = (event) => {
        const selectedFile = event.target.files?.[0];

        if (!selectedFile) return;

        setError("");
        setSuccess("");
        setRotatedFile(null);

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

        // Allow selecting the same file again later
        event.target.value = "";
    };

    // ─────────────────────────────────────────────
    // Remove PDF
    // ─────────────────────────────────────────────

    const handleRemove = () => {
        if (rotatedFile?.url) {
            URL.revokeObjectURL(rotatedFile.url);
        }

        setFile(null);
        setRotatedFile(null);
        setError("");
        setSuccess("");
    };

    // ─────────────────────────────────────────────
    // Check conversion usage
    // Same system as JPG → PDF
    // ─────────────────────────────────────────────

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

    // ─────────────────────────────────────────────
    // Consume conversion
    // Database RPC
    // ─────────────────────────────────────────────

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

    // ─────────────────────────────────────────────
    // Rotate PDF
    // ─────────────────────────────────────────────

    const handleRotate = async () => {
        if (!file) {
            setError("Please upload a PDF file first.");
            return;
        }

        setIsRotating(true);
        setError("");
        setSuccess("");

        if (rotatedFile?.url) {
            URL.revokeObjectURL(rotatedFile.url);
        }

        setRotatedFile(null);

        try {
            // ─────────────────────────────────────
            // 1. Check login + daily limit
            // ─────────────────────────────────────

            await checkConversionLimit();

            // ─────────────────────────────────────
            // 2. Read PDF
            // ─────────────────────────────────────

            const arrayBuffer = await file.arrayBuffer();

            const pdfDoc = await PDFDocument.load(arrayBuffer);

            const pages = pdfDoc.getPages();

            // ─────────────────────────────────────
            // 3. Rotate every page
            // ─────────────────────────────────────

            pages.forEach((page) => {
                const currentRotation =
                    page.getRotation().angle;

                const newRotation =
                    currentRotation + Number(rotation);

                page.setRotation(
                    degrees(newRotation)
                );
            });

            // ─────────────────────────────────────
            // 4. Generate rotated PDF
            // ─────────────────────────────────────

            const pdfBytes = await pdfDoc.save();

            const blob = new Blob([pdfBytes], {
                type: "application/pdf",
            });

            // ─────────────────────────────────────
            // 5. Consume conversion in database
            // ─────────────────────────────────────

            await consumeConversion();

            // ─────────────────────────────────────
            // 6. Create browser download URL
            // ─────────────────────────────────────

            const url = URL.createObjectURL(blob);

            const outputName =
                file.name.replace(/\.pdf$/i, "") +
                `-rotated-${rotation}.pdf`;

            setRotatedFile({
                url,
                name: outputName,
                size: blob.size,
            });

            // ─────────────────────────────────────
            // 7. Success
            // ─────────────────────────────────────

            setSuccess(
                `All ${pages.length} page${pages.length === 1 ? "" : "s"
                } rotated ${rotation}° successfully.`
            );
        } catch (err) {
            console.error("PDF rotation error:", err);

            setError(
                err?.message ||
                "PDF rotation failed. Please try another PDF file."
            );
        } finally {
            setIsRotating(false);
        }
    };

    return (
        <main className="min-h-screen bg-white px-4 py-16 text-slate-900 dark:bg-slate-950 dark:text-white">
            <div className="mx-auto max-w-3xl">

                {/* ───────────────── HEADER ───────────────── */}

                <div className="mb-10 text-center">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                        <RotateCw size={16} />
                        PDF Tools
                    </div>

                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                        Rotate PDF
                    </h1>

                    <p className="mx-auto mt-4 max-w-xl text-slate-500 dark:text-slate-400">
                        Rotate every page of your PDF by 90°, 180°, or
                        270° directly in your browser.
                    </p>
                </div>

                {/* ───────────────── MAIN CARD ───────────────── */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">

                    {/* ───────────────── UPLOAD ───────────────── */}

                    {!file ? (
                        <label
                            htmlFor="rotate-pdf-upload"
                            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center transition hover:border-blue-500 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-blue-500 dark:hover:bg-blue-500/5"
                        >
                            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                                <Rotate3D
                                    size={32}
                                    strokeWidth={2}
                                />
                            </div>

                            <h2 className="text-lg font-semibold">
                                Upload your PDF
                            </h2>

                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                Select a PDF file to rotate
                            </p>

                            <span className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
                                <FileText size={18} />
                                Choose PDF
                            </span>

                            <input
                                id="rotate-pdf-upload"
                                type="file"
                                accept=".pdf,application/pdf"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>
                    ) : (
                        <>
                            {/* ───────────────── FILE INFO ───────────────── */}

                            <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                                <div className="flex min-w-0 items-center gap-4">

                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                                        <FileText size={24} />
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
                                    className="inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/10"
                                >
                                    <Trash2 size={16} />
                                    Remove
                                </button>
                            </div>

                            {/* ───────────────── ROTATION ───────────────── */}

                            {!rotatedFile && (
                                <div className="mt-6">

                                    <h2 className="font-semibold text-slate-900 dark:text-white">
                                        Rotation
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                        Choose how much you want to rotate
                                        each page.
                                    </p>

                                    <div className="mt-4 grid grid-cols-3 gap-3">

                                        {/* 90° */}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setRotation(90)
                                            }
                                            className={`rounded-xl border-2 p-4 text-center transition ${rotation === 90
                                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
                                                    : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
                                                }`}
                                        >
                                            <RotateCw
                                                size={27}
                                                className={`mx-auto mb-2 ${rotation === 90
                                                        ? "text-blue-600 dark:text-blue-400"
                                                        : "text-slate-500 dark:text-slate-400"
                                                    }`}
                                            />

                                            <p className="font-semibold">
                                                90°
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                Clockwise
                                            </p>
                                        </button>

                                        {/* 180° */}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setRotation(180)
                                            }
                                            className={`rounded-xl border-2 p-4 text-center transition ${rotation === 180
                                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
                                                    : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
                                                }`}
                                        >
                                            <RotateCw
                                                size={27}
                                                className={`mx-auto mb-2 ${rotation === 180
                                                        ? "text-blue-600 dark:text-blue-400"
                                                        : "text-slate-500 dark:text-slate-400"
                                                    }`}
                                            />

                                            <p className="font-semibold">
                                                180°
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                Upside down
                                            </p>
                                        </button>

                                        {/* 270° */}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setRotation(270)
                                            }
                                            className={`rounded-xl border-2 p-4 text-center transition ${rotation === 270
                                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
                                                    : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
                                                }`}
                                        >
                                            <RotateCw
                                                size={27}
                                                className={`mx-auto mb-2 ${rotation === 270
                                                        ? "text-blue-600 dark:text-blue-400"
                                                        : "text-slate-500 dark:text-slate-400"
                                                    }`}
                                            />

                                            <p className="font-semibold">
                                                270°
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                Counter-clockwise
                                            </p>
                                        </button>
                                    </div>

                                    {/* ───────────────── ROTATE BUTTON ───────────────── */}

                                    <button
                                        type="button"
                                        onClick={handleRotate}
                                        disabled={isRotating}
                                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {isRotating ? (
                                            <>
                                                <Loader2
                                                    size={19}
                                                    className="animate-spin"
                                                />
                                                Rotating PDF...
                                            </>
                                        ) : (
                                            <>
                                                <RotateCw size={19} />
                                                Rotate PDF {rotation}°
                                                <ArrowRight size={18} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                            {/* ───────────────── RESULT ───────────────── */}

                            {rotatedFile && (
                                <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-5 dark:border-green-500/20 dark:bg-green-500/10">

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-white">
                                            <CheckCircle size={22} />
                                        </div>

                                        <div>
                                            <h2 className="font-semibold text-green-800 dark:text-green-400">
                                                Rotation complete
                                            </h2>

                                            <p className="text-sm text-green-700 dark:text-green-500">
                                                Your rotated PDF is ready.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 rounded-lg bg-white p-3 dark:bg-slate-900">

                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Output file
                                        </p>

                                        <p className="mt-1 truncate text-sm font-semibold text-slate-800 dark:text-white">
                                            {rotatedFile.name}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                            {formatFileSize(
                                                rotatedFile.size
                                            )}
                                        </p>
                                    </div>

                                    <a
                                        href={rotatedFile.url}
                                        download={rotatedFile.name}
                                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3.5 font-semibold text-white transition hover:bg-green-700"
                                    >
                                        <Download size={19} />
                                        Download Rotated PDF
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
                        <div className="mt-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-400">

                            <CheckCircle
                                size={19}
                                className="mt-0.5 shrink-0"
                            />

                            <span>{success}</span>
                        </div>
                    )}
                </div>

                {/* ───────────────── FEATURES ───────────────── */}

                <div className="mt-8 grid gap-4 sm:grid-cols-3">

                    {/* Easy rotation */}

                    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">

                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                            <RotateCw size={21} />
                        </div>

                        <h3 className="font-semibold">
                            Easy rotation
                        </h3>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Rotate all pages with one click.
                        </p>
                    </div>

                    {/* Private */}

                    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">

                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                            <Lock size={21} />
                        </div>

                        <h3 className="font-semibold">
                            Private
                        </h3>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Your PDF stays on your device.
                        </p>
                    </div>

                    {/* Fast */}

                    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">

                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                            <Zap size={21} />
                        </div>

                        <h3 className="font-semibold">
                            Fast
                        </h3>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Rotation happens directly in your browser.
                        </p>
                    </div>
                </div>

                {/* ───────────────── NOTE ───────────────── */}

                <div className="mt-8 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">

                    <AlertCircle
                        size={19}
                        className="mt-0.5 shrink-0 text-blue-500"
                    />

                    <p>
                        <strong className="text-slate-700 dark:text-slate-200">
                            Note:
                        </strong>{" "}
                        This tool rotates every page of the PDF by the
                        selected amount. Your original PDF remains
                        unchanged, and processing happens directly in
                        your browser.
                    </p>
                </div>
            </div>
        </main>
    );
}

export default RotatePdf;