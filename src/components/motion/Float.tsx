'use client'

import { motion, useReducedMotion } from 'framer-motion'

type FloatProps = {
  children: React.ReactNode
  /** ระยะลอยขึ้น-ลง (px) */
  amplitude?: number
  /** ระยะเวลา 1 รอบ (วินาที) */
  duration?: number
  /** ดีเลย์ก่อนเริ่ม (วินาที) */
  delay?: number
  className?: string
}

/**
 * Float: ลอยขึ้น-ลงต่อเนื่อง สำหรับ decorative element
 * เช็ค prefers-reduced-motion → ไม่ animate
 */
export function Float({
  children,
  amplitude = 6,
  duration = 4,
  delay = 0,
  className,
}: FloatProps) {
  const prefersReduced = useReducedMotion()

  return (
    <motion.div
      animate={prefersReduced ? undefined : { y: [0, -amplitude, 0] }}
      transition={
        prefersReduced
          ? undefined
          : {
              duration,
              repeat: Infinity,
              repeatType: 'loop',
              ease: 'easeInOut',
              delay,
            }
      }
      className={className}
    >
      {children}
    </motion.div>
  )
}
