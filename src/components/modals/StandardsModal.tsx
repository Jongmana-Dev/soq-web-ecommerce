'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLocale } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import type { Certification } from '@/lib/cms'

type StandardsModalProps = {
  onClose: () => void
  certifications: Certification[]
}

export default function StandardsModal({ onClose, certifications }: StandardsModalProps) {
  const locale = useLocale()
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  const cert = certifications[activeIndex]

  // Close on Escape
  const handleEsc = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [handleEsc])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const goTo = (index: number) => {
    setDirection(index > activeIndex ? 1 : -1)
    setActiveIndex(index)
  }

  const next = () => {
    setDirection(1)
    setActiveIndex((prev) => (prev + 1) % certifications.length)
  }

  const prev = () => {
    setDirection(-1)
    setActiveIndex((prev) => (prev - 1 + certifications.length) % certifications.length)
  }

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d < 0 ? 60 : -60, opacity: 0 }),
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 sm:p-8 border-b border-gray-100 flex items-center justify-between bg-white">
            <div>
              <h2 className="text-2xl sm:text-3xl font-light text-neutral-900 mb-1">
                {locale === 'th' ? 'มาตรฐานของเรา' : 'Our Standards'}
              </h2>
              <p className="text-neutral-500 text-sm">
                {locale === 'th' ? 'ความใส่ใจในคุณภาพและความปลอดภัย' : 'Commitment to Quality and Safety'}
              </p>
            </div>

            <button
              onClick={onClose}
              className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center bg-neutral-100 hover:bg-neutral-200 text-black transition-colors"
            >
              <i className="fa-solid fa-xmark text-xl" />
            </button>
          </div>

          {/* Carousel Content */}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain bg-[#F5F5F7]">
            {cert && (
              <div className="relative h-full">
                {/* Navigation Arrows */}
                {certifications.length > 1 && (
                  <>
                    <button
                      onClick={prev}
                      className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white/80 hover:bg-white shadow-sm text-neutral-600 hover:text-black transition-all"
                    >
                      <i className="fa-solid fa-chevron-left" />
                    </button>
                    <button
                      onClick={next}
                      className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white/80 hover:bg-white shadow-sm text-neutral-600 hover:text-black transition-all"
                    >
                      <i className="fa-solid fa-chevron-right" />
                    </button>
                  </>
                )}

                {/* Slide */}
                <AnimatePresence initial={false} custom={direction} mode="wait">
                  <motion.div
                    key={activeIndex}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.25 }}
                    className="flex flex-col items-center justify-center text-center px-12 sm:px-16 py-10 sm:py-14"
                  >
                    <div className="w-20 h-20 flex items-center justify-center bg-white text-[var(--accent)] shadow-sm mb-6">
                      <i className={`${cert.icon} text-3xl`} />
                    </div>
                    <h3 className="font-bold text-xl sm:text-2xl text-neutral-900 mb-3">
                      {locale === 'th' ? cert.label_th : cert.label_en}
                    </h3>
                    <p className="text-neutral-500 leading-relaxed max-w-md">
                      {locale === 'th' ? cert.description_th : cert.description_en}
                    </p>

                    {cert.pdf_url && (
                      <a
                        href={cert.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 border border-neutral-300 text-sm font-medium text-neutral-700 hover:border-black hover:text-black transition-colors"
                      >
                        <i className="fa-solid fa-file-pdf" />
                        {locale === 'th' ? 'ดูเอกสาร PDF' : 'View PDF Document'}
                      </a>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Footer with dots + close */}
          <div className="p-4 sm:p-6 border-t border-gray-100 bg-white flex items-center justify-between">
            {/* Dot indicators */}
            <div className="flex items-center gap-2">
              {certifications.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === activeIndex
                      ? 'bg-neutral-900 w-6'
                      : 'bg-neutral-300 hover:bg-neutral-400'
                  }`}
                  aria-label={`Go to certification ${i + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2 text-sm text-neutral-400">
              <span className="font-mono">
                {activeIndex + 1} / {certifications.length}
              </span>
              <button
                onClick={onClose}
                className="ml-4 px-6 py-2.5 bg-neutral-900 text-white font-medium hover:bg-black transition-colors"
              >
                {locale === 'th' ? 'ปิด' : 'Close'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
