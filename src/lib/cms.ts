import { apiFetch } from './api'

export interface Certification {
  id: string
  icon: string
  label_th: string
  label_en: string
  description_th: string
  description_en: string
  pdf_url: string | null
  document_images: string[]
  sort_order: number
}

export interface Review {
  id: string
  name: string
  role: string
  avatar: string
  quote_th: string
  quote_en: string
  rating: number
  review_image: string | null
  video_url: string | null
  media_type: 'image' | 'video'
  brand_name: string | null
  brand_logo: string | null
  sort_order: number
}

export interface FAQItem {
  id: string
  question_th: string
  question_en: string
  answer_th: string
  answer_en: string
  icon: string
}

export interface UsageStep {
  id: string
  title_th: string
  title_en: string
  description_th: string
  description_en: string
  image: string
  sort_order: number
}

export interface TermsSection {
  id: string
  title_th: string
  title_en: string
  body_th: string
  body_en: string
  sort_order: number
}

export interface BrandHistory {
  id: string
  year: string
  title_th: string
  title_en: string
  description_th: string
  description_en: string
  image: string
  sort_order: number
}

export interface SiteSetting {
  key: string
  value: string
  group: string
  description: string | null
}

interface ApiResponse<T> {
  data: T
  meta?: { total: number }
}

/** CMS content rarely changes — cache for 24 hours, revalidate on-demand via tags */
const CMS_REVALIDATE = 86_400 // 24 hours

export async function getReviews(): Promise<Review[]> {
  try {
    const res = await apiFetch<ApiResponse<Review[]>>('/api/cms/reviews', {
      next: { revalidate: CMS_REVALIDATE, tags: ['landing', 'reviews'] },
    })
    return res.data
  } catch {
    return []
  }
}

export async function getCertifications(): Promise<Certification[]> {
  try {
    const res = await apiFetch<ApiResponse<Certification[]>>(
      '/api/cms/certifications',
      { next: { revalidate: CMS_REVALIDATE, tags: ['landing', 'certifications'] } },
    )
    return res.data
  } catch {
    return []
  }
}

export async function getSettings(): Promise<SiteSetting[]> {
  try {
    const res = await apiFetch<ApiResponse<SiteSetting[]>>('/api/settings', {
      next: { revalidate: CMS_REVALIDATE, tags: ['landing', 'settings'] },
    })
    return res.data
  } catch {
    return []
  }
}

export async function getFAQs(): Promise<FAQItem[]> {
  try {
    const res = await apiFetch<ApiResponse<FAQItem[]>>('/api/cms/faqs', {
      next: { revalidate: CMS_REVALIDATE, tags: ['landing', 'faqs'] },
    })
    return res.data
  } catch {
    return []
  }
}

export async function getUsageSteps(): Promise<UsageStep[]> {
  try {
    const res = await apiFetch<ApiResponse<UsageStep[]>>('/api/cms/usage-steps', {
      next: { revalidate: CMS_REVALIDATE, tags: ['landing', 'usage-steps'] },
    })
    return res.data
  } catch {
    return []
  }
}

export async function getTermsSections(): Promise<TermsSection[]> {
  try {
    const res = await apiFetch<ApiResponse<TermsSection[]>>('/api/cms/terms-sections', {
      next: { revalidate: CMS_REVALIDATE, tags: ['landing', 'terms'] },
    })
    return res.data
  } catch {
    return []
  }
}

export async function getBrandHistories(): Promise<BrandHistory[]> {
  try {
    const res = await apiFetch<ApiResponse<BrandHistory[]>>('/api/cms/brand-histories', {
      next: { revalidate: CMS_REVALIDATE, tags: ['landing', 'brand-history'] },
    })
    return res.data
  } catch {
    return []
  }
}

export interface ContactInfo {
  phone: string
  email: string
  line_id: string
  line_url: string
  facebook_url: string
  facebook_chat_url: string
}

export async function getContactInfo(): Promise<ContactInfo> {
  try {
    const settings = await getSettings()
    const get = (key: string, fallbackEnv?: string) =>
      settings.find((s) => s.key === key)?.value ?? fallbackEnv ?? ''

    const lineId = get('contact_line_id', process.env.NEXT_PUBLIC_LINE_ID)
    const lineUrl = lineId ? `https://line.me/R/ti/p/${lineId}` : ''

    return {
      phone: get('contact_phone', process.env.NEXT_PUBLIC_PHONE),
      email: get('contact_email', process.env.NEXT_PUBLIC_EMAIL),
      line_id: lineId,
      line_url: lineUrl,
      facebook_url: get('contact_facebook_url', process.env.NEXT_PUBLIC_FACEBOOK_URL),
      facebook_chat_url: get('contact_facebook_chat_url', process.env.NEXT_PUBLIC_FACEBOOK_CHAT_URL),
    }
  } catch {
    // Fallback to env vars
    const lineId = process.env.NEXT_PUBLIC_LINE_ID ?? ''
    return {
      phone: process.env.NEXT_PUBLIC_PHONE ?? '',
      email: process.env.NEXT_PUBLIC_EMAIL ?? '',
      line_id: lineId,
      line_url: lineId ? `https://line.me/R/ti/p/${lineId}` : '',
      facebook_url: process.env.NEXT_PUBLIC_FACEBOOK_URL ?? '',
      facebook_chat_url: process.env.NEXT_PUBLIC_FACEBOOK_CHAT_URL ?? '',
    }
  }
}

export interface ClientLogo {
  id: string
  name: string
  logo_url: string
  website_url: string | null
  sort_order: number
}

export async function getClientLogos(): Promise<ClientLogo[]> {
  try {
    const res = await apiFetch<ApiResponse<ClientLogo[]>>('/api/cms/client-logos', {
      next: { revalidate: CMS_REVALIDATE, tags: ['landing', 'client-logos'] },
    })
    return res.data
  } catch {
    return []
  }
}

export interface HistoryContent {
  th: string
  en: string
}

export async function getHistoryContent(): Promise<HistoryContent> {
  try {
    const res = await apiFetch<ApiResponse<HistoryContent>>('/api/settings/history-content', {
      next: { revalidate: CMS_REVALIDATE, tags: ['landing', 'history'] },
    })
    return res.data
  } catch {
    return { th: '', en: '' }
  }
}

export async function getAboutImages(): Promise<string[]> {
  try {
    const res = await apiFetch<ApiResponse<string[]>>('/api/settings/about-images', {
      next: { revalidate: CMS_REVALIDATE, tags: ['landing', 'about'] },
    })
    return res.data
  } catch {
    return []
  }
}
