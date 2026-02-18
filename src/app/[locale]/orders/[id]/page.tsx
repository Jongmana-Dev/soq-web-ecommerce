'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { useRouter, Link } from '@/i18n/navigation'
import { motion } from 'framer-motion'
import Footer from '@/components/sections/Footer'
import type { Order, OrderStatus } from '@/types/order'

const statusColor: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  paid: 'bg-emerald-100 text-emerald-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-neutral-100 text-neutral-600',
}

const TIMELINE_STEPS: OrderStatus[] = ['pending', 'confirmed', 'paid', 'shipped', 'delivered']

function getStepIndex(status: OrderStatus): number {
  const idx = TIMELINE_STEPS.indexOf(status)
  return idx === -1 ? -1 : idx
}

export default function OrderDetailPage() {
  const t = useTranslations('orders')
  const { status: authStatus } = useSession()
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.replace('/')
      return
    }
    if (authStatus !== 'authenticated' || !params.id) return

    fetch(`/api/orders-proxy/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then((res) => setOrder(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [authStatus, params.id, router])

  if (authStatus === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-[76px]">
        <i className="fa-solid fa-spinner fa-spin text-neutral-400 text-2xl" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <>
        <main className="min-h-screen bg-neutral-50 pt-[76px]">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 py-20 text-center">
            <i className="fa-solid fa-exclamation-triangle text-4xl text-neutral-300 mb-4" />
            <p className="text-neutral-500 mb-6">Order not found</p>
            <Link
              href="/orders"
              className="inline-block bg-neutral-900 text-white px-6 py-2.5 text-sm font-medium hover:bg-black transition-colors"
            >
              {t('backToOrders')}
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const isCancelledOrRefunded = order.status === 'cancelled' || order.status === 'refunded'
  const currentStepIdx = getStepIndex(order.status)
  const payment = order.payments[0]

  return (
    <>
      <main className="min-h-screen bg-neutral-50 pt-[76px]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
          {/* Back link */}
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-6"
          >
            <i className="fa-solid fa-arrow-left text-xs" />
            {t('backToOrders')}
          </Link>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-neutral-200 p-6 mb-4"
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-lg font-bold text-neutral-900 mb-1">{order.order_number}</h1>
                <p className="text-xs text-neutral-400">
                  {t('orderDate')}:{' '}
                  {new Date(order.created_at).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColor[order.status]}`}>
                {t(`status.${order.status}`)}
              </span>
            </div>
          </motion.div>

          {/* Timeline Tracking */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white border border-neutral-200 p-6 mb-4"
          >
            <h2 className="text-sm font-semibold text-neutral-900 mb-5">{t('tracking')}</h2>

            {isCancelledOrRefunded ? (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded">
                <i className="fa-solid fa-xmark text-red-500" />
                <span className="text-sm font-medium text-red-700">
                  {t(`status.${order.status}`)}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-0">
                {TIMELINE_STEPS.map((step, i) => {
                  const isPast = i < currentStepIdx
                  const isCurrent = i === currentStepIdx
                  const isFuture = i > currentStepIdx

                  return (
                    <div key={step} className="flex items-center flex-1 last:flex-none">
                      {/* Step circle + label */}
                      <div className="flex flex-col items-center gap-1.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            isPast
                              ? 'bg-green-500 text-white'
                              : isCurrent
                                ? 'bg-neutral-900 text-white ring-4 ring-neutral-900/10'
                                : 'bg-neutral-100 text-neutral-400'
                          }`}
                        >
                          {isPast ? (
                            <i className="fa-solid fa-check" />
                          ) : (
                            i + 1
                          )}
                        </div>
                        <span
                          className={`text-[10px] text-center leading-tight ${
                            isFuture ? 'text-neutral-300' : 'text-neutral-700 font-medium'
                          }`}
                        >
                          {t(`status.${step}`)}
                        </span>
                      </div>

                      {/* Connector line */}
                      {i < TIMELINE_STEPS.length - 1 && (
                        <div className="flex-1 mx-1">
                          <div
                            className={`h-0.5 w-full ${
                              i < currentStepIdx ? 'bg-green-500' : 'bg-neutral-200'
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </motion.div>

          {/* Order Items */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-neutral-200 p-6 mb-4"
          >
            <h2 className="text-sm font-semibold text-neutral-900 mb-4">{t('orderItems')}</h2>
            <div className="divide-y divide-neutral-100">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3 gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-neutral-900">{item.product_name}</p>
                    <p className="text-xs text-neutral-400">
                      {t('size')}: {item.size_label} &middot; {t('quantity')}: {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-neutral-900 shrink-0">
                    ฿{item.subtotal.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Price Summary */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white border border-neutral-200 p-6 mb-4"
          >
            <h2 className="text-sm font-semibold text-neutral-900 mb-4">{t('priceSummary')}</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">{t('subtotal')}</span>
                <span className="text-neutral-900">฿{order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">{t('shippingFee')}</span>
                <span className="text-neutral-900">
                  {order.shipping_fee === 0 ? t('free') : `฿${order.shipping_fee.toLocaleString()}`}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">{t('discount')}</span>
                  <span className="text-red-500">-฿{order.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-neutral-100">
                <span className="font-semibold text-neutral-900">{t('total')}</span>
                <span className="font-bold text-neutral-900 text-base">
                  ฿{order.total.toLocaleString()}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Shipping + Payment — side by side on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {/* Shipping Info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white border border-neutral-200 p-6"
            >
              <h2 className="text-sm font-semibold text-neutral-900 mb-3">{t('shippingInfo')}</h2>
              <div className="space-y-1 text-sm">
                <p className="font-medium text-neutral-900">{order.customer_name}</p>
                <p className="text-neutral-500">{order.customer_phone}</p>
                <p className="text-neutral-500">
                  {order.shipping_address} {order.shipping_province} {order.shipping_postal_code}
                </p>
              </div>
            </motion.div>

            {/* Payment Info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white border border-neutral-200 p-6"
            >
              <h2 className="text-sm font-semibold text-neutral-900 mb-3">{t('paymentInfo')}</h2>
              {payment ? (
                <div className="space-y-1 text-sm">
                  <p className="text-neutral-500">
                    {t('method')}: {t('promptpay')}
                  </p>
                  <p className="text-neutral-500">
                    {t('total')}: ฿{payment.amount.toLocaleString()}
                  </p>
                  <p className="text-neutral-500">
                    {t(`paymentStatus.${payment.status}`)}
                    {payment.confirmed_at && (
                      <> &middot; {new Date(payment.confirmed_at).toLocaleDateString('th-TH')}</>
                    )}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-neutral-400">—</p>
              )}
            </motion.div>
          </div>

          {/* Note */}
          {order.note && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white border border-neutral-200 p-6 mb-4"
            >
              <h2 className="text-sm font-semibold text-neutral-900 mb-2">
                <i className="fa-solid fa-sticky-note mr-2 text-xs opacity-40" />
                Note
              </h2>
              <p className="text-sm text-neutral-600">{order.note}</p>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
