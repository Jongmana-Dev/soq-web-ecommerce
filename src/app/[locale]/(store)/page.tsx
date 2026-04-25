import type { Metadata } from 'next'
import HeroV3 from '@/components/sections/HeroV3'
import Testimonials from '@/components/sections/TestimonialsV2'
import Product from '@/components/sections/Product'
import Standards from '@/components/sections/IndustrialStandards'
import FAQs from '@/components/sections/FAQs'
import Footer from '@/components/sections/Footer'
import { getProducts } from '@/lib/products'
import BrandHistory from '@/components/sections/BrandHistory'
import AboutSection from '@/components/sections/AboutSection'
import ClientLogos from '@/components/sections/ClientLogos'
import { getReviews, getCertifications, getFAQs, getUsageSteps, getTermsSections, getBrandHistories, getHistoryContent, getClientLogos, getAboutImages } from '@/lib/cms'

const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://soqthailand.com'

export const revalidate = 3_600 // 1 hour

export function generateStaticParams() {
  return [{ locale: 'th' }, { locale: 'en' }]
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params

  const title =
    locale === 'th'
      ? 'SOQ. Safe for Sip — ผลิตภัณฑ์สำหรับฆ่าเชื้อแบคทีเรียโดยไม่ต้องล้างน้ำออก'
      : 'SOQ. Safe for Sip — No-rinse antibacterial product'
  const description =
    locale === 'th'
      ? 'SOQ. Safe for Sip — ผลิตภัณฑ์สำหรับฆ่าเชื้อแบคทีเรียโดยไม่ต้องล้างน้ำออก ใช้ง่าย ปลอดภัย และมีประสิทธิภาพสูงด้วยมาตราฐานโรงงาน'
      : 'SOQ. Safe for Sip — A no-rinse antibacterial sanitizer. Easy to use, safe, and highly effective, backed by factory-standard quality. '

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
      type: 'website',
      siteName: 'SOQ',
      url: `${base}/${locale}`,
      images: [{ url: '/og', width: 1200, height: 630, alt: 'SOQ. Safe for Sip' }],
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
  const [products, reviews, certifications, faqs, usageSteps, termsSections, brandHistories, historyContent, clientLogos, aboutImages] = await Promise.all([
    getProducts(),
    getReviews(),
    getCertifications(),
    getFAQs(),
    getUsageSteps(),
    getTermsSections(),
    getBrandHistories(),
    getHistoryContent(),
    getClientLogos(),
    getAboutImages(),
  ])

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'SOQ. Safe for Sip',
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
      <HeroV3 products={products} />
      <div style={{ backgroundColor: '#ECEDEA' }} className="py-2 sm:py-3 lg:py-4">
        <ClientLogos logos={clientLogos} />
      </div>
      <Testimonials reviews={reviews} />
      <Product products={products} usageSteps={usageSteps} />
      <BrandHistory items={brandHistories} />
      <Standards certifications={certifications} />
      {(historyContent.th || historyContent.en) && (
        <AboutSection content={historyContent} images={aboutImages} />
      )}
      <FAQs faqs={faqs} />
      <Footer termsSections={termsSections} />
    </>
  )
}
