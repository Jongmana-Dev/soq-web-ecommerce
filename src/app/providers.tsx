'use client'

import type { ReactNode } from 'react'
import { ThemeProvider } from 'next-themes'
import { CartProvider } from '@/providers/CartProvider'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <CartProvider>{children}</CartProvider>
    </ThemeProvider>
  )
}
