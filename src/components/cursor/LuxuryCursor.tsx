'use client'
import {useEffect, useRef, useState} from 'react'

export default function LuxuryCursor(){
  const dot  = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => { if (window.matchMedia('(pointer: fine)').matches) setEnabled(true) }, [])
  useEffect(() => {
    if (!enabled) return
    let x = window.innerWidth/2, y = window.innerHeight/2
    let rx = x, ry = y
    let rafId = 0
    let running = false

    const raf = () => {
      rx += (x - rx) * 0.18
      ry += (y - ry) * 0.18
      if (dot.current) dot.current.style.transform = `translate3d(${x}px, ${y}px, 0)`
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`
      // Stop loop when ring has caught up (idle)
      if (Math.abs(x - rx) < 0.5 && Math.abs(y - ry) < 0.5) {
        running = false
        return
      }
      rafId = requestAnimationFrame(raf)
    }
    const startLoop = () => {
      if (!running) { running = true; rafId = requestAnimationFrame(raf) }
    }
    const move = (e: MouseEvent) => { x = e.clientX; y = e.clientY; startLoop() }
    const over = (e: MouseEvent) => {
      const t = (e.target as HTMLElement).closest('a,button,[data-hover=cursor]') as HTMLElement | null
      if (ring.current) ring.current.dataset.hover = t ? 'true' : 'false'
    }
    const down = () => { if (ring.current) ring.current.dataset.down = 'true' }
    const up   = () => { if (ring.current) ring.current.dataset.down = 'false'; ripple(rx, ry) }

    function ripple(cx: number, cy: number){
      const r = document.createElement('div')
      r.className = 'lux-cursor lux-cursor--ripple'
      r.style.transform = `translate3d(${cx}px, ${cy}px, 0)`
      document.body.appendChild(r)
      setTimeout(() => r.remove(), 350)
    }

    document.addEventListener('mousemove', move, { passive: true })
    document.addEventListener('mouseover', over, { passive: true })
    document.addEventListener('mousedown', down)
    document.addEventListener('mouseup', up)

    return () => {
      document.removeEventListener('mousemove', move)
      document.removeEventListener('mouseover', over)
      document.removeEventListener('mousedown', down)
      document.removeEventListener('mouseup', up)
      cancelAnimationFrame(rafId)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <>
      <div ref={ring} className="lux-cursor lux-cursor--ring" />
      <div ref={dot}  className="lux-cursor lux-cursor--dot" />
    </>
  )
}
