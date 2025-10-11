import { getProductBySlug } from '@/lib/products'
import Navbar from '@/components/sections/Navbar'
import Footer from '@/components/sections/Footer'
import GalleryStrip from './ui/GalleryStrip'
import AddToCart from './ui/AddToCart'
import { notFound } from 'next/navigation'
import { Reveal } from '@/components/motion/Reveal'

export const revalidate = 3600

type Params = { slug: string; locale: string }

export async function generateStaticParams(){
  return ['star-san-sanitizer', 'pbw-cleaner'].map(slug => ({ slug }))
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { slug, locale } = await params
  const product = getProductBySlug(slug)
  if (!product) notFound()

  return (
    <>
      <Navbar locale={locale} />
      <section className="container py-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <Reveal><GalleryStrip images={product.images} /></Reveal>
          <Reveal y={16} delay={0.1}>
            <div className="flex flex-col gap-4">
              <h1 className="text-3xl font-bold gold-text">{product.name}</h1>
              <p className="text-muted-foreground">{product.short}</p>
              <div className="prose prose-invert max-w-none">
                <p>{product.description}</p>
              </div>
              <AddToCart price={product.price} />
            </div>
          </Reveal>
        </div>
      </section>
      <Footer />
    </>
  )
}
