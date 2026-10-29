import { useRef, useState } from "react";
import {
  Upload,
  FileSpreadsheet,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  CloudUpload,
  ShieldCheck,
} from "lucide-react";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ACCEPTED_EXTENSIONS = [".csv"];

export default function StatementUpload({
  onFileSelect,
  onUpload,
  loading = false,
  acceptedFormats = ".csv",
  maxSizeMB = 10,
  title = "Upload Bank Statement",
  description = "Upload your bank statement to preview and import transactions.",
}) {
  const inputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const maxAllowedSize = Math.min(maxSizeMB * 1024 * 1024, MAX_FILE_SIZE);

  const validateFile = (file) => {
    if (!file) return "Please select a file.";

    const extension = `.${file.name.split(".").pop().toLowerCase()}`;

    if (!ACCEPTED_EXTENSIONS.includes(extension)) {
      return "Please upload a CSV (.csv) file.";
    }

    if (file.size === 0) {
      return "The selected file is empty.";
    }

    if (file.size > maxAllowedSize) {
      return `File size must be less than ${Math.floor(
        maxAllowedSize / (1024 * 1024)
      )} MB.`;
    }

    return "";
  };

  const handleFile = (file) => {
    setError("");
    setSuccessMessage("");

    const validationError = validateFile(file);

    if (validationError) {
      setSelectedFile(null);
      setError(validationError);
      onFileSelect?.(null);
      return;
    }

    setSelectedFile(file);
    onFileSelect?.(file);
  };

  const handleInputChange = (event) => {
    const file = event.target.files?.[0];

    if (file) handleFile(file);

    // Allows selecting the same file again.
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);

    const file = event.dataTransfer.files?.[0];

    if (file) handleFile(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setError("");
    setSuccessMessage("");
    onFileSelect?.(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a CSV file first.");
      return;
    }

    setError("");
    setSuccessMessage("");

    if (!onUpload) {
      setError("Upload handler is not configured.");
      return;
    }

    try {
      await onUpload(selectedFile);
      setSuccessMessage("File submitted successfully.");
    } catch (uploadError) {
      setError(
        uploadError?.message ||
          "Unable to process the file. Please try again."
      );
    }
  };

  const formatFileSize = (size) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;

    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-start gap-3 border-b border-slate-100 p-5 sm:p-6">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <FileSpreadsheet size={24} />
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        {/* Dropzone */}
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setDragging(false);
          }}
          onDrop={handleDrop}
          className={`rounded-2xl border-2 border-dashed p-6 text-center transition sm:p-10 ${
            dragging
              ? "border-blue-500 bg-blue-50"
              : "border-slate-200 bg-slate-50/70 hover:border-blue-300 hover:bg-blue-50/40"
          }`}
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-sm ring-1 ring-slate-100">
            <CloudUpload size={30} />
          </div>

          <h3 className="mt-4 text-base font-bold text-slate-900">
            Drag and drop your statement
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            or browse files from your computer
          </p>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Upload size={17} />
            Choose CSV File
          </button>

          <input
            ref={inputRef}
            type="file"
            accept={acceptedFormats}
            onChange={handleInputChange}
            className="hidden"
            aria-label="Choose bank statement file"
          />

          <p className="mt-4 text-xs text-slate-400">
            CSV format · Maximum {Math.floor(maxAllowedSize / (1024 * 1024))} MB
          </p>
        </div>

        {/* Selected file */}
        {selectedFile && (
          <div className="flex flex-col gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4 sm:flex-row sm:items-center">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
              <FileText size={22} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800">
                {selectedFile.name}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {formatFileSize(selectedFile.size)} · CSV file
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                <CheckCircle2 size={15} />
                Valid file
              </span>

              <button
                type="button"
                onClick={removeFile}
                disabled={loading}
                aria-label="Remove selected file"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white hover:text-rose-600 disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-700"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Success */}
        {successMessage && (
          <div
            role="status"
            className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm text-emerald-700"
          >
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            <p>{successMessage}</p>
          </div>
        )}

        {/* Privacy note */}
        <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
          <ShieldCheck
            size={20}
            className="mt-0.5 shrink-0 text-slate-600"
          />

          <div>
            <p className="text-sm font-semibold text-slate-800">
              Keep your financial data safe
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Remove unnecessary personal details before uploading. Never
              include your bank PIN, password or OTP in the statement file.
            </p>
          </div>
        </div>

        {/* Action */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={removeFile}
            disabled={!selectedFile || loading}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Clear File
          </button>

          <button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Processing...
              </>
            ) : (
              <>
                <Upload size={17} />
                Upload Statement
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}