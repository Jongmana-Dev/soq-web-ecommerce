'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'

export type ThemeToggleProps = React.ButtonHTMLAttributes<HTMLButtonElement>

/**
 * ThemeToggle
 * - รองรับ className และ props ของ <button> ทั้งหมด
 * - ใช้ next-themes เพื่อสลับ light/dark
 */
export default function ThemeToggle({
  className,
  onClick,
  ...rest
}: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e)
    const next = (resolvedTheme ?? theme) === 'dark' ? 'light' : 'dark'
    setTheme(next)
  }

  // ป้องกัน hydration mismatch: แสดงปุ่มเฉพาะหลัง mount
  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        className={['rounded-full p-2 border border-white/10 bg-black/20', className]
          .filter(Boolean)
          .join(' ')}
        {...rest}
      >
        <Sun className="w-5 h-5 opacity-50" />
      </button>
    )
  }

  const isDark = (resolvedTheme ?? theme) === 'dark'

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={handleClick}
      className={['rounded-full p-2 border border-white/10 bg-black/20 hover:bg-black/30 transition',
        className].filter(Boolean).join(' ')}
      {...rest}
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  )
}
