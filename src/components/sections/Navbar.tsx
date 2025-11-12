'use client'

import Link from 'next/link'
import type { Route } from 'next'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
// 1. Import useState
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserRound, ShoppingCart, Menu as MenuIcon, X, ChevronDown } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useTheme } from 'next-themes'

// เมนู (เหมือนเดิม)
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
  const { theme } = useTheme()

  const [active, setActive] = useState<string>('hero')
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // 2. สร้าง State สำหรับเก็บเมนูที่กำลัง Hover
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);

  // Logic ติดตาม Active Section และ Scroll (เหมือนเดิม)
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setActive(document.body.dataset.activeSection ?? (y > 160 ? 'features' : 'hero'))
      setScrolled(y > 50)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Logic สลับภาษา (เหมือนเดิม)
  const homeHref = (`/${locale}`) as Route
  const switchTo = locale === 'th' ? 'en' : 'th'
  const swapHref = (pathname ? pathname.replace(`/${locale}`, `/${switchTo}`) : `/${switchTo}`) as Route
  const langTitle = locale === 'th' ? 'English' : 'ภาษาไทย'

  // กำหนดสีของข้อความและไอคอนตาม theme และการ scrolled
  const textColorClass = theme === 'dark' 
    ? 'text-white' 
    : (scrolled ? 'text-black' : 'text-black');

  const iconColorClass = theme === 'dark' 
    ? 'text-white' 
    : (scrolled ? 'text-black' : 'text-black');

  return (
    <>
      <header 
        // Navbar หลัก (พื้นหลังโปร่งใส -> ขาว/เข้ม ตอน scroll)
        className={`fixed top-0 z-50 flex h-[76px] w-full items-center justify-center transition-all duration-300
          ${scrolled 
            ? 'bg-white shadow-[0px_4px_4px_#F6F7F8] dark:bg-chrome-2 dark:shadow-none'
            : 'bg-transparent dark:bg-chrome-2 dark:shadow-none'
          }`}
        aria-label="Main Navigation"
      >
        <div className="container flex h-full max-w-[1440px] items-center justify-between px-4">
          
          {/* 1. โลโก้ "SOQ." (ซ้าย) */}
          <Link href={homeHref} className={`font-poppins text-2xl font-semibold leading-9 ${textColorClass}`}>
            SOQ.
          </Link>

          {/* 2. เมนูและไอคอน (Desktop - ชิดขวา) */}
          <div className="hidden md:flex items-center gap-10"> 
            
            {/* กลุ่มที่ 1: เมนู (16px) */}
            <nav 
              className="flex items-center gap-4"
              onMouseLeave={() => setHoveredMenu(null)} // 3. Reset เมื่อเมาส์ออกจาก <nav>
            >
              {MENU.map((m) => (
                <a
                  key={m.id}
                  href={`#${m.id}`}
                  className={`relative font-prompt text-base font-normal ${textColorClass} transition-opacity hover:opacity-70 whitespace-nowrap px-2 py-1`} // เพิ่ม padding
                  onMouseEnter={() => setHoveredMenu(m.id)} // 4. Set เมนูที่กำลัง Hover
                >
                  {locale === 'th' ? m.th : m.en}
                  
                  {/* 5. "Wow" Motion: ขีดเส้นใต้สีทองเมื่อ Hover */}
                  {hoveredMenu === m.id && (
                    <motion.span 
                      className="absolute -bottom-1 left-0 h-0.5 w-full rounded-full"
                      style={{ backgroundColor: 'var(--accent)' }} // <-- สีทอง #F3C85B
                      layoutId="underline" // <-- นี่คือ "Magic" motion
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                </a>
              ))}
            </nav>

            {/* กลุ่มที่ 2: ไอคอน (24px) */}
            <div className="flex items-center gap-4"> 
              <button
                type="button"
                className={`h-6 w-6 ${iconColorClass} transition-colors hover:opacity-70`}
                aria-label="User account"
                title="User account"
              >
                <UserRound />
              </button>
              <button
                type="button"
                className={`h-6 w-6 ${iconColorClass} relative transition-colors hover:opacity-70`}
                aria-label="Open cart"
                title="Open cart"
              >
                <ShoppingCart />
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  3
                </span>
              </button>
              
              <Link 
                href={swapHref} 
                prefetch={false} 
                className={`flex items-center gap-1 font-prompt text-base font-normal ${textColorClass} transition-opacity hover:opacity-70 whitespace-nowrap`}
                aria-label="Switch language"
                title={langTitle}
              >
                {locale === 'th' ? 'ไทย' : 'EN'}
                <ChevronDown className="h-4 w-4" />
              </Link>

              <ThemeToggle />
            </div>
          </div>


          {/* 3. Hamburger (Mobile) */}
          <div className="md:hidden">
            <button
              className={`h-6 w-6 ${iconColorClass}`}
              onClick={() => setOpen((v) => !v)}
              aria-label="Open navigation"
              title="Open navigation"
            >
              <MenuIcon />
            </button>
          </div>

        </div>
      </header>

      {/* Mobile drawer (ไม่เปลี่ยนแปลง) */}
      <AnimatePresence>
        {/* ... (โค้ด Mobile Drawer ทั้งหมด) ... */}
      </AnimatePresence>
    </>
  )
}