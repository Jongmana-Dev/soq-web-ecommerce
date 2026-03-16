'use client'

import { useAlertStore } from '@/lib/alert-store'

type Props = {
  onConfirm: () => Promise<void> | void
  itemName?: string
}

export function useDeleteConfirm() {
  const showConfirm = useAlertStore((s) => s.showConfirm)

  return ({ onConfirm, itemName }: Props) => {
    showConfirm({
      title: 'ยืนยันการลบ',
      message: itemName
        ? `คุณต้องการลบ "${itemName}" ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้`
        : 'คุณต้องการลบรายการนี้ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้',
      confirmText: 'ลบ',
      cancelText: 'ยกเลิก',
      variant: 'danger',
      onConfirm,
    })
  }
}
