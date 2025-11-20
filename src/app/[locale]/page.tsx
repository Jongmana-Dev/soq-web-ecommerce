import Hero from '@/components/sections/Hero'
import Product from '@/components/sections/Product'
import Reviews from '@/components/sections/Reviews'
import Standards from '@/components/sections/IndustrialStandards'
import FAQs from '@/components/sections/FAQs'
import Contact from '@/components/sections/Contact'
import Footer from '@/components/sections/Footer'
import Testimonials from '@/components/sections/Testimonials' // <-- 1. Import Testimonials

export default function IndexPage() {
  return (
    <>
      <Hero />
      {/* <Reviews /> */}
      <Testimonials />  {/* <-- 2. เพิ่ม Testimonials ที่นี่ */}
      <Product />
      <Standards />
      <FAQs />
      {/* <Contact /> */}
      <Footer />
     
    </>
  )
}