import { z } from 'zod'

// ── Products ──
export const productSizeSchema = z.object({
  id: z.string().optional(),
  label_th: z.string().min(1, 'กรุณากรอกชื่อขนาด (TH)'),
  label_en: z.string().min(1, 'กรุณากรอกชื่อขนาด (EN)'),
  volume: z.string().min(1, 'กรุณากรอกปริมาตร'),
  price: z.coerce.number().min(0, 'ราคาต้องมากกว่า 0'),
  stock: z.coerce.number().int().min(0, 'สต็อกต้องไม่ติดลบ'),
  sku: z.string().min(1, 'กรุณากรอก SKU'),
  sort_order: z.coerce.number().int().default(0),
})

export const productSchema = z.object({
  slug: z.string().min(1, 'กรุณากรอก slug'),
  name_th: z.string().min(1, 'กรุณากรอกชื่อสินค้า (TH)'),
  name_en: z.string().min(1, 'กรุณากรอกชื่อสินค้า (EN)'),
  short_desc_th: z.string().min(1, 'กรุณากรอกรายละเอียด (TH)'),
  short_desc_en: z.string().min(1, 'กรุณากรอกรายละเอียด (EN)'),
  image: z.string().url('กรุณากรอก URL รูปภาพที่ถูกต้อง'),
  sizes: z.array(productSizeSchema).min(1, 'ต้องมีอย่างน้อย 1 ขนาด'),
})

// ── FAQs ──
export const faqSchema = z.object({
  question_th: z.string().min(1, 'กรุณากรอกคำถาม (TH)'),
  question_en: z.string().min(1, 'กรุณากรอกคำถาม (EN)'),
  answer_th: z.string().min(1, 'กรุณากรอกคำตอบ (TH)'),
  answer_en: z.string().min(1, 'กรุณากรอกคำตอบ (EN)'),
  icon: z.string().min(1, 'กรุณากรอกไอคอน'),
  sort_order: z.coerce.number().int().default(0),
})

// ── Reviews ──
export const reviewSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อ'),
  role: z.string().min(1, 'กรุณากรอกตำแหน่ง'),
  avatar: z.string().min(1, 'กรุณาอัพโหลดรูปโปรไฟล์'),
  quote_th: z.string().min(1, 'กรุณากรอกรีวิว (TH)'),
  quote_en: z.string().min(1, 'กรุณากรอกรีวิว (EN)'),
  rating: z.coerce.number().min(1).max(5),
  video_url: z.string().url().nullable().optional(),
  brand_name: z.string().nullable().optional(),
  brand_logo: z.string().nullable().optional(),
  sort_order: z.coerce.number().int().default(0),
})

// ── Certifications ──
export const certificationSchema = z.object({
  icon: z.string().min(1, 'กรุณากรอกไอคอน'),
  label_th: z.string().min(1, 'กรุณากรอกชื่อ (TH)'),
  label_en: z.string().min(1, 'กรุณากรอกชื่อ (EN)'),
  description_th: z.string().min(1, 'กรุณากรอกรายละเอียด (TH)'),
  description_en: z.string().min(1, 'กรุณากรอกรายละเอียด (EN)'),
  pdf_url: z.string().url().nullable().optional(),
  document_images: z.array(z.string().url()).default([]),
  sort_order: z.coerce.number().int().default(0),
})

// ── Usage Steps ──
export const usageStepSchema = z.object({
  title_th: z.string().min(1, 'กรุณากรอกชื่อ (TH)'),
  title_en: z.string().min(1, 'กรุณากรอกชื่อ (EN)'),
  description_th: z.string().min(1, 'กรุณากรอกรายละเอียด (TH)'),
  description_en: z.string().min(1, 'กรุณากรอกรายละเอียด (EN)'),
  image: z.string().min(1, 'กรุณาอัพโหลดรูปภาพ'),
  sort_order: z.coerce.number().int().default(0),
})

// ── Terms Sections ──
export const termsSectionSchema = z.object({
  title_th: z.string().min(1, 'กรุณากรอกหัวข้อ (TH)'),
  title_en: z.string().min(1, 'กรุณากรอกหัวข้อ (EN)'),
  body_th: z.string().min(1, 'กรุณากรอกเนื้อหา (TH)'),
  body_en: z.string().min(1, 'กรุณากรอกเนื้อหา (EN)'),
  sort_order: z.coerce.number().int().default(0),
})

// ── Client Logos ──
export const clientLogoSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อลูกค้า'),
  logo_url: z.string().min(1, 'กรุณาอัพโหลดโลโก้'),
  website_url: z.string().url('URL ไม่ถูกต้อง').nullable().optional(),
  sort_order: z.coerce.number().int().default(0),
})

// ── Payment Accounts ──
export const paymentAccountSchema = z.object({
  type: z.enum(['bank_transfer', 'promptpay']),
  account_number: z.string().min(1, 'กรุณากรอกเลขบัญชี'),
  account_name: z.string().min(1, 'กรุณากรอกชื่อบัญชี'),
  bank_name: z.string().nullable().optional(),
  bank_branch: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
})

// ── Shipping Rates ──
export const shippingRateSchema = z.object({
  min_qty: z.coerce.number().int().min(1),
  max_qty: z.coerce.number().int().nullable().optional(),
  fee: z.coerce.number().min(0),
})

// ── Remote Provinces ──
export const remoteProvinceSchema = z.object({
  province_name: z.string().min(1, 'กรุณากรอกจังหวัด'),
  surcharge: z.coerce.number().min(0),
})

// ── Order status update ──
export const orderStatusSchema = z.object({
  status: z.enum(['pending_payment', 'confirm_payment', 'shipped', 'delivered', 'cancel_order', 'expire']),
})

// ── Settings ──
export const settingSchema = z.object({
  value: z.string(),
})

export type ClientLogoFormData = z.infer<typeof clientLogoSchema>
export type ProductFormData = z.infer<typeof productSchema>
export type FAQFormData = z.infer<typeof faqSchema>
export type ReviewFormData = z.infer<typeof reviewSchema>
export type CertificationFormData = z.infer<typeof certificationSchema>
export type PaymentAccountFormData = z.infer<typeof paymentAccountSchema>
export type ShippingRateFormData = z.infer<typeof shippingRateSchema>
export type RemoteProvinceFormData = z.infer<typeof remoteProvinceSchema>
export type OrderStatusFormData = z.infer<typeof orderStatusSchema>
export type UsageStepFormData = z.infer<typeof usageStepSchema>
export type TermsSectionFormData = z.infer<typeof termsSectionSchema>
