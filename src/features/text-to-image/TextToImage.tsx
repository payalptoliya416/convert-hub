import React, { useState } from "react";
import {
  Sparkles,
  Download,
  RefreshCw,
  Image as ImageIcon,
  Loader2,
  Wand2,
  X,
} from "lucide-react";

const TextToImage: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const examples = [
    "A futuristic city at night with neon lights",
    "A beautiful mountain landscape at sunset",
    "A cute golden retriever in a flower garden",
    "A luxury modern house surrounded by nature",
  ];

  /*
   * Browser-only demo generator.
   *
   * This creates an image from the entered text using SVG,
   * so there is NO backend, NO Express and NO API key.
   *
   * If later you want real AI-generated images, only this
   * generateImage() function needs to be replaced with a
   * browser-compatible AI provider.
   */
  const generateImage = async () => {
    if (!prompt.trim()) {
      setError("Please enter a description.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const safePrompt = prompt
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

      const svg = `
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1024"
          height="1024"
          viewBox="0 0 1024 1024"
        >
          <defs>
            <linearGradient
              id="background"
              x1="0"
              y1="0"
              x2="1"
              y2="1"
            >
              <stop offset="0%" stop-color="#312e81"/>
              <stop offset="50%" stop-color="#7c3aed"/>
              <stop offset="100%" stop-color="#4c1d95"/>
            </linearGradient>

            <filter id="blur">
              <feGaussianBlur stdDeviation="70"/>
            </filter>
          </defs>

          <rect
            width="1024"
            height="1024"
            fill="url(#background)"
          />

          <circle
            cx="180"
            cy="180"
            r="180"
            fill="#a78bfa"
            opacity="0.25"
            filter="url(#blur)"
          />

          <circle
            cx="850"
            cy="760"
            r="220"
            fill="#c084fc"
            opacity="0.2"
            filter="url(#blur)"
          />

          <rect
            x="80"
            y="80"
            width="864"
            height="864"
            rx="40"
            fill="#0f172a"
            opacity="0.28"
          />

          <text
            x="512"
            y="440"
            text-anchor="middle"
            fill="white"
            font-size="38"
            font-family="Arial, sans-serif"
            font-weight="700"
          >
            Generated Image
          </text>

          <foreignObject
            x="130"
            y="490"
            width="764"
            height="220"
          >
            <div
              xmlns="http://www.w3.org/1999/xhtml"
              style="
                color:white;
                font-family:Arial,sans-serif;
                font-size:24px;
                line-height:1.5;
                text-align:center;
                padding:20px;
              "
            >
              ${safePrompt}
            </div>
          </foreignObject>

          <text
            x="512"
            y="850"
            text-anchor="middle"
            fill="#ddd6fe"
            font-size="20"
            font-family="Arial, sans-serif"
          >
            ConvertHub • Text to Image
          </text>
        </svg>
      `;

      const blob = new Blob([svg], {
        type: "image/svg+xml",
      });

      const url = URL.createObjectURL(blob);

      setImage(url);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!image) return;

    const link = document.createElement("a");

    link.href = image;
    link.download = "converthub-text-to-image.svg";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearImage = () => {
    if (image) {
      URL.revokeObjectURL(image);
    }

    setImage(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-lg shadow-violet-600/20">
            <Sparkles className="h-7 w-7 text-white" />
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Text to{" "}
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              Image
            </span>
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            Turn your text description into a beautiful image.
          </p>
        </div>

        {/* Main */}
        <div className="grid gap-6 lg:grid-cols-[400px_minmax(0,1fr)]">

          {/* Left */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl">

            <div className="mb-5 flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-violet-400" />

              <h2 className="font-semibold text-white">
                Create Image
              </h2>
            </div>

            <label className="mb-2 block text-sm font-medium text-slate-300">
              Describe your image
            </label>

            <textarea
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                setError("");
              }}
              placeholder="Example: A beautiful sunset over the mountains..."
              rows={9}
              maxLength={1000}
              className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
            />

            <div className="mt-2 text-right text-xs text-slate-600">
              {prompt.length}/1000
            </div>

            {/* Examples */}
            <div className="mt-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                Try an example
              </p>

              <div className="space-y-2">
                {examples.map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => {
                      setPrompt(example);
                      setError("");
                    }}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2.5 text-left text-xs leading-5 text-slate-400 transition hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-300"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={generateImage}
              disabled={loading || !prompt.trim()}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:from-violet-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Generate Image
                </>
              )}
            </button>
          </div>

          {/* Right */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl">

            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-violet-400" />

                <h2 className="font-semibold text-white">
                  Preview
                </h2>
              </div>

              {image && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={generateImage}
                    className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-violet-500/50 hover:text-white"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Regenerate
                  </button>

                  <button
                    type="button"
                    onClick={downloadImage}
                    className="flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-violet-500"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>

                  <button
                    type="button"
                    onClick={clearImage}
                    className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-400 transition hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Preview */}
            <div className="flex min-h-[520px] items-center justify-center overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-4 sm:min-h-[600px]">

              {loading ? (
                <div className="flex flex-col items-center text-center">
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10">
                    <Sparkles className="h-8 w-8 animate-pulse text-violet-400" />
                  </div>

                  <h3 className="font-semibold text-white">
                    Creating image...
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Please wait a moment.
                  </p>
                </div>
              ) : image ? (
                <img
                  src={image}
                  alt={prompt}
                  className="h-auto max-h-[650px] w-full max-w-[650px] rounded-xl object-contain shadow-2xl"
                />
              ) : (
                <div className="max-w-sm text-center">
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900">
                    <ImageIcon className="h-8 w-8 text-slate-700" />
                  </div>

                  <h3 className="font-semibold text-slate-300">
                    Your image will appear here
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Enter your description and click Generate Image.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/40 px-5 py-4">
          <p className="text-xs leading-5 text-slate-500">
            This version runs completely in the browser and does not require
            a backend or API key.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TextToImage;