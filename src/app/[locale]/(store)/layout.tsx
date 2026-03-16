import { Suspense } from 'react'
import Navbar from '@/components/sections/Navbar'
import { LenisProvider } from '@/providers/SmoothScrollProvider'
import { ContactInfoProvider } from '@/providers/ContactInfoProvider'
import LuxuryCursor from '@/components/cursor/LuxuryCursor'
import BackToTop from '@/components/ui/backtotop'
import CartToast from '@/components/ui/CartToast'
import AlertToast from '@/components/ui/AlertToast'
import CartExpiryGuard from '@/components/cart/CartExpiryGuard'
import { getContactInfo } from '@/lib/cms'

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const contactInfo = await getContactInfo()

  return (
    <ContactInfoProvider value={contactInfo}>
      <LenisProvider>
        <LuxuryCursor />
        <Suspense>
          <Navbar />
        </Suspense>
        {children}
        <BackToTop />
        <CartToast />
        <AlertToast />
        <CartExpiryGuard />
      </LenisProvider>
    </ContactInfoProvider>
  )
}
