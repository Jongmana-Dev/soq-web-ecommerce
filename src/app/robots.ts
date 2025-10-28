//# **robots แบบ dynamic** (อิง NEXT_PUBLIC_SITE_URL)

import type {MetadataRoute} from 'next';
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
  return { rules: [{ userAgent: '*', allow: '/' }], sitemap: `${base}/sitemap.xml` };
}
