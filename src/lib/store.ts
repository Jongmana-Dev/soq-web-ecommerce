'use client'

import { useState, useEffect } from 'react'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type CartItem = {
  id: string           // composite key: `${product_id}::${size_id}`
  product_id: string   // UUID of product
  size_id: string      // UUID of product_size
  size_label: string   // e.g. "330ml" (snapshot for display)
  name: string
  price: number
  qty: number
  image?: string
}

type Store = {
  items: CartItem[]
  updatedAt: number
  // actions
  add: (item: CartItem) => void
  updateQty: (id: string, qty: number) => void
  remove: (id: string) => void
  clear: () => void
  refreshTimestamp: () => void
}

export const useCart = create<Store>()(
  persist(
    (set) => ({
      items: [],
      updatedAt: Date.now(),

      add: (item) =>
        set((s) => {
          const idx = s.items.findIndex((i) => i.id === item.id)
          if (idx >= 0) {
            const next = [...s.items]
            next[idx] = { ...next[idx], qty: next[idx].qty + Math.max(1, item.qty) }
            return { items: next, updatedAt: Date.now() }
          }
          return { items: [...s.items, { ...item, qty: Math.max(1, item.qty) }], updatedAt: Date.now() }
        }),

      updateQty: (id, qty) =>
        set((s) => ({
          items: s.items
            .map((i) => (i.id === id ? { ...i, qty: Math.max(0, Math.floor(qty)) } : i))
            .filter((i) => i.qty > 0),
          updatedAt: Date.now(),
        })),

      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id), updatedAt: Date.now() })),

      clear: () => set({ items: [], updatedAt: Date.now() }),

      refreshTimestamp: () => set({ updatedAt: Date.now() }),
    }),
    {
      name: 'soq_cart',
      version: 3,
      storage: createJSONStorage(() =>
        typeof window !== 'undefined'
          ? localStorage
          : ({
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            } as unknown as Storage),
      ),
      partialize: (s) => ({ items: s.items, updatedAt: s.updatedAt }),
      migrate: (persisted: any, version: number) => {
        if (version < 2) {
          return { items: [], updatedAt: Date.now() }
        }
        if (version < 3) {
          return { ...persisted, updatedAt: persisted.updatedAt ?? Date.now() }
        }
        return persisted as { items: CartItem[]; updatedAt: number }
      },
    }
  )
)

/**
 * Hook รอ hydration จาก localStorage เสร็จก่อน render
 * ใช้ zustand persist API ตรง — ไม่พึ่ง onRehydrateStorage
 */
export function useCartHydrated() {
  const [hydrated, setHydrated] = useState(useCart.persist.hasHydrated())

  useEffect(() => {
    const unsub = useCart.persist.onFinishHydration(() => setHydrated(true))
    return unsub
  }, [])

  return hydrated
}
