import { NextIntlClientProvider } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { ThemeProvider } from 'next-themes'
// 1. Import Poppins กลับเข้ามา
import { Prompt, Poppins } from 'next/font/google'
import Navbar from '@/components/sections/Navbar'
import { LenisProvider } from '@/providers/SmoothScrollProvider'
import '@/app/globals.css'

// 2. กำหนดตัวแปร Poppins (สำหรับโลโก้) และ Prompt (สำหรับเนื้อหา)
const prompt = Prompt({ 
  subsets: ['latin', 'thai'], 
  weight: ['300', '400', '500', '600', '700'], // เพิ่ม '300' สำหรับ Hero
  display: 'swap',
  variable: '--font-prompt' // ใช้ CSS Variable
})
const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['600'], // น้ำหนัก 600 สำหรับโลโก้
  display: 'swap',
  variable: '--font-poppins' // ใช้ CSS Variable
})

export default async function LocaleLayout(props: LayoutProps<'/[locale]'>) {
  const { locale } = await props.params
  setRequestLocale(locale)

  return (
    <html lang={locale} suppressHydrationWarning>
      {/* 3. รวมฟอนต์ทั้งสองตัวแปรเข้าที่ body */}
      <body className={`${prompt.variable} ${poppins.variable} font-prompt`}>
        {/* ตั้งค่า font-prompt เป็น default 
          เราจะเรียก .font-poppins (จาก tailwind.config.js) ใน Navbar
        */}
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
        >
          <NextIntlClientProvider locale={locale}>
            <LenisProvider>
              <Navbar />
              {props.children}
            </LenisProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}