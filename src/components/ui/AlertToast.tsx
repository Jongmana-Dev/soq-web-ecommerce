'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAlertStore, type AlertType } from '@/lib/alert-store'

const accentMap: Record<AlertType, string> = {
  success: 'from-[#34C759] to-[#30B350]',
  error: 'from-[#FF3B30] to-[#E0352B]',
  warning: 'from-[#FF9500] to-[#E08600]',
  info: 'from-[#007AFF] to-[#006AE0]',
}

const iconMap: Record<AlertType, string> = {
  success: 'fa-solid fa-check',
  error: 'fa-solid fa-xmark',
  warning: 'fa-solid fa-triangle-exclamation',
  info: 'fa-solid fa-info',
}

const iconBgMap: Record<AlertType, string> = {
  success: 'bg-[#34C759]',
  error: 'bg-[#FF3B30]',
  warning: 'bg-[#FF9500]',
  info: 'bg-[#007AFF]',
}

const resultIconMap: Record<AlertType, { icon: string; bg: string; border: string }> = {
  success: { icon: 'fa-solid fa-circle-check text-[#34C759]', bg: 'bg-[#34C759]/10', border: 'border-[#34C759]/20' },
  error: { icon: 'fa-solid fa-circle-xmark text-[#FF3B30]', bg: 'bg-[#FF3B30]/10', border: 'border-[#FF3B30]/20' },
  warning: { icon: 'fa-solid fa-triangle-exclamation text-[#FF9500]', bg: 'bg-[#FF9500]/10', border: 'border-[#FF9500]/20' },
  info: { icon: 'fa-solid fa-circle-info text-[#007AFF]', bg: 'bg-[#007AFF]/10', border: 'border-[#007AFF]/20' },
}

const resultAccentMap: Record<AlertType, string> = {
  success: 'from-[#34C759] via-[#30B350] to-[#34C759]',
  error: 'from-[#FF3B30] via-[#E0352B] to-[#FF3B30]',
  warning: 'from-[#FF9500] via-[#E08600] to-[#FF9500]',
  info: 'from-[#007AFF] via-[#006AE0] to-[#007AFF]',
}

const resultButtonMap: Record<AlertType, string> = {
  success: 'bg-[#34C759] hover:bg-[#30B350]',
  error: 'bg-[#FF3B30] hover:bg-[#E0352B]',
  warning: 'bg-[#FF9500] hover:bg-[#E08600]',
  info: 'bg-[#007AFF] hover:bg-[#006AE0]',
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
              <div className="relative overflow-hidden bg-white/90 backdrop-blur-xl border border-black/[0.06] rounded-2xl shadow-lg shadow-black/10">
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
                      className="text-sm font-semibold text-[#1D1D1F]"
                    >
                      {alert.title}
                    </motion.p>
                    {alert.message && (
                      <motion.p
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xs text-[#86868B] mt-0.5"
                      >
                        {alert.message}
                      </motion.p>
                    )}
                  </div>

                  {/* Close */}
                  <button
                    onClick={() => hideAlert(alert.id)}
                    className="shrink-0 p-1 text-[#86868B] hover:text-[#1D1D1F] transition-colors"
                  >
                    <i className="fa-solid fa-xmark text-xs" />
                  </button>
                </div>

                {/* Shimmer */}
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: '200%' }}
                  transition={{ duration: 1.2, delay: 0.3, ease: 'easeInOut' }}
                  className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"
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
              <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-sm bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden"
              >
                {/* Accent bar */}
                <div className={`h-[2px] bg-gradient-to-r ${
                  isDanger
                    ? 'from-[#FF3B30] via-[#E0352B] to-[#FF3B30]'
                    : 'from-[#86868B] via-[#6E6E73] to-[#86868B]'
                }`} />

                <div className="p-6">
                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25, delay: 0.1 }}
                    className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
                      isDanger
                        ? 'bg-[#FF3B30]/10 border border-[#FF3B30]/20'
                        : 'bg-[#86868B]/10 border border-[#86868B]/20'
                    }`}
                  >
                    <i className={`text-lg ${
                      isDanger
                        ? 'fa-solid fa-triangle-exclamation text-[#FF3B30]'
                        : 'fa-solid fa-floppy-disk text-[#86868B]'
                    }`} />
                  </motion.div>

                  <h3 className="text-center text-lg font-semibold text-[#1D1D1F] mb-2">
                    {confirm.title}
                  </h3>
                  <p className="text-center text-sm text-[#86868B] mb-6">
                    {confirm.message}
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => { confirm.onCancel?.(); hideConfirm() }}
                      disabled={confirming}
                      className="flex-1 px-4 py-2.5 border border-[#D2D2D7] rounded-[10px] text-sm font-medium text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors disabled:opacity-50"
                    >
                      {confirm.cancelText ?? 'Cancel'}
                    </button>
                    <button
                      onClick={handleConfirm}
                      disabled={confirming}
                      className={`flex-1 px-4 py-2.5 rounded-[10px] text-sm font-medium text-white transition-colors disabled:opacity-50 ${
                        isDanger
                          ? 'bg-[#FF3B30] hover:bg-[#E0352B]'
                          : 'bg-[#86868B] hover:bg-[#6E6E73]'
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
              <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-sm bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden"
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
                    className="text-center text-lg font-semibold text-[#1D1D1F] mb-2"
                  >
                    {resultAlert.title}
                  </motion.h3>

                  {resultAlert.message && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-center text-sm text-[#86868B] mb-6 whitespace-pre-line"
                    >
                      {resultAlert.message}
                    </motion.p>
                  )}

                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25 }}
                    onClick={() => { resultAlert.onClose?.(); hideResultAlert() }}
                    className={`w-full px-4 py-2.5 rounded-[10px] text-sm font-medium text-white transition-colors ${resultButtonMap[resultAlert.type]}`}
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
