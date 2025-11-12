'use client'

import { useLocale } from 'next-intl'

export default function Contact() {
  const locale = useLocale()

  // ฟังก์ชัน Input field (เพื่อใช้ CSS Var)
  const inputStyles = "w-full rounded-lg border p-3 bg-transparent"

  return (
    <section id="contact" className="section">
      <div className="container grid md:grid-cols-2 gap-10">
        <div>
          <h2 className="display">{locale === 'th' ? 'ติดต่อเรา' : 'Get in Touch'}</h2>
          <p className="mt-4 text-base/7" style={{ color: 'var(--muted)' }}>
            {locale === 'th'
              ? 'สนใจเป็นตัวแทนจำหน่าย หรือต้องการใบเสนอราคา? กรอกฟอร์มนี้หรือติดต่อเราได้โดยตรง'
              : 'Interested in becoming a distributor or need a quote? Fill out this form or contact us directly.'}
          </p>
          <div className="mt-6 space-y-2 font-medium">
            <p>Email: contact@soq.com</p>
            <p>{locale === 'th' ? 'โทร' : 'Phone'}: 02-123-4567</p>
          </div>
        </div>
        
        <form className="card space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">{locale === 'th' ? 'ชื่อ' : 'Name'}</label>
            <input type="text" id="name" className={inputStyles} style={{ borderColor: 'var(--line-strong)' }} />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <input type="email" id="email" className={inputStyles} style={{ borderColor: 'var(--line-strong)' }} />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-1">{locale === 'th' ? 'ข้อความ' : 'Message'}</label>
            <textarea id="message" rows={4} className={inputStyles} style={{ borderColor: 'var(--line-strong)' }} />
          </div>
          <button type="submit" className="btn btn-primary w-full">
            {locale === 'th' ? 'ส่งข้อความ' : 'Send Message'}
          </button>
        </form>
      </div>
    </section>
  )
}