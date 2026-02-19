export type OrderStatus = 'pending_payment' | 'confirm_payment' | 'shipped' | 'delivered' | 'cancel_order' | 'expire'
export type PaymentStatus = 'pending' | 'confirmed' | 'rejected'

export interface OrderItem {
  id: string
  product_name: string
  size_label: string
  unit_price: number
  quantity: number
  subtotal: number
}

export interface Payment {
  id: string
  method: string
  amount: number
  status: PaymentStatus
  created_at: string
  confirmed_at: string | null
}

export interface Order {
  id: string
  order_number: string
  status: OrderStatus
  customer_name: string
  customer_phone: string
  shipping_address: string
  shipping_province: string
  shipping_postal_code: string
  subtotal: number
  shipping_fee: number
  remote_area_fee: number
  discount: number
  total: number
  note: string | null
  referral_source: string | null
  tax_invoice: boolean
  tax_info: { name: string; tax_id: string; address: string } | null
  items: OrderItem[]
  payments: Payment[]
  expired_at: string | null
  created_at: string
  updated_at: string
}
