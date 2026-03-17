'use client'

import { useRef, useState } from 'react'
import { useLocale } from 'next-intl'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import ProductModal from '@/components/modals/ProductModal'
import GeometricOverlay from '@/components/HeroSection/GeometricOverlay'
import type { ProductData } from '@/lib/products'

interface Props {
  products: ProductData[]
}

export default function HeroV3({ products }: Props) {
  const locale = useLocale()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const product = products[0]
  const sectionRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })

  // Subtle geometric shape movement on scroll
  const geoY = useTransform(scrollYProgress, [0, 1], [0, -60])
  const geoRotate = useTransform(scrollYProgress, [0, 1], [-12, -6])
  const geoScale = useTransform(scrollYProgress, [0, 1], [1, 1.08])

  return (
    <section
      ref={sectionRef}
      id="hero"
      data-section="true"
      className="relative min-h-[85vh] w-full bg-[#ECEDEA] overflow-hidden"
    >
      <div className="relative mx-auto flex min-h-[85vh] max-w-[1440px] px-4 sm:px-6 lg:px-8 pt-[76px]">
        <div className="flex w-full flex-col lg:flex-row items-center">

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="w-full lg:flex-1 min-w-0 text-center lg:text-left pt-4 lg:pt-0 shrink-0"
          >
            <div className="space-y-2 sm:space-y-3">
              <h1 className="font-prompt text-5xl font-light leading-tight sm:text-6xl lg:text-8xl xl:text-9xl text-[var(--accent)] tracking-tighter">
                SOQ.
              </h1>
              <h2 className="font-prompt text-2xl font-light leading-tight text-neutral-900 sm:text-3xl lg:text-5xl xl:text-6xl uppercase tracking-wide">
                SAFE FOR SIP
              </h2>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="mt-4 lg:mt-6 max-w-md mx-auto lg:mx-0 font-poppins text-xs leading-relaxed text-neutral-500 sm:text-sm lg:text-base"
            >
              {locale === 'th'
                ? 'น้ำยาฆ่าเชื้อและทำความสะอาดอุปกรณ์ดิบ เบียร์และไวน์แบบไม่ต้องล้างออก ใช้ง่าย ปลอดภัย และมีประสิทธิภาพสูง'
                : 'Superior cleaner and high-foaming sanitizer that is effective and safe to use. No-rinse formula.'}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 lg:mt-8"
            >
              <motion.button
                onClick={() => setIsModalOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="group relative inline-flex h-12 lg:h-14 items-center justify-center overflow-hidden bg-[var(--accent)] px-8 lg:px-12 font-prompt text-base lg:text-lg font-bold text-black shadow-xl shadow-black/5"
              >
                <span className="relative z-10">
                  {locale === 'th' ? 'ซื้อเลย' : 'Buy Now'}
                </span>
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Bottle + Geometric shape behind */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full lg:flex-1 flex-1 h-[300px] sm:h-[350px] lg:h-[calc(85vh-76px)] -mt-4 lg:mt-0"
          >
            {/* Geometric overlay behind bottle — moves subtly on scroll */}
            <motion.div
              className="absolute inset-0 z-0 overflow-visible"
              style={{ y: geoY, rotate: geoRotate, scale: geoScale }}
            >
              <GeometricOverlay progress={0} triangleScale={1} />
            </motion.div>

            {/* Static bottle image */}
            <div className="relative z-10 h-full w-full flex items-center justify-center">
              <div className="relative w-[115%] h-[115%]">
                <Image
                  src="/hero-section/v3/frame-0061.webp"
                  alt="SOQ. Safe for Sip"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain scale-110"
                  priority
                />
              </div>
            </div>
          </motion.div>
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
        />
      )}
    </section>
  )
}
