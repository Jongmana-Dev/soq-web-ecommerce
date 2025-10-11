import type {MetadataRoute} from 'next'
import {routing} from '@/i18n/routing'
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'
  const urls: MetadataRoute.Sitemap = []
  for (const l of routing.locales) {
    urls.push({ url: `${base}/${l}`, changeFrequency: 'weekly', priority: 1 })
    urls.push({ url: `${base}/${l}/products/star-san-sanitizer`, changeFrequency: 'monthly', priority: 0.8 })
  }
  return urls
}
