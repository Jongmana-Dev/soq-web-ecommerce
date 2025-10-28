A) ตั้งค่าโดเมนจริง (สำคัญมาก)

ตั้ง NEXT_PUBLIC_SITE_URL ใน .env ของคุณ

จะทำให้ metadataBase, robots.ts, sitemap.ts และ OG URLs อ้างโดเมนจริงถูกต้อง

B) ใส่ Per‑page metadata (โดยเฉพาะเพจสินค้า)

ตอนนี้เพจสินค้า ยังไม่ได้ generateMetadata() → ควรเติมเพื่อให้ Title/Description/OG ตรงกับสินค้า

// app/[locale]/products/[slug]/page.tsx (ตัวอย่าง)
export async function generateMetadata({ params }: { params: { slug: string, locale: string } }) {
  const p = getProductBySlug(params.slug)
  if (!p) return {}
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'
  const url  = `${base}/${params.locale}/products/${p.slug}`

  return {
    title: `${p.name} — SOQ`,
    description: p.short,
    alternates: { canonical: url },
    openGraph: {
      url, title: p.name, description: p.short,
      images: p.images?.slice(0,1) || []
    },
    twitter: { card: 'summary_large_image', title: p.name, description: p.short }
  }
}


C) ใส่ Product JSON‑LD (เพิ่ม rich result)

แปะ <script type="application/ld+json"> ในเพจสินค้า (ใช้ next/script) เพื่อให้ Google เข้าใจว่าเป็นสินค้า

import Script from 'next/script'
// ...ภายในคอมโพเนนต์เพจสินค้า:
<Script id="ld-product" type="application/ld+json"
  dangerouslySetInnerHTML={{__html: JSON.stringify({
    "@context":"https://schema.org",
    "@type":"Product",
    "name": p.name,
    "description": p.short,
    "image": p.images,
    "offers": {
      "@type":"Offer",
      "priceCurrency":"THB",
      "price": p.price,
      "availability":"https://schema.org/InStock",
      "url": `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/products/${p.slug}`
    }
  })}} />

D) อัปเดต sitemap.ts ให้ดึงจากแหล่งข้อมูลจริง

ตอนนี้ sitemap ใส่ slug ตัวอย่างไว้แล้ว ลองดึงจาก lib/products.ts จะกันลืมเวลามีสินค้าชุดใหม่

import { listProducts } from '@/lib/products'
// ภายใน sitemap():
for (const l of routing.locales) {
  urls.push({ url: `${base}/${l}`, changeFrequency: 'weekly', priority: 1 })
  for (const p of listProducts()) {
    urls.push({ url: `${base}/${l}/products/${p.slug}`, changeFrequency: 'monthly', priority: 0.8 })
  }
}

E) ตรวจซ้ำ robots (มีทั้ง dynamic และไฟล์คงที่)

เลือกใช้ แบบ dynamic (app/robots.ts) เป็นหลัก เพราะผูกกับโดเมนอัตโนมัติ

ทำให้ public/robots.txt มีเนื้อหาเหมือนกันหรือถอดออก เพื่อลดความกำกวม

F) เนื้อหา/โครงสร้างที่ Google ชอบ

ใช้ <h1> เด่นเพจละหนึ่ง (Hero มี h1 แล้ว), ไล่ระดับ <h2>, <h3> ชัดเจน

ใส่ alt รูปอธิบายจริง (บางรูปยังเป็น alt="hero" → ควรบรรยายสินค้า/ฉาก)

next/image กำหนด sizes ให้เหมาะกับเลย์เอาต์ responsive

ใช้ลิงก์ภายใน (internal links) ไปหน้าสำคัญ เช่น /[locale]/products/... จากหน้าแรก

เปิด Compression/CDN ตอน deploy (Vercel ทำให้อัตโนมัติ)

G) ประสิทธิภาพ & ประสบการณ์ผู้ใช้

ตรวจ Core Web Vitals: เลือกรูปไม่หนัก, lazy‑load, ลด motion เมื่อ prefers-reduced-motion

ปุ่ม/ลิงก์มี :focus-visible อ่านง่าย (Tailwind v4 มีตัวแปรสีให้ใช้)


----
8) สรุปแนวทาง “ลงมือใช้” ทีละเประ (จากศูนย์สู่โปรดักชัน)

รันเว็บให้ได้บนเครื่อง + ตั้ง NEXT_PUBLIC_SITE_URL

เติม metadata รายหน้า (โดยเฉพาะสินค้า) + JSON‑LD

ทำ sitemap ให้ดึงจาก listProducts()

ปรับสตริงใน messages/th.json ให้เป็นคำตลาด/แบรนด์จริง

เปลี่ยนดีไซน์ด้วยการแก้ :root{ ... } (OKLCH) + ใช้คลาส token (bg-background, text-foreground)

ใส่ alt รูปให้ครบ และกำหนด sizes ใน <Image> ตามความกว้างจริง

ตรวจ robots (เลือก dynamic เป็นตัวจริง)

Deploy (Vercel หรือ Docker) และเช็ก Core Web Vitals