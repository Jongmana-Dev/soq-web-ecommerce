'use client'

import { create } from 'zustand'

export type CartToastItem = {
  id: string
  name: string
  price: number
  qty: number
  image?: string
  size_label?: string
}

type CartToastStore = {
  item: CartToastItem | null
  visible: boolean
  show: (item: CartToastItem) => void
  hide: () => void
}

export const useCartToast = create<CartToastStore>((set) => ({
  item: null,
  visible: false,
  show: (item) => {
    set({ item, visible: true })
    // auto-hide after 3s
    setTimeout(() => set({ visible: false }), 3000)
  },
  hide: () => set({ visible: false }),
}))
