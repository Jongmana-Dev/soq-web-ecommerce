import { apiFetch } from './api'

export interface ProductSize {
  id: string
  label_th: string
  label_en: string
  volume: string
  price: number
  stock?: number
  sku?: string
}

export interface ProductData {
  id: string
  slug: string
  name_th: string
  name_en: string
  short_desc_th: string
  short_desc_en: string
  long_desc_th?: string | null
  long_desc_en?: string | null
  image: string
  sizes: ProductSize[]
}

interface ApiResponse<T> {
  data: T
  meta?: { total: number }
}

export async function getProducts(): Promise<ProductData[]> {
  const res = await apiFetch<ApiResponse<ProductData[]>>('/api/products', {
    next: { revalidate: 300 },
  })
  return res.data
}

export async function getProductBySlug(slug: string): Promise<ProductData | undefined> {
  try {
    const res = await apiFetch<ApiResponse<ProductData>>(`/api/products/${slug}`, {
      next: { revalidate: 300 },
    })
    return res.data
  } catch {
    return undefined
  }
}
