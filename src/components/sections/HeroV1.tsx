'use client'

import { useRef, useState } from 'react'
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from 'framer-motion'
import { useLocale } from 'next-intl'
import BottleScroll from './BottleScroll'
import dynamic from 'next/dynamic'
const ProductModal = dynamic(() => import('@/components/modals/ProductModal'))
import GeometricOverlay from '@/components/HeroSection/GeometricOverlay'
import type { ProductData } from '@/lib/products'
import { useParallax } from '@/components/motion'

interface HeroProps {
  products: ProductData[]
}

export default function HeroV1({ products }: HeroProps) {
  const locale = useLocale()
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  /* ── Geometric overlay (throttled ~30fps) ── */
  const overlayState = useRef({ progress: 0, triangleScale: 0.8 })
  const lastRender = useRef(0)
  const [, forceRender] = useState(0)

  /* ── Scroll — same offset as original ── */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })
  const progress = useTransform(scrollYProgress, [0, 1], [0, 0.15])

  // Parallax for columns + geometric shapes
  const { ref: textRef, y: textY } = useParallax({ speed: 0.03 })
  const { ref: bottleRef, y: bottleY } = useParallax({ speed: -0.02 })
  const { ref: geoRef, y: geoY } = useParallax({ speed: 0.04 })

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const p = Math.min(1, Math.max(0, v))
    const triScale = p < 0.1 ? 0.85 : p < 0.5 ? 0.85 + 0.15 * ((p - 0.1) / 0.4) : 1

    const now = performance.now()
    if (now - lastRender.current > 33) {
      overlayState.current = { progress: p, triangleScale: triScale }
      forceRender((n) => n + 1)
      lastRender.current = now
    }
  })

  const product = products[0]

  return (
    <section
      ref={sectionRef}
      id="hero"
      data-section="true"
      className="relative min-h-[85vh] w-full bg-[#ECEDEA] overflow-hidden"
    >
      {/* Same container width as Navbar */}
      <div className="relative mx-auto flex min-h-[85vh] max-w-[1440px] px-4 sm:px-6 lg:px-8 pt-[76px]">

        {/* Mobile: stack vertically / Desktop: side by side */}
        <div className="flex w-full flex-col lg:flex-row items-center">

          {/* Text */}
          <motion.div
            ref={textRef}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            style={{ y: textY }}
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

          {/* Bottle + Geometric shapes behind it */}
          <motion.div
            ref={bottleRef}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            style={{ y: bottleY }}
            className="relative w-full lg:flex-1 flex-1 h-[300px] sm:h-[350px] lg:h-[calc(85vh-76px)] -mt-4 lg:mt-0"
          >
            {/* Geometric overlay — parallax, behind bottle canvas */}
            <motion.div
              ref={geoRef}
              className="absolute inset-0 z-0 overflow-visible"
              style={{ y: geoY }}
            >
              <GeometricOverlay
                progress={overlayState.current.progress}
                triangleScale={overlayState.current.triangleScale}
              />
            </motion.div>

            {/* Bottle canvas — on top */}
            <div className="relative z-10 h-full w-full">
              <BottleScroll progress={progress} />
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
