'use client'

import { motion } from 'framer-motion'
import { useLocale } from 'next-intl'
import Image from 'next/image' 

// Path ไปยังรูปภาพ Mockup 3 ขวด
const HERO_BACKGROUND_IMAGE = '/images/hero-mockup-bottles.jpg'

export default function Hero() {
  const locale = useLocale()
  
  return (
    <section 
      id="hero" 
      className="relative flex min-h-[calc(100vh-76px)] items-start overflow-hidden bg-cover bg-center"
      style={{
        backgroundImage: `url(${HERO_BACKGROUND_IMAGE})`
      }}
    >
      <div className="container relative z-10 mx-auto">
        <div className="grid md:grid-cols-2 gap-10">
          
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex w-full flex-col items-start gap-5 pt-16 md:pt-24 pb-10 md:pb-0" 
          >
            {/* 1. Headline (Star San) - สีเหลือง (Accent) */}
            <h1 
              className="font-prompt font-light text-[50px] leading-[60px] md:text-[80px] md:leading-[100px]"
              style={{ color: 'var(--accent)' }} // <-- สีเหลือง (ถูกต้องตามภาพ)
            >
              Star San
            </h1>

            {/* ================ FIX HERE (TEXT COLOR) ================ */}
            {/* 2. Headline (Sanitizer) - สีขาว (ตามภาพ) */}
            <h1 
              className="font-prompt font-light text-[50px] leading-[60px] md:text-[80px] md:leading-[100px] text-white -mt-8" // <-- เปลี่ยนเป็น text-white
            >
              Sanitizer
            </h1>

            {/* 3. Description (น้ำยาทำความสะอาด...) - สีขาว (ตามภาพ) */}
            <p 
              className="font-prompt font-light text-lg leading-7 text-white max-w-md" // <-- เปลี่ยนเป็น text-white
            >
              {locale === 'th'
                ? 'น้ำยาทำความสะอาดและทำลายจุลินทรีย์ชั้นสูงแบบไม่ใช้ออกซิเจน ใช้ง่าย ปลอดภัย และมีประสิทธิภาพสูง'
                : 'Superior cleaner and high-foaming sanitizer that is effective and safe to use. No-rinse formula.'}
            </p>
            {/* ========================================== */}

            {/* 4. Button (ซื้อเลย) - สีทอง (ถูกต้อง) */}
            <a 
              href="#contact" 
              className="btn btn-primary flex h-[50px] w-full max-w-[227px] items-center justify-center text-center font-semibold text-lg" 
            >
              {locale === 'th' ? 'ซื้อเลย' : 'Buy Now'}
            </a>

          </motion.div>

          <div className="hidden md:block">
            {/* ... (ส่วนนี้ว่างไว้) ... */}
          </div>

        </div>
      </div>
    </section>
  )
}