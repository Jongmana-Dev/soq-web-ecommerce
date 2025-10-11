'use client'
import {useEffect} from 'react'
import Lenis from '@studio-freight/lenis'

type Props = { children: React.ReactNode }

export default function SmoothScrollProvider({children}: Props) {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.2, smoothWheel: true, lerp: 0.09 })

    let rafId = 0
    const raf = (t: number) => {  lenis.raf(t); rafId = requestAnimationFrame(raf) }
    rafId = requestAnimationFrame(raf)

    const updateActive = (id: string) => {
      document.body.dataset.activeSection = id
      window.dispatchEvent(new CustomEvent('sectionchange', { detail: id }))
    }
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-section="true"]'))
    const io = new IntersectionObserver((entries) => {
      const top = entries.filter(e => e.isIntersecting)
        .sort((a, b) => b.intersectionRect.height - a.intersectionRect.height)[0]
      if (top?.target?.id) updateActive(top.target.id)
    }, { threshold: [0.25, 0.5, 0.75], rootMargin: '-10% 0px -30% 0px' })
    sections.forEach(s => io.observe(s))

    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a') as HTMLAnchorElement | null
      if (!a) return
      const href = a.getAttribute('href') || ''
      if (!href.startsWith('#')) return
      const el = document.querySelector<HTMLElement>(href)
      if (!el) return
      e.preventDefault()

      window.dispatchEvent(new CustomEvent('navjumpstart', { detail: href.slice(1) }))
      lenis.scrollTo(el, { offset: -80 })
      el.classList.add('section-flash')
      setTimeout(() => el.classList.remove('section-flash'), 650)
      setTimeout(() => window.dispatchEvent(new CustomEvent('navjumpend', { detail: href.slice(1) })), 900)
    }
    document.addEventListener('click', onClick, true)

    return () => {
      document.removeEventListener('click', onClick, true)
      sections.forEach(s => io.unobserve(s)); io.disconnect()
      cancelAnimationFrame(rafId)
      lenis.destroy?.()
    }
  }, [])

  return <>{children}</>
}
export { SmoothScrollProvider as LenisProvider }
