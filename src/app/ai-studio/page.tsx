"use client";

import React, { useState, useRef, useEffect } from "react";
import { PRODUCTS } from "@/data/products";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AIStudioPage() {
  const [prompt, setPrompt] = useState("Minimalist luxury clothing label for streetwear brand, gold foil on matte black damask weave");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [dailyGenerations, setDailyGenerations] = useState(0);
  const [limitReached, setLimitReached] = useState(false);

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<typeof PRODUCTS[0]>(PRODUCTS[0]);
  const [width, setWidth] = useState(20);
  const [height, setHeight] = useState(60);
  const [colorLayers, setColorLayers] = useState(2);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [resultImage, setResultImage] = useState<string | null>(null);
  const [resultSpecs, setResultSpecs] = useState<any>(null);
  const [conceptId, setConceptId] = useState<string | null>(null);
  const [shareableLink, setShareableLink] = useState<string | null>(null);

  useEffect(() => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const storedData = JSON.parse(localStorage.getItem("vector_ai_usage") || "{}");
      if (storedData.date === today) {
        setDailyGenerations(storedData.count || 0);
        if ((storedData.count || 0) >= 4) {
          setLimitReached(true);
        }
      } else {
        localStorage.setItem("vector_ai_usage", JSON.stringify({ date: today, count: 0 }));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file");
        return;
      }
      setUploadedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleProductSelect = (product: typeof PRODUCTS[0]) => {
    setSelectedProduct(product);
    setWidth(20);
    setHeight(60);
    setColorLayers(2);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (dailyGenerations >= 4) {
      setLimitReached(true);
      return;
    }

    setLoading(true);
    setIsConfirmed(false);
    setIsEditing(false);

    try {
      const formData = new FormData();
      formData.append("prompt", prompt);
      formData.append("product", selectedProduct.slug);
      formData.append("width", String(width));
      formData.append("height", String(height));
      formData.append("colorLayers", String(colorLayers));
      if (uploadedFile) {
        formData.append("logo", uploadedFile);
      }

      const response = await fetch("/api/ai/generate", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setResultImage(data.imageUrl);
        setConceptId(data.conceptId);
        setShareableLink(data.shareableUrl);
        setResultSpecs({ ...data.specs, product: selectedProduct.title, width, height, colorLayers });
        setGenerated(true);

        // Update count
        const newCount = dailyGenerations + 1;
        setDailyGenerations(newCount);
        const today = new Date().toISOString().split("T")[0];
        localStorage.setItem("vector_ai_usage", JSON.stringify({ date: today, count: newCount }));
        if (newCount >= 4) {
          setLimitReached(true);
        }
      } else {
        alert("Generation failed: " + data.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-luxury-cream text-luxury-charcoal">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
          <span className="text-xs uppercase font-bold tracking-[0.25em] text-luxury-gold">AI Concept Studio</span>
          <h1 className="text-3xl md:text-5xl font-bold font-serif text-luxury-charcoal">AI Label Design Generator</h1>
          <p className="text-xs text-gray-500 font-light">
            Select your product type, enter dimensions, upload your logo, and describe the style. Generate up to 4 concepts per day.
          </p>
          <div className="inline-block bg-luxury-gold/10 border border-luxury-gold/30 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold text-luxury-charcoal">
            Daily AI Usage: {dailyGenerations} / 4 generations used
          </div>
        </div>

        {limitReached && (
          <div className="max-w-3xl mx-auto mb-10 p-6 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 text-xs space-y-3 text-center shadow-md">
            <p className="font-bold text-sm">⚠️ Daily AI Generation Limit Reached (4 / 4)</p>
            <p className="font-light">
              You have reached your 4 free AI design generations for today. For bespoke, highly complex custom designs or bulk vector digitization, please contact our professional Tirupur design team directly.
            </p>
            <a
              href="https://wa.me/918608847513?text=Hi%20Vector%20Labels%20Team%2C%20I%20reached%20my%20daily%20AI%20generation%20limit%20and%20would%20like%20to%20connect%20with%20your%20design%20team%20for%20bespoke%20clothing%20labels."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-luxury-charcoal text-white hover:bg-luxury-gold hover:text-luxury-charcoal px-6 py-3 rounded-sm text-xs font-bold tracking-widest uppercase transition-all shadow-sm"
            >
              Contact Professional Design Team on WhatsApp →
            </a>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white p-8 md:p-12 rounded-xl shadow-xl border border-luxury-border max-w-5xl mx-auto">
          {/* Configuration Panel */}
          <div className="lg:col-span-6 space-y-6">
            <h3 className="text-lg font-serif font-bold text-luxury-charcoal border-b border-luxury-border pb-3">Configure Your Label</h3>

            <form onSubmit={handleGenerate} className="space-y-5">
              {/* Product Selection */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">Label Type / Material</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {PRODUCTS.map((p) => (
                    <button
                      key={p.slug}
                      type="button"
                      onClick={() => handleProductSelect(p)}
                      className={`px-4 py-3 text-xs font-semibold rounded-sm border text-center transition-all ${
                        selectedProduct.slug === p.slug
                          ? "border-luxury-gold bg-luxury-charcoal text-white shadow-md"
                          : "border-luxury-border text-luxury-charcoal hover:border-luxury-gold"
                      }`}
                    >
                      <p className="font-bold">{p.title}</p>
                      <p className="text-[9px] text-gray-400 mt-0.5">{p.tagline}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dimensions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">Width (mm)</label>
                  <input
                    type="number"
                    min={5}
                    max={200}
                    value={width}
                    onChange={(e) => setWidth(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 border border-luxury-border rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-luxury-gold bg-luxury-cream text-luxury-charcoal"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">Height / Length (mm)</label>
                  <input
                    type="number"
                    min={5}
                    max={300}
                    value={height}
                    onChange={(e) => setHeight(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 border border-luxury-border rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-luxury-gold bg-luxury-cream text-luxury-charcoal"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">Color Layers</label>
                  <select
                    value={colorLayers}
                    onChange={(e) => setColorLayers(parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-luxury-border rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-luxury-gold bg-luxury-cream text-luxury-charcoal"
                  >
                    <option value={1}>1 Color</option>
                    <option value={2}>2 Colors</option>
                    <option value={3}>3 Colors</option>
                    <option value={4}>4+ Colors</option>
                  </select>
                </div>
              </div>

              {/* Selected product specs */}
              <div className="p-4 bg-luxury-slate rounded border border-luxury-border space-y-2 text-xs text-gray-600">
                <p className="font-bold text-luxury-charcoal">Selected: {selectedProduct.title}</p>
                <p><strong>Material:</strong> {selectedProduct.specs.material}</p>
                <p><strong>MOQ:</strong> {selectedProduct.moq} pcs</p>
                <p><strong>Turnaround:</strong> {selectedProduct.delivery}</p>
                <p><strong>Fold Types:</strong> {selectedProduct.specs.foldTypes.join(", ")}</p>
              </div>

              {/* Logo Upload */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">Upload Logo / Artwork (Optional)</label>
                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${uploadedFile ? "border-luxury-gold bg-luxury-gold/5" : "border-luxury-border hover:border-luxury-gold"}`}>
                    {previewUrl ? (
                      <div className="relative max-w-xs mx-auto">
                        <img src={previewUrl} alt="Uploaded logo preview" className="max-h-32 rounded shadow-lg" />
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold hover:bg-red-600 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <span className="text-3xl">🎨</span>
                        <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Click or drag to upload logo</p>
                        <p className="text-[10px] text-gray-500">PNG, JPG, SVG up to 5MB</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Design Prompt */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">Design Prompt / Style Notes</label>
                <textarea
                  rows={4}
                  required
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full px-4 py-3 border border-luxury-border rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-luxury-gold bg-luxury-cream text-luxury-charcoal"
                  placeholder="e.g., Premium woven label with gold metallic threads on navy damask weave, end fold style, luxury streetwear aesthetic"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading || limitReached}
                className="w-full bg-luxury-charcoal text-white hover:bg-luxury-gold hover:text-luxury-charcoal py-4 text-xs font-bold tracking-widest uppercase transition-all rounded-sm shadow-md disabled:opacity-50"
              >
                {loading ? "Generating AI Concept..." : isEditing ? "Re-Generate Concept →" : "Generate Label Concept →"}
              </button>
            </form>
          </div>

          {/* AI Output / Render */}
          <div className="lg:col-span-6 bg-luxury-slate p-8 rounded-lg border border-luxury-border flex flex-col justify-center items-center text-center space-y-6">
            {loading ? (
              <div className="space-y-4 py-12">
                <div className="w-12 h-12 border-4 border-luxury-gold border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Synthesizing luxury weave patterns with your logo...</p>
              </div>
            ) : generated && resultImage ? (
              <div className="space-y-6 w-full">
                <div className="w-full h-52 bg-[#121212] rounded shadow-2xl flex flex-col items-center justify-center relative border border-luxury-gold/40 overflow-hidden">
                  <div className="absolute inset-2 border border-dashed border-luxury-gold/55 rounded-sm pointer-events-none"></div>
                  <img src={resultImage} alt="AI generated label" className="max-h-44 max-w-full object-contain" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
                  <h4 className="font-serif font-bold text-lg text-luxury-gold tracking-[0.2em] uppercase relative z-10">AI GENERATED CONCEPT</h4>
                  <p className="text-[8px] text-luxury-gold/70 tracking-[0.3em] uppercase mt-1 relative z-10">EST. 2026 • TIRUPUR</p>
                </div>

                {resultSpecs && (
                  <div className="p-4 bg-white rounded border border-luxury-border text-left space-y-2 text-xs text-gray-600">
                    <p className="font-bold text-luxury-charcoal">AI Specification:</p>
                    <p><strong>Product:</strong> {resultSpecs.product || selectedProduct.title}</p>
                    <p><strong>Dimensions:</strong> {resultSpecs.width || width} × {resultSpecs.height || height} mm</p>
                    <p><strong>Color Layers:</strong> {resultSpecs.colorLayers || colorLayers}</p>
                    <p><strong>Material:</strong> {resultSpecs.material || selectedProduct.specs.material}</p>
                    <p><strong>Background:</strong> {resultSpecs.bgColor || "#121212"}</p>
                    <p><strong>Text/Thread:</strong> {resultSpecs.textColor || "#D4AF37"}</p>
                    <p><strong>Logo Integrated:</strong> {resultSpecs.logoUploaded ? "Yes - " + (resultSpecs.logoName || "uploaded") : "No"}</p>
                  </div>
                )}

                {/* Confirm or Edit Step */}
                {!isConfirmed ? (
                  <div className="space-y-3 p-4 bg-white rounded border border-luxury-border shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wider text-luxury-charcoal">Review Generated Concept:</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setIsConfirmed(true)}
                        className="w-full bg-emerald-600 text-white hover:bg-emerald-700 py-3 rounded-sm text-xs font-bold tracking-widest uppercase transition-all shadow-md"
                      >
                        ✓ Confirm Design
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(true);
                          setGenerated(false);
                          // Scroll back to prompt form
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="w-full bg-luxury-charcoal text-white hover:bg-luxury-gold hover:text-luxury-charcoal py-3 rounded-sm text-xs font-bold tracking-widest uppercase transition-all shadow-md"
                      >
                        ✎ Edit Prompt / Specs
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded font-bold">
                      Design Confirmed &amp; Ready for Order!
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          const item = {
                            product: `${selectedProduct.title} - AI Confirmed Concept`,
                            specs: `Material: ${selectedProduct.specs.material}, Dimensions: ${width}×${height}mm, Colors: ${colorLayers}, Logo: ${uploadedFile ? uploadedFile.name : "No"}`,
                            price: Math.round((width * height * selectedProduct.baseRatePerSqMm * colorLayers * 1.1) * 1000),
                          };
                          try {
                            const existing = JSON.parse(localStorage.getItem("vector_cart") || "[]");
                            localStorage.setItem("vector_cart", JSON.stringify([...existing, item]));
                          } catch {
                            // ignore
                          }
                          alert("Confirmed concept added to cart successfully!");
                        }}
                        className="w-full bg-luxury-charcoal text-white hover:bg-luxury-gold hover:text-luxury-charcoal py-3.5 rounded-sm text-xs font-bold tracking-widest uppercase transition-all shadow-md"
                      >
                        Add to Cart
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const item = {
                            product: `${selectedProduct.title} - AI Confirmed Concept`,
                            specs: `Material: ${selectedProduct.specs.material}, Dimensions: ${width}×${height}mm, Colors: ${colorLayers}, Logo: ${uploadedFile ? uploadedFile.name : "No"}`,
                            price: Math.round((width * height * selectedProduct.baseRatePerSqMm * colorLayers * 1.1) * 1000),
                          };
                          try {
                            const existing = JSON.parse(localStorage.getItem("vector_cart") || "[]");
                            localStorage.setItem("vector_cart", JSON.stringify([...existing, item]));
                          } catch {
                            // ignore
                          }
                          window.location.href = "/checkout";
                        }}
                        className="w-full bg-luxury-gold text-luxury-charcoal hover:bg-white py-3.5 rounded-sm text-xs font-bold tracking-widest uppercase transition-all shadow-md"
                      >
                        Proceed to Checkout →
                      </button>
                    </div>
                    <a
                      href={resultImage || "/images/design_brand_label.png"}
                      download="vector-labels-ai-concept.png"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full block text-center bg-luxury-slate border border-luxury-border text-luxury-charcoal hover:bg-luxury-border py-3.5 rounded-sm text-xs font-bold tracking-widest uppercase transition-all shadow-sm"
                    >
                      📥 Download Generated Concept Image
                    </a>
                    <a
                      href={`https://wa.me/918608847513?text=${encodeURIComponent(`Hi Vector Labels Team, I confirmed an AI design concept using your website AI Studio. Here are the full specifications:

PRODUCT DETAILS:
- Product Type: ${selectedProduct.title}
- Material: ${selectedProduct.specs.material}
- Dimensions: ${width}mm × ${height}mm
- Color Layers: ${colorLayers}
- MOQ: ${selectedProduct.moq} pcs
- Turnaround: ${selectedProduct.delivery}

DESIGN SPECIFICATIONS:
- Background Color: ${resultSpecs?.bgColor || "#121212"}
- Text / Thread Color: ${resultSpecs?.textColor || "#D4AF37"}
- Fold Types: ${selectedProduct.specs.foldTypes.join(", ")}
- Logo File Name: ${uploadedFile ? uploadedFile.name : "None"}
- Ideal Application: ${selectedProduct.specs.idealFor}

DESIGN PROMPT / STYLE NOTES:
"${prompt}"

Please review this confirmed AI-generated label concept and manufacture it for my brand. I will attach the downloaded concept image directly in this chat! Looking forward to receiving the production proof!

Shareable concept link: ${shareableLink || `/ai-studio?concept=${conceptId || "generated"}`}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full block text-center bg-emerald-600 text-white hover:bg-emerald-700 py-3.5 rounded-sm text-xs font-bold tracking-widest uppercase transition-all shadow-md"
                    >
                      💬 Send Confirmed Concept to WhatsApp
                    </a>
                    <button
                      onClick={() => { setGenerated(false); setIsConfirmed(false); setResultImage(null); setResultSpecs(null); }}
                      className="w-full block text-center bg-transparent border border-luxury-border text-luxury-charcoal hover:bg-luxury-cream py-3.5 rounded-sm text-xs font-bold tracking-widest uppercase transition-all"
                    >
                      Generate Another Concept
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3 py-12">
                <span className="text-4xl">✨</span>
                <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Your AI-generated label concept will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
