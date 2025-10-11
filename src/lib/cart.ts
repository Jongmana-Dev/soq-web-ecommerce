'use client'

import { useSyncExternalStore } from 'react'

export type CartItem = {
  id: string
  name: string
  price: number
  qty: number
  image?: string
}

type CartState = { items: CartItem[] }

const STORAGE_KEY = 'soq_cart_v1'

// ---------------- Internal store ----------------
let state: CartState = { items: [] }
const listeners = new Set<() => void>()

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}
function asString(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : v != null ? String(v) : fallback
}
function asNumber(v: unknown, fallback = 0): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

function toCartItem(x: unknown): CartItem | null {
  if (!isRecord(x)) return null
  const id = asString(x.id)
  const name = asString(x.name)
  const price = Math.max(0, asNumber(x.price))
  const qty = Math.max(0, Math.floor(asNumber(x.qty)))
  const image = x.image != null ? asString(x.image) : undefined
  if (!id || !name || qty <= 0) return null
  return { id, name, price, qty, image }
}

function sanitizeItems(items: unknown[]): CartItem[] {
  return items.map(toCartItem).filter((i): i is CartItem => i !== null)
}

function setState(next: CartState | ((s: CartState) => CartState)) {
  state = typeof next === 'function' ? (next as (s: CartState) => CartState)(state) : next
  saveToStorage()
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot(): CartState {
  return state
}
function getServerSnapshot(): CartState {
  return { items: [] }
}

function loadFromStorage() {
  if (typeof window === 'undefined') return
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const parsed: unknown = JSON.parse(raw)
    if (isRecord(parsed) && Array.isArray(parsed.items)) {
      state = { items: sanitizeItems(parsed.items) }
    }
  } catch {
    // ignore
  }
}
function saveToStorage() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore
  }
}

// โหลด state จาก localStorage เมื่อรันบน client
if (typeof window !== 'undefined') {
  loadFromStorage()
}

// ---------------- Public API ----------------
function add(item: CartItem, qty = 1) {
  if (!item?.id) return
  const delta = Math.max(1, Math.floor(qty))
  setState((s) => {
    const items = [...s.items]
    const idx = items.findIndex((x) => x.id === item.id)
    if (idx >= 0) {
      items[idx] = { ...items[idx], qty: items[idx].qty + delta }
    } else {
      items.push({ ...item, qty: delta })
    }
    return { items }
  })
}

function updateQty(id: string, qty: number) {
  const q = Math.floor(qty)
  setState((s) => {
    const items = s.items
      .map((x) => (x.id === id ? { ...x, qty: q } : x))
      .filter((x) => x.qty > 0)
    return { items }
  })
}

function remove(id: string) {
  setState((s) => ({ items: s.items.filter((x) => x.id !== id) }))
}

function clear() {
  setState({ items: [] })
}

export function useCart() {
  const { items } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const count = items.reduce((sum, it) => sum + it.qty, 0)
  const total = items.reduce((sum, it) => sum + it.price * it.qty, 0)
  return { items, add, updateQty, remove, clear, count, total }
}