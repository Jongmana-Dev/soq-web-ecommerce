'use client'

import Link from 'next/link'
import type { Route } from 'next'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const sections = [
  { id: 'hero', label: { th: 'หน้าแรก', en: 'Home' } },
  { id: 'features', label: { th: 'จุดเด่น', en: 'Features' } },
  { id: 'standards', label: { th: 'มาตรฐาน', en: 'Standards' } },
  { id: 'reviews', label: { th: 'รีวิว', en: 'Reviews' } },
  { id: 'faqs', label: { th: 'คำถาม', en: 'FAQs' } },
  { id: 'contact', label: { th: 'ติดต่อ', en: 'Contact' } },
] as const

export default function Navbar() {
  const locale = useLocale()
  const pathname = usePathname()
  const [active, setActive] = useState<string>('hero')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setActive(document.body.dataset.activeSection ?? 'hero')
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // กรณีเปิดใช้ typed routes ใน Next 15: บังคับ type เป็น Route ให้ชัดเจน
  const homeHref = (`/${locale}`) as Route
  const switchTo = locale === 'th' ? 'en' : 'th'
  const swapHref = (
    pathname ? pathname.replace(`/${locale}`, `/${switchTo}`) : `/${switchTo}`
  ) as Route

  return (
    <div className="fixed inset-x-0 top-0 z-50 nav-blur">
      <div className="container flex items-center justify-between py-3">
        <Link href={homeHref} className="flex items-center gap-2 font-semibold">
          <span className="badge-gold">SOQ</span>
          <span className="hidden sm:inline">Premium Cleaners</span>
        </Link>

        <div className="hidden md:flex items-center gap-2 text-sm">
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="px-3 py-2 rounded-lg hover:bg-white/5 relative">
              {active === s.id && (
                <motion.span layoutId="nav-underline" className="absolute inset-0 rounded-lg bg-white/5" />
              )}
              <span className="relative z-10">{s.label[locale as 'th' | 'en']}</span>
            </a>
          ))}

          <Link
            href={swapHref}
            prefetch={false}
            className="ml-4 px-3 py-2 rounded-lg border border-white/10 hover:bg-white/5"
          >
            {locale === 'th' ? 'EN' : 'TH'}
          </Link>
        </div>

        {/* mobile */}
        <button
          className="md:hidden px-3 py-2 rounded-lg border border-white/10"
          onClick={() => setOpen((v) => !v)}
          aria-label="Open navigation"
        >
          ☰
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute top-full inset-x-0 bg-[rgba(18,18,22,0.98)] border-b border-white/10 md:hidden"
            >
              <div className="container py-4 flex flex-col gap-2">
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="px-3 py-2 rounded-lg hover:bg-white/5"
                    onClick={() => setOpen(false)}
                  >
                    {s.label[locale as 'th' | 'en']}
                  </a>
                ))}
                <Link href={swapHref} prefetch={false} className="px-3 py-2 rounded-lg border border-white/10">
                  {locale === 'th' ? 'EN' : 'TH'}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
