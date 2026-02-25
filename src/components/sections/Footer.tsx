'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import ContactModal from '@/components/modals/ContactModal'

/* ─── Terms Modal (portalled to body → z-[300] above everything) ─── */
function TermsModal({ onClose }: { onClose: () => void }) {
  const t = useTranslations('footer')

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

  const sections = [
    { title: t('termsGeneral'), body: t('termsGeneralDesc') },
    { title: t('termsProduct'), body: t('termsProductDesc') },
    { title: t('termsOrder'), body: t('termsOrderDesc') },
    { title: t('termsShipping'), body: t('termsShippingDesc') },
    { title: t('termsReturn'), body: t('termsReturnDesc') },
    { title: t('termsPrivacy'), body: t('termsPrivacyDesc') },
  ]

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
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors text-neutral-400 hover:text-neutral-900"
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

/* ─── Social config from env ─── */
const LINE_ID = process.env.NEXT_PUBLIC_LINE_ID ?? ''
const LINE_URL = LINE_ID ? `https://line.me/R/ti/p/${LINE_ID}` : ''
const FACEBOOK_URL = process.env.NEXT_PUBLIC_FACEBOOK_URL ?? ''
const PHONE = process.env.NEXT_PUBLIC_PHONE ?? ''
const EMAIL = process.env.NEXT_PUBLIC_EMAIL ?? ''

/* ─── Footer ─── */
export default function Footer() {
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
    { href: '#industrial-standards', label: tHeader('standards') },
    { href: '#faq', label: tHeader('faq') },
  ]

  const contactLabel = tHeader('contact')

  return (
    <>
      <footer id="footer" ref={ref} className="relative bg-[#0f0f0f] text-white z-10">
        {/* Main */}
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 pt-20 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">

            {/* Left — Brand + tagline + nav */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6 }}
              className="lg:col-span-5"
            >
              <img
                src="/logo.svg"
                alt="SOQ"
                className="h-16 lg:h-20 w-auto invert"
              />
              <p className="mt-4 text-neutral-400 text-sm leading-relaxed max-w-xs">
                {t('tagline')}
              </p>

              {/* Nav — desktop */}
              <nav className="mt-10 hidden lg:block">
                <ul className="flex flex-wrap gap-x-6 gap-y-2">
                  {navLinks.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className="text-sm text-neutral-500 hover:text-white transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                  <li>
                    <button
                      onClick={() => setShowContact(true)}
                      className="text-sm text-neutral-500 hover:text-white transition-colors"
                    >
                      {contactLabel}
                    </button>
                  </li>
                </ul>
              </nav>
            </motion.div>

            {/* Right — QR + social */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-4 lg:col-start-9 flex flex-col items-center lg:items-end gap-6"
            >
              {/* LINE QR Code */}
              {LINE_URL ? (
                <a href={LINE_URL} target="_blank" rel="noopener noreferrer" className="block">
                  <div className="bg-white rounded-2xl p-3 shadow-lg shadow-white/5">
                    <img
                      src="/line_oa.webp"
                      alt="LINE Official Account QR Code"
                      width={160}
                      height={160}
                      className="w-40 h-40 object-contain rounded-lg"
                    />
                  </div>
                </a>
              ) : (
                <div className="bg-white rounded-2xl p-3 shadow-lg shadow-white/5">
                  <div className="w-40 h-40 border-2 border-dashed border-neutral-300 rounded-lg flex items-center justify-center text-neutral-400">
                    <span className="text-xs">LINE QR</span>
                  </div>
                </div>
              )}

              {/* <p className="text-neutral-500 text-sm">{t('addLine')}</p> */}

              {/* Social icons */}
              <div className="flex gap-3">
                {FACEBOOK_URL && (
                  <a
                    href={FACEBOOK_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="w-10 h-10 flex items-center justify-center rounded-full border border-neutral-700 text-neutral-400 hover:border-[#1877F2] hover:text-[#1877F2] transition-colors"
                  >
                    <i className="fa-brands fa-facebook-f text-sm" />
                  </a>
                )}
                {LINE_URL && (
                  <a
                    href={LINE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LINE"
                    className="w-10 h-10 flex items-center justify-center rounded-full border border-neutral-700 text-neutral-400 hover:border-[#06C755] hover:text-[#06C755] transition-colors"
                  >
                    <i className="fa-brands fa-line text-sm" />
                  </a>
                )}
                {PHONE && (
                  <a
                    href={`tel:${PHONE.replace(/-/g, '')}`}
                    aria-label="Phone"
                    className="w-10 h-10 flex items-center justify-center rounded-full border border-neutral-700 text-neutral-400 hover:border-emerald-500 hover:text-emerald-500 transition-colors"
                  >
                    <i className="fa-solid fa-phone text-sm" />
                  </a>
                )}
                {EMAIL && (
                  <button
                    onClick={() => setShowContact(true)}
                    aria-label="Email"
                    className="w-10 h-10 flex items-center justify-center rounded-full border border-neutral-700 text-neutral-400 hover:border-white hover:text-white transition-colors"
                  >
                    <i className="fa-solid fa-envelope text-sm" />
                  </button>
                )}
              </div>

              {/* Nav — mobile */}
              <nav className="lg:hidden mt-4">
                <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                  {navLinks.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className="text-sm text-neutral-500 hover:text-white transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                  <li>
                    <button
                      onClick={() => setShowContact(true)}
                      className="text-sm text-neutral-500 hover:text-white transition-colors"
                    >
                      {contactLabel}
                    </button>
                  </li>
                </ul>
              </nav>
            </motion.div>

          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-neutral-800">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-neutral-500 text-xs">
              <span>&copy; {new Date().getFullYear()} SOQ. All rights reserved.</span>
              <span className="text-neutral-700">|</span>
              <button
                onClick={() => setShowTerms(true)}
                className="hover:text-white transition-colors underline underline-offset-2"
              >
                {t('terms')}
              </button>
            </div>

            <div className="flex gap-4 text-xs font-medium">
              <button
                onClick={() => changeLocale('en')}
                className={`transition-colors ${locale === 'en' ? 'text-white' : 'text-neutral-500 hover:text-white'}`}
              >
                Eng
              </button>
              <span className="text-neutral-700">|</span>
              <button
                onClick={() => changeLocale('th')}
                className={`transition-colors ${locale === 'th' ? 'text-white' : 'text-neutral-500 hover:text-white'}`}
              >
                ไทย
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Terms modal — portalled to body, z-[300] above BackToTop(z-50) & CartToast(z-200) */}
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
      {showContact && <ContactModal onClose={() => setShowContact(false)} />}
    </>
  )
}
