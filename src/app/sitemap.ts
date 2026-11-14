import type { MetadataRoute } from "next";
import { PRODUCTS } from "@/data/products";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  // A fixed review date keeps the sitemap fully static — `new Date()` here
  // would make the route request-time under Cache Components.
  const lastReviewed = new Date(SITE.pricingReviewed);

  const pages: MetadataRoute.Sitemap = [
    {
      url: `${SITE.url}/`,
      lastModified: lastReviewed,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE.url}/ai-studio`,
      lastModified: lastReviewed,
      changeFrequency: "monthly",
      priority: 0.9,
    },
  ];

  const products: MetadataRoute.Sitemap = PRODUCTS.map((product) => ({
    url: `${SITE.url}/products/${product.slug}`,
    lastModified: lastReviewed,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...pages, ...products];
}
