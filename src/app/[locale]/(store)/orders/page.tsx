'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { Link } from '@/i18n/navigation'
import { motion } from 'framer-motion'
import Footer from '@/components/sections/Footer'
import PaymentModal from '@/components/orders/PaymentModal'
import { useAlertStore } from '@/lib/alert-store'
import { usePendingOrders } from '@/lib/pending-orders-store'
import FullscreenLoading from '@/components/ui/FullscreenLoading'
import type { Order, OrderStatus } from '@/types/order'

const statusColor: Record<OrderStatus, string> = {
  pending_payment: 'bg-amber-100 text-amber-700',
  confirm_payment: 'bg-emerald-100 text-emerald-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancel_order: 'bg-red-100 text-red-700',
  expire: 'bg-neutral-100 text-neutral-600',
}

export default function OrdersPage() {
  const t = useTranslations('orders')
  const locale = useLocale()
  const { status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [payingOrder, setPayingOrder] = useState<Order | null>(null)

  const fetchOrders = () => {
    fetch('/api/orders-proxy')
      .then((res) => res.json())
      .then((res) => setOrders(res.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/')
      return
    }
    if (status !== 'authenticated') return
    fetchOrders()
  }, [status, router])

  const handleCancel = (order: Order) => {
    useAlertStore.getState().showConfirm({
      title: t('cancelConfirmTitle'),
      message: locale === 'th'
        ? `คุณต้องการยกเลิกคำสั่งซื้อ ${order.order_number} ใช่หรือไม่?`
        : `Are you sure you want to cancel order ${order.order_number}?`,
      confirmText: t('cancelConfirmBtn'),
      cancelText: t('cancelCancelBtn'),
      variant: 'danger',
      onConfirm: async () => {
        const res = await fetch(`/api/orders-proxy/${order.id}/cancel`, {
          method: 'PATCH',
        })
        if (res.ok) {
          useAlertStore.getState().showAlert('success',
            t('orderCancelled'),
          )
          fetchOrders()
          usePendingOrders.getState().fetch()
        } else {
          const data = await res.json()
          useAlertStore.getState().showAlert('error',
            locale === 'th' ? 'เกิดข้อผิดพลาด' : 'Error',
            data.message || 'Failed to cancel order',
          )
        }
      },
    })
  }

  const handlePaymentSuccess = () => {
    setPayingOrder(null)
    useAlertStore.getState().showAlert('success',
      locale === 'th' ? 'แจ้งชำระเงินเรียบร้อย' : 'Payment submitted',
    )
    fetchOrders()
    usePendingOrders.getState().fetch()
  }

  if (status === 'loading' || loading) {
    return <FullscreenLoading />
  }

  return (
    <>
      <main className="min-h-screen bg-neutral-50 pt-[76px]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
          <h1 className="text-2xl font-bold text-neutral-900 mb-8">{t('title')}</h1>

          {orders.length === 0 ? (
            <div className="text-center py-16 bg-white border border-neutral-200">
              <i className="fa-solid fa-box-open text-5xl text-neutral-200 mb-4" />
              <p className="text-neutral-500 text-sm mb-1">{t('empty')}</p>
              <p className="text-neutral-400 text-xs mb-6">{t('emptyDesc')}</p>
              <Link
                href="/"
                className="inline-block bg-neutral-900 text-white px-6 py-2.5 text-sm font-medium hover:bg-black transition-colors"
              >
                {t('shopNow')}
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order, i) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white border border-neutral-200 hover:border-neutral-400 transition-colors"
                >
                  <Link
                    href={{ pathname: '/orders/[id]', params: { id: order.id } }}
                    className="block p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-semibold text-neutral-900">
                            {order.order_number}
                          </span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[order.status]}`}>
                            {t(`status.${order.status}`)}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 mb-2">
                          {new Date(order.created_at).toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        <p className="text-sm text-neutral-600">
                          {order.items.length} {t('items')} &middot;{' '}
                          <span className="font-semibold text-neutral-900">
                            ฿{order.total.toLocaleString()}
                          </span>
                        </p>
                      </div>
                      <i className="fa-solid fa-chevron-right text-xs text-neutral-300 mt-1" />
                    </div>
                  </Link>

                  {/* Action buttons */}
                  {order.status === 'pending_payment' && (
                    <div className="px-5 pb-4 flex gap-2">
                      <button
                        onClick={(e) => { e.preventDefault(); setPayingOrder(order) }}
                        className="flex-1 bg-neutral-900 text-white py-2.5 text-sm font-medium hover:bg-black transition-colors"
                      >
                        <i className="fa-solid fa-credit-card mr-2 text-xs" />
                        {t('notifyPayment')}
                      </button>
                      <button
                        onClick={(e) => { e.preventDefault(); handleCancel(order) }}
                        className="px-4 py-2.5 border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
                      >
                        {t('cancelOrder')}
                      </button>
                    </div>
                  )}

                  {(order.status === 'confirm_payment' || order.status === 'shipped') && (
                    <div className="px-5 pb-4">
                      <Link
                        href={{ pathname: '/orders/[id]', params: { id: order.id } }}
                        className="block w-full text-center bg-neutral-100 text-neutral-700 py-2.5 text-sm font-medium hover:bg-neutral-200 transition-colors"
                      >
                        <i className="fa-solid fa-truck mr-2 text-xs" />
                        {t('trackDelivery')}
                      </Link>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Payment Modal */}
      {payingOrder && (
        <PaymentModal
          order={payingOrder}
          onClose={() => setPayingOrder(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  )
}
