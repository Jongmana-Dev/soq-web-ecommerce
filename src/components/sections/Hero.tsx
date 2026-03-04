'use client'

import { useRef } from 'react'
import {
  motion,
  useScroll,
  useTransform,
} from 'framer-motion'
import { useLocale } from 'next-intl'
import BottleScroll from './BottleScroll'

export default function Hero() {
  const locale = useLocale()
  const sectionRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })

  const progress = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <section
      ref={sectionRef}
      id="hero"
      data-section="true"
      className="relative min-h-[85vh] w-full bg-[#EFEFEF]"
    >
      {/* Same container width as Navbar */}
      <div className="mx-auto flex min-h-[85vh] max-w-[1440px] px-4 sm:px-6 lg:px-8 pt-[76px]">

        {/* Mobile: stack vertically / Desktop: side by side */}
        <div className="flex w-full flex-col lg:flex-row items-center">

          {/* Text — shrink to fit on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-full lg:flex-1 min-w-0 text-center lg:text-left pt-4 lg:pt-0 shrink-0"
          >
            <div className="space-y-2 sm:space-y-3">
              <h1 className="font-prompt text-4xl font-light leading-tight sm:text-5xl lg:text-7xl xl:text-8xl text-[var(--accent)] tracking-tighter">
                SOQ.
              </h1>
              <h2 className="font-prompt text-2xl font-light leading-tight text-neutral-900 sm:text-3xl lg:text-5xl xl:text-6xl uppercase tracking-wide">
                SAFE FOR SIP
              </h2>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-4 lg:mt-6 max-w-md mx-auto lg:mx-0 font-poppins text-xs leading-relaxed text-neutral-500 sm:text-sm lg:text-base"
            >
              {locale === 'th'
                ? 'น้ำยาฆ่าเชื้อและทำความสะอาดอุปกรณ์ดิบ เบียร์และไวน์แบบไม่ต้องล้างออก ใช้ง่าย ปลอดภัย และมีประสิทธิภาพสูง'
                : 'Superior cleaner and high-foaming sanitizer that is effective and safe to use. No-rinse formula.'}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-6 lg:mt-8"
            >
              <a
                href="#products"
                className="group relative inline-flex h-12 lg:h-14 items-center justify-center overflow-hidden bg-[var(--accent)] px-8 lg:px-12 font-prompt text-base lg:text-lg font-bold text-black transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-[var(--accent)]/20 shadow-black/5"
              >
                <span className="relative z-10">
                  {locale === 'th' ? 'ซื้อเลย' : 'Buy Now'}
                </span>
              </a>
            </motion.div>
          </motion.div>

          {/* Bottle — flex-grow fills remaining space on mobile */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative w-full lg:flex-1 flex-1 min-h-[300px] sm:min-h-[350px] lg:h-[calc(85vh-76px)] -mt-4 lg:mt-0"
          >
            <BottleScroll progress={progress} />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
