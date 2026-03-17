'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'
import { useReveal } from '@/hooks/useReveal'
import ContactModal from '@/components/modals/ContactModal'
import type { FAQItem } from '@/lib/cms'

interface FAQsProps {
  faqs: FAQItem[]
}

export default function FAQ({ faqs }: FAQsProps) {
  const locale = useLocale()
  const [showContact, setShowContact] = useState(false)
  const { ref } = useReveal()

  if (faqs.length === 0) return null

  return (
    <section
      id="faq"
      data-section="true"
      ref={ref}
      className="reveal relative bg-[#ECEDEA] py-20 lg:py-28"
    >
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12 lg:mb-16 pl-4 border-l-4 border-[var(--accent)]">
          <h2 className="font-prompt text-3xl font-bold leading-tight text-neutral-800 sm:text-4xl lg:text-5xl">
            {locale === 'th' ? 'คำถามที่' : 'Frequently Asked'} <br />
            <span className="text-[var(--accent)]">{locale === 'th' ? 'พบบ่อย' : 'Questions'}</span>
          </h2>
          <p className="mt-4 text-neutral-500 font-light">
            {locale === 'th'
              ? 'รวมคำถามที่ลูกค้าถามบ่อยเกี่ยวกับผลิตภัณฑ์ SOQ'
              : 'Common questions about SOQ products'}
          </p>
        </div>

        {/* FAQ Grid — 1 col mobile, 2 col tablet, 3 col desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {faqs.map((item, index) => (
            <div
              key={item.id}
              className={`reveal reveal-delay-${Math.min(index + 1, 6)} flex flex-col`}
            >
              {/* Icon */}
              <span className="mb-4 flex h-12 w-12 items-center justify-center text-[var(--accent)]">
                <i className={`${item.icon} text-2xl`} />
              </span>

              {/* Question */}
              <h3 className="font-prompt text-lg font-semibold text-neutral-900 mb-2 leading-snug">
                {locale === 'th' ? item.question_th : item.question_en}
              </h3>

              {/* Answer */}
              <p className="text-sm text-neutral-500 leading-relaxed flex-1">
                {locale === 'th' ? item.answer_th : item.answer_en}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="reveal reveal-delay-4 mt-16 text-center">
          <p className="mb-4 text-neutral-500">
            {locale === 'th' ? 'ยังมีคำถามอื่นอีกไหม?' : 'Still have questions?'}
          </p>
          <button
            onClick={() => setShowContact(true)}
            className="inline-flex items-center gap-2 bg-neutral-900 px-6 py-3.5 font-prompt text-sm font-semibold text-white shadow-lg shadow-neutral-900/10 hover:scale-105 active:scale-97 transition-transform"
          >
            <i className="fa-solid fa-message" />
            {locale === 'th' ? 'ติดต่อเรา' : 'Contact Us'}
          </button>
        </div>
      </div>

      {showContact && <ContactModal onClose={() => setShowContact(false)} />}
    </section>
  )
}
