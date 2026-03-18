'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useLocale } from 'next-intl'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import type { Review } from '@/lib/cms'
import { useParallax } from '@/components/motion'

type TestimonialsProps = {
  reviews: Review[]
}

type Orientation = 'landscape' | 'portrait' | 'unknown'

function getImageSrc(review: Review): string {
  if (review.media_type === 'image' && review.review_image) return review.review_image
  return review.avatar
}

export default function Testimonials({ reviews }: TestimonialsProps) {
  const locale = useLocale()
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [playingVideo, setPlayingVideo] = useState(false)
  const [orientations, setOrientations] = useState<Record<string, Orientation>>({})
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })

  const { ref: leftRef, y: leftY } = useParallax({ speed: 0.03 })
  const { ref: rightRef, y: rightY } = useParallax({ speed: -0.03 })

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Detect image orientations on mount
  useEffect(() => {
    reviews.forEach((review) => {
      const src = getImageSrc(review)
      if (!src) return
      const img = new window.Image()
      img.onload = () => {
        setOrientations((prev) => ({
          ...prev,
          [review.id]: img.naturalWidth >= img.naturalHeight ? 'landscape' : 'portrait',
        }))
      }
      img.src = src
    })
  }, [reviews])

  const resetAutoplay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (reviews.length <= 1) return
    timerRef.current = setInterval(() => {
      setDirection(1)
      setPlayingVideo(false)
      setActiveIndex((prev) => (prev + 1) % reviews.length)
    }, 10_000)
  }, [reviews.length])

  useEffect(() => {
    resetAutoplay()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [resetAutoplay])

  if (reviews.length === 0) return null

  const active = reviews[activeIndex]
  const activeOrientation = orientations[active.id] ?? 'landscape'
  const isPortrait = activeOrientation === 'portrait'
  const imageSrc = getImageSrc(active)

  const nextTestimonial = () => {
    setDirection(1)
    setPlayingVideo(false)
    setActiveIndex((prev) => (prev + 1) % reviews.length)
    resetAutoplay()
  }

  const prevTestimonial = () => {
    setDirection(-1)
    setPlayingVideo(false)
    setActiveIndex((prev) => (prev - 1 + reviews.length) % reviews.length)
    resetAutoplay()
  }

  // ─── Shared sub-components ───

  const HeaderBlock = (
    <div className="mb-8 pl-4 border-l-4 border-[var(--accent)]">
      <h2 className="font-prompt text-3xl font-extralight leading-tight text-neutral-800 sm:text-4xl lg:text-5xl">
        <span className="text-[var(--accent)] text-5xl sm:text-6xl block mb-2">&#10077;</span>
        {locale === 'th' ? 'คำยืนยันจาก' : 'Testimonials from'} <br />
        <span className="text-[var(--accent)]">{locale === 'th' ? 'ลูกค้าที่ประทับใจ' : 'Our Happy Customers'}</span>
      </h2>
      <p className="mt-16 lg:mt-20 text-black font-light">
        {locale === 'th'
          ? 'สิ่งที่เราพูดอาจไม่สำคัญ เท่ากับสิ่งที่ลูกค้าพูดถึงเรา'
          : 'What we say matters less than what our customers say about us'}
      </p>
    </div>
  )

  const ImageBlock = ({ className = '' }: { className?: string }) => (
    <div className={`relative w-full overflow-hidden shadow-2xl group cursor-pointer bg-neutral-100 ${isPortrait ? 'aspect-[3/4] max-h-[500px]' : 'aspect-video'} ${className}`}>
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={`img-${activeIndex}`}
          custom={direction}
          variants={{
            enter: (d: number) => ({ opacity: 0, x: d > 0 ? 40 : -40 }),
            center: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
            exit: (d: number) => ({ opacity: 0, x: d > 0 ? -40 : 40, transition: { duration: 0.4 } }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0"
        >
          {active.media_type === 'video' && active.video_url && playingVideo ? (
            <iframe
              src={active.video_url}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <>
              <Image
                src={imageSrc}
                alt={active.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className={`${isPortrait ? 'object-cover object-top' : 'object-cover'} transition-transform duration-700 group-hover:scale-105`}
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />

              {active.media_type === 'video' && active.video_url && (
                <button
                  onClick={() => setPlayingVideo(true)}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                >
                  <div className="absolute inset-0 rounded-full bg-white/30 animate-pulse-glow" />
                  <div className="relative w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110">
                    <i className="fa-solid fa-play text-[var(--accent)] text-xl ml-1" />
                  </div>
                </button>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )

  const ReviewCard = (
    <AnimatePresence initial={false} custom={direction} mode="popLayout">
      <motion.div
        key={activeIndex}
        custom={direction}
        variants={{
          enter: (d: number) => ({
            x: d > 0 ? 280 : -280, y: -40, rotate: d > 0 ? 25 : -25, opacity: 0, scale: 0.8,
          }),
          center: {
            x: 0, y: 0, rotate: 0, opacity: 1, scale: 1, zIndex: 10,
            transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1], rotate: { duration: 1.1, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.6 } },
          },
          exit: (d: number) => ({
            x: d > 0 ? -350 : 350, y: -60, rotate: d > 0 ? -30 : 30, opacity: 0, scale: 0.75,
            transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] },
          }),
        }}
        initial="enter"
        animate="center"
        exit="exit"
        className="relative bg-white p-6 md:p-10 shadow-xl border border-neutral-100"
        style={{ minHeight: isPortrait ? 240 : 340, zIndex: 10 }}
      >
        <span className="absolute top-8 left-0 w-1 h-12 bg-[var(--accent)]" />

        <div className="mb-4">
          {active.brand_logo ? (
            <Image
              src={active.brand_logo}
              alt={active.brand_name ?? ''}
              width={120}
              height={40}
              className="h-10 w-auto object-contain"
            />
          ) : (
            <h3 className="text-2xl font-light text-neutral-800 uppercase tracking-tighter">
              {active.brand_name ?? active.name.split(' ')[0]}
            </h3>
          )}
        </div>

        <span className="text-[var(--accent)] text-3xl leading-none font-serif">&ldquo;</span>
        <p className="font-prompt text-base text-neutral-600 leading-relaxed mb-6 font-light">
          {locale === 'th' ? active.quote_th : active.quote_en}
        </p>

        <div className="mt-6 pt-6 border-t border-neutral-100">
          <h4 className="font-normal text-neutral-800 text-base">
            {active.name}
          </h4>
          <p className="text-xs text-neutral-600 font-light">
            {active.role}
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  )

  const StackedCards = (
    <>
      {reviews.length > 4 && (
        <div className="absolute inset-0 bg-white/10 shadow-sm border border-neutral-200/25" style={{ transform: 'rotate(14deg) translate(30px, -20px) scale(0.91)', zIndex: 0 }} />
      )}
      {reviews.length > 3 && (
        <div className="absolute inset-0 bg-white/20 shadow-sm border border-neutral-200/35" style={{ transform: 'rotate(-11deg) translate(-28px, 24px) scale(0.93)', zIndex: 1 }} />
      )}
      {reviews.length > 2 && (
        <div className="absolute inset-0 bg-white/40 shadow-sm border border-neutral-200/50" style={{ transform: 'rotate(8deg) translate(18px, -14px) scale(0.95)', zIndex: 2 }} />
      )}
      {reviews.length > 1 && (
        <div className="absolute inset-0 bg-white/65 shadow-sm border border-neutral-100" style={{ transform: 'rotate(-5deg) translate(-10px, 10px) scale(0.97)', zIndex: 3 }} />
      )}
    </>
  )

  const NavControls = (
    <div className="absolute bottom-0 right-0 flex items-center gap-4">
      <motion.button
        onClick={prevTestimonial}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="w-11 h-11 border border-neutral-300 flex items-center justify-center hover:bg-white hover:border-black transition-colors text-neutral-500 hover:text-black"
      >
        <i className="fa-solid fa-arrow-left" />
      </motion.button>
      <span className="font-mono text-sm text-neutral-500">
        {activeIndex + 1} / {reviews.length}
      </span>
      <motion.button
        onClick={nextTestimonial}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="w-11 h-11 border border-neutral-300 flex items-center justify-center hover:bg-white hover:border-black transition-colors text-neutral-500 hover:text-black"
      >
        <i className="fa-solid fa-arrow-right" />
      </motion.button>
    </div>
  )

  // ─── LAYOUT ───

  return (
    <section
      id="testimonials"
      data-section="true"
      ref={ref}
      className="relative overflow-hidden pt-8 sm:pt-12 lg:pt-16 pb-16 sm:pb-20 lg:pb-28"
      style={{ backgroundColor: '#ECEDEA' }}
    >
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20" style={{ backgroundColor: '#F6F7F5' }}>

        <AnimatePresence mode="wait">
          <motion.div
            key={isPortrait ? 'portrait' : 'landscape'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {isPortrait ? (
              /* ══════════════ PORTRAIT LAYOUT ══════════════
                 Left: Header + Review card
                 Right: Full-height portrait image
              */
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
                {/* Left: Header + Review (3 cols) */}
                <motion.div
                  ref={leftRef}
                  initial={{ opacity: 0, y: 60 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  style={{ y: leftY }}
                  className="lg:col-span-3 relative"
                >
                  {HeaderBlock}

                  {/* Review card (no stacked cards in portrait mode for cleaner look) */}
                  <div className="relative pb-20">
                    <div className="relative overflow-hidden" style={{ minHeight: 240 }}>
                      {StackedCards}
                      {ReviewCard}
                    </div>
                    {NavControls}
                  </div>
                </motion.div>

                {/* Right: Portrait image (2 cols) */}
                <motion.div
                  ref={rightRef}
                  initial={{ opacity: 0, y: 60 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  style={{ y: rightY }}
                  className="lg:col-span-2"
                >
                  {/* Mobile: show above */}
                  <div className="lg:hidden mb-8">
                    <ImageBlock />
                  </div>
                  {/* Desktop: sticky on right */}
                  <div className="hidden lg:block lg:sticky lg:top-24">
                    <ImageBlock />
                  </div>
                </motion.div>
              </div>
            ) : (
              /* ══════════════ LANDSCAPE LAYOUT ══════════════
                 Left: Header + landscape image
                 Right: Review card stack
              */
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                <motion.div
                  ref={leftRef}
                  initial={{ opacity: 0, y: 60 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  style={{ y: leftY }}
                  className="relative"
                >
                  {HeaderBlock}
                  <ImageBlock />
                </motion.div>

                <motion.div
                  ref={rightRef}
                  initial={{ opacity: 0, y: 60 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  style={{ y: rightY }}
                  className="relative pb-20"
                >
                  <div className="relative overflow-hidden" style={{ minHeight: 340 }}>
                    {StackedCards}
                    {ReviewCard}
                  </div>
                  {NavControls}
                </motion.div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  )
}
