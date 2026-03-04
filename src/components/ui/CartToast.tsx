'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useCartToast } from '@/lib/cart-toast'
import { Check, ShoppingBag, X } from 'lucide-react'
import Image from 'next/image'

export default function CartToast() {
  const { item, visible, hide } = useCartToast()

  return (
    <AnimatePresence>
      {visible && item && (
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95, filter: 'blur(4px)' }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed bottom-6 right-6 z-[200] w-[360px] max-w-[calc(100vw-2rem)]"
        >
          <div className="relative overflow-hidden bg-neutral-950 border border-neutral-800 shadow-2xl shadow-black/40">
            {/* Gold accent bar */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 3, ease: 'linear' }}
              className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[var(--accent)] via-amber-300 to-[var(--accent)] origin-left"
            />

            <div className="p-4 flex gap-4">
              {/* Product image with checkmark overlay */}
              <div className="relative w-16 h-16 shrink-0 bg-neutral-900 overflow-hidden">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-neutral-600" />
                  </div>
                )}

                {/* Checkmark overlay */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25, delay: 0.2 }}
                  className="absolute inset-0 bg-black/60 flex items-center justify-center"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.35 }}
                    className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 text-neutral-900" strokeWidth={3} />
                  </motion.div>
                </motion.div>
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0">
                <motion.p
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-[11px] uppercase tracking-[0.15em] text-[var(--accent)] font-semibold mb-1"
                >
                  Added to cart
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                  className="text-sm font-medium text-neutral-100 truncate"
                >
                  {item.name}
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 }}
                  className="text-xs text-neutral-500 mt-0.5"
                >
                  {item.size_label && <span className="text-neutral-400">{item.size_label} · </span>}
                  {item.qty > 1 ? `${item.qty} x ` : ''}฿{item.price.toLocaleString()}
                </motion.p>
              </div>

              {/* Close */}
              <button
                onClick={hide}
                className="shrink-0 self-start p-2 -mr-1 text-neutral-600 hover:text-neutral-300 transition-colors"
                aria-label="close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Shimmer effect */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{ duration: 1.2, delay: 0.3, ease: 'easeInOut' }}
              className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
