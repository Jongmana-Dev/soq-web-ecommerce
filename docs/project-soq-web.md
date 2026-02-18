# SOQ Web E-commerce — ข้อมูลอ้างอิงโปรเจค

## Technology Stack
| ชั้น | เทคโนโลยี | Version |
|------|-----------|---------|
| Framework | Next.js (App Router) | 16.0.7 |
| UI | React | 19.2.1 |
| ภาษา | TypeScript | 5.6.3 |
| Styling | Tailwind CSS | v4 |
| i18n | next-intl | 4.5.5 |
| State | Zustand | 5.0.8 |
| Animation | Framer Motion | 12.23.26 |
| Scroll | @studio-freight/lenis | 1.0.42 |
| UI Kit | shadcn/ui (new-york) | Radix-based |
| Icons | lucide-react + @heroicons/react | — |
| Theme | next-themes | 0.4.6 |
| Validation | Zod | 3.23.8 |
| Testing | Vitest + Testing Library | 3.2.4 |
| Deploy | Railway (NIXPACKS) | — |
| CI/CD | GitLab CI | main branch |
| Package Mgr | pnpm | — |

## โครงสร้าง Directory
```
src/
  app/
    layout.tsx              # Root layout (ส่งผ่าน children เฉยๆ, ไม่มี <html>)
    page.tsx                # Redirect ไป /th
    globals.css             # Tailwind + theme + animations + cursor
    # providers.tsx ถูกลบแล้ว (dead code)
    robots.ts / sitemap.ts  # SEO
    og/route.tsx            # สร้าง OG image
    api/contact/route.ts    # API สำหรับ contact form
    [locale]/
      layout.tsx            # Layout หลัก (<html>, fonts, providers, Navbar)
      page.tsx              # หน้าแรก (รวม sections ทั้งหมด)
      cart/page.tsx          # หน้าตะกร้าสินค้า
      products/[slug]/
        page.tsx             # หน้ารายละเอียดสินค้า
        ui/AddToCart.tsx      # ปุ่มเพิ่มสินค้าลงตะกร้า
        ui/GalleryStrip.tsx   # แกลเลอรีรูปสินค้า
  components/
    sections/               # ส่วนต่างๆ ของหน้า (Hero, Product, FAQs ฯลฯ)
    modals/                 # ProductModal, StandardsModal
    motion/                 # Reveal animation wrapper
    cursor/                 # LuxuryCursor (custom cursor)
    site/                   # Header, LocaleSwitcher, TransitionOverlay
    site/cart/CartSheet.tsx  # Cart sheet (แบบ advanced)
    ui/                     # shadcn components
    MiniCart.tsx             # Mini cart dropdown
    ProductCard.tsx          # การ์ดสินค้า
  hooks/useReveal.ts        # Intersection observer hook
  i18n/                     # ตั้งค่า next-intl (routing, navigation, request, locales)
  lib/
    # cart.ts ถูกลบแล้ว (deprecated)
    store.ts                # ตัวหลัก: Zustand cart พร้อม localStorage persistence
    products.ts             # ข้อมูลสินค้า mock
    faqs.ts / footer.ts     # ข้อมูล static
    utils.ts                # cn() utility
  messages/                 # ไฟล์แปลภาษา th.json, en.json
  providers/
    # CartProvider.tsx ถูกลบแล้ว (deprecated)
    SmoothScrollProvider.tsx # Lenis smooth scroll
  store/
    # store/cart.ts ถูกลบแล้ว (deprecated)
  types/css.d.ts
```

## การตัดสินใจทาง Architecture
- Root `layout.tsx` return แค่ `children` เท่านั้น (ไม่มี `<html>/<body>`)
- `[locale]/layout.tsx` เป็นตัวให้โครงสร้าง HTML ทั้งหมด (fonts, theme, i18n, navbar)
- Locale routing: ใช้ `localePrefix: 'as-needed'` (ใน `src/i18n/routing.ts`)
- Dark mode เป็น default, ใช้ class-based switching ผ่าน next-themes

## Implementation ที่ถูกต้อง
| เรื่อง | ไฟล์หลัก | หมายเหตุ |
|--------|----------|----------|
| Cart Store | `src/lib/store.ts` (Zustand+persist) | ไฟล์ deprecated ถูกลบแล้ว |
| i18n Routing | `src/i18n/routing.ts` | `next-intl.config.ts` ถูกลบแล้ว |
| Theme Provider | `src/app/[locale]/layout.tsx` | `src/app/providers.tsx` ถูกลบแล้ว |
| Navigation | `src/i18n/navigation.ts` (next-intl Link/useRouter) | hash links ใช้ `<a>` |

## หมายเหตุ Configuration
- `next.config.ts`: เปิด reactStrictMode, typedRoutes, next-intl plugin
- `postcss.config.mjs`: ใช้ `@tailwindcss/postcss` (Tailwind v4) — ไม่มี `tailwind.config.js` แล้ว
- `vitest.config.ts`: setupFiles ชี้ไป `./vitest.setup.ts` (แก้แล้ว)
- `middleware.ts`: ใช้ next-intl middleware, match `/ | /(th|en)/:path*`
- `.gitlab-ci.yml`: มี validate stage (lint+build) ก่อน deploy, ใช้ pnpm ผ่าน corepack

## Environment Variables
| ตัวแปร | ใช้ทำอะไร |
|--------|----------|
| `NEXT_PUBLIC_SITE_URL` | Base URL ของเว็บ (ใช้ใน robots.ts, sitemap.ts) |
| `RAILWAY_TOKEN` | Token สำหรับ deploy ไป Railway (เก็บใน GitLab CI secret) |
