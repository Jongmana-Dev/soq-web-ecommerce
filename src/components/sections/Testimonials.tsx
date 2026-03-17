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

export default function Testimonials({ reviews }: TestimonialsProps) {
  const locale = useLocale()
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [playingVideo, setPlayingVideo] = useState(false)
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })

  // Parallax for left/right panels
  const { ref: leftRef, y: leftY } = useParallax({ speed: 0.03 })
  const { ref: rightRef, y: rightY } = useParallax({ speed: -0.03 })

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

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

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 20 : -20,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 20 : -20,
      opacity: 0,
    }),
  }

  return (
    <section
      id="testimonials"
      data-section="true"
      ref={ref}
      className="relative overflow-hidden pt-8 sm:pt-12 lg:pt-16 pb-16 sm:pb-20 lg:pb-28"
      style={{ backgroundColor: '#ECEDEA' }}
    >
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20" style={{ backgroundColor: '#F6F7F5' }}>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left: Video / Intro */}
          <motion.div
            ref={leftRef}
            initial={{ opacity: 0, y: 60 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            style={{ y: leftY }}
            className="relative"
          >
            {/* Header Text */}
            <div className="mb-8 pl-4 border-l-4 border-[var(--accent)]">
              <h2 className="font-prompt text-3xl font-bold leading-tight text-neutral-800 sm:text-4xl lg:text-5xl">
                <span className="text-[var(--accent)] text-5xl sm:text-6xl block mb-2">&#10077;</span>
                {locale === 'th' ? 'คำยืนยันจาก' : 'Testimonials from'} <br />
                <span className="text-[var(--accent)]">{locale === 'th' ? 'ลูกค้าที่ประทับใจ' : 'Our Happy Customers'}</span>
              </h2>
              <p className="mt-4 text-neutral-500 font-light">
                {locale === 'th'
                  ? 'สิ่งที่เราพูดอาจไม่สำคัญ เท่ากับสิ่งที่ลูกค้าพูดถึงเรา'
                  : 'What we say matters less than what our customers say about us'}
              </p>
            </div>

            {/* Video / Avatar Area */}
            <div className="relative aspect-video w-full overflow-hidden shadow-2xl group cursor-pointer">
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
                    src={active.media_type === 'image' && active.review_image ? active.review_image : active.avatar}
                    alt={active.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

                  {/* Play Button — only show if video available */}
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
            </div>
          </motion.div>


          {/* Right: Stacked Review Cards */}
          <motion.div
             ref={rightRef}
             initial={{ opacity: 0, y: 60 }}
             animate={inView ? { opacity: 1, y: 0 } : {}}
             transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
             style={{ y: rightY }}
             className="relative pb-20"
          >
             {/* Stacked cards container */}
             <div className="relative overflow-hidden" style={{ minHeight: 340 }}>
               {/* Background stacked cards — messy scattered deck */}
               {reviews.length > 4 && (
                 <div
                   className="absolute inset-0 bg-white/10 shadow-sm border border-neutral-200/25"
                   style={{ transform: 'rotate(14deg) translate(30px, -20px) scale(0.91)', zIndex: 0 }}
                 />
               )}
               {reviews.length > 3 && (
                 <div
                   className="absolute inset-0 bg-white/20 shadow-sm border border-neutral-200/35"
                   style={{ transform: 'rotate(-11deg) translate(-28px, 24px) scale(0.93)', zIndex: 1 }}
                 />
               )}
               {reviews.length > 2 && (
                 <div
                   className="absolute inset-0 bg-white/40 shadow-sm border border-neutral-200/50"
                   style={{ transform: 'rotate(8deg) translate(18px, -14px) scale(0.95)', zIndex: 2 }}
                 />
               )}
               {reviews.length > 1 && (
                 <div
                   className="absolute inset-0 bg-white/65 shadow-sm border border-neutral-100"
                   style={{ transform: 'rotate(-5deg) translate(-10px, 10px) scale(0.97)', zIndex: 3 }}
                 />
               )}

               {/* Active card */}
               <AnimatePresence initial={false} custom={direction} mode="popLayout">
                 <motion.div
                   key={activeIndex}
                   custom={direction}
                   variants={{
                     enter: (d: number) => ({
                       x: d > 0 ? 280 : -280,
                       y: -40,
                       rotate: d > 0 ? 25 : -25,
                       opacity: 0,
                       scale: 0.8,
                     }),
                     center: {
                       x: 0,
                       y: 0,
                       rotate: 0,
                       opacity: 1,
                       scale: 1,
                       zIndex: 10,
                       transition: {
                         duration: 0.9,
                         ease: [0.22, 1, 0.36, 1],
                         rotate: { duration: 1.1, ease: [0.22, 1, 0.36, 1] },
                         opacity: { duration: 0.6 },
                       },
                     },
                     exit: (d: number) => ({
                       x: d > 0 ? -350 : 350,
                       y: -60,
                       rotate: d > 0 ? -30 : 30,
                       opacity: 0,
                       scale: 0.75,
                       transition: {
                         duration: 0.7,
                         ease: [0.4, 0, 0.2, 1],
                       },
                     }),
                   }}
                   initial="enter"
                   animate="center"
                   exit="exit"
                   className="relative bg-white p-6 md:p-10 shadow-xl border border-neutral-100"
                   style={{ minHeight: 340, zIndex: 10 }}
                 >
                   <span className="absolute top-8 left-0 w-1 h-12 bg-[var(--accent)]" />

                   {/* Brand logo / name */}
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
                       <h3 className="text-2xl font-black text-neutral-800 uppercase tracking-tighter">
                         {active.brand_name ?? active.name.split(' ')[0]}
                       </h3>
                     )}
                   </div>

                   <span className="text-[var(--accent)] text-4xl leading-none font-serif">&ldquo;</span>
                   <p className="font-prompt text-lg text-neutral-600 leading-relaxed mb-6">
                     {locale === 'th' ? active.quote_th : active.quote_en}
                   </p>

                   <div className="mt-6 pt-6 border-t border-neutral-100">
                     <h4 className="font-bold text-[var(--accent)] text-lg">
                       {active.name}
                     </h4>
                     <p className="text-sm text-neutral-400">
                       {active.role}
                     </p>
                   </div>
                 </motion.div>
               </AnimatePresence>
             </div>

             {/* Navigation Controls */}
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

          </motion.div>

        </div>
      </div>
    </section>
  )
}
