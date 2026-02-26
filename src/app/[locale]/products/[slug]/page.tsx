import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getProductBySlug, getProducts } from '@/lib/products'

const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://soqthailand.com'

export async function generateStaticParams() {
  const products = await getProducts()
  return products.map((p) => ({ slug: p.slug }))
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
  const desc = locale === 'th' ? product.short_desc_th : product.short_desc_en

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
      url: `${base}/${locale}/products/${slug}`,
      images: product.image ? [product.image] : undefined,
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
  const product = await getProductBySlug(slug)

  if (!product) return notFound()

  const name = locale === 'th' ? product.name_th : product.name_en
  const desc =
    locale === 'th'
      ? (product.long_desc_th ?? product.short_desc_th)
      : (product.long_desc_en ?? product.short_desc_en)

  return (
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
  )
}
