'use client'
import { useEffect } from 'react'

type Props = { children: React.ReactNode }

/**
 * Lightweight smooth-scroll provider.
 * Uses native CSS scroll-behavior: smooth (set in globals.css).
 * Keeps: IntersectionObserver section tracking, anchor click handling,
 *        sectionchange / navjumpstart / navjumpend custom events.
 */
export default function SmoothScrollProvider({ children }: Props) {
  useEffect(() => {
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

    // --- Anchor click → native smooth scroll + events ---
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

      el.scrollIntoView({ behavior: 'smooth', block: 'start' })

      // Fire navjumpend after scroll animation (~600ms)
      setTimeout(
        () => window.dispatchEvent(new CustomEvent('navjumpend', { detail: href.slice(1) })),
        700,
      )
    }
    document.addEventListener('click', onClick, true)

    return () => {
      document.removeEventListener('click', onClick, true)
      sections.forEach((s) => io.unobserve(s))
      io.disconnect()
    }
  }, [])

  return <>{children}</>
}

export { SmoothScrollProvider as LenisProvider }
