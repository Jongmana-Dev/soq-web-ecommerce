'use client'

import { useState, useEffect } from 'react'
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

export default function FAQ() {
  const locale = useLocale()
  const [openId, setOpenId] = useState<string | null>(null)
  const [showContact, setShowContact] = useState(false)
  const [faqs, setFaqs] = useState<FAQItem[]>([])
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })

  useEffect(() => {
    fetch('/api/faqs')
      .then((res) => res.json())
      .then((json) => setFaqs(json.data ?? []))
      .catch(() => setFaqs([]))
  }, [])

  const toggleFAQ = (id: string) => {
    setOpenId(openId === id ? null : id)
  }

  if (faqs.length === 0) return null

  return (
    <section
      id="faq"
      data-section="true"
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

        {/* FAQ Stack */}
        <div className="flex flex-col gap-4 max-w-3xl mx-auto">
          {faqs.map((item, index) => (
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
