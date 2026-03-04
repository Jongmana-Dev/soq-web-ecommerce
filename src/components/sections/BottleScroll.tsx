'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, type MotionValue } from 'framer-motion'

const FRAME_COUNT = 61
const FRAMES = Array.from(
  { length: FRAME_COUNT },
  (_, i) => `/images/soq-hero/frame-${String(i + 1).padStart(4, '0')}.webp`,
)

// Snappier lerp — responsive but still smooth
const LERP = 0.12

export default function BottleScroll({ progress }: { progress: MotionValue<number> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const imagesRef = useRef<HTMLImageElement[]>([])
  const [loaded, setLoaded] = useState(false)
  const targetRef = useRef(0)
  const currentRef = useRef(0)
  const rafRef = useRef(0)
  const lastFrameRef = useRef(-1)
  const sizeRef = useRef({ w: 0, h: 0 })

  // Preload all frames
  useEffect(() => {
    let mounted = true
    const images: HTMLImageElement[] = []
    let count = 0

    FRAMES.forEach((src, i) => {
      const img = new Image()
      img.decoding = 'async'
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

  // Cache context + track size via ResizeObserver
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    ctxRef.current = canvas.getContext('2d', { desynchronized: true, alpha: true })

    const dpr = window.devicePixelRatio || 1
    const resize = (w: number, h: number) => {
      const cw = Math.round(w * dpr)
      const ch = Math.round(h * dpr)
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw
        canvas.height = ch
      }
      sizeRef.current = { w, h }
    }

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        resize(width, height)
        // Redraw current frame after resize
        lastFrameRef.current = -1
      }
    })
    ro.observe(canvas)

    return () => { ro.disconnect() }
  }, [])

  // Draw a specific frame
  const drawFrame = useCallback((frameIndex: number) => {
    const ctx = ctxRef.current
    const { w, h } = sizeRef.current
    if (!ctx || w === 0) return

    const img = imagesRef.current[frameIndex]
    if (!img) return

    const dpr = window.devicePixelRatio || 1
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)

    const fitScale = Math.min(w / img.width, h / img.height) * 1.15
    const iw = img.width * fitScale
    const ih = img.height * fitScale
    const x = (w - iw) / 2
    const y = (h - ih) / 2

    ctx.drawImage(img, x, y, iw, ih)
  }, [])

  // Animation loop
  useEffect(() => {
    if (!loaded) return

    const unsubscribe = progress.on('change', (v) => {
      targetRef.current = Math.min(1, Math.max(0, v))
    })
    targetRef.current = Math.min(1, Math.max(0, progress.get()))

    const tick = () => {
      // Lerp toward target
      const diff = targetRef.current - currentRef.current
      if (Math.abs(diff) > 0.0005) {
        currentRef.current += diff * LERP
      } else {
        currentRef.current = targetRef.current
      }

      const frameIndex = Math.min(
        FRAME_COUNT - 1,
        Math.max(0, Math.round(currentRef.current * (FRAME_COUNT - 1))),
      )

      if (frameIndex !== lastFrameRef.current) {
        drawFrame(frameIndex)
        lastFrameRef.current = frameIndex
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      unsubscribe()
      cancelAnimationFrame(rafRef.current)
    }
  }, [progress, loaded, drawFrame])

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
        style={{ willChange: 'contents' }}
      />
    </motion.div>
  )
}
