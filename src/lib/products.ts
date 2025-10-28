// src/lib/products.ts
export type SizeId = 's' | 'm' | 'l'

export type Product = {
  id: string
  slug: string
  name: string
  short?: string
  description?: string
  images: string[]
  sizes: { id: SizeId; volume: string; price: number }[]
}

export const products: Product[] = [
  {
    id: 'star-san',
    slug: 'star-san',
    name: 'Star San Sanitizer',
    short: 'Professional sanitizer for brewing & craft.',
    description:
      'Food-related standards compliant, easy to mix, equipment‑friendly when diluted properly.',
    images: ['/images/product-1.jpg'], // ใส่รูปจริงตาม Figma ภายหลัง
    sizes: [
      { id: 's', volume: '250 ml', price: 380 },
      { id: 'm', volume: '500 ml', price: 450 },
      { id: 'l', volume: '1000 ml', price: 800 }
    ]
  }
]

// -------- helpers (รองรับเพจเก่า [slug]) ----------
export function listProducts(): Product[] {
  return products
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find(p => p.slug === slug)
}

// -------- helper สำหรับหน้า single product ใหม่ ----------
export function getProduct() {
  return {
    id: 'star-san',
    title: 'Star San Sanitizer',
    subtitle: 'น้ำยาฆ่าเชื้อและทำความสะอาดอุปกรณ์สำหรับการต้มเบียร์ที่ได้รับความนิยมทั่วโลก ด้วยคุณสมบัติแบบ No-Rinse Sanitizer หลังการใช้ไม่ต้องล้างน้ำออก ใช้ง่ายและปลอดภัย',
    sizes: [
      { id: '250ml', volume: '250 ml', price: 149 },
      { id: '400ml', volume: '400 ml', price: 199 },
      { id: '500ml', volume: '500 ml', price: 239 },
    ],
    images: [
      'https://cdn.shopify.com/s/files/1/0454/0861/0769/products/Starsan4oz_1024x1024@2x.png?v=1627524701',
      'https://cdn.shopify.com/s/files/1/0454/0861/0769/products/Starsan16oz_1024x1024@2x.png?v=1627524701',
      'https://cdn.shopify.com/s/files/1/0454/0861/0769/products/Starsan1Gallon_1024x1024@2x.png?v=1627524701',
    ],
    details: [
      'ผสม Star San กับน้ำสะอาดในอัตราส่วนตามที่ผู้ผลิตกำหนด (น้ำสะอาด 5 ลิตร : Star San 15 มล. เท่ากับ 1 ลิตร)',
      'นำอุปกรณ์ที่ต้องการทำความสะอาดแช่ไว้หรือราดให้ทั่ว ปล่อยให้น้ำยาสัมผัสอุปกรณ์อย่างน้อย 1 นาที โดยไม่ต้องล้างน้ำออก',
      'สามารถใช้งานได้ทันทีหลังจากน้ำยาสัมผัสอุปกรณ์',
    ],
    shipping: 'จัดส่งภายใน 2-3 วันทำการทั่วประเทศ',
    contact: 'สามารถติดต่อผ่าน LINE Official หรือ Facebook Messenger ได้ตลอดเวลา',
  }
}

