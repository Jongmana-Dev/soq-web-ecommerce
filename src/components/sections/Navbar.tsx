'use client'

import Link from 'next/link'
import type { Route } from 'next'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserRound, ShoppingCart } from 'lucide-react'

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
  const [atTop, setAtTop] = useState(true)
  const [scrollUp, setScrollUp] = useState(true)
  const lastY = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setActive(document.body.dataset.activeSection ?? (y > 160 ? 'features' : 'hero'))
      setAtTop(y < 24)
      setScrollUp(y < lastY.current || y < 24)
      lastY.current = y
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const homeHref = (`/${locale}`) as Route
  const switchTo = locale === 'th' ? 'en' : 'th'
  const swapHref = (pathname ? pathname.replace(`/${locale}`, `/${switchTo}`) : `/${switchTo}`) as Route

  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: scrollUp ? 0 : -84 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="fixed inset-x-0 top-0 z-50"
      aria-label="Main Navigation"
    >
      {/* แถบบางบนสุด (แสดงเฉพาะ desktop) */}
      {/* <div
        className="hidden md:flex h-6 w-full items-center justify-between px-4 text-[11px]"
        style={{ background: '#b8b0a8', color: '#131417' }}
      >
        <div className="opacity-90">
          {locale === 'th' ? 'โชว์รูมเปิด 10:00 - 17:00 น.' : 'Showroom open 10:00 - 17:00'}
        </div>
        <a href="#contact" className="underline underline-offset-4 opacity-90 hover:opacity-100">
          {locale === 'th' ? 'นัดหมายขอคำปรึกษา' : 'Book an appointment'} ↗
        </a>
      </div> */}

      <div className="container">
        {/* ใช้ grid แบบคอลัมน์ตายตัว: [โลโก้][เมนูขยาย][ไอคอนขวาสุด] */}
        <div
          className={[
            'grid grid-cols-[auto_1fr_auto] items-center',
            atTop
              ? 'h-[84px] px-2 bg-transparent'
              : 'h-[84px] px-[18px] mt-3 rounded-[999px] bg-white border-2 border-[#efece6] shadow-[0_2px_6px_rgba(0,0,0,.05),0_18px_50px_rgba(16,26,23,.12)]',
          ].join(' ')}
        >
          {/* ซ้าย: โลโก้ */}
          <Link href={homeHref} className="flex items-center gap-3">
            <span
              className="inline-grid place-items-center h-10 w-10 rounded-full border"
              style={{ background: '#fff', color: '#111', borderColor: 'var(--line)' }}
            >
              <span style={{ fontWeight: 700 }}>K</span>
            </span>
            <span className="sr-only">SOQ</span>
          </Link>

          {/* กลาง: เมนู (ตัวใหญ่) */}
          <nav className="hidden md:flex justify-center items-center gap-6 text-[17px] md:text-[18px] font-semibold">
            {MENU.map((m) => (
              <a
                key={m.id}
                href={`#${m.id}`}
                className="relative px-[18px] py-[12px] rounded-[14px] text-[#1a1d1c]"
              >
                {locale === 'th' ? m.th : m.en}
                <span
                  className="pointer-events-none absolute left-[18px] right-[18px] bottom-[8px] h-[2px] rounded"
                  style={{
                    transform: active === m.id ? 'scaleX(1)' : 'scaleX(0)',
                    transformOrigin: 'center',
                    transition: 'transform .18s ease',
                    background: '#1a1d1c',
                    display: 'block',
                    content: '""',
                  }}
                />
              </a>
            ))}
          </nav>

          {/* ขวา: Actions — ดันไปขอบขวาสุดเสมอ */}
          <div className="hidden md:flex items-center gap-3 justify-self-end">
            <Link
              href={swapHref}
              prefetch={false}
              className="h-[42px] min-w-[42px] px-[14px] inline-flex items-center justify-center rounded-full bg-[#b5ab9f] text-[#1a1d1c] border-2 border-[#efece6] font-bold"
              aria-label="Switch language"
              title={locale === 'th' ? 'English' : 'ภาษาไทย'}
            >
              {locale === 'th' ? 'EN' : 'TH'}
            </Link>

            <button
              type="button"
              className="h-[42px] w-[42px] inline-flex items-center justify-center rounded-full bg-[#b5ab9f] text-[#1a1d1c] border-2 border-[#efece6] font-bold"
              aria-label="Open cart"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>

            <button
              type="button"
              className="h-[42px] w-[42px] inline-flex items-center justify-center rounded-full bg-[#b5ab9f] text-[#1a1d1c] border-2 border-[#efece6] font-bold"
              aria-label="User"
            >
              <UserRound className="w-4 h-4" />
            </button>
          </div>

          {/* Hamburger — mobile only (PC จะไม่แสดงแน่นอน) */}
          <div className="md:hidden justify-self-end">
            <button
              className="h-[42px] w-[42px] inline-flex items-center justify-center rounded-full bg-[#b5ab9f] text-[#1a1d1c] border-2 border-[#efece6] font-bold"
              onClick={() => setOpen((v) => !v)}
              aria-label="Open navigation"
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="md:hidden border-t"
            style={{ background: 'var(--surface)', borderColor: 'var(--line)' }}
          >
            <div className="container py-4 flex flex-col gap-1 text-[16px] font-semibold">
              {MENU.map((m) => (
                <a
                  key={m.id}
                  href={`#${m.id}`}
                  className="px-3 py-3 rounded-lg hover:bg-black/5"
                  onClick={() => setOpen(false)}
                >
                  {locale === 'th' ? m.th : m.en}
                </a>
              ))}
              <div className="flex items-center gap-2 pt-2">
                <Link href={swapHref} prefetch={false} className="px-3 py-2 rounded-lg border" style={{ borderColor: 'var(--line)' }}>
                  {locale === 'th' ? 'EN' : 'TH'}
                </Link>
                <button type="button" className="h-[40px] w-[40px] inline-flex items-center justify-center rounded-full bg-[#b5ab9f] text-[#1a1d1c] border-2 border-[#efece6]">
                  <ShoppingCart className="w-4 h-4" />
                </button>
                <button type="button" className="h-[40px] w-[40px] inline-flex items-center justify-center rounded-full bg-[#b5ab9f] text-[#1a1d1c] border-2 border-[#efece6]">
                  <UserRound className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
