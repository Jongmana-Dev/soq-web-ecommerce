'use client'

import { useLocale } from 'next-intl'

export default function Footer() {
  const locale = useLocale()

  return (
    // Footer จะใช้สีเข้ม (chrome) เสมอ ไม่สลับธีม
    <footer className="py-16" style={{ background: 'var(--chrome-2)', color: 'var(--chrome-text)' }}>
      <div className="container">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-white">SOQ</h3>
            <p className="mt-2 text-sm opacity-70">
              {locale === 'th' ? 'ทำความสะอาดระดับโปรเฟสชันนัล' : 'Professional-grade Cleaning'}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white">{locale === 'th' ? 'เมนู' : 'Menu'}</h4>
            <ul className="mt-3 space-y-2 text-sm opacity-70">
              <li><a href="#features" className="hover:opacity-100">{locale === 'th' ? 'สินค้า' : 'Products'}</a></li>
              <li><a href="#reviews" className="hover:opacity-100">{locale === 'th' ? 'รีวิว' : 'Reviews'}</a></li>
              <li><a href="#standards" className="hover:opacity-100">{locale === 'th' ? 'มาตราฐาน' : 'Standards'}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white">{locale === 'th' ? 'ช่วยเหลือ' : 'Support'}</h4>
            <ul className="mt-3 space-y-2 text-sm opacity-70">
              <li><a href="#faqs" className="hover:opacity-100">{locale === 'th' ? 'คำถามที่พบบ่อย' : 'FAQs'}</a></li>
              <li><a href="#contact" className="hover:opacity-100">{locale === 'th' ? 'ติดต่อเรา' : 'Contact'}</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm opacity-50">
          © {new Date().getFullYear()} SOQ. All rights reserved.
        </div>
      </div>
    </footer>
  )
}