'use client'

import { useLocale } from 'next-intl'

// (จำลอง) ข้อมูล FAQ
const faqs = [
  {
    q_th: 'สินค้าปลอดภัยต่อสัตว์เลี้ยงหรือไม่?',
    q_en: 'Are your products safe for pets?',
    a_th: 'ปลอดภัยแน่นอนค่ะ ผลิตภัณฑ์ของเราใช้สารสกัดจากธรรมชาติ (plant-based) 100% ไม่เป็นอันตรายต่อเด็กและสัตว์เลี้ยง',
    a_en: 'Absolutely. Our products are 100% plant-based and non-toxic, making them completely safe for children and pets.'
  },
  {
    q_th: 'มีหน้าร้านหรือไม่?',
    q_en: 'Do you have a physical store?',
    a_th: 'ขณะนี้เราจำหน่ายผ่านช่องทางออนไลน์เป็นหลัก แต่คุณสามารถนัดหมายเพื่อเข้าชมสินค้าตัวอย่างได้ที่โชว์รูมของเรา',
    a_en: 'We currently sell primarily online, but you can schedule an appointment to visit our showroom.'
  },
  {
    q_th: 'ใช้เวลาจัดส่งกี่วัน?',
    q_en: 'How long does delivery take?',
    a_th: 'กรุงเทพฯ และปริมณฑล 1-2 วันทำการ ต่างจังหวัด 2-3 วันทำการ',
    a_en: 'Bangkok and metropolitan area 1-2 business days. Other provinces 2-3 business days.'
  }
]

export default function FAQs() {
  const locale = useLocale()

  return (
    <section id="faqs" className="section" style={{ background: 'var(--surface-2)'}}>
      <div className="container max-w-3xl mx-auto">
        <div className="text-center">
          <h2 className="display">{locale === 'th' ? 'คำถามที่พบบ่อย' : 'Frequently Asked Questions'}</h2>
        </div>
        <div className="mt-10 space-y-6">
          {faqs.map((faq, i) => (
            <div key={i} className="pb-6 border-b" style={{ borderColor: 'var(--line)' }}>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--brand-600)' }}>
                {locale === 'th' ? faq.q_th : faq.q_en}
              </h3>
              <p className="mt-2 text-base/7" style={{ color: 'var(--muted)' }}>
                {locale === 'th' ? faq.a_th : faq.a_en}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}