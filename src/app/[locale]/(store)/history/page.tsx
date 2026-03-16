import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getHistoryContent } from '@/lib/cms'
import HistoryContent from '@/components/sections/HistoryContent'

const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://soqthailand.com'

export const revalidate = 86_400

export function generateStaticParams() {
  return [{ locale: 'th' }, { locale: 'en' }]
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const title = locale === 'th' ? 'SOQ — เกี่ยวกับเรา' : 'SOQ — About Us'
  const description =
    locale === 'th'
      ? 'เรื่องราวและประวัติของแบรนด์ SOQ'
      : 'The story and history of SOQ brand'

  return {
    title,
    description,
    alternates: {
      canonical: `${base}/${locale}/history`,
      languages: { th: `${base}/th/history`, en: `${base}/en/history` },
    },
    openGraph: { title, description, type: 'website', siteName: 'SOQ', url: `${base}/${locale}/history` },
  }
}

export default async function HistoryPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const content = await getHistoryContent()

  return (
    <Suspense>
      <HistoryContent content={content} locale={locale} />
    </Suspense>
  )
}
