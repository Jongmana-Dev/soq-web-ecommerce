'use client'
import { useState, useCallback, useRef, useEffect } from 'react'
import { useLocale } from 'next-intl'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import type { Review } from '@/lib/cms'

type Props = { reviews: Review[] }

function getImageSrc(review: Review): string | null {
  if (review.media_type === 'image' && review.review_image) return review.review_image
  return review.avatar || null
}

function ReviewCard({
  review,
  locale,
  isFeatured,
  isVisible,
  delay,
}: {
  review: Review
  locale: string
  isFeatured: boolean
  isVisible: boolean
  delay: number
}) {
  const imageSrc = getImageSrc(review)

  return (
    <motion.div
      animate={{
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : 10,
        scale: isVisible ? 1 : 0.99,
      }}
      transition={{
        duration: 1.6,
        delay,
        ease: [0.16, 1, 0.3, 1],
        opacity: { duration: 1.2, delay },
      }}
      className={`bg-white shadow-[0_4px_30px_rgba(0,0,0,0.05)] relative overflow-hidden ${
        isFeatured ? 'sm:col-span-2' : ''
      }`}
    >
      {/* Accent top line for featured */}
      {isFeatured && (
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-[var(--accent)]" />
      )}

      <div className={`flex ${isFeatured ? 'flex-col sm:flex-row' : 'flex-col'}`}>
        {/* Image — featured only */}
        {isFeatured && imageSrc && (
          <div className="relative bg-neutral-100 overflow-hidden flex-shrink-0 w-full sm:w-[240px] lg:w-[300px] aspect-[4/3] sm:aspect-auto sm:min-h-[320px]">
            <Image
              src={imageSrc}
              alt={review.name}
              fill
              sizes="260px"
              className="object-cover object-top"
            />
          </div>
        )}

        {/* Content */}
        <div className={`flex-1 flex flex-col justify-between relative ${isFeatured ? 'p-7 lg:p-10' : 'p-6 lg:p-7'}`}>
          {/* Decorative quote */}
          <span className="absolute bottom-3 right-5 text-[var(--accent)] text-[50px] leading-none font-serif select-none pointer-events-none opacity-60">&rdquo;</span>

          <div className="relative z-10">
            {/* Brand */}
            <div className="mb-3 flex items-center gap-2.5">
              {review.brand_logo ? (
                <Image
                  src={review.brand_logo}
                  alt={review.brand_name ?? ''}
                  width={60}
                  height={20}
                  className="h-4 w-auto object-contain"
                />
              ) : null}
              {review.brand_name && (
                <span className={`font-normal text-neutral-800 tracking-wide ${isFeatured ? 'text-sm' : 'text-xs'}`}>
                  {review.brand_name}
                </span>
              )}
            </div>

            {/* Quote */}
            <div className="flex gap-2">
              <span className="text-[var(--accent)] text-xl leading-none font-serif flex-shrink-0 mt-0.5">&ldquo;</span>
              <p className={`text-neutral-600 leading-relaxed font-light ${isFeatured ? 'text-sm lg:text-[15px]' : 'text-xs lg:text-sm'}`}>
                {locale === 'th' ? review.quote_th : review.quote_en}
              </p>
            </div>
          </div>

          {/* Author */}
          <div className="mt-4 pt-3 border-t border-[var(--accent)]/20 flex items-center gap-3">
            {review.avatar && (
              <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                <Image src={review.avatar} alt={review.name} fill className="object-cover" sizes="32px" />
              </div>
            )}
            <div>
              <h4 className="font-normal text-neutral-800 text-xs">{review.name}</h4>
              <p className="text-[11px] text-neutral-400 font-light">{review.role}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function TestimonialsV2({ reviews }: Props) {
  const locale = useLocale()
  const [activeIndex, setActiveIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const total = reviews.length
  if (total === 0) return null

  const visibleIndices = [
    activeIndex % total,
    (activeIndex + 1) % total,
    (activeIndex + 2) % total,
  ]

  const transition = useCallback((direction: 1 | -1) => {
    // Slow fade out
    setIsVisible(false)
    // Wait for fade out to complete, then change index + fade in
    setTimeout(() => {
      setActiveIndex((prev) => (prev + direction + total) % total)
      setIsVisible(true)
    }, 1000)
  }, [total])

  const resetAutoplay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (total <= 3) return
    timerRef.current = setInterval(() => transition(1), 10_000)
  }, [total, transition])

  useEffect(() => {
    resetAutoplay()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [resetAutoplay])

  const next = () => { transition(1); resetAutoplay() }
  const prev = () => { transition(-1); resetAutoplay() }

  return (
    <section
      id="testimonials"
      data-section="true"
      ref={ref}
      className="relative overflow-hidden py-16 lg:py-28"
      style={{ backgroundColor: '#ECEDEA' }}
    >
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-14" style={{ backgroundColor: '#F6F7F5' }}>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* LEFT — Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-4 flex flex-col"
          >
            <div className="pl-4 border-l-4 border-[var(--accent)]">
              <h2 className="font-poppins text-3xl font-extralight leading-tight text-neutral-800 sm:text-4xl lg:text-5xl">
                <span className="text-[var(--accent)] text-5xl sm:text-6xl block mb-2">&#10077;</span>
                {locale === 'th' ? 'คำยืนยันจาก' : 'Testimonials from'} <br />
                <span className="text-[var(--accent)]">{locale === 'th' ? 'ลูกค้าที่ประทับใจ' : 'Our Happy Customers'}</span>
              </h2>
              <p className="mt-14 lg:mt-18 text-black font-light text-[16px]">
                {locale === 'th'
                  ? 'สิ่งที่เราพูดอาจไม่สำคัญ เท่ากับสิ่งที่ลูกค้าพูดถึงเรา'
                  : 'What we say matters less than what our customers say about us'}
              </p>
            </div>

            {/* Navigation */}
            {total > 3 && (
              <div className="flex items-center gap-4 mt-auto pt-10">
                <button
                  onClick={prev}
                  className="w-10 h-10 border border-neutral-300 flex items-center justify-center hover:bg-white hover:border-neutral-800 transition-colors text-neutral-500 hover:text-neutral-800"
                >
                  <i className="fa-solid fa-arrow-left text-xs" />
                </button>
                <span className="font-mono text-xs text-neutral-400">
                  {(activeIndex % total) + 1} / {total}
                </span>
                <button
                  onClick={next}
                  className="w-10 h-10 border border-neutral-300 flex items-center justify-center hover:bg-white hover:border-neutral-800 transition-colors text-neutral-500 hover:text-neutral-800"
                >
                  <i className="fa-solid fa-arrow-right text-xs" />
                </button>
              </div>
            )}
          </motion.div>

          {/* RIGHT — 3 Review Cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-8"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
              {visibleIndices.map((idx, position) => (
                <ReviewCard
                  key={`${idx}-${position}`}
                  review={reviews[idx]}
                  locale={locale}
                  isFeatured={position === 0}
                  isVisible={isVisible}
                  delay={position * 0.15}
                />
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
