'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ContactModal from '@/components/modals/ContactModal'

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)
  const [isContactOpen, setIsContactOpen] = useState(false)

  useEffect(() => {
    let ticking = false
    const toggleVisibility = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        setIsVisible(window.scrollY > 400)
        ticking = false
      })
    }

    window.addEventListener('scroll', toggleVisibility, { passive: true })
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">

        {/* Back to Top Button */}
        <AnimatePresence>
          {isVisible && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={scrollToTop}
              className="pointer-events-auto flex h-12 w-12 items-center justify-center bg-white border border-gray-200 text-neutral-900 shadow-lg hover:bg-gray-50 transition-all hover:scale-105"
              aria-label="Scroll to top"
            >
              <i className="fa-solid fa-arrow-up text-sm" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Floating Contact Button */}
        <button
          onClick={() => setIsContactOpen(true)}
          className="pointer-events-auto flex h-14 w-14 items-center justify-center bg-[var(--accent)] text-black shadow-lg shadow-[var(--accent)]/30 transition-all duration-300 hover:scale-110"
          aria-label="Contact Us"
        >
          <i className="fa-solid fa-comment-dots text-xl" />
        </button>

      </div>

      {isContactOpen && <ContactModal onClose={() => setIsContactOpen(false)} />}
    </>
  )
}
