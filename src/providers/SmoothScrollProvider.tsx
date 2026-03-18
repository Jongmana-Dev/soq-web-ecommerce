'use client'
import { useEffect, useRef } from 'react'
import Lenis from '@studio-freight/lenis'

type Props = { children: React.ReactNode }

export default function SmoothScrollProvider({ children }: Props) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.8,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      lerp: 0.08,
    })
    lenisRef.current = lenis

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    // --- Section tracking via IntersectionObserver ---
    const updateActive = (id: string) => {
      document.body.dataset.activeSection = id
      window.dispatchEvent(new CustomEvent('sectionchange', { detail: id }))
      window.history.replaceState(null, '', '#' + id)
    }

    const sections = Array.from(
      document.querySelectorAll<HTMLElement>('[data-section="true"]'),
    )

    const io = new IntersectionObserver(
      (entries) => {
        const top = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRect.height - a.intersectionRect.height)[0]
        if (top?.target?.id) updateActive(top.target.id)
      },
      { threshold: [0.25, 0.5], rootMargin: '-10% 0px -30% 0px' },
    )
    sections.forEach((s) => io.observe(s))

    // --- Anchor click → Lenis smooth scroll + events ---
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a') as HTMLAnchorElement | null
      if (!a) return
      const href = a.getAttribute('href') || ''
      if (!href.startsWith('#')) return
      const el = document.querySelector<HTMLElement>(href)
      if (!el) return
      e.preventDefault()
      window.history.replaceState(null, '', href)

      window.dispatchEvent(new CustomEvent('navjumpstart', { detail: href.slice(1) }))
      lenis.scrollTo(el, {
        offset: 0,
        duration: 1.4,
        onComplete: () => {
          window.dispatchEvent(new CustomEvent('navjumpend', { detail: href.slice(1) }))
        },
      })
    }
    document.addEventListener('click', onClick, true)

    return () => {
      document.removeEventListener('click', onClick, true)
      sections.forEach((s) => io.unobserve(s))
      io.disconnect()
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}

export { SmoothScrollProvider as LenisProvider }
