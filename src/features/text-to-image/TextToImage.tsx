import React, { useState, useCallback } from "react";
import {
  Sparkles,
  Download,
  RefreshCw,
  Image as ImageIcon,
  Loader2,
  Wand2,
  X,
  Settings2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";
type Style = "none" | "photorealistic" | "anime" | "digital-art" | "oil-painting" | "watercolor" | "sketch" | "3d-render";

interface Dimensions {
  width: number;
  height: number;
}

const ASPECT_RATIOS: Record<AspectRatio, Dimensions> = {
  "1:1":  { width: 1024, height: 1024 },
  "16:9": { width: 1280, height: 720  },
  "9:16": { width: 720,  height: 1280 },
  "4:3":  { width: 1024, height: 768  },
  "3:4":  { width: 768,  height: 1024 },
};  

const STYLE_SUFFIXES: Record<Style, string> = {
  "none":           "",
  "photorealistic": ", photorealistic, DSLR quality, 8k, sharp focus",
  "anime":          ", anime style, vibrant colors, Studio Ghibli",
  "digital-art":    ", digital art, concept art, highly detailed",
  "oil-painting":   ", oil painting, classical art, canvas texture",
  "watercolor":     ", watercolor painting, soft edges, pastel tones",
  "sketch":         ", pencil sketch, detailed linework, monochrome",
  "3d-render":      ", 3D render, octane render, studio lighting",
};

const TextToImage: React.FC = () => {
  const [prompt, setPrompt]           = useState("");
  const [negPrompt, setNegPrompt]     = useState("");
  const [image, setImage]             = useState<string | null>(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [seed, setSeed]               = useState<number | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [style, setStyle]             = useState<Style>("none");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState("");

  const buildUrl = useCallback(
    () => {
      const { width, height } = ASPECT_RATIOS[aspectRatio];
      const fullPrompt = prompt.trim() + STYLE_SUFFIXES[style];
      const finalSeed  = Math.floor(Math.random() * 999999);
      setSeed(finalSeed);

      const params = new URLSearchParams({
        width:   String(width),
        height:  String(height),
        seed:    String(finalSeed),
        nologo:  "true",
        enhance: "false",
        cache:   "false",
      });

      if (negPrompt.trim()) {
        params.set("negative_prompt", negPrompt.trim());
      }

      return {
        url: `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?${params}`,
        fullPrompt,
      };
    },
    [prompt, negPrompt, aspectRatio, style]
  );

  const generateImage = useCallback(
    async () => {
      if (!prompt.trim()) {
        setError("Please enter a description.");
        return;
      }
      setError("");
      setLoading(true);
      setImage(null);

      const { url, fullPrompt } = buildUrl();
      setGeneratedPrompt(fullPrompt);
      // Set URL directly — browser <img> tag handles loading natively (no CORS issue)
      setImage(url);
    },
    [buildUrl, prompt]
  );

  const downloadImage = () => {
    if (!image) return;
    window.open(image, "_blank");
  };

  const clearAll = () => {
    setImage(null);
    setPrompt("");
    setNegPrompt("");
    setError("");
    setSeed(null);
    setGeneratedPrompt("");
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4">

      {/* ── Header ── */}
      <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
        <div className="p-3 bg-violet-500/10 rounded-xl border border-violet-500/20 text-violet-400">
          <Sparkles className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Text to Image</h1>
          <p className="text-slate-400 text-sm mt-1">
            Turn your words into stunning AI-generated images — free.
          </p>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">

        {/* ── Left Panel ── */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl">

            <div className="mb-4 flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-violet-400" />
              <h2 className="font-semibold text-white">Describe your image</h2>
            </div>

            {/* Prompt */}
            <textarea
              value={prompt}
              onChange={(e) => { setPrompt(e.target.value); setError(""); }}
              placeholder="e.g. A beautiful sunset over glowing mountains with purple sky..."
              rows={5}
              maxLength={500}
              className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
            />
            <div className="mt-1 text-right text-xs text-slate-600">{prompt.length}/500</div>

            {/* Style selector */}
            <div className="mt-4">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Art Style
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(Object.keys(STYLE_SUFFIXES) as Style[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStyle(s)}
                    className={`rounded-lg px-2 py-1.5 text-xs font-medium transition capitalize ${
                      style === s
                        ? "bg-violet-600 text-white border border-violet-500"
                        : "bg-slate-950 text-slate-400 border border-slate-700 hover:border-violet-500/50 hover:text-white"
                    }`}
                  >
                    {s === "none" ? "Default" : s.replace("-", " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio */}
            <div className="mt-4">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Aspect Ratio
              </label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(ASPECT_RATIOS) as AspectRatio[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setAspectRatio(r)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      aspectRatio === r
                        ? "bg-violet-600 text-white border border-violet-500"
                        : "bg-slate-950 text-slate-400 border border-slate-700 hover:border-violet-500/50 hover:text-white"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced toggle */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="mt-4 flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition cursor-pointer"
            >
              <Settings2 className="h-3.5 w-3.5" />
              Advanced Options
              {showAdvanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>

            {showAdvanced && (
              <div className="mt-3 space-y-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-400">
                    Negative Prompt
                    <span className="ml-1 text-slate-600">(what to avoid)</span>
                  </label>
                  <textarea
                    value={negPrompt}
                    onChange={(e) => setNegPrompt(e.target.value)}
                    placeholder="blurry, low quality, distorted, ugly..."
                    rows={2}
                    className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white outline-none placeholder:text-slate-600 focus:border-violet-500"
                  />
                </div>
                {seed !== null && (
                  <div className="text-xs text-slate-600">
                    Seed: <span className="text-slate-400 font-mono">{seed}</span>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Generate button */}
            <button
              onClick={() => generateImage()}
              disabled={loading || !prompt.trim()}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:from-violet-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <><Loader2 className="h-5 w-5 animate-spin" />Generating…</>
              ) : (
                <><Sparkles className="h-5 w-5" />Generate Image</>
              )}
            </button>
          </div>
        </div>

        {/* ── Right Panel (Preview) ── */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-violet-400" />
              <h2 className="font-semibold text-white">Preview</h2>
            </div>

            {image && !loading && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => generateImage()}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-violet-500/50 hover:text-white cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Regenerate
                </button>
                <button
                  onClick={downloadImage}
                  className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-violet-500 cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </button>
                <button
                  onClick={clearAll}
                  className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-400 transition hover:text-white cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Image display area */}
          <div className="flex min-h-[540px] items-center justify-center overflow-hidden rounded-xl border border-slate-800 bg-slate-950 relative">

            {/* Loading overlay */}
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center px-8 bg-slate-950 z-10 rounded-xl">
                <div className="relative">
                  <div className="h-20 w-20 rounded-full border-4 border-slate-800" />
                  <div className="absolute inset-0 h-20 w-20 animate-spin rounded-full border-4 border-transparent border-t-violet-500" />
                  <Sparkles className="absolute inset-0 m-auto h-8 w-8 animate-pulse text-violet-400" />
                </div>
                <div>
                  <p className="font-semibold text-white">Creating your image…</p>
                  <p className="mt-1 text-sm text-slate-500">This takes 5–20 seconds</p>
                </div>
              </div>
            )}

            {/* Image — onLoad/onError handles loading state */}
            {image && (
              <img
                key={image}
                src={image}
                alt={generatedPrompt}
                onLoad={() => setLoading(false)}
                onError={() => {
                  setLoading(false);
                  setError("Image generation failed. Please try again with a different prompt.");
                  setImage(null);
                }}
                className={`h-auto max-h-[700px] w-full rounded-xl object-contain transition-opacity duration-500 ${loading ? "opacity-0" : "opacity-100"}`}
              />
            )}

            {/* Empty state */}
            {!image && !loading && (
              <div className="max-w-sm text-center px-8">
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800">
                  <ImageIcon className="h-10 w-10 text-slate-700" />
                </div>
                <h3 className="font-semibold text-slate-300">Your image will appear here</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Enter a description, choose a style and click Generate Image.
                </p>
              </div>
            )}
          </div>

          {/* Prompt used */}
          {generatedPrompt && !loading && (
            <p className="mt-3 text-xs text-slate-600 leading-5">
              <span className="text-slate-500">Used prompt:</span> {generatedPrompt}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TextToImage;
