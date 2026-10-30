import { NextResponse } from 'next/server';
import { PRODUCTS } from '@/data/products';
import { createClient } from '@/lib/supabase/server';

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

    // Generate a unique concept image URL (fallback to stock image)
    const conceptId = `concept-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    const conceptImageUrl = "/images/design_brand_label.png";

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
        // If table doesn't exist yet, continue with fallback data
        console.warn('Supabase ai_concepts insert failed (table may not exist):', error?.message);
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
        brandText: "Custom Brand",
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