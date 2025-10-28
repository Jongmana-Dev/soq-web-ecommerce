'use client'

import { motion } from 'framer-motion'
import { useLocale } from 'next-intl'

export default function Standards() {
  const locale = useLocale()

  return (
    <section id="standards" className="section">
      <div className="container grid md:grid-cols-2 gap-8 items-center">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="card glow"
        >
          <h3 className="text-xl md:text-2xl font-semibold">
            {locale === 'th' ? 'มาตรฐานการผลิตและความปลอดภัย' : 'Production Standards & Safety'}
          </h3>
          <ul className="mt-6 space-y-3 text-white/80 text-sm">
            <li>• {locale === 'th' ? 'วัตถุดิบพรีเมียม ผ่านการรับรอง' : 'Premium ingredients, certified sources'}</li>
            <li>• {locale === 'th' ? 'ควบคุมคุณภาพทุกล็อต' : 'Quality control per batch'}</li>
            <li>• {locale === 'th' ? 'ฉลากชัดเจน วิธีใช้ปลอดภัย' : 'Clear labels with safe instructions'}</li>
            <li>• {locale === 'th' ? 'รองรับการใช้งานเชิงพาณิชย์' : 'Ready for commercial use'}</li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="card glow"
        >
          <h3 className="text-xl md:text-2xl font-semibold">
            {locale === 'th' ? 'ประสิทธิภาพตามจริง' : 'Proven Efficacy'}
          </h3>
          <p className="mt-4 text-white/80 text-sm">
            {locale === 'th'
              ? 'ทดสอบกับงานจริง ทั้งอุปกรณ์สแตนเลส แก้ว และระบบทำความสะอาดในอุตสาหกรรมคราฟท์เบียร์'
              : 'Field-tested across stainless equipment, glassware, and cleaning systems in craft brewing.'}
          </p>
        </motion.div>
      </div>
    </section>
  )
}
