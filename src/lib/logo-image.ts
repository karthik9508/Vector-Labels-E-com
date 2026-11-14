"use client";

import type { LabelLogo } from "@/lib/label-design";

/**
 * Prepare an uploaded artwork file for the design studio.
 *
 * The raw file can be several megabytes; embedding it directly would bloat
 * every re-render of the SVG and every download. We decode it, downscale to a
 * sensible label size and re-encode as PNG, which also converts SVG uploads
 * into a format the AI edit endpoint accepts.
 */

const MAX_EDGE = 360;

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("The file could not be read."));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("The image could not be decoded."));
    image.src = src;
  });
}

export async function prepareLogo(file: File): Promise<LabelLogo> {
  const dataUrl = await readAsDataUrl(file);

  try {
    const image = await loadImage(dataUrl);
    const naturalWidth = image.naturalWidth || image.width;
    const naturalHeight = image.naturalHeight || image.height;
    if (!naturalWidth || !naturalHeight) throw new Error("Empty image.");

    const scale = Math.min(1, MAX_EDGE / Math.max(naturalWidth, naturalHeight));
    const width = Math.max(1, Math.round(naturalWidth * scale));
    const height = Math.max(1, Math.round(naturalHeight * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is unavailable.");

    context.drawImage(image, 0, 0, width, height);

    return {
      src: canvas.toDataURL("image/png"),
      name: file.name,
      aspect: width / height,
    };
  } catch {
    // SVG with external references, or a browser without canvas: keep the
    // original so the artwork still appears on the label.
    return { src: dataUrl, name: file.name };
  }
}

/** Turn the prepared data URL back into a File for the AI upload. */
export function logoToFile(logo: LabelLogo): File | null {
  const match = /^data:([^;,]+);base64,([\s\S]*)$/.exec(logo.src);
  if (!match) return null;

  try {
    const [, mime, base64] = match;
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    const baseName = logo.name.replace(/\.[^.]+$/, "") || "artwork";
    return new File([bytes], `${baseName}.png`, { type: mime });
  } catch {
    return null;
  }
}
