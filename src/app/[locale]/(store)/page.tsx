import type { Metadata } from 'next'
import HeroV1 from '@/components/sections/HeroV1'
import HeroV2 from '@/components/sections/HeroV2'
import HeroV3 from '@/components/sections/HeroV3'
import HeroV4 from '@/components/sections/HeroV4'
import Testimonials from '@/components/sections/Testimonials'
import Product from '@/components/sections/Product'
import Standards from '@/components/sections/IndustrialStandards'
import FAQs from '@/components/sections/FAQs'
import Footer from '@/components/sections/Footer'
import { getProducts } from '@/lib/products'
import BrandHistory from '@/components/sections/BrandHistory'
import AboutSection from '@/components/sections/AboutSection'
import ClientLogos from '@/components/sections/ClientLogos'
import { getReviews, getCertifications, getFAQs, getUsageSteps, getTermsSections, getBrandHistories, getHistoryContent, getContactInfo, getClientLogos } from '@/lib/cms'

const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://soqthailand.com'

export const revalidate = 86_400 // 24 hours — CMS content rarely changes

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
      ? 'SOQ. Safe for Sip — ผลิตภัณฑ์สำหรับฆ่าเชื้อแบคทีเรียโดยไม่ต้องล้างน้ำออก ปลอดภัย ไร้สารตกค้าง'
      : 'SOQ. Safe for Sip — No-rinse antibacterial product. Safe, residue-free.'

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
  const [products, reviews, certifications, faqs, usageSteps, termsSections, brandHistories, historyContent, contactInfo, clientLogos] = await Promise.all([
    getProducts(),
    getReviews(),
    getCertifications(),
    getFAQs(),
    getUsageSteps(),
    getTermsSections(),
    getBrandHistories(),
    getHistoryContent(),
    getContactInfo(),
    getClientLogos(),
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
      {(() => {
        switch (process.env.NEXT_PUBLIC_HERO_MODE) {
          case 'v1': return <HeroV1 products={products} />
          case 'v2': return <HeroV2 products={products} />
          case 'v4': return <HeroV4 products={products} />
          default:   return <HeroV3 products={products} />
        }
      })()}
      <div style={{ backgroundColor: '#ECEDEA' }} className="py-10 sm:py-14 lg:py-16">
        <ClientLogos logos={clientLogos} />
      </div>
      <Testimonials reviews={reviews} />
      <Product products={products} usageSteps={usageSteps} />
      <BrandHistory items={brandHistories} />
      <Standards certifications={certifications} />
      {(historyContent.th || historyContent.en) && (
        <AboutSection content={historyContent} />
      )}
      <FAQs faqs={faqs} />
      <Footer termsSections={termsSections} contactInfo={contactInfo} />
    </>
  )
}
