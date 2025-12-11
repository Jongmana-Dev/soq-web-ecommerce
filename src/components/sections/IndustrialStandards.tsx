'use client'

import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

const CERTIFICATIONS = [
  { icon: 'fa-solid fa-certificate', label: 'FDA Certified', label_th: 'FDA รับรอง' },
  { icon: 'fa-solid fa-shield-halved', label: 'ISO 9001', label_th: 'ISO 9001' },
  { icon: 'fa-solid fa-leaf', label: 'Eco-Friendly', label_th: 'เป็นมิตรกับสิ่งแวดล้อม' },
  { icon: 'fa-solid fa-flask-vial', label: 'Lab Tested', label_th: 'ทดสอบในห้องปฏิบัติการ' },
  { icon: 'fa-solid fa-award', label: 'Quality Assured', label_th: 'รับประกันคุณภาพ' },
  { icon: 'fa-solid fa-handshake', label: 'Trusted Brand', label_th: 'แบรนด์ที่ไว้วางใจ' },
  { icon: 'fa-solid fa-check-double', label: 'GMP Standard', label_th: 'มาตรฐาน GMP' },
  { icon: 'fa-solid fa-globe', label: 'World Class', label_th: 'ระดับโลก' },
]

import { useState } from 'react'
import StandardsModal from '@/components/modals/StandardsModal'

export default function IndustrialStandards() {
  const locale = useLocale()
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <section
      id="industrial-standards"
      ref={ref}
      className="relative overflow-hidden bg-white py-20 lg:py-28"
    >
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
          
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center"
          >
            <h2 className="mb-6 font-prompt text-3xl font-light leading-tight text-neutral-800 sm:text-4xl lg:text-5xl">
              {locale === 'th' ? 'มาตรฐานระดับ' : 'Industrial'} <br/>
              <span className="font-semibold">{locale === 'th' ? 'อุตสาหกรรม' : 'Standards'}</span>
            </h2>

            <p className="mb-8 max-w-lg text-base leading-relaxed text-neutral-500 sm:text-lg font-light">
              {locale === 'th'
                ? 'ผลิตภัณฑ์ของเราผลิตจากโรงงานที่ได้รับการรับรองมาตรฐานสากล มั่นใจได้ในคุณภาพและความปลอดภัยทุกขั้นตอนการผลิต'
                : 'Our products are manufactured in internationally certified facilities, ensuring quality and safety at every stage of production.'}
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex h-12 items-center justify-center gap-2 bg-neutral-900 px-8 font-prompt text-sm font-semibold text-white transition-all hover:bg-black hover:scale-105 shadow-lg shadow-black/10"
              >
                {locale === 'th' ? 'รายละเอียด' : 'Details'}
                <i className="fa-solid fa-arrow-right" />
              </button>
            </div>
          </motion.div>

          {/* Right: Logo Cloud */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
             <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
               {CERTIFICATIONS.map((cert, index) => (
                 <motion.div
                   key={cert.label}
                   initial={{ opacity: 0, scale: 0.8 }}
                   animate={inView ? { opacity: 1, scale: 1 } : {}}
                   transition={{ duration: 0.5, delay: index * 0.1 }}
                   className="flex items-center gap-3 px-6 py-4 border border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-100 transition-colors cursor-default"
                 >
                    <i className={`${cert.icon} text-xl opacity-60`} />
                    <span className="font-prompt font-medium text-sm text-neutral-800">
                      {locale === 'th' ? cert.label_th : cert.label}
                    </span>
                 </motion.div>
               ))}
               
               {/* Decorative floating dots/elements */}
               <div className="absolute -top-10 -right-10 w-32 h-32 bg-[var(--accent)]/5 blur-3xl -z-10" />
               <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-neutral-200/50 blur-3xl -z-10" />
             </div>
          </motion.div>

        </div>
      </div>

      {isModalOpen && <StandardsModal onClose={() => setIsModalOpen(false)} />}
    </section>
  )
}
