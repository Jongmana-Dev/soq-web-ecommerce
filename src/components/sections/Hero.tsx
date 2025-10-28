'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useLocale } from 'next-intl'

export default function Hero() {
  const locale = useLocale()

  return (
    <section id="hero" className="section pt-28">
      <div className="container grid md:grid-cols-2 gap-10 items-center">
        <div>
          <span className="badge-gold">SOQ</span>
          <h1 className="display mt-5 leading-tight" style={{ color: 'var(--brand-600)' }}>
            {locale === 'th' ? 'ทำความสะอาดระดับโปรเฟสชันนัล' : 'Professional-grade Cleaning'}
          </h1>
          <p className="mt-5 text-base/7" style={{ color: 'var(--muted)' }}>
            {locale === 'th'
              ? 'โทนสว่าง อบอุ่น พรีเมียมเหมือนตัวอย่าง พร้อม header/footer แบบ dark ให้สมดุล'
              : 'Warm, premium look like the reference, balanced with dark header and footer.'}
          </p>
          <div className="mt-8 flex items-center gap-3">
            <a href="#contact" className="btn btn-primary">
              {locale === 'th' ? 'ขอใบเสนอราคา' : 'Get a Quote'}
            </a>
            <a href="#features" className="btn btn-outline">{locale === 'th' ? 'ดูรายละเอียด' : 'Learn more'}</a>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 10 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          viewport={{ once: true }}
          className="relative h-[360px] md:h-[440px] rounded-2xl overflow-hidden card"
        >
          <Image
            src="https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1600&auto=format&fit=crop"
            alt="SOQ premium"
            fill
            className="object-cover"
            priority
          />
          <div
            className="absolute bottom-4 left-4 rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              color: '#0f1a14',
              background: 'linear-gradient(90deg, var(--accent-2), var(--accent))',
              border: '1px solid color-mix(in oklch, var(--accent) 75%, #000)'
            }}
          >
            Premium • Safe • Effective
          </div>
        </motion.div>
      </div>
    </section>
  )
}
