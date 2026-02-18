'use client'
import { useState } from 'react'
import { useLocale } from 'next-intl'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import type { Review } from '@/lib/cms'

type TestimonialsProps = {
  reviews: Review[]
}

export default function Testimonials({ reviews }: TestimonialsProps) {
  const locale = useLocale()
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [playingVideo, setPlayingVideo] = useState(false)
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })

  if (reviews.length === 0) return null

  const active = reviews[activeIndex]

  const nextTestimonial = () => {
    setDirection(1)
    setActiveIndex((prev) => (prev + 1) % reviews.length)
  }

  const prevTestimonial = () => {
    setDirection(-1)
    setActiveIndex((prev) => (prev - 1 + reviews.length) % reviews.length)
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
      ref={ref}
      className="relative overflow-hidden bg-[#EAEAEA] py-16 sm:py-20 lg:py-28"
    >
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left: Video / Intro */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Header Text */}
            <div className="mb-8 pl-4 border-l-4 border-[var(--accent)]">
              <h2 className="font-prompt text-4xl font-bold leading-tight text-neutral-800 lg:text-5xl">
                <span className="text-[var(--accent)] text-6xl block mb-2">&#10077;</span>
                {locale === 'th' ? 'คำยืนยันจาก' : 'Testimonials from'} <br />
                <span className="text-[var(--accent)]">{locale === 'th' ? 'ลูกค้าที่ประทับใจ' : 'Our Happy Customers'}</span>
              </h2>
              <p className="mt-4 text-neutral-500 font-light">
                {locale === 'th'
                  ? 'สิ่งที่เราพูดอาจไม่สำคัญ เท่ากับสิ่งที่ลูกค้าพูดถึงเรา'
                  : 'What we say matters less than what our customers say about us'}
              </p>
            </div>

            {/* Video Thumbnail */}
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl shadow-2xl group cursor-pointer">
              {active.video_url && playingVideo ? (
                <iframe
                  src={active.video_url}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <>
                  <Image
                    src="https://images.unsplash.com/photo-1531973576160-7125cd663d86?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                    alt="Video Thumbnail"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

                  {/* Play Button */}
                  {active.video_url ? (
                    <button
                      onClick={() => setPlayingVideo(true)}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110"
                    >
                      <i className="fa-solid fa-play text-[var(--accent)] text-xl ml-1" />
                    </button>
                  ) : (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110">
                      <i className="fa-solid fa-play text-[var(--accent)] text-xl ml-1" />
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>


          {/* Right: Review Card */}
          <motion.div
             initial={{ opacity: 0, x: 30 }}
             animate={inView ? { opacity: 1, x: 0 } : {}}
             transition={{ duration: 0.6, delay: 0.2 }}
             className="relative"
          >
             {/* Logo Type / Brand */}
             <div className="mb-6">
                {active.brand_logo ? (
                  <Image
                    src={active.brand_logo}
                    alt={active.brand_name ?? ''}
                    width={120}
                    height={40}
                    className="h-10 w-auto object-contain"
                  />
                ) : (
                  <h3 className="text-3xl font-black text-neutral-800 uppercase tracking-tighter">
                    {active.brand_name ?? active.name.split(' ')[0]}
                  </h3>
                )}
             </div>

             <div className="bg-white p-8 md:p-10 rounded-xl shadow-sm border border-neutral-100 min-h-[300px] flex flex-col justify-between relative">
                <span className="absolute top-8 left-0 w-1 h-12 bg-[var(--accent)] rounded-r-full" />

                <div className="overflow-hidden">
                  <AnimatePresence initial={false} custom={direction} mode="wait">
                    <motion.div
                      key={activeIndex}
                      custom={direction}
                      variants={variants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ opacity: { duration: 0.2 } }}
                    >
                      <span className="text-[var(--accent)] text-4xl leading-none font-serif">&ldquo;</span>
                      <p className="font-prompt text-lg text-neutral-600 leading-relaxed mb-6">
                        {locale === 'th' ? active.quote_th : active.quote_en}
                      </p>

                      <div className="mt-6 pt-6 border-t border-neutral-100">
                        <div className="flex items-center gap-1 mb-2">
                          {Array.from({ length: active.rating }).map((_, i) => (
                            <i key={i} className="fa-solid fa-star text-amber-400 text-sm" />
                          ))}
                        </div>
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
                <div className="absolute -bottom-16 right-0 flex items-center gap-4">
                  <button
                    onClick={prevTestimonial}
                    className="w-10 h-10 rounded-full border border-neutral-300 flex items-center justify-center hover:bg-white hover:border-black transition-all text-neutral-500 hover:text-black"
                  >
                    <i className="fa-solid fa-arrow-left" />
                  </button>
                  <span className="font-mono text-sm text-neutral-500">
                    {activeIndex + 1} / {reviews.length}
                  </span>
                  <button
                    onClick={nextTestimonial}
                    className="w-10 h-10 rounded-full border border-neutral-300 flex items-center justify-center hover:bg-white hover:border-black transition-all text-neutral-500 hover:text-black"
                  >
                     <i className="fa-solid fa-arrow-right" />
                  </button>
                </div>

             </div>

             {/* Second Card (Background Effect) */}
             <div className="absolute top-4 left-4 w-full h-full bg-white rounded-xl shadow-sm border border-neutral-100 -z-10 opacity-50 scale-[0.98] origin-top-left" />

          </motion.div>

        </div>
      </div>
    </section>
  )
}
