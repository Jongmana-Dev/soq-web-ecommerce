'use client'

import { useLocale } from 'next-intl'

export default function Contact() {
  const locale = useLocale()

  return (
    <section id="contact" className="section">
      <div className="container grid md:grid-cols-2 gap-8 items-center">
        <div className="card glow">
          <h3 className="text-xl md:text-2xl font-semibold">
            {locale === 'th' ? 'ติดต่อทีม SOQ' : 'Contact SOQ Team'}
          </h3>
          <p className="text-white/80 mt-3 text-sm">
            {locale === 'th'
              ? 'ขอใบเสนอราคา สอบถามสเปก หรือปรึกษาการใช้งานสำหรับร้าน/โรงงาน'
              : 'Request a quote, specs, or usage advice for your venue/facility.'}
          </p>
          <form action="/api/contact" method="post" className="mt-6 grid gap-3">
            <input
              name="name"
              required
              placeholder={locale === 'th' ? 'ชื่อ' : 'Name'}
              className="rounded-lg bg-black/20 border border-white/10 px-4 py-3 outline-none"
            />
            <input
              name="email"
              required
              type="email"
              placeholder="Email"
              className="rounded-lg bg-black/20 border border-white/10 px-4 py-3 outline-none"
            />
            <textarea
              name="message"
              rows={4}
              placeholder={locale === 'th' ? 'รายละเอียด' : 'Message'}
              className="rounded-lg bg-black/20 border border-white/10 px-4 py-3 outline-none"
            />
            <button className="btn btn-primary glow">{locale === 'th' ? 'ส่งข้อความ' : 'Send message'}</button>
          </form>
        </div>

        <div className="card">
          <div className="text-sm text-white/70">
            <div>LINE: @soq-clean</div>
            <div>Facebook: SOQ Cleaners</div>
            <div>Email: hello@soq.example</div>
          </div>
          <a href="#hero" className="mt-6 inline-block underline">
            {locale === 'th' ? 'กลับขึ้นด้านบน' : 'Back to top'}
          </a>
        </div>
      </div>
    </section>
  )
}
