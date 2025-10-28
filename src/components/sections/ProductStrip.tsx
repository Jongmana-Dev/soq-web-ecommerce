// นำเข้า NextLink
import NextLink from 'next/link'
import { listProducts } from '@/lib/products'
import Image from 'next/image'
import { Reveal, Stagger, Item } from '@/components/motion/Reveal'

export default function ProductStrip(){
  const products = listProducts()
  return (
    <section id="products" data-section="true" className="container py-24">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* ซ้าย (CTA) */}
        <div className="flex flex-col gap-4 pr-6">
          <Reveal><h2 className="gold-text text-4xl font-bold leading-tight">Star San<br/>Sanitizer</h2></Reveal>
          {/* ... ข้อความ ลดท่อนนี้เพื่อความกระชับ ... */}
          <Reveal delay={.12}>
            <div className="mt-2">
              {/* ใช้ NextLink แบบ object หรือ string ก็ได้ (นี่เป็น path คงที่) */}
              {/* <NextLink href="/products/star-san-sanitizer" className="inline-block rounded-full bg-foreground px-6 py-2 text-background">
                ซื้อเลย
              </NextLink> */}
            </div>
          </Reveal>
        </div>

        {/* ขวา (รายการสินค้า) */}
        <Stagger className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {products.slice(0,3).map((p) => (
            <Item key={p.slug}>
              {/* ✅ แบบสมบูรณ์แบบและ type-safe: ส่งเป็น UrlObject */}
              <NextLink
                href={{
                  pathname: '/products/[slug]',
                  query: { slug: p.slug }
                }}
                className="group block overflow-hidden rounded-xl border border-border bg-background"
              >
                <div className="relative h-60 w-full">
                  <Image
                    src={p.images[0]}
                    alt={p.name}
                    fill
                    sizes="(max-width:1024px) 33vw, 400px"
                    className="object-contain transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm text-muted-foreground">฿{p.sizes[0].price.toLocaleString()}</div>
                </div>
              </NextLink>
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  )
}
