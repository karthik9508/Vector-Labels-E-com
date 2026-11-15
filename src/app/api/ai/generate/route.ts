import { NextResponse } from "next/server";
import { PRODUCTS, getProduct } from "@/data/products";
import { createClient } from "@/lib/supabase/server";

const MAX_LOGO_BYTES = 5 * 1024 * 1024;

/** Formats accepted by the `images/edits` endpoint. */
const EDITABLE_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

/** Product photo used as a fallback concept when no AI key is configured. */
function conceptFallbackImage(slug: string): string {
  return getProduct(slug)?.image ?? "/images/design_brand_label.png";
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const prompt = (formData.get("prompt") as string | null)?.trim() || "Minimalist luxury clothing label";
    const productSlug = (formData.get("product") as string | null) || PRODUCTS[0].slug;
    const width = Number(formData.get("width")) || 20;
    const height = Number(formData.get("height")) || 60;
    const colorLayers = Number(formData.get("colorLayers")) || 2;
    const logoFile = formData.get("logo");

    // Manual design settings, so the AI concept describes the same label the
    // customer built in the editor rather than drifting away from it.
    const asText = (key: string, max: number) =>
      ((formData.get(key) as string | null) ?? "").trim().slice(0, max);
    const asHex = (key: string, fallback: string) => {
      const value = asText(key, 9);
      return /^#[0-9a-fA-F]{3,8}$/.test(value) ? value : fallback;
    };

    const brandText = asText("brandText", 40);
    const subText = asText("subText", 60);
    const background = asHex("background", "#121212");
    const ink = asHex("ink", "#D4AF37");
    const fontLabel = asText("fontLabel", 40);

    const product = getProduct(productSlug);
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Unknown product type." },
        { status: 400 }
      );
    }

    if (prompt.length > 500) {
      return NextResponse.json(
        { success: false, error: "Please keep the design prompt under 500 characters." },
        { status: 400 }
      );
    }

    let logoName: string | null = null;
    let logoInfo = "No logo uploaded";
    if (logoFile instanceof File && logoFile.size > 0) {
      if (logoFile.size > MAX_LOGO_BYTES) {
        return NextResponse.json(
          { success: false, error: "Logo must be smaller than 5 MB." },
          { status: 400 }
        );
      }
      if (!logoFile.type.startsWith("image/")) {
        return NextResponse.json(
          { success: false, error: "Logo must be an image file." },
          { status: 400 }
        );
      }
      logoName = logoFile.name;
      logoInfo = `Logo uploaded: ${logoFile.name} (${logoFile.type}, ${Math.round(logoFile.size / 1024)}KB)`;
    }

    const designBrief = [
      brandText ? `Lettering "${brandText}"` : null,
      subText ? `secondary line "${subText}"` : null,
      `${ink} thread on a ${background} ground`,
      fontLabel ? `${fontLabel} typeface` : null,
    ]
      .filter(Boolean)
      .join(", ");

    const enhancedPrompt = `Professional product photography of a custom high-end ${product.title} for a luxury brand. ${prompt}. ${designBrief ? `${designBrief}. ` : ""}${logoInfo}. Dimensions: ${width}mm x ${height}mm, ${colorLayers} colour layers. Premium threads, detailed ${product.specs.material}, ultra-realistic macro shot, studio lighting, 4k.`;

    // The edits endpoint takes the customer's artwork as input; generations is
    // text-only. Keep the artwork's own shapes intact rather than redrawing it.
    const editPrompt = `Use the supplied artwork as the finished design of a high-end ${product.title}. Preserve the artwork's shapes, lettering and proportions exactly — do not redraw or restyle it. Render it as premium ${ink} thread or print on a ${background} ground, ${width}mm x ${height}mm, ${colorLayers} colour layers. ${prompt}. Ultra-realistic macro product photography, realistic weave texture, studio lighting, 4k.`;

    let conceptImageUrl = conceptFallbackImage(productSlug);
    let generated = false;
    let source: "edits" | "generations" | "fallback" = "fallback";

    const logoBlob = logoFile instanceof File && logoFile.size > 0 ? logoFile : null;

    // Only call the image API when a real key is configured.
    const apiKey = process.env.AI_API_KEY;
    if (apiKey && apiKey.length > 10) {
      const recraftUrl = "https://external.api.recraft.ai/v1/images/generations";

      try {
        let aiResponse: Response;

        if (logoBlob && EDITABLE_IMAGE_TYPES.has(logoBlob.type)) {
          const body = new FormData();
          body.append("prompt", editPrompt);
          body.append("image", logoBlob, logoBlob.name);
          body.append("size", "1024x1024");
          body.append("n", "1");

          aiResponse = await fetch(recraftUrl, {
            method: "POST",
            headers: { Authorization: `Bearer ${apiKey}` },
            body,
          });
        } else {
          aiResponse = await fetch(recraftUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              prompt: enhancedPrompt,
              size: "1024x1024",
              n: 1,
            }),
          });
        }

        if (aiResponse.ok) {
          const aiData = (await aiResponse.json()) as {
            data?: { url?: string; b64_json?: string }[];
          };
          const first = aiData.data?.[0];
          if (first?.url) {
            conceptImageUrl = first.url;
            generated = true;
          } else if (first?.b64_json) {
            conceptImageUrl = `data:image/png;base64,${first.b64_json}`;
            generated = true;
          }
          if (generated) {
            source = logoBlob && EDITABLE_IMAGE_TYPES.has(logoBlob.type) ? "edits" : "generations";
          }
        } else {
          const errText = await aiResponse.text().catch(() => "");
          console.warn("Recraft request returned status", aiResponse.status, errText.slice(0, 200));
        }
      } catch (error) {
        console.warn(
          "Image request failed, using the product photo instead:",
          error instanceof Error ? error.message : error
        );
      }
    }

    const conceptId = `concept-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

    let storedId = conceptId;

    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("ai_concepts")
        .insert({
          id: conceptId,
          prompt,
          product_slug: productSlug,
          width,
          height,
          color_layers: colorLayers,
          image_url: conceptImageUrl,
          logo_name: logoName,
          enhanced_prompt: enhancedPrompt,
          status: "generated",
        })
        .select("id")
        .single();

      if (error) {
        console.warn("Supabase ai_concepts insert skipped:", error.message);
      } else if (data?.id) {
        storedId = data.id as string;
      }
    } catch (dbError) {
      console.warn(
        "Supabase storage skipped:",
        dbError instanceof Error ? dbError.message : dbError
      );
    }

    return NextResponse.json(
      {
        success: true,
        conceptId: storedId,
        imageUrl: conceptImageUrl,
        /** True only when the image actually came from the image model. */
        generated,
        /** How the image was produced: from the artwork, from text, or neither. */
        source,
        shareableUrl: `/ai-studio?concept=${storedId}`,
        promptUsed: enhancedPrompt,
        specs: {
          product: product.title,
          material: product.specs.material,
          width,
          height,
          colorLayers,
          moq: product.pricing.moq,
          leadTime: product.pricing.leadTime,
          brandText,
          subText,
          background,
          ink,
          fontLabel,
          logoUploaded: Boolean(logoName),
          logoName,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
