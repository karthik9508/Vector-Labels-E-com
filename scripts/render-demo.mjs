/**
 * Prints a standalone HTML page containing several rendered label designs.
 * Used to eyeball the SVG output in a headless browser:
 *
 *   node --experimental-strip-types scripts/render-demo.mjs > demo.html
 *
 * (In this workspace the HTML is piped to Chrome's screenshot instead.)
 */
import { DEFAULT_DESIGN, buildLabelSvg } from "../src/lib/label-design.ts";

const cases = [
  { title: "default 20×60", design: DEFAULT_DESIGN, w: 20, h: 60 },
  {
    title: "heritage 30×30",
    design: { ...DEFAULT_DESIGN, font: "serif", border: "frame", background: "#121212", ink: "#D4AF37" },
    w: 30,
    h: 30,
  },
  {
    title: "minimal 60×20",
    design: {
      ...DEFAULT_DESIGN,
      font: "sans",
      border: "none",
      background: "#F5F5DC",
      ink: "#121212",
      brandText: "LOOM & LINEN",
      subText: "100% ORGANIC COTTON",
    },
    w: 60,
    h: 20,
  },
  {
    title: "street 50×30 left",
    design: {
      ...DEFAULT_DESIGN,
      font: "mono",
      border: "stitch",
      align: "left",
      background: "#1A1A1A",
      ink: "#FAF9F6",
      brandText: "APEX APPAREL",
      subText: "EST. 2019",
    },
    w: 50,
    h: 30,
  },
  {
    title: "long name 20×60",
    design: { ...DEFAULT_DESIGN, brandText: "THE EXTRAORDINARY COUTURE COLLECTIVE" },
    w: 20,
    h: 60,
  },
  {
    title: "script 40×25",
    design: {
      ...DEFAULT_DESIGN,
      font: "script",
      border: "frame",
      background: "#FAF9F6",
      ink: "#121212",
      brandText: "Couture Co.",
      subText: "HANDMADE IN TIRUPUR",
    },
    w: 40,
    h: 25,
  },
];

const cells = cases
  .map(
    (item) => `<figure>
  <div class="stage">
    ${buildLabelSvg(item.design, {
      widthMm: item.w,
      heightMm: item.h,
      forExport: true,
    })}
  </div>
  <figcaption>${item.title}</figcaption>
</figure>`
  )
  .join("\n");

process.stdout.write(`<!doctype html>
<html><head><meta charset="utf-8"><style>
  body { margin:0; padding:24px; background:#e0dcd3; font-family:system-ui,sans-serif; }
  .grid { display:flex; flex-wrap:wrap; gap:24px; align-items:flex-end; }
  figure { margin:0; display:flex; flex-direction:column; gap:8px; align-items:center; }
  .stage { background:#fff; padding:10px; border-radius:4px; box-shadow:0 6px 18px rgba(0,0,0,.15); display:flex; }
  figcaption { font-size:11px; letter-spacing:.08em; text-transform:uppercase; color:#555; }
  svg { display:block; }
</style></head>
<body><div class="grid">${cells}</div></body></html>`);
