'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import StatusBadge from '@/components/admin/StatusBadge'
import { adminFetch } from '@/lib/admin-api'
import { useAlertStore } from '@/lib/alert-store'
import type { Order, OrderStatus } from '@/types/admin'

const ORDER_STATUSES: { value: OrderStatus; label: string }[] = [
  { value: 'pending_payment', label: 'รอชำระเงิน' },
  { value: 'confirm_payment', label: 'ยืนยันชำระเงิน' },
  { value: 'shipped', label: 'จัดส่งแล้ว' },
  { value: 'delivered', label: 'สำเร็จ' },
  { value: 'cancel_order', label: 'ยกเลิก' },
  { value: 'expire', label: 'หมดอายุ' },
]

function formatThaiDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const showAlert = useAlertStore((s) => s.showAlert)

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    adminFetch<Order>(`orders/${id}`)
      .then((data) => {
        setOrder(data)
        setSelectedStatus(data.status)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const handleStatusUpdate = async () => {
    if (!selectedStatus) return
    setSaving(true)
    try {
      const body: { status: OrderStatus } = {
        status: selectedStatus,
      }
      const updated = await adminFetch<Order>(`orders/${id}/status`, {
        method: 'PATCH',
        body,
      })
      setOrder(updated)
      showAlert('success', 'อัปเดตสถานะสำเร็จ')
    } catch (err) {
      showAlert('error', 'ไม่สามารถอัปเดตสถานะได้')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <AdminPageHeader title="รายละเอียดคำสั่งซื้อ" />
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </>
    )
  }

  if (!order) {
    return (
      <>
        <AdminPageHeader title="ไม่พบคำสั่งซื้อ" />
        <p className="text-[#86868B]">ไม่พบข้อมูลคำสั่งซื้อที่ต้องการ</p>
        <Link href="/th/admin/orders">
          <Button variant="outline" className="mt-4">
            กลับไปหน้าคำสั่งซื้อ
          </Button>
        </Link>
      </>
    )
  }

  const slipImage = order.payments?.[0]?.slip_image ?? null

  return (
    <>
      <AdminPageHeader
        title={`คำสั่งซื้อ ${order.order_number}`}
        description={`สร้างเมื่อ ${formatThaiDate(order.created_at)}`}
        action={
          <Link href="/th/admin/orders">
            <Button variant="outline">กลับ</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: order info + items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer info */}
          <Card className="bg-white border-[#E8E8ED]">
            <CardHeader>
              <CardTitle className="text-[#1D1D1F]">ข้อมูลลูกค้า</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <dt className="text-[#86868B]">ชื่อ</dt>
                  <dd className="text-[#1D1D1F] mt-0.5">{order.customer_name}</dd>
                </div>
                {order.customer_phone && (
                  <div>
                    <dt className="text-[#86868B]">เบอร์โทร</dt>
                    <dd className="text-[#1D1D1F] mt-0.5">{order.customer_phone}</dd>
                  </div>
                )}
                <div className="sm:col-span-2">
                  <dt className="text-[#86868B]">ที่อยู่จัดส่ง</dt>
                  <dd className="text-[#1D1D1F] mt-0.5 whitespace-pre-line">
                    {order.shipping_address}
                  </dd>
                </div>
                {order.shipping_province && (
                  <div>
                    <dt className="text-[#86868B]">จังหวัด</dt>
                    <dd className="text-[#1D1D1F] mt-0.5">{order.shipping_province}</dd>
                  </div>
                )}
                {order.shipping_postal_code && (
                  <div>
                    <dt className="text-[#86868B]">รหัสไปรษณีย์</dt>
                    <dd className="text-[#1D1D1F] mt-0.5">{order.shipping_postal_code}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          {/* Order items */}
          <Card className="bg-white border-[#E8E8ED]">
            <CardHeader>
              <CardTitle className="text-[#1D1D1F]">รายการสินค้า</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border border-[#E8E8ED] rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#E8E8ED] hover:bg-transparent">
                      <TableHead className="text-[#86868B]">สินค้า</TableHead>
                      <TableHead className="text-[#86868B]">ขนาด</TableHead>
                      <TableHead className="text-[#86868B] text-right">ราคา</TableHead>
                      <TableHead className="text-[#86868B] text-right">จำนวน</TableHead>
                      <TableHead className="text-[#86868B] text-right">รวม</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.map((item) => (
                      <TableRow key={item.id} className="border-[#E8E8ED]">
                        <TableCell className="text-[#1D1D1F]">{item.product_name}</TableCell>
                        <TableCell className="text-[#1D1D1F]/80">{item.size_label}</TableCell>
                        <TableCell className="text-[#1D1D1F]/80 text-right">
                          {`฿${item.unit_price.toLocaleString()}`}
                        </TableCell>
                        <TableCell className="text-[#1D1D1F]/80 text-right">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-[#1D1D1F] text-right font-medium">
                          {`฿${item.subtotal.toLocaleString()}`}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Totals */}
              <div className="mt-4 flex flex-col items-end gap-1 text-sm">
                <div className="flex justify-between w-56">
                  <span className="text-[#86868B]">ยอดสินค้า</span>
                  <span className="text-[#1D1D1F]">{`฿${order.subtotal.toLocaleString()}`}</span>
                </div>
                <div className="flex justify-between w-56">
                  <span className="text-[#86868B]">ค่าจัดส่ง</span>
                  <span className="text-[#1D1D1F]">{`฿${order.shipping_fee.toLocaleString()}`}</span>
                </div>
                {order.remote_area_fee > 0 && (
                  <div className="flex justify-between w-56">
                    <span className="text-[#86868B]">ค่าพื้นที่ห่างไกล</span>
                    <span className="text-[#1D1D1F]">{`฿${order.remote_area_fee.toLocaleString()}`}</span>
                  </div>
                )}
                {order.discount > 0 && (
                  <div className="flex justify-between w-56">
                    <span className="text-[#86868B]">ส่วนลด</span>
                    <span className="text-[#34C759]">{`-฿${order.discount.toLocaleString()}`}</span>
                  </div>
                )}
                <div className="flex justify-between w-56 pt-2 border-t border-[#D2D2D7]">
                  <span className="text-[#1D1D1F] font-medium">ยอดรวมทั้งหมด</span>
                  <span className="text-[#1D1D1F] font-semibold">
                    {`฿${order.total.toLocaleString()}`}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: status + payment */}
        <div className="space-y-6">
          {/* Current status */}
          <Card className="bg-white border-[#E8E8ED]">
            <CardHeader>
              <CardTitle className="text-[#1D1D1F]">สถานะปัจจุบัน</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusBadge status={order.status} />
              <div className="mt-2 text-sm text-[#86868B]">
                อัปเดตล่าสุด: {formatThaiDate(order.updated_at)}
              </div>
            </CardContent>
          </Card>

          {/* Status update */}
          <Card className="bg-white border-[#E8E8ED]">
            <CardHeader>
              <CardTitle className="text-[#1D1D1F]">อัปเดตสถานะ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[#86868B] mb-1.5">สถานะใหม่</label>
                  <Select
                    value={selectedStatus}
                    onValueChange={(v) => setSelectedStatus(v as OrderStatus)}
                  >
                    <SelectTrigger className="w-full bg-white border-[#D2D2D7]">
                      <SelectValue placeholder="เลือกสถานะ" />
                    </SelectTrigger>
                    <SelectContent>
                      {ORDER_STATUSES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleStatusUpdate}
                  disabled={saving || !selectedStatus}
                  className="w-full"
                >
                  {saving ? 'กำลังบันทึก...' : 'บันทึกสถานะ'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payment slip */}
          {slipImage && (
            <Card className="bg-white border-[#E8E8ED]">
              <CardHeader>
                <CardTitle className="text-[#1D1D1F]">หลักฐานการชำระเงิน</CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={slipImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#007AFF] hover:text-[#007AFF]/80 underline text-sm break-all"
                >
                  ดูสลิปการชำระเงิน
                </a>
              </CardContent>
            </Card>
          )}

          {/* Dates */}
          <Card className="bg-white border-[#E8E8ED]">
            <CardHeader>
              <CardTitle className="text-[#1D1D1F]">ข้อมูลเวลา</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-[#86868B]">วันที่สั่งซื้อ</dt>
                  <dd className="text-[#1D1D1F] mt-0.5">
                    {formatThaiDate(order.created_at)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#86868B]">อัปเดตล่าสุด</dt>
                  <dd className="text-[#1D1D1F] mt-0.5">
                    {formatThaiDate(order.updated_at)}
                  </dd>
                </div>
                {order.expired_at && (
                  <div>
                    <dt className="text-[#86868B]">หมดอายุ</dt>
                    <dd className="text-[#1D1D1F] mt-0.5">
                      {formatThaiDate(order.expired_at)}
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
