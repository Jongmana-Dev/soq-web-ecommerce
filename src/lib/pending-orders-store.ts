'use client'

import { create } from 'zustand'

type PendingOrdersStore = {
  count: number
  fetch: () => Promise<void>
  clear: () => void
}

export const usePendingOrders = create<PendingOrdersStore>()((set) => ({
  count: 0,

  fetch: async () => {
    try {
      const res = await fetch('/api/orders-proxy?status=pending_payment&limit=10')
      if (!res.ok) return
      const json = await res.json()
      const orders = json.data ?? []
      set({ count: Array.isArray(orders) ? orders.length : 0 })
    } catch {
      // silent
    }
  },

  clear: () => set({ count: 0 }),
}))
