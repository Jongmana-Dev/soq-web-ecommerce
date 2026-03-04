import type { Metadata } from 'next'
import Hero from '@/components/sections/Hero'
import Testimonials from '@/components/sections/Testimonials'
import Product from '@/components/sections/Product'
import Standards from '@/components/sections/IndustrialStandards'
import FAQs from '@/components/sections/FAQs'
import Footer from '@/components/sections/Footer'
import { getProducts } from '@/lib/products'
import { getReviews, getCertifications, getFAQs } from '@/lib/cms'

const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://soqthailand.com'

export const revalidate = 3600

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params

  const title =
    locale === 'th'
      ? 'SOQ — น้ำยาทำความสะอาดระดับพรีเมียมสำหรับ Brewing'
      : 'SOQ — Premium Brewing Sanitizer'
  const description =
    locale === 'th'
      ? 'SOQ Star San Sanitizer น้ำยาทำความสะอาดมาตรฐานสากล สำหรับโรงเบียร์คราฟต์และอุตสาหกรรมอาหาร ปลอดภัย ไร้สารตกค้าง'
      : 'SOQ Star San Sanitizer — Professional-grade sanitizer for craft breweries and food industry. Safe, residue-free, globally certified.'

  return {
    title,
    description,
    alternates: {
      canonical: `${base}/${locale}`,
      languages: {
        th: `${base}/th`,
        en: `${base}/en`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${base}/${locale}`,
      locale: locale === 'th' ? 'th_TH' : 'en_US',
      alternateLocale: locale === 'th' ? 'en_US' : 'th_TH',
    },
  }
}

export default async function IndexPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const [products, reviews, certifications, faqs] = await Promise.all([
    getProducts(),
    getReviews(),
    getCertifications(),
    getFAQs(),
  ])

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'SOQ Star San Sanitizer',
    description:
      locale === 'th'
        ? 'น้ำยาทำความสะอาดระดับพรีเมียมสำหรับอุตสาหกรรม Brewing ปลอดภัย ไร้สารตกค้าง'
        : 'Premium sanitizer for craft brewing industry. Safe, residue-free, globally certified.',
    brand: { '@type': 'Organization', name: 'SOQ', url: base },
    image: products[0]?.image,
    offers: products.flatMap((p) =>
      p.sizes.map((size) => ({
        '@type': 'Offer',
        price: size.price,
        priceCurrency: 'THB',
        availability: 'https://schema.org/InStock',
        name: locale === 'th' ? size.label_th : size.label_en,
      })),
    ),
    ...(avgRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: avgRating.toFixed(1),
        reviewCount: reviews.length,
      },
    }),
  }

  const faqJsonLd =
    faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: locale === 'th' ? faq.question_th : faq.question_en,
            acceptedAnswer: {
              '@type': 'Answer',
              text: locale === 'th' ? faq.answer_th : faq.answer_en,
            },
          })),
        }
      : null

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <Hero products={products} />
      <Testimonials reviews={reviews} />
      <Product products={products} />
      <Standards certifications={certifications} />
      <FAQs faqs={faqs} />
      <Footer />
    </>
  )
}
