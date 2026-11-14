/**
 * Design-rendering checks for the studio's SVG builder.
 *
 * Run with: npm run check:design   (requires Node 22.6+ for type stripping)
 *
 * The important invariant is that no line of text overflows the label: SVG
 * `<text>` does not reflow, so a bad wrap shows up as clipped artwork in the
 * preview and in the downloaded file.
 */
import {
  DEFAULT_DESIGN,
  DEFAULT_TRANSFORMS,
  buildLabelSvg,
  computeLayout,
  contrastRatio,
  describeDesign,
  designToPrompt,
  isReadable,
  readableInkFor,
} from "../src/lib/label-design.ts";

let failures = 0;

function check(label, condition, detail = "") {
  if (!condition) failures++;
  console.log(`${condition ? "PASS" : "FAIL"}  ${label}${detail ? `  (${detail})` : ""}`);
}

/** Pull every `<text>` node out of the SVG and measure it the way the builder does. */
function inspect(svg) {
  const viewBox = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
  const width = Number(viewBox?.[1] ?? 0);

  const texts = [...svg.matchAll(/<text([^>]*)>([^<]*)<\/text>/g)].map((match) => {
    const attrs = match[1];
    const size = Number(attrs.match(/font-size="([\d.]+)"/)?.[1] ?? 0);
    const tracking = Number(attrs.match(/letter-spacing="([\d.]+)"/)?.[1] ?? 0);
    const y = Number(attrs.match(/y="([\d.]+)"/)?.[1] ?? 0);
    const content = match[2];
    // Must mirror estimateTextWidth: glyph advance + tracking between glyphs.
    const textWidth =
      content.length * size * 0.68 + Math.max(0, content.length - 1) * tracking;
    return { y, size, tracking, content, width: textWidth };
  });

  return {
    width,
    height: Number(viewBox?.[2] ?? 0),
    lines: texts.length,
    nodes: texts,
    widest: Math.max(0, ...texts.map((text) => text.width)),
    largest: Math.max(0, ...texts.map((text) => text.size)),
    smallest: Math.min(Infinity, ...texts.map((text) => text.size)),
    contents: texts.map((text) => text.content),
  };
}

/** Bounding box of the embedded artwork, when the design has one. */
function imageBox(svg) {
  const match = svg.match(
    /<g transform="translate\(([-\d.]+) ([-\d.]+)\) rotate\(([-\d.]+)\)"><image href="[^"]*" x="([-\d.]+)" y="([-\d.]+)" width="([\d.]+)" height="([\d.]+)"/
  );
  if (!match) return null;
  const [cx, cy, rotation, x, y, width, height] = match.slice(1).map(Number);
  return { cx, cy, rotation, x: cx + x, y: cy + y, width, height };
}

/** Inner edge of the decorative border, or 0 when there is no border. */
function borderInset(svg) {
  const match = svg.match(/<rect x="(\d+)" y="(\d+)" width="\d+" height="\d+"[^>]*fill="none"/);
  return match ? Number(match[1]) : 0;
}

// --- default design, 20 x 60 mm -------------------------------------------
const standard = buildLabelSvg(DEFAULT_DESIGN, { widthMm: 20, heightMm: 60 });
const standardInfo = inspect(standard);
check("default renders text", standardInfo.lines >= 1, `${standardInfo.lines} text nodes`);
check("default wraps to <= 4 nodes (3 brand + sub)", standardInfo.lines <= 4, `${standardInfo.lines} nodes`);
check("default text fits width", standardInfo.widest <= standardInfo.width, `${Math.round(standardInfo.widest)}px of ${standardInfo.width}px`);
check("brand text is legible", standardInfo.largest >= 60 * 8 * 0.05, `brand ${standardInfo.largest}px`);

// The lettering must sit inside the decorative border, not on top of it.
const standardInset = borderInset(standard);
check(
  "text stays inside the border",
  standardInfo.widest <= standardInfo.width - standardInset * 2,
  `${Math.round(standardInfo.widest)}px vs ${standardInfo.width - standardInset * 2}px usable (inset ${standardInset}px)`
);

// --- long brand name must still fit --------------------------------------
const longDesign = { ...DEFAULT_DESIGN, brandText: "THE EXTRAORDINARY COUTURE COLLECTIVE" };
const longSvg = buildLabelSvg(longDesign, { widthMm: 20, heightMm: 60 });
const longInfo = inspect(longSvg);
check("long brand fits width", longInfo.widest <= longInfo.width, `${Math.round(longInfo.widest)}px of ${longInfo.width}px`);

// --- wide label (the common 60 x 20 orientation) --------------------------
const wideSvg = buildLabelSvg(DEFAULT_DESIGN, { widthMm: 60, heightMm: 20 });
const wideInfo = inspect(wideSvg);
check("wide label fits width", wideInfo.widest <= wideInfo.width, `${Math.round(wideInfo.widest)}px of ${wideInfo.width}px`);

// --- uploaded artwork -----------------------------------------------------
// 1x1 transparent PNG — enough to prove the artwork is embedded and laid out.
const ARTWORK = {
  src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  name: "brand-mark.png",
};

const logoAbove = buildLabelSvg(
  { ...DEFAULT_DESIGN, logo: ARTWORK, logoLayout: "above" },
  { widthMm: 20, heightMm: 60, forExport: true }
);
const logoAboveInfo = inspect(logoAbove);
const logoAboveBox = imageBox(logoAbove);

check("artwork is embedded", Boolean(logoAboveBox));
check("artwork stays inside the label", logoAboveBox ? logoAboveBox.x >= 0 && logoAboveBox.y >= 0 && logoAboveBox.x + logoAboveBox.width <= logoAboveInfo.width + 0.5 : false);

const textTopAbove = Math.min(
  ...logoAboveInfo.nodes.map((node) => node.y - node.size * 0.8)
);
check(
  "text starts below the artwork",
  logoAboveBox ? textTopAbove >= logoAboveBox.y + logoAboveBox.height - 0.5 : false,
  `text top ${Math.round(textTopAbove)}px, artwork ends ${Math.round((logoAboveBox?.y ?? 0) + (logoAboveBox?.height ?? 0))}px`
);
check(
  "artwork is a self-contained data URL",
  logoAbove.includes('href="data:image/png;base64,') && logoAbove.split("http").length - 1 === 1
);

const logoOnlySvg = buildLabelSvg(
  { ...DEFAULT_DESIGN, logo: ARTWORK, logoLayout: "only" },
  { widthMm: 20, heightMm: 60, forExport: true }
);
const logoOnlyInfo = inspect(logoOnlySvg);
check("logo-only embeds the artwork", Boolean(imageBox(logoOnlySvg)));
check(
  "logo-only drops the brand line",
  !logoOnlyInfo.contents.some((line) => line.includes("COUTURE")),
  logoOnlyInfo.contents.join(" | ")
);

// --- manual canvas transforms --------------------------------------------
// A short brand on a roomy label, so a 4 mm nudge is nowhere near the border.
const shortDesign = { ...DEFAULT_DESIGN, brandText: "AB", subText: "" };
const offsetDesign = {
  ...shortDesign,
  transforms: { ...DEFAULT_TRANSFORMS, text: { x: 4, y: 3 } },
};
const offsetLayout = computeLayout(offsetDesign, { widthMm: 100, heightMm: 60 });
const plainLayout = computeLayout(shortDesign, { widthMm: 100, heightMm: 60 });
check(
  "offset moves the text box by millimetres",
  Boolean(offsetLayout.text && plainLayout.text) &&
    Math.abs(offsetLayout.text.box.x - plainLayout.text.box.x - 4 * 8) < 0.01 &&
    Math.abs(offsetLayout.text.box.y - plainLayout.text.box.y - 3 * 8) < 0.01,
  offsetLayout.text && plainLayout.text
    ? `dx ${(offsetLayout.text.box.x - plainLayout.text.box.x).toFixed(2)}, dy ${(offsetLayout.text.box.y - plainLayout.text.box.y).toFixed(2)}`
    : "missing text layer"
);

const plainArtwork = computeLayout({ ...DEFAULT_DESIGN, logo: ARTWORK }, { widthMm: 40, heightMm: 40 });
const scaledArtwork = computeLayout(
  {
    ...DEFAULT_DESIGN,
    logo: ARTWORK,
    transforms: { ...DEFAULT_TRANSFORMS, artwork: { offset: { x: 0, y: 0 }, scale: 1.6, rotate: 0 } },
  },
  { widthMm: 40, heightMm: 40 }
);
check(
  "scale grows the artwork box",
  Boolean(plainArtwork.artwork && scaledArtwork.artwork) &&
    Math.abs(scaledArtwork.artwork.box.width - plainArtwork.artwork.box.width * 1.6) < 0.5
);

const rotatedSvg = buildLabelSvg(
  {
    ...DEFAULT_DESIGN,
    logo: ARTWORK,
    transforms: { ...DEFAULT_TRANSFORMS, artwork: { offset: { x: 0, y: 0 }, scale: 1, rotate: 45 } },
  },
  { widthMm: 40, heightMm: 40, forExport: true }
);
check("rotation reaches the SVG", /rotate\(45\)/.test(rotatedSvg));

// A wild offset must be clamped, not allowed to leave the label.
const extremeTransforms = {
  text: { x: 400, y: -400 },
  sub: { x: -400, y: 400 },
  // 2.5x on a small label is deliberately larger than the label, which
  // exercises the "centre only" clamping path.
  artwork: { offset: { x: 400, y: 400 }, scale: 2.5, rotate: 0 },
};

let clampFailures = 0;
let oversizedChecked = 0;

const clampSizes = [10, 15, 20, 30, 45, 60, 90];

for (const widthMm of clampSizes) {
  for (const heightMm of clampSizes) {
    const layout = computeLayout(
      { ...DEFAULT_DESIGN, logo: ARTWORK, transforms: extremeTransforms },
      { widthMm, heightMm }
    );
    const boxes = [layout.text?.box, layout.sub?.box, layout.artwork?.box].filter(Boolean);
    const margin = 0.75;

    for (const box of boxes) {
      const fits =
        box.width <= layout.usableWidth + 0.5 && box.height <= layout.height - layout.inset * 2 + 0.5;

      if (fits) {
        const inside =
          box.x >= layout.inset - margin &&
          box.y >= layout.inset - margin &&
          box.x + box.width <= layout.width - layout.inset + margin &&
          box.y + box.height <= layout.height - layout.inset + margin;
        if (!inside) clampFailures++;
      } else {
        // Too big for the label: only its centre has to stay on the label.
        oversizedChecked++;
        const centreX = box.x + box.width / 2;
        const centreY = box.y + box.height / 2;
        if (centreX < 0 || centreX > layout.width || centreY < 0 || centreY > layout.height) {
          clampFailures++;
        }
      }
    }
  }
}

check("extreme offsets are clamped inside the label", clampFailures === 0, `${clampFailures} escapes, ${oversizedChecked} oversized`);
check("oversized elements are exercised", oversizedChecked > 0, `${oversizedChecked} centre-clamped`);

// --- XML escaping ---------------------------------------------------------
const nasty = buildLabelSvg(
  { ...DEFAULT_DESIGN, brandText: `Ben & Jerry's <Ltd>` },
  { widthMm: 40, heightMm: 20 }
);
check("escapes ampersand", nasty.includes("&amp;"));
check("escapes angle brackets", nasty.includes("&lt;Ltd&gt;"));
check("no raw markup injected", !nasty.includes("<Ltd>"));

// --- export vs preview ----------------------------------------------------
const exported = buildLabelSvg(DEFAULT_DESIGN, { widthMm: 20, heightMm: 60, forExport: true });
check("export has pixel size", /width="160" height="480"/.test(exported));
check("export avoids CSS variables", !exported.includes("var(--font"));
check("preview uses page fonts", standard.includes("var(--font"));

// --- contrast helpers -----------------------------------------------------
const ratio = contrastRatio("#121212", "#FFFFFF");
check("black/white contrast ~21", ratio > 18 && ratio < 22, ratio.toFixed(2));
check("low contrast flagged", isReadable({ ...DEFAULT_DESIGN, background: "#121212", ink: "#1A1A1A" }) === false);
check("high contrast accepted", isReadable({ ...DEFAULT_DESIGN, background: "#121212", ink: "#FAF9F6" }) === true);
check("auto ink is readable", isReadable({ ...DEFAULT_DESIGN, background: "#F5F5DC", ink: readableInkFor("#F5F5DC") }) === true);

// --- copy ----------------------------------------------------------------
const prompt = designToPrompt(DEFAULT_DESIGN, "Woven Labels", "20 × 60 mm");
check("prompt quotes the brand", prompt.includes(DEFAULT_DESIGN.brandText));
check("prompt mentions the size", prompt.includes("20 × 60 mm"));
check("summary lists the ground colour", describeDesign(DEFAULT_DESIGN).includes(DEFAULT_DESIGN.background));

// --- vertical bounds across many label sizes ------------------------------
// Property check: for every common label size, no line may sit above the top
// edge or drop below the bottom edge, and wrapped lines must not overlap.
const sizes = [10, 15, 20, 25, 30, 40, 50, 60, 75, 90];
const designs = [
  DEFAULT_DESIGN,
  { ...DEFAULT_DESIGN, brandText: "APEX APPAREL", subText: "" },
  { ...DEFAULT_DESIGN, brandText: "THE EXTRAORDINARY COUTURE COLLECTIVE", subText: "HANDMADE IN TIRUPUR" },
  { ...DEFAULT_DESIGN, font: "mono", align: "left" },
  { ...DEFAULT_DESIGN, font: "script", subText: "" },
  { ...DEFAULT_DESIGN, logo: ARTWORK, logoLayout: "above" },
  { ...DEFAULT_DESIGN, logo: ARTWORK, logoLayout: "above", subText: "" },
  { ...DEFAULT_DESIGN, logo: ARTWORK, logoLayout: "only" },
];

let outOfBounds = 0;
let outsideBorder = 0;
let overlapping = 0;
let artworkOverlap = 0;
let checked = 0;

for (const widthMm of sizes) {
  for (const heightMm of sizes) {
    for (const design of designs) {
      const svg = buildLabelSvg(design, { widthMm, heightMm, forExport: true });
      const box = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
      const w = Number(box?.[1] ?? 0);
      const h = Number(box?.[2] ?? 0);
      const inset = borderInset(svg);

      const nodes = [...svg.matchAll(/<text([^>]*)>([^<]*)<\/text>/g)].map((match) => {
        const attrs = match[1];
        const size = Number(attrs.match(/font-size="([\d.]+)"/)?.[1] ?? 0);
        const tracking = Number(attrs.match(/letter-spacing="([\d.]+)"/)?.[1] ?? 0);
        const y = Number(attrs.match(/y="([\d.]+)"/)?.[1] ?? 0);
        const content = match[2];
        return {
          y,
          size,
          width: content.length * size * 0.68 + Math.max(0, content.length - 1) * tracking,
        };
      });
      if (nodes.length === 0) continue;
      checked++;

      for (const node of nodes) {
        // Ascender above the top, descender below the bottom.
        if (node.y - node.size * 0.8 < -0.5 || node.y + node.size * 0.25 > h + 0.5) {
          outOfBounds++;
        }
        if (inset > 0 && node.width > w - inset * 2 + 0.5) {
          outsideBorder++;
        }
      }

      const baselines = nodes.map((node) => node.y).sort((a, b) => a - b);
      for (let index = 1; index < baselines.length; index++) {
        const gap = baselines[index] - baselines[index - 1];
        const size = nodes[index].size;
        // The sub-line is allowed to sit close to the brand block; brand lines
        // must keep a full line height between them.
        if (gap < size * 0.9) overlapping++;
      }

      const artBox = imageBox(svg);
      if (artBox && nodes.length > 0) {
        const textTop = Math.min(...nodes.map((node) => node.y - node.size * 0.8));
        if (textTop < artBox.y + artBox.height - 0.5) artworkOverlap++;
      }
    }
  }
}

check("checked a grid of label sizes", checked === sizes.length * sizes.length * designs.length, `${checked} renders`);
check("no text escapes the label", outOfBounds === 0, `${outOfBounds} out-of-bounds lines`);
check("no text crosses the border", outsideBorder === 0, `${outsideBorder} lines over the border`);
check("lines do not overlap", overlapping === 0, `${overlapping} collisions`);
check("text never overlaps the artwork", artworkOverlap === 0, `${artworkOverlap} collisions`);

// --- determinism ----------------------------------------------------------
check(
  "render is deterministic",
  buildLabelSvg(DEFAULT_DESIGN, { widthMm: 30, heightMm: 30 }) ===
    buildLabelSvg(DEFAULT_DESIGN, { widthMm: 30, heightMm: 30 })
);

console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
