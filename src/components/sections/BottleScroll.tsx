'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, type MotionValue } from 'framer-motion'

const FRAME_COUNT = 61
const FRAMES = Array.from(
  { length: FRAME_COUNT },
  (_, i) => `/images/soq-hero/frame-${String(i + 1).padStart(4, '0')}.webp`,
)

// Very gentle — always smooth regardless of scroll speed
const LERP = 0.04

export default function BottleScroll({ progress }: { progress: MotionValue<number> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imagesRef = useRef<HTMLImageElement[]>([])
  const [loaded, setLoaded] = useState(false)
  const targetRef = useRef(0)
  const currentRef = useRef(0)
  const rafRef = useRef(0)
  const lastFrameRef = useRef(-1)

  // Preload all frames
  useEffect(() => {
    let mounted = true
    const images: HTMLImageElement[] = []
    let count = 0

    FRAMES.forEach((src, i) => {
      const img = new Image()
      img.src = src
      img.onload = () => {
        count++
        if (count === FRAME_COUNT && mounted) {
          imagesRef.current = images
          setLoaded(true)
        }
      }
      images[i] = img
    })

    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (!loaded) return

    const unsubscribe = progress.on('change', (v) => {
      targetRef.current = Math.min(1, Math.max(0, v))
    })
    targetRef.current = Math.min(1, Math.max(0, progress.get()))

    const tick = () => {
      const canvas = canvasRef.current
      if (!canvas) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }

      // Lerp toward target
      const diff = targetRef.current - currentRef.current
      if (Math.abs(diff) > 0.0001) {
        currentRef.current += diff * LERP
      } else {
        currentRef.current = targetRef.current
      }

      const frameIndex = Math.min(
        FRAME_COUNT - 1,
        Math.max(0, Math.round(currentRef.current * (FRAME_COUNT - 1))),
      )

      // Skip if same frame
      if (frameIndex === lastFrameRef.current) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }
      lastFrameRef.current = frameIndex

      const img = imagesRef.current[frameIndex]
      if (!img) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }

      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()

      if (canvas.width !== Math.round(rect.width * dpr) || canvas.height !== Math.round(rect.height * dpr)) {
        canvas.width = Math.round(rect.width * dpr)
        canvas.height = Math.round(rect.height * dpr)
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, rect.width, rect.height)

      // Contain-fit, centered
      const fitScale = Math.min(rect.width / img.width, rect.height / img.height) * 1.15
      const w = img.width * fitScale
      const h = img.height * fitScale
      const x = (rect.width - w) / 2
      const y = (rect.height - h) / 2

      ctx.drawImage(img, x, y, w, h)

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      unsubscribe()
      cancelAnimationFrame(rafRef.current)
    }
  }, [progress, loaded])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: loaded ? 1 : 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className="absolute inset-0"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
    </motion.div>
  )
}
