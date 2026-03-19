'use client'

import { useRef, useState } from 'react'
import { useLocale } from 'next-intl'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import dynamic from 'next/dynamic'
const ProductModal = dynamic(() => import('@/components/modals/ProductModal'))
import type { ProductData } from '@/lib/products'

function AccentBackdrop() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, -50])
  const rotate = useTransform(scrollYProgress, [0, 1], [-15, -8])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.06])

  return (
    <motion.div
      ref={ref}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      style={{ y, rotate, scale }}
      className="absolute z-[2] top-[10%] bottom-[5%] left-[40%] right-[-5%] bg-[var(--accent)]/10"
    />
  )
}

interface UsageStep {
  title_th: string
  title_en: string
  description_th: string
  description_en: string
}

interface Props {
  products: ProductData[]
  usageSteps?: UsageStep[]
}

const R2 = '/hero-section/v2/responsive2'

export default function HeroV2({ products, usageSteps }: Props) {
  const locale = useLocale()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const product = products[0]

  return (
    <div style={{ backgroundColor: '#ECEDEA' }}>
      <section
        data-section="true"
        className="relative w-full overflow-hidden"
      >
        {/* ══════════ Mobile ══════════ */}
        <div className="lg:hidden" style={{ backgroundColor: '#ECEDEA' }}>
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="px-6 pt-20 mt-20 pb-4 text-center"
          >
            <div className="space-y-2">
              <h1 className="font-poppins text-3xl font-light leading-tight text-[var(--accent)] tracking-wide">
                SOQ.
              </h1>
              <h2 className="font-poppins text-3xl font-light leading-tight text-black uppercase tracking-wide">
                SAFE FOR SIP
              </h2>
            </div>

            <p className="mt-4 max-w-xs mx-auto font-poppins text-[17px] leading-relaxed text-black font-normal">
              {locale === 'th'
                ? 'ผลิตภัณฑ์สำหรับฆ่าเชื้อแบคทีเรียโดยไม่ต้องล้างน้ำออก ใช้ง่าย ปลอดภัย และมีประสิทธิภาพสูงด้วยมาตราฐานโรงงาน '
                : 'A no-rinse antibacterial sanitizer. Easy to use, safe, and highly effective, backed by factory-standard quality.'}
            </p>

            <div className="mt-4">
              <motion.button
                onClick={() => setIsModalOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="group relative inline-flex h-10 items-center justify-center overflow-hidden bg-[var(--accent)] px-8 font-prompt text-sm font-normal text-black shadow-xl shadow-black/5"
              >
                <span className="relative z-10">
                  {locale === 'th' ? 'ซื้อเลย' : 'Buy Now'}
                </span>
              </motion.button>
            </div>
          </motion.div>

          {/* Bottles — single image, scales with screen */}
          <div className="px-6 mt-30 drop-shadow-2xl">
            <img
              src={`${R2}/hero-bottles-1x.png`}
              alt="SOQ bottles"
              className="w-full h-auto block"
            />
          </div>
        </div>

        {/* ══════════ Desktop ══════════ */}
        <div className="hidden lg:block">
          <div className="relative w-full aspect-[2.2/1]">


            {/* Bottles — right side, vertically centered in section */}
            <div className="absolute inset-0 z-[5]">
              <div className="relative h-full mx-auto px-4 sm:px-6 lg:px-8">
                <div className="absolute top-[20%] bottom-[-5%] left-[38%] right-[3%] drop-shadow-2xl">
                  <Image
                    src={`${R2}/hero-bottles-1x.png`}
                    alt="SOQ bottles"
                    fill
                    sizes="(min-width: 1536px) 55vw, (min-width: 1280px) 60vw, 65vw"
                    className="object-contain object-center"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Text overlay */}
            <div className="absolute inset-0 z-10 container mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-2xl text-left"
              >
                <div className="space-y-3">
                  <h1 className="font-poppins text-5xl font-light leading-tight xl:text-6xl text-[var(--accent)] tracking-wide">
                    SOQ.
                  </h1>
                  <h2 className="font-poppins text-5xl font-light leading-tight text-black xl:text-6xl uppercase tracking-wide">
                    SAFE FOR SIP
                  </h2>
                </div>

                <motion.p
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-20 xl:mt-24 max-w-md font-poppins text-[17px] leading-relaxed text-black font-light"
                >
                {locale === 'th'
                ? 'ผลิตภัณฑ์สำหรับฆ่าเชื้อแบคทีเรียโดยไม่ต้องล้างน้ำออก ใช้ง่าย ปลอดภัย และมีประสิทธิภาพสูงด้วยมาตราฐานโรงงาน '
                : 'A no-rinse antibacterial sanitizer. Easy to use, safe, and highly effective, backed by factory-standard quality.'}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-10"
                >
                  <motion.button
                    onClick={() => setIsModalOpen(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="group relative inline-flex h-12 items-center justify-center overflow-hidden bg-[var(--accent)] px-12 font-prompt text-sm font-normal text-black shadow-xl shadow-black/5"
                  >
                    <span className="relative z-10">
                      {locale === 'th' ? 'ซื้อเลย' : 'Buy Now'}
                    </span>
                  </motion.button>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>

        {isModalOpen && product && (
          <ProductModal
            product={{
              id: product.id,
              name_th: product.name_th,
              name_en: product.name_en,
              long_desc_th: product.long_desc_th ?? product.short_desc_th,
              long_desc_en: product.long_desc_en ?? product.short_desc_en,
              image: product.image,
              images: product.images,
              sizes: product.sizes,
            }}
            onClose={() => setIsModalOpen(false)}
            locale={locale}
            usageSteps={usageSteps}
          />
        )}
      </section>
    </div>
  )
}
