import React, { useState, useRef } from "react";

const HORDE_BASE = "https://stablehorde.net/api/v2";
const ANON_KEY = "0000000000"; // free anonymous access, no signup needed

export default function TextToImage() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [error, setError] = useState("");
  const cancelRef = useRef(false);

  const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setError("");
    setImageUrl("");
    setLoading(true);
    cancelRef.current = false;

    try {
      // 1. Submit generation request
      setStatusMsg("Submitting request to the horde...");
      const submitRes = await fetch(`${HORDE_BASE}/generate/async`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: ANON_KEY,
        },
        body: JSON.stringify({
          prompt,
          params: {
            width: 512,
            height: 512,
            steps: 25,
            n: 1,
          },
          r2: true, // get a direct image URL back instead of base64
        }),
      });

      if (!submitRes.ok) {
        const errData = await submitRes.json().catch(() => ({}));
        throw new Error(errData?.message || `HTTP ${submitRes.status}`);
      }

      const submitData = await submitRes.json();
      const requestId = submitData.id;
      if (!requestId) throw new Error("No request id returned");

      // 2. Poll until done (max ~3 minutes)
      const maxAttempts = 60;
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        if (cancelRef.current) return;

        await sleep(3000);

        const checkRes = await fetch(`${HORDE_BASE}/generate/check/${requestId}`);
        if (!checkRes.ok) throw new Error(`Status check failed (${checkRes.status})`);
        const checkData = await checkRes.json();

        if (checkData.faulted) {
          throw new Error("Generation faulted on the horde, try again");
        }

        setStatusMsg(
          `In queue... position ${checkData.queue_position ?? "?"}, ` +
            `~${checkData.wait_time ?? "?"}s left`
        );

        if (checkData.done) {
          const statusRes = await fetch(`${HORDE_BASE}/generate/status/${requestId}`);
          if (!statusRes.ok) throw new Error(`Fetching result failed (${statusRes.status})`);
          const statusData = await statusRes.json();
          const img = statusData.generations?.[0]?.img;
          if (!img) throw new Error("No image in result");
          setImageUrl(img);
          setLoading(false);
          setStatusMsg("");
          return;
        }
      }

      throw new Error("Timed out waiting for image");
    } catch (err: any) {
      setError(err?.message || "Failed to generate image");
      setLoading(false);
      setStatusMsg("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") generateImage();
  };

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "40px auto",
        padding: 24,
        fontFamily: "sans-serif",
        textAlign: "center",
      }}
    >
      <h2 style={{ marginBottom: 8 }}>Text to Image Generator</h2>
      <p style={{ fontSize: 12, color: "#888", marginBottom: 16 }}>
        Free & keyless — powered by AI Horde (community GPUs, may take a bit)
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe the image you want..."
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #ccc",
            fontSize: 14,
          }}
        />
        <button
          onClick={generateImage}
          disabled={loading}
          style={{
            padding: "10px 20px",
            borderRadius: 8,
            border: "none",
            background: loading ? "#999" : "#4f46e5",
            color: "#fff",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          {loading ? "Generating..." : "Generate"}
        </button>
      </div>

      {error && <p style={{ color: "red", marginBottom: 12 }}>{error}</p>}

      {loading && <p>{statusMsg || "Working on it..."}</p>}

      {imageUrl && !loading && (
        <img
          src={imageUrl}
          alt={prompt}
          style={{
            width: "100%",
            borderRadius: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        />
      )}
    </div>
  );
}