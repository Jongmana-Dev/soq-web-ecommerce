import { Shield, Zap, Rocket, Sparkles } from 'lucide-react'

const items = [
  { icon: Shield, title: 'ปลอดภัยสุด', desc: 'CSP, Validation, Rate limit ครบ' },
  { icon: Zap, title: 'เร็วแรงมาก', desc: 'RSC, Streaming, ISR, CDN' },
  { icon: Rocket, title: 'พร้อมโต', desc: 'Design system, Analytics' },
  { icon: Sparkles, title: 'ลุคพรีเมียม', desc: 'เส้นสายสะอาด แสงเงากำลังดี' }
]

export default function Features() {
  return (
    <section id="features" className="py-24">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-6 px-6 md:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="rounded-xl border border-border bg-card p-6 text-card-foreground shadow">
            <div className="mb-3 inline-grid size-12 place-items-center rounded-xl bg-accent text-accent-foreground">
              <Icon size={20} />
            </div>
            <h3 className="text-xl font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}