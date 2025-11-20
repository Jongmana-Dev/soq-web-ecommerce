// next.config.ts
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'via.placeholder.com', pathname: '/**' },
      // ✅ เพิ่ม CDN ที่ใช้รูป mock/สินค้า
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
      { protocol: 'https', hostname: 'source.unsplash.com', pathname: '/**' },
        { protocol: 'https', hostname: 'upload.wikimedia.org', pathname: '/**' },  
      { protocol: 'https', hostname: 'novelai.net', pathname: '/**' },  
       { protocol: 'https', hostname: 'cdn.pixabay.com', pathname: '/**' },
       { protocol: 'https', hostname: 'placehold.co', pathname: '/**' },
       { protocol: 'https', hostname: 'i.ibb.co', pathname: '/**' },
       { protocol: 'https', hostname: 'static.vecteezy.com', pathname: '/**' },
    ]
  }
} satisfies NextConfig

export default withNextIntl(nextConfig)
