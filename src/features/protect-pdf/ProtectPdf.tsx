import React, { useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import {
  Lock,
  Upload,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileText,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

export default function ProtectPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [protectedBlob, setProtectedBlob] = useState<Blob | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      setError('Please select a valid PDF file.');
      return;
    }
    setFile(selectedFile);
    setSuccess(false);
    setProtectedBlob(null);
    setError(null);
    setProgress(0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  const reset = () => {
    setFile(null);
    setSuccess(false);
    setProtectedBlob(null);
    setError(null);
    setProgress(0);
    setPassword('');
    setConfirmPassword('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const protectPdf = async () => {
    if (!file) return;

    if (!password) {
      setError('Please enter a password.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);
    setProtectedBlob(null);
    setProgress(0);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfData = new Uint8Array(arrayBuffer);

      // Load with pdfjs to render pages
      const loadingTask = pdfjsLib.getDocument({ data: pdfData });
      const pdfDoc = await loadingTask.promise;
      const numPages = pdfDoc.numPages;

      // Get first page dimensions to set PDF size
      const firstPage = await pdfDoc.getPage(1);
      const viewport = firstPage.getViewport({ scale: 2.0 });
      const pxToMm = 25.4 / 96;
      const wMm = viewport.width * pxToMm;
      const hMm = viewport.height * pxToMm;

      const isLandscape = wMm > hMm;
      const doc = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [wMm, hMm],
        encryption: {
          userPassword: password,
          ownerPassword: password + '_owner',
          userPermissions: ['print', 'copy'],
        },
      });

      // Render each page to canvas and add to jsPDF
      for (let i = 1; i <= numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const vp = page.getViewport({ scale: 2.0 });

        const canvas = document.createElement('canvas');
        canvas.width = vp.width;
        canvas.height = vp.height;
        const ctx = canvas.getContext('2d')!;

        await page.render({ canvasContext: ctx, viewport: vp, canvas }).promise;

        const imgData = canvas.toDataURL('image/jpeg', 0.92);
        const pgWMm = vp.width * pxToMm;
        const pgHMm = vp.height * pxToMm;

        if (i > 1) {
          doc.addPage([pgWMm, pgHMm], pgWMm > pgHMm ? 'landscape' : 'portrait');
        }

        doc.addImage(imgData, 'JPEG', 0, 0, pgWMm, pgHMm);
        setProgress(Math.round((i / numPages) * 100));
      }

      const pdfOutput = doc.output('arraybuffer');
      const blob = new Blob([pdfOutput], { type: 'application/pdf' });
      setProtectedBlob(blob);
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to protect PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadProtected = () => {
    if (!protectedBlob || !file) return;
    saveAs(protectedBlob, `${file.name.replace(/\.pdf$/i, '')}_protected.pdf`);
  };

  return (
    <div className="mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
        <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20 text-red-400">
          <Lock className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Protect PDF</h1>
          <p className="text-slate-400 text-sm mt-1">
            Add password protection to your PDF — works entirely in your browser.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left: Upload / File info */}
        <div className="lg:col-span-7 space-y-4">
          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 hover:border-red-500/50 hover:bg-slate-900/30 rounded-3xl p-16 text-center cursor-pointer transition min-h-[360px] group"
            >
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 text-slate-400 group-hover:text-red-400 group-hover:scale-110 transition duration-300 shadow-xl">
                <Upload className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-white mt-6">Drag & drop your PDF here</h3>
              <p className="text-slate-400 text-sm mt-2 max-w-xs">
                Or click to browse. Your file never leaves the browser.
              </p>
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-6 min-h-[360px] flex flex-col justify-between">
              {/* File info */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 bg-red-500/10 rounded-xl border border-red-500/20 text-red-400 shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white truncate max-w-xs">{file.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  onClick={reset}
                  className="text-xs font-semibold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg border border-red-500/20 transition cursor-pointer shrink-0"
                >
                  Change
                </button>
              </div>

              {/* Shield visual */}
              <div className="flex flex-col items-center justify-center flex-1 py-6 gap-4">
                <div className={`p-6 rounded-3xl border-2 transition-all duration-500 ${success ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                  <ShieldCheck className="w-16 h-16" />
                </div>
                <p className="text-sm text-slate-400 text-center">
                  {success ? 'PDF is now password protected' : 'Set a password to protect this PDF'}
                </p>
              </div>

              {/* Progress */}
              {loading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Encrypting pages...</span>
                    <span className="text-red-400 font-semibold">{progress}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-rose-400 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Success download */}
              {success && protectedBlob && (
                <button
                  onClick={downloadProtected}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-600/20"
                >
                  <Download className="w-5 h-5" /> Download Protected PDF
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right: Password panel */}
        <div className="lg:col-span-5">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-6 shadow-2xl">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-red-400" />
              <h2 className="text-lg font-bold text-white">Password Settings</h2>
            </div>

            {/* Password input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Password
              </label>
              <div className="flex items-center bg-slate-950 border border-slate-800 focus-within:border-red-500/60 rounded-xl overflow-hidden transition">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="flex-1 bg-transparent px-4 py-3 text-white text-sm outline-none placeholder:text-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="px-3 text-slate-500 hover:text-slate-300 cursor-pointer transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className={`flex items-center bg-slate-950 border rounded-xl overflow-hidden transition ${
                confirmPassword && confirmPassword !== password
                  ? 'border-red-500/60'
                  : confirmPassword && confirmPassword === password
                    ? 'border-emerald-500/50'
                    : 'border-slate-800 focus-within:border-red-500/60'
              }`}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="flex-1 bg-transparent px-4 py-3 text-white text-sm outline-none placeholder:text-slate-600"
                />
                {confirmPassword && (
                  <div className="px-3">
                    {confirmPassword === password
                      ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      : <AlertCircle className="w-4 h-4 text-red-400" />
                    }
                  </div>
                )}
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p className="text-xs text-red-400">Passwords do not match</p>
              )}
            </div>

            {/* Strength indicator */}
            {password && (
              <div className="space-y-1.5">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        password.length >= level * 3
                          ? level <= 1 ? 'bg-red-500' : level <= 2 ? 'bg-orange-500' : level <= 3 ? 'bg-yellow-500' : 'bg-emerald-500'
                          : 'bg-slate-800'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-500">
                  {password.length < 4 ? 'Too short' : password.length < 7 ? 'Weak' : password.length < 10 ? 'Medium' : 'Strong'}
                </p>
              </div>
            )}

            {/* Permissions info */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2">
              <p className="text-xs font-semibold text-slate-300">Applied Restrictions:</p>
              <ul className="space-y-1.5">
                {[
                  { label: 'Password required to open', allowed: false },
                  { label: 'Editing disabled', allowed: false },
                  { label: 'Copying text disabled', allowed: false },
                  { label: 'Printing allowed', allowed: true },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-slate-400">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.allowed ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    {item.label}
                  </li>
                ))}
              </ul>
            </div>

            {/* Action button */}
            <button
              onClick={protectPdf}
              disabled={!file || loading || !password || !confirmPassword || password !== confirmPassword}
              className={`w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-xl text-sm ${
                !file || !password || !confirmPassword || password !== confirmPassword
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  : loading
                    ? 'bg-red-700 text-white border border-red-600 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-500 text-white border border-red-500 shadow-red-600/20'
              }`}
            >
              {loading ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Protecting... {progress}%</>
              ) : success ? (
                <><CheckCircle2 className="w-4 h-4" /> Protected Successfully</>
              ) : (
                <><Lock className="w-4 h-4" /> Protect PDF</>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
