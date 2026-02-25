import Hero from '@/components/sections/Hero'
import Testimonials from '@/components/sections/Testimonials'
import Product from '@/components/sections/Product'
import Standards from '@/components/sections/IndustrialStandards'
import FAQs from '@/components/sections/FAQs'
import Footer from '@/components/sections/Footer'
import { getProducts } from '@/lib/products'
import { getReviews, getCertifications } from '@/lib/cms'

export const revalidate = 300

export default async function IndexPage() {
  const [products, reviews, certifications] = await Promise.all([
    getProducts(),
    getReviews(),
    getCertifications(),
  ])

  return (
    <>
      <Hero />
      <Testimonials reviews={reviews} />
      <Product products={products} />
      <Standards certifications={certifications} />
      <FAQs />
      <Footer />
    </>
  )
}
