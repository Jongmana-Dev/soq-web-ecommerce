'use client'

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
import { Link } from '@/i18n/navigation'

const menu = [
  { href: '#products', labelTh: 'สินค้า', labelEn: 'Products' },
  { href: '#reviews', labelTh: 'รีวิว', labelEn: 'Reviews' },
  { href: '#standards', labelTh: 'มาตรฐานโรงงาน', labelEn: 'Standards' },
  { href: '#faqs', labelTh: 'คำถามที่พบบ่อย', labelEn: 'FAQs' },
  { href: '#contact', labelTh: 'ติดต่อ', labelEn: 'Contact' },
]

export default function MobileNav({ locale }: { locale: string }) {
  return (
    <Sheet>
      <SheetTrigger aria-label="open menu" className="p-2 md:hidden"><Menu /></SheetTrigger>
      <SheetContent>
        <nav className="mt-4">
          <ul className="grid gap-3 text-lg">
            {menu.map((m) => (
              <li key={m.href}><Link href={m.href}>{locale==='th'?m.labelTh:m.labelEn}</Link></li>
            ))}
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
