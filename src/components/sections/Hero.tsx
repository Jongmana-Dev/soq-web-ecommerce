'use client'

import { motion } from 'framer-motion'
import { useLocale } from 'next-intl'
import Image from 'next/image'

export default function Hero() {
  const locale = useLocale()

  return (
    <section
      id="hero"
      className="relative min-h-screen w-full overflow-hidden bg-[#EFEFEF]"
    >
      {/* Background pattern */}
      {/* <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(243,200,91,0.1),transparent_50%)]" />
      </div> */}

      <div className="container relative z-10 mx-auto flex min-h-screen items-center px-4 sm:px-6 lg:px-8">
        <div className="grid w-full grid-cols-1 items-center gap-8 py-24 lg:grid-cols-2 lg:gap-16 lg:py-0">

          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-start gap-6 text-center sm:text-left relative z-20"
          >
            {/* Headlines */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="space-y-4"
            >
              <h1 className="font-prompt text-5xl font-light leading-tight sm:text-6xl lg:text-8xl xl:text-9xl text-[var(--accent)] tracking-tighter">
                SOQ.
              </h1>
              <h2 className="font-prompt text-4xl font-light leading-tight text-neutral-900 sm:text-5xl lg:text-7xl xl:text-8xl uppercase tracking-wide">
                SAFE FOR SIP
              </h2>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="max-w-md font-poppins text-base leading-relaxed text-neutral-500 sm:text-lg"
            >
              {locale === 'th'
                ? 'น้ำยาฆ่าเชื้อและทำความสะอาดอุปกรณ์ดิบ เบียร์และไวน์แบบไม่ต้องล้างออก ใช้ง่าย ปลอดภัย และมีประสิทธิภาพสูง'
                : 'Superior cleaner and high-foaming sanitizer that is effective and safe to use. No-rinse formula.'}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-col gap-4 sm:flex-row mt-4"
            >
              <a
                href="#products"
                className="group relative inline-flex h-14 items-center justify-center overflow-hidden bg-[var(--accent)] px-12 font-prompt text-lg font-bold text-black transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-[var(--accent)]/20 shadow-black/5"
              >
                <span className="relative z-10">{locale === 'th' ? 'ซื้อเลย' : 'Buy Now'}</span>
              </a>
            </motion.div>
          </motion.div>

          {/* Right Image - Expanded */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative flex items-center justify-center lg:justify-end h-[60vh] lg:h-screen w-full"
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[120%] lg:w-[140%] h-[120%] lg:-right-20 pointer-events-none">
              <Image
                src="/images/hero-mockup-bottles.png"
                alt="Star San Sanitizer Products"
                fill
                className="object-contain drop-shadow-2xl scale-125 lg:scale-150 origin-center lg:origin-right"
                priority
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
