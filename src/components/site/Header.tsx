'use client'

import { useEffect, useState } from 'react'
import { Link } from '@/i18n/navigation'
import { useLocale, useTranslations } from 'next-intl'
// import LocaleSwitcher from '@/components/site/LocaleSwitcher'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { ShoppingCart, Languages, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/providers/CartProvider'
import CartSheet from '@/components/site/cart/CartSheet'
import clsx from 'clsx'

const NAV = [
  { id: 'products', key: 'products' },
  { id: 'reviews', key: 'reviews' },
  { id: 'standards', key: 'standards' },
  { id: 'faq', key: 'faq' },
  { id: 'contact', key: 'contact' },
]

export default function Header() {
  const [active, setActive] = useState<string>('products')
  const [sheetOpen, setSheetOpen] = useState(false)
  const locale = useLocale()
  const tNav = useTranslations('nav')
  const { count } = useCart()

  const [isSticky, setSticky] = useState(false)

  useEffect(() => {
    const onScroll = () => setSticky(window.scrollY > 80)
    window.addEventListener('scroll', onScroll)
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
          ? "top-3 mx-auto py-1.5 w-[calc(100%-4rem)] rounded-full shadow-xl bg-neutral-900/90 backdrop-blur-lg border border-neutral-700 scale-95"
          : "top-0 bg-neutral-950 py-3 shadow-none border-b border-neutral-800 scale-100 rounded-none"
      )}
    >
      <div
        className={clsx(
          "container mx-auto flex items-center justify-between px-6 transition-height duration-500 ease-in-out",
          isSticky ? "h-[56px]" : "h-[76px]"
        )}
      >
        <Link href="/" locale={locale} className="font-bold text-xl text-neutral-200">
          SOQ
        </Link>

        <nav className="hidden md:flex gap-8">
          {NAV.map(item => (
            <a
              key={item.id}
              href={`#${item.id}`}
              data-active={active === item.id}
              className="text-sm font-medium opacity-80 hover:text-[--color-gold] data-[active=true]:text-[--color-gold] transition duration-300 text-neutral-300"
            >
              {tNav(item.key)}
            </a>
          ))}
        </nav>

        <div className="flex gap-3 items-center">
          {/* <ThemeToggle className="text-neutral-300 hover:text-[--color-gold] transition duration-300" /> */}

          <Button variant="ghost" size="icon" className="text-neutral-300 hover:text-[--color-gold] transition duration-300">
            <UserRound className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            aria-label="Cart"
            onClick={() => setSheetOpen(true)}
            className="relative text-neutral-300 hover:text-[--color-gold] transition duration-300"
          >
            <ShoppingCart className="w-5 h-5" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 rounded-full bg-[--color-gold] text-white w-4 h-4 text-xs flex justify-center items-center animate-pulse shadow-md">
                {count}
              </span>
            )}
          </Button>

          {/* <LocaleSwitcher
            icon={<Languages className="w-4 h-4" />}
            className="text-neutral-300 hover:text-[--color-gold] transition duration-300"
          /> */}
        </div>
      </div>

      {/* <CartSheet open={sheetOpen} onOpenChange={setSheetOpen} /> */}
    </header>
  )
}
