'use client'

import { useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useLocale } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { signIn } from 'next-auth/react'

type LoginModalProps = {
  onClose: () => void
  callbackUrl?: string
}

export default function LoginModal({ onClose, callbackUrl }: LoginModalProps) {
  const locale = useLocale()

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleEsc = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [handleEsc])

  const handleOAuth = (provider: string) => {
    signIn(provider, { callbackUrl: callbackUrl ?? `/${locale}/profile` })
  }

  const t = {
    title: locale === 'th' ? 'เข้าสู่ระบบ' : 'Sign In',
    desc: locale === 'th' ? 'เลือกช่องทางเข้าสู่ระบบ' : 'Choose a sign in method',
    google: locale === 'th' ? 'เข้าสู่ระบบด้วย Google' : 'Continue with Google',
    line: locale === 'th' ? 'เข้าสู่ระบบด้วย LINE' : 'Continue with LINE',
  }

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-sm bg-white shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 bg-neutral-900">
            <h2 className="text-lg font-semibold text-white">{t.title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center hover:bg-white/10 transition-colors text-neutral-400 hover:text-white rounded-full"
              aria-label="Close"
            >
              <i className="fa-solid fa-xmark text-lg" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-sm text-neutral-500 mb-6">{t.desc}</p>

            <div className="space-y-3">
              <button
                onClick={() => handleOAuth('google')}
                className="w-full flex items-center gap-4 px-5 py-3.5 border border-neutral-200 text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50 transition-all"
              >
                <i className="fa-brands fa-google text-lg w-5 text-center text-[#4285F4]" />
                <span className="font-medium text-sm">{t.google}</span>
              </button>
              <button
                onClick={() => handleOAuth('line')}
                className="w-full flex items-center gap-4 px-5 py-3.5 border border-neutral-200 text-neutral-700 hover:border-[#06C755] hover:bg-[#06C755]/5 transition-all"
              >
                <i className="fa-brands fa-line text-lg w-5 text-center text-[#06C755]" />
                <span className="font-medium text-sm">{t.line}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  )
}
