'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useLocale } from 'next-intl'

export default function Hero() {
  const locale = useLocale()

  return (
    <section id="hero" className="section pt-36">
      <div className="container grid md:grid-cols-2 gap-10 items-center">
        <div>
          <span className="badge-gold">SOQ</span>
          <h1 className="display mt-5 leading-tight">
            {locale === 'th' ? 'ทำความสะอาดระดับโปรเฟสชันนัล' : 'Professional-grade Cleaning'}
          </h1>
          <p className="mt-5 text-base/7 text-white/80">
            {locale === 'th'
              ? 'โทนสุภาพ หรูหรา ใช้งานง่าย รองรับภาษาไทยครบถ้วน พร้อมการเลื่อนหน้าแบบสมูทและ motion ที่พอดี'
              : 'Calm, luxurious tone. Easy to use. Full bilingual support with smooth scrolling and tasteful motion.'}
          </p>
          <div className="mt-8 flex items-center gap-3">
            <a href="#contact" className="btn btn-primary glow">
              {locale === 'th' ? 'ขอใบเสนอราคา' : 'Get a Quote'}
            </a>
            <a href="#features" className="btn">{locale === 'th' ? 'ดูรายละเอียด' : 'Learn more'}</a>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          viewport={{ once: true }}
          className="relative h-[360px] md:h-[440px] rounded-2xl overflow-hidden card glow"
        >
          <Image
            src="https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1600&auto=format&fit=crop"
            alt="SOQ premium"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute bottom-4 left-4 badge-gold">Premium • Safe • Effective</div>
        </motion.div>
      </div>
    </section>
  )
}
