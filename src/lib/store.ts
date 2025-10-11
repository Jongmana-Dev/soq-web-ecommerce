'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type CartItem = {
  id: string
  name: string
  price: number
  qty: number
  image?: string
}

type Store = {
  items: CartItem[]
  // derived
  count: number
  total: number
  // actions
  add: (item: CartItem) => void
  updateQty: (id: string, qty: number) => void
  remove: (id: string) => void
  clear: () => void
}

// ป้องกัน SSR: คืน storage จำลองเมื่อยังไม่มี window (แต่ไฟล์นี้เป็น 'use client' อยู่แล้ว)
const safeStorage = () =>
  typeof window !== 'undefined'
    ? localStorage
    : ({
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {}
      } as unknown as Storage)

export const useCart = create<Store>()(
  persist(
    (set, get) => ({
      items: [],

      // derived
      get count() {
        return get().items.reduce((sum, it) => sum + it.qty, 0)
      },
      get total() {
        return get().items.reduce((sum, it) => sum + it.price * it.qty, 0)
      },

      // actions
      add: (item) =>
        set((s) => {
          const idx = s.items.findIndex((i) => i.id === item.id)
          if (idx >= 0) {
            const next = [...s.items]
            next[idx] = { ...next[idx], qty: next[idx].qty + Math.max(1, item.qty) }
            return { items: next }
          }
          return { items: [...s.items, { ...item, qty: Math.max(1, item.qty) }] }
        }),

      updateQty: (id, qty) =>
        set((s) => ({
          items: s.items
            .map((i) => (i.id === id ? { ...i, qty: Math.max(0, Math.floor(qty)) } : i))
            .filter((i) => i.qty > 0)
        })),

      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),

      clear: () => set({ items: [] })
    }),
    {
      name: 'soq_cart',                         // key ใน localStorage
      version: 1,
      storage: createJSONStorage(safeStorage),   // ปลอดภัยกับ SSR
      partialize: (s) => ({ items: s.items })    // persist เฉพาะ items
    }
  )
)