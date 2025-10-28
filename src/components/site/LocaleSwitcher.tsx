// src/components/sections/LocaleSwitcher.tsx
'use client'

import {useCallback} from 'react'
import {useLocale} from 'next-intl'
import {usePathname, useRouter} from '@/i18n/navigation'
import {useParams} from 'next/navigation'

type Props = { className?: string; icon?: React.ReactNode }

export default function LocaleSwitcher({className, icon}: Props) {
  const active = useLocale()                               // 'th' | 'en'
  const router = useRouter()
  const pathname = usePathname()                           // "/" | "/products/[slug]"
  const {slug} = useParams<{slug?: string}>()              // รองรับหน้า /products/[slug]

  const toggle = useCallback(() => {
    const next = active === 'th' ? 'en' : 'th'

    // ✅ เคส dynamic route: ต้องส่ง params ให้ตรง type
    if (pathname === '/products/[slug]' && slug) {
      router.replace(
        { pathname: '/products/[slug]', params: { slug } },
        { locale: next }
      )
      return
    }

    // ✅ หน้า root หรือเส้นทางคงที่ (เพิ่มเคสอื่น ๆ ได้ด้วยรูปแบบเดียวกัน)
    router.replace({ pathname: '/' }, { locale: next })
  }, [active, pathname, router, slug])

  const checked = active === 'en'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={checked}
      className={
        className ??
        'inline-flex items-center gap-2 rounded-md border border-border px-2 py-1 text-sm hover:bg-muted'
      }
      aria-label="Switch language"
    >
      {icon}
      <span>{checked ? 'EN' : 'ไทย'}</span>
    </button>
  )
}
