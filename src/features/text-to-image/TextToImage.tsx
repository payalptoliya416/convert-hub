import { Check, Download, Sparkles } from "lucide-react";
import React, { useRef, useState } from "react";

const HORDE_BASE = "https://stablehorde.net/api/v2";
const ANON_KEY = "0000000000";

export default function TextToImage() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [error, setError] = useState("");
  const [downloadState, setDownloadState] = useState<"idle" | "downloading" | "downloaded">("idle");

  const cancelRef = useRef(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setError("");
    setImageUrl("");
    setLoading(true);
    setStatusMsg("");
    cancelRef.current = false;

    try {
      setStatusMsg("Submitting request...");

      const submitRes = await fetch(`${HORDE_BASE}/generate/async`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: ANON_KEY,
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          params: {
            width: 512,
            height: 512,
            steps: 25,
            n: 1,
          },
          r2: true,
        }),
      });

      if (!submitRes.ok) {
        const data = await submitRes.json().catch(() => ({}));
        throw new Error(data?.message || `Request failed (${submitRes.status})`);
      }

      const submitData = await submitRes.json();
      const requestId = submitData.id;

      if (!requestId) {
        throw new Error("No generation request ID returned");
      }

      const maxAttempts = 60;

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        if (cancelRef.current) return;

        await sleep(3000);

        const checkRes = await fetch(`${HORDE_BASE}/generate/check/${requestId}`);

        if (!checkRes.ok) {
          throw new Error(`Status check failed (${checkRes.status})`);
        }

        const checkData = await checkRes.json();

        if (checkData.faulted) {
          throw new Error("Image generation failed on the server. Please try again.");
        }

        if (checkData.done) {
          setStatusMsg("Finalizing image...");

          const statusRes = await fetch(`${HORDE_BASE}/generate/status/${requestId}`);

          if (!statusRes.ok) {
            throw new Error(`Fetching generated image failed (${statusRes.status})`);
          }

          const statusData = await statusRes.json();
          const image = statusData?.generations?.[0]?.img;

          if (!image) {
            throw new Error("No image was returned.");
          }

          setImageUrl(image);
          setLoading(false);
          setStatusMsg("");
          return;
        }

        const queuePosition = checkData.queue_position ?? "?";
        const waitTime = checkData.wait_time ?? "?";
        setStatusMsg(`Generating... Queue: ${queuePosition} • About ${waitTime}s`);
      }

      throw new Error("Generation timed out. Please try again.");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to generate image. Please try again.";
      setError(message);
      setLoading(false);
      setStatusMsg("");
    }
  };

  const downloadImage = () => {
    if (!imageUrl || downloadState === "downloading") return;

    setError("");
    setDownloadState("downloading");

    try {
      const imgEl = imgRef.current;

      if (imgEl && imgEl.complete && imgEl.naturalWidth > 0) {
        const canvas = document.createElement("canvas");
        canvas.width = imgEl.naturalWidth;
        canvas.height = imgEl.naturalHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas not supported");

        ctx.drawImage(imgEl, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              window.open(imageUrl, "_blank");
              setDownloadState("downloaded");
              setTimeout(() => setDownloadState("idle"), 2500);
              return;
            }

            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = "generated-image.png";
            link.style.display = "none";
            document.body.appendChild(link);
            link.click();

            setTimeout(() => {
              document.body.removeChild(link);
              URL.revokeObjectURL(blobUrl);
            }, 1000);

            setDownloadState("downloaded");
            setTimeout(() => setDownloadState("idle"), 2500);
          },
          "image/png",
        );
      } else {
        window.open(imageUrl, "_blank");
        setDownloadState("downloaded");
        setTimeout(() => setDownloadState("idle"), 2500);
      }
    } catch (err) {
      console.error("Image download error:", err);
      window.open(imageUrl, "_blank");
      setDownloadState("downloaded");
      setTimeout(() => setDownloadState("idle"), 2500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) {
      generateImage();
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div
        className="flex items-center gap-4 border-b pb-6"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-3 text-violet-500">
          <Sparkles className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--text-heading)" }}>
            Text to Image
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            Turn your text description into a beautiful AI-generated image.
          </p>
        </div>
      </div>

      {/* Main Card */}
      <div
        className="rounded-2xl border p-4 shadow-2xl sm:p-6 mt-8"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border)",
        }}
      >
        {/* Prompt */}
        <div>
          <label
            className="mb-2 block text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Describe your image
          </label>

          <input
            type="text"
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              setError("");
            }}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder="A futuristic city at sunset with flying cars..."
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              backgroundColor: "var(--bg-input)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
          />
        </div>

        {/* Generate Button */}
        <button
          type="button"
          onClick={generateImage}
          disabled={loading}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:from-violet-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Generating...
            </>
          ) : (
            <>Generate Image</>
          )}
        </button>

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {/* Loading Status */}
        {loading && (
          <div
            className="mt-4 rounded-xl border border-violet-500/20 bg-violet-500/5 px-4 py-3 text-center"
          >
            <p className="text-sm text-violet-500">
              {statusMsg || "Generating your image..."}
            </p>
            <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
              This may take some time
            </p>
          </div>
        )}

        {/* Generated Image */}
        {imageUrl && !loading && (
          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Generated Image
              </h2>
              <span className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-500">
                Generated
              </span>
            </div>

            <div
              className="overflow-hidden rounded-xl border"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--bg-input)",
              }}
            >
              <img
                ref={imgRef}
                src={imageUrl}
                alt={prompt}
                crossOrigin="anonymous"
                className="block h-auto w-full object-contain"
              />
            </div>

            <button
              type="button"
              onClick={downloadImage}
              disabled={downloadState === "downloading"}
              className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition-all duration-300 cursor-pointer
                ${downloadState === "downloaded"
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-500"
                  : downloadState === "downloading"
                  ? "border-violet-500/40 bg-violet-500/10 text-violet-500 cursor-not-allowed"
                  : ""
                }`}
              style={
                downloadState === "idle"
                  ? {
                      borderColor: "var(--border)",
                      backgroundColor: "var(--bg-hover)",
                      color: "var(--text-primary)",
                    }
                  : undefined
              }
            >
              {downloadState === "downloading" ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-400/30 border-t-violet-400" />
                  Downloading...
                </>
              ) : downloadState === "downloaded" ? (
                <>
                  <Check className="h-4 w-4 animate-bounce" />
                  Downloaded!
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download Image
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
