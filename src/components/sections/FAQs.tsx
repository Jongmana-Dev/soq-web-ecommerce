'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import ContactModal from '@/components/modals/ContactModal'

type FAQItem = {
  id: string
  question_th: string
  question_en: string
  answer_th: string
  answer_en: string
  icon: string
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: '1',
    icon: 'fa-solid fa-box',
    question_th: 'สินค้าแตกต่างจากที่อื่นอย่างไร?',
    question_en: 'How is the product different?',
    answer_th: 'Star San เป็นน้ำยาฆ่าเชื้อที่ไม่ต้องล้างน้ำซ้ำ (No-Rinse) ผลิตภัณฑ์ของเราได้รับการรับรองคุณภาพจากหน่วยงานมาตรฐานและใช้ในอุตสาหกรรมการต้มเบียร์ทั่วโลก',
    answer_en: 'Star San is a no-rinse sanitizer. Our products are certified by quality standards agencies and used in brewing industries worldwide.',
  },
  {
    id: '2',
    icon: 'fa-solid fa-flask',
    question_th: 'สินค้าผลิตที่ไหน?',
    question_en: 'Where are the products made?',
    answer_th: 'ผลิตภัณฑ์ของเรานำเข้าจากโรงงานที่ได้รับมาตรฐาน FDA และผ่านการตรวจสอบคุณภาพก่อนจำหน่ายทุกล็อต',
    answer_en: 'Our products are imported from FDA-certified factories and undergo quality inspection before every batch is sold.',
  },
  {
    id: '3',
    icon: 'fa-solid fa-truck-fast',
    question_th: 'มีการจัดส่งต่างประเทศไหม?',
    question_en: 'Is international shipping available?',
    answer_th: 'ขณะนี้เราจัดส่งเฉพาะในประเทศไทย แต่กำลังเตรียมการจัดส่งไปยังประเทศในภูมิภาคอาเซียนเร็วๆ นี้',
    answer_en: 'Currently we only ship within Thailand, but we are preparing to ship to ASEAN countries soon.',
  },
  {
    id: '4',
    icon: 'fa-solid fa-rotate',
    question_th: 'นโยบายการคืน/เปลี่ยนสินค้า?',
    question_en: 'Return/exchange policy?',
    answer_th: 'สามารถคืนหรือเปลี่ยนสินค้าได้ภายใน 7 วันหลังได้รับสินค้า หากสินค้าชำรุดหรือไม่ตรงตามคำสั่งซื้อ',
    answer_en: 'You can return or exchange within 7 days of receiving the product if it is damaged or does not match your order.',
  },
  {
    id: '5',
    icon: 'fa-solid fa-clock',
    question_th: 'ใช้เวลาจัดส่งนานแค่ไหน?',
    question_en: 'How long does shipping take?',
    answer_th: 'จัดส่งภายใน 1-3 วันทำการในเขตกรุงเทพฯ และ 3-5 วันทำการในต่างจังหวัด',
    answer_en: 'Delivery within 1-3 business days in Bangkok and 3-5 business days for other provinces.',
  },
  {
    id: '6',
    icon: 'fa-solid fa-headset',
    question_th: 'ติดต่อฝ่ายบริการลูกค้าได้อย่างไร?',
    question_en: 'How to contact customer service?',
    answer_th: 'ติดต่อเราได้ทาง Line Official, Facebook Messenger หรือ Email ตลอด 24 ชั่วโมง',
    answer_en: 'Contact us via Line Official, Facebook Messenger or Email 24/7.',
  },
]

export default function FAQ() {
  const locale = useLocale()
  const [openId, setOpenId] = useState<string | null>(null)
  const [showContact, setShowContact] = useState(false)
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })

  const toggleFAQ = (id: string) => {
    setOpenId(openId === id ? null : id)
  }

  return (
    <section
      id="faq"
      ref={ref}
      className="relative bg-[#F5F5F7] py-20 lg:py-28"
    >
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center lg:mb-16"
        >
          <span className="mb-4 inline-block rounded-full bg-white px-4 py-1.5 text-sm font-medium text-neutral-500 shadow-sm border border-neutral-100">
            FAQs
          </span>
          <h2 className="mb-4 font-prompt text-3xl font-light text-neutral-800 sm:text-4xl lg:text-5xl">
            {locale === 'th' ? 'คำถามที่' : 'Frequently Asked'} <br/>
            <span className="font-semibold">{locale === 'th' ? 'พบบ่อย' : 'Questions'}</span>
          </h2>
        </motion.div>

        {/* FAQ Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {FAQ_ITEMS.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <div
                className={`overflow-hidden bg-white shadow-sm transition-all duration-300 ${
                  openId === item.id
                    ? 'ring-1 ring-[var(--accent)] border-transparent'
                    : 'hover:shadow-md border border-gray-100'
                }`}
              >
                <button
                  onClick={() => toggleFAQ(item.id)}
                  aria-expanded={openId === item.id}
                  className="flex w-full items-start gap-4 p-6 text-left"
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center transition-colors ${
                      openId === item.id
                        ? 'bg-[var(--accent)] text-black'
                        : 'bg-neutral-100 text-neutral-500'
                    }`}
                  >
                    <i className={`${item.icon} text-sm`} />
                  </span>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                       <span className="font-prompt text-lg font-medium text-neutral-900">
                         {locale === 'th' ? item.question_th : item.question_en}
                       </span>
                       <span
                        className={`ml-2 flex h-6 w-6 shrink-0 items-center justify-center transition-transform duration-300 ${
                          openId === item.id ? 'rotate-180 text-black' : 'text-neutral-400'
                        }`}
                      >
                        <i className="fa-solid fa-chevron-down text-xs" />
                      </span>
                    </div>

                    <AnimatePresence>
                      {openId === item.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="pt-2 text-neutral-500 leading-relaxed text-sm">
                             {locale === 'th' ? item.answer_th : item.answer_en}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <p className="mb-4 text-neutral-500">
            {locale === 'th' ? 'ยังมีคำถามอื่นอีกไหม?' : 'Still have questions?'}
          </p>
          <button
            onClick={() => setShowContact(true)}
            className="inline-flex items-center gap-2 bg-neutral-900 px-6 py-3 font-prompt text-sm font-semibold text-white shadow-lg shadow-neutral-900/10 transition-all hover:bg-black hover:scale-105"
          >
            <i className="fa-solid fa-message" />
            {locale === 'th' ? 'ติดต่อเรา' : 'Contact Us'}
          </button>
        </motion.div>
      </div>

      {showContact && <ContactModal onClose={() => setShowContact(false)} />}
    </section>
  )
}
