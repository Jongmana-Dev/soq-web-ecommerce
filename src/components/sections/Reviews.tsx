import Image from 'next/image'
import { Reveal, Stagger, Item } from '@/components/motion/Reveal'

const DATA = [
  {
    quote: 'โคตรสะอาด ใช้งานรวดเร็ว มั่นใจได้',
    by: 'MARTHA',
    img: 'https://images.unsplash.com/photo-1503602642458-232111445657?q=80&w=1200&auto=format&fit=crop'
  },
  {
    quote: 'กลิ่นไม่ติด คราฟท์ได้เต็มรส',
    by: 'Psycho',
    img: 'https://images.unsplash.com/photo-1532635241-17e820acc59f?q=80&w=1200&auto=format&fit=crop'
  },
  {
    quote: 'ประหยัดเวลา ทำความสะอาดง่าย',
    by: 'Andechs',
    img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop'
  }
]

export default function Reviews(){
  return (
    <section id="reviews" data-section="true" className="relative py-24">
      {/* แผ่นทองบาง ๆ ซ้อนพื้น */}
      <div aria-hidden className="pointer-events-none absolute -left-10 top-0 hidden h-72 w-80 rotate-3 rounded-2xl bg-[--color-gold]/12 blur-xl md:block" />
      <div className="container">
        <Reveal><h2 className="text-2xl font-semibold">ความประทับใจจากลูกค้า</h2></Reveal>
        <Stagger className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {DATA.map((it, idx) => (
            <Item key={idx}>
              <figure className="card overflow-hidden">
                <div className="relative h-44 w-full">
                  <Image src={it.img} alt="" fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover opacity-85" priority={idx===0}/>
                </div>
                <blockquote className="p-6 text-lg">“{it.quote}”</blockquote>
                <figcaption className="px-6 pb-6 text-sm text-muted-foreground">— {it.by}</figcaption>
              </figure>
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  )
}
