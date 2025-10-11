import Image from 'next/image'

const products = [
  { id: 1, title: 'SOQ Classic', desc: 'เรียบหรู ใช้ง่าย ครบ', img: '/assets/product-1.png' },
  { id: 2, title: 'SOQ Pro', desc: 'ปรับแต่งยืดหยุ่น ภาพคม', img: '/assets/product-2.png' },
  { id: 3, title: 'SOQ Ultra', desc: 'จัดเต็ม Animation/Effects', img: '/assets/product-3.png' }
]

export default function Showcase() {
  return (
    <section id="showcase" className="py-24">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {products.map((p) => (
            <div key={p.id} className="rounded-xl border border-border bg-card p-6 text-card-foreground shadow">
              <Image src={p.img} alt={p.title} width={640} height={420}
                     className="rounded-lg border border-border shadow" />
              <h3 className="mt-3 text-xl font-semibold">{p.title}</h3>
              <p className="text-sm text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}