'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAlertStore, type AlertType } from '@/lib/alert-store'

const accentMap: Record<AlertType, string> = {
  success: 'from-emerald-400 to-emerald-500',
  error: 'from-red-400 to-red-500',
  warning: 'from-amber-400 to-amber-500',
  info: 'from-blue-400 to-blue-500',
}

const iconMap: Record<AlertType, string> = {
  success: 'fa-solid fa-check',
  error: 'fa-solid fa-xmark',
  warning: 'fa-solid fa-triangle-exclamation',
  info: 'fa-solid fa-info',
}

const iconBgMap: Record<AlertType, string> = {
  success: 'bg-emerald-500',
  error: 'bg-red-500',
  warning: 'bg-amber-500',
  info: 'bg-blue-500',
}

const resultIconMap: Record<AlertType, { icon: string; bg: string; border: string }> = {
  success: { icon: 'fa-solid fa-circle-check text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  error: { icon: 'fa-solid fa-circle-xmark text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  warning: { icon: 'fa-solid fa-triangle-exclamation text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  info: { icon: 'fa-solid fa-circle-info text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
}

const resultAccentMap: Record<AlertType, string> = {
  success: 'from-emerald-400 via-emerald-500 to-emerald-400',
  error: 'from-red-400 via-red-500 to-red-400',
  warning: 'from-amber-400 via-amber-500 to-amber-400',
  info: 'from-blue-400 via-blue-500 to-blue-400',
}

const resultButtonMap: Record<AlertType, string> = {
  success: 'bg-emerald-600 hover:bg-emerald-700',
  error: 'bg-red-600 hover:bg-red-700',
  warning: 'bg-amber-600 hover:bg-amber-700',
  info: 'bg-blue-600 hover:bg-blue-700',
}

export default function AlertToast() {
  const { alerts, hideAlert, confirm, hideConfirm, resultAlert, hideResultAlert } = useAlertStore()
  const [confirming, setConfirming] = useState(false)

  const handleConfirm = async () => {
    if (!confirm) return
    const current = confirm
    setConfirming(true)
    try {
      await current.onConfirm()
    } finally {
      setConfirming(false)
      // Only hide if no new confirm was shown during onConfirm callback
      if (useAlertStore.getState().confirm === current) {
        hideConfirm()
      }
    }
  }

  return (
    <>
      {/* Toast Stack — top-right */}
      <div className="fixed top-20 right-4 z-[200] flex flex-col gap-3 w-[360px] max-w-[calc(100vw-2rem)]">
        <AnimatePresence>
          {alerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: 80, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.95, filter: 'blur(4px)' }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              <div className="relative overflow-hidden bg-neutral-950 border border-neutral-800 shadow-2xl shadow-black/40">
                {/* Accent progress bar */}
                <motion.div
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: 4, ease: 'linear' }}
                  className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${accentMap[alert.type]} origin-left`}
                />

                <div className="p-4 flex items-start gap-3">
                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.15 }}
                    className={`w-8 h-8 shrink-0 rounded-full ${iconBgMap[alert.type]} flex items-center justify-center`}
                  >
                    <i className={`${iconMap[alert.type]} text-white text-xs`} />
                  </motion.div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <motion.p
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-sm font-semibold text-neutral-100"
                    >
                      {alert.title}
                    </motion.p>
                    {alert.message && (
                      <motion.p
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xs text-neutral-400 mt-0.5"
                      >
                        {alert.message}
                      </motion.p>
                    )}
                  </div>

                  {/* Close */}
                  <button
                    onClick={() => hideAlert(alert.id)}
                    className="shrink-0 p-1 text-neutral-600 hover:text-neutral-300 transition-colors"
                  >
                    <i className="fa-solid fa-xmark text-xs" />
                  </button>
                </div>

                {/* Shimmer */}
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: '200%' }}
                  transition={{ duration: 1.2, delay: 0.3, ease: 'easeInOut' }}
                  className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Confirm Modal */}
      <AnimatePresence>
        {confirm && (() => {
          const isDanger = (confirm.variant ?? 'danger') === 'danger'
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[300] flex items-center justify-center p-4"
              onClick={() => { if (!confirming) { confirm.onCancel?.(); hideConfirm() } }}
            >
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-sm bg-neutral-950 border border-neutral-800 shadow-2xl overflow-hidden"
              >
                {/* Accent bar */}
                <div className={`h-[2px] bg-gradient-to-r ${
                  isDanger
                    ? 'from-red-400 via-red-500 to-red-400'
                    : 'from-neutral-400 via-neutral-500 to-neutral-400'
                }`} />

                <div className="p-6">
                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25, delay: 0.1 }}
                    className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
                      isDanger
                        ? 'bg-red-500/10 border border-red-500/20'
                        : 'bg-neutral-500/10 border border-neutral-500/20'
                    }`}
                  >
                    <i className={`text-lg ${
                      isDanger
                        ? 'fa-solid fa-triangle-exclamation text-red-400'
                        : 'fa-solid fa-floppy-disk text-neutral-300'
                    }`} />
                  </motion.div>

                  <h3 className="text-center text-lg font-semibold text-neutral-100 mb-2">
                    {confirm.title}
                  </h3>
                  <p className="text-center text-sm text-neutral-400 mb-6">
                    {confirm.message}
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => { confirm.onCancel?.(); hideConfirm() }}
                      disabled={confirming}
                      className="flex-1 px-4 py-2.5 border border-neutral-700 text-sm font-medium text-neutral-300 hover:bg-neutral-800 transition-colors disabled:opacity-50"
                    >
                      {confirm.cancelText ?? 'Cancel'}
                    </button>
                    <button
                      onClick={handleConfirm}
                      disabled={confirming}
                      className={`flex-1 px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50 ${
                        isDanger
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-neutral-700 hover:bg-neutral-600'
                      }`}
                    >
                      {confirming ? (
                        <i className="fa-solid fa-spinner fa-spin" />
                      ) : (
                        confirm.confirmText ?? 'Confirm'
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )
        })()}
      </AnimatePresence>

      {/* Result Alert Modal — centered with single OK button */}
      <AnimatePresence>
        {resultAlert && (() => {
          const style = resultIconMap[resultAlert.type]
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[310] flex items-center justify-center p-4"
              onClick={() => { resultAlert.onClose?.(); hideResultAlert() }}
            >
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-sm bg-neutral-950 border border-neutral-800 shadow-2xl overflow-hidden"
              >
                {/* Accent bar */}
                <div className={`h-[3px] bg-gradient-to-r ${resultAccentMap[resultAlert.type]}`} />

                <div className="p-6">
                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25, delay: 0.1 }}
                    className={`w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center ${style.bg} border ${style.border}`}
                  >
                    <i className={`text-2xl ${style.icon}`} />
                  </motion.div>

                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-center text-lg font-semibold text-neutral-100 mb-2"
                  >
                    {resultAlert.title}
                  </motion.h3>

                  {resultAlert.message && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-center text-sm text-neutral-400 mb-6 whitespace-pre-line"
                    >
                      {resultAlert.message}
                    </motion.p>
                  )}

                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25 }}
                    onClick={() => { resultAlert.onClose?.(); hideResultAlert() }}
                    className={`w-full px-4 py-2.5 text-sm font-medium text-white transition-colors ${resultButtonMap[resultAlert.type]}`}
                  >
                    {resultAlert.buttonText ?? 'OK'}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )
        })()}
      </AnimatePresence>
    </>
  )
}
