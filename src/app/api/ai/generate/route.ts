import { NextResponse } from 'next/server';
import { PRODUCTS } from '@/data/products';
import { createClient } from '@/lib/supabase/server';

const PRODUCT_IMAGE_MAP: Record<string, string> = {
  'woven-labels': '/images/woven_label_photo.png',
  'satin-labels': '/images/satin_label_photo.png',
  'cotton-labels': '/images/cotton_label_photo.png',
  'hang-tags': '/images/hangtag_photo.png',
  'heat-transfer-stickers': '/images/heattransfer_photo.png',
  'woven-patches': '/images/woven_patch_photo.png',
  'taffeta-labels': '/images/taffeta_label_photo.png',
  'photo-cards': '/images/photocard_photo.png',
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const prompt = formData.get('prompt') as string || 'Minimalist luxury clothing label';
    const productSlug = formData.get('product') as string || 'woven-labels';
    const width = formData.get('width') as string || '20';
    const height = formData.get('height') as string || '60';
    const colorLayers = formData.get('colorLayers') as string || '2';
    const logoFile = formData.get('logo') as File | null;

    const product = PRODUCTS.find((p) => p.slug === productSlug) || PRODUCTS[0];

    let logoInfo = 'No logo uploaded';
    if (logoFile) {
      logoInfo = `Logo uploaded: ${logoFile.name} (${logoFile.type}, ${Math.round(logoFile.size / 1024)}KB)`;
    }

    // Construct detailed generation prompt for clothing label manufacturing
    const enhancedPrompt = `Professional product photography of a custom high-end ${product.title} for luxury brand. ${prompt}. ${logoInfo}. Dimensions: ${width}mm x ${height}mm, ${colorLayers} color layers. Premium threads, detailed ${product.specs.material}, ultra-realistic macro shot, studio lighting, 4k.`;

    let conceptImageUrl = PRODUCT_IMAGE_MAP[productSlug] || '/images/design_brand_label.png';

    // Attempt OpenAI DALL-E 3 generation if API key is configured and valid
    const apiKey = process.env.AI_API_KEY;
    if (apiKey && apiKey !== 'your-ai-api-key' && apiKey.startsWith('sk-')) {
      try {
        const aiResponse = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: process.env.AI_MODEL || 'gpt-image-2',
            prompt: enhancedPrompt,
            n: 1,
            size: '1024x1024',
            quality: 'hd',
            style: 'natural',
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          if (aiData.data && aiData.data[0]?.url) {
            conceptImageUrl = aiData.data[0].url;
          }
        } else {
          console.warn('OpenAI DALL-E generation returned status:', aiResponse.status);
        }
      } catch (aiErr: any) {
        console.warn('OpenAI DALL-E generation failed, falling back to curated product showcase:', aiErr?.message);
      }
    }

    // Generate a unique concept ID
    const conceptId = `concept-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

    // Store generated concept in Supabase database
    let storedConcept: any = {
      id: conceptId,
      prompt,
      productSlug,
      width: parseInt(width) || 20,
      height: parseInt(height) || 60,
      colorLayers: parseInt(colorLayers) || 2,
      imageUrl: conceptImageUrl,
      logoName: logoFile?.name || null,
      enhancedPrompt,
      createdAt: new Date().toISOString(),
    };

    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('ai_concepts')
        .insert({
          id: conceptId,
          prompt: prompt,
          product_slug: productSlug,
          width: parseInt(width) || 20,
          height: parseInt(height) || 60,
          color_layers: parseInt(colorLayers) || 2,
          image_url: conceptImageUrl,
          logo_name: logoFile?.name || null,
          enhanced_prompt: enhancedPrompt,
          status: 'generated',
        })
        .select()
        .single();

      if (!error && data) {
        storedConcept = data;
      } else {
        console.warn('Supabase ai_concepts insert skipped:', error?.message);
      }
    } catch (dbErr: any) {
      console.warn('Supabase storage skipped:', dbErr?.message);
    }

    return NextResponse.json({
      success: true,
      conceptId: storedConcept.id,
      imageUrl: conceptImageUrl,
      shareableUrl: `/ai-studio?concept=${storedConcept.id}`,
      promptUsed: enhancedPrompt,
      specs: {
        product: product.title,
        material: product.specs.material,
        width: parseInt(width) || 20,
        height: parseInt(height) || 60,
        colorLayers: parseInt(colorLayers) || 2,
        brandText: prompt.substring(0, 30),
        bgColor: "#121212",
        textColor: "#D4AF37",
        logoUploaded: !!logoFile,
        logoName: logoFile?.name || null,
      }
    }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
