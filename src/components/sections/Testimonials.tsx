'use client'
import { useState } from 'react'
import { useLocale } from 'next-intl'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

const TESTIMONIALS = [
  {
    id: '1',
    name: 'Martha',
    role: 'CEO, Airbnb',
    avatar: 'https://i.pravatar.cc/150?img=5',
    quote_th: 'ตอนแรกกังวลว่าจะได้ของไม่ตรงปก แต่พอได้รับจริงเหมือนภาพเป๊ะ วัสดุดีมาก งานตอบโจทย์สุดๆ',
    quote_en: 'At first I was worried about the quality, but when I received it, it was exactly like the picture. Great material, really solves my problem.',
    rating: 5,
  },
  {
    id: '2',
    name: 'Jane Cooper',
    role: 'CEO, Airbnb',
    avatar: 'https://i.pravatar.cc/150?img=9',
    quote_th: 'ใช้แล้วรู้สึกแตกต่างจริงๆ จากของที่เคยลองมาไม่ใช่แค่ดีไซน์สวยทันสมัย แต่ประโยชน์การใช้งานที่ครอบคลุมมากๆ',
    quote_en: 'Really feel the difference from what I used to try. Not just modern design, but very comprehensive functionality.',
    rating: 5,
  },
  {
    id: '3',
    name: 'Guy Hawkins',
    role: 'Marketing, Google',
    avatar: 'https://i.pravatar.cc/150?img=3',
    quote_th: 'ประทับใจบริการหลังการขายมาก ทีมงานใส่ใจตอบทุกคำถาม สินค้าคุณภาพดีเกินราคาครับ',
    quote_en: 'Very impressed with after-sales service. The team cares about every question. Product quality exceeds the price.',
    rating: 5,
  },
]

export default function Testimonials() {
  const locale = useLocale()
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })

  const nextTestimonial = () => {
    setDirection(1)
    setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length)
  }

  const prevTestimonial = () => {
    setDirection(-1)
    setActiveIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)
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
                <span className="text-[var(--accent)] text-6xl block mb-2">❝</span>
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
              <Image 
                src="https://images.unsplash.com/photo-1531973576160-7125cd663d86?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="Video Thumbnail"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              
              {/* Play Button */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110">
                 <i className="fa-solid fa-play text-[var(--accent)] text-xl ml-1" />
              </div>
            </div>
          </motion.div>


          {/* Right: Review Card */}
          <motion.div
             initial={{ opacity: 0, x: 30 }}
             animate={inView ? { opacity: 1, x: 0 } : {}}
             transition={{ duration: 0.6, delay: 0.2 }}
             className="relative"
          >
             {/* Logo Type (Decoration) */}
             <div className="mb-6">
                <h3 className="text-3xl font-black text-neutral-800 uppercase tracking-tighter">
                  {TESTIMONIALS[activeIndex].name.split(' ')[0]}
                </h3>
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
                      <span className="text-[var(--accent)] text-4xl leading-none font-serif">“</span>
                      <p className="font-prompt text-lg text-neutral-600 leading-relaxed mb-6">
                        {locale === 'th' ? TESTIMONIALS[activeIndex].quote_th : TESTIMONIALS[activeIndex].quote_en}
                      </p>
                      
                      <div className="mt-6 pt-6 border-t border-neutral-100">
                        <h4 className="font-bold text-[var(--accent)] text-lg">
                          {TESTIMONIALS[activeIndex].name}
                        </h4>
                        <p className="text-sm text-neutral-400">
                          {TESTIMONIALS[activeIndex].role}
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
                    {activeIndex + 1} / {TESTIMONIALS.length}
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
