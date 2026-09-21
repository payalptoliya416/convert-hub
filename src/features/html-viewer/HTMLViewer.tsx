import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import {
  Upload,
  Code2,
  Eye,
  Columns2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Download,
  RotateCcw,
  RefreshCw,
  FileWarning,
  Smartphone,
  Tablet,
  Monitor,
  GripVertical,
  Copy,
  Check,
} from "lucide-react";

type ViewMode = "preview" | "source" | "split";
type DeviceMode = "responsive" | "mobile" | "tablet" | "desktop";

const ZOOM_LEVELS = [50, 60, 70, 80, 90, 100, 110, 120, 140, 160, 180, 200];
const DEFAULT_ZOOM_INDEX = ZOOM_LEVELS.indexOf(100);

const DEVICE_WIDTHS: Record<Exclude<DeviceMode, "responsive">, number> = {
  mobile: 375,
  tablet: 768,
  desktop: 1280, // 1440px કરતા 1280px વધુ અનુકૂળ રહે છે
};

interface HtmlViewerProps {
  className?: string;
}

export default function HtmlViewer({ className = "" }: HtmlViewerProps) {
  const [originalHtml, setOriginalHtml] = useState("");
  const [html, setHtml] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");
  const [fileName, setFileName] = useState("");
  const [mode, setMode] = useState<ViewMode>("split");
  const [device, setDevice] = useState<DeviceMode>("responsive");
  const [zoomIndex, setZoomIndex] = useState(DEFAULT_ZOOM_INDEX);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [splitPercent, setSplitPercent] = useState(45);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileTab, setMobileTab] = useState<"source" | "preview">("source");
  const [editorScrollTop, setEditorScrollTop] = useState(0);
  const [isCopied, setIsCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewAreaRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const zoom = ZOOM_LEVELS[zoomIndex];
  const hasContent = html.length > 0 || fileName.length > 0;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Live preview update
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPreviewHtml(html);
    }, 150);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [html]);

  // Drag-to-resize split panes
  useEffect(() => {
    if (!isResizing) return;

    const handlePointerMove = (event: PointerEvent) => {
      if (!previewAreaRef.current) return;
      const rect = previewAreaRef.current.getBoundingClientRect();
      const percent = ((event.clientX - rect.left) / rect.width) * 100;
      setSplitPercent(Math.min(75, Math.max(20, percent)));
    };

    const handlePointerUp = () => setIsResizing(false);

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing]);

  const resetZoom = () => setZoomIndex(DEFAULT_ZOOM_INDEX);

  const loadFile = useCallback((file: File) => {
    const lower = file.name.toLowerCase();
    if (!lower.endsWith(".html") && !lower.endsWith(".htm")) {
      setError("Only .html and .htm files are supported.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = (event.target?.result as string) ?? "";
      if (!content.trim()) {
        setError("The selected file is empty.");
        return;
      }

      setError(null);
      setOriginalHtml(content);
      setHtml(content);
      setPreviewHtml(content);
      setFileName(file.name);
      setMode("split");
      setMobileTab("preview");
      setDevice("responsive");
      resetZoom();
    };

    reader.onerror = () => {
      setError("Could not read the file. Please try again.");
    };

    reader.readAsText(file);
  }, []);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) loadFile(file);
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingFile(false);
    const file = event.dataTransfer.files?.[0];
    if (file) loadFile(file);
  };

  const handleDownload = () => {
    if (!html.trim()) return;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName || "document.html";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const handleResetContent = () => {
    setHtml(originalHtml);
    setPreviewHtml(originalHtml);
  };

  const handleRefreshPreview = () => {
    setPreviewHtml("");
    requestAnimationFrame(() => setPreviewHtml(html));
  };

 const handleClearFile = () => {
  setOriginalHtml("");
  setHtml("");
  setPreviewHtml("");
  setFileName("");
  setError(null);
  resetZoom();
  if (fileInputRef.current) {
    fileInputRef.current.value = "";
  }
};

  const handleSample = () => {
    const sample = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>HTML Viewer Sample</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 40px 24px;
      font-family: system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, #f5f3ff, #eef2ff);
      color: #172033;
    }
    .card {
      max-width: 680px;
      margin: auto;
      padding: 32px;
      border-radius: 16px;
      background: white;
      box-shadow: 0 10px 30px rgba(0,0,0,.08);
    }
    h1 { margin-top: 0; color: #6d28d9; font-size: 24px; }
    p { line-height: 1.6; color: #475569; }
    button {
      border: 0;
      border-radius: 8px;
      padding: 10px 20px;
      background: #7c3aed;
      color: white;
      font-weight: 500;
      cursor: pointer;
    }
    button:hover { background: #6d28d9; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Welcome to HTML Viewer</h1>
    <p>Edit the HTML on the left and see your changes live on the right.</p>
    <button onclick="alert('Working perfectly!')">Test Interaction</button>
  </div>
</body>
</html>`;

    setError(null);
    setOriginalHtml(sample);
    setHtml(sample);
    setPreviewHtml(sample);
    setFileName("sample.html");
    setMode("split");
    setMobileTab("preview");
    setDevice("responsive");
  };

  const handleFormat = () => {
    const formatted = formatHtml(html);
    setHtml(formatted);
    setPreviewHtml(formatted);
  };

  const handleTab = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Tab") return;
    event.preventDefault();
    const target = event.currentTarget;
    const { selectionStart, selectionEnd, value } = target;
    const next = value.slice(0, selectionStart) + "  " + value.slice(selectionEnd);
    setHtml(next);

    requestAnimationFrame(() => {
      target.selectionStart = target.selectionEnd = selectionStart + 2;
    });
  };

  // Safe Clipboard Copy (Fallback support for HTTP & All Browsers)
  const copySource = async () => {
    if (!html) return;

    let success = false;
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(html);
        success = true;
      } catch {
        success = false;
      }
    }

    if (!success) {
      // Fallback method
      try {
        const textArea = document.createElement("textarea");
        textArea.value = html;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        success = document.execCommand("copy");
        textArea.remove();
      } catch {
        success = false;
      }
    }

    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const showSourcePane =
    mode === "source" || mode === "split" || (isMobile && mobileTab === "source");

  const showPreviewPane =
    mode === "preview" || mode === "split" || (isMobile && mobileTab === "preview");

  const effectiveSplit = mode === "split" && !isMobile;
  const previewDeviceWidth =
    device === "responsive" ? null : DEVICE_WIDTHS[device];

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-xl border border-slate-700/60 bg-slate-900 shadow-xl shadow-black/20 ${
        isFullscreen
          ? "fixed inset-0 z-50 rounded-none h-screen"
          : "h-[calc(100vh-6rem)] min-h-[550px]"
      } ${className}`}
    >
      {/* Header */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-700/60 bg-slate-900/95 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-400">
            <Code2 className="h-4 w-4" />
          </span>
          <span className="truncate text-sm font-semibold text-slate-100">
            {fileName || "HTML Viewer"}
          </span>
        </div>

        {hasContent && (
          <div className="flex flex-wrap items-center gap-1.5">
            {/* View Mode */}
            <div className="flex rounded-lg bg-slate-800 p-0.5">
              <ModeButton
                active={mode === "preview"}
                onClick={() => setMode("preview")}
                icon={<Eye className="h-3.5 w-3.5" />}
                label="Preview"
              />
              {!isMobile && (
                <ModeButton
                  active={mode === "split"}
                  onClick={() => setMode("split")}
                  icon={<Columns2 className="h-3.5 w-3.5" />}
                  label="Split"
                />
              )}
              <ModeButton
                active={mode === "source"}
                onClick={() => setMode("source")}
                icon={<Code2 className="h-3.5 w-3.5" />}
                label="Source"
              />
            </div>

            {/* Device presets */}
            <div className="hidden items-center gap-0.5 rounded-lg bg-slate-800 p-1 sm:flex">
              <DeviceButton
                active={device === "responsive"}
                onClick={() => setDevice("responsive")}
                title="Responsive (Fit to container)"
              >
                <span className="px-1 text-xs font-semibold">Auto</span>
              </DeviceButton>
              <DeviceButton
                active={device === "mobile"}
                onClick={() => setDevice("mobile")}
                title="Mobile (375px)"
              >
                <Smartphone className="h-3.5 w-3.5" />
              </DeviceButton>
              <DeviceButton
                active={device === "tablet"}
                onClick={() => setDevice("tablet")}
                title="Tablet (768px)"
              >
                <Tablet className="h-3.5 w-3.5" />
              </DeviceButton>
              <DeviceButton
                active={device === "desktop"}
                onClick={() => setDevice("desktop")}
                title="Desktop (1280px)"
              >
                <Monitor className="h-3.5 w-3.5" />
              </DeviceButton>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-0.5 rounded-lg bg-slate-800 px-1 py-1">
              <IconButton
                onClick={() => setZoomIndex((i) => Math.max(i - 1, 0))}
                title="Zoom out"
                disabled={zoomIndex === 0}
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </IconButton>
              <span className="w-11 select-none text-center text-xs font-medium text-slate-300">
                {zoom}%
              </span>
              <IconButton
                onClick={() =>
                  setZoomIndex((i) => Math.min(i + 1, ZOOM_LEVELS.length - 1))
                }
                title="Zoom in"
                disabled={zoomIndex === ZOOM_LEVELS.length - 1}
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </IconButton>
            </div>

            <IconButton onClick={handleRefreshPreview} title="Refresh preview">
              <RefreshCw className="h-4 w-4" />
            </IconButton>

            <IconButton onClick={handleClearFile} title="Clear all & Reset">
            <RotateCcw className="h-4 w-4" />
            </IconButton>

            {/* Copy Button with Feedback */}
            <IconButton onClick={copySource} title={isCopied ? "Copied!" : "Copy HTML"}>
              {isCopied ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </IconButton>

            <IconButton
              onClick={handleDownload}
              title="Download HTML"
              accent
            >
              <Download className="h-4 w-4" />
            </IconButton>

            <IconButton
              onClick={() => setIsFullscreen((v) => !v)}
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </IconButton>
          </div>
        )}
      </div>

      {/* Mobile tabs */}
      {hasContent && isMobile && mode === "split" && (
        <div className="flex shrink-0 border-b border-slate-700/60 bg-slate-900">
          {(["source", "preview"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setMobileTab(tab)}
              className={`flex-1 py-2 text-xs font-medium capitalize transition ${
                mobileTab === tab
                  ? "border-b-2 border-violet-500 text-violet-400"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      {/* Main Body */}
      <div className="relative min-h-0 flex-1 overflow-hidden bg-slate-950">
        {!hasContent ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingFile(true);
            }}
            onDragLeave={() => setIsDraggingFile(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex h-full min-h-[280px] cursor-pointer flex-col items-center justify-center gap-3 border-2 border-dashed p-8 text-center transition ${
              isDraggingFile
                ? "border-violet-500 bg-violet-500/5"
                : "border-slate-700 hover:border-slate-600 hover:bg-slate-900/50"
            }`}
          >
            <div className="rounded-full bg-violet-500/15 p-3">
              <Upload className="h-6 w-6 text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200">
                Drop an HTML file here, or click to browse
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Supports .html and .htm files
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSample();
              }}
              className="mt-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-violet-500/50 hover:text-violet-400"
            >
              Load Sample
            </button>
            {error && (
              <p className="flex items-center gap-1.5 text-xs font-medium text-rose-400">
                <FileWarning className="h-3.5 w-3.5" />
                {error}
              </p>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".html,.htm,text/html"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        ) : (
          <div
            ref={previewAreaRef}
            className={`flex h-full min-h-0 ${
              effectiveSplit ? "flex-row" : "flex-col"
            }`}
          >
            {/* Source Editor Pane */}
            {showSourcePane && (
              <div
                className={`flex min-h-0 flex-col bg-slate-950 ${
                  effectiveSplit
                    ? "shrink-0 border-r border-slate-700/60"
                    : "h-full"
                } ${
                  mode === "split" && isMobile && mobileTab !== "source"
                    ? "hidden"
                    : ""
                }`}
                style={
                  effectiveSplit ? { width: `${splitPercent}%` } : undefined
                }
              >
                <div className="flex shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900/70 px-3 py-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Source Code
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleFormat}
                      className="rounded-md px-2 py-1 text-[11px] font-medium text-slate-400 transition hover:bg-slate-800 hover:text-violet-400"
                    >
                      Format
                    </button>
                    <button
                      type="button"
                      onClick={handleSample}
                      className="rounded-md px-2 py-1 text-[11px] font-medium text-slate-400 transition hover:bg-slate-800 hover:text-violet-400"
                    >
                      Sample
                    </button>
                  </div>
                </div>

                <div className="relative min-h-0 flex-1 overflow-hidden">
                  <div
                    className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 overflow-hidden border-r border-slate-800 bg-slate-950 py-4 text-right font-mono text-[12px] leading-relaxed text-slate-600 select-none"
                    style={{ transform: `translateY(-${editorScrollTop}px)` }}
                  >
                    {html.split("\n").map((_, index) => (
                      <div key={index} className="pr-3">
                        {index + 1}
                      </div>
                    ))}
                  </div>

                  <textarea
                    ref={editorRef}
                    value={html}
                    onChange={(e) => setHtml(e.target.value)}
                    onKeyDown={handleTab}
                    onScroll={(e) =>
                      setEditorScrollTop(e.currentTarget.scrollTop)
                    }
                    spellCheck={false}
                    className="h-full w-full resize-none overflow-auto bg-slate-950 py-4 pl-14 pr-4 font-mono text-[13px] leading-relaxed text-slate-100 outline-none placeholder:text-slate-600"
                    style={{ tabSize: 2 }}
                    placeholder="<!-- Edit your HTML here -->"
                  />
                </div>
              </div>
            )}

            {/* Draggable Divider */}
            {effectiveSplit && (
              <div
                role="separator"
                aria-label="Resize editor and preview"
                onPointerDown={() => setIsResizing(true)}
                className={`group relative z-10 flex w-2 shrink-0 cursor-col-resize items-center justify-center bg-slate-900 transition ${
                  isResizing ? "bg-violet-500/30" : ""
                }`}
              >
                <div
                  className={`flex h-12 w-4 items-center justify-center rounded-sm border border-slate-700 bg-slate-900 text-slate-500 shadow-sm transition group-hover:border-violet-500 group-hover:text-violet-400 ${
                    isResizing ? "border-violet-500 text-violet-400" : ""
                  }`}
                >
                  <GripVertical className="h-3.5 w-3.5" />
                </div>
              </div>
            )}

            {/* Preview Pane */}
            {showPreviewPane && (
              <div
                className={`relative min-h-0 flex-1 overflow-auto bg-slate-900/60 p-4 ${
                  mode === "split" && isMobile && mobileTab !== "preview"
                    ? "hidden"
                    : ""
                }`}
              >
                {/* Dragging overlay to prevent iframe stealing pointer events */}
                {isResizing && <div className="absolute inset-0 z-50" />}

                <div className="flex min-h-full w-full items-start justify-center">
                  <div
                    className="transition-[width] duration-150 ease-out"
                    style={{
                      width:
                        previewDeviceWidth === null
                          ? "100%"
                          : `${previewDeviceWidth}px`,
                      maxWidth: "100%",
                      transform: `scale(${zoom / 100})`,
                      transformOrigin: "top center",
                    }}
                  >
                    <div className="overflow-hidden rounded-lg border border-slate-700/80 bg-white shadow-2xl">
                      <iframe
                        key={previewHtml}
                        srcDoc={previewHtml}
                        title="HTML live preview"
                        sandbox="allow-scripts allow-forms allow-popups allow-modals"
                        className="block w-full border-0 bg-white"
                        style={{
                          height: isFullscreen
                            ? "calc(100vh - 110px)"
                            : "calc(100vh - 15rem)",
                          minHeight: "480px",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {hasContent && (
        <div className="flex shrink-0 items-center justify-between border-t border-slate-700/60 bg-slate-900/90 px-4 py-1.5">
          <span className="text-[11px] text-slate-400">
            {html.length.toLocaleString()} characters
          </span>
          <button
            type="button"
            onClick={handleClearFile}
            className="text-[11px] font-medium text-slate-400 transition hover:text-rose-400"
          >
            Clear &amp; upload another file
          </button>
        </div>
      )}
    </div>
  );
}

// Helpers
function formatHtml(source: string) {
  if (!source.trim()) return "";
  let result = source
    .replace(/>\s*</g, "><")
    .replace(/(<!DOCTYPE html>)/i, "$1\n")
    .replace(/></g, ">\n<");

  const lines = result.split("\n").map((line) => line.trim()).filter(Boolean);
  let indent = 0;

  return lines
    .map((line) => {
      if (/^<\//.test(line)) {
        indent = Math.max(0, indent - 1);
      }
      const output = `${"  ".repeat(indent)}${line}`;
      if (
        /^<[^!/][^>]*>$/.test(line) &&
        !/\/>$/.test(line) &&
        !/^<(meta|link|img|input|br|hr|area|base|embed|source|track|wbr)\b/i.test(line) &&
        !/^<!(--|DOCTYPE)/i.test(line) &&
        !/<\/[^>]+>$/.test(line)
      ) {
        indent += 1;
      }
      return output;
    })
    .join("\n");
}

function ModeButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition ${
        active
          ? "bg-violet-600 text-white shadow-sm"
          : "text-slate-400 hover:text-slate-200"
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function DeviceButton({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`rounded-md px-2 py-1 text-xs transition ${
        active
          ? "bg-violet-600 text-white"
          : "text-slate-400 hover:bg-slate-700 hover:text-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

function IconButton({
  onClick,
  title,
  children,
  disabled = false,
  accent = false,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  disabled?: boolean;
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`rounded-lg p-1.5 transition disabled:cursor-not-allowed disabled:opacity-30 ${
        accent
          ? "text-violet-400 hover:bg-violet-500/15 hover:text-violet-300"
          : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
      }`}
    >
      {children}
    </button>
  );
}