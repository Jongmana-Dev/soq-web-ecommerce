'use client'

import React from 'react'
import clsx from 'clsx'

type CartItemBase = {
  name: string
  quantity: number
  price?: number
}

type CartItemExtra = {
  id?: string | number
  sku?: string | number
  // เผื่อมี field อื่น ๆ ที่เราไม่ใช้ในที่นี้
} & Record<string, unknown>

export type CartItem = CartItemBase & CartItemExtra

export type CartSheetProps = {
  items: CartItem[]
  total?: number
  onRemove?: (item: CartItem) => void
  onClear?: () => void
  onCheckout?: () => void
  /** เปิด/ปิด แบบ controlled; ถ้าไม่ส่งมา จะถือว่า always open */
  open?: boolean
  /** callback เวลา state เปิด/ปิดเปลี่ยน */
  onOpenChange?: (next: boolean) => void
  /** class เพิ่มเติมให้ wrapper */
  className?: string
}

/**
 * CartSheet
 * - รองรับทั้ง controlled (`open`, `onOpenChange`) และ uncontrolled (ไม่ส่ง prop มาก็แสดงตลอด)
 * - ไม่ใช้ `any`, ใช้ optional id/sku เพื่อสร้าง key
 * - โครง UI เป็นแผงด้านขวาแบบ overlay เบา ๆ ให้เข้ากับธีม
 */
export default function CartSheet({
  items,
  total,
  onRemove,
  onClear,
  onCheckout,
  open,
  onOpenChange,
  className,
}: CartSheetProps) {
  // ถ้าไม่ส่ง open มา แสดงผลตลอด; ถ้าส่งมา ใช้ค่าที่ให้มา
  const isOpen = open ?? true

  const close = () => onOpenChange?.(false)
  const fmt = (n?: number) =>
    typeof n === 'number' ? n.toLocaleString('th-TH', { minimumFractionDigits: 2 }) : '-'

  return (
    <>
      {/* backdrop */}
      <div
        className={clsx(
          'fixed inset-0 z-40 transition',
          isOpen ? 'visible bg-black/40 backdrop-blur-[1px]' : 'invisible bg-transparent',
        )}
        aria-hidden
        onClick={close}
      />

      {/* panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="ตะกร้าสินค้า"
        className={clsx(
          'fixed right-0 top-0 z-50 h-dvh w-[min(420px,95vw)] bg-neutral-950 text-neutral-100 border-l border-neutral-800 shadow-2xl',
          'transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
          className,
        )}
      >
        <div className="p-6 h-full flex flex-col">
          <header className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">ตะกร้าสินค้า</h3>
            <div className="flex items-center gap-3">
              {items?.length ? (
                <button
                  type="button"
                  className="text-sm text-neutral-400 hover:text-neutral-200 underline underline-offset-4"
                  onClick={onClear}
                >
                  ล้างตะกร้า
                </button>
              ) : null}
              <button
                type="button"
                aria-label="ปิดตะกร้า"
                className="rounded-full p-2 border border-white/10 bg-black/20 hover:bg-black/30 transition"
                onClick={close}
              >
                ✕
              </button>
            </div>
          </header>

          <div className="grow overflow-auto divide-y divide-neutral-800">
            {items?.length ? (
              items.map((item, index) => {
                const keyCandidate =
                  (typeof item.id !== 'undefined' ? item.id : undefined) ??
                  (typeof item.sku !== 'undefined' ? item.sku : undefined) ??
                  item.name ??
                  index
                const key = String(keyCandidate)

                return (
                  <div key={key} className="flex justify-between py-3">
                    <div>
                      <p className="text-neutral-200 font-medium">{item.name}</p>
                      <p className="text-sm text-neutral-500">จำนวน: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      {typeof item.price === 'number' ? (
                        <p className="text-neutral-200">{fmt(item.price * item.quantity)} ฿</p>
                      ) : null}
                      {onRemove ? (
                        <button
                          type="button"
                          className="text-xs text-neutral-400 hover:text-red-300 underline underline-offset-4 mt-1"
                          onClick={() => onRemove(item)}
                        >
                          ลบ
                        </button>
                      ) : null}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="py-8 text-center text-neutral-400">ยังไม่มีสินค้าในตะกร้า</div>
            )}
          </div>

          <footer className="mt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-neutral-400">ยอดรวม</div>
              <div className="text-lg font-semibold">{fmt(total)} ฿</div>
            </div>

            <button
              type="button"
              className="mt-4 w-full btn btn-primary glow"
              onClick={onCheckout}
              disabled={!items?.length}
            >
              ดำเนินการชำระเงิน
            </button>
          </footer>
        </div>
      </aside>
    </>
  )
}
