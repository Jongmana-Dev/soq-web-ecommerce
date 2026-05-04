'use client'

import { useEffect } from 'react'
import { Link } from '@/i18n/navigation'

export default function OrderDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[OrderDetail Error]', error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
      <div className="w-16 h-16 mb-4 flex items-center justify-center bg-red-50 text-red-500 rounded-full text-2xl">
        ⚠
      </div>
      <h2 className="text-xl font-semibold text-neutral-900 mb-2">
        ไม่สามารถโหลดรายละเอียดคำสั่งซื้อได้
      </h2>
      <p className="text-sm text-neutral-600 mb-2">
        เกิดข้อผิดพลาดในการแสดงข้อมูล — กรุณาลองใหม่ หรือกลับไปดูรายการคำสั่งซื้อทั้งหมด
      </p>
      <p className="text-xs text-neutral-400 mb-6 break-all">
        {error.message || 'Unknown error'}
        {error.digest && <span className="ml-2">(ref: {error.digest})</span>}
      </p>
      <div className="flex gap-3 flex-wrap justify-center">
        <button
          onClick={reset}
          className="px-6 py-2.5 bg-neutral-900 text-white text-sm font-medium hover:bg-black transition-colors"
        >
          ลองใหม่
        </button>
        <Link
          href="/orders"
          className="px-6 py-2.5 border border-neutral-300 text-neutral-900 text-sm font-medium hover:bg-neutral-50 transition-colors"
        >
          ดูคำสั่งซื้อทั้งหมด
        </Link>
        <Link
          href="/"
          className="px-6 py-2.5 border border-neutral-300 text-neutral-900 text-sm font-medium hover:bg-neutral-50 transition-colors"
        >
          กลับหน้าแรก
        </Link>
      </div>
    </div>
  )
}
