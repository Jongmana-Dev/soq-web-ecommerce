'use client'

import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import PromptPayQR from '@/components/checkout/PromptPayQR'
import type { Order } from '@/types/order'

interface PaymentModalProps {
  order: Order
  onClose: () => void
  onSuccess: () => void
}

export default function PaymentModal({ order, onClose, onSuccess }: PaymentModalProps) {
  const t = useTranslations('orders')
  const tc = useTranslations('checkout')
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [slipBase64, setSlipBase64] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setPreview(result)
      setSlipBase64(result)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    if (!slipBase64) return
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`/api/orders-proxy/${order.id}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'promptpay',
          slip_image: slipBase64,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Failed to upload payment')
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] flex items-center justify-center p-4"
        onClick={() => { if (!submitting) onClose() }}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md bg-white border border-neutral-200 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-neutral-100 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="SOQ" className="h-6 w-auto" />
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">{t('paymentModalTitle')}</h3>
                <p className="text-xs text-neutral-400">Order #{order.order_number}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={submitting}
              className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-neutral-700 transition-colors"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Order Summary */}
            <div className="bg-neutral-50 border border-neutral-100 p-4 space-y-3">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">{t('orderItems')}</p>
              <div className="space-y-1.5">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-neutral-700 truncate mr-3">
                      {item.product_name} <span className="text-neutral-400">x{item.quantity}</span>
                    </span>
                    <span className="text-neutral-900 font-medium shrink-0">฿{item.subtotal.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-neutral-200 pt-2 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">{t('subtotal')}</span>
                  <span className="text-neutral-700">฿{order.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">{t('shippingFee')}</span>
                  <span className="text-neutral-700">
                    {order.shipping_fee === 0 ? t('free') : `฿${order.shipping_fee.toLocaleString()}`}
                  </span>
                </div>
                {order.remote_area_fee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500">{t('remoteAreaFee')}</span>
                    <span className="text-neutral-700">+฿{order.remote_area_fee.toLocaleString()}</span>
                  </div>
                )}
                {order.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500">{t('discount')}</span>
                    <span className="text-red-500">-฿{order.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1 border-t border-neutral-200 font-semibold">
                  <span className="text-neutral-900">{t('total')}</span>
                  <span className="text-neutral-900">฿{order.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="text-center space-y-3">
              <PromptPayQR amount={order.total} />
              <div className="text-xl font-bold text-neutral-900">฿{order.total.toLocaleString()}</div>
            </div>

            {/* Upload Slip */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-neutral-700">{t('uploadSlipHere')}</p>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {preview ? (
                <div className="relative">
                  <img
                    src={preview}
                    alt="Slip preview"
                    className="w-full max-h-48 object-contain border border-neutral-200 bg-neutral-50"
                  />
                  <button
                    type="button"
                    onClick={() => { setPreview(null); setSlipBase64(''); if (fileRef.current) fileRef.current.value = '' }}
                    className="absolute top-2 right-2 w-6 h-6 bg-white border border-neutral-200 rounded-full flex items-center justify-center text-neutral-400 hover:text-red-500 transition-colors"
                  >
                    <i className="fa-solid fa-xmark text-xs" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full border-2 border-dashed border-neutral-300 py-8 text-center hover:border-neutral-400 hover:bg-neutral-50 transition-colors"
                >
                  <i className="fa-solid fa-cloud-arrow-up text-2xl text-neutral-300 mb-2" />
                  <p className="text-sm text-neutral-500">{tc('chooseFile')}</p>
                </button>
              )}
            </div>

            {error && (
              <div className="border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="button"
              disabled={!slipBase64 || submitting}
              onClick={handleSubmit}
              className="w-full bg-neutral-900 text-white py-3 font-semibold hover:bg-black transition-colors disabled:opacity-50"
            >
              {submitting ? (
                <i className="fa-solid fa-spinner fa-spin" />
              ) : (
                t('submitPayment')
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
