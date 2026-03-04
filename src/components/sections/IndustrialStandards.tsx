'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import StandardsModal from '@/components/modals/StandardsModal'
import type { Certification } from '@/lib/cms'
import { Float, useParallax } from '@/components/motion'

type IndustrialStandardsProps = {
  certifications: Certification[]
}

export default function IndustrialStandards({ certifications }: IndustrialStandardsProps) {
  const locale = useLocale()
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Parallax for left/right columns
  const { ref: leftRef, y: leftY } = useParallax({ speed: 0.03 })
  const { ref: rightRef, y: rightY } = useParallax({ speed: -0.02 })

  return (
    <section
      id="industrial-standards"
      data-section="true"
      ref={ref}
      className="relative overflow-hidden bg-white py-20 lg:py-28"
    >
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">

          {/* Left Content */}
          <motion.div
            ref={leftRef}
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{ y: leftY }}
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
              <motion.button
                onClick={() => setIsModalOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex h-12 items-center justify-center gap-2 bg-neutral-900 px-8 font-prompt text-sm font-semibold text-white shadow-lg shadow-black/10"
              >
                {locale === 'th' ? 'รายละเอียด' : 'Details'}
                <i className="fa-solid fa-arrow-right" />
              </motion.button>
            </div>
          </motion.div>

          {/* Right: Logo Cloud */}
          <motion.div
            ref={rightRef}
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{ y: rightY }}
            className="relative overflow-hidden"
          >
             <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
               {certifications.map((cert, index) => (
                 <motion.div
                   key={cert.id}
                   initial={{ opacity: 0, scale: 0.85 }}
                   animate={inView ? { opacity: 1, scale: 1 } : {}}
                   transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                   whileHover={{ scale: 1.04 }}
                   className="flex items-center gap-3 px-6 py-4 border border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-100 transition-colors cursor-default"
                 >
                    <i className={`${cert.icon} text-xl opacity-60`} />
                    <span className="font-prompt font-medium text-sm text-neutral-800">
                      {locale === 'th' ? cert.label_th : cert.label_en}
                    </span>
                 </motion.div>
               ))}

               {/* Decorative floating blurs */}
               <Float amplitude={8} duration={6} className="absolute -top-10 -right-10 -z-10">
                 <div className="w-32 h-32 bg-[var(--accent)]/5 blur-3xl" />
               </Float>
               <Float amplitude={6} duration={8} delay={2} className="absolute -bottom-10 -left-10 -z-10">
                 <div className="w-40 h-40 bg-neutral-200/50 blur-3xl" />
               </Float>
             </div>
          </motion.div>

        </div>
      </div>

      {isModalOpen && (
        <StandardsModal
          certifications={certifications}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </section>
  )
}
