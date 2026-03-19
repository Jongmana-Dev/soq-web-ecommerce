'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import Image from 'next/image'
import dynamic from 'next/dynamic'
const ContactModal = dynamic(() => import('@/components/modals/ContactModal'))
import { useContactInfo } from '@/providers/ContactInfoProvider'
import type { ContactInfo } from '@/lib/cms'

interface TermsSectionData {
  title_th: string
  title_en: string
  body_th: string
  body_en: string
}

/* ─── Terms Modal (portalled to body → z-[300] above everything) ─── */
function TermsModal({ onClose, termsSections }: { onClose: () => void; termsSections: TermsSectionData[] }) {
  const t = useTranslations('footer')
  const locale = useLocale()

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Data from CMS API only
  const sections = termsSections.map((s) => ({
    title: locale === 'th' ? s.title_th : s.title_en,
    body: locale === 'th' ? s.body_th : s.body_en,
  }))

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6 overflow-hidden"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Panel */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          onWheel={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl max-h-[80vh] bg-white text-neutral-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
            <h2 className="text-lg font-semibold">{t('termsTitle')}</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors text-neutral-400 hover:text-neutral-900"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-6 space-y-6">
            <p className="text-sm text-neutral-500 leading-relaxed">
              {t('termsIntro')}
            </p>

            {sections.map((section, i) => (
              <div key={i}>
                <h3 className="text-sm font-semibold text-neutral-900 mb-2">
                  {i + 1}. {section.title}
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {section.body}
                </p>
              </div>
            ))}

            <p className="text-sm text-neutral-500 leading-relaxed pt-2 border-t border-neutral-100">
              {t('termsContact')}
            </p>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50">
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors"
            >
              OK
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  )
}

/* ─── Footer ─── */
export default function Footer({ termsSections = [], contactInfo: contactInfoProp }: { termsSections?: TermsSectionData[]; contactInfo?: ContactInfo }) {
  const contextInfo = useContactInfo()
  const ci = contactInfoProp ?? contextInfo
  const LINE_URL = ci.line_url
  const FACEBOOK_URL = ci.facebook_url
  const PHONE = ci.phone
  const EMAIL = ci.email
  const t = useTranslations('footer')
  const tHeader = useTranslations('Header')
  const locale = useLocale()
  const router = useRouter()
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })
  const [showTerms, setShowTerms] = useState(false)
  const [showContact, setShowContact] = useState(false)

  const changeLocale = (newLocale: 'th' | 'en') => {
    router.replace('/', { locale: newLocale })
  }

  const navLinks = [
    { href: '#testimonials', label: tHeader('reviews') },
    { href: '#products', label: tHeader('products') },
    { href: '#industrial-standards', label: tHeader('standards') },
    { href: '#about', label: locale === 'th' ? 'เกี่ยวกับเรา' : 'About Us' },
    { href: '#faq', label: tHeader('faq') },
  ]

  const contactLabel = tHeader('contact')

  return (
    <>
      <footer id="footer" ref={ref} className="relative bg-[#171717] text-white z-10">
        {/* Main */}
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 pt-10 pb-8">
          <div className="flex flex-col lg:flex-row justify-between gap-12">

            {/* LEFT GROUP — Logo + tagline + nav + social */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center lg:items-start"
            >
              <div className="flex flex-col items-center">
                <img src="/logo.svg" alt="SOQ" className="h-14 w-auto invert" />
                <p className="mt-2 text-neutral-500 text-xs tracking-widest uppercase text-center">
                  {t('tagline')}
                </p>
              </div>

              {/* Nav — stacked with bullets */}
              <nav className="mt-8">
                <ul className="flex flex-col items-center lg:items-start gap-2.5">
                  {navLinks.map((link) => (
                    <li key={link.href} className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-[var(--accent)]" />
                      <a href={link.href} className="text-sm text-neutral-400 hover:text-white transition-colors font-light">
                        {link.label}
                      </a>
                    </li>
                  ))}
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-[var(--accent)]" />
                    <button onClick={() => setShowContact(true)} className="text-sm text-neutral-400 hover:text-white transition-colors font-light">
                      {contactLabel}
                    </button>
                  </li>
                </ul>
              </nav>

            </motion.div>

            {/* RIGHT GROUP — LINE QR */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center lg:items-end"
            >
              {LINE_URL ? (
                <a href={LINE_URL} target="_blank" rel="noopener noreferrer" className="relative block">
                  <div className="relative bg-white p-1.0 shadow-lg shadow-white/5">
                    <Image
                      src="/line_oa.webp"
                      alt="LINE Official Account QR Code"
                      width={170}
                      height={170}
                      className="w-[170px] h-[170px] object-contain"
                    />
                  </div>
                  <p className="mt-2 text-neutral-500 text-[10px] text-center tracking-wide">{t('addLine')}</p>
                </a>
              ) : (
                <div className="relative bg-white rounded-xl p-2.5 shadow-lg shadow-white/5">
                  <div className="w-28 h-28 border-2 border-dashed border-neutral-300 rounded-md flex items-center justify-center text-neutral-400">
                    <span className="text-xs">LINE QR</span>
                  </div>
                </div>
              )}

              {/* Social icons */}
              <div className="flex gap-3 mt-6">
                {FACEBOOK_URL && (
                  <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                    className="w-9 h-9 flex items-center justify-center rounded-full border border-neutral-700 text-neutral-500 hover:border-[#1877F2] hover:text-[#1877F2] transition-colors">
                    <i className="fa-brands fa-facebook-f text-xs" />
                  </a>
                )}
                {LINE_URL && (
                  <a href={LINE_URL} target="_blank" rel="noopener noreferrer" aria-label="LINE"
                    className="w-9 h-9 flex items-center justify-center rounded-full border border-neutral-700 text-neutral-500 hover:border-[#06C755] hover:text-[#06C755] transition-colors">
                    <i className="fa-brands fa-line text-xs" />
                  </a>
                )}
                {PHONE && (
                  <a href={`tel:${PHONE.replace(/-/g, '')}`} aria-label="Phone"
                    className="w-9 h-9 flex items-center justify-center rounded-full border border-neutral-700 text-neutral-500 hover:border-emerald-500 hover:text-emerald-500 transition-colors">
                    <i className="fa-solid fa-phone text-xs" />
                  </a>
                )}
                {EMAIL && (
                  <button onClick={() => setShowContact(true)} aria-label="Email"
                    className="w-9 h-9 flex items-center justify-center rounded-full border border-neutral-700 text-neutral-500 hover:border-white hover:text-white transition-colors">
                    <i className="fa-solid fa-envelope text-xs" />
                  </button>
                )}
              </div>
            </motion.div>

          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-neutral-700/50">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-center">
            <div className="flex items-center gap-3 text-neutral-600 text-[11px]">
              <span>&copy; {new Date().getFullYear()} SOQ. All rights reserved.</span>
              {termsSections.length > 0 && (
                <>
                  <span className="text-neutral-700">|</span>
                  <button onClick={() => setShowTerms(true)} className="hover:text-white transition-colors underline underline-offset-2">
                    {t('terms')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* Terms modal — portalled to body, z-[300] above BackToTop(z-50) & CartToast(z-200) */}
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} termsSections={termsSections} />}
      {showContact && <ContactModal onClose={() => setShowContact(false)} contactInfo={ci} />}
    </>
  )
}
