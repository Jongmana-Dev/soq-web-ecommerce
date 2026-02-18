'use client'

import { create } from 'zustand'

export type AlertType = 'success' | 'error' | 'warning' | 'info'

export type AlertItem = {
  id: string
  type: AlertType
  title: string
  message?: string
}

type ConfirmOptions = {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void | Promise<void>
}

type AlertStore = {
  alerts: AlertItem[]
  confirm: ConfirmOptions | null
  showAlert: (type: AlertType, title: string, message?: string) => void
  hideAlert: (id: string) => void
  showConfirm: (options: ConfirmOptions) => void
  hideConfirm: () => void
}

let alertCounter = 0

export const useAlertStore = create<AlertStore>((set) => ({
  alerts: [],
  confirm: null,
  showAlert: (type, title, message) => {
    const id = `alert-${++alertCounter}`
    set((s) => ({ alerts: [...s.alerts, { id, type, title, message }] }))
    setTimeout(() => {
      set((s) => ({ alerts: s.alerts.filter((a) => a.id !== id) }))
    }, 4000)
  },
  hideAlert: (id) =>
    set((s) => ({ alerts: s.alerts.filter((a) => a.id !== id) })),
  showConfirm: (options) => set({ confirm: options }),
  hideConfirm: () => set({ confirm: null }),
}))
