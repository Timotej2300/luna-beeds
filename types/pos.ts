export type Store = {
  id: string
  name: string
  slug: string
  address?: string
  city?: string
  phone?: string
  email?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export type StoreUser = {
  id: string
  store_id: string
  user_id: string
  created_at: string
}

export type StoreInventory = {
  id: string
  store_id: string
  product_id: string
  stock: number
  updated_at: string
}

export type PosSaleItem = {
  id?: string
  sale_id?: string
  type: 'product' | 'custom'
  product_id?: string
  name: string
  quantity: number
  unit_price: number
  total: number
}

// Položka v POS košíku (pred vytvorením sale)
export type PosCartItem = {
  key: string // unikátny kľúč v košíku
  type: 'product' | 'custom'
  product_id?: string
  name: string
  quantity: number
  unit_price: number
  total: number
  image_url?: string
}

export type PosSale = {
  id: string
  sale_number: string
  store_id: string
  store?: Store
  seller_id: string
  subtotal: number
  discount: number
  total: number
  payment_method: 'cash' | 'card' | 'other'
  amount_paid: number
  change_given: number
  coupon_id?: string
  coupon_code?: string
  coupon_discount: number
  customer_email?: string
  note?: string
  items?: PosSaleItem[]
  created_at: string
}

export type StoreOrderStatus =
  | 'pending'
  | 'ordered'
  | 'in_transit'
  | 'ready'
  | 'contacted'
  | 'picked_up'
  | 'cancelled'

export type StoreOrder = {
  id: string
  order_number: string
  store_id: string
  store?: Store
  seller_id: string
  product_id: string
  quantity: number
  unit_price: number
  customer_name: string
  customer_email?: string
  customer_phone?: string
  contact_via: string[]
  note?: string
  status: StoreOrderStatus
  payment_status: 'unpaid' | 'paid'
  pos_sale_id?: string
  created_at: string
  updated_at: string
}

export type CouponUsage = {
  id: string
  coupon_id: string
  channel: 'ecommerce' | 'pos'
  sale_id?: string
  order_id?: string
  store_id?: string
  seller_id?: string
  original_total: number
  discount: number
  final_total: number
  created_at: string
}

export type ValidatedCoupon = {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  discount: number
}

export const STORE_ORDER_STATUS_LABELS: Record<StoreOrderStatus, string> = {
  pending: 'Čaká na vybavenie',
  ordered: 'Objednané',
  in_transit: 'Na ceste',
  ready: 'Pripravené na vyzdvihnutie',
  contacted: 'Zákazník kontaktovaný',
  picked_up: 'Vyzdvihnuté',
  cancelled: 'Zrušené',
}

export const STORE_ORDER_STATUS_COLORS: Record<StoreOrderStatus, string> = {
  pending: 'bg-gray-100 text-gray-700',
  ordered: 'bg-blue-100 text-blue-700',
  in_transit: 'bg-yellow-100 text-yellow-700',
  ready: 'bg-green-100 text-green-700',
  contacted: 'bg-purple-100 text-purple-700',
  picked_up: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
}
