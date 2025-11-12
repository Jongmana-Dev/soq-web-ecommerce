'use client'

import Link from 'next/link'
import type { Route } from 'next'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserRound, ShoppingCart, Menu as MenuIcon, X, ChevronDown } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

// ใช้เมนูจากไฟล์เดิม
type MenuItem = { id: string; th: string; en: string }
const MENU: MenuItem[] = [
  { id: 'features', th: 'สินค้า', en: 'Products' },
  { id: 'reviews', th: 'รีวิว', en: 'Reviews' },
  { id: 'standards', th: 'มาตราฐานโรงงาน', en: 'Standards' },
  { id: 'faqs', th: 'คำถามที่พบบ่อย', en: 'FAQs' },
  { id: 'contact', th: 'ติดต่อ', en: 'Contact' },
] as const

export default function Navbar() {
  const locale = useLocale()
  const pathname = usePathname()

  const [active, setActive] = useState<string>('hero')
  const [open, setOpen] = useState(false)

  // Logic การติดตาม Active Section (ยังคงเดิม)
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setActive(document.body.dataset.activeSection ?? (y > 160 ? 'features' : 'hero'))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Logic การสลับภาษา (ยังคงเดิม)
  const homeHref = (`/${locale}`) as Route
  const switchTo = locale === 'th' ? 'en' : 'th'
  const swapHref = (pathname ? pathname.replace(`/${locale}`, `/${switchTo}`) : `/${switchTo}`) as Route
  const langTitle = locale === 'th' ? 'English' : 'ภาษาไทย'

  // ปุ่มไอคอนสไตล์ใหม่ (สำหรับ User, Cart, Theme)
  const iconButtonClasses = "h-6 w-6 text-black transition-colors hover:text-opacity-70"

  return (
    <>
      {/* Navbar ใหม่ตามสเปก */}
      <header 
        className="sticky top-0 z-50 flex h-[76px] w-full items-center justify-center bg-[#E2E2E2] shadow-[0px_4px_4px_#F6F7F8]"
        aria-label="Main Navigation"
      >
        <div className="flex w-full max-w-[1440px] items-center justify-between px-4">
          
          {/* 1. โลโก้ "SOQ." */}
          {/* (ใช้ Prompt font-semibold ตามที่มีใน layout.tsx แต่ขนาด 24px ตามสเปก) */}
          <Link href={homeHref} className="font-semibold text-2xl leading-9 text-black">
            SOQ.
          </Link>

          {/* 2. เมนู (Desktop) */}
          <nav className="hidden md:flex items-center gap-5">
            {MENU.map((m) => (
              <a
                key={m.id}
                href={`#${m.id}`}
                className="font-normal text-base text-black transition-opacity hover:opacity-70 relative"
              >
                {locale === 'th' ? m.th : m.en}
                {/* Active Underline (แบบใหม่) */}
                <span
                  className="absolute left-0 -bottom-1 h-0.5 w-full bg-black transition-transform duration-300"
                  style={{ transform: active === m.id ? 'scaleX(1)' : 'scaleX(0)' }}
                />
              </a>
            ))}
          </nav>

          {/* 3. ไอคอน (Desktop) */}
          <div className="hidden md:flex items-center gap-5">
            <button
              type="button"
              className={iconButtonClasses}
              aria-label="User account"
              title="User account"
            >
              <UserRound />
            </button>
            <button
              type="button"
              className={iconButtonClasses}
              aria-label="Open cart"
              title="Open cart"
            >
              <ShoppingCart />
            </button>
            
            {/* ปุ่มเปลี่ยนภาษา (สไตล์ใหม่ตามสเปก) */}
            <Link 
              href={swapHref} 
              prefetch={false} 
              className="flex items-center gap-1 font-normal text-base text-black transition-opacity hover:opacity-70"
              aria-label="Switch language"
              title={langTitle}
            >
              {locale === 'th' ? 'ไทย' : 'EN'}
              <ChevronDown className="h-4 w-4" />
            </Link>

            {/* ปุ่มเปลี่ยนธีม (ยังคงไว้) */}
            <ThemeToggle />
          </div>

          {/* 4. Hamburger (Mobile) */}
          <div className="md:hidden">
            <button
              className={iconButtonClasses}
              onClick={() => setOpen((v) => !v)}
              aria-label="Open navigation"
              title="Open navigation"
            >
              <MenuIcon />
            </button>
          </div>

        </div>
      </header>

      {/* Mobile drawer (ปรับให้เข้ากับดีไซน์ใหม่) */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 z-50 h-full w-4/5 max-w-sm bg-white p-6 shadow-lg dark:bg-chrome-2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-end">
                <button
                  className="h-6 w-6 text-black dark:text-white"
                  onClick={() => setOpen(false)}
                  aria-label="Close navigation"
                >
                  <X />
                </button>
              </div>
              <nav className="mt-8 flex flex-col gap-6">
                {MENU.map((m) => (
                  <a
                    key={m.id}
                    href={`#${m.id}`}
                    className="font-semibold text-lg text-black dark:text-white"
                    onClick={() => setOpen(false)}
                  >
                    {locale === 'th' ? m.th : m.en}
                  </a>
                ))}
              </nav>
              
              {/* ไอคอนใน Mobile Drawer */}
              <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
                <div className="flex items-center gap-6">
                  <button type="button" className={iconButtonClasses} aria-label="User" title="User account">
                    <UserRound />
                  </button>
                  <button type="button" className={iconButtonClasses} aria-label="Open cart" title="Open cart">
                    <ShoppingCart />
                  </button>
                  <ThemeToggle />
                </div>
                <Link 
                  href={swapHref} 
                  prefetch={false} 
                  className="mt-6 flex items-center gap-1 font-normal text-base text-black dark:text-white"
                  aria-label="Switch language"
                  title={langTitle}
                >
                  {locale === 'th' ? 'ไทย' : 'EN'}
                  <ChevronDown className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}