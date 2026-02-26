# Review: SEO & ISR — SOQ Web E-commerce

**Review Date:** 2026-02-26
**Reviewer:** Claude Code
**Scope:** SEO implementation + ISR/Caching strategy ทั้งโปรเจค
**Framework:** Next.js 16.0.11 (App Router) + next-intl 4.5.5
**Product Type:** Single product (Star San Sanitizer) — landing page = หน้าหลักของสินค้า, หน้า `/products/[slug]` เป็นแค่หน้าขยายรายละเอียด

---

## สารบัญ

- [1. Executive Summary](#1-executive-summary)
- [2. SEO Audit](#2-seo-audit)
- [3. ISR & Caching Audit](#3-isr--caching-audit)
- [4. Issue Tracker](#4-issue-tracker)
- [5. แผนแก้ไข](#5-แผนแก้ไข)

---

## 1. Executive Summary

### SEO — คะแนนรวม: 3/10

| หมวด | สถานะ | ความเร่งด่วน |
|------|--------|-------------|
| Page Metadata (title, description) | ไม่มีเลย | CRITICAL |
| Structured Data (JSON-LD) | ไม่มีเลย | CRITICAL |
| Sitemap | มี (homepage only — เพียงพอสำหรับ single product) | MEDIUM |
| Canonical URLs / Hreflang | ไม่มีเลย | HIGH |
| Open Graph | มีแต่ generic (ไม่มี product info) | HIGH |
| robots.txt | ใช้งานได้ | OK |
| Image Optimization | ดี (next/image ทุกจุด) | OK |
| i18n Routing | ดี (next-intl) | OK |

**สรุป:** เว็บยังไม่พร้อมสำหรับ SEO เลย ไม่มี `<title>`, `<meta description>` ในทุกหน้า Google จะไม่สามารถแสดงผลที่ดีใน SERP ได้

### ISR & Caching — คะแนนรวม: 7/10

| หมวด | สถานะ | ความเร่งด่วน |
|------|--------|-------------|
| Landing Page ISR | ดี (3600s + tags) | OK |
| Product Pages Static Gen | ดี (generateStaticParams) | OK |
| On-Demand Revalidation | มี (/api/revalidate) | OK |
| Server-side data fetching | ดี (cms.ts, products.ts) | OK |
| API Proxy Routes caching | ไม่มี cache เลย | MEDIUM |
| Image caching headers | ดี (1 year immutable) | OK |
| Client-side fetching | ยังมีบางจุดไม่ optimal | LOW |

**สรุป:** ISR/Caching ทำได้ค่อนข้างดีแล้วหลัง landing page cache upgrade ล่าสุด แต่ API proxy routes ยังไม่มี cache header ทำให้ client-side fetch ไม่ได้ประโยชน์จาก caching

---

## 2. SEO Audit

### 2.1 Page Metadata — CRITICAL

**ปัญหา:** ไม่มี `metadata` export หรือ `generateMetadata()` ในทุกหน้า

**ไฟล์ที่ขาด metadata:**

| หน้า | ไฟล์ | ผลกระทบ |
|------|------|---------|
| **Landing Page** | `src/app/[locale]/page.tsx` | **สำคัญที่สุด** — หน้าหลักของสินค้า ไม่มี title/description ใน SERP |
| Product Detail | `src/app/[locale]/products/[slug]/page.tsx` | หน้าขยายรายละเอียด — ไม่ใช่หน้าหลัก แต่ควรมี metadata |
| Cart | `src/app/[locale]/cart/page.tsx` | ไม่มี title (ไม่ร้ายแรง — ไม่ต้อง index) |
| Checkout | `src/app/[locale]/checkout/page.tsx` | ไม่มี title (ไม่ต้อง index) |
| Orders | `src/app/[locale]/orders/page.tsx` | ไม่มี title (ไม่ต้อง index) |
| Profile | `src/app/[locale]/profile/page.tsx` | ไม่มี title (ไม่ต้อง index) |
| Root Layout | `src/app/layout.tsx` | ไม่มี default metadata |
| Locale Layout | `src/app/[locale]/layout.tsx` | ไม่มี base metadata |

**ตัวอย่างสิ่งที่ควรมี** (Landing Page):
```ts
// src/app/[locale]/page.tsx
export function generateMetadata({ params }): Metadata {
  const locale = params.locale
  return {
    title: locale === 'th'
      ? 'SOQ — น้ำยาทำความสะอาดระดับพรีเมียม'
      : 'SOQ — Premium Brewing Sanitizer',
    description: locale === 'th'
      ? 'SOQ Star San Sanitizer สำหรับอุตสาหกรรมเบียร์คราฟต์...'
      : 'SOQ Star San Sanitizer for craft brewing industry...',
    alternates: {
      canonical: `/${locale}`,
      languages: { th: '/th', en: '/en' },
    },
  }
}
```

**ตัวอย่างสิ่งที่ควรมี** (Product Page):
```ts
// src/app/[locale]/products/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const { locale, slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return {}

  const name = locale === 'th' ? product.name_th : product.name_en
  const desc = locale === 'th' ? product.short_desc_th : product.short_desc_en

  return {
    title: name,
    description: desc,
    openGraph: {
      title: name,
      description: desc,
      images: [product.image],
      type: 'website',
      locale: locale === 'th' ? 'th_TH' : 'en_US',
    },
    alternates: {
      canonical: `/${locale}/products/${slug}`,
      languages: {
        th: `/th/products/${slug}`,
        en: `/en/products/${slug}`,
      },
    },
  }
}
```

---

### 2.2 Structured Data (JSON-LD) — CRITICAL

**ปัญหา:** ไม่มี structured data เลย ทำให้ Google ไม่สามารถแสดง rich results (ราคา, รีวิว, FAQ) ได้

> **หมายเหตุ:** เนื่องจากเป็นสินค้าชนิดเดียว (Star San Sanitizer) landing page คือหน้าสินค้าหลัก ดังนั้น JSON-LD ทั้งหมดควรอยู่ที่ landing page

**สิ่งที่ควรเพิ่มใน Landing Page:**

| Schema Type | ประโยชน์ |
|------------|---------|
| `Product` + `Offer` | แสดงราคาสินค้าใน Google Search |
| `Organization` | แสดงข้อมูลแบรนด์ SOQ |
| `FAQPage` | แสดง FAQ dropdown ใน SERP |
| `AggregateRating` | แสดงดาวรีวิวรวม |

**ตัวอย่าง Product + Organization JSON-LD (ใส่ใน landing page):**
```tsx
// src/app/[locale]/page.tsx — เพิ่มใน return JSX
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: locale === 'th'
        ? 'SOQ Star San Sanitizer'
        : 'SOQ Star San Sanitizer',
      description: locale === 'th'
        ? 'น้ำยาทำความสะอาดระดับพรีเมียมสำหรับอุตสาหกรรม Brewing'
        : 'Premium sanitizer for craft brewing industry',
      brand: {
        '@type': 'Organization',
        name: 'SOQ',
        url: base,
      },
      image: products[0]?.image,
      offers: products.flatMap(p =>
        p.sizes.map(size => ({
          '@type': 'Offer',
          price: size.price,
          priceCurrency: 'THB',
          availability: 'https://schema.org/InStock',
          name: locale === 'th' ? size.label_th : size.label_en,
        }))
      ),
      aggregateRating: reviews.length > 0 ? {
        '@type': 'AggregateRating',
        ratingValue: (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1),
        reviewCount: reviews.length,
      } : undefined,
    }),
  }}
/>
```

**ตัวอย่าง FAQPage JSON-LD (ใส่ใน landing page):**
```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: locale === 'th' ? faq.question_th : faq.question_en,
        acceptedAnswer: {
          '@type': 'Answer',
          text: locale === 'th' ? faq.answer_th : faq.answer_en,
        },
      })),
    }),
  }}
/>
```

---

### 2.3 Sitemap — MEDIUM

> เนื่องจากเป็นสินค้าชนิดเดียว sitemap ที่มี homepage ต่อ locale ก็เพียงพอแล้ว ปรับแค่ `lastModified`

**ปัจจุบัน** (`src/app/sitemap.ts`):
```ts
// มี 2 URLs: /th, /en — เพียงพอสำหรับ single product site
for (const l of routing.locales) {
  const root = `/${l}`
  out.push({ url: `${base}${root}`, changeFrequency: 'weekly', priority: 1 })
}
```

**สิ่งที่ยังขาด:**
- `lastModified` timestamp (ช่วยให้ Google รู้ว่าข้อมูลอัปเดตเมื่อไร)
- Product detail URL ถ้าต้องการให้ index ด้วย (optional — เป็นแค่หน้าขยาย)

**แนวทางปรับปรุง:**
```ts
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
```

---

### 2.4 Canonical URLs & Hreflang — HIGH

**ปัญหา:** ไม่มี canonical URLs หรือ hreflang tags เลย

**ผลกระทบ:**
- Google อาจมองว่า `/th` กับ `/en` เป็น duplicate content
- Google ไม่รู้ว่า `/th/products/star-san` กับ `/en/products/star-san` เป็นหน้าเดียวกันคนละภาษา
- อาจแย่ง ranking กันเอง (keyword cannibalization)

**แก้ไข:** เพิ่ม `alternates` ใน metadata ทุกหน้า (ดูตัวอย่างใน 2.1)

---

### 2.5 Open Graph — HIGH

**สถานะปัจจุบัน** (`src/app/og/route.tsx`):
- มี OG image generator 1 ตัว: static text "SOQ — Luxury Brewing Care"
- ไม่มี per-page OG metadata
- ไม่มี Twitter Card tags

**ปัญหา:**
- แชร์ลิงก์ใน LINE/Facebook จะไม่แสดงชื่อสินค้า คำอธิบาย หรือราคา
- OG image เป็น text ธรรมดา "SOQ — Luxury Brewing Care" ไม่มีรูปสินค้า

**สิ่งที่ควรเพิ่ม:**
1. `openGraph` metadata ใน landing page (หน้าหลัก — สำคัญที่สุด)
2. ปรับ OG image ให้แสดงรูปสินค้า + branding (ไม่ต้องทำ per-product เพราะสินค้าชนิดเดียว)
3. `twitter` metadata (Twitter/X card)

---

### 2.6 robots.txt — OK

**สถานะ** (`src/app/robots.ts`): ใช้งานได้
```ts
return { rules: [{ userAgent: '*', allow: '/' }], sitemap: `${base}/sitemap.xml` }
```

**ข้อเสนอแนะ (optional):**
- เพิ่ม `disallow: ['/api/', '/checkout/', '/profile/', '/orders/']` เพื่อไม่ให้ index หน้าที่ต้อง auth
- เพิ่ม `disallow: ['/cart/']` เพราะเป็น user-specific content

---

### 2.7 Image Optimization — OK

**สิ่งที่ดี:**
- ใช้ `next/image` ทุกจุด พร้อม `sizes` attribute
- Image config: `formats: ['image/avif', 'image/webp']`, `minimumCacheTTL: 3600`
- Hero image ใช้ `priority` สำหรับ LCP
- Static images มี cache header 1 year immutable

**ข้อเสนอแนะ:**
- บาง alt text ยังเป็น generic ("Star San Sanitizer Products") ควรเฉพาะเจาะจงกว่านี้
- ลด remote pattern ที่ไม่ใช้จริง (placeholder.com, vecteezy, pixabay)

---

### 2.8 Head & Performance Tags

**สิ่งที่ดี:**
- `lang={locale}` บน `<html>` tag
- Google Fonts ใช้ `display: 'swap'`
- DNS prefetch + preconnect ไปยัง cdnjs.cloudflare.com
- `X-DNS-Prefetch-Control: on` header

**สิ่งที่ขาด:**
- ไม่มี `<meta name="theme-color">` (สำหรับ mobile browser)
- ไม่มี `<link rel="icon">` / favicon config ผ่าน metadata
- Font Awesome โหลดทั้ง file (all.min.css ~90KB) ทั้งที่ใช้แค่บาง icon

---

## 3. ISR & Caching Audit

### 3.1 Caching Overview Table

| Route | ประเภท | Cache | TTL | Tags | On-Demand |
|-------|--------|-------|-----|------|-----------|
| `/[locale]` (landing) | ISR (server) | next cache | 3600s | `landing` | `/api/revalidate` |
| `/[locale]/products/[slug]` | Static + ISR | next cache | 3600s | `landing` | `/api/revalidate` |
| `getProducts()` | server fetch | next cache | 3600s | `landing` | tag-based |
| `getReviews()` | server fetch | next cache | 3600s | `landing` | tag-based |
| `getCertifications()` | server fetch | next cache | 3600s | `landing` | tag-based |
| `getFAQs()` | server fetch | next cache | 3600s | `landing` | tag-based |
| `getSettings()` | server fetch | next cache | 3600s | `landing` | tag-based |
| `getProductBySlug()` | server fetch | next cache | 3600s | `landing` | tag-based |
| `/api/products` | API route | **ไม่มี** | - | - | - |
| `/api/faqs` | API route | **ไม่มี** | - | - | - |
| `/api/reviews` | API route | **ไม่มี** | - | - | - |
| `/api/certifications` | API route | **ไม่มี** | - | - | - |
| `/api/settings` | API route | **ไม่มี** | - | - | - |
| `/api/settings-proxy/shipping` | API route | server fetch | 300s | - | time-based |
| `/api/settings-proxy/payment-accounts` | API route | server fetch | 300s | - | time-based |
| `/api/orders-proxy/**` | API route | ไม่มี (ถูกต้อง) | - | - | - |
| `/api/verify-slip` | API route | ไม่มี (ถูกต้อง) | - | - | - |
| `/api/contact` | API route | no-store (ถูกต้อง) | - | - | - |
| `/images/*` | static header | browser | 1 year | - | immutable |

### 3.2 สิ่งที่ดี

1. **Landing Page ISR ถูกออกแบบดี:**
   - ข้อมูลทุก section (Products, Reviews, Certifications, FAQs) fetch server-side ใน `Promise.all`
   - Cache 1 ชั่วโมง + tag `landing` สำหรับ on-demand revalidation
   - FAQs ถูกย้ายจาก client-side มาเป็น server-side แล้ว (ไม่มี flash/loading)

2. **Product Pages ใช้ Static Generation:**
   - `generateStaticParams()` pre-render ทุกสินค้าตอน build
   - `getProductBySlug()` มี ISR 3600s fallback

3. **On-Demand Revalidation พร้อมใช้:**
   - `POST /api/revalidate` + secret header
   - ใช้ `revalidateTag('landing', { expire: 0 })` สำหรับ Next.js 16
   - Backend สามารถ webhook มาเรียกได้ทันทีเมื่อข้อมูลเปลี่ยน

4. **Auth-related routes ไม่ cache (ถูกต้อง):**
   - Orders, verify-slip, auth-proxy: ไม่มี cache
   - auth-adapter: `cache: 'no-store'` explicitly

5. **Image caching headers ดี:**
   - Static images: `Cache-Control: public, max-age=31536000, immutable`
   - next/image: `minimumCacheTTL: 3600`

### 3.3 Issues พบ

#### ISR-01: API Proxy Routes ไม่มี Cache — MEDIUM

**ไฟล์ที่มีปัญหา:**
- `src/app/api/products/route.ts`
- `src/app/api/products/[slug]/route.ts`
- `src/app/api/faqs/route.ts`
- `src/app/api/reviews/route.ts`
- `src/app/api/certifications/route.ts`
- `src/app/api/settings/route.ts`

**ปัจจุบัน:**
```ts
// ทุกไฟล์เหมือนกัน — ไม่มี cache
export async function GET() {
  const data = await apiFetch('/api/products')
  return NextResponse.json(data) // ← ไม่มี Cache-Control header
}
```

**ผลกระทบ:**
- API routes เหล่านี้ถูกเรียกจาก client-side ได้โดยตรง (เช่น ถ้ามี component อื่นเรียก)
- ไม่มี browser caching → ทุก request วิ่งไป backend ใหม่
- **หมายเหตุ:** ตอนนี้ landing page ใช้ `lib/products.ts` + `lib/cms.ts` (server-side fetch) ซึ่ง cache ดีแล้ว ดังนั้น API proxy routes เหล่านี้จะถูกเรียกเฉพาะกรณี client-side fetch เท่านั้น

**แนวทางแก้ไข:** เพิ่ม `Cache-Control` header ในแต่ละ response
```ts
export async function GET() {
  const data = await apiFetch('/api/products')
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=60' },
  })
}
```

---

#### ISR-02: Tag `landing` ใช้กับทุก fetch — LOW

**ปัจจุบัน:** ทุก function ใน `cms.ts` และ `products.ts` ใช้ tag เดียวกัน: `tags: ['landing']`

**ผลกระทบ:**
- เมื่อเรียก `revalidateTag('landing')` จะ invalidate **ทุกอย่าง** พร้อมกัน
- ไม่สามารถ revalidate แค่ products หรือแค่ FAQs ได้

**แนวทาง (optional):** เพิ่ม tag เฉพาะทาง
```ts
// products.ts
next: { revalidate: 3600, tags: ['landing', 'products'] }

// cms.ts — getReviews
next: { revalidate: 3600, tags: ['landing', 'reviews'] }

// cms.ts — getFAQs
next: { revalidate: 3600, tags: ['landing', 'faqs'] }
```
แล้วเรียก `revalidateTag('products')` เพื่อ revalidate แค่สินค้า

**Priority:** LOW — ตอนนี้ `landing` tag เพียงพอสำหรับ scope ของโปรเจค

---

#### ISR-03: Checkout fetches ไม่มี client-side cache hint — LOW

**ไฟล์:** `src/app/[locale]/checkout/page.tsx`

**ปัจจุบัน:**
```ts
useEffect(() => {
  fetch('/api/settings-proxy/shipping')  // ← ไม่มี cache directive
  fetch('/api/settings-proxy/payment-accounts')
}, [])
```

**ผลกระทบ:** ทุกครั้งที่เปิดหน้า checkout จะเรียก API ใหม่ทั้งที่ server cache อยู่ที่ 300s

**แนวทาง (optional):** ไม่จำเป็นต้องแก้ เพราะ server-side ของ settings-proxy มี `revalidate: 300` อยู่แล้ว Browser จะได้ response จาก Next.js server cache

---

## 4. Issue Tracker

### สัญลักษณ์
- [ ] ยังไม่ได้แก้
- [x] แก้แล้ว

---

### CRITICAL (4 issues)

- [x] **SEO-01** Landing page ไม่มี metadata (title, description) → เพิ่ม `generateMetadata` (**แก้แล้ว: Phase 1**)
- [x] **SEO-02** ไม่มี Structured Data (JSON-LD) เลย → เพิ่ม Product + FAQPage + Organization ใน landing page (**แก้แล้ว: Phase 2**)
- [x] **SEO-03** Root Layout ไม่มี default metadata → เพิ่ม base title template + description (**แก้แล้ว: Phase 1**)
- [x] **SEO-04** ไม่มี canonical URLs → เพิ่ม `alternates.canonical` + hreflang (**แก้แล้ว: Phase 1**)

### HIGH (4 issues)

- [x] **SEO-05** ไม่มี hreflang tags → เพิ่ม `alternates.languages` (th/en) (**แก้แล้ว: Phase 1**)
- [x] **SEO-06** OG image ไม่มีรูปสินค้า → ปรับ OG image ให้มี product branding (**แก้แล้ว: Phase 2**)
- [x] **SEO-07** ไม่มี OG metadata ใน landing page → เพิ่ม `openGraph` ใน metadata (**แก้แล้ว: Phase 1**)
- [x] **ISR-01** API proxy routes ไม่มี Cache-Control header → เพิ่ม s-maxage (**แก้แล้ว: Phase 3**)

### MEDIUM (5 issues)

- [x] **SEO-08** Product detail page ไม่มี metadata → เพิ่ม `generateMetadata` (หน้าขยายรายละเอียด) (**แก้แล้ว: Phase 2**)
- [x] **SEO-09** robots.txt ไม่ block หน้าที่ต้อง auth → disallow /checkout, /profile, /orders (**แก้แล้ว: Phase 3**)
- [x] **SEO-10** Sitemap ไม่มี `lastModified` → เพิ่ม timestamp (**แก้แล้ว: Phase 2**)
- [x] **SEO-11** Protected pages (cart, checkout, profile) ควรมี `robots: 'noindex'` ใน metadata (**แก้แล้ว: Phase 1**)
- [ ] **ISR-02** Tag `landing` ครอบคลุมทุก data → เพิ่ม granular tags (optional)

### LOW (4 issues)

- [ ] **SEO-12** Font Awesome โหลดทั้งไฟล์ (~90KB) → พิจารณาใช้เฉพาะ icon ที่ใช้
- [ ] **SEO-13** บาง alt text เป็น generic → ปรับให้เฉพาะเจาะจง
- [ ] **SEO-14** ไม่มี `<meta name="theme-color">` → เพิ่มใน layout metadata
- [ ] **SEO-15** ลด remote image patterns ที่ไม่ใช้จริง ใน next.config.ts

---

## 5. แผนแก้ไข

### Phase 1 — SEO Foundation (CRITICAL)
> **เป้าหมาย:** ให้ Google index landing page ได้อย่างถูกต้อง — นี่คือหน้าสินค้าหลัก

**ขั้นตอน:**
1. เพิ่ม default metadata ใน `src/app/layout.tsx` (title template, base description, OG defaults)
2. เพิ่ม `generateMetadata()` ใน `src/app/[locale]/page.tsx` (**สำคัญที่สุด** — title, description, canonical, hreflang, openGraph)
3. เพิ่ม canonical URL + hreflang (`alternates`) ใน landing page metadata
4. เพิ่ม `robots: 'noindex'` ให้หน้า cart, checkout, profile, orders

**ไฟล์ที่แก้:** ~6 ไฟล์ (layout.tsx, page.tsx, cart/page.tsx, checkout/page.tsx, orders/page.tsx, profile/page.tsx)

### Phase 2 — Rich Results + JSON-LD (HIGH)
> **เป้าหมาย:** ให้ Google แสดง rich results (ราคาสินค้า, FAQ dropdown, ดาวรีวิว)

**ขั้นตอน:**
1. เพิ่ม Product + Organization JSON-LD ใน landing page (ข้อมูลสินค้า + แบรนด์ + ราคา + รีวิว)
2. เพิ่ม FAQPage JSON-LD ใน landing page (FAQ section → แสดงใน SERP)
3. ปรับ OG image ให้มี product branding (ไม่ต้อง dynamic per-product เพราะสินค้าชนิดเดียว)
4. เพิ่ม `generateMetadata()` ใน product detail page (หน้าขยายรายละเอียด)
5. เพิ่ม `lastModified` ใน sitemap

**ไฟล์ที่แก้:** ~4 ไฟล์ (page.tsx, products/[slug]/page.tsx, og/route.tsx, sitemap.ts)

### Phase 3 — Caching & Hardening (MEDIUM)
> **เป้าหมาย:** ลด backend load + ป้องกัน index หน้าที่ไม่ควร

**ขั้นตอน:**
1. เพิ่ม `Cache-Control` header ใน API proxy routes (products, faqs, reviews, certifications, settings)
2. Update robots.txt ให้ block /api/, /checkout/, /profile/, /orders/
3. เพิ่ม granular cache tags (optional)

**ไฟล์ที่แก้:** ~7 ไฟล์ (api routes x6, robots.ts)

---

## Appendix: ไฟล์สำคัญที่เกี่ยวข้อง

| ไฟล์ | บทบาท |
|------|-------|
| `src/app/layout.tsx` | Root layout (ยังว่าง — ต้องเพิ่ม metadata) |
| `src/app/[locale]/layout.tsx` | Locale layout (html lang, fonts, providers) |
| `src/app/[locale]/page.tsx` | **Landing page = หน้าสินค้าหลัก** (ISR 3600s, server-side fetch) |
| `src/app/[locale]/products/[slug]/page.tsx` | Product detail — หน้าขยายรายละเอียด (generateStaticParams) |
| `src/lib/cms.ts` | CMS data fetching (reviews, certifications, FAQs, settings) |
| `src/lib/products.ts` | Product data fetching |
| `src/app/sitemap.ts` | Sitemap generation (ยังไม่ครบ) |
| `src/app/robots.ts` | robots.txt generation |
| `src/app/og/route.tsx` | OG image generation (static) |
| `src/app/api/revalidate/route.ts` | On-demand revalidation endpoint |
| `src/app/api/products/route.ts` | Product API proxy (ไม่มี cache) |
| `src/app/api/faqs/route.ts` | FAQ API proxy (ไม่มี cache) |
| `src/i18n/routing.ts` | Locale config (th, en) |
| `next.config.ts` | Next.js config (images, headers, redirects) |
