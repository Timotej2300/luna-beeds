export type Role = {
  id: string
  name: string
  color: string
  icon: string
  description: string
  hierarchy: number
  permissions: Permission[]
  created_at: string
}

export type Permission = {
  id: string
  key: string
  label: string
  category: string
}

export type AdminUser = {
  id: string
  first_name: string
  last_name: string
  company_email: string
  private_email: string
  role_id: string
  role?: Role
  created_at: string
}

export type Product = {
  id: string
  name: string
  slug: string
  description: string
  price: number
  compare_price?: number
  stock: number
  category_id: string
  category?: Category
  images: ProductImage[]
  is_active: boolean
  is_featured: boolean
  tags: string[]
  weight?: number
  created_at: string
  updated_at: string
}

export type ProductImage = {
  id: string
  product_id: string
  url: string
  alt?: string
  position: number
}

export type Category = {
  id: string
  name: string
  slug: string
  description?: string
  image_url?: string
  parent_id?: string
  is_active: boolean
  position: number
  created_at: string
}

export type CartItem = {
  id: string
  product: Product
  quantity: number
  custom_options?: CustomBraceletOptions
}

export type CustomBraceletOptions = {
  beads: BeadOption[]
  letters: string
  charms: CharmOption[]
  size: string
  color: string
  total_price: number
}

export type BeadOption = {
  id: string
  name: string
  color: string
  price: number
}

export type CharmOption = {
  id: string
  name: string
  icon: string
  price: number
}

export type Order = {
  id: string
  user_id?: string
  status: OrderStatus
  items: OrderItem[]
  shipping_address: Address
  shipping_method: ShippingMethod
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  subtotal: number
  shipping_cost: number
  discount: number
  total: number
  note?: string
  tracking_number?: string
  coupon_id?: string
  created_at: string
  updated_at: string
}

export type OrderStatus =
  | 'new'
  | 'processing'
  | 'paid'
  | 'shipped'
  | 'delivered'
  | 'returned'
  | 'cancelled'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export type PaymentMethod = 'stripe' | 'paypal'

export type OrderItem = {
  id: string
  order_id: string
  product_id: string
  product?: Product
  quantity: number
  price: number
  custom_options?: CustomBraceletOptions
}

export type Address = {
  first_name: string
  last_name: string
  email: string
  phone: string
  street: string
  city: string
  zip: string
  country: string
}

export type ShippingMethod = {
  id: string
  name: string
  description?: string
  price: number
  delivery_time: string
  is_active: boolean
}

export type Announcement = {
  id: string
  title: string
  text: string
  icon?: string
  color: string
  type: AnnouncementType
  date_from?: string
  date_to?: string
  is_active: boolean
  created_at: string
}

export type AnnouncementType =
  | 'maintenance'
  | 'news'
  | 'info'
  | 'sale'
  | 'warning'

export type CustomMessage = {
  id: string
  title: string
  text: string
  icon?: string
  color: string
  priority: number
  date_from?: string
  date_to?: string
  is_active: boolean
  show_on_home: boolean
  show_in_admin: boolean
  show_on_order: boolean
  show_on_checkout: boolean
  show_on_products: boolean
}

export type Coupon = {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  min_order?: number
  max_uses?: number
  uses: number
  date_from?: string
  date_to?: string
  is_active: boolean
}

export type WishlistItem = {
  id: string
  user_id: string
  product_id: string
  product?: Product
  created_at: string
}

export type Review = {
  id: string
  product_id: string
  user_id: string
  rating: number
  text?: string
  is_approved: boolean
  created_at: string
}

export type NewsletterSubscriber = {
  id: string
  email: string
  is_active: boolean
  created_at: string
}

export type Notification = {
  id: string
  user_id: string
  title: string
  text: string
  is_read: boolean
  created_at: string
}

export type DashboardStats = {
  total_orders: number
  total_revenue: number
  total_customers: number
  total_products: number
  orders_today: number
  revenue_today: number
  recent_orders: Order[]
}
