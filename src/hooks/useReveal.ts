'use client'

import { useCallback, useRef, useState } from 'react'

/**
 * Lightweight scroll-reveal using IntersectionObserver.
 * Returns { ref, isVisible } for components that need conditional rendering,
 * and automatically adds 'visible' CSS class on the element for CSS-only reveals.
 */
export function useReveal(threshold = 0.1) {
  const observer = useRef<IntersectionObserver | null>(null)
  const [isVisible, setVisible] = useState(false)

  const ref = useCallback(
    (node: HTMLElement | null) => {
      if (observer.current) observer.current.disconnect()
      if (!node) return

      observer.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisible(true)
            node.classList.add('visible')
            observer.current?.disconnect()
          }
        },
        { threshold },
      )

      observer.current.observe(node)
    },
    [threshold],
  )

  return { ref, isVisible }
}
