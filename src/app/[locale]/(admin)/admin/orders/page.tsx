'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import DataTable, { type Column } from '@/components/admin/DataTable'
import StatusBadge from '@/components/admin/StatusBadge'
import { adminFetch } from '@/lib/admin-api'
import type { Order } from '@/types/admin'

function formatThaiDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const columns: Column<Order>[] = [
  { key: 'order_number', label: 'เลขคำสั่งซื้อ' },
  { key: 'customer_name', label: 'ชื่อลูกค้า' },
  {
    key: 'status',
    label: 'สถานะ',
    render: (order) => <StatusBadge status={order.status} />,
  },
  {
    key: 'total',
    label: 'ยอดรวม',
    className: 'text-right',
    render: (order) => (
      <span className="font-medium">{`฿${order.total.toLocaleString()}`}</span>
    ),
  },
  {
    key: 'created_at',
    label: 'วันที่สั่งซื้อ',
    render: (order) => (
      <span className="text-[#86868B]">{formatThaiDate(order.created_at)}</span>
    ),
  },
]

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminFetch<Order[]>('orders')
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <AdminPageHeader title="คำสั่งซื้อ" description="จัดการคำสั่งซื้อทั้งหมด" />

      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        searchable
        searchPlaceholder="ค้นหาเลขคำสั่งซื้อ หรือชื่อลูกค้า..."
        searchKeys={['order_number', 'customer_name']}
        onRowClick={(order) => router.push(`/th/admin/orders/${order.id}`)}
      />
    </>
  )
}
