import { NextResponse } from "next/server";
import { PRODUCTS, getProduct } from "@/data/products";
import { createClient } from "@/lib/supabase/server";

const MAX_LOGO_BYTES = 5 * 1024 * 1024;

/** Per-user daily AI generation limit. */
const DAILY_LIMIT_PER_USER = 4;

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

    if (prompt.length > 600) {
      return NextResponse.json(
        { success: false, error: "Please keep the design prompt under 600 characters." },
        { status: 400 }
      );
    }

    if (prompt.length < 3) {
      return NextResponse.json(
        { success: false, error: "Please enter at least a few words for the AI to work with." },
        { status: 400 }
      );
    }

    /* ---------------- per-user rate limit ---------------- */
    const supabase = await createClient();

    // Gracefully skip rate-limiting when the table/function haven't been
    // created yet — missing migrations must not block generation.
    let rateLimitOk = true;
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const userEmail = user?.email;
      const authenticated = !!userEmail;

      if (authenticated) {
        const todayDate = new Date().toISOString().slice(0, 10);

        // Read usage count; tolerate missing-table errors.
        const { data: existingRow, error: selectErr } = await supabase
          .from("user_ai_usage")
          .select("count")
          .eq("email", userEmail)
          .eq("date", todayDate)
          .maybeSingle();

        if (selectErr && !/schema cache|relation .* does not exist/i.test(selectErr.message)) {
          console.warn("AI usage select error:", selectErr.message);
        }

        const usedToday = existingRow?.count ?? 0;

        if (usedToday >= DAILY_LIMIT_PER_USER) {
          rateLimitOk = false;
        } else {
          // Atomically increment the counter.
          const { error: upsertErr } = await supabase.rpc("increment_user_ai_usage", {
            p_email: userEmail,
            p_date: todayDate,
          });
          if (upsertErr && !/schema cache|function .* does not exist/i.test(upsertErr.message)) {
            console.warn("Failed to increment AI usage counter:", upsertErr.message);
          }
        }
      }
    } catch (dbError) {
      // Don't let a Supabase outage block image generation.
      console.warn("Supabase rate-limit check skipped:", dbError instanceof Error ? dbError.message : dbError);
    }

    if (!rateLimitOk) {
      return NextResponse.json(
        {
          success: false,
          error: `You've reached the daily limit of ${DAILY_LIMIT_PER_USER} AI generations. Your counter resets tomorrow.`,
          limitReached: true,
        },
        { status: 429 }
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
    const logoBlob = logoFile instanceof File && logoFile.size > 0 ? logoFile : null;

    const designBrief = [
      brandText ? `Lettering "${brandText}"` : null,
      subText ? `secondary line "${subText}"` : null,
      `${ink} thread on a ${background} ground`,
      fontLabel ? `${fontLabel} typeface` : null,
    ]
      .filter(Boolean)
      .join(", ");

    const enhancedPrompt = `Professional product photography of a custom high-end ${product.title} for a luxury brand. ${prompt}. ${designBrief ? `${designBrief}. ` : ""}${logoInfo}. Dimensions: ${width}mm x ${height}mm, ${colorLayers} colour layers. Premium threads, detailed ${product.specs.material}, ultra-realistic macro shot, studio lighting, 4k.`;

    // The current OpenAI image API is text-to-image only (gpt-image-1).
    // When a logo is uploaded we describe it in the prompt.
    const logoDescription = logoBlob
      ? "The customer's uploaded logo/artwork is referenced in the design — incorporate its general style and shapes into the label concept."
      : "";

    const finalPrompt = `${enhancedPrompt} ${logoDescription}`.trim();

    let conceptImageUrl = conceptFallbackImage(productSlug);
    let generated = false;
    let source: "generations" | "fallback" = "fallback";
    let apiError: string | null = null;

    // Only call the image API when a real key is configured.
    const apiKey = process.env.AI_API_KEY;
    if (apiKey && apiKey.length > 10) {
      const openaiUrl = "https://api.openai.com/v1/images/generations";

      // Probe the OpenAI models endpoint to discover which image generation
      // models this account can actually use, then call the best one available.
      let usableModel: string | null = null;
      let usableSize: string = "1024x1024";

      try {
        const modelsResponse = await fetch("https://api.openai.com/v1/models", {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        if (modelsResponse.ok) {
          const modelsData = (await modelsResponse.json()) as {
            data?: { id: string }[];
          };
          const availableIds = new Set(
            (modelsData.data ?? []).map((m) => m.id.toLowerCase())
          );

          // Check models in preference order.
          const candidates = [
            { model: "gpt-image-1", size: "1024x1024" },
            { model: "gpt-image-1-mini", size: "1024x1024" },
            { model: "dall-e-3", size: "1024x1024" },
            { model: "dall-e-2", size: "1024x1024" },
          ];

          for (const c of candidates) {
            if (availableIds.has(c.model.toLowerCase())) {
              usableModel = c.model;
              usableSize = c.size;
              break;
            }
          }
        }
      } catch {
        // If the probe fails, we'll try gpt-image-1 anyway below and surface
        // the error to the user.
      }

      if (!usableModel) {
        usableModel = "gpt-image-1";
      }

      try {
        const aiResponse = await fetch(openaiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: usableModel,
            prompt: finalPrompt,
            n: 1,
            size: usableSize,
          }),
        });

        if (aiResponse.ok) {
          const aiData = (await aiResponse.json()) as {
            data?: { url?: string; b64_json?: string }[];
          };
          const first = aiData.data?.[0];
          if (first?.url) {
            conceptImageUrl = first.url;
            generated = true;
            source = "generations";
          } else if (first?.b64_json) {
            conceptImageUrl = `data:image/png;base64,${first.b64_json}`;
            generated = true;
            source = "generations";
          } else {
            apiError = "The AI returned an empty result.";
          }
        } else {
          const errText = await aiResponse.text().catch(() => "");
          const status = aiResponse.status;
          if (status === 401) {
            apiError = "Invalid OpenAI API key. Please check your configuration.";
          } else if (status === 429) {
            apiError = "OpenAI rate limit reached. Please try again in a moment.";
          } else if (status === 400 && /content_policy/i.test(errText)) {
            apiError = "Your design prompt was flagged by the content policy. Try rephrasing it.";
          } else if (status === 400 && /billing|quota|insufficient/i.test(errText)) {
            apiError = "OpenAI billing issue — please check your account has available credits.";
          } else {
            apiError = `OpenAI error (${usableModel}, status ${status}): ${errText.slice(0, 150)}`;
          }
          console.warn(`OpenAI error (${usableModel}):`, status, errText.slice(0, 300));
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        apiError = `Network error: ${msg}`;
        console.warn(`OpenAI request failed (${usableModel}):`, msg);
      }
    } else {
      apiError = "OpenAI API key not configured.";
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
        success: generated,
        conceptId: storedId,
        imageUrl: conceptImageUrl,
        generated,
        source,
        shareableUrl: `/ai-studio?concept=${storedId}`,
        promptUsed: enhancedPrompt,
        apiError,
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
      { status: generated ? 200 : 502 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
