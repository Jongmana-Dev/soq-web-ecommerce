'use client'
import { useEffect, useState } from 'react'
import { Link } from '@/i18n/navigation'
import { ShoppingCart, User2 } from 'lucide-react'
import LocaleSwitcher from '@/components/sections/LocaleSwitcher'

const NAV = [
  { label: 'สินค้า', id: 'products' },
  { label: 'รีวิว', id: 'reviews' },
  { label: 'มาตรฐานในโรงงาน', id: 'standards' },
  { label: 'คำถามที่พบบ่อย', id: 'faq' },
  { label: 'ติดต่อ', id: 'contact' }
] as const

export default function Header(){
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)

    // ฟังอีเวนต์ sectionchange แบบ type-safe
    const onChange = (e: Event) => {
      const ce = e as CustomEvent<string>
      if (typeof ce.detail === 'string') setActive(ce.detail)
    }

    onScroll()
    window.addEventListener('scroll', onScroll)
    window.addEventListener('sectionchange', onChange)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('sectionchange', onChange)
    }
  }, [])

  return (
    <header className={`sticky top-0 z-50 border-b border-border/60 ${scrolled ? 'bg-background/65 backdrop-blur' : 'bg-transparent'}`}>
      <div className="container flex h-14 items-center">
        <Link href="/" className="mr-auto font-semibold tracking-tight">SOQ</Link>
        <nav className="hidden items-center gap-6 md:flex">
          {NAV.map(i => (
            <a key={i.id} href={`#${i.id}`} data-nav data-target={i.id} data-active={active===i.id}
               className="text-sm text-muted-foreground hover:text-foreground">
              {i.label}
            </a>
          ))}
          <div className="mx-1 h-4 w-px bg-border/70" />
          <LocaleSwitcher />
          {/* ใช้ Link สำหรับ internal routes เพื่อไม่โดน no-html-link-for-pages */}
          <Link href="/login" title="เข้าสู่ระบบ" className="text-muted-foreground hover:text-foreground" data-hover="cursor">
            <User2 size={18}/>
          </Link>
          <Link href="/cart" title="ตะกร้า" className="text-muted-foreground hover:text-foreground" data-hover="cursor">
            <ShoppingCart size={18}/>
          </Link>
        </nav>
      </div>
    </header>
  )
}
