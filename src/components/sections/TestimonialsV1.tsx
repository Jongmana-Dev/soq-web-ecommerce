'use client'
import { useState, useCallback, useRef, useEffect } from 'react'
import { useLocale } from 'next-intl'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import type { Review } from '@/lib/cms'

type TestimonialsProps = {
  reviews: Review[]
}

export default function TestimonialsV1({ reviews }: TestimonialsProps) {
  const locale = useLocale()
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const resetAutoplay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (reviews.length <= 1) return
    timerRef.current = setInterval(() => {
      setDirection(1)
      setActiveIndex((prev) => (prev + 1) % reviews.length)
    }, 8_000)
  }, [reviews.length])

  useEffect(() => {
    resetAutoplay()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [resetAutoplay])

  if (reviews.length === 0) return null

  const active = reviews[activeIndex]

  const next = () => {
    setDirection(1)
    setActiveIndex((prev) => (prev + 1) % reviews.length)
    resetAutoplay()
  }

  const prev = () => {
    setDirection(-1)
    setActiveIndex((prev) => (prev - 1 + reviews.length) % reviews.length)
    resetAutoplay()
  }

  return (
    <section
      id="testimonials"
      data-section="true"
      ref={ref}
      className="relative overflow-hidden py-10 lg:py-16"
      style={{ backgroundColor: '#ECEDEA' }}
    >
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-14" style={{ backgroundColor: '#F6F7F5' }}>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">

          {/* ═══ LEFT: Header (4 cols) ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-4 pl-4 border-l-4 border-[var(--accent)]"
          >
            <h2 className="font-poppins text-3xl font-extralight leading-tight text-neutral-800 sm:text-4xl lg:text-5xl">
              <span className="text-[var(--accent)] text-5xl sm:text-6xl block mb-2">&#10077;</span>
              {locale === 'th' ? 'คำยืนยันจาก' : 'Testimonials from'} <br />
              <span className="text-[var(--accent)]">{locale === 'th' ? 'ลูกค้าที่ประทับใจ' : 'Our Happy Customers'}</span>
            </h2>
            <p className="mt-8 text-black font-light text-[16px]">
              {locale === 'th'
                ? 'สิ่งที่เราพูดอาจไม่สำคัญ เท่ากับสิ่งที่ลูกค้าพูดถึงเรา'
                : 'What we say matters less than what our customers say about us'}
            </p>

            {/* Navigation — under header */}
            <div className="flex items-center gap-4 mt-10">
              <button
                onClick={prev}
                className="w-10 h-10 border border-neutral-300 flex items-center justify-center hover:bg-white hover:border-neutral-800 transition-colors text-neutral-500 hover:text-neutral-800"
              >
                <i className="fa-solid fa-arrow-left text-xs" />
              </button>
              <span className="font-mono text-xs text-neutral-400">
                {activeIndex + 1} / {reviews.length}
              </span>
              <button
                onClick={next}
                className="w-10 h-10 border border-neutral-300 flex items-center justify-center hover:bg-white hover:border-neutral-800 transition-colors text-neutral-500 hover:text-neutral-800"
              >
                <i className="fa-solid fa-arrow-right text-xs" />
              </button>
            </div>
          </motion.div>

          {/* ═══ RIGHT: Review Card (8 cols) ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-8"
          >
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={activeIndex}
                custom={direction}
                variants={{
                  enter: (d: number) => ({
                    opacity: 0,
                    x: d > 0 ? 50 : -50,
                    y: 20,
                    scale: 0.97,
                    filter: 'blur(4px)',
                  }),
                  center: {
                    opacity: 1,
                    x: 0,
                    y: 0,
                    scale: 1,
                    filter: 'blur(0px)',
                    transition: {
                      duration: 1.2,
                      ease: [0.16, 1, 0.3, 1],
                      opacity: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
                      filter: { duration: 0.6 },
                    },
                  },
                  exit: (d: number) => ({
                    opacity: 0,
                    x: d > 0 ? -40 : 40,
                    y: -10,
                    scale: 0.98,
                    filter: 'blur(4px)',
                    transition: {
                      duration: 0.8,
                      ease: [0.4, 0, 0.2, 1],
                      opacity: { duration: 0.5 },
                    },
                  }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                className="bg-white overflow-hidden shadow-[0_6px_50px_rgba(0,0,0,0.07)]"
              >
                <div className="flex flex-col sm:flex-row">

                  {/* Image */}
                  <div className="relative w-full sm:w-[260px] lg:w-[300px] flex-shrink-0 aspect-[4/3] sm:aspect-auto sm:min-h-[380px] bg-neutral-100 overflow-hidden">
                    <motion.div
                      key={`img-${activeIndex}`}
                      initial={{ scale: 1.1, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], opacity: { duration: 0.8 } }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={active.media_type === 'image' && active.review_image ? active.review_image : active.avatar}
                        alt={active.name}
                        fill
                        sizes="(max-width: 640px) 100vw, 300px"
                        className="object-cover object-top"
                      />
                    </motion.div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-8 lg:p-10 flex flex-col justify-between relative min-h-[380px]">
                    {/* Accent left border */}
                    <div className="absolute top-8 h-12 left-0 w-[3px] bg-[var(--accent)]" />

                    {/* Decorative quote */}
                    <span className="absolute bottom-6 right-8 text-[var(--accent)] text-[100px] leading-none font-serif select-none pointer-events-none">&rdquo;</span>

                    <div className="relative z-10 flex flex-col h-full">
                      {/* Brand logo + name */}
                      <div className="mb-5 flex items-center gap-3">
                        {active.brand_logo ? (
                          <Image
                            src={active.brand_logo}
                            alt={active.brand_name ?? ''}
                            width={80}
                            height={28}
                            className="h-6 w-auto object-contain"
                          />
                        ) : null}
                        {active.brand_name && (
                          <span className="text-lg font-normal text-neutral-800 tracking-wide">
                            {active.brand_name}
                          </span>
                        )}
                      </div>

                      {/* Quote */}
                      <p className="font-prompt text-sm lg:text-base text-neutral-600 leading-relaxed font-light flex-1">
                        {locale === 'th' ? active.quote_th : active.quote_en}
                      </p>

                      {/* Author */}
                      <div className="mt-8 pt-6 border-t border-[var(--accent)] mr-[60px]">
                        <h4 className="font-normal text-neutral-800 text-sm">{active.name}</h4>
                        <p className="text-xs text-neutral-500 font-light">{active.role}</p>
                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>
            </AnimatePresence>

            {/* Dots */}
            {reviews.length > 1 && (
              <div className="flex gap-1.5 mt-6">
                {reviews.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setDirection(i > activeIndex ? 1 : -1)
                      setActiveIndex(i)
                      resetAutoplay()
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === activeIndex
                        ? 'w-6 bg-[var(--accent)]'
                        : 'w-1.5 bg-neutral-300 hover:bg-neutral-400'
                    }`}
                  />
                ))}
              </div>
            )}
          </motion.div>

        </div>

      </div>
    </section>
  )
}
