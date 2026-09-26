import React, { useCallback, useEffect, useState } from "react";
import { removeBackground } from "@imgly/background-removal";
import {
  Upload,
  Image as ImageIcon,
  Download,
  RotateCcw,
  Loader2,
  CheckCircle2,
  X,
} from "lucide-react";

const ImageBackgroundRemover: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string>("");
  const [resultUrl, setResultUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [originalUrl, resultUrl]);

  const handleFile = useCallback((selectedFile: File) => {
    setError("");
    setResultUrl("");

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (selectedFile.size > 15 * 1024 * 1024) {
      setError("Image size must be less than 15MB.");
      return;
    }

    setFile(selectedFile);
    setOriginalUrl(URL.createObjectURL(selectedFile));
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const droppedFile = event.dataTransfer.files?.[0];

    if (droppedFile) {
      handleFile(droppedFile);
    }
  };

  const removeBg = async () => {
    if (!file) return;

    try {
      setIsProcessing(true);
      setError("");
      setResultUrl("");

      const blob = await removeBackground(file);

      const url = URL.createObjectURL(blob);

      setResultUrl(url);
    } catch (err) {
      console.error(err);
      setError(
        "Something went wrong while removing the background. Please try again.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!resultUrl) return;

    const link = document.createElement("a");

    link.href = resultUrl;
    link.download = "background-removed.png";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reset = () => {
    setFile(null);
    setOriginalUrl("");
    setResultUrl("");
    setError("");
    setIsProcessing(false);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 mb-7">
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-[var(--border)] pb-6">
          <div className="p-3 rounded-xl border text-[#8B5CF6]"
        style={{ backgroundColor: "rgba(139, 92, 246, 0.10)", borderColor: "var(--border)" }}>
            <ImageIcon className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-[var(--text-heading)]">
              AI Background Remover
            </h1>

            <p className="text-[var(--text-secondary)] text-sm mt-1">
              Remove backgrounds from your images instantly and download
              transparent PNG images directly in your browser.
            </p>
          </div>
        </div>

        {/* Upload */}
        {!file && (
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`relative mx-auto rounded-2xl border-2 border-dashed p-10 text-center transition sm:p-16 mt-8 ${
              isDragging
                ? "border-violet-500 bg-violet-500/10"
                : "border-[var(--border-hover)] bg-[var(--bg-surface-60)] hover:border-violet-500/60"
            }`}
          >
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleInputChange}
              className="hidden"
              id="image-upload"
            />

            <label
              htmlFor="image-upload"
              className="flex cursor-pointer flex-col items-center"
            >
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/10 text-violet-400">
                <Upload className="h-7 w-7" />
              </div>

              <h2 className="text-lg font-semibold text-[var(--text-heading)]">
                Drop your image here
              </h2>

              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                or click to browse from your computer
              </p>

              <span className="mt-5 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold transition hover:bg-violet-500 text-white">
                Choose Image
              </span>

              <p className="mt-4 text-xs text-[var(--text-muted)]">
                Supports JPG, PNG and WebP · Max 15MB
              </p>
            </label>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mx-auto mt-5 flex max-w-3xl items-center justify-between rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <span>{error}</span>

            <button onClick={() => setError("")}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Image Workspace */}
        {file && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface-60)] p-4 sm:p-6 mt-8">
            {/* Top bar */}
            <div className="mb-6 flex flex-col gap-4 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--text-heading)]">{file.name}</p>

                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>

              <button
                onClick={reset}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border-hover)] px-4 py-2 text-sm text-[var(--text-secondary)] transition hover:border-red-500/50 hover:text-red-400 cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
                Choose Another
              </button>
            </div>

            {/* Images */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Original */}
              <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-base)]">
                <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    Original Image
                  </span>

                  <span className="rounded-md bg-[var(--bg-hover)] px-2 py-1 text-xs text-[var(--text-secondary)]">
                    Before
                  </span>
                </div>

                <div className="flex min-h-[320px] items-center justify-center p-4">
                  <img
                    src={originalUrl}
                    alt="Original"
                    className="max-h-[500px] max-w-full rounded-lg object-contain"
                  />
                </div>
              </div>

              {/* Result */}
              <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-base)]">
                <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    Background Removed
                  </span>

                  {resultUrl && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-1 text-xs text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Done
                    </span>
                  )}
                </div>

                <div
                  className="relative flex min-h-[320px] items-center justify-center p-4"
                  style={{
                    backgroundImage:
                      "linear-gradient(45deg, #1e293b 25%, transparent 25%), linear-gradient(-45deg, #1e293b 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1e293b 75%), linear-gradient(-45deg, transparent 75%, #1e293b 75%)",
                    backgroundSize: "24px 24px",
                    backgroundPosition: "0 0, 0 12px, 12px -12px, -12px 0px",
                  }}
                >
                  {resultUrl ? (
                    <img
                      src={resultUrl}
                      alt="Background removed"
                      className="max-h-[500px] max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--bg-hover)]">
                        <ImageIcon className="h-6 w-6 text-[var(--text-muted)]" />
                      </div>

                      <p className="text-sm font-medium text-[var(--text-secondary)]">
                        Your result will appear here
                      </p>

                      <p className="mt-1 text-xs text-[var(--text-muted)]">
                        Transparent background PNG
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              {!resultUrl ? (
                <button
                  onClick={removeBg}
                  disabled={isProcessing}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:from-violet-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Removing Background...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-5 w-5" />
                      Remove Background
                    </>
                  )}
                </button>
              ) : (
                <>
                  <button
                    onClick={downloadImage}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:from-violet-500 hover:to-indigo-500"
                  >
                    <Download className="h-5 w-5" />
                    Download PNG
                  </button>

                  <button
                    onClick={removeBg}
                    disabled={isProcessing}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border-hover)] px-7 py-3.5 text-sm font-semibold text-[var(--text-secondary)] transition hover:border-violet-500 hover:text-violet-400"
                  >
                    <RotateCcw className="h-5 w-5" />
                    Process Again
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
  );
};

export default ImageBackgroundRemover;
