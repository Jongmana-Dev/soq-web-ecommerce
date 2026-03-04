// src/components/motion/Reveal.tsx
//# ฮุค+ตัวช่วยแอนิเมชัน (Motion)
'use client'

import {motion, useInView} from 'framer-motion'
import {useRef} from 'react'

type RevealProps = React.ComponentProps<typeof motion.div> & {
  /** ระยะเลื่อนแกน Y ตอนเริ่ม (px) */
  y?: number
  /** ดีเลย์ก่อนเริ่ม (วินาที) */
  delay?: number
  /** แอนิเมชันเล่นครั้งเดียวเมื่อเลื่อนเข้ามุมมอง */
  once?: boolean
}

/**
 * Reveal: fade + slide-in เมื่อ Section เข้าสู่ viewport
 * ใช้งานง่าย ครอบคอมโพเนนต์ที่ต้องการให้ปรากฏแบบนุ่ม ๆ
 */
export function Reveal({children, y = 50, delay = 0, once = true, ...rest}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, {once, amount: 0.2, margin: '-10% 0px'})
  return (
    <motion.div
      ref={ref}
      initial={{opacity: 0, y}}
      animate={inView ? {opacity: 1, y: 0} : {}}
      transition={{duration: 0.7, ease: [0.16, 1, 0.3, 1], delay}}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

/**
 * Stagger: คอนเทนเนอร์สำหรับไล่อนิเมชันลูก ๆ แบบต่อเนื่อง (stagger)
 * ใช้คู่กับ <Item> สำหรับ grid/list
 */
export function Stagger({children, ...rest}: React.ComponentProps<typeof motion.div>) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{once: true, margin: '-10% 0px'}}
      variants={{hidden: {}, show: {transition: {staggerChildren: 0.1}}}}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

/**
 * Item: ไอเท็มเดี่ยวสำหรับใช้ภายใน <Stagger>
 */
export function Item({children, y = 40}: {children: React.ReactNode; y?: number}) {
  return (
    <motion.div
      variants={{hidden: {opacity: 0, y}, show: {opacity: 1, y: 0}}}
      transition={{duration: 0.5, ease: [0.16, 1, 0.3, 1]}}
    >
      {children}
    </motion.div>
  )
}
