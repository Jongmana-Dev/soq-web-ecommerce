'use client'

import { useLocale } from 'next-intl'

export default function FullscreenLoading() {
  const locale = useLocale()

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm">
      <div className="w-10 h-10 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      <p className="mt-4 text-sm font-medium text-neutral-500">
        {locale === 'th' ? 'กรุณารอสักครู่...' : 'Please wait...'}
      </p>
    </div>
  )
}
