import { useRef, useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import {
  FileText, Download, RefreshCw, AlertCircle,
  CheckCircle2, Code2, Upload, Eye, Globe, X,
  RotateCcw,
} from 'lucide-react';

// ── URL Modal ─────────────────────────────────────────────────────────────────
function UrlModal({ onAdd, onClose }: { onAdd: (url: string) => void; onClose: () => void }) {
  const [value, setValue] = useState('');
  const [err, setErr] = useState('');

  const handleAdd = () => {
    const trimmed = value.trim();
    if (!trimmed) { setErr('Please enter a URL.'); return; }
    if (!/^https?:\/\/.+/i.test(trimmed)) { setErr('URL must start with http:// or https://'); return; }
    onAdd(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
  <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--bg-surface)] shadow-2xl">

    {/* Header */}
    <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-5">
      <h2 className="text-lg font-bold text-[var(--text-heading)]">
        Add HTML to Convert
      </h2>

      <button
        onClick={onClose}
        className="rounded-lg p-2 text-[var(--text-secondary)] transition hover:bg-[var(--bg-hover)] hover:text-[var(--text-heading)] cursor-pointer"
      >
        <X className="h-5 w-5" />
      </button>
    </div>

    {/* Tab */}
    <div className="border-b border-[var(--border)] px-6 pt-4">
      <div className="inline-block border-b-2 border-red-500 px-1 pb-3 text-sm font-semibold text-red-400">
        URL
      </div>
    </div>

    {/* Body */}
    <div className="space-y-5 px-6 py-6">

      <label className="block text-sm font-semibold text-[var(--text-primary)]">
        Website URL
      </label>

      <div className="flex items-center overflow-hidden rounded-xl border border-[var(--border-hover)] bg-[var(--bg-base)] transition focus-within:border-red-500">

        <div className="px-4 text-[var(--text-muted)]">
          <Globe className="h-5 w-5" />
        </div>

        <input
          autoFocus
          type="url"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setErr("");
          }}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="https://example.com"
          className="flex-1 bg-transparent py-3 pr-4 text-sm text-[var(--text-heading)] outline-none placeholder:text-[var(--text-muted)]"
        />
      </div>

      {err && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
          {err}
        </div>
      )}

      <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-4">
        <p className="text-xs leading-5 text-sky-600">
          Some websites block cross-origin requests (CORS).
          Public websites usually work best.
        </p>
      </div>

    </div>

    {/* Footer */}
    <div className="flex justify-end border-t border-[var(--border)] px-6 py-5">

      <button
        onClick={handleAdd}
        className="rounded-xl bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 cursor-pointer shadow-lg shadow-red-600/20"
      >
        Add URL
      </button>

    </div>
  </div>
</div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function HtmlToPdf() {
  // '' = nothing loaded yet, shows upload zone
  const [htmlCode, setHtmlCode] = useState('');
  const [mode, setMode] = useState<'code' | 'file'>('code');
  console.log("mode",mode)
  const [loading, setLoading] = useState(false);
  const [urlLoading, setUrlLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [fileName, setFileName] = useState('document');
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [sourceLabel, setSourceLabel] = useState('');

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasContent = htmlCode.trim().length > 0;

  // Sync preview iframe
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !hasContent) return;
    try {
      const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
      if (!doc) return;
      doc.open();
      doc.write(htmlCode);
      doc.close();
    } catch (_) {}
  }, [htmlCode, hasContent]);

  // ── Reset everything ──
  const reset = () => {
    setHtmlCode('');
    setMode('code');
    setLoading(false);
    setError(null);
    setSuccess(false);
    setPdfBlob(null);
    setFileName('document');
    setSourceLabel('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Load URL via CORS proxy ──
  const loadUrl = async (url: string) => {
    setUrlLoading(true);
    setError(null);
    setShowUrlModal(false);
    try {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error(`Proxy returned ${res.status}`);
      const data = await res.json();
      if (!data.contents) throw new Error('Empty response from proxy.');

      // Fix relative URLs → absolute
      const fixed = (data.contents as string).replace(
        /(src|href|action)=["'](?!https?:\/\/|data:|#|mailto:|javascript:)([^"']+)["']/gi,
        (_: string, attr: string, path: string) => {
          try { return `${attr}="${new URL(path, url).href}"`; }
          catch { return `${attr}="${path}"`; }
        }
      );

      setHtmlCode(fixed);
      setFileName(new URL(url).hostname.replace('www.', ''));
      setSourceLabel(url);
      setSuccess(false);
      setPdfBlob(null);
      setMode('code');
    } catch (e: any) {
      setError(`Could not load URL: ${e.message}`);
    } finally {
      setUrlLoading(false);
    }
  };

  // ── Load HTML file ──
  const handleFileLoad = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setHtmlCode(String(reader.result ?? ''));
      setFileName(file.name.replace(/\.(html|htm)$/i, ''));
      setSourceLabel(file.name);
      setError(null);
      setSuccess(false);
      setPdfBlob(null);
      setMode('code');
    };
    reader.onerror = () => setError('Failed to read file.');
    reader.readAsText(file);
  };

  // ── Convert HTML → PDF ──
  const convertToPdf = async () => {
    if (!hasContent) return;
    setLoading(true);
    setError(null);
    setSuccess(false);
    setPdfBlob(null);

    try {
      const RENDER_W = 794;

      // Hidden render iframe
      const iframe = document.createElement('iframe');
      Object.assign(iframe.style, {
        position: 'fixed', top: '-99999px', left: '-99999px',
        width: `${RENDER_W}px`, height: '1123px',
        border: 'none', visibility: 'hidden', pointerEvents: 'none',
      });
      document.body.appendChild(iframe);

      // Write content and wait
      await new Promise<void>((resolve) => {
        iframe.onload = () => resolve();
        const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
        if (doc) { doc.open(); doc.write(htmlCode); doc.close(); }
        setTimeout(resolve, 1200);
      });
      await new Promise((r) => setTimeout(r, 400));

      const iDoc = iframe.contentDocument ?? iframe.contentWindow?.document;
      const root = iDoc?.documentElement;
      if (!root) throw new Error('Could not access rendered document.');

      // Ensure full height is rendered
      const scrollH = iDoc?.body?.scrollHeight ?? 1123;
      iframe.style.height = `${scrollH + 50}px`;
      await new Promise((r) => setTimeout(r, 200));

      // Capture
      const canvas = await html2canvas(root, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: RENDER_W,
        height: scrollH,
        windowWidth: RENDER_W,
        windowHeight: scrollH,
        scrollX: 0,
        scrollY: 0,
        logging: false,
        imageTimeout: 8000,
      });

      document.body.removeChild(iframe);

      const cW = canvas.width;
      const cH = canvas.height;
      if (cW === 0 || cH === 0) throw new Error('Rendered canvas is empty. Check your HTML.');

      // Slice into A4 pages
      const A4_W = 210; // mm
      const A4_H = 297; // mm
      const mmPx = A4_W / cW;
      const numPages = Math.max(1, Math.ceil((cH * mmPx) / A4_H));
      const pxPerPage = Math.round(A4_H / mmPx);

      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

      for (let p = 0; p < numPages; p++) {
        if (p > 0) pdf.addPage();
        const startY = p * pxPerPage;
        const sliceH = Math.min(pxPerPage, cH - startY);
        if (sliceH <= 0) break;

        const sc = document.createElement('canvas');
        sc.width = cW;
        sc.height = sliceH;
        sc.getContext('2d')!.drawImage(canvas, 0, startY, cW, sliceH, 0, 0, cW, sliceH);
        pdf.addImage(sc.toDataURL('image/jpeg', 0.93), 'JPEG', 0, 0, A4_W, sliceH * mmPx);
      }

      const blob = pdf.output('blob');
      setPdfBlob(blob);
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? 'Failed to convert HTML to PDF.');
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = () => {
    if (!pdfBlob) return;
    saveAs(pdfBlob, `${fileName || 'document'}.pdf`);
    // Reset after small delay so user sees the download start
    setTimeout(reset, 800);
  };

  // ── Drag & drop on upload zone ──
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f && (f.name.endsWith('.html') || f.name.endsWith('.htm'))) handleFileLoad(f);
  };

  // ── RENDER ──
  return (
    <div className="mx-auto max-w-5xl space-y-6 mb-7">
      {showUrlModal && <UrlModal onAdd={loadUrl} onClose={() => setShowUrlModal(false)} />}

      {/* Header */}
      <div className="flex items-center gap-4 border-b border-[var(--border)] pb-6">
        <div className="p-3 rounded-xl border text-[#8B5CF6]"
        style={{ backgroundColor: "rgba(139, 92, 246, 0.10)", borderColor: "var(--border)" }}>
          <FileText className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-heading)]">HTML to PDF</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">Upload an HTML file, paste code, or enter a URL — convert to PDF.</p>
        </div>
      </div>

      {/* ── UPLOAD ZONE (shown when no content loaded) ── */}
      {!hasContent && !urlLoading && (
        <div className="space-y-6">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--border-hover)] hover:border-indigo-500/60 hover:bg-[var(--bg-surface-60)] rounded-3xl p-16 text-center cursor-pointer transition min-h-[340px] group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".html,.htm"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileLoad(f); }}
            />
            <div className="p-5 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] text-[var(--text-secondary)] group-hover:text-indigo-400 group-hover:scale-110 transition duration-300 shadow-xl">
              <Upload className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-heading)] mt-6">Drag & drop your HTML file here</h3>
            <p className="text-[var(--text-secondary)] text-sm mt-2">Or click to browse <span className="text-indigo-400">.html</span> / <span className="text-indigo-400">.htm</span> files</p>
          </div>

          {/* Alt options row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Paste code */}
            <button
              onClick={() => { setHtmlCode(' '); setMode('code'); }}
              className="flex items-center gap-4 bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border border-[var(--border-hover)] hover:border-indigo-500/50 rounded-2xl p-5 text-left transition cursor-pointer group"
            >
              <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400 group-hover:scale-105 transition">
                <Code2 className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-[var(--text-heading)] text-sm">Paste HTML Code</p>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">Type or paste HTML directly</p>
              </div>
            </button>

            {/* URL */}
            <button
              onClick={() => setShowUrlModal(true)}
              className="flex items-center gap-4 bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border border-[var(--border-hover)] hover:border-indigo-500/50 rounded-2xl p-5 text-left transition cursor-pointer group"
            >
              <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400 group-hover:scale-105 transition">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-[var(--text-heading)] text-sm">From URL</p>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">Load any website by its URL</p>
              </div>
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><p>{error}</p>
            </div>
          )}
        </div>
      )}

      {/* URL loading spinner */}
      {urlLoading && (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
          <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin" />
          <p className="text-[var(--text-secondary)] text-sm">Loading website content…</p>
        </div>
      )}

      {/* ── EDITOR + PREVIEW (shown when content is loaded) ── */}
      {hasContent && !urlLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left: Editor */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-xl">

              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-base)]/60">
                <div className="flex items-center gap-2 min-w-0">
                  <Code2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="text-xs text-[var(--text-secondary)] font-medium truncate max-w-[160px]">
                    {sourceLabel || 'HTML Code'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="bg-[var(--bg-hover)] border border-[var(--border-hover)] rounded-lg px-2 py-1 text-xs text-[var(--text-heading)] outline-none w-24 focus:border-indigo-500"
                    placeholder="document"
                  />
                  <span className="text-xs text-[var(--text-muted)]">.pdf</span>
                  <button
                    onClick={reset}
                    title="Reset"
                    className="text-[var(--text-muted)] hover:text-red-400 transition cursor-pointer ml-1"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Code textarea */}
              <textarea
                value={htmlCode.trim() === '' ? '' : htmlCode}
                onChange={(e) => {
                  setHtmlCode(e.target.value);
                  setSuccess(false);
                  setPdfBlob(null);
                }}
                spellCheck={false}
                autoFocus
                className="w-full bg-[var(--bg-base)] text-green-700 font-mono text-xs px-4 py-4 outline-none resize-none border-0"
                style={{ minHeight: '420px', tabSize: 2 }}
                placeholder="Paste or write HTML here…"
              />
            </div>

            {/* Convert */}
            <button
              onClick={convertToPdf}
              disabled={loading || !hasContent}
              className={`w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-xl text-sm ${
                loading || !hasContent
                  ? 'bg-[var(--bg-hover)] text-[var(--text-muted)] border border-[var(--border-hover)] cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500 shadow-indigo-600/20'
              }`}
            >
              {loading
                ? <><RefreshCw className="w-4 h-4 animate-spin" /> Converting…</>
                : <><Download className="w-4 h-4" /> Convert to PDF</>}
            </button>

            {/* Download */}
            {success && pdfBlob && (
              <button
                onClick={downloadPdf}
                className="w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 shadow-xl shadow-emerald-600/20 transition cursor-pointer text-sm"
              >
                <Download className="w-4 h-4" /> Download {fileName || 'document'}.pdf
              </button>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><p>{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3 text-emerald-400 text-sm">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <p>PDF ready! Click Download above — page resets after download.</p>
              </div>
            )}
          </div>

          {/* Right: Preview */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <Eye className="w-4 h-4" />
                <span className="font-medium">Live Preview</span>
              </div>
              {sourceLabel && (
                <span className="text-xs text-indigo-400 truncate max-w-xs">{sourceLabel}</span>
              )}
            </div>

            <div className="bg-[var(--bg-hover)] rounded-2xl border border-[var(--border-hover)] overflow-hidden" style={{ height: '680px' }}>
              <div className="overflow-auto h-full p-3">
                <div
                  className="mx-auto bg-white shadow-2xl"
                  style={{ width: 794, minHeight: 1123, transform: 'scale(0.73)', transformOrigin: 'top center', marginBottom: '-295px' }}
                >
                  <iframe
                    ref={iframeRef}
                    title="HTML Preview"
                    sandbox="allow-same-origin allow-scripts"
                    style={{ width: 794, minHeight: 1123, border: 'none', display: 'block' }}
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-[var(--text-muted)] text-center">Preview scaled to 73% · PDF output is full A4</p>
          </div>
        </div>
      )}
    </div>
  );
}
