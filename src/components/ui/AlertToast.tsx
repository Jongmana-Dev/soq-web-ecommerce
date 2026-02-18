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

export default function AlertToast() {
  const { alerts, hideAlert, confirm, hideConfirm } = useAlertStore()
  const [confirming, setConfirming] = useState(false)

  const handleConfirm = async () => {
    if (!confirm) return
    setConfirming(true)
    try {
      await confirm.onConfirm()
    } finally {
      setConfirming(false)
      hideConfirm()
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
        {confirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4"
            onClick={() => { if (!confirming) hideConfirm() }}
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
              {/* Red accent bar */}
              <div className="h-[2px] bg-gradient-to-r from-red-400 via-red-500 to-red-400" />

              <div className="p-6">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25, delay: 0.1 }}
                  className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center"
                >
                  <i className="fa-solid fa-triangle-exclamation text-red-400 text-lg" />
                </motion.div>

                <h3 className="text-center text-lg font-semibold text-neutral-100 mb-2">
                  {confirm.title}
                </h3>
                <p className="text-center text-sm text-neutral-400 mb-6">
                  {confirm.message}
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={hideConfirm}
                    disabled={confirming}
                    className="flex-1 px-4 py-2.5 border border-neutral-700 text-sm font-medium text-neutral-300 hover:bg-neutral-800 transition-colors disabled:opacity-50"
                  >
                    {confirm.cancelText ?? 'Cancel'}
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={confirming}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50"
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
        )}
      </AnimatePresence>
    </>
  )
}
