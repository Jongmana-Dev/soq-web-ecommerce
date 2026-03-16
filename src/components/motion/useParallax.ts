'use client'

import { useRef, useState, useEffect } from 'react'
import {
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
  useMotionValue,
  type MotionValue,
} from 'framer-motion'

interface UseParallaxOptions {
  /** ตัวคูณความเร็ว — ค่าน้อย = subtle, ค่าลบ = ทิศตรงข้าม */
  speed?: number
}

/**
 * useParallax: สร้าง parallax offset จาก scroll position
 * - ใช้ useSpring ให้ movement นุ่ม
 * - Disable บน mobile (< 1024px) และ prefers-reduced-motion
 * - Return motionValue สำหรับใส่ใน style={{ y }}
 */
export function useParallax({ speed = 0.05 }: UseParallaxOptions = {}): {
  ref: React.RefObject<HTMLDivElement>
  y: MotionValue<number>
} {
  const ref = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>
  const [mounted, setMounted] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const prefersReduced = useReducedMotion()
  const fallback = useMotionValue(0)

  useEffect(() => {
    setMounted(true)
    const mql = window.matchMedia('(min-width: 1024px)')
    setIsDesktop(mql.matches)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  const enabled = mounted && isDesktop && !prefersReduced

  const { scrollYProgress } = useScroll(
    mounted && ref.current
      ? { target: ref as React.RefObject<HTMLDivElement>, offset: ['start end', 'end start'] }
      : undefined,
  )

  const range = 400 * speed
  const rawY = useTransform(
    mounted ? scrollYProgress : fallback,
    [0, 1],
    enabled ? [-range, range] : [0, 0],
  )
  const y = useSpring(rawY, { stiffness: 120, damping: 40, mass: 0.5 })

  return { ref, y }
}
