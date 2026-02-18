'use client'

import { useEffect, useState } from 'react'
import { Link } from '@/i18n/navigation'
import { useLocale, useTranslations } from 'next-intl'
// import LocaleSwitcher from '@/components/site/LocaleSwitcher'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { ShoppingCart, Languages, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/store'
import CartSheet from '@/components/site/cart/CartSheet'
import clsx from 'clsx'

const NAV = [
  { id: 'reviews', key: 'reviews' },
  { id: 'products', key: 'products' },
  { id: 'standards', key: 'standards' },
  { id: 'faq', key: 'faq' },
  { id: 'contact', key: 'contact' },
]

export default function Header() {
  const [active, setActive] = useState<string>('products')
  const [sheetOpen, setSheetOpen] = useState(false)
  const locale = useLocale()
  const tNav = useTranslations('nav')
  const count = useCart((state) => state.items.reduce((sum, it) => sum + it.qty, 0))
  const items = useCart((state) => state.items)
  const total = useCart((state) => state.items.reduce((sum, it) => sum + it.price * it.qty, 0))
  const remove = useCart((state) => state.remove)
  const clear = useCart((state) => state.clear)

  const [isSticky, setSticky] = useState(false)

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        setSticky(window.scrollY > 80)
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onSection = (e: Event) => {
      const detail = (e as CustomEvent<{ id?: string }>).detail
      setActive(detail?.id ?? 'products')
    }
    window.addEventListener('sectionchange', onSection as EventListener)
    return () => window.removeEventListener('sectionchange', onSection as EventListener)
  }, [])

  return (
    <header
      className={clsx(
        "sticky z-50 transition-all duration-500 ease-in-out",
        isSticky
          ? "top-0 py-2 shadow-sm bg-white/80 backdrop-blur-md border-b border-neutral-200"
          : "top-0 bg-transparent py-4 shadow-none border-b border-transparent"
      )}
    >
      <div
        className={clsx(
          "container mx-auto flex items-center justify-between px-6 transition-height duration-500 ease-in-out",
          isSticky ? "h-[56px]" : "h-[76px]"
        )}
      >
        <Link href="/" locale={locale} className="font-bold text-2xl tracking-tight text-neutral-900">
          SOQ.
        </Link>

        <nav className="hidden md:flex gap-8">
          {NAV.map(item => (
            <a
              key={item.id}
              href={`#${item.id}`}
              data-active={active === item.id}
              className="text-[15px] font-medium text-neutral-600 hover:text-black transition-colors duration-200"
            >
              {tNav(item.key)}
            </a>
          ))}
        </nav>

        <div className="flex gap-4 items-center">
          <Button variant="ghost" size="icon" className="text-neutral-600 hover:text-black hover:bg-black/5 transition-colors">
            <UserRound className="w-5 h-5" strokeWidth={1.5} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            aria-label="Cart"
            onClick={() => setSheetOpen(true)}
            className="relative text-neutral-600 hover:text-black hover:bg-black/5 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" strokeWidth={1.5} />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 rounded-full bg-red-500 text-white w-4 h-4 text-[10px] flex justify-center items-center shadow-sm">
                {count}
              </span>
            )}
          </Button>

          <Button variant="ghost" size="sm" className="hidden md:flex gap-1 text-neutral-600 hover:text-black hover:bg-transparent px-1 font-normal text-[15px]">
            ไทย -
          </Button>
        </div>
      </div>

      <CartSheet
        items={items.map(it => ({ ...it, quantity: it.qty }))}
        total={total}
        onRemove={(item) => remove(String(item.id ?? ''))}
        onClear={clear}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </header>
  )
}
