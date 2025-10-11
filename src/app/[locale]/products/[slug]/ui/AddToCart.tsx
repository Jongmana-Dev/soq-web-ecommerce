'use client'
import { useCart } from '@/store/cart'
import { useTranslations } from 'next-intl'

export default function AddToCart({ price }: { price: number }) {
  const t = useTranslations()
  const add = useCart(s => s.add)
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="rounded-full bg-muted px-4 py-2 text-sm">฿{price.toLocaleString()}</div>
      <button className="flex-1 rounded-full border px-6 py-2 transition hover:bg-foreground hover:text-background"
        onClick={() => add({ id: Math.random().toString(36).slice(2), qty: 1 })}>
        {t('product.addToCart')}
      </button>
      <button className="flex-1 rounded-full bg-foreground px-6 py-2 text-background">{t('product.buyNow')}</button>
    </div>
  )
}
