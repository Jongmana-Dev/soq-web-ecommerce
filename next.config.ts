// next.config.ts
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  typedRoutes: true,
  compress: true,
  async redirects() {
    return [
      // www → apex: OAuth cookies (PKCE/state) เป็น host-only — ถ้าเริ่ม login บน www
      // แต่ Google callback กลับมาที่ apex (ตาม NEXTAUTH_URL) cookie จะหาย → error=Configuration
      // ต้องบังคับ canonical host เดียวก่อนถึงหน้า login เสมอ
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.soqthailand.com' }],
        destination: 'https://soqthailand.com/:path*',
        permanent: true,
      },
      // Redirect bare paths (without locale) to default locale
      { source: '/cart', destination: '/th/cart', permanent: false },
      { source: '/products/:slug', destination: '/th/products/:slug', permanent: false },
      { source: '/profile', destination: '/th/profile', permanent: false },
      { source: '/checkout', destination: '/th/checkout', permanent: false },
      { source: '/checkout/confirmation', destination: '/th/checkout/confirmation', permanent: false },
      { source: '/admin', destination: '/th/admin', permanent: false },
      { source: '/admin/:path*', destination: '/th/admin/:path*', permanent: false },
    ]
  },
  images: {
    // WebP only — AVIF encode แพงกว่า ~19x (วัดจริง 18s vs 0.96s ที่ w=1920)
    // เป็นต้นเหตุ RAM spike 1.2GB + threadpool อิ่มตัวทำ login ช้า (2026-06-11)
    formats: ['image/webp'],
    // รูปจาก bucket ตั้งชื่อ UUID ต่อการอัปโหลด (immutable) — cache ยาวได้ปลอดภัย
    minimumCacheTTL: 31536000,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'via.placeholder.com', pathname: '/**' },
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
      { protocol: 'https', hostname: 'source.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'upload.wikimedia.org', pathname: '/**' },
      { protocol: 'https', hostname: 'novelai.net', pathname: '/**' },
      { protocol: 'https', hostname: 'cdn.pixabay.com', pathname: '/**' },
      { protocol: 'https', hostname: 'placehold.co', pathname: '/**' },
      { protocol: 'https', hostname: 'i.ibb.co', pathname: '/**' },
      { protocol: 'https', hostname: 'static.vecteezy.com', pathname: '/**' },
      { protocol: 'https', hostname: 'i.pravatar.cc', pathname: '/**' },
      { protocol: 'https', hostname: 'cdn.shopify.com', pathname: '/**' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
      { protocol: 'https', hostname: 'profile.line-scdn.net', pathname: '/**' },
      { protocol: 'https', hostname: 'bucket-production-733b.up.railway.app', pathname: '/**' },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },
} satisfies NextConfig

export default withNextIntl(nextConfig)
