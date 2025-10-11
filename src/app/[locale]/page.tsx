import Header from '@/components/site/Header'
import Hero from '@/components/sections/Hero'
import Reviews from '@/components/sections/Reviews'
import ProductStrip from '@/components/sections/ProductStrip'
import Standards from '@/components/sections/Standards'
import FAQ from '@/components/sections/FAQs'
import Contact from '@/components/sections/Contact'
import Footer from '@/components/sections/Footer'

export const revalidate = 3600

export default function Page(){
  return (
    <main>
      <Header />
      <Hero />
      <Reviews />       {/* id="reviews" */}
      <ProductStrip />  {/* id="products" */}
      <Standards />     {/* id="standards" */}
      <FAQ />           {/* id="faq" */}
      <Contact />       {/* id="contact" */}
      <Footer />
    </main>
  )
}
