'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useLocale } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { signOut } from 'next-auth/react'

type LogoutConfirmModalProps = {
  onClose: () => void
}

export default function LogoutConfirmModal({ onClose }: LogoutConfirmModalProps) {
  const locale = useLocale()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleEsc = useCallback((e: KeyboardEvent) => {
    if (!isLoading && e.key === 'Escape') onClose()
  }, [onClose, isLoading])

  useEffect(() => {
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [handleEsc])

  const handleConfirm = () => {
    setIsLoading(true)
    signOut({ callbackUrl: '/' })
  }

  const t = {
    title: locale === 'th' ? 'ออกจากระบบ' : 'Sign Out',
    message: locale === 'th' ? 'คุณต้องการออกจากระบบหรือไม่?' : 'Are you sure you want to sign out?',
    confirm: locale === 'th' ? 'ยืนยัน' : 'Confirm',
    cancel: locale === 'th' ? 'ยกเลิก' : 'Cancel',
    signing_out: locale === 'th' ? 'กำลังออกจากระบบ...' : 'Signing out...',
  }

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
        onClick={isLoading ? undefined : onClose}
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
            {!isLoading && (
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center hover:bg-white/10 transition-colors text-white rounded-full"
                aria-label="Close"
              >
                <i className="fa-solid fa-xmark text-lg" />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-sm text-neutral-600 mb-6">{t.message}</p>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className={`flex-1 px-5 py-3 border border-neutral-200 text-sm font-medium transition-all ${
                  isLoading
                    ? 'opacity-50 cursor-not-allowed text-neutral-400'
                    : 'text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50'
                }`}
              >
                {t.cancel}
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium transition-all ${
                  isLoading
                    ? 'bg-red-400 cursor-not-allowed text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                {isLoading && <i className="fa-solid fa-spinner fa-spin text-sm" />}
                {isLoading ? t.signing_out : t.confirm}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  )
}
