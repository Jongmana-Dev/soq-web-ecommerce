'use client'

import { motion } from 'framer-motion'
import { useLocale } from 'next-intl'

const feats = [
  { icon: '🧪', th: 'สูตรเข้มข้น ล้างคราบหนัก', en: 'Concentrated, removes tough stains' },
  { icon: '🛡️', th: 'ปลอดภัยต่อผิวและสเตนเลส', en: 'Safe for skin & stainless' },
  { icon: '♻️', th: 'สูตรลดกลิ่นฉุน ย่อยสลายง่าย', en: 'Low-odor, eco-friendly' },
  { icon: '⚡', th: 'ออกฤทธิ์เร็ว ประหยัดแรง', en: 'Fast-acting, saves time' },
]

export default function Product() {
  const locale = useLocale()

  return (
    <section id="features" className="section">
      <div className="container">
        <div className="mb-10">
          <h2 className="text-2xl md:text-4xl font-semibold">
            {locale === 'th' ? 'จุดเด่นของผลิตภัณฑ์' : 'Product Highlights'}
          </h2>
          <p className="text-white/70 mt-2">
            {locale === 'th' ? 'เลือกใช้เฉพาะคุณภาพระดับมืออาชีพ โทนงานพรีเมียม' : 'Professional-grade only, presented in a premium tone.'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {feats.map((f, i) => (
            <motion.div
              key={f.en}
              className="card glow"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="text-3xl">{f.icon}</div>
              <div className="mt-3 font-semibold">{locale === 'th' ? f.th : f.en}</div>
              <div className="text-sm text-white/70 mt-1">
                {locale === 'th' ? 'ทนทาน ใช้งานจริงในงานคราฟท์เบียร์และครัวมืออาชีพ' : 'Proven in craft brewing and pro kitchens.'}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
