import type { MetadataRoute } from 'next'
import { routing } from '@/i18n/routing'
import { getProducts } from '@/lib/products'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://soqthailand.com'
  const out: MetadataRoute.Sitemap = []

  // Homepage per locale
  for (const l of routing.locales) {
    out.push({
      url: `${base}/${l}`,
      changeFrequency: 'weekly',
      priority: 1,
      lastModified: new Date(),
    })
  }

  // Product pages per locale
  try {
    const products = await getProducts()
    for (const product of products) {
      for (const l of routing.locales) {
        out.push({
          url: `${base}/${l}/products/${product.slug}`,
          changeFrequency: 'monthly',
          priority: 0.8,
          lastModified: new Date(),
        })
      }
    }
  } catch {
    // Fallback: sitemap without product pages if API is unavailable
  }

  return out
}
