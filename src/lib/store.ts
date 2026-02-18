'use client'

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
  _hydrated: boolean
  // derived
  count: number
  total: number
  // actions
  add: (item: CartItem) => void
  updateQty: (id: string, qty: number) => void
  remove: (id: string) => void
  clear: () => void
}

export const useCart = create<Store>()(
  persist(
    (set, get) => ({
      items: [],
      _hydrated: false,

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
      name: 'soq_cart',
      version: 2,
      storage: createJSONStorage(() =>
        typeof window !== 'undefined'
          ? localStorage
          : ({
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            } as unknown as Storage),
      ),
      partialize: (s) => ({ items: s.items }),
      migrate: (persisted: any, version: number) => {
        // เฉพาะ version เก่า (< 2) ที่ไม่มี size fields → ต้อง clear
        if (version < 2) {
          return { items: [] }
        }
        // version 2+ → เก็บ items เดิมไว้
        return persisted as { items: CartItem[] }
      },
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<Store>),
      }),
      onRehydrateStorage: () => {
        return (_state, error) => {
          if (!error) {
            useCart.setState({ _hydrated: true })
          }
        }
      },
    }
  )
)
