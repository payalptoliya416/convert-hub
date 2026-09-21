import { useState, useRef, useCallback } from "react";
import {
  Sparkles,
  ImageIcon,
  Download,
  Loader2,
  ChevronDown,
  Dices,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

interface StyleOption {
  label: string;
  suffix: string;
}

interface RatioOption {
  label: string;
  width: number;
  height: number;
}

const ART_STYLES: StyleOption[] = [
  { label: "Default", suffix: "" },
  { label: "Photorealistic", suffix: ", photorealistic, highly detailed, realistic lighting" },
  { label: "Anime", suffix: ", anime style, vibrant colors, studio anime artwork" },
  { label: "Digital Art", suffix: ", digital art, concept art, trending on artstation" },
  { label: "Oil Painting", suffix: ", oil painting, textured brush strokes, classical art" },
  { label: "Watercolor", suffix: ", watercolor painting, soft edges, paper texture" },
  { label: "Sketch", suffix: ", pencil sketch, hand drawn, black and white line art" },
  { label: "3D Render", suffix: ", 3d render, octane render, cinematic lighting" },
];

const ASPECT_RATIOS: RatioOption[] = [
  { label: "1:1", width: 1024, height: 1024 },
  { label: "16:9", width: 1280, height: 720 },
  { label: "9:16", width: 720, height: 1280 },
  { label: "4:3", width: 1024, height: 768 },
  { label: "3:4", width: 768, height: 1024 },
];

const MAX_CHARS = 500;

function buildImageUrl(opts: {
  prompt: string;
  style: StyleOption;
  ratio: RatioOption;
  seed: number;
  enhance: boolean;
}) {
  const fullPrompt = `${opts.prompt.trim()}${opts.style.suffix}`;
  const encoded = encodeURIComponent(fullPrompt);
  const params = new URLSearchParams({
    width: String(opts.ratio.width),
    height: String(opts.ratio.height),
    seed: String(opts.seed),
    nologo: "true",
  });
  if (opts.enhance) params.set("enhance", "true");
  return `https://image.pollinations.ai/prompt/${encoded}?${params.toString()}`;
}

export default function TextToImage() {
  const [prompt, setPrompt] = useState("");
  const [styleIndex, setStyleIndex] = useState(0);
  const [ratioIndex, setRatioIndex] = useState(0);
  const [seed, setSeed] = useState<number>(() => Math.floor(Math.random() * 1_000_000));
  const [enhance, setEnhance] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestIdRef = useRef(0);

  const randomizeSeed = () => setSeed(Math.floor(Math.random() * 1_000_000));

  const handleGenerate = useCallback(() => {
    const trimmed = prompt.trim();
    if (!trimmed) {
      setError("Please describe what you want to see first.");
      return;
    }

    setError(null);
    setIsGenerating(true);
    setImageUrl(null);

    const myRequestId = ++requestIdRef.current;
    const url = buildImageUrl({
      prompt: trimmed,
      style: ART_STYLES[styleIndex],
      ratio: ASPECT_RATIOS[ratioIndex],
      seed,
      enhance,
    });

    // Preload so we only show the image once it's actually ready,
    // and can surface a proper error state if generation fails.
    const img = new Image();
    img.onload = () => {
      if (requestIdRef.current !== myRequestId) return; // a newer request superseded this one
      setImageUrl(url);
      setIsGenerating(false);
    };
    img.onerror = () => {
      if (requestIdRef.current !== myRequestId) return;
      setError("Image generation failed. Please try again in a moment.");
      setIsGenerating(false);
    };
    img.src = url;
  }, [prompt, styleIndex, ratioIndex, seed, enhance]);

  const handleRegenerate = () => {
    randomizeSeed();
    // regenerate uses the freshly randomized seed on next tick
    setTimeout(handleGenerate, 0);
  };

  const handleDownload = async () => {
    if (!imageUrl) return;
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `text-to-image-${seed}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      setError("Couldn't download the image. Try right-click → Save image instead.");
    }
  };

  return (
    <div className="mx-auto py-8 text-slate-100">
      {/* Header */}
      <div className="mb-6 flex items-start gap-3 border-b border-slate-800 pb-6">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400">
          <Sparkles className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-white">Text to Image</h1>
          <p className="text-sm text-slate-400">Turn your words into stunning AI-generated images — free.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: controls */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200">
            <Sparkles className="h-4 w-4 text-violet-400" />
            Describe your image
          </div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value.slice(0, MAX_CHARS))}
            placeholder="e.g. A beautiful sunset over glowing mountains with purple sky..."
            rows={5}
            className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-violet-500"
          />
          <div className="mt-1 text-right text-xs text-slate-500">
            {prompt.length}/{MAX_CHARS}
          </div>

          {/* Art style */}
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Art Style</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {ART_STYLES.map((style, i) => (
                <button
                  key={style.label}
                  onClick={() => setStyleIndex(i)}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition ${
                    i === styleIndex
                      ? "border-violet-500 bg-violet-600 text-white"
                      : "border-slate-700 bg-slate-800/60 text-slate-300 hover:border-slate-600"
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          {/* Aspect ratio */}
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Aspect Ratio</p>
            <div className="flex flex-wrap gap-2">
              {ASPECT_RATIOS.map((ratio, i) => (
                <button
                  key={ratio.label}
                  onClick={() => setRatioIndex(i)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                    i === ratioIndex
                      ? "border-violet-500 bg-violet-600 text-white"
                      : "border-slate-700 bg-slate-800/60 text-slate-300 hover:border-slate-600"
                  }`}
                >
                  {ratio.label}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced options */}
          <div className="mt-4">
            <button
              onClick={() => setShowAdvanced((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200"
            >
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              Advanced Options
            </button>

            {showAdvanced && (
              <div className="mt-3 space-y-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-400">Seed</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={seed}
                      onChange={(e) => setSeed(Number(e.target.value) || 0)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-100 outline-none focus:border-violet-500"
                    />
                    <button
                      onClick={randomizeSeed}
                      title="Randomize seed"
                      className="rounded-lg border border-slate-700 p-1.5 text-slate-400 hover:border-slate-600 hover:text-slate-200"
                    >
                      <Dices className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="mt-1 text-[10px] text-slate-500">Same seed + prompt = same image. Change it for variations.</p>
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={enhance}
                    onChange={(e) => setEnhance(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-slate-600 bg-slate-900 accent-violet-600"
                  />
                  Enhance prompt (sharper detail, may change style slightly)
                </label>
              </div>
            )}
          </div>

          {error && (
            <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-rose-400">
              <AlertCircle className="h-3.5 w-3.5" />
              {error}
            </p>
          )}

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-semibold text-white transition hover:from-violet-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Image
              </>
            )}
          </button>
        </div>

        {/* Right: preview */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
              <ImageIcon className="h-4 w-4 text-violet-400" />
              Preview
            </div>
            {imageUrl && !isGenerating && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRegenerate}
                  className="flex items-center gap-1 rounded-lg border border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-300 hover:border-slate-600"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Regenerate
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-500"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </button>
              </div>
            )}
          </div>

          <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-3 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
                <p className="text-sm text-slate-400">Creating your image...</p>
              </div>
            ) : imageUrl ? (
              <img src={imageUrl} alt={prompt} className="h-full w-full object-contain" />
            ) : (
              <div className="flex flex-col items-center gap-3 px-6 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-800 text-slate-500">
                  <ImageIcon className="h-6 w-6" />
                </span>
                <p className="text-sm font-medium text-slate-300">Your image will appear here</p>
                <p className="text-xs text-slate-500">
                  Enter a description, choose a style and click Generate Image.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}