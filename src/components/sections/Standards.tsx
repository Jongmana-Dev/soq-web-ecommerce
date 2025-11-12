'use client'

import { useLocale } from 'next-intl'
import Image from 'next/image'
import { motion } from 'framer-motion'

export default function Standards() {
  const locale = useLocale()

  return (
    <section id="standards" className="section" style={{ background: 'var(--surface-2)'}}>
      <div className="container grid md:grid-cols-2 gap-10 items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative h-80 md:h-96 w-full rounded-2xl overflow-hidden card"
        >
          {/* รูปโรงงาน/แล็บสะอาดๆ */}
          <Image
            src="https://images.unsplash.com/photo-1567942712618-9c5b4d350854?q=80&w=1200&auto=format&fit=crop"
            alt="Clean modern factory"
            fill
            className="object-cover"
          />
        </motion.div>
        
        <div>
          <span className="badge-gold">Quality</span>
          <h2 className="display mt-4">
            {locale === 'th' ? 'มาตรฐานระดับโลก' : 'World-Class Standards'}
          </h2>
          <p className="mt-4 text-base/7" style={{ color: 'var(--muted)' }}>
            {locale === 'th'
              ? 'โรงงานของเราผ่านการรับรองมาตรฐานสากล ISO 9001 และ GMP มั่นใจได้ในคุณภาพและความปลอดภัย'
              : 'Our factory is certified with ISO 9001 and GMP international standards, ensuring quality and safety.'}
          </p>
          <ul className="mt-6 space-y-3 font-medium">
            <li className="flex items-center gap-3">
              <span style={{ color: 'var(--brand)' }}>✓</span> ISO 9001 Certified
            </li>
            <li className="flex items-center gap-3">
              <span style={{ color: 'var(--brand)' }}>✓</span> GMP Certified Facility
            </li>
            <li className="flex items-center gap-3">
              <span style={{ color: 'var(--brand)' }}>✓</span> Eco-Friendly Production
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}