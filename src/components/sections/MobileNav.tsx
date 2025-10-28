'use client'

import { useCallback } from 'react'
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'

const menu = [
  { id: 'products', labelTh: 'สินค้า', labelEn: 'Products' },
  { id: 'reviews',  labelTh: 'รีวิว', labelEn: 'Reviews' },
  { id: 'standards',labelTh: 'มาตรฐานโรงงาน', labelEn: 'Standards' },
  { id: 'faq',      labelTh: 'คำถามที่พบบ่อย', labelEn: 'FAQs' }, // <-- ใช้ 'faq' (ตรงกับ section id)
  { id: 'contact',  labelTh: 'ติดต่อ', labelEn: 'Contact' },
]

type Props = {
  locale: string // ถ้าจะทำ type-safe ให้ใช้: type Locale = (typeof routing.locales)[number]
}

export default function MobileNav({ locale }: Props) {
  const scrollTo = useCallback((id: string) => {
    // ถ้าใช้ Lenis หรือ smooth-scroll provider ที่เป็น global, อาจเรียก API ของมันแทน
    const el = document.getElementById(id)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return (
    <Sheet>
      <SheetTrigger aria-label="open menu" className="p-2 md:hidden">
        <Menu />
      </SheetTrigger>

      <SheetContent side="right" className="w-[280px]">
        <nav className="mt-4">
          <ul className="grid gap-3 text-lg">
            {menu.map((m) => (
              <li key={m.id}>
                {/* ใช้ <a> ธรรมดา แต่ intercept เพื่อ smooth scroll */}
                <a
                  href={`#${m.id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    scrollTo(m.id)
                    // ถ้าต้องปิด sheet เมื่อคลิก: หา element button ที่เป็น trigger แล้วคลิก หรือจัดการ state ของ Sheet เป็น controlled
                    // ตัวอย่างง่าย: ปิดโดยการเลื่อน focus ไป elem อื่น (Sheet ปิดอัตโนมัติเมื่อ user interacts บางกรณี)
                  }}
                  className="block py-2"
                >
                  {locale === 'th' ? m.labelTh : m.labelEn}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
