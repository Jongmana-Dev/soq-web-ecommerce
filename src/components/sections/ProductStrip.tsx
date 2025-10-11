import { listProducts } from '@/lib/products'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { Reveal, Stagger, Item } from '@/components/motion/Reveal'

export default function ProductStrip(){
  const products = listProducts()
  return (
    <section id="products" data-section="true" className="container py-24">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* คอลัมน์ซ้าย: หัวข้อ + รีวิวรวม + คำบรรยาย + CTA */}
        <div className="flex flex-col gap-4 pr-6">
          <Reveal><h2 className="gold-text text-4xl font-bold leading-tight">Star San<br/>Sanitizer</h2></Reveal>
          <Reveal delay={.05}>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {/* ดาว 5 ดวง */}
              {Array.from({length:5}).map((_,i)=>(
                <svg key={i} width="16" height="16" viewBox="0 0 24 24" className="text-[--color-gold]"><path fill="currentColor" d="m12 17.27L18.18 21l-1.64-7L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z"/></svg>
              ))}
              <span className="ml-1">288 reviews</span>
            </div>
          </Reveal>
          <Reveal delay={.08}>
            <p className="max-w-prose text-muted-foreground">
              น้ำยาฆ่าเชื้อและทำความสะอาดอุปกรณ์ต้ม เบียร์และถังเก็บแบบไม่ต้องล้างออก
              ใช้ง่าย ปลอดภัย และมีประสิทธิภาพสูง
            </p>
          </Reveal>
          <Reveal delay={.12}>
            <div className="mt-2">
              <Link href="/products/star-san-sanitizer" className="inline-block rounded-full bg-foreground px-6 py-2 text-background">
                ซื้อเลย
              </Link>
            </div>
          </Reveal>
        </div>

        {/* คอลัมน์ขวา: การ์ดสินค้า 3 ชิ้น */}
        <Stagger className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {products.slice(0,3).map((p) => (
            <Item key={p.slug}>
              <Link href={`/products/${p.slug}`} className="group block overflow-hidden rounded-xl border border-border bg-background">
                <div className="relative h-60 w-full">
                  <Image src={p.images[0]} alt={p.name} fill sizes="(max-width:1024px) 33vw, 400px" className="object-contain transition duration-500 group-hover:scale-105"/>
                </div>
                <div className="p-4">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm text-muted-foreground">฿{p.price.toLocaleString()}</div>
                </div>
              </Link>
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  )
}
