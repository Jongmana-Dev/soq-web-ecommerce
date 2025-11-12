'use client'

import { useLocale } from 'next-intl'
import Image from 'next/image'

export default function Reviews() {
  const locale = useLocale()

  return (
    <section id="reviews" className="section">
      <div className="container text-center max-w-3xl mx-auto">
        <div className="relative h-20 w-20 rounded-full overflow-hidden mx-auto border-2" style={{ borderColor: 'var(--line)'}}>
          {/* รูปโปรไฟล์ลูกค้า (จำลอง) */}
          <Image
            src="https://images.unsplash.com/photo-1557053910-d9eadeed1c58?q=80&w=800&auto=format&fit=crop"
            alt="Customer review"
            fill
            className="object-cover"
          />
        </div>
        
        <blockquote className="text-xl md:text-2xl font-medium leading-relaxed mt-6" style={{ color: 'var(--brand-600)' }}>
          <p>
            {locale === 'th'
              ? '“ประทับใจมากค่ะ สินค้าใช้ดีมาก บ้านสะอาดขึ้นทันที แถมยังปลอดภัยกับลูกเล็กและสัตว์เลี้ยงด้วย”'
              : '“Very impressed! The product works wonders, my home feels instantly cleaner, and it\'s safe for my kids and pets.”'}
          </p>
        </blockquote>
        
        <footer className="mt-4">
          <cite className="font-semibold not-italic">
            {locale === 'th' ? 'คุณสิรินยา' : 'Sirinya K.'}
          </cite>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            {locale === 'th' ? 'ลูกค้าจริง, กรุงเทพฯ' : 'Verified Customer, Bangkok'}
          </p>
        </footer>
      </div>
    </section>
  )
}