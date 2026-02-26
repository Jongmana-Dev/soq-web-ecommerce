# สรุปการแก้ไข SEO & ISR — SOQ Web E-commerce

**วันที่:** 2026-02-26
**ไฟล์ที่แก้ทั้งหมด:** 20 ไฟล์ (แก้ 15 + สร้างใหม่ 5)

---

## สารบัญ

- [ISR & Caching](#isr--caching)
  - [1. เพิ่ม Revalidation Time เป็น 1 ชั่วโมง](#1-เพิ่ม-revalidation-time-เป็น-1-ชั่วโมง)
  - [2. ย้าย FAQs จาก Client-side เป็น Server-side](#2-ย้าย-faqs-จาก-client-side-เป็น-server-side)
  - [3. On-Demand Revalidation API](#3-on-demand-revalidation-api)
  - [4. Cache-Control Headers สำหรับ API Routes](#4-cache-control-headers-สำหรับ-api-routes)
- [SEO](#seo)
  - [5. Default Metadata (Root Layout)](#5-default-metadata-root-layout)
  - [6. Landing Page Metadata + Canonical + Hreflang](#6-landing-page-metadata--canonical--hreflang)
  - [7. Product Detail Page Metadata](#7-product-detail-page-metadata)
  - [8. Structured Data — Product JSON-LD](#8-structured-data--product-json-ld)
  - [9. Structured Data — FAQPage JSON-LD](#9-structured-data--faqpage-json-ld)
  - [10. OG Image Branding](#10-og-image-branding)
  - [11. Noindex สำหรับ Protected Pages](#11-noindex-สำหรับ-protected-pages)
  - [12. Robots.txt — Block Protected Routes](#12-robotstxt--block-protected-routes)
  - [13. Sitemap — เพิ่ม lastModified](#13-sitemap--เพิ่ม-lastmodified)

---

## ISR & Caching

### 1. เพิ่ม Revalidation Time เป็น 1 ชั่วโมง

**หน้าที่:** กำหนดว่า Next.js จะ cache หน้าเว็บนานแค่ไหนก่อน fetch ข้อมูลใหม่จาก backend ยิ่ง cache นาน = backend ถูกเรียกน้อยลง = เว็บเร็วขึ้น

**ไฟล์:** `src/app/[locale]/page.tsx`, `src/lib/cms.ts`, `src/lib/products.ts`

| | ก่อน | หลัง |
|---|------|------|
| page.tsx | `revalidate = 300` (5 นาที) | `revalidate = 3600` (1 ชั่วโมง) |
| cms.ts (3 functions) | `next: { revalidate: 300 }` | `next: { revalidate: 3600, tags: ['landing'] }` |
| products.ts (2 functions) | `next: { revalidate: 300 }` | `next: { revalidate: 3600, tags: ['landing'] }` |
| Cache tag | ไม่มี | `tags: ['landing']` ทุก fetch — ใช้ร่วมกับ on-demand revalidation |

**ผลลัพธ์:** Backend ถูกเรียก 12 ครั้ง/ชม. แทนที่จะเป็น 12 ครั้ง/5 นาที (ลดลง ~12 เท่า)

---

### 2. ย้าย FAQs จาก Client-side เป็น Server-side

**หน้าที่:** เดิม FAQs fetch ข้อมูลฝั่ง browser ทุกครั้งที่เปิดหน้า (ไม่ได้ประโยชน์จาก ISR เลย) ย้ายมา fetch ฝั่ง server ให้ได้รับประโยชน์จาก cache เหมือน sections อื่น

**ไฟล์:** `src/lib/cms.ts`, `src/app/[locale]/page.tsx`, `src/components/sections/FAQs.tsx`

| | ก่อน | หลัง |
|---|------|------|
| ข้อมูล FAQs | fetch ใน `useEffect` → `fetch('/api/faqs')` | fetch ใน `page.tsx` → `getFAQs()` server-side |
| Cache | ไม่มี — เรียก API ทุก page load | ISR 1 ชั่วโมง + tag `landing` |
| Component | มี `useState` + `useEffect` สำหรับ fetch | รับ `faqs` เป็น props, ลบ state/effect ออก |
| UX | มี flash/loading ขณะ fetch | แสดงผลทันที (server-rendered) |
| cms.ts | ไม่มี `getFAQs()` | เพิ่ม `getFAQs()` + export `FAQItem` type |

**ผลลัพธ์:** FAQs แสดงผลทันทีไม่มี loading, ลด API calls, ได้ประโยชน์จาก ISR cache

---

### 3. On-Demand Revalidation API

**หน้าที่:** ให้สามารถ force update cache ได้ทันทีเมื่อแก้ไขข้อมูลใน backend โดยไม่ต้องรอ 1 ชั่วโมง เช่น แก้ราคาสินค้าแล้วอยากให้เว็บอัปเดตเลย

**ไฟล์:** `src/app/api/revalidate/route.ts` **(สร้างใหม่)**

| | ก่อน | หลัง |
|---|------|------|
| วิธี update cache | รอ revalidate time หมดอายุ (เดิม 5 นาที) | เรียก `POST /api/revalidate` ได้ทันที |
| Security | — | ต้องส่ง `x-revalidate-secret` header |
| กลไก | — | ใช้ `revalidateTag('landing')` ล้าง cache ทุก fetch ที่ tag `landing` |

**วิธีใช้:**
```bash
curl -X POST https://domain/api/revalidate \
  -H "x-revalidate-secret: YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"tag": "landing"}'
```

**ผลลัพธ์:** Backend แก้ข้อมูล → เรียก API นี้ → เว็บแสดงข้อมูลใหม่ทันที

---

### 4. Cache-Control Headers สำหรับ API Routes

**หน้าที่:** API proxy routes (ที่ client-side เรียกได้) เดิมไม่มี cache header เลย ทำให้ทุก request ถูกส่งไป backend ตรง ๆ เพิ่ม `Cache-Control` เพื่อให้ CDN/browser cache response ไว้

**ไฟล์:** 6 ไฟล์ใน `src/app/api/`

| | ก่อน | หลัง |
|---|------|------|
| `/api/products` | `NextResponse.json(data)` | `NextResponse.json(data, { headers: { 'Cache-Control': '...' } })` |
| `/api/products/[slug]` | ไม่มี header | เพิ่ม `Cache-Control` |
| `/api/faqs` | ไม่มี header | เพิ่ม `Cache-Control` |
| `/api/reviews` | ไม่มี header | เพิ่ม `Cache-Control` |
| `/api/certifications` | ไม่มี header | เพิ่ม `Cache-Control` |
| `/api/settings` | ไม่มี header | เพิ่ม `Cache-Control` |

**Header ที่เพิ่ม:** `Cache-Control: public, s-maxage=3600, stale-while-revalidate=60`
- `s-maxage=3600` — CDN cache 1 ชั่วโมง
- `stale-while-revalidate=60` — ถ้า cache หมดอายุ ส่ง stale data ก่อน แล้ว revalidate เบื้องหลัง

**ผลลัพธ์:** ถ้ามี client-side code เรียก API เหล่านี้ จะได้ response จาก CDN cache แทนที่จะวิ่งไป backend ทุกครั้ง

---

## SEO

### 5. Default Metadata (Root Layout)

**หน้าที่:** กำหนด metadata เริ่มต้นสำหรับทั้งเว็บ ถ้าหน้าไหนไม่ได้ตั้ง title/description เอง จะใช้ค่านี้แทน + เป็น template สำหรับ title

**ไฟล์:** `src/app/layout.tsx`

| | ก่อน | หลัง |
|---|------|------|
| metadata | ไม่มีเลย | มี title template, description, OG, Twitter |
| `<title>` | ว่าง (browser แสดง URL) | `SOQ — Premium Brewing Sanitizer` |
| title template | ไม่มี | `%s | SOQ` (เช่น `Star San 946ml | SOQ`) |
| metadataBase | ไม่มี | `new URL('https://soqthailand.com')` — ใช้เป็น base สำหรับ URL สัมพัทธ์ |
| OG defaults | ไม่มี | `type: 'website'`, `siteName: 'SOQ'`, `images: ['/og']` |
| Twitter | ไม่มี | `card: 'summary_large_image'` |

**ผลลัพธ์:** ทุกหน้ามี `<title>` และ `<meta description>` เป็นอย่างน้อย Google แสดงผลใน SERP ได้ถูกต้อง

---

### 6. Landing Page Metadata + Canonical + Hreflang

**หน้าที่:** ตั้ง metadata เฉพาะสำหรับ landing page (หน้าหลักของสินค้า) รวมถึงบอก Google ว่าหน้า `/th` กับ `/en` เป็นหน้าเดียวกันคนละภาษา

**ไฟล์:** `src/app/[locale]/page.tsx`

| | ก่อน | หลัง |
|---|------|------|
| generateMetadata | ไม่มี | มี — สร้าง title, description ตาม locale |
| `<title>` (TH) | ว่าง | `SOQ — น้ำยาทำความสะอาดระดับพรีเมียมสำหรับ Brewing` |
| `<title>` (EN) | ว่าง | `SOQ — Premium Brewing Sanitizer` |
| Canonical URL | ไม่มี | `<link rel="canonical" href="https://soqthailand.com/th">` |
| Hreflang | ไม่มี | `<link rel="alternate" hreflang="th" href=".../th">` + `hreflang="en"` |
| Open Graph | ไม่มี | title, description, url, locale, alternateLocale |

**ผลลัพธ์:**
- Google รู้ว่า `/th` กับ `/en` เป็นหน้าเดียวกัน → ไม่เกิด duplicate content
- SERP แสดง title/description ถูกภาษา ตามที่ user ค้นหา
- แชร์ลิงก์ใน social media แสดงข้อมูลถูกต้อง

---

### 7. Product Detail Page Metadata

**หน้าที่:** ตั้ง metadata สำหรับหน้ารายละเอียดสินค้า `/products/[slug]` — ใช้ชื่อ/คำอธิบายจากข้อมูลสินค้าจริง

**ไฟล์:** `src/app/[locale]/products/[slug]/page.tsx`

| | ก่อน | หลัง |
|---|------|------|
| generateMetadata | ไม่มี | มี — ดึงข้อมูลจาก `getProductBySlug()` |
| `<title>` | ว่าง | ชื่อสินค้าตาม locale (เช่น `Star San 946ml | SOQ`) |
| Description | ไม่มี | `short_desc_th` หรือ `short_desc_en` |
| Canonical | ไม่มี | `/.../products/star-san` |
| Hreflang | ไม่มี | `/th/products/...` + `/en/products/...` |
| OG image | ไม่มี | รูปสินค้า (`product.image`) |

**ผลลัพธ์:** หน้าสินค้ามี title/description เฉพาะตัว + แชร์ลิงก์แสดงรูปสินค้า

---

### 8. Structured Data — Product JSON-LD

**หน้าที่:** บอก Google ว่าหน้านี้เป็นหน้า "สินค้า" พร้อมข้อมูล ราคา, สถานะสินค้า, แบรนด์, คะแนนรีวิว เพื่อแสดง **rich results** ใน Google Search (ราคา, ดาวรีวิว)

**ไฟล์:** `src/app/[locale]/page.tsx`

| | ก่อน | หลัง |
|---|------|------|
| JSON-LD | ไม่มี | `<script type="application/ld+json">` ใน landing page |
| Schema type | — | `@type: "Product"` |
| ข้อมูลที่ส่ง | — | name, description, brand (Organization), image, offers (ราคาแต่ละ size), aggregateRating |
| Offers | — | ดึงจาก `products[].sizes[]` — ราคา, ชื่อ, สกุลเงิน THB, availability: InStock |
| Rating | — | คำนวณเฉลี่ยจาก `reviews[].rating` |

**ตัวอย่าง output (JSON-LD ที่ Google จะเห็น):**
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "SOQ Star San Sanitizer",
  "brand": { "@type": "Organization", "name": "SOQ" },
  "offers": [
    { "@type": "Offer", "price": 490, "priceCurrency": "THB", "availability": "https://schema.org/InStock", "name": "ขนาด 946ml" }
  ],
  "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "reviewCount": 12 }
}
```

**ผลลัพธ์:** Google Search อาจแสดง ราคา + ดาวรีวิว ใต้ลิงก์เว็บ (rich snippet)

---

### 9. Structured Data — FAQPage JSON-LD

**หน้าที่:** บอก Google ว่า landing page มี FAQ section เพื่อแสดง **FAQ rich results** — dropdown คำถาม-คำตอบตรงใน Google Search

**ไฟล์:** `src/app/[locale]/page.tsx`

| | ก่อน | หลัง |
|---|------|------|
| FAQPage JSON-LD | ไม่มี | `<script type="application/ld+json">` ใน landing page |
| Schema type | — | `@type: "FAQPage"` |
| ข้อมูลที่ส่ง | — | `mainEntity[]` — คำถาม/คำตอบทั้งหมดจาก `faqs[]` ตาม locale |

**ตัวอย่าง output:**
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "SOQ Star San ใช้กับอาหารได้ไหม?",
      "acceptedAnswer": { "@type": "Answer", "text": "ได้ครับ SOQ Star San ผ่านมาตรฐาน..." }
    }
  ]
}
```

**ผลลัพธ์:** Google อาจแสดง FAQ dropdown ใต้ลิงก์เว็บ → กินพื้นที่ SERP มากขึ้น → CTR สูงขึ้น

---

### 10. OG Image Branding

**หน้าที่:** รูปที่แสดงเมื่อแชร์ลิงก์ใน LINE, Facebook, Twitter ปรับจาก text ธรรมดา → มี branding ชัดเจน

**ไฟล์:** `src/app/og/route.tsx`

| | ก่อน | หลัง |
|---|------|------|
| Layout | text เดียว กลางจอ | แบ่ง 3 ส่วน: brand name, main title, tagline |
| Brand name | ไม่มี | "SOQ" สีทอง (#c8a84e) ตัวอักษรห่าง |
| Title | `"SOQ — Luxury Brewing Care"` | `"Premium Brewing"` + `"Sanitizer"` แยก 2 บรรทัด |
| Tagline | ไม่มี | `"Star San Sanitizer — Safe, Residue-Free, Globally Certified"` |
| Accent | ไม่มี | เส้นสีทอง gradient ด้านบน |
| Background | gradient เดียว | gradient 3 จุด (ลึกขึ้น) |

**ผลลัพธ์:** แชร์ลิงก์แล้วรูป preview ดูเป็น professional + มี brand identity ชัดเจน

---

### 11. Noindex สำหรับ Protected Pages

**หน้าที่:** บอก Google ว่าอย่า index หน้าที่ต้อง login (cart, checkout, orders, profile) เพราะไม่มีประโยชน์ต่อ SEO และอาจทำให้ crawl budget เสียเปล่า

**ไฟล์:** 4 ไฟล์ **(สร้างใหม่ทั้งหมด)**
- `src/app/[locale]/cart/layout.tsx`
- `src/app/[locale]/checkout/layout.tsx`
- `src/app/[locale]/orders/layout.tsx`
- `src/app/[locale]/profile/layout.tsx`

| | ก่อน | หลัง |
|---|------|------|
| Cart | ไม่มี layout, ไม่มี robots tag | `robots: 'noindex, nofollow'` |
| Checkout (+confirmation) | ไม่มี layout | `robots: 'noindex, nofollow'` |
| Orders (+detail) | ไม่มี layout | `robots: 'noindex, nofollow'` |
| Profile | ไม่มี layout | `robots: 'noindex, nofollow'` |

**ผลลัพธ์:** Google ไม่ index หน้าเหล่านี้ → ไม่เสีย crawl budget + ไม่มี error ใน Search Console

---

### 12. Robots.txt — Block Protected Routes

**หน้าที่:** บอก search engine bots ว่าอย่า crawl routes ที่ไม่ควร index (ทำงานร่วมกับ noindex — robots.txt ป้องกันตั้งแต่ขั้นตอน crawl)

**ไฟล์:** `src/app/robots.ts`

| | ก่อน | หลัง |
|---|------|------|
| Rules | `allow: '/'` อย่างเดียว | `allow: '/'` + `disallow` 5 paths |
| Disallow | ไม่มี | `/api/`, `/cart/`, `/checkout/`, `/orders/`, `/profile/` |
| Sitemap | `${base}/sitemap.xml` | เหมือนเดิม |

**ผลลัพธ์:** Bot ไม่ crawl API routes + protected pages → ลด server load จาก bot traffic

---

### 13. Sitemap — เพิ่ม lastModified

**หน้าที่:** บอก Google ว่าหน้าเว็บถูกอัปเดตล่าสุดเมื่อไร → Google ใช้ตัดสินใจว่าควร re-crawl หรือยัง

**ไฟล์:** `src/app/sitemap.ts`

| | ก่อน | หลัง |
|---|------|------|
| lastModified | ไม่มี | `lastModified: new Date()` ทุก URL |
| URLs | `/th`, `/en` | เหมือนเดิม (เพียงพอสำหรับ single product site) |

**ผลลัพธ์:** Google รู้ว่าเว็บมี content ใหม่ → re-crawl บ่อยขึ้น

---

## ตารางสรุปทุกไฟล์

| # | ไฟล์ | สถานะ | สิ่งที่ทำ |
|---|------|--------|----------|
| 1 | `src/app/layout.tsx` | แก้ไข | เพิ่ม default metadata (title template, description, OG, Twitter) |
| 2 | `src/app/[locale]/page.tsx` | แก้ไข | revalidate 3600, generateMetadata, JSON-LD (Product + FAQ), getFAQs() |
| 3 | `src/app/[locale]/products/[slug]/page.tsx` | แก้ไข | generateMetadata (title, desc, canonical, hreflang, OG) |
| 4 | `src/app/[locale]/cart/layout.tsx` | **ใหม่** | noindex, nofollow |
| 5 | `src/app/[locale]/checkout/layout.tsx` | **ใหม่** | noindex, nofollow |
| 6 | `src/app/[locale]/orders/layout.tsx` | **ใหม่** | noindex, nofollow |
| 7 | `src/app/[locale]/profile/layout.tsx` | **ใหม่** | noindex, nofollow |
| 8 | `src/app/og/route.tsx` | แก้ไข | ปรับ OG image — brand name, 2-line title, tagline, accent |
| 9 | `src/app/sitemap.ts` | แก้ไข | เพิ่ม lastModified |
| 10 | `src/app/robots.ts` | แก้ไข | เพิ่ม disallow: /api/, /cart/, /checkout/, /orders/, /profile/ |
| 11 | `src/lib/cms.ts` | แก้ไข | revalidate 3600 + tags, เพิ่ม getFAQs() + FAQItem type |
| 12 | `src/lib/products.ts` | แก้ไข | revalidate 3600 + tags |
| 13 | `src/app/api/revalidate/route.ts` | **ใหม่** | On-demand revalidation endpoint |
| 14 | `src/app/api/products/route.ts` | แก้ไข | เพิ่ม Cache-Control header |
| 15 | `src/app/api/products/[slug]/route.ts` | แก้ไข | เพิ่ม Cache-Control header |
| 16 | `src/app/api/faqs/route.ts` | แก้ไข | เพิ่ม Cache-Control header |
| 17 | `src/app/api/reviews/route.ts` | แก้ไข | เพิ่ม Cache-Control header |
| 18 | `src/app/api/certifications/route.ts` | แก้ไข | เพิ่ม Cache-Control header |
| 19 | `src/app/api/settings/route.ts` | แก้ไข | เพิ่ม Cache-Control header |
| 20 | `src/components/sections/FAQs.tsx` | แก้ไข | รับ faqs เป็น props แทน client-side fetch |

---

## ก่อน vs หลัง — ภาพรวม

### SEO

| หัวข้อ | ก่อน | หลัง |
|--------|------|------|
| `<title>` | ว่าง ทุกหน้า | มีทุกหน้า (template `%s | SOQ`) |
| `<meta description>` | ไม่มี | มี — ตาม locale (TH/EN) |
| Canonical URL | ไม่มี | `<link rel="canonical">` ทุกหน้าหลัก |
| Hreflang | ไม่มี | `<link rel="alternate" hreflang="th/en">` |
| Open Graph | ไม่มี | title, description, image, locale ทุกหน้าหลัก |
| Twitter Card | ไม่มี | `summary_large_image` |
| Product JSON-LD | ไม่มี | ราคา, brand, offers, aggregateRating |
| FAQ JSON-LD | ไม่มี | คำถาม-คำตอบจาก CMS ตาม locale |
| OG Image | text ธรรมดา | มี brand name, title, tagline, accent line |
| robots (protected) | ไม่มี | `noindex, nofollow` ทุกหน้า auth |
| robots.txt | allow ทุกอย่าง | disallow /api/, /cart/, /checkout/, /orders/, /profile/ |
| Sitemap | ไม่มี lastModified | มี lastModified |

### ISR & Caching

| หัวข้อ | ก่อน | หลัง |
|--------|------|------|
| Revalidation time | 300s (5 นาที) | 3600s (1 ชั่วโมง) |
| Cache tags | ไม่มี | `tags: ['landing']` ทุก server fetch |
| FAQs fetch | Client-side (useEffect) | Server-side (ISR 1 ชั่วโมง) |
| FAQs UX | มี flash/loading | แสดงผลทันที |
| On-demand revalidation | ไม่มี | `POST /api/revalidate` + secret |
| API route cache | ไม่มี header | `s-maxage=3600, stale-while-revalidate=60` |
| Backend calls | ~144 ครั้ง/ชม. (5 endpoints x 12/ชม. x ไม่นับ FAQs client) | ~5 ครั้ง/ชม. (หรือ 0 ถ้ายังไม่หมด cache) |
