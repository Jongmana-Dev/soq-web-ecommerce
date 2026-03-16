// ── Products ──
export type ProductSize = {
  id: string
  label_th: string
  label_en: string
  volume: string
  price: number
  stock: number
  sku: string
  is_active: boolean
  sort_order: number
}

export type Product = {
  id: string
  slug: string
  name_th: string
  name_en: string
  short_desc_th: string
  short_desc_en: string
  long_desc_th: string | null
  long_desc_en: string | null
  image: string
  is_active: boolean
  sort_order: number
  sizes: ProductSize[]
  created_at: string
  updated_at: string
}

// ── FAQs ──
export type FAQ = {
  id: string
  question_th: string
  question_en: string
  answer_th: string
  answer_en: string
  icon: string
  sort_order: number
  created_at: string
  updated_at: string
}

// ── Reviews ──
export type Review = {
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
  created_at: string
  updated_at: string
}

// ── Certifications ──
export type Certification = {
  id: string
  icon: string
  label_th: string
  label_en: string
  description_th: string
  description_en: string
  pdf_url: string | null
  document_images: string[]
  sort_order: number
  created_at: string
  updated_at: string
}

// ── Usage Steps ──
export type UsageStep = {
  id: string
  title_th: string
  title_en: string
  description_th: string
  description_en: string
  image: string
  sort_order: number
  created_at: string
  updated_at: string
}

// ── Terms Sections ──
export type TermsSection = {
  id: string
  title_th: string
  title_en: string
  body_th: string
  body_en: string
  sort_order: number
  created_at: string
  updated_at: string
}

// ── Orders ──
export type OrderStatus = 'pending_payment' | 'confirm_payment' | 'shipped' | 'delivered' | 'cancel_order' | 'expire'

export type OrderItem = {
  id: string
  product_id: string
  size_id: string
  product_name: string
  size_label: string
  sku: string
  quantity: number
  unit_price: number
  subtotal: number
}

export type OrderPayment = {
  id: string
  slip_image: string | null
  created_at: string
}

export type Order = {
  id: string
  order_number: string
  user_id: string
  customer_name: string
  customer_phone: string | null
  status: OrderStatus
  subtotal: number
  shipping_fee: number
  remote_area_fee: number
  discount: number
  total: number
  shipping_address: string
  shipping_province: string
  shipping_postal_code: string
  items: OrderItem[]
  payments: OrderPayment[]
  expired_at: string | null
  created_at: string
  updated_at: string
}

// ── Settings ──
export type Setting = {
  key: string
  value: string
  group: string
  description: string | null
}

// ── Payment Accounts ──
export type PaymentAccount = {
  id: string
  type: 'promptpay' | 'bank_transfer'
  account_number: string
  account_name: string
  bank_name: string | null
  bank_branch: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

// ── Shipping ──
export type ShippingRate = {
  id: string
  min_qty: number
  max_qty: number | null
  fee: number
}

export type RemoteProvince = {
  id: string
  province_name: string
  surcharge: number
}

// ── Members ──
export type MemberAddress = {
  id: string
  label: string | null
  recipient_name: string
  phone: string
  address_line: string
  district: string | null
  subdistrict: string | null
  province: string
  postal_code: string
}

export type MemberTaxInfo = {
  name: string
  tax_id: string
  address: string
  note?: string
}

export type Member = {
  id: string
  user_id: string
  name: string | null
  email: string | null
  phone: string | null
  image: string | null
  registered_provider: string
  registered_provider_id: string
  is_active: boolean
  tax_info: MemberTaxInfo | null
  user?: {
    id: string
    name: string | null
    email: string | null
    role: string
    is_active: boolean
  }
  primary_address?: MemberAddress | null
  secondary_address?: MemberAddress | null
  created_at: string
  updated_at: string
}

// ── Client Logos ──
export type ClientLogo = {
  id: string
  name: string
  logo_url: string
  website_url: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

// ── Dashboard ──
export type DashboardStats = {
  orders_today: number
  revenue_today: number
  pending_orders: number
  low_stock_count: number
  total_orders: number
  total_revenue: number
}
