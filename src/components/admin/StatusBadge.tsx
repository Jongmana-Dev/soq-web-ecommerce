'use client'

import { Badge } from '@/components/ui/badge'
import type { OrderStatus } from '@/types/admin'

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending_payment: { label: 'รอชำระเงิน', className: 'bg-[#FF9500]/10 text-[#FF9500] border-[#FF9500]/20' },
  confirm_payment: { label: 'ยืนยันชำระเงิน', className: 'bg-[#007AFF]/10 text-[#007AFF] border-[#007AFF]/20' },
  shipped: { label: 'จัดส่งแล้ว', className: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
  delivered: { label: 'สำเร็จ', className: 'bg-[#34C759]/10 text-[#34C759] border-[#34C759]/20' },
  cancel_order: { label: 'ยกเลิก', className: 'bg-[#FF3B30]/10 text-[#FF3B30] border-[#FF3B30]/20' },
  expire: { label: 'หมดอายุ', className: 'bg-[#86868B]/10 text-[#86868B] border-[#86868B]/20' },
}

export default function StatusBadge({ status }: { status: OrderStatus }) {
  const config = statusConfig[status] ?? { label: status, className: 'bg-[#86868B]/10 text-[#86868B]' }
  return (
    <Badge variant="outline" className={`font-normal rounded-full ${config.className}`}>
      {config.label}
    </Badge>
  )
}
