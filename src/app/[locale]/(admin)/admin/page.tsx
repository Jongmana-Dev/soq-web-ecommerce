'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { adminFetch } from '@/lib/admin-api'
import type { DashboardStats } from '@/types/admin'

const statCards: { key: keyof DashboardStats; label: string; icon: string; color: string; bgColor: string; format?: 'currency' }[] = [
  { key: 'orders_today', label: 'คำสั่งซื้อวันนี้', icon: 'fa-solid fa-cart-shopping', color: 'text-[#007AFF]', bgColor: 'bg-[#007AFF]/10' },
  { key: 'revenue_today', label: 'รายได้วันนี้', icon: 'fa-solid fa-coins', color: 'text-[#FF9500]', bgColor: 'bg-[#FF9500]/10', format: 'currency' },
  { key: 'pending_orders', label: 'รอดำเนินการ', icon: 'fa-solid fa-clock', color: 'text-[#FF9500]', bgColor: 'bg-[#FF9500]/10' },
  { key: 'low_stock_count', label: 'สินค้าใกล้หมด', icon: 'fa-solid fa-triangle-exclamation', color: 'text-[#FF3B30]', bgColor: 'bg-[#FF3B30]/10' },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminFetch<DashboardStats>('dashboard')
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <AdminPageHeader title="แดชบอร์ด" description="ภาพรวมระบบ" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => (
          <Card key={card.key}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[15px] text-[#86868B]">{card.label}</span>
                <div className={`w-11 h-11 rounded-xl ${card.bgColor} flex items-center justify-center`}>
                  <i className={`${card.icon} ${card.color} text-lg`} />
                </div>
              </div>
              {loading ? (
                <Skeleton className="h-9 w-24" />
              ) : (
                <p className="text-[34px] font-semibold tracking-tight text-[#1D1D1F]">
                  {card.format === 'currency'
                    ? `฿${(stats?.[card.key] ?? 0).toLocaleString()}`
                    : (stats?.[card.key] ?? 0).toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-6">
          <Card>
            <CardContent className="p-6">
              <span className="text-[15px] text-[#86868B]">คำสั่งซื้อทั้งหมด</span>
              <p className="text-[28px] font-semibold tracking-tight text-[#1D1D1F] mt-2">{stats.total_orders.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <span className="text-[15px] text-[#86868B]">รายได้ทั้งหมด</span>
              <p className="text-[28px] font-semibold tracking-tight text-[#1D1D1F] mt-2">฿{stats.total_revenue.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
