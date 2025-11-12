'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  // ================ FIX HERE ================
  // ลบ dark:text-white และ dark:hover:opacity-70 ออก
  // เพื่อให้ icon เป็นสีดำ (text-black) เสมอ
  const buttonClasses = "relative h-6 w-6 text-black transition-colors hover:opacity-70"
  // ==========================================

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={buttonClasses} 
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {/* Sun และ Moon จะมี h-6 w-6 และ absolute เพื่อซ้อนทับกัน */}
      <Sun className="absolute inset-0 h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute inset-0 h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}