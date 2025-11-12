'use client'

import { ArrowUp, MessageSquare } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export default function BackToTop() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // แสดงปุ่ม BackToTop เมื่อเลื่อนลงมาเกิน 200px
      setScrolled(window.scrollY > 200) 
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // สไตล์ปุ่ม (ใช้ร่วมกัน)
  const buttonStyle = "h-12 w-12 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105"
  
  return (
    // ** นี่คือส่วนสำคัญที่ทำให้ปุ่มอยู่ขวาล่างเสมอ **
    // `fixed`  : ทำให้ element ลอยอยู่กับที่บน viewport ไม่ว่าจะ scroll ไปไหน
    // `bottom-6`: กำหนดระยะห่างจากขอบล่าง 1.5rem (24px)
    // `right-6` : กำหนดระยะห่างจากขอบขวา 1.5rem (24px)
    // `z-40`   : กำหนด stack order ให้ลอยอยู่เหนือ element อื่นๆ ส่วนใหญ่
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
      
      {/* ปุ่ม BackToTop (จะแสดง/ซ่อน เมื่อ Scrolled) */}
      <AnimatePresence>
        {scrolled && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={scrollToTop}
            className={`${buttonStyle} bg-gray-800 text-white dark:bg-gray-200 dark:text-black`}
            aria-label="Back to top"
          >
            <ArrowUp className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ปุ่ม Chat (แสดงเสมอ) */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }} 
        className={`${buttonStyle} bg-accent text-black`} 
        aria-label="Open chat"
      >
        <MessageSquare className="h-6 w-6" />
      </motion.button>
    </div>
  )
}