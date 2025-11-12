'use client'

import { useLocale } from 'next-intl'
import Image from 'next/image'
import { motion } from 'framer-motion'

// (จำลอง) ข้อมูลสินค้า
const products = [
  {
    id: 1,
    th: { name: 'น้ำยาทำความสะอาดอเนกประสงค์', desc: 'สำหรับทุกพื้นผิว ปลอดภัย' },
    en: { name: 'All-Purpose Cleaner', desc: 'For all surfaces, non-toxic' },
    img: 'https://images.unsplash.com/photo-1621102604810-5f64ea7e0034?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 2,
    th: { name: 'สเปรย์ฆ่าเชื้อแบคทีเรีย', desc: 'ฆ่าเชื้อ 99.9% กลิ่นหอมสะอาด' },
    en: { name: 'Disinfectant Spray', desc: 'Kills 99.9% of germs, fresh scent' },
    img: 'https://images.unsplash.com/photo-1583947215259-38e39be84149?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 3,
    th: { name: 'น้ำยาเช็ดกระจกสูตรพรีเมียม', desc: 'ใสสะอาด ไร้คราบ ป้องกันฝุ่น' },
    en: { name: 'Premium Glass Cleaner', desc: 'Streak-free shine, anti-dust' },
    img: 'https://images.unsplash.com/photo-1617351408662-fad0859b2076?q=80&w=800&auto=format&fit=crop'
  }
]

export default function Product() {
  const locale = useLocale()

  return (
    <section id="features" className="section"> {/* อ้างอิง ID จาก Navbar */}
      <div className="container">
        <div className="text-center max-w-2xl mx-auto">
          <span className="badge-gold">Products</span>
          <h2 className="display mt-4">
            {locale === 'th' ? 'ผลิตภัณฑ์ของเรา' : 'Our Signature Products'}
          </h2>
          <p className="mt-4 text-base/7" style={{ color: 'var(--muted)' }}>
            {locale === 'th'
              ? 'คัดสรรส่วนผสมที่ดีที่สุดเพื่อความสะอาดอย่างเหนือชั้น'
              : 'Curated with the finest ingredients for a superior clean.'}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {products.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="card" // ใช้ .card style จาก globals.css
            >
              <div className="relative h-60 w-full rounded-lg overflow-hidden mb-4">
                <Image src={p.img} alt={locale === 'th' ? p.th.name : p.en.name} fill className="object-cover" />
              </div>
              <h3 className="text-xl font-semibold" style={{ color: 'var(--brand-600)' }}>
                {locale === 'th' ? p.th.name : p.en.name}
              </h3>
              <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
                {locale === 'th' ? p.th.desc : p.en.desc}
              </p>
              <a href="#" className="btn btn-outline mt-4 text-sm">
                {locale === 'th' ? 'ดูรายละเอียด' : 'View Details'}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}