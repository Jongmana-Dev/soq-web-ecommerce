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

    const raf = () => {
      rx += (x - rx) * 0.18
      ry += (y - ry) * 0.18
      dot.current!.style.transform  = `translate3d(${x}px, ${y}px, 0)`
      ring.current!.style.transform = `translate3d(${rx}px, ${ry}px, 0)`
      rafId = requestAnimationFrame(raf)
    }
    const move = (e: MouseEvent) => { x = e.clientX; y = e.clientY }
    const over = (e: MouseEvent) => {
      const t = (e.target as HTMLElement).closest('a,button,[data-hover=cursor]') as HTMLElement | null
      ring.current!.dataset.hover = t ? 'true' : 'false'
    }
    const down = () => ring.current!.dataset.down = 'true'
    const up   = () => { ring.current!.dataset.down = 'false'; ripple(rx, ry) }

    function ripple(cx: number, cy: number){
      const r = document.createElement('div')
      r.className = 'lux-cursor lux-cursor--ripple'
      r.style.transform = `translate3d(${cx}px, ${cy}px, 0)`
      document.body.appendChild(r)
      setTimeout(() => r.remove(), 350)
    }

    document.addEventListener('mousemove', move)
    document.addEventListener('mouseover', over)
    document.addEventListener('mousedown', down)
    document.addEventListener('mouseup', up)
    rafId = requestAnimationFrame(raf)

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
