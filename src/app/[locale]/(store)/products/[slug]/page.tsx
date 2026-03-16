import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getProductBySlug, getProducts } from '@/lib/products'
import { getReviews } from '@/lib/cms'

const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://soqthailand.com'

export async function generateStaticParams() {
  const products = await getProducts()
  const locales = ['th', 'en']
  return locales.flatMap((locale) => products.map((p) => ({ locale, slug: p.slug })))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return {}

  const name = locale === 'th' ? product.name_th : product.name_en
  const desc =
    locale === 'th'
      ? (product.long_desc_th ?? product.short_desc_th)
      : (product.long_desc_en ?? product.short_desc_en)

  return {
    title: name,
    description: desc,
    alternates: {
      canonical: `${base}/${locale}/products/${slug}`,
      languages: {
        th: `${base}/th/products/${slug}`,
        en: `${base}/en/products/${slug}`,
      },
    },
    openGraph: {
      title: name,
      description: desc,
      type: 'website',
      siteName: 'SOQ',
      url: `${base}/${locale}/products/${slug}`,
      images: product.image ? [{ url: product.image, alt: name }] : undefined,
      locale: locale === 'th' ? 'th_TH' : 'en_US',
      alternateLocale: locale === 'th' ? 'en_US' : 'th_TH',
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { slug, locale } = await params
  const [product, reviews] = await Promise.all([getProductBySlug(slug), getReviews()])

  if (!product) return notFound()

  const name = locale === 'th' ? product.name_th : product.name_en
  const desc =
    locale === 'th'
      ? (product.long_desc_th ?? product.short_desc_th)
      : (product.long_desc_en ?? product.short_desc_en)

  const avgRating =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : null

  const lowestPrice = Math.min(...product.sizes.map((s) => s.price))
  const highestPrice = Math.max(...product.sizes.map((s) => s.price))

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description: desc,
    image: product.image,
    brand: { '@type': 'Organization', name: 'SOQ', url: base },
    url: `${base}/${locale}/products/${product.slug}`,
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: lowestPrice,
      highPrice: highestPrice,
      priceCurrency: 'THB',
      offerCount: product.sizes.length,
      availability: 'https://schema.org/InStock',
    },
    ...(avgRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: avgRating.toFixed(1),
        reviewCount: reviews.length,
      },
    }),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <section className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square bg-[#EAEAEA] flex items-center justify-center">
            <Image
              src={product.image}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain p-8"
              priority
            />
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl font-bold text-neutral-900 mb-4">{name}</h1>
            <p className="text-neutral-500 leading-relaxed mb-8">{desc}</p>

            {/* Sizes */}
            <div className="space-y-3">
              {product.sizes.map((size) => (
                <div
                  key={size.id}
                  className="flex items-center justify-between border border-neutral-200 px-5 py-3"
                >
                  <span className="font-medium text-neutral-800">
                    {locale === 'th' ? size.label_th : size.label_en}{' '}
                    <span className="text-neutral-400 text-sm">({size.volume})</span>
                  </span>
                  <span className="font-bold text-neutral-900">
                    {size.price.toLocaleString('th-TH', { minimumFractionDigits: 2 })}{' '}
                    {locale === 'th' ? 'บาท' : 'THB'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
