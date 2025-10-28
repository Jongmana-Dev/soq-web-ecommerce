'use client'

import { motion } from 'framer-motion'
import { useLocale } from 'next-intl'

const data = [
  { name: 'Nicha', role: 'Cafe owner', text: { th: 'กลิ่นไม่ฉุน ทำความสะอาดง่าย', en: 'Low odor, easy to clean' } },
  { name: 'Beam', role: 'Brewer', text: { th: 'คราบหินปูนหายไวมาก', en: 'Scale build-up disappears fast' } },
  { name: 'Rit', role: 'Bar manager', text: { th: 'แพ็กเกจดูพรีเมียม ลูกค้าชอบ', en: 'Premium look that customers like' } },
]

export default function Reviews() {
  const locale = useLocale()

  return (
    <section id="reviews" className="section">
      <div className="container">
        <h2 className="text-2xl md:text-4xl font-semibold mb-10">
          {locale === 'th' ? 'เสียงจากผู้ใช้จริง' : 'What customers say'}
        </h2>

        <div className="grid md:grid-cols-3 gap-5">
          {data.map((r, i) => (
            <motion.div
              key={r.name}
              className="card glow"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <p className="text-white/85">{r.text[locale as 'th' | 'en']}</p>
              <div className="mt-5 text-sm text-white/70">— {r.name}, {r.role}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
