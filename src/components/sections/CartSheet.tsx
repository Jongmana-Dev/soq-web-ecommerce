'use client'

import { useCart } from '@/lib/cart'
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Trash2 } from 'lucide-react'
import Image from 'next/image'

type CartItem = {
  id: string
  name: string
  price: number
  qty: number
  image?: string
}

export default function CartSheet() {
  // ไม่บังคับ type ของ hook เดิม — แค่แปลง items ฝั่งนี้ให้ชัด
  const { items, updateQty, remove, clear } = useCart()
  const cartItems = (items ?? []) as CartItem[]

  // ✅ บอก TS ว่า accumulator เป็น number และ item เป็น CartItem
  const total = cartItems.reduce<number>((sum, item) => sum + item.price * item.qty, 0)

  return (
    <Sheet>
      <SheetTrigger aria-label="cart" className="relative p-1">
        <ShoppingCart className="size-5" />
        {cartItems.length > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
            {cartItems.length}
          </span>
        )}
      </SheetTrigger>

      <SheetContent>
        <SheetHeader>
          <SheetTitle>ตะกร้าสินค้า</SheetTitle>
        </SheetHeader>

        <div className="mt-4 grid gap-3">
          {cartItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">ยังไม่มีสินค้า</p>
          ) : (
            cartItems.map((it) => (
              <div key={it.id} className="flex items-center justify-between gap-3 border-b border-border pb-3">
                <div className="flex items-center gap-3">
                  {it.image && (
                    <Image
                      src={it.image}
                      alt={it.name}
                      width={56}
                      height={56}
                      className="h-14 w-14 rounded border border-border object-cover"
                    />
                  )}
                  <div>
                    <div className="text-sm font-medium">{it.name}</div>
                    <div className="text-xs text-muted-foreground">฿{it.price.toLocaleString()}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon-sm" onClick={() => updateQty?.(it.id, Math.max(1, it.qty - 1))}>
                    −
                  </Button>
                  <span className="w-6 text-center text-sm">{it.qty}</span>
                  <Button variant="outline" size="icon-sm" onClick={() => updateQty?.(it.id, it.qty + 1)}>
                    +
                  </Button>
                  <Button variant="ghost" size="icon-sm" aria-label="remove" onClick={() => remove?.(it.id)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">รวมทั้งหมด</div>
          <div className="text-lg font-semibold">฿{total.toLocaleString()}</div>
        </div>

        <SheetFooter className="mt-4 flex justify-between">
          <Button variant="outline" onClick={() => clear?.()}>
            ล้างตะกร้า
          </Button>
          <SheetClose asChild>
            <Button>ชำระเงิน</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}