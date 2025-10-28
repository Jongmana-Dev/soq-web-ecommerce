// src/providers/CartProvider.tsx
'use client'

import {createContext, useContext, useMemo, useState} from 'react'

export type CartItem = {
  key: string // productId + ':' + sizeId
  productId: string
  name: string
  sizeId: string
  sizeLabel: string
  price: number
  qty: number
  image?: string
}

type CartCtx = {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'key'>) => void
  removeItem: (key: string) => void
  clear: () => void
  count: number
  subtotal: number
  open: boolean
  setOpen: (v: boolean) => void
}

const CartContext = createContext<CartCtx | null>(null)

export function CartProvider({children}:{children:React.ReactNode}) {
  const [items, setItems] = useState<CartItem[]>([])
  const [open, setOpen] = useState(false)

  const addItem: CartCtx['addItem'] = (item) => {
    const key = `${item.productId}:${item.sizeId}`
    setItems(prev => {
      const i = prev.findIndex(p => p.key === key)
      if (i >= 0) {
        const next = [...prev]
        next[i] = {...next[i], qty: next[i].qty + item.qty}
        return next
      }
      return [...prev, {...item, key}]
    })
    setOpen(true)
  }
  const removeItem = (key: string) => setItems(prev => prev.filter(p => p.key !== key))
  const clear = () => setItems([])

  const {count, subtotal} = useMemo(() => ({
    count: items.reduce((a,b)=>a+b.qty,0),
    subtotal: items.reduce((a,b)=>a+b.qty*b.price,0)
  }), [items])

  return (
    <CartContext.Provider value={{items, addItem, removeItem, clear, count, subtotal, open, setOpen}}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
