import React, { useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import { FileText, Download, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export default function HtmlToPdf() {
  const [html, setHtml] = useState<string>('<h1>Your Title</h1><p>Write HTML here or edit the content block.</p>');
  const [mode, setMode] = useState<'url' | 'file' | 'code'>('code');
  const [url, setUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

  const convertHtmlToPdf = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const element = previewRef.current;
      if (!element) throw new Error('No content to convert');

      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      // jsPDF.html uses html2canvas internally in modern builds
      await doc.html(element, {
        callback: function (doc) {
          const blob = doc.output('blob');
          setPdfBlob(blob);
          setSuccess(true);
        },
        x: 10,
        y: 10,
        width: 595 // A4 width in points
      });
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to convert HTML to PDF.');
    } finally {
      setLoading(false);
    }
  };

  const loadUrl = async () => {
    if (!url) return setError('Please enter a URL to load.');
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`Failed to fetch URL: ${resp.status} ${resp.statusText}`);
      const text = await resp.text();
      setHtml(text);
      setSuccess(false);
    } catch (err: any) {
      console.error(err);
      // Likely CORS when fetching third-party sites
      setError(err?.message || 'Failed to load URL. If this is a cross-origin site the browser may block the request (CORS). Use server-side proxy if needed.');
    } finally {
      setLoading(false);
    }
  };

  const loadFile = (file?: File | null) => {
    if (!file) return setError('No file selected');
    const reader = new FileReader();
    reader.onload = () => {
      setHtml(String(reader.result || ''));
      setError(null);
      setSuccess(false);
    };
    reader.onerror = (e) => {
      console.error(e);
      setError('Failed to read file');
    };
    reader.readAsText(file);
  };

  const downloadPdf = () => {
    if (!pdfBlob) return;
    saveAs(pdfBlob, `html_content.pdf`);
  };

  return (
    <div className="mx-auto space-y-8">
      <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
        <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
          <FileText className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">HTML to PDF</h1>
          <p className="text-slate-400 text-sm mt-1">Paste HTML or edit the preview and convert it to a printable PDF.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-6 shadow-xl">
            <h2 className="text-lg font-bold text-white">Options</h2>
            <p className="text-xs text-slate-400">Edit HTML below or modify the content directly on the preview pane.</p>

            <div className="space-y-3">
              <div className="flex gap-2">
                <button onClick={() => setMode('url')} className={`px-3 py-1 rounded ${mode==='url'? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400'}`}>URL</button>
                <button onClick={() => setMode('file')} className={`px-3 py-1 rounded ${mode==='file'? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400'}`}>File</button>
                <button onClick={() => setMode('code')} className={`px-3 py-1 rounded ${mode==='code'? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Code</button>
              </div>

              {mode === 'url' && (
                <div className="space-y-2">
                  <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white" />
                  <p className="text-xs text-slate-500">Note: many sites restrict cross-origin fetches. If loading fails, use a server proxy.</p>
                  <div className="flex gap-2">
                    <button onClick={loadUrl} disabled={loading} className={`py-2 px-4 rounded ${loading ? 'bg-violet-700' : 'bg-violet-600 hover:bg-violet-500'} text-white`}>Load URL</button>
                  </div>
                </div>
              )}

              {mode === 'file' && (
                <div className="space-y-2">
                  <input ref={fileInputRef} type="file" accept=".html,.htm" className="text-sm text-slate-400" onChange={(e) => loadFile(e.target.files?.[0] ?? null)} />
                  <p className="text-xs text-slate-500">Upload an HTML file to convert. External resources may be relative and may not load in preview.</p>
                </div>
              )}

              {mode === 'code' && (
                <textarea value={html} onChange={(e) => setHtml(e.target.value)} rows={8} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white" />
              )}
            </div>

            <button onClick={convertHtmlToPdf} disabled={loading} className={`w-full py-3 rounded-xl font-bold ${loading ? 'bg-violet-700' : 'bg-violet-600 hover:bg-violet-500'} text-white`}> 
              {loading ? <><RefreshCw className="w-5 h-5 animate-spin" /> Converting...</> : <><Download className="w-5 h-5" /> Convert to PDF</>}
            </button>

            {success && pdfBlob && (
              <button onClick={downloadPdf} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold">Download PDF</button>
            )}
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-slate-400">Preview (editable)</h3>
            <div ref={previewRef} contentEditable className="prose max-w-none mt-3 p-4 bg-white text-black rounded" dangerouslySetInnerHTML={{ __html: html }} onInput={(e) => setHtml((e.target as HTMLElement).innerHTML)} />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex items-start gap-3 text-red-400">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-300">Error</h4>
                <p className="text-sm mt-1 text-red-400/90">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
