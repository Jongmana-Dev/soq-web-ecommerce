'use client'

import { usePathname, useRouter } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { useMemo, useCallback } from 'react'

export default function LocaleSwitcher(){
  const pathname = usePathname()
  const router = useRouter()
  const active = useMemo(
    () => pathname.split('/')[1] as (typeof routing.locales)[number],
    [pathname]
  )

  const toggle = useCallback(() => {
    const next = active === 'th' ? 'en' : 'th'
    router.replace(pathname, { locale: next })
  }, [active, pathname, router])

  const checked = active === 'en'

  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={toggle}
      data-on={checked}
      className="ios-switch"
      data-hover="cursor"
      title="Switch language"
    >
      <span className="ios-switch__label ios-switch__label--left">TH</span>
      <span className="ios-switch__label ios-switch__label--right">EN</span>
      <span className="ios-switch__knob" />
      <span className="sr-only">Toggle language</span>
    </button>
  )
}
