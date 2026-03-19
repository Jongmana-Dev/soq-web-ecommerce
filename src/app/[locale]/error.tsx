'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Page error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#ECEDEA] px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
          <i className="fa-solid fa-triangle-exclamation text-2xl text-red-500" />
        </div>
        <h2 className="font-poppins text-2xl font-light text-neutral-800 mb-3">
          เกิดข้อผิดพลาด
        </h2>
        <p className="text-neutral-500 font-light mb-8">
          ขออภัย เกิดข้อผิดพลาดบางอย่าง กรุณาลองใหม่อีกครั้ง
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex h-12 items-center justify-center bg-neutral-900 px-8 font-prompt text-sm font-normal text-white hover:bg-neutral-800 transition-all"
          >
            ลองใหม่
          </button>
          <a
            href="/th"
            className="inline-flex h-12 items-center justify-center border border-neutral-300 px-8 font-prompt text-sm font-normal text-neutral-700 hover:bg-white transition-all"
          >
            กลับหน้าหลัก
          </a>
        </div>
      </div>
    </div>
  )
}
