import type { MetadataRoute } from 'next'
import { routing } from '@/i18n/routing'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const out: MetadataRoute.Sitemap = []

  for (const l of routing.locales) {
    out.push({
      url: `${base}/${l}`,
      changeFrequency: 'weekly',
      priority: 1,
      lastModified: new Date(),
    })
  }
  return out
}
