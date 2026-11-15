"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PRODUCTS, getProduct } from "@/data/products";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LabelCanvas, { type CanvasLayer } from "@/components/LabelCanvas";
import { createCartItem, useCart } from "@/lib/cart";
import { bumpUsage, useAiUsage } from "@/lib/ai-usage";
import { formatINR, formatQuantity, formatUnitPrice, quote } from "@/lib/pricing";
import { whatsappLink } from "@/lib/site";
import LoginGate from "@/components/LoginGate";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import {
  DEFAULT_DESIGN,
  DEFAULT_TRANSFORMS,
  DESIGN_PRESETS,
  FONT_STACKS,
  INK_PALETTE,
  SVG_PX_PER_MM,
  buildLabelSvg,
  createDefaultTransforms,
  describeDesign,
  designToPrompt,
  isReadable,
  paletteFor,
  readableInkFor,
  type DesignPreset,
  type LabelAlign,
  type LabelBorder,
  type LabelDesign,
  type LabelFont,
  type LogoLayout,
} from "@/lib/label-design";
import { logoToFile, prepareLogo } from "@/lib/logo-image";
import { downloadPng, downloadSvg, fileStem } from "@/lib/download";

const DAILY_LIMIT = 4;

const LAYER_LABEL: Record<CanvasLayer, string> = {
  text: "brand text",
  sub: "second line",
  artwork: "artwork",
};

const FIELD_CLASS =
  "w-full px-4 py-3 border border-luxury-border rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-luxury-gold bg-luxury-cream text-luxury-charcoal";
const LABEL_CLASS = "block text-xs font-bold uppercase tracking-widest text-gray-500";
const SMALL_LABEL = "block text-[10px] font-bold uppercase tracking-widest text-gray-500";

/** Normalised shape of a `/api/ai/generate` response. */
interface ConceptResult {
  imageUrl: string;
  generated: boolean;
  /** How the image was produced: from text prompt, or neither. */
  source: "generations" | "fallback";
  conceptId: string;
  specs?: { material?: string; moq?: number; leadTime?: string };
}

export default function DesignStudioPage() {
  const { add } = useCart();
  const router = useRouter();

  /* ---------------- product & batch ---------------- */
  const [slug, setSlug] = useState(PRODUCTS[0].slug);
  const product = getProduct(slug) ?? PRODUCTS[0];
  const pricing = product.pricing;
  const isPiecePriced = pricing.model === "piece";

  const [width, setWidth] = useState(20);
  const [height, setHeight] = useState(60);
  const [variantId, setVariantId] = useState(pricing.variants?.[0]?.id ?? "");
  const [colorLayers, setColorLayers] = useState(2);
  const [quantity, setQuantity] = useState(pricing.moq);

  const variant =
    pricing.variants?.find((item) => item.id === variantId) ?? pricing.variants?.[0];
  const previewWidth = isPiecePriced ? variant?.widthMm ?? 50 : width;
  const previewHeight = isPiecePriced ? variant?.heightMm ?? 90 : height;
  const sizeLabel = isPiecePriced
    ? variant?.label ?? "Standard"
    : `${width} × ${height} mm`;

  /* ---------------- manual design ---------------- */
  const [design, setDesign] = useState<LabelDesign>(DEFAULT_DESIGN);

  function updateDesign<K extends keyof LabelDesign>(key: K, value: LabelDesign[K]) {
    setDesign((current) => ({ ...current, [key]: value }));
  }

  function applyPreset(preset: DesignPreset) {
    setDesign((current) => ({ ...current, ...preset.design }));
  }

  function setGround(color: string) {
    setDesign((current) => ({
      ...current,
      background: color,
      // Keep the lettering legible when the ground changes.
      ink: isReadable({ ...current, background: color }) ? current.ink : readableInkFor(color),
    }));
  }

  /* ---------------- artwork ---------------- */
  const [fileError, setFileError] = useState<string | null>(null);
  const [preparingLogo, setPreparingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const artwork = design.logo;

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setFileError(null);
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setFileError("Please upload an image smaller than 5 MB.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setFileError("Please upload a PNG, JPG or SVG image.");
      return;
    }

    setPreparingLogo(true);
    try {
      const prepared = await prepareLogo(file);
      setDesign((current) => ({ ...current, logo: prepared }));
      setNotice("Artwork added to the design.");
    } catch {
      setFileError("That image could not be read. Try a PNG or JPG.");
    } finally {
      setPreparingLogo(false);
    }
  }

  function handleRemoveFile() {
    setDesign((current) => ({ ...current, logo: undefined }));
    setNotice(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  /* ---------------- ai concept ---------------- */
  const [controlTab, setControlTab] = useState<"design" | "ai">("design");
  const [previewTab, setPreviewTab] = useState<"design" | "ai">("design");
  const [promptOverride, setPromptOverride] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ConceptResult | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  /* ---------------- canvas history ---------------- */
  const [selectedLayer, setSelectedLayer] = useState<CanvasLayer | null>(null);
  const [past, setPast] = useState<LabelDesign[]>([]);
  const [future, setFuture] = useState<LabelDesign[]>([]);

  function pushHistory() {
    setPast((current) =>
      current[current.length - 1] === design ? current : [...current.slice(-39), design]
    );
    setFuture([]);
  }

  function undo() {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    setPast(past.slice(0, -1));
    setFuture([design, ...future].slice(0, 40));
    setDesign(previous);
  }

  function redo() {
    if (future.length === 0) return;
    const next = future[0];
    setFuture(future.slice(1));
    setPast([...past.slice(-39), design]);
    setDesign(next);
  }

  function resetLayout() {
    pushHistory();
    setDesign({ ...design, transforms: createDefaultTransforms() });
    setSelectedLayer(null);
  }

  /** Precise artwork adjustments from the toolbar sliders. */
  function setArtworkTransform(patch: Partial<{ scale: number; rotate: number }>) {
    const current = design.transforms ?? DEFAULT_TRANSFORMS;
    setDesign({
      ...design,
      transforms: { ...current, artwork: { ...current.artwork, ...patch } },
    });
  }

  // Ctrl/⌘+Z undo, Ctrl/⌘+Shift+Z redo. The handlers close over the latest
  // history, so they are read from a ref instead of re-binding the listener.
  const historyActions = useRef({ undo: () => {}, redo: () => {} });
  useEffect(() => {
    historyActions.current = { undo, redo };
  });
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "z") return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      event.preventDefault();
      if (event.shiftKey) historyActions.current.redo();
      else historyActions.current.undo();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const { email: userEmail } = useAuthGuard();
  const usage = useAiUsage(userEmail);
  const limitReached = usage.count >= DAILY_LIMIT;

  // Derived strings are cheap to rebuild, and the React Compiler memoises
  // them itself — manual useMemo here upset its dependency inference.
  const autoPrompt = designToPrompt(design, product.title, sizeLabel);
  const prompt = promptOverride ?? autoPrompt;

  /* ---------------- derived ---------------- */
  const estimate = useMemo(
    () =>
      quote({
        slug,
        quantity,
        widthMm: width,
        heightMm: height,
        colors: colorLayers,
        variantId: variantId || undefined,
      }),
    [slug, quantity, width, height, colorLayers, variantId]
  );

  const exportSvg = buildLabelSvg(design, {
    widthMm: previewWidth,
    heightMm: previewHeight,
    forExport: true,
  });

  const readable = isReadable(design);
  const fileBase = `${fileStem(design.brandText)}-${previewWidth}x${previewHeight}mm`;

  /* ---------------- actions ---------------- */
  function selectProduct(nextSlug: string) {
    const next = getProduct(nextSlug);
    if (!next) return;
    const nextVariant = next.pricing.variants?.[0];

    setSlug(next.slug);
    setQuantity(next.pricing.moq);
    setVariantId(nextVariant?.id ?? "");
    setColorLayers(1);
    setWidth(nextVariant?.widthMm ?? 20);
    setHeight(nextVariant?.heightMm ?? 60);

    // Adopt the new fabric's default ground, keeping the lettering readable.
    const ground = paletteFor(next.slug)[0];
    setDesign((current) => ({
      ...current,
      background: ground,
      ink: readableInkFor(ground),
    }));
  }

  async function handleGenerate(event: React.FormEvent) {
    event.preventDefault();
    if (usage.count >= DAILY_LIMIT) return;

    setLoading(true);
    setRequestError(null);
    setNotice(null);

    try {
      const formData = new FormData();
      formData.append("prompt", prompt);
      formData.append("product", slug);
      formData.append("width", String(previewWidth));
      formData.append("height", String(previewHeight));
      formData.append("colorLayers", String(colorLayers));
      formData.append("brandText", design.brandText);
      formData.append("subText", design.subText);
      formData.append("background", design.background);
      formData.append("ink", design.ink);
      formData.append("fontLabel", FONT_STACKS[design.font].label);

      // Send the prepared artwork metadata so the backend can reference the
      // customer's logo when building the prompt for the text-to-image model.
      const artworkFile = design.logo ? logoToFile(design.logo) : null;
      if (artworkFile) formData.append("logo", artworkFile);

      const response = await fetch("/api/ai/generate", { method: "POST", body: formData });
      const data = (await response.json()) as {
        success?: boolean;
        error?: string;
        apiError?: string;
        limitReached?: boolean;
        imageUrl?: string;
        generated?: boolean;
        source?: ConceptResult["source"];
        conceptId?: string;
        specs?: ConceptResult["specs"];
      };

      if (response.status === 429 || data.limitReached) {
        setRequestError(data.error ?? "You've reached the daily AI generation limit. Try again tomorrow.");
        return;
      }

      if (!data.generated && data.apiError) {
        setRequestError(data.apiError);
        return;
      }

      if (!response.ok || !data.success || !data.imageUrl) {
        setRequestError(data.error ?? data.apiError ?? "The concept could not be generated. Please try again.");
        return;
      }

      setResult({
        imageUrl: data.imageUrl,
        generated: Boolean(data.generated),
        source: data.source ?? "fallback",
        conceptId: data.conceptId ?? "generated",
        specs: data.specs,
      });
      setPreviewTab("ai");
      bumpUsage(userEmail);
    } catch {
      setRequestError("Network error — please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleAddToCart(goToCheckout: boolean) {
    const cartItem = createCartItem({
      slug,
      title: `${product.title} — ${design.brandText || "Custom design"}`,
      specs: [
        `Size: ${sizeLabel}`,
        `Qty: ${formatQuantity(estimate.quantity)} pcs`,
        `Colours: ${estimate.colors}`,
        describeDesign(design),
        result?.generated ? "AI concept generated" : null,
        `Unit price: ${formatUnitPrice(estimate.unitPrice)}`,
      ]
        .filter(Boolean)
        .join(" · "),
      quantity: estimate.quantity,
      unitPrice: estimate.unitPrice,
      swatch: { background: design.background, text: design.ink },
      conceptImageUrl: result?.imageUrl,
      conceptId: result?.conceptId,
      pricingRequest: {
        slug,
        quantity: estimate.quantity,
        widthMm: estimate.widthMm,
        heightMm: estimate.heightMm,
        colors: estimate.colors,
        variantId: variantId || undefined,
      },
    });
    add(cartItem);

    if (goToCheckout) {
      router.push("/checkout");
    } else {
      setNotice("Design added to your cart.");
      setPreviewTab("design");
    }
  }

  function handleDownloadSvg() {
    downloadSvg(exportSvg, `${fileBase}.svg`);
    setNotice("SVG downloaded.");
  }

  async function handleDownloadPng() {
    try {
      await downloadPng(
        exportSvg,
        `${fileBase}.png`,
        previewWidth * SVG_PX_PER_MM,
        previewHeight * SVG_PX_PER_MM,
        3
      );
      setNotice("PNG downloaded.");
    } catch {
      setNotice("PNG export failed — try the SVG, or take a screenshot.");
    }
  }

  const orderSummary = [
    `- Product: ${product.title}`,
    `- Size: ${sizeLabel}`,
    `- Quantity: ${formatQuantity(estimate.quantity)} pcs`,
    `- Colour layers: ${estimate.colors}`,
    `- ${describeDesign(design)}`,
    `- Logo: ${design.logo ? design.logo.name : "none"}`,
    `- Estimate: ${formatUnitPrice(estimate.unitPrice)} / pc · ${formatINR(estimate.total, 0)} total`,
  ].join("\n");

  const stageStyle: React.CSSProperties =
    previewWidth >= previewHeight
      ? { width: "17rem", height: "auto", maxWidth: "100%" }
      : { height: "15rem", width: "auto", maxHeight: "100%" };

  return (
    <div className="min-h-screen flex flex-col bg-luxury-cream text-luxury-charcoal">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto px-6 lg:px-12 py-16 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
          <span className="text-xs uppercase font-bold tracking-[0.25em] text-luxury-gold">
            Design studio
          </span>
          <h1 className="text-3xl md:text-5xl font-bold font-serif text-luxury-charcoal">
            Design your clothing label
          </h1>
          <p className="text-xs text-gray-500 font-light">
            Build it by hand — text, thread colour, typography and finish — and
            download the artwork in seconds. Want a starting point? Let the AI
            sketch a concept from your own design.
          </p>
          <p className="inline-block bg-luxury-gold/10 border border-luxury-gold/30 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold text-luxury-charcoal">
            {formatQuantity(usage.count)} of {DAILY_LIMIT} AI generations used today
          </p>
        </div>

        {limitReached ? (
          <div className="max-w-3xl mx-auto mb-10 p-5 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 text-xs space-y-2 text-center">
            <p className="font-bold text-sm">Today&#8217;s AI generations are used up</p>
            <p className="font-light">
              The manual design editor and artwork downloads still work. Our
              Tirupur design team can also digitise anything bespoke for you.
            </p>
            <a
              href={whatsappLink(
                "Hi Vector Labels Team, I would like help with a bespoke label design."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-luxury-charcoal text-white hover:bg-luxury-gold hover:text-luxury-charcoal px-6 py-3 rounded-sm text-xs font-bold tracking-widest uppercase transition-all shadow-sm"
            >
              Talk to the design team →
            </a>
          </div>
        ) : null}

        <LoginGate title="AI Design Studio" description="Sign in to design your labels, use AI concept generation, and see live pricing estimates.">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white p-6 md:p-10 rounded-xl shadow-xl border border-luxury-border max-w-6xl mx-auto items-start">
          {/* ---------------- controls ---------------- */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-luxury-charcoal border-b border-luxury-border pb-3">
                1. Product &amp; batch
              </h2>

              <div className="space-y-2">
                <label htmlFor="studio-product" className={LABEL_CLASS}>
                  Label type / material
                </label>
                <select
                  id="studio-product"
                  value={slug}
                  onChange={(event) => selectProduct(event.target.value)}
                  className={FIELD_CLASS}
                >
                  {PRODUCTS.map((item) => (
                    <option key={item.slug} value={item.slug}>
                      {item.title} — {item.tagline}
                    </option>
                  ))}
                </select>
              </div>

              {isPiecePriced ? (
                <div className="space-y-2">
                  <label htmlFor="studio-variant" className={LABEL_CLASS}>
                    Size / board stock
                  </label>
                  <select
                    id="studio-variant"
                    value={variantId}
                    onChange={(event) => setVariantId(event.target.value)}
                    className={FIELD_CLASS}
                  >
                    {(pricing.variants ?? []).map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label htmlFor="studio-width" className={LABEL_CLASS}>
                      Width (mm)
                    </label>
                    <input
                      id="studio-width"
                      type="number"
                      min={5}
                      max={200}
                      value={width}
                      onChange={(event) =>
                        setWidth(Math.min(200, Math.max(5, Number(event.target.value) || 5)))
                      }
                      className={FIELD_CLASS}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="studio-height" className={LABEL_CLASS}>
                      Height / length (mm)
                    </label>
                    <input
                      id="studio-height"
                      type="number"
                      min={5}
                      max={300}
                      value={height}
                      onChange={(event) =>
                        setHeight(Math.min(300, Math.max(5, Number(event.target.value) || 5)))
                      }
                      className={FIELD_CLASS}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label htmlFor="studio-colors" className={LABEL_CLASS}>
                    Colour layers
                  </label>
                  <select
                    id="studio-colors"
                    value={colorLayers}
                    onChange={(event) => setColorLayers(Number(event.target.value))}
                    className={FIELD_CLASS}
                  >
                    {[1, 2, 3, 4, 5, 6].map((count) => (
                      <option key={count} value={count}>
                        {count}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="studio-qty" className={LABEL_CLASS}>
                    Quantity (pcs)
                  </label>
                  <input
                    id="studio-qty"
                    type="number"
                    min={1}
                    step={pricing.moq >= 1000 ? 500 : 100}
                    value={quantity}
                    onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
                    className={FIELD_CLASS}
                  />
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div
              role="tablist"
              aria-label="Design method"
              className="flex gap-2 border-b border-luxury-border"
            >
              {(
                [
                  { id: "design", label: "2. Manual design" },
                  { id: "ai", label: "3. AI concept" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  id={`tab-${tab.id}`}
                  aria-selected={controlTab === tab.id}
                  aria-controls={`panel-${tab.id}`}
                  onClick={() => setControlTab(tab.id)}
                  className={`px-4 py-3 text-[11px] font-bold uppercase tracking-widest transition-colors border-b-2 -mb-px ${
                    controlTab === tab.id
                      ? "border-luxury-gold text-luxury-charcoal"
                      : "border-transparent text-gray-400 hover:text-luxury-charcoal"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {controlTab === "design" ? (
              <div
                role="tabpanel"
                id="panel-design"
                aria-labelledby="tab-design"
                className="space-y-5"
              >
                <div className="space-y-2">
                  <span className={SMALL_LABEL}>Start from a preset</span>
                  <div className="grid grid-cols-2 gap-2">
                    {DESIGN_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => applyPreset(preset)}
                        className="px-3 py-2.5 rounded-sm border border-luxury-border hover:border-luxury-gold text-left transition-colors"
                      >
                        <span className="block text-[11px] font-bold uppercase tracking-wider text-luxury-charcoal">
                          {preset.label}
                        </span>
                        <span className="block text-[9px] text-gray-400 mt-0.5">
                          {preset.description}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="design-brand" className={SMALL_LABEL}>
                      Brand name / main text
                    </label>
                    <input
                      id="design-brand"
                      type="text"
                      value={design.brandText}
                      maxLength={28}
                      onChange={(event) => updateDesign("brandText", event.target.value)}
                      placeholder="YOUR BRAND"
                      className={FIELD_CLASS}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="design-sub" className={SMALL_LABEL}>
                      Second line (optional)
                    </label>
                    <input
                      id="design-sub"
                      type="text"
                      value={design.subText}
                      maxLength={48}
                      onChange={(event) => updateDesign("subText", event.target.value)}
                      placeholder="EST. 2026 · 100% COTTON"
                      className={FIELD_CLASS}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <fieldset className="space-y-2">
                    <legend className={SMALL_LABEL}>Ground colour</legend>
                    <div className="flex flex-wrap items-center gap-2">
                      {paletteFor(slug).map((color) => (
                        <button
                          key={color}
                          type="button"
                          aria-label={`Ground colour ${color}`}
                          aria-pressed={design.background === color}
                          onClick={() => setGround(color)}
                          className={`w-7 h-7 rounded-full border-2 transition-transform ${
                            design.background === color
                              ? "border-luxury-gold scale-110 shadow"
                              : "border-luxury-border"
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                      <label
                        className="relative w-7 h-7 rounded-full border-2 border-dashed border-luxury-border cursor-pointer overflow-hidden"
                        title="Custom colour"
                      >
                        <span className="sr-only">Custom ground colour</span>
                        <input
                          type="color"
                          value={design.background}
                          onChange={(event) => setGround(event.target.value)}
                          className="absolute -inset-2 w-12 h-12 cursor-pointer border-0 p-0 bg-transparent"
                        />
                      </label>
                    </div>
                  </fieldset>

                  <fieldset className="space-y-2">
                    <legend className={SMALL_LABEL}>Thread / ink colour</legend>
                    <div className="flex flex-wrap items-center gap-2">
                      {INK_PALETTE.map((color) => (
                        <button
                          key={color}
                          type="button"
                          aria-label={`Thread colour ${color}`}
                          aria-pressed={design.ink === color}
                          onClick={() => updateDesign("ink", color)}
                          className={`w-7 h-7 rounded-full border-2 transition-transform ${
                            design.ink === color
                              ? "border-luxury-gold scale-110 shadow"
                              : "border-luxury-border"
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                      <label
                        className="relative w-7 h-7 rounded-full border-2 border-dashed border-luxury-border cursor-pointer overflow-hidden"
                        title="Custom colour"
                      >
                        <span className="sr-only">Custom thread colour</span>
                        <input
                          type="color"
                          value={design.ink}
                          onChange={(event) => updateDesign("ink", event.target.value)}
                          className="absolute -inset-2 w-12 h-12 cursor-pointer border-0 p-0 bg-transparent"
                        />
                      </label>
                    </div>
                  </fieldset>
                </div>

                <fieldset className="space-y-2">
                  <legend className={SMALL_LABEL}>Lettering / typography</legend>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(FONT_STACKS) as LabelFont[]).map((font) => (
                      <button
                        key={font}
                        type="button"
                        aria-pressed={design.font === font}
                        onClick={() => updateDesign("font", font)}
                        className={`px-3 py-2 text-xs font-semibold rounded-sm border transition-all ${
                          design.font === font
                            ? "border-luxury-gold bg-luxury-charcoal text-white"
                            : "border-luxury-border text-luxury-charcoal hover:border-luxury-gold"
                        }`}
                        style={{
                          fontFamily: FONT_STACKS[font].css,
                          fontStyle: font === "script" ? "italic" : "normal",
                        }}
                      >
                        {FONT_STACKS[font].label}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <div className="grid grid-cols-2 gap-4">
                  <fieldset className="space-y-2">
                    <legend className={SMALL_LABEL}>Border / finish</legend>
                    <div className="grid grid-cols-3 gap-2">
                      {(
                        [
                          { id: "stitch", label: "Stitch" },
                          { id: "frame", label: "Frame" },
                          { id: "none", label: "None" },
                        ] as { id: LabelBorder; label: string }[]
                      ).map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          aria-pressed={design.border === option.id}
                          onClick={() => updateDesign("border", option.id)}
                          className={`px-2 py-2 text-[10px] font-bold uppercase tracking-wider rounded-sm border transition-all ${
                            design.border === option.id
                              ? "border-luxury-gold bg-luxury-charcoal text-white"
                              : "border-luxury-border text-luxury-charcoal hover:border-luxury-gold"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  <fieldset className="space-y-2">
                    <legend className={SMALL_LABEL}>Alignment</legend>
                    <div className="grid grid-cols-2 gap-2">
                      {(
                        [
                          { id: "center", label: "Centre" },
                          { id: "left", label: "Left" },
                        ] as { id: LabelAlign; label: string }[]
                      ).map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          aria-pressed={design.align === option.id}
                          onClick={() => updateDesign("align", option.id)}
                          className={`px-2 py-2 text-[10px] font-bold uppercase tracking-wider rounded-sm border transition-all ${
                            design.align === option.id
                              ? "border-luxury-gold bg-luxury-charcoal text-white"
                              : "border-luxury-border text-luxury-charcoal hover:border-luxury-gold"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                </div>

                {!readable ? (
                  <p className="p-3 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-800">
                    Thread and ground are very close in tone. At small label sizes the
                    lettering may not read clearly — try a lighter thread or a darker ground.
                  </p>
                ) : null}

                <div className="space-y-2">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className={SMALL_LABEL}>Logo / artwork</span>
                    {artwork ? (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                        Placed on the label
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase tracking-widest text-gray-400">
                        Optional
                      </span>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      aria-label="Upload logo or artwork"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div
                      className={`border-2 border-dashed rounded-lg p-5 text-center transition-all ${
                        artwork
                          ? "border-luxury-gold bg-luxury-gold/5"
                          : "border-luxury-border hover:border-luxury-gold"
                      }`}
                    >
                      {preparingLogo ? (
                        <p className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold">
                          Preparing artwork…
                        </p>
                      ) : artwork ? (
                        <div className="relative max-w-xs mx-auto space-y-2">
                          <Image
                            src={artwork.src}
                            alt="Uploaded artwork"
                            width={220}
                            height={110}
                            unoptimized
                            className="max-h-28 w-auto mx-auto rounded shadow object-contain"
                          />
                          <p className="truncate text-[10px] text-gray-500">{artwork.name}</p>
                          <button
                            type="button"
                            onClick={handleRemoveFile}
                            aria-label="Remove uploaded artwork"
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <span aria-hidden="true" className="text-2xl">🎨</span>
                          <p className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold">
                            Upload your logo or design
                          </p>
                          <p className="text-[10px] text-gray-500">PNG, JPG or SVG up to 5 MB</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {fileError ? (
                    <p role="alert" className="text-[11px] text-red-600 font-semibold">
                      {fileError}
                    </p>
                  ) : null}

                  {artwork ? (
                    <fieldset className="space-y-2 pt-1">
                      <legend className={SMALL_LABEL}>Artwork placement</legend>
                      <div className="grid grid-cols-2 gap-2">
                        {(
                          [
                            { id: "above", label: "Above the text" },
                            { id: "only", label: "Logo only" },
                          ] as { id: LogoLayout; label: string }[]
                        ).map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            aria-pressed={design.logoLayout === option.id}
                            onClick={() => updateDesign("logoLayout", option.id)}
                            className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider rounded-sm border transition-all ${
                              design.logoLayout === option.id
                                ? "border-luxury-gold bg-luxury-charcoal text-white"
                                : "border-luxury-border text-luxury-charcoal hover:border-luxury-gold"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </fieldset>
                  ) : null}

                  <p className="text-[10px] text-gray-400 leading-relaxed">
                    Your artwork is placed on the live label and embedded in the SVG/PNG
                    you download. It is also sent to the AI concept generator as its input.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setDesign({
                      ...DEFAULT_DESIGN,
                      brandText: design.brandText,
                      logo: design.logo,
                      logoLayout: design.logoLayout,
                    })
                  }
                  className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-red-600"
                >
                  Reset styling
                </button>
              </div>
            ) : (
              <div
                role="tabpanel"
                id="panel-ai"
                aria-labelledby="tab-ai"
                className="space-y-4"
              >
                <form onSubmit={handleGenerate} className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between gap-3">
                      <label htmlFor="studio-prompt" className={LABEL_CLASS}>
                        Design prompt
                      </label>
                      {promptOverride !== null ? (
                        <button
                          type="button"
                          onClick={() => setPromptOverride(null)}
                          className="text-[10px] font-bold uppercase tracking-widest text-luxury-gold hover:underline"
                        >
                          Use my design
                        </button>
                      ) : null}
                    </div>
                    <textarea
                      id="studio-prompt"
                      rows={5}
                      maxLength={600}
                      value={prompt}
                      onChange={(event) => setPromptOverride(event.target.value)}
                      className={FIELD_CLASS}
                    />
                    <p className="text-[10px] text-gray-400 text-right">{prompt.length}/600</p>
                    <p className="text-[10px] text-gray-500 leading-relaxed">
                      The prompt is pre-filled from your manual design, so the AI concept
                      follows the same colours, wording and typeface. Edit it freely.
                    </p>
                    {artwork ? (
                      <p className="rounded border border-emerald-200 bg-emerald-50 p-2.5 text-[10px] leading-relaxed text-emerald-800">
                        <strong>{artwork.name}</strong> will be sent as the AI input, so the
                        concept is rendered from your own artwork rather than a description
                        of it.
                      </p>
                    ) : null}
                  </div>

                  {requestError ? (
                    <p role="alert" className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
                      {requestError}
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={loading || limitReached}
                    className="w-full bg-luxury-charcoal text-white hover:bg-luxury-gold hover:text-luxury-charcoal py-4 text-xs font-bold tracking-widest uppercase transition-all rounded-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Generating concept…" : "Generate AI concept →"}
                  </button>
                </form>

                {result ? (
                  <button
                    type="button"
                    onClick={() => {
                      setResult(null);
                      setPreviewTab("design");
                    }}
                    className="w-full border border-luxury-border text-luxury-charcoal hover:bg-luxury-cream py-3 rounded-sm text-[11px] font-bold tracking-widest uppercase transition-all"
                  >
                    Clear concept
                  </button>
                ) : null}

                <p className="text-[10px] text-gray-400 leading-relaxed">
                  {usage.count} of {DAILY_LIMIT} generations used today on this device.
                  The manual editor is always available, with no limit.
                </p>
              </div>
            )}
          </div>

          {/* ---------------- preview ---------------- */}
          <div className="lg:col-span-6 space-y-5">
            <div className="bg-luxury-slate p-5 rounded-lg border border-luxury-border space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex gap-1" role="tablist" aria-label="Preview">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={previewTab === "design"}
                    onClick={() => setPreviewTab("design")}
                    className={`px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-colors ${
                      previewTab === "design"
                        ? "bg-luxury-charcoal text-white"
                        : "text-gray-500 hover:text-luxury-charcoal"
                    }`}
                  >
                    Your design
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={previewTab === "ai"}
                    disabled={!result}
                    onClick={() => setPreviewTab("ai")}
                    className={`px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                      previewTab === "ai"
                        ? "bg-luxury-charcoal text-white"
                        : "text-gray-500 hover:text-luxury-charcoal"
                    }`}
                  >
                    AI concept
                  </button>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
                  {sizeLabel}
                </span>
              </div>

              {previewTab === "ai" && result ? (
                <div className="min-h-[15rem] bg-[#e0dcd3] rounded shadow-inner flex items-center justify-center p-4 overflow-hidden">
                  <div className="relative w-full max-h-60 flex items-center justify-center">
                    <Image
                      src={result.imageUrl}
                      alt="AI generated label concept"
                      width={480}
                      height={300}
                      unoptimized
                      className="max-h-56 w-auto object-contain rounded shadow-lg"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={undo}
                        disabled={past.length === 0}
                        aria-label="Undo"
                        title="Undo (Ctrl+Z)"
                        className="rounded-sm border border-luxury-border bg-white px-2.5 py-1.5 text-[11px] font-bold text-luxury-charcoal transition-colors hover:border-luxury-gold disabled:opacity-35"
                      >
                        ↶
                      </button>
                      <button
                        type="button"
                        onClick={redo}
                        disabled={future.length === 0}
                        aria-label="Redo"
                        title="Redo (Ctrl+Shift+Z)"
                        className="rounded-sm border border-luxury-border bg-white px-2.5 py-1.5 text-[11px] font-bold text-luxury-charcoal transition-colors hover:border-luxury-gold disabled:opacity-35"
                      >
                        ↷
                      </button>
                      <button
                        type="button"
                        onClick={resetLayout}
                        className="rounded-sm border border-luxury-border bg-white px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-luxury-charcoal transition-colors hover:border-luxury-gold"
                      >
                        Reset layout
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-1">
                      {(design.logo ? (["artwork", "text", "sub"] as CanvasLayer[]) : (["text", "sub"] as CanvasLayer[]))
                        .filter((layer) =>
                          layer === "artwork"
                            ? Boolean(design.logo)
                            : layer === "sub"
                              ? design.subText.trim().length > 0
                              : !(design.logo && design.logoLayout === "only")
                        )
                        .map((layer) => (
                          <button
                            key={layer}
                            type="button"
                            aria-pressed={selectedLayer === layer}
                            onClick={() => setSelectedLayer(selectedLayer === layer ? null : layer)}
                            className={`rounded-sm border px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                              selectedLayer === layer
                                ? "border-luxury-gold bg-luxury-charcoal text-white"
                                : "border-luxury-border bg-white text-luxury-charcoal hover:border-luxury-gold"
                            }`}
                          >
                            {LAYER_LABEL[layer]}
                          </button>
                        ))}
                    </div>
                  </div>

                  <p className="text-[10px] text-gray-400">
                    Drag an element on the label to move it · double-click to reset it ·
                    arrow keys nudge the selected layer
                  </p>

                  {selectedLayer === "artwork" && design.logo ? (
                    <div className="grid grid-cols-2 gap-3 rounded border border-luxury-border bg-white p-2.5">
                      <label className="space-y-1">
                        <span className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-gray-500">
                          <span>Size</span>
                          <span className="text-luxury-charcoal">
                            {(design.transforms ?? DEFAULT_TRANSFORMS).artwork.scale.toFixed(2)}×
                          </span>
                        </span>
                        <input
                          type="range"
                          min={0.3}
                          max={2.5}
                          step={0.05}
                          value={(design.transforms ?? DEFAULT_TRANSFORMS).artwork.scale}
                          onPointerDown={pushHistory}
                          onChange={(event) =>
                            setArtworkTransform({ scale: Number(event.target.value) })
                          }
                          className="w-full accent-luxury-gold"
                        />
                      </label>
                      <label className="space-y-1">
                        <span className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-gray-500">
                          <span>Rotate</span>
                          <span className="text-luxury-charcoal">
                            {Math.round((design.transforms ?? DEFAULT_TRANSFORMS).artwork.rotate)}°
                          </span>
                        </span>
                        <input
                          type="range"
                          min={0}
                          max={359}
                          step={1}
                          value={(design.transforms ?? DEFAULT_TRANSFORMS).artwork.rotate}
                          onPointerDown={pushHistory}
                          onChange={(event) =>
                            setArtworkTransform({ rotate: Number(event.target.value) })
                          }
                          className="w-full accent-luxury-gold"
                        />
                      </label>
                    </div>
                  ) : null}

                  <div className="min-h-[15rem] bg-[#e0dcd3] rounded shadow-inner flex items-center justify-center p-4 overflow-hidden">
                    <div
                      className="shadow-2xl overflow-hidden rounded-sm"
                      style={{ ...stageStyle, aspectRatio: `${previewWidth} / ${previewHeight}` }}
                    >
                      <LabelCanvas
                        design={design}
                        widthMm={previewWidth}
                        heightMm={previewHeight}
                        selected={selectedLayer}
                        onSelect={setSelectedLayer}
                        onChange={setDesign}
                        onGestureStart={pushHistory}
                      />
                    </div>
                  </div>
                </>
              )}

              {previewTab === "ai" && result ? (
                <p className="text-[10px] leading-relaxed text-gray-500">
                  {result.source === "generations"
                    ? "AI concept generated from your design prompt. It is reference artwork — the manufactured label follows the specification below."
                    : artwork
                      ? "AI image generation is not configured here, so this is a product-photo preview. Your artwork is already placed on the label in the \"Your design\" tab."
                      : "This is a reference preview from our product photography, because AI image generation is not configured. Our designers will draw the actual proof from your specification."}
                </p>
              ) : (
                <p className="text-[10px] leading-relaxed text-gray-500">
                  Live vector preview at {previewWidth} × {previewHeight} mm
                  {artwork ? ", with your artwork placed on it" : ""}. Download it as SVG
                  or PNG below — it is the same artwork our team starts from.
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleDownloadSvg}
                  className="flex-1 bg-white border border-luxury-border text-luxury-charcoal hover:border-luxury-gold py-2.5 px-3 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-colors"
                >
                  ⬇ SVG
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPng}
                  className="flex-1 bg-white border border-luxury-border text-luxury-charcoal hover:border-luxury-gold py-2.5 px-3 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-colors"
                >
                  ⬇ PNG
                </button>
                <Link
                  href={`/#calculator`}
                  className="flex-1 text-center bg-white border border-luxury-border text-luxury-charcoal hover:border-luxury-gold py-2.5 px-3 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-colors"
                >
                  Compare prices
                </Link>
              </div>
            </div>

            {/* Price */}
            <div className="bg-luxury-charcoal text-white p-5 rounded-lg border border-luxury-gold/30 space-y-3 shadow-md">
              <div className="flex justify-between items-center border-b border-white/10 pb-2 gap-3">
                <span className="text-[10px] uppercase font-bold tracking-[0.15em] text-luxury-gold">
                  Live price estimate
                </span>
                <span className="text-[10px] text-gray-300 font-semibold whitespace-nowrap">
                  MOQ {formatQuantity(pricing.moq)} pcs
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400">Per piece</p>
                  <p className="text-xl font-bold font-serif text-luxury-softgold">
                    {formatUnitPrice(estimate.unitPrice)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest text-gray-400">
                    Batch total
                  </p>
                  <p className="text-lg font-bold text-white">{formatINR(estimate.total, 0)}</p>
                </div>
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 border-t border-white/10 pt-2">
                <span>Production {estimate.leadTime}</span>
                <span>{formatQuantity(estimate.quantity)} pcs · {estimate.colors} colour(s)</span>
              </div>
              {!estimate.meetsMoq ? (
                <p className="text-[10px] text-amber-300 font-semibold">
                  Below the {formatQuantity(estimate.moq)} pc minimum — quoted as a custom run.
                </p>
              ) : null}
              {estimate.bulkSaving > 0 ? (
                <p className="text-[10px] text-emerald-400 font-semibold">
                  Bulk rate applied · saves {formatINR(estimate.bulkSaving, 0)}
                </p>
              ) : null}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {notice ? (
                <div
                  role="status"
                  className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded font-bold flex flex-wrap items-center justify-center gap-3"
                >
                  <span>{notice}</span>
                  <Link href="/cart" className="underline">
                    View cart →
                  </Link>
                </div>
              ) : null}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleAddToCart(false)}
                  className="w-full bg-luxury-gold text-luxury-charcoal hover:bg-white py-4 px-4 text-xs font-bold tracking-widest uppercase transition-all rounded-sm shadow-md"
                >
                  Add design to cart
                </button>
                <button
                  type="button"
                  onClick={() => handleAddToCart(true)}
                  className="w-full bg-luxury-charcoal text-white hover:bg-luxury-gold hover:text-luxury-charcoal py-4 px-4 text-xs font-bold tracking-widest uppercase transition-all rounded-sm shadow-md"
                >
                  Checkout →
                </button>
              </div>

              <a
                href={whatsappLink(
                  `Hi Vector Labels Team, I designed a label in your studio:\n\n${orderSummary}\n\n${result?.generated ? "I also generated an AI concept — I can attach the screenshot." : ""}\n\nPlease send a proof and final quotation.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block text-center bg-emerald-600 text-white hover:bg-emerald-700 py-3.5 rounded-sm text-[11px] font-bold tracking-widest uppercase transition-all shadow-sm"
              >
                💬 Send this design on WhatsApp
              </a>

              <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                Final pricing is confirmed on proof approval. Estimates exclude GST and courier.
              </p>
            </div>
          </div>
        </div>
        </LoginGate>
      </div>

      <Footer />
    </div>
  );
}
