'use client'

import { motion } from 'framer-motion'
import { useLocale } from 'next-intl'

// Path ไปยังรูปภาพ Mockup ที่เรา gen ไว้
const HERO_BACKGROUND_IMAGE = '/images/hero-mockup-bottles.jpg'

export default function Hero() {
  const locale = useLocale()
  
  return (
    <section 
      id="hero" 
      className="relative flex items-center bg-cover bg-center px-4"
      // 1. ใช้รูปภาพเป็นพื้นหลัง
      // 2. กำหนด min-height ให้เท่ากับความสูงจอ ลบด้วย Navbar (76px)
      style={{
        backgroundImage: `url(${HERO_BACKGROUND_IMAGE})`,
        minHeight: 'calc(100vh - 76px)'
      }}
    >
      {/* Optional: เพิ่ม Overlay สีจางๆ ถ้าข้อความอ่านยาก (ปรับ opacity ได้) */}
      {/* <div className="absolute inset-0 bg-white/30 dark:bg-black/30"></div> */}

      {/* 2. จัด Container ของเนื้อหา */}
      <div className="container relative z-10 mx-auto max-w-[1429px]">
        {/* 3. จัดข้อความและปุ่ม (วางชิดซ้าย) */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex w-full max-w-xl flex-col items-start gap-10"
        >
          {/* Headline (Star San Sanitizer) */}
          <h1 
            // ใช้ font-light, text-8xl (80px), leading-[100px] ตามสเปก
            // ปรับขนาด Responsive สำหรับมือถือ
            className="font-light text-[50px] leading-[60px] md:text-[80px] md:leading-[100px]"
            style={{ color: '#F3C85B' }}
          >
            Star San Sanitizer
          </h1>

          {/* Description (น้ำยาฆ่าเชื้อ...) */}
          <p 
            // ใช้ font-light, text-lg (18px) ตามสเปก
            className="font-light text-lg leading-7 text-black dark:text-white"
          >
            {locale === 'th'
              ? 'น้ำยาฆ่าเชื้อและทำความสะอาดอุปกรณ์ต้ม เบียร์และถังเบียร์แบบไม่ต้องล้างออก ใช้ง่าย ปลอดภัย และมีประสิทธิภาพสูง'
              : 'Sanitizer and cleaner for brewing equipment and kegs. No-rinse formula, easy to use, safe, and highly effective.'}
          </p>

          {/* Button (ซื้อเลย) */}
          <a 
            href="#contact" 
            // ใช้ bg-[#F3C85B], font-semibold, text-lg, text-center ตามสเปก
            className="flex h-[50px] w-full max-w-[227px] items-center justify-center bg-[#F3C85B] text-center font-semibold text-lg text-black transition-transform hover:scale-105"
          >
            {locale === 'th' ? 'ซื้อเลย' : 'Buy Now'}
          </a>

        </motion.div>
      </div>
    </section>
  )
}