'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { ScrollState } from './types'

/** Clamp a value between 0 and 1 */
function clamp01(v: number) {
  return Math.min(1, Math.max(0, v))
}

/** Map a value from [inMin, inMax] to [outMin, outMax], clamped */
function mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  const t = clamp01((value - inMin) / (inMax - inMin))
  return outMin + t * (outMax - outMin)
}

interface UseScrollAnimationOptions {
  frameCount: number
  framePath: string
  onProgress?: (state: ScrollState) => void
}

export function useScrollAnimation({ frameCount, framePath, onProgress }: UseScrollAnimationOptions) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imagesRef = useRef<HTMLImageElement[]>([])
  const lastFrameRef = useRef(-1)
  const rafRef = useRef(0)

  const [loadProgress, setLoadProgress] = useState(0)
  const [loaded, setLoaded] = useState(false)

  // Preload all frames
  useEffect(() => {
    let mounted = true
    const images: HTMLImageElement[] = []
    let count = 0

    for (let i = 0; i < frameCount; i++) {
      const img = new Image()
      img.src = framePath.replace('{index}', String(i + 1).padStart(4, '0'))
      img.onload = () => {
        count++
        if (mounted) {
          setLoadProgress(count / frameCount)
          if (count === frameCount) {
            imagesRef.current = images
            setLoaded(true)
          }
        }
      }
      img.onerror = () => {
        count++
        if (mounted) setLoadProgress(count / frameCount)
      }
      images[i] = img
    }

    return () => { mounted = false }
  }, [frameCount, framePath])

  // Compute scroll state from progress
  const computeState = useCallback((progress: number): ScrollState => {
    const p = clamp01(progress)
    return {
      progress: p,
      frameIndex: Math.min(frameCount - 1, Math.max(0, Math.round(p * (frameCount - 1)))),
      brandOpacity: mapRange(p, 0, 0.2, 0, 1),
      brandY: mapRange(p, 0, 0.2, 30, 0),
      taglineOpacity: mapRange(p, 0.3, 0.5, 0, 1),
      triangleScale: mapRange(p, 0.15, 0.35, 0.8, 1),
      sectionOpacity: mapRange(p, 0.85, 1, 1, 0),
    }
  }, [frameCount])

  // Render loop
  useEffect(() => {
    if (!loaded) return

    const drawFrame = (frameIndex: number) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const img = imagesRef.current[frameIndex]
      if (!img) return

      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      const cw = Math.round(rect.width * dpr)
      const ch = Math.round(rect.height * dpr)

      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw
        canvas.height = ch
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, rect.width, rect.height)

      // Contain-fit, centered
      const fitScale = Math.min(rect.width / img.width, rect.height / img.height)
      const w = img.width * fitScale
      const h = img.height * fitScale
      const x = (rect.width - w) / 2
      const y = (rect.height - h) / 2

      ctx.drawImage(img, x, y, w, h)
    }

    const tick = () => {
      const container = containerRef.current
      if (!container) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }

      const rect = container.getBoundingClientRect()
      const scrollableHeight = container.scrollHeight - window.innerHeight
      const scrolled = -rect.top
      const progress = clamp01(scrolled / scrollableHeight)
      const state = computeState(progress)

      if (state.frameIndex !== lastFrameRef.current) {
        drawFrame(state.frameIndex)
        lastFrameRef.current = state.frameIndex
      }

      onProgress?.(state)
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => { cancelAnimationFrame(rafRef.current) }
  }, [loaded, computeState, onProgress])

  return { containerRef, canvasRef, loadProgress, loaded }
}
