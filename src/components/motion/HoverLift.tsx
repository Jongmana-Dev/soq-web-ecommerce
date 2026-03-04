'use client'

import { motion } from 'framer-motion'

type HoverLiftProps = React.ComponentProps<typeof motion.div> & {
  /** ยกขึ้นกี่ px เมื่อ hover (ค่าลบ = ขึ้น) */
  lift?: number
  /** scale เมื่อ hover */
  scale?: number
  /** scale เมื่อกด */
  tapScale?: number
}

/**
 * HoverLift: wrapper สำหรับ hover lift + tap feedback
 * ใช้ framer-motion whileHover/whileTap แทน CSS
 */
export function HoverLift({
  children,
  lift = -4,
  scale = 1.02,
  tapScale = 0.98,
  ...rest
}: HoverLiftProps) {
  return (
    <motion.div
      whileHover={{ y: lift, scale }}
      whileTap={{ scale: tapScale }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
