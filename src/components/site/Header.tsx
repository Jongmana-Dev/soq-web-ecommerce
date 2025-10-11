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
    const onChange = (e: Event) => setActive((e as CustomEvent<string>).detail)
    onScroll(); window.addEventListener('scroll', onScroll)
    window.addEventListener('sectionchange', onChange as any)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('sectionchange', onChange as any)
    }
  }, [])

  return (
    <header className={`sticky top-0 z-50 border-b border-border/60 ${scrolled ? 'bg-background/65 backdrop-blur' : 'bg-transparent'}`}>
      <div className="container flex h-14 items-center">
        <Link href="/" className="mr-auto font-semibold tracking-tight">SOQ</Link>
        <nav className="hidden items-center gap-6 md:flex">
          {NAV.map(i => (
            <a key={i.id} href={`#${i.id}`} data-nav data-target={i.id} data-active={active===i.id}
               className="text-sm text-muted-foreground hover:text-foreground">{i.label}</a>
          ))}
          <div className="mx-1 h-4 w-px bg-border/70" />
          <LocaleSwitcher />
          <a href="/login" title="เข้าสู่ระบบ" data-hover="cursor" className="text-muted-foreground hover:text-foreground">
            <User2 size={18}/>
          </a>
          <a href="/cart" title="ตะกร้า" data-hover="cursor" className="text-muted-foreground hover:text-foreground">
            <ShoppingCart size={18}/>
          </a>
        </nav>
      </div>
    </header>
  )
}
