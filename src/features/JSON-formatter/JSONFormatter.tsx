import React, { useState } from "react";
import {
  Braces,
  Copy,
  Check,
  Trash2,
  Minimize2,
  Maximize2,
  AlertCircle,
  FileJson,
} from "lucide-react";

const JsonFormatter: React.FC = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [indent, setIndent] = useState(2);

  const formatJson = () => {
    setError("");
    setCopied(false);

    if (!input.trim()) {
      setError("Please enter JSON data first.");
      setOutput("");
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, indent);

      setOutput(formatted);
    } catch (err) {
      setOutput("");
      setError(
        err instanceof Error
          ? `Invalid JSON: ${err.message}`
          : "Invalid JSON format.",
      );
    }
  };

  const minifyJson = () => {
    setError("");
    setCopied(false);

    if (!input.trim()) {
      setError("Please enter JSON data first.");
      setOutput("");
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);

      setOutput(minified);
    } catch (err) {
      setOutput("");
      setError(
        err instanceof Error
          ? `Invalid JSON: ${err.message}`
          : "Invalid JSON format.",
      );
    }
  };

  const copyOutput = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const clearAll = () => {
    setInput("");
    setOutput("");
    setError("");
    setCopied(false);
  };

  const loadSample = () => {
    const sample = `{
  "name": "ConvertHub",
  "version": "1.0.0",
  "features": [
    "PDF Tools",
    "JSON Formatter",
    "Password Generator"
  ],
  "active": true,
  "users": 100
}`;

    setInput(sample);
    setOutput("");
    setError("");
    setCopied(false);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-950 text-white">
      <div className="">
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
          <div className="shrink-0 rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3 text-cyan-400">
            <Braces className="h-8 w-8" />
          </div>

          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              JSON Formatter
            </h1>

            <p className="mt-1 text-xs leading-5 text-slate-400 sm:text-sm">
              Format, beautify, minify, and validate your JSON directly in your
              browser.
            </p>
          </div>
        </div>

        {/* Main Card */}
        <div className="mt-6 w-full rounded-2xl border border-slate-800 bg-slate-900/70 p-3 shadow-2xl sm:mt-8 sm:p-5">
          {/* Toolbar */}
          <div className="mb-4 flex flex-col gap-4 border-b border-slate-800 pb-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Title */}
            <div className="flex items-center gap-2">
              <FileJson className="h-5 w-5 shrink-0 text-violet-400" />

              <h2 className="text-sm font-semibold text-white">
                JSON Formatter
              </h2>
            </div>

            {/* Toolbar Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Indent */}
              <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2">
                <span className="text-xs text-slate-500">Indent</span>

                <select
                  value={indent}
                  onChange={(e) => setIndent(Number(e.target.value))}
                  className="max-w-[90px] bg-transparent text-xs font-medium text-slate-300 outline-none"
                >
                  <option value={2} className="bg-slate-900">
                    2 Spaces
                  </option>

                  <option value={4} className="bg-slate-900">
                    4 Spaces
                  </option>

                  <option value={8} className="bg-slate-900">
                    8 Spaces
                  </option>
                </select>
              </div>

              {/* Sample */}
              <button
                type="button"
                onClick={loadSample}
                className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-violet-500/50 hover:bg-violet-500/10 hover:text-violet-400"
              >
                Sample JSON
              </button>

              {/* Clear */}
              <button
                type="button"
                onClick={clearAll}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-400 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear
              </button>
            </div>
          </div>

          {/* Editors */}
          <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
            {/* ================= INPUT ================= */}
            <div className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
              {/* Input Header */}
              <div className="flex shrink-0 items-center justify-between border-b border-slate-800 px-3 py-3 sm:px-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-200">
                    Input JSON
                  </p>

                  <p className="mt-0.5 text-xs text-slate-600">
                    Paste or type your JSON
                  </p>
                </div>

                <span className="ml-2 shrink-0 rounded-md bg-slate-900 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  JSON
                </span>
              </div>

              {/* Input Editor */}
              <textarea
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setError("");
                }}
                placeholder={`{
  "name": "John",
  "age": 25
}`}
                spellCheck={false}
                className="
                h-[300px]
                w-full
                resize-none
                overflow-auto
                bg-transparent
                p-4
                font-mono
                text-sm
                leading-6
                text-slate-300
                outline-none
                placeholder:text-slate-700
                sm:h-[360px]
                lg:h-[420px]
              "
              />
            </div>

            {/* ================= OUTPUT ================= */}
            <div className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
              {/* Output Header */}
              <div className="flex shrink-0 items-center justify-between border-b border-slate-800 px-3 py-3 sm:px-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-200">
                    Formatted JSON
                  </p>

                  <p className="mt-0.5 text-xs text-slate-600">
                    Your formatted result
                  </p>
                </div>

                {/* Copy */}
                <button
                  type="button"
                  onClick={copyOutput}
                  disabled={!output}
                  className="
                  ml-2
                  flex
                  shrink-0
                  items-center
                  gap-1.5
                  rounded-lg
                  border
                  border-slate-700
                  px-2.5
                  py-1.5
                  text-xs
                  font-medium
                  text-slate-400
                  transition
                  hover:border-violet-500/40
                  hover:bg-violet-500/10
                  hover:text-violet-400
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Output Content */}
              <div
                className="
                h-[300px]
                w-full
                overflow-auto
                sm:h-[360px]
                lg:h-[420px]
              "
              >
                {output ? (
                  <pre
                    className="
                    min-h-full
                    w-max
                    min-w-full
                    overflow-x-auto
                    p-4
                    font-mono
                    text-sm
                    leading-6
                    text-slate-300
                "
                  >
                    {output}
                  </pre>
                ) : (
                  <div className="flex h-full min-h-[200px] items-center justify-center px-6 text-center">
                    <div>
                      <Braces className="mx-auto h-10 w-10 text-slate-800" />

                      <p className="mt-3 text-sm text-slate-600">
                        Formatted JSON will appear here
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />

              <div className="min-w-0">
                <p className="text-sm font-medium text-red-400">Invalid JSON</p>

                <p className="mt-1 break-all text-xs leading-5 text-red-400/70">
                  {error.replace("Invalid JSON: ", "")}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Format */}
            <button
              type="button"
              onClick={formatJson}
              className="
              flex
              min-h-[46px]
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-gradient-to-r
              from-violet-600
              to-indigo-600
              px-5
              py-3
              text-sm
              font-semibold
              text-white
              shadow-lg
              shadow-violet-600/20
              transition
              hover:from-violet-500
              hover:to-indigo-500
            "
            >
              <Maximize2 className="h-4 w-4" />
              Format JSON
            </button>

            {/* Minify */}
            <button
              type="button"
              onClick={minifyJson}
              className="
              flex
              min-h-[46px]
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-slate-700
              bg-slate-900
              px-5
              py-3
              text-sm
              font-semibold
              text-slate-300
              transition
              hover:border-violet-500/40
              hover:bg-slate-800
              hover:text-white
            "
            >
              <Minimize2 className="h-4 w-4" />
              Minify JSON
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JsonFormatter;
