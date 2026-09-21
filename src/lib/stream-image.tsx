export async function streamImage(
  _endpoint: string,
  input: Record<string, unknown>,
  onFrame: (dataUrl: string, isFinal: boolean) => void,
  signal?: AbortSignal,
): Promise<void> {
  const prompt = String(input.prompt ?? "").trim();

  if (!prompt) {
    throw new Error("Please enter an image description.");
  }

  if (signal?.aborted) {
    throw new DOMException("Request aborted", "AbortError");
  }

  const style = String(input.style ?? "");
  const aspectRatio = String(input.aspectRatio ?? "1:1");

  let width = 1024;
  let height = 1024;

  switch (aspectRatio) {
    case "16:9":
      width = 1280;
      height = 720;
      break;

    case "9:16":
      width = 720;
      height = 1280;
      break;

    case "4:3":
      width = 1024;
      height = 768;
      break;

    case "3:4":
      width = 768;
      height = 1024;
      break;

    default:
      width = 1024;
      height = 1024;
  }

  const finalPrompt = style
    ? `${prompt}, ${style} style, high quality, detailed`
    : `${prompt}, high quality, detailed`;

  const encodedPrompt = encodeURIComponent(finalPrompt);

  const imageUrl =
    `https://image.pollinations.ai/prompt/${encodedPrompt}` +
    `?width=${width}&height=${height}&nologo=true`;

  try {
    const response = await fetch(imageUrl, {
      method: "GET",
      signal,
    });

    if (!response.ok) {
      throw new Error(
        `Image generation failed: ${response.status} ${response.statusText}`,
      );
    }

    const blob = await response.blob();

    if (!blob.type.startsWith("image/")) {
      throw new Error("The API did not return an image.");
    }

    const dataUrl = await blobToDataUrl(blob);

    if (signal?.aborted) {
      throw new DOMException("Request aborted", "AbortError");
    }

    onFrame(dataUrl, true);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    throw new Error(
      error instanceof Error
        ? error.message
        : "Image generation failed. Please try again.",
    );
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Unable to read generated image."));
      }
    };

    reader.onerror = () => {
      reject(new Error("Unable to process generated image."));
    };

    reader.readAsDataURL(blob);
  });
}