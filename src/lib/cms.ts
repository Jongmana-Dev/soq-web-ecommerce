import { apiFetch } from './api'

export interface Certification {
  id: string
  icon: string
  label_th: string
  label_en: string
  description_th: string
  description_en: string
  pdf_url: string | null
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
  video_url: string | null
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

export async function getReviews(): Promise<Review[]> {
  try {
    const res = await apiFetch<ApiResponse<Review[]>>('/api/cms/reviews', {
      next: { revalidate: 3600, tags: ['landing'] },
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
      { next: { revalidate: 3600, tags: ['landing'] } },
    )
    return res.data
  } catch {
    return []
  }
}

export async function getSettings(): Promise<SiteSetting[]> {
  try {
    const res = await apiFetch<ApiResponse<SiteSetting[]>>('/api/settings', {
      next: { revalidate: 3600, tags: ['landing'] },
    })
    return res.data
  } catch {
    return []
  }
}

export async function getFAQs(): Promise<FAQItem[]> {
  try {
    const res = await apiFetch<ApiResponse<FAQItem[]>>('/api/cms/faqs', {
      next: { revalidate: 3600, tags: ['landing'] },
    })
    return res.data
  } catch {
    return []
  }
}
