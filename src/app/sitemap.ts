// src/app/sitemap.ts
import type {MetadataRoute} from 'next'
import {routing} from '@/i18n/routing'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const out: MetadataRoute.Sitemap = []

  for (const l of routing.locales) {
    const root = l === routing.defaultLocale && routing.localePrefix === 'as-needed' ? '' : `/${l}`
    out.push({ url: `${base}${root}`, changeFrequency: 'weekly', priority: 1 })
  }
  return out
}
