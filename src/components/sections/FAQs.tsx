'use client'

import { useLocale } from 'next-intl'

const faqs = [
  { q: { th: 'ใช้กับสแตนเลสได้ไหม?', en: 'Safe for stainless?' }, a: { th: 'ได้ ปลอดภัยเมื่อผสมน้ำตามคำแนะนำ', en: 'Yes, safe when diluted as instructed.' } },
  { q: { th: 'มีกลิ่นฉุนไหม?', en: 'Strong odor?' }, a: { th: 'กลิ่นต่ำมาก', en: 'Very low odor.' } },
  { q: { th: 'เก็บรักษาอย่างไร?', en: 'Storage?' }, a: { th: 'เก็บในที่แห้ง อุณหภูมิห้อง ปิดฝาให้สนิท', en: 'Store sealed in dry, room temperature.' } },
]

export default function FAQs() {
  const locale = useLocale()

  return (
    <section id="faqs" className="section">
      <div className="container">
        <h2 className="text-2xl md:text-4xl font-semibold">{locale === 'th' ? 'คำถามที่พบบ่อย' : 'FAQs'}</h2>
        <div className="mt-8 space-y-4">
          {faqs.map((f, i) => (
            <div key={i} className="card">
              <div className="font-semibold">{f.q[locale as 'th' | 'en']}</div>
              <div className="text-white/80 mt-2 text-sm">{f.a[locale as 'th' | 'en']}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
