'use client'

import { useState, useCallback, useRef } from 'react'
import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { useScrollAnimation } from './useScrollAnimation'
import GeometricOverlay from './GeometricOverlay'
import dynamic from 'next/dynamic'
const ProductModal = dynamic(() => import('@/components/modals/ProductModal'))
import type { HeroSectionProps, ScrollState } from './types'
import type { ProductData } from '@/lib/products'

interface Props extends HeroSectionProps {
  products: ProductData[]
}

export default function HeroSection({
  products,
  frames = 61,
  framePath = '/hero-section/v3/frame-{index}.webp',
  brandName = 'SOQ.',
  tagline,
}: Props) {
  const locale = useLocale()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const stateRef = useRef<ScrollState>({
    progress: 0,
    frameIndex: 0,
    brandOpacity: 0,
    brandY: 30,
    taglineOpacity: 0,
    triangleScale: 0.8,
    sectionOpacity: 1,
  })

  // DOM refs for imperative style updates (no re-render)
  const brandRef = useRef<HTMLDivElement>(null)
  const taglineRef = useRef<HTMLDivElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<{ progress: number; triangleScale: number }>({
    progress: 0,
    triangleScale: 0.8,
  })
  const geoRef = useRef<HTMLDivElement>(null)
  const [, forceRender] = useState(0)
  const lastRenderRef = useRef(0)

  const handleProgress = useCallback((state: ScrollState) => {
    stateRef.current = state

    // Imperatively update DOM — avoids React re-renders on every frame
    if (brandRef.current) {
      brandRef.current.style.opacity = String(state.brandOpacity)
      brandRef.current.style.transform = `translateY(${state.brandY}px)`
    }
    if (taglineRef.current) {
      taglineRef.current.style.opacity = String(state.taglineOpacity)
    }
    if (stickyRef.current) {
      stickyRef.current.style.opacity = String(state.sectionOpacity)
    }

    // Throttle geometric overlay re-renders to ~30fps
    const now = performance.now()
    if (now - lastRenderRef.current > 33) {
      overlayRef.current = { progress: state.progress, triangleScale: state.triangleScale }
      forceRender((v) => v + 1)
      lastRenderRef.current = now
    }
  }, [])

  const { containerRef, canvasRef, loadProgress, loaded } = useScrollAnimation({
    frameCount: frames,
    framePath,
    onProgress: handleProgress,
  })

  const product = products[0]
  const defaultTagline =
    locale === 'th'
      ? 'น้ำยาฆ่าเชื้อแบคทีเรีย\nปลอดภัย ไร้สารตกค้าง'
      : 'Superior sanitizer\nSafe. Effective. No-rinse.'
  const displayTagline = tagline ?? defaultTagline

  return (
    <>
      {/* Loading Screen */}
      {!loaded && (
        <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#ECEDEA]">
          <h2 className="mb-6 font-prompt text-2xl font-bold text-[#1A1A1A] tracking-tight">
            {brandName}
          </h2>
          <div className="relative h-1 w-48 overflow-hidden rounded-full bg-neutral-200">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-[#1A1A1A] transition-all duration-300"
              style={{ width: `${Math.round(loadProgress * 100)}%` }}
            />
          </div>
          <p className="mt-3 font-mono text-xs text-neutral-400">
            {Math.round(loadProgress * 100)}%
          </p>
        </div>
      )}

      {/* Scroll container — 500vh tall */}
      <section
        ref={containerRef}
        id="hero"
        data-section="true"
        className="relative"
        style={{ height: '500vh' }}
      >
        {/* Sticky viewport */}
        <div
          ref={stickyRef}
          className="sticky top-0 h-screen w-full overflow-hidden"
          style={{ backgroundColor: '#ECEDEA', willChange: 'opacity' }}
        >
          {/* Geometric overlays — behind canvas */}
          <div ref={geoRef} className="absolute inset-0 z-0">
            <GeometricOverlay
              progress={overlayRef.current.progress}
              triangleScale={overlayRef.current.triangleScale}
            />
          </div>

          {/* Product canvas — center */}
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <div className="relative h-[70vh] w-[70vw] max-w-[500px] sm:h-[75vh] sm:w-[60vw] lg:h-[80vh] lg:w-[40vw] lg:max-w-[480px]">
              <canvas
                ref={canvasRef}
                className="h-full w-full"
                style={{ willChange: 'contents' }}
              />
            </div>
          </div>

          {/* Typography — brand name */}
          <div
            ref={brandRef}
            className="absolute left-6 top-24 z-20 sm:left-10 sm:top-28 lg:left-16 lg:top-32"
            style={{ opacity: 0, transform: 'translateY(30px)', willChange: 'transform, opacity' }}
          >
            <h1 className="font-prompt text-5xl font-bold leading-none text-[#1A1A1A] sm:text-6xl lg:text-8xl xl:text-9xl tracking-tighter">
              {brandName}
            </h1>
          </div>

          {/* Typography — tagline */}
          <div
            ref={taglineRef}
            className="absolute bottom-16 left-6 z-20 sm:bottom-20 sm:left-10 lg:bottom-24 lg:left-16"
            style={{ opacity: 0, willChange: 'opacity' }}
          >
            {displayTagline.split('\n').map((line, i) => (
              <p
                key={i}
                className="font-prompt text-sm font-light leading-relaxed text-[#1A1A1A]/70 sm:text-base lg:text-lg"
              >
                {line}
              </p>
            ))}
          </div>

          {/* CTA Button — visible after tagline shows */}
          <div
            className="absolute bottom-16 right-6 z-20 sm:bottom-20 sm:right-10 lg:bottom-24 lg:right-16"
          >
            <motion.button
              onClick={() => setIsModalOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex h-12 items-center gap-2 bg-[#1A1A1A] px-8 font-prompt text-sm font-semibold text-white shadow-lg lg:h-14 lg:px-10 lg:text-base"
            >
              {locale === 'th' ? 'ซื้อเลย' : 'Buy Now'}
              <i className="fa-solid fa-arrow-right text-xs" />
            </motion.button>
          </div>

          {/* Scroll indicator — bottom center, fades out */}
          <div
            className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2"
            style={{
              opacity: stateRef.current.progress < 0.1 ? 1 : 0,
              transition: 'opacity 0.3s',
            }}
          >
            <div className="flex flex-col items-center gap-1 text-neutral-400">
              <span className="text-[10px] uppercase tracking-[0.2em]">Scroll</span>
              <div className="h-8 w-px bg-neutral-300 animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Product Modal */}
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
    </>
  )
}
