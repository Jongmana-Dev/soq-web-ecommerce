'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import dynamic from 'next/dynamic'
const StandardsModal = dynamic(() => import('@/components/modals/StandardsModal'))
import type { Certification } from '@/lib/cms'
import { useParallax } from '@/components/motion'

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
      className="relative overflow-hidden bg-[#ECEDEA] py-10 lg:py-16"
    >
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">

          {/* Left Content */}
          <motion.div
            ref={leftRef}
            initial={{ opacity: 0, y: 60 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            style={{ y: leftY }}
            className="flex flex-col justify-center"
          >
            <h2 className="mb-2 font-poppins text-3xl font-extralight leading-tight text-neutral-400 sm:text-4xl lg:text-5xl">
              {locale === 'th' ? 'Industrial Standards' : 'Industrial Standards'}
            </h2>
            <h3 className="mb-16 lg:mb-20 font-poppins text-3xl font-extralight leading-tight text-neutral-800 sm:text-4xl lg:text-5xl">
              {locale === 'th' ? 'มาตรฐานโรงงาน' : 'Factory Standards'}
            </h3>

            <p className="mb-8 max-w-lg text-[16px] leading-relaxed text-black font-light sm:text-base">
              {locale === 'th'
                ? 'สินค้าได้รับการผลิตภายใต้โรงงานที่ได้มาตรฐาน ทั้งในด้านคุณภาพ ความปลอดภัยและขั้นตอนการ ควบ คุมการผลิตอย่างเข้มงวด เพื่อให้มั่นใจว่าสินค้า ได้คุณภาพ และปลอดภัยต่อผู้บริโภค'
                : 'Our products are manufactured in internationally certified facilities, ensuring quality and safety at every stage of production.'}
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <motion.button
                onClick={() => setIsModalOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex items-center gap-2 font-prompt text-base font-light text-[var(--accent)] underline underline-offset-4"
              >
                {locale === 'th' ? 'อ่านรายละเอียด' : 'Read more'}
              </motion.button>
            </div>
          </motion.div>

          {/* Right: Logo Cloud */}
          <motion.div
            ref={rightRef}
            initial={{ opacity: 0, y: 60 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
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
