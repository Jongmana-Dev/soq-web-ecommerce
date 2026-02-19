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
      const res = await fetch('/api/orders-proxy')
      if (!res.ok) return
      const json = await res.json()
      const orders = json.data ?? []
      const pending = orders.filter(
        (o: { status: string }) => o.status === 'pending_payment',
      ).length
      set({ count: pending })
    } catch {
      // silent
    }
  },

  clear: () => set({ count: 0 }),
}))
