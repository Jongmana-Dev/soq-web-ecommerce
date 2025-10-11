// next.config.ts
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  images: {
    // ใช้ domains ให้ Turbo ไม่งง
    domains: ['images.unsplash.com', 'picsum.photos', 'dummyimage.com']
  }
} satisfies import('next').NextConfig

export default withNextIntl(nextConfig)
