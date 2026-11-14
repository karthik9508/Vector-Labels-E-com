/**
 * Manual label design: the single source of truth for the design studio.
 *
 * The studio has two ways to produce a look:
 *   1. the manual editor below (works offline, deterministic, exportable), and
 *   2. an AI concept image, which is seeded from this same design.
 *
 * The manual design is what actually gets manufactured, so it is the value
 * carried into the cart and the order — the AI image is reference artwork.
 */

export type LabelFont = "serif" | "sans" | "mono" | "script";
export type LabelBorder = "none" | "stitch" | "frame";
export type LabelAlign = "center" | "left";
/** Where the uploaded artwork sits relative to the brand text. */
export type LogoLayout = "above" | "only";

export interface LabelLogo {
  /** Self-contained data URL, embedded straight into the SVG. */
  src: string;
  name: string;
  /** Intrinsic width / height, when the browser could measure it. */
  aspect?: number;
}

/** Position offset in millimetres from the automatic layout. */
export interface LayerOffset {
  x: number;
  y: number;
}

/** Manual canvas edits, layered on top of the automatic layout. */
export interface DesignTransforms {
  text: LayerOffset;
  sub: LayerOffset;
  artwork: { offset: LayerOffset; scale: number; rotate: number };
}

export const DEFAULT_TRANSFORMS: DesignTransforms = {
  text: { x: 0, y: 0 },
  sub: { x: 0, y: 0 },
  artwork: { offset: { x: 0, y: 0 }, scale: 1, rotate: 0 },
};

/** Fresh copy — the default object must never be mutated by a drag. */
export function createDefaultTransforms(): DesignTransforms {
  return {
    text: { x: 0, y: 0 },
    sub: { x: 0, y: 0 },
    artwork: { offset: { x: 0, y: 0 }, scale: 1, rotate: 0 },
  };
}

export interface LabelDesign {
  /** Brand name woven or printed on the label. */
  brandText: string;
  /** Optional second line, e.g. "EST. 2026" or "100% ORGANIC COTTON". */
  subText: string;
  /** Label ground colour (hex). */
  background: string;
  /** Thread / ink colour (hex). */
  ink: string;
  font: LabelFont;
  border: LabelBorder;
  align: LabelAlign;
  /** Customer artwork, placed on the label when present. */
  logo?: LabelLogo;
  logoLayout: LogoLayout;
  /** Canvas edits; omitted means everything sits where the layout puts it. */
  transforms?: DesignTransforms;
}

export const DEFAULT_DESIGN: LabelDesign = {
  brandText: "THE COUTURE CO.",
  subText: "EST. 2026",
  background: "#121212",
  ink: "#D4AF37",
  font: "serif",
  border: "stitch",
  align: "center",
  logoLayout: "above",
  transforms: DEFAULT_TRANSFORMS,
};

export const FONT_STACKS: Record<
  LabelFont,
  { label: string; sample: string; css: string; exportStack: string }
> = {
  serif: {
    label: "Classic serif",
    sample: "Aa",
    css: "var(--font-playfair), Georgia, 'Times New Roman', serif",
    exportStack: "Georgia, 'Times New Roman', serif",
  },
  sans: {
    label: "Modern sans",
    sample: "Aa",
    css: "var(--font-outfit), Helvetica, Arial, sans-serif",
    exportStack: "Helvetica, Arial, sans-serif",
  },
  mono: {
    label: "Minimal mono",
    sample: "Aa",
    css: "ui-monospace, 'Courier New', monospace",
    exportStack: "'Courier New', monospace",
  },
  script: {
    label: "Luxury script",
    sample: "Aa",
    css: "var(--font-playfair), Georgia, serif",
    exportStack: "Georgia, 'Times New Roman', serif",
  },
};

/** Base colours offered per fabric, first entry is the default for that fabric. */
export const BACKGROUND_PALETTES: Record<string, string[]> = {
  "woven-labels": ["#121212", "#FAF9F6", "#C5A880", "#1E3A8A"],
  "cotton-labels": ["#F5F5DC", "#FAF9F6", "#D2B48C", "#3E2723"],
  "satin-labels": ["#121212", "#FAF9F6", "#800020", "#000080"],
  "taffeta-labels": ["#FFFFFF", "#121212", "#708090", "#2F4F4F"],
  "woven-patches": ["#121212", "#FAF9F6", "#C5A880", "#556B2F"],
  "hang-tags": ["#D4AF37", "#FAF9F6", "#121212", "#C5A880"],
  "heat-transfer": ["#121212", "#FAF9F6", "#D4AF37", "#FF4500"],
  "thanks-cards": ["#FAF9F6", "#D4AF37", "#121212", "#C5A880"],
};

export const INK_PALETTE = ["#FAF9F6", "#D4AF37", "#121212", "#C5A880", "#FFFFFF", "#8B0000"];

export interface DesignPreset {
  id: string;
  label: string;
  description: string;
  design: Partial<LabelDesign>;
}

/** One-click starting points that show off the manual editor. */
export const DESIGN_PRESETS: DesignPreset[] = [
  {
    id: "heritage",
    label: "Heritage",
    description: "Gold serif on black, framed",
    design: { font: "serif", border: "frame", align: "center", background: "#121212", ink: "#D4AF37" },
  },
  {
    id: "minimal",
    label: "Minimal",
    description: "Ink on ecru, no border",
    design: { font: "sans", border: "none", align: "center", background: "#F5F5DC", ink: "#121212" },
  },
  {
    id: "street",
    label: "Streetwear",
    description: "Mono type, stitched edge",
    design: { font: "mono", border: "stitch", align: "left", background: "#121212", ink: "#FAF9F6" },
  },
  {
    id: "couture",
    label: "Couture",
    description: "Script on cream, framed",
    design: { font: "script", border: "frame", align: "center", background: "#FAF9F6", ink: "#121212" },
  },
];

export function paletteFor(slug: string): string[] {
  return BACKGROUND_PALETTES[slug] ?? BACKGROUND_PALETTES["woven-labels"];
}

/* ------------------------------------------------------------------ */
/* Colour helpers                                                      */
/* ------------------------------------------------------------------ */

function channel(value: number): number {
  const ratio = value / 255;
  return ratio <= 0.03928 ? ratio / 12.92 : ((ratio + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean.split("").map((char) => char + char).join("")
      : clean.padEnd(6, "0").slice(0, 6);
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG-style contrast ratio between the ground and the thread colour. */
export function contrastRatio(background: string, ink: string): number {
  const a = luminance(background);
  const b = luminance(ink);
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}

/** True when the thread reads clearly at small label sizes. */
export function isReadable(design: LabelDesign): boolean {
  return contrastRatio(design.background, design.ink) >= 2.2;
}

/** The legible thread colour with the highest contrast against a ground. */
export function readableInkFor(background: string): string {
  const candidates = ["#FAF9F6", "#121212", "#D4AF37", "#C5A880"];
  return candidates.reduce(
    (best, candidate) =>
      contrastRatio(background, candidate) > contrastRatio(background, best) ? candidate : best,
    candidates[0]
  );
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/* ------------------------------------------------------------------ */
/* SVG rendering                                                       */
/* ------------------------------------------------------------------ */

export interface SvgOptions {
  widthMm: number;
  heightMm: number;
  /**
   * `true` when the SVG leaves the page (download / raster). The page's
   * webfonts are not available there, so an explicit fallback stack is used.
   */
  forExport?: boolean;
  /** Stretch to the container instead of a fixed pixel size. */
  fluid?: boolean;
}

const PX_PER_MM = 8;

/** Pixels per millimetre used by the SVG viewBox, exported for PNG export. */
export const SVG_PX_PER_MM = PX_PER_MM;

/** Average glyph advance, as a fraction of the font size, for our faces. */
const GLYPH_ADVANCE = 0.68;
/** Letter-spacing applied to the brand line and the sub-line. */
const BRAND_TRACKING = 0.12;
const SUB_TRACKING = 0.3;

/**
 * Advance width of a string, including letter-spacing. Text that ignores
 * tracking looks fine in the estimate and overlaps the border on screen.
 */
function estimateTextWidth(text: string, fontSize: number, tracking: number): number {
  const glyphs = text.length;
  return glyphs * fontSize * GLYPH_ADVANCE + Math.max(0, glyphs - 1) * fontSize * tracking;
}

/** Greedy word wrap for SVG <text> lines (SVG cannot reflow on its own). */
function wrapBrand(
  text: string,
  maxWidth: number,
  fontSize: number,
  tracking: number
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [text];
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (!current || estimateTextWidth(candidate, fontSize, tracking) <= maxWidth) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/**
 * Largest font size at which the brand text wraps to at most three lines and
 * every line fits the label width and height.
 */
function fitBrand(
  text: string,
  maxWidth: number,
  maxHeight: number,
  startCap: number,
  minSizeCap: number
): { size: number; lines: string[] } {
  const words = text.split(/\s+/).filter(Boolean);
  const longestWord = words.reduce((longest, word) => Math.max(longest, word.length), 1);

  // Never stop shrinking while a single word would still overflow the label.
  const widthFloor =
    maxWidth / (longestWord * GLYPH_ADVANCE + Math.max(0, longestWord - 1) * BRAND_TRACKING);
  const minSize = Math.max(1, Math.min(minSizeCap, widthFloor, maxHeight / 3));
  const startSize = Math.max(
    minSize,
    Math.min(startCap, maxHeight / 1.28, maxWidth * 0.55)
  );

  for (let size = startSize; size >= minSize; size *= 0.93) {
    const lines = wrapBrand(text, maxWidth, size, BRAND_TRACKING);
    if (lines.length > 3) continue;
    const widest = Math.max(
      ...lines.map((line) => estimateTextWidth(line, size, BRAND_TRACKING))
    );
    const blockHeight = lines.length * size * 1.28;
    if (widest <= maxWidth && blockHeight <= maxHeight) {
      return { size, lines };
    }
  }

  return {
    size: minSize,
    lines: wrapBrand(text, maxWidth, minSize, BRAND_TRACKING).slice(0, 3),
  };
}

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

export interface LabelBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TextLayerLayout {
  lines: string[];
  size: number;
  lineHeight: number;
  letterSpacing: number;
  anchor: "start" | "middle";
  /** Text x (anchor point), already offset by the manual transform. */
  x: number;
  /** Per-line baselines, already offset. */
  baselines: number[];
  /** Approximate visual bounds, used for hit-testing and selection. */
  box: LabelBox;
}

export interface ArtworkLayerLayout {
  box: LabelBox;
  cx: number;
  cy: number;
  rotation: number;
  scale: number;
}

export interface LabelLayout {
  /** SVG-space size in pixels (PX_PER_MM per millimetre). */
  width: number;
  height: number;
  inset: number;
  usableWidth: number;
  strokeWidth: number;
  text: TextLayerLayout | null;
  sub: TextLayerLayout | null;
  artwork: ArtworkLayerLayout | null;
}

function clampNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/** Two decimals is plenty for SVG coordinates and keeps exports readable. */
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Keep a layer inside the label.
 *
 * Offsets are millimetres and boxes are SVG pixels. Elements larger than the
 * usable area may overflow — those are clamped so their centre stays on the
 * label instead of being pinned to one edge.
 */
export function clampLayerOffset(
  offset: LayerOffset,
  baseBox: LabelBox,
  inset: number,
  width: number,
  height: number
): LayerOffset {
  const margin = 1;

  const axis = (value: number, start: number, size: number, total: number) => {
    const min = inset + margin - start;
    const max = total - inset - margin - start - size;
    if (min > max) {
      const centreMin = inset + margin - (start + size / 2);
      const centreMax = total - inset - margin - (start + size / 2);
      const low = Math.min(centreMin, centreMax) / PX_PER_MM;
      const high = Math.max(centreMin, centreMax) / PX_PER_MM;
      return clampNumber(value, low, high);
    }
    return clampNumber(value, min / PX_PER_MM, max / PX_PER_MM);
  };

  return {
    x: axis(offset.x, baseBox.x, baseBox.width, width),
    y: axis(offset.y, baseBox.y, baseBox.height, height),
  };
}

/**
 * Where every element sits.
 *
 * The renderer and the interactive canvas both read this, so a drag in the
 * canvas and the exported SVG can never disagree about a position.
 */
export function computeLayout(
  design: LabelDesign,
  options: { widthMm: number; heightMm: number }
): LabelLayout {
  const widthMm = Math.min(200, Math.max(5, options.widthMm));
  const heightMm = Math.min(300, Math.max(5, options.heightMm));
  const w = Math.round(widthMm * PX_PER_MM);
  const h = Math.round(heightMm * PX_PER_MM);

  const transforms = design.transforms ?? DEFAULT_TRANSFORMS;

  const brand = (design.brandText || "YOUR BRAND").trim().slice(0, 28);
  const sub = design.subText.trim().slice(0, 48);
  const hasSub = sub.length > 0;

  // Inset from the shortest side, and measured to the border rather than to
  // the label edge — the lettering must never sit on the stitch line.
  const inset = Math.max(4, Math.round(Math.min(w, h) * 0.07));
  const usableWidth = Math.max(8, w - inset * 2 - 4);

  // Uploaded artwork, when it should appear in the design.
  const logo = design.logo;
  const hasLogo = Boolean(logo?.src);
  const logoOnly = hasLogo && design.logoLayout === "only";

  // Vertical zones: the artwork takes a band, the lettering the space below.
  const logoBand = hasLogo
    ? logoOnly
      ? { top: h * 0.14, height: Math.max(h * 0.08, Math.min(h * 0.46, usableWidth * 0.65)) }
      : { top: h * 0.1, height: Math.max(h * 0.06, Math.min(h * 0.28, usableWidth * 0.4)) }
    : null;

  const textTop = logoBand ? logoBand.top + logoBand.height + h * 0.05 : h * 0.12;
  const textBottom = h * (hasSub ? 0.78 : 0.86);
  const zoneHeight = Math.max(h * 0.05, textBottom - textTop);

  // Wrap the brand text and shrink it until every line fits its zone.
  const { size: brandSize, lines } = logoOnly
    ? { size: 0, lines: [] as string[] }
    : logoBand
      ? fitBrand(
          brand,
          usableWidth,
          zoneHeight * 0.92,
          Math.min(zoneHeight * 0.6, h * 0.26),
          h * 0.035
        )
      : fitBrand(brand, usableWidth, h * (hasSub ? 0.5 : 0.66), h * (hasSub ? 0.3 : 0.38), h * 0.05);

  // The sub-line must fit the same width, so its floor is clamped by what the
  // text actually needs — a fixed minimum would overflow narrow labels.
  const subWidthLimit = usableWidth / Math.max(1, sub.length * (GLYPH_ADVANCE + SUB_TRACKING));
  const subPreferred = brandSize > 0 ? brandSize * 0.36 : h * 0.045;
  const subSize = Math.max(
    Math.min(h * 0.03, subWidthLimit),
    Math.min(subPreferred, subWidthLimit)
  );

  const anchor: "start" | "middle" = design.align === "left" ? "start" : "middle";
  const textX = design.align === "left" ? Math.round(w * 0.08) : Math.round(w / 2);

  const lineHeight = brandSize * 1.28;
  const blockHeight = lines.length * lineHeight;
  const blockTop = textTop + Math.max(0, (zoneHeight - blockHeight) / 2);
  const firstBaseline = blockTop + brandSize * 0.82;
  const blockBottom = firstBaseline + Math.max(0, lines.length - 1) * lineHeight;
  const subBaseline = logoOnly
    ? Math.min(h * 0.9, (logoBand?.top ?? h * 0.4) + (logoBand?.height ?? 0) + subSize * 1.8)
    : Math.min(h * 0.9, Math.max(blockBottom + brandSize * 0.8, textBottom + subSize * 0.45));

  // Manual offsets are stored in millimetres so they survive a size change,
  // and are clamped here so no layout — however the offsets were produced —
  // can push an element outside the label.
  const textWidth =
    lines.length > 0
      ? Math.max(...lines.map((line) => estimateTextWidth(line, brandSize, BRAND_TRACKING)))
      : 0;
  const textHeight = (lines.length - 1) * lineHeight + brandSize * 1.08;
  const textBaseX = anchor === "middle" ? textX - textWidth / 2 : textX;
  const textBaseY = firstBaseline - brandSize * 0.82;

  const textOffset = clampLayerOffset(
    transforms.text,
    { x: textBaseX, y: textBaseY, width: textWidth, height: textHeight },
    inset,
    w,
    h
  );
  const textShiftX = textOffset.x * PX_PER_MM;
  const textShiftY = textOffset.y * PX_PER_MM;

  const text: TextLayerLayout | null =
    lines.length > 0
      ? {
          lines,
          size: brandSize,
          lineHeight,
          letterSpacing: Number((brandSize * BRAND_TRACKING).toFixed(2)),
          anchor,
          x: textX + textShiftX,
          baselines: lines.map(
            (_, index) => firstBaseline + index * lineHeight + textShiftY
          ),
          box: {
            x: (anchor === "middle" ? textX - textWidth / 2 : textX) + textShiftX,
            y: firstBaseline - brandSize * 0.82 + textShiftY,
            width: textWidth,
            height: (lines.length - 1) * lineHeight + brandSize * 1.08,
          },
        }
      : null;

  const subWidth = hasSub ? estimateTextWidth(sub, subSize, SUB_TRACKING) : 0;
  const subBaseX = anchor === "middle" ? textX - subWidth / 2 : textX;
  const subBaseY = subBaseline - subSize * 0.82;
  const subOffset = clampLayerOffset(
    transforms.sub,
    { x: subBaseX, y: subBaseY, width: subWidth, height: subSize * 1.08 },
    inset,
    w,
    h
  );
  const subShiftX = subOffset.x * PX_PER_MM;
  const subShiftY = subOffset.y * PX_PER_MM;

  const subLayer: TextLayerLayout | null = hasSub
    ? {
        lines: [sub],
        size: subSize,
        lineHeight: subSize * 1.28,
        letterSpacing: Number((subSize * SUB_TRACKING).toFixed(2)),
        anchor,
        x: textX + subShiftX,
        baselines: [subBaseline + subShiftY],
        box: {
          x: subBaseX + subShiftX,
          y: subBaseY + subShiftY,
          width: subWidth,
          height: subSize * 1.08,
        },
      }
    : null;

  let artwork: ArtworkLayerLayout | null = null;
  if (logoBand && logo) {
    const scale = clampNumber(transforms.artwork.scale, 0.3, 2.5);
    const boxWidth = usableWidth * scale;
    const boxHeight = logoBand.height * scale;
    const baseCx = inset + 2 + usableWidth / 2;
    const baseCy = logoBand.top + logoBand.height / 2;

    const artworkOffset = clampLayerOffset(
      transforms.artwork.offset,
      {
        x: baseCx - boxWidth / 2,
        y: baseCy - boxHeight / 2,
        width: boxWidth,
        height: boxHeight,
      },
      inset,
      w,
      h
    );

    const cx = baseCx + artworkOffset.x * PX_PER_MM;
    const cy = baseCy + artworkOffset.y * PX_PER_MM;

    artwork = {
      box: { x: cx - boxWidth / 2, y: cy - boxHeight / 2, width: boxWidth, height: boxHeight },
      cx,
      cy,
      rotation: transforms.artwork.rotate,
      scale,
    };
  }

  return {
    width: w,
    height: h,
    inset,
    usableWidth,
    strokeWidth: Math.max(1, h * 0.008),
    text,
    sub: subLayer,
    artwork,
  };
}

/* ------------------------------------------------------------------ */
/* SVG                                                                 */
/* ------------------------------------------------------------------ */

/**
 * Render the design as a self-contained SVG.
 *
 * Inline in the page, `<text>` inherits the site's CSS font variables, so the
 * preview uses the real Playfair/Outfit faces. Exported files fall back to
 * system faces because webfonts are not embedded.
 */
export function buildLabelSvg(design: LabelDesign, options: SvgOptions): string {
  const layout = computeLayout(design, options);
  const { width: w, height: h, inset, strokeWidth } = layout;
  const text = layout.text;
  const sub = layout.sub;
  const artwork = layout.artwork;

  const stack = FONT_STACKS[design.font];
  const family = options.forExport ? stack.exportStack : stack.css;
  // A `style` declaration is required for `var(--font-…)` to resolve: CSS
  // custom properties inside a presentation attribute are ignored.
  const textStyle = ` style="font-family:${family};font-style:${
    design.font === "script" ? "italic" : "normal"
  }"`;

  const border =
    design.border === "stitch"
      ? `<rect x="${inset}" y="${inset}" width="${w - inset * 2}" height="${h - inset * 2}" rx="${Math.round(h * 0.02)}" fill="none" stroke="${escapeXml(design.ink)}" stroke-opacity="0.45" stroke-width="${strokeWidth}" stroke-dasharray="${Math.max(2, Math.round(h * 0.03))} ${Math.max(2, Math.round(h * 0.025))}" />`
      : design.border === "frame"
        ? `<rect x="${inset}" y="${inset}" width="${w - inset * 2}" height="${h - inset * 2}" fill="none" stroke="${escapeXml(design.ink)}" stroke-opacity="0.8" stroke-width="${Math.max(1.5, strokeWidth * 1.4)}" /><rect x="${inset + Math.round(h * 0.035)}" y="${inset + Math.round(h * 0.035)}" width="${w - (inset + Math.round(h * 0.035)) * 2}" height="${h - (inset + Math.round(h * 0.035)) * 2}" fill="none" stroke="${escapeXml(design.ink)}" stroke-opacity="0.35" stroke-width="1" />`
        : "";

  // Faint shading on the fold edges so the swatch reads as woven tape.
  const edge = Math.max(2, Math.round(w * 0.035));
  const edges = `<rect x="0" y="0" width="${edge}" height="${h}" fill="#000" opacity="0.12" /><rect x="${w - edge}" y="0" width="${edge}" height="${h}" fill="#000" opacity="0.12" />`;

  const artworkMarkup =
    artwork && design.logo
      ? `<g transform="translate(${round2(artwork.cx)} ${round2(artwork.cy)}) rotate(${artwork.rotation})"><image href="${design.logo.src}" x="${round2(-artwork.box.width / 2)}" y="${round2(-artwork.box.height / 2)}" width="${round2(artwork.box.width)}" height="${round2(artwork.box.height)}" preserveAspectRatio="xMidYMid meet" /></g>`
      : "";

  const textMarkup = text
    ? text.lines
        .map(
          (line, index) =>
            `<text x="${Math.round(text.x)}" y="${Math.round(text.baselines[index])}" text-anchor="${text.anchor}"${textStyle} font-size="${Math.round(text.size)}" font-weight="700" letter-spacing="${text.letterSpacing}" fill="${escapeXml(design.ink)}">${escapeXml(line)}</text>`
        )
        .join("\n  ")
    : "";

  const subMarkup = sub
    ? `<text x="${Math.round(sub.x)}" y="${Math.round(sub.baselines[0])}" text-anchor="${sub.anchor}"${textStyle} font-size="${Math.round(sub.size)}" font-weight="600" letter-spacing="${sub.letterSpacing}" fill="${escapeXml(design.ink)}" opacity="0.85">${escapeXml(sub.lines[0])}</text>`
    : "";

  const sizeAttributes = options.fluid
    ? 'width="100%" height="100%" style="display:block"'
    : `width="${w}" height="${h}"`;

  const labelName =
    design.logo && design.logoLayout === "only"
      ? design.logo.name
      : (design.brandText || "Your brand").trim();

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" ${sizeAttributes} preserveAspectRatio="xMidYMid meet" role="img" aria-label="${escapeXml(`${labelName} label design`)}">
  <rect width="${w}" height="${h}" fill="${escapeXml(design.background)}" />
  ${edges}
  ${border}
  ${artworkMarkup}
  ${textMarkup}
  ${subMarkup}
</svg>`;
}

/* ------------------------------------------------------------------ */
/* Text helpers                                                        */
/* ------------------------------------------------------------------ */

/** One-line description used in cart lines and WhatsApp messages. */
export function describeDesign(design: LabelDesign): string {
  const borderLabel =
    design.border === "stitch" ? "stitched border" : design.border === "frame" ? "framed border" : "no border";
  return [
    `Text: ${design.brandText || "—"}${design.subText ? ` / ${design.subText}` : ""}`,
    `Type: ${FONT_STACKS[design.font].label}`,
    `Ground ${design.background} · thread ${design.ink}`,
    borderLabel,
    `${design.align} aligned`,
    design.logo
      ? `Artwork: ${design.logo.name} (${design.logoLayout === "only" ? "logo only" : "above the text"})`
      : "No artwork",
  ].join(" · ");
}

/**
 * Prompt seed for the AI concept. It restates the manual design so the two
 * paths describe the same label instead of drifting apart.
 */
export function designToPrompt(design: LabelDesign, productTitle: string, sizeLabel: string): string {
  const hasArtwork = Boolean(design.logo?.src);
  return [
    hasArtwork
      ? `Place the supplied artwork onto a premium ${productTitle.toLowerCase()} and keep its shapes and lettering exactly as provided.`
      : `Premium ${productTitle.toLowerCase()} design for a fashion brand.`,
    hasArtwork ? null : `Lettering "${design.brandText || "brand name"}"${design.subText ? ` with the line "${design.subText}"` : ""}.`,
    `Artwork and lettering in ${design.ink} on a ${design.background} ground, ${FONT_STACKS[design.font].label.toLowerCase()} lettering.`,
    `${design.border === "stitch" ? "With a stitched border" : design.border === "frame" ? "With a fine framed border" : "Clean edge, no border"}, ${design.align === "left" ? "left-aligned" : "centre-aligned"} layout, ${sizeLabel}.`,
    "Macro product photography, realistic weave and thread texture, studio lighting.",
  ]
    .filter(Boolean)
    .join(" ");
}
