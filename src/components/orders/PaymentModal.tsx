'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { useAlertStore } from '@/lib/alert-store'
import PromptPayQR from '@/components/checkout/PromptPayQR'
import type { Order } from '@/types/order'

interface PaymentModalProps {
  order: Order
  onClose: () => void
  onSuccess: () => void
}

interface PaymentAccount {
  type: 'promptpay' | 'bank_transfer'
  account_number: string
  account_name: string
  bank_name?: string | null
  bank_branch?: string | null
}

export default function PaymentModal({ order, onClose, onSuccess }: PaymentModalProps) {
  const t = useTranslations('orders')
  const tc = useTranslations('checkout')
  const locale = useLocale()
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [slipBase64, setSlipBase64] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([])
  const [activeTab, setActiveTab] = useState<'promptpay' | 'bank_transfer'>('promptpay')

  useEffect(() => {
    fetch('/api/settings-proxy/payment-accounts')
      .then((res) => res.json())
      .then((json) => {
        const accounts: PaymentAccount[] = json.data ?? []
        setPaymentAccounts(accounts)
        if (accounts.length > 0) {
          setActiveTab(accounts[0].type)
        }
      })
      .catch(() => {})
  }, [])

  const promptpay = paymentAccounts.find((a) => a.type === 'promptpay')
  const bankTransfer = paymentAccounts.find((a) => a.type === 'bank_transfer')
  const hasBoth = !!promptpay && !!bankTransfer

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const { resizeImageToBase64 } = await import('@/lib/image-utils')
      const base64 = await resizeImageToBase64(file, 1600, 1600, 0.8)
      setPreview(base64)
      setSlipBase64(base64)
    } catch {
      // Fallback: use original if resize fails
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        setPreview(result)
        setSlipBase64(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    if (!slipBase64) return
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/verify-slip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slip_image: slipBase64,
          order_id: order.id,
          amount: order.total,
          locale,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to verify slip')
      }

      useAlertStore.getState().showResultAlert({
        type: 'success',
        title: locale === 'th' ? 'ตรวจสอบสลิปสำเร็จ' : 'Slip Verified',
        message: locale === 'th' ? 'สลิปถูกต้อง ยืนยันคำสั่งซื้อเรียบร้อย' : 'Slip is valid. Order confirmed.',
        buttonText: locale === 'th' ? 'ตกลง' : 'OK',
        onClose: onSuccess,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
      setSubmitting(false)

      // Clear slip so user can re-upload
      setPreview(null)
      setSlipBase64('')
      if (fileRef.current) fileRef.current.value = ''

      useAlertStore.getState().showResultAlert({
        type: 'error',
        title: locale === 'th' ? 'ตรวจสอบสลิปไม่ผ่าน' : 'Slip Verification Failed',
        message,
        buttonText: locale === 'th' ? 'ตกลง' : 'OK',
      })
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
              className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-neutral-700 transition-colors"
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

            {/* Payment Method Tabs */}
            {hasBoth && (
              <div className="flex border border-neutral-200 bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={() => setActiveTab('promptpay')}
                  className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                    activeTab === 'promptpay'
                      ? 'bg-emerald-600 text-white'
                      : 'text-neutral-500 hover:bg-neutral-50'
                  }`}
                >
                  <i className="fa-solid fa-qrcode mr-1.5" />
                  {locale === 'th' ? 'พร้อมเพย์' : 'PromptPay'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('bank_transfer')}
                  className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                    activeTab === 'bank_transfer'
                      ? 'bg-emerald-600 text-white'
                      : 'text-neutral-500 hover:bg-neutral-50'
                  }`}
                >
                  <i className="fa-solid fa-building-columns mr-1.5" />
                  {locale === 'th' ? 'โอนเงิน' : 'Bank Transfer'}
                </button>
              </div>
            )}

            {/* PromptPay Content */}
            {activeTab === 'promptpay' && promptpay && (
              <div className="text-center space-y-3">
                <PromptPayQR amount={order.total} promptpayId={promptpay.account_number} />
                <p className="text-sm text-neutral-600 font-medium">{promptpay.account_name}</p>
                <div className="text-xl font-bold text-neutral-900">฿{order.total.toLocaleString()}</div>
              </div>
            )}

            {/* Bank Transfer Content */}
            {activeTab === 'bank_transfer' && bankTransfer && (
              <div className="space-y-3">
                <div className="bg-neutral-50 border border-neutral-200 p-4 space-y-2.5">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-neutral-400 w-20 shrink-0">{locale === 'th' ? 'ธนาคาร' : 'Bank'}</span>
                    <span className="font-medium text-neutral-900">{bankTransfer.bank_name}</span>
                  </div>
                  {bankTransfer.bank_branch && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-neutral-400 w-20 shrink-0">{locale === 'th' ? 'สาขา' : 'Branch'}</span>
                      <span className="text-neutral-700">{bankTransfer.bank_branch}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-neutral-400 w-20 shrink-0">{locale === 'th' ? 'เลขบัญชี' : 'Account'}</span>
                    <span className="font-mono font-semibold text-neutral-900 tracking-wide">{bankTransfer.account_number}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-neutral-400 w-20 shrink-0">{locale === 'th' ? 'ชื่อบัญชี' : 'Name'}</span>
                    <span className="text-neutral-700">{bankTransfer.account_name}</span>
                  </div>
                </div>
                <div className="text-center text-xl font-bold text-neutral-900">฿{order.total.toLocaleString()}</div>
              </div>
            )}

            {/* Upload Slip */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-neutral-700">{t('uploadSlipHere')}</p>

              {/* Slip verification warning */}
              <div className="flex gap-2.5 bg-neutral-100 border border-neutral-300 px-3 py-2.5">
                <i className="fa-solid fa-shield-halved text-neutral-600 mt-0.5 shrink-0 text-sm" />
                <div className="text-xs text-neutral-700 space-y-1">
                  <p className="font-medium">
                    {locale === 'th' ? 'สลิปจะถูกตรวจสอบอัตโนมัติ' : 'Slip will be verified automatically'}
                  </p>
                  <ul className="list-disc list-inside text-neutral-600 space-y-0.5">
                    <li>{locale === 'th' ? 'ยอดเงินต้องตรงกับคำสั่งซื้อ' : 'Amount must match the order total'}</li>
                    <li>{locale === 'th' ? 'สลิปแต่ละใบใช้ได้เพียงครั้งเดียว' : 'Each slip can only be used once'}</li>
                    <li>{locale === 'th' ? 'กรุณาใช้สลิปที่ชัดเจนและไม่ถูกครอบตัด' : 'Please use a clear and uncropped slip'}</li>
                  </ul>
                </div>
              </div>

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
              onClick={() => {
                useAlertStore.getState().showConfirm({
                  title: locale === 'th' ? 'ยืนยันการชำระเงิน' : 'Confirm Payment',
                  message: locale === 'th'
                    ? `ยืนยันส่งหลักฐานการชำระเงิน ฿${order.total.toLocaleString()} ใช่หรือไม่?\n\nสลิปจะถูกตรวจสอบอัตโนมัติก่อนยืนยันคำสั่งซื้อ`
                    : `Confirm payment of ฿${order.total.toLocaleString()}?\n\nThe slip will be verified automatically before confirming your order.`,
                  confirmText: locale === 'th' ? 'ยืนยัน' : 'Confirm',
                  cancelText: locale === 'th' ? 'ยกเลิก' : 'Cancel',
                  variant: 'info',
                  onConfirm: handleSubmit,
                })
              }}
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
