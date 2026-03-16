'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, type MotionValue } from 'framer-motion'

const FRAME_COUNT = 61
const FRAMES = Array.from(
  { length: FRAME_COUNT },
  (_, i) => `/hero-section/v3/frame-${String(i + 1).padStart(4, '0')}.webp`,
)

const LERP = 0.18

export default function BottleScroll({ progress }: { progress: MotionValue<number> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const imagesRef = useRef<HTMLImageElement[]>([])
  const [loaded, setLoaded] = useState(false)
  const targetRef = useRef(0)
  const currentRef = useRef(0)
  const rafRef = useRef(0)
  const lastFrameRef = useRef(-1)
  const dprRef = useRef(1)
  // Pre-computed draw params per frame (recalculated on resize)
  const drawParamsRef = useRef<{ x: number; y: number; w: number; h: number }[]>([])
  const canvasSizeRef = useRef({ w: 0, h: 0 })

  // Preload all frames via HTMLImageElement (correct alpha handling)
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

  // Recompute draw params for all frames when canvas size changes
  const recomputeDrawParams = useCallback((cssW: number, cssH: number) => {
    const images = imagesRef.current
    if (!images.length) return

    const params: { x: number; y: number; w: number; h: number }[] = []
    for (let i = 0; i < images.length; i++) {
      const img = images[i]
      if (!img) { params.push({ x: 0, y: 0, w: 0, h: 0 }); continue }
      const natW = img.naturalWidth || img.width
      const natH = img.naturalHeight || img.height
      const fitScale = Math.min(cssW / natW, cssH / natH) * 1.15
      const iw = natW * fitScale
      const ih = natH * fitScale
      params.push({
        x: (cssW - iw) / 2,
        y: (cssH - ih) / 2,
        w: iw,
        h: ih,
      })
    }
    drawParamsRef.current = params
  }, [])

  // Cache context + track size via ResizeObserver
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    ctxRef.current = canvas.getContext('2d', { alpha: true })
    dprRef.current = window.devicePixelRatio || 1

    const resize = (w: number, h: number) => {
      const dpr = dprRef.current
      const cw = Math.round(w * dpr)
      const ch = Math.round(h * dpr)
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw
        canvas.height = ch
        // Set transform once on resize instead of every frame
        ctxRef.current?.setTransform(dpr, 0, 0, dpr, 0, 0)
      }
      canvasSizeRef.current = { w, h }
      recomputeDrawParams(w, h)
      lastFrameRef.current = -1
    }

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        resize(width, height)
      }
    })
    ro.observe(canvas)

    return () => { ro.disconnect() }
  }, [recomputeDrawParams])

  // Draw a specific frame — hot path, keep minimal
  const drawFrame = useCallback((frameIndex: number) => {
    const ctx = ctxRef.current
    const { w, h } = canvasSizeRef.current
    if (!ctx || w === 0) return

    const img = imagesRef.current[frameIndex]
    const p = drawParamsRef.current[frameIndex]
    if (!img || !p) return

    ctx.clearRect(0, 0, w, h)
    ctx.drawImage(img, p.x, p.y, p.w, p.h)
  }, [])

  // Animation loop
  useEffect(() => {
    if (!loaded) return

    // Recompute draw params now that bitmaps are loaded
    const { w, h } = canvasSizeRef.current
    if (w > 0) recomputeDrawParams(w, h)

    const unsubscribe = progress.on('change', (v) => {
      targetRef.current = Math.min(1, Math.max(0, v))
    })
    targetRef.current = Math.min(1, Math.max(0, progress.get()))

    const tick = () => {
      const diff = targetRef.current - currentRef.current
      if (Math.abs(diff) > 0.001) {
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
  }, [progress, loaded, drawFrame, recomputeDrawParams])

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
