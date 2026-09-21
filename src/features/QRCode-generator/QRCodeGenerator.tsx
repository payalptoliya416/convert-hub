import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { QrCode, Download, Copy, Check, RefreshCcw } from "lucide-react";

const QRCodeGenerator: React.FC = () => {
  const [text, setText] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [size, setSize] = useState(300);
  const [foreground, setForeground] = useState("#000000");
  const [background, setBackground] = useState("#ffffff");
  const [copied, setCopied] = useState(false);

  // Generate QR Code
  const generateQRCode = async () => {
    if (!text.trim()) {
      setQrCode("");
      return;
    }

    try {
      const dataUrl = await QRCode.toDataURL(text.trim(), {
        width: size,
        margin: 2,
        errorCorrectionLevel: "H",
        color: {
          dark: foreground,
          light: background,
        },
      });

      setQrCode(dataUrl);
    } catch (error) {
      console.error("QR Code generation failed:", error);
      setQrCode("");
    }
  };

  // Download QR Code
  const downloadQRCode = () => {
    if (!qrCode) return;

    const link = document.createElement("a");
    link.href = qrCode;
    link.download = "convert-hub-qr-code.png";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy text
  const copyText = async () => {
    if (!text.trim()) return;

    try {
      await navigator.clipboard.writeText(text);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  // Clear
  const clearAll = () => {
    setText("");
    setQrCode("");
    setSize(300);
    setForeground("#000000");
    setBackground("#ffffff");
    setCopied(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 py-7 text-white">
      <div className="mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
          <div className="p-3 bg-violet-500/10 rounded-xl border border-violet-500/20 text-violet-400">
            <QrCode className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-white">QR Code Generator</h1>

            <p className="text-slate-400 text-sm mt-1">
              Create QR codes for URLs, text, phone numbers, emails, and more.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_420px] mt-8">
          {/* Left - Settings */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-7">
            {/* Input */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-white">
                Enter text or URL
              </label>

              <textarea
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  setCopied(false);
                }}
                placeholder="Enter a URL, text, phone number, email..."
                maxLength={2000}
                rows={7}
                className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
              />

              <div className="mt-2 text-right text-xs text-slate-600">
                {text.length}/2000
              </div>
            </div>

            {/* Size */}
            {/* Size */}
            <div className="mt-7">
              <div className="mb-3 flex items-center justify-between">
                <label className="text-sm font-semibold text-white">
                  QR Code Size
                </label>

                <span className="text-sm text-violet-400">{size}px</span>
              </div>

              <input
                type="range"
                min="200"
                max="500"
                step="10"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full accent-violet-500"
              />

              <div className="mt-2 flex justify-between text-xs text-slate-600">
                <span>200px</span>
                <span>500px</span>
              </div>
            </div>
            {/* Colors */}
            <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* QR Color */}
              <div>
                <label className="mb-3 block text-sm font-semibold text-white">
                  QR Color
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <input
                    type="color"
                    value={foreground}
                    onChange={(e) => setForeground(e.target.value)}
                    className="h-10 w-10 cursor-pointer rounded-lg border-0 bg-transparent"
                  />

                  <span className="text-sm text-slate-400">{foreground}</span>
                </div>
              </div>

              {/* Background */}
              <div>
                <label className="mb-3 block text-sm font-semibold text-white">
                  Background
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <input
                    type="color"
                    value={background}
                    onChange={(e) => setBackground(e.target.value)}
                    className="h-10 w-10 cursor-pointer rounded-lg border-0 bg-transparent"
                  />

                  <span className="text-sm text-slate-400">{background}</span>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={generateQRCode}
                disabled={!text.trim()}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:from-violet-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
              >
                <QrCode className="h-5 w-5" />
                Generate QR Code
              </button>

              <button
                type="button"
                onClick={clearAll}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-5 py-3.5 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:text-white cursor-pointer"
              >
                <RefreshCcw className="h-4 w-4" />
                Clear
              </button>
            </div>
          </div>

          {/* Right - Preview */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-7">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">
                  QR Code Preview
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Your QR code appears here
                </p>
              </div>

              {qrCode && (
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                  Ready
                </span>
              )}
            </div>

            {/* Preview */}
            <div className="flex min-h-[380px] items-center justify-center rounded-xl border border-slate-800 bg-slate-950 p-5">
              {qrCode ? (
                <div className="rounded-xl bg-white p-1 shadow-xl">
                  <img
                    src={qrCode}
                    alt="Generated QR Code"
                    className="h-auto max-h-[330px] w-auto max-w-[330px] object-contain"
                  />
                </div>
              ) : (
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800">
                    <QrCode className="h-8 w-8 text-slate-600" />
                  </div>

                  <p className="text-sm font-medium text-slate-400">
                    No QR code yet
                  </p>

                  <p className="mt-2 max-w-xs text-xs leading-5 text-slate-600">
                    Enter some text or a URL and click Generate QR Code.
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            {qrCode && (
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={downloadQRCode}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>

                <button
                  type="button"
                  onClick={copyText}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-violet-500/50 hover:text-violet-400"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Text
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
