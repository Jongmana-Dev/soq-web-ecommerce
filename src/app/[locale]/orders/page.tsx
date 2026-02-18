'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { Link } from '@/i18n/navigation'
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

export default function OrdersPage() {
  const t = useTranslations('orders')
  const { status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/')
      return
    }
    if (status !== 'authenticated') return

    fetch('/api/orders-proxy')
      .then((res) => res.json())
      .then((res) => setOrders(res.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [status, router])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-[76px]">
        <i className="fa-solid fa-spinner fa-spin text-neutral-400 text-2xl" />
      </div>
    )
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
                >
                  <Link
                    href={{ pathname: '/orders/[id]', params: { id: order.id } }}
                    className="block bg-white border border-neutral-200 p-5 hover:border-neutral-400 transition-colors group"
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
                      <i className="fa-solid fa-chevron-right text-xs text-neutral-300 group-hover:text-neutral-500 transition-colors mt-1" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
