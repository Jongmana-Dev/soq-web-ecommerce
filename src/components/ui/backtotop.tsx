'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)
  const [isContactOpen, setIsContactOpen] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 400)
    }

    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
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
      <div className="pointer-events-auto relative group">
          {/* Menu Items */}
          <AnimatePresence>
            {isContactOpen && (
               <motion.div
                 initial={{ opacity: 0, y: 10, scale: 0.9 }}
                 animate={{ opacity: 1, y: 0, scale: 1 }}
                 exit={{ opacity: 0, y: 10, scale: 0.9 }}
                 className="absolute bottom-full right-0 mb-3 flex flex-col gap-2 min-w-[160px]"
               >
                  <a 
                    href="https://line.me/ti/p/@soq" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 bg-[#06C755] text-white shadow-lg hover:scale-105 transition-transform"
                  >
                     <i className="fa-brands fa-line text-xl" />
                     <span className="font-medium text-sm">Line Official</span>
                  </a>
                  <a 
                    href="https://facebook.com/soq" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 bg-[#1877F2] text-white shadow-lg hover:scale-105 transition-transform"
                  >
                     <i className="fa-brands fa-facebook-f text-xl" />
                     <span className="font-medium text-sm">Messenger</span>
                  </a>
               </motion.div>
            )}
          </AnimatePresence>

          {/* Main Toggle Button */}
          <button
            onClick={() => setIsContactOpen(!isContactOpen)}
            className={`flex h-14 w-14 items-center justify-center bg-[var(--accent)] text-black shadow-lg shadow-[var(--accent)]/30 transition-all duration-300 hover:scale-110 ${isContactOpen ? 'rotate-45' : ''}`}
            aria-label="Contact Us"
          >
             {isContactOpen ? (
                <i className="fa-solid fa-plus text-xl" />
             ) : (
                <i className="fa-solid fa-comment-dots text-xl" />
             )}
          </button>
      </div>

    </div>
  )
}
