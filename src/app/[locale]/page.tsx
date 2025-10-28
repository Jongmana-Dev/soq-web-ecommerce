import Hero from '@/components/sections/Hero'
import Product from '@/components/sections/Product'
import Reviews from '@/components/sections/Reviews'
import Standards from '@/components/sections/Standards'
import FAQs from '@/components/sections/FAQs'
import Contact from '@/components/sections/Contact'
import Footer from '@/components/sections/Footer'
import BackToTop from '@/components/ui/backtotop'

export const revalidate = 3600

export default function HomePage() {
  return (
    <>
      <BackToTop />
      <Hero />
      <Product />
      <Standards />
      <Reviews />
      <FAQs />
      <Contact />
      <Footer />
    </>
  )
}
