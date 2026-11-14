"use client";

/**
 * Client-side file export helpers for the design studio.
 *
 * Everything is built from an SVG string, so no canvas library or network
 * request is involved and the export keeps working offline.
 */

function triggerDownload(href: string, filename: string): void {
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Revoke on the next tick so Safari has time to start the download.
  window.setTimeout(() => URL.revokeObjectURL(href), 2000);
}

function svgBlobUrl(svg: string): string {
  const blob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>\n${svg}`], {
    type: "image/svg+xml;charset=utf-8",
  });
  return URL.createObjectURL(blob);
}

/** Download the design as a vector SVG. */
export function downloadSvg(svg: string, filename: string): void {
  triggerDownload(svgBlobUrl(svg), filename);
}

/** Rasterise the SVG to a PNG at `scale`x and download it. */
export async function downloadPng(
  svg: string,
  filename: string,
  widthPx: number,
  heightPx: number,
  scale = 3
): Promise<void> {
  const url = svgBlobUrl(svg);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("Could not render the design."));
      element.src = url;
    });

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(widthPx * scale);
    canvas.height = Math.round(heightPx * scale);

    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is not supported in this browser.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png")
    );
    if (!blob) throw new Error("Could not export the PNG.");

    triggerDownload(URL.createObjectURL(blob), filename);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Safe file stem from a brand name, e.g. "THE COUTURE CO." -> "the-couture-co". */
export function fileStem(value: string, fallback = "vector-label"): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return slug || fallback;
}
