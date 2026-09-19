'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Store, LogOut, Receipt, ShoppingBag, Package } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import PosProductGrid from './PosProductGrid'
import PosCart from './PosCart'
import PosCheckout from './PosCheckout'
import PosCustomPaymentModal from './PosCustomPaymentModal'
import PosReserveModal from './PosReserveModal'
import type { PosCartItem, ValidatedCoupon } from '@/types/pos'
import type { Store as StoreType } from '@/types/pos'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  price: number
  stock: number
  category_id: string
  product_images: { url: string; position: number }[]
}

interface Props {
  store: StoreType
  user: { id: string; firstName: string; lastName: string }
  products: Product[]
  categories: { id: string; name: string; slug: string }[]
  inventoryMap: Record<string, number>
  permissions: string[]
}

export default function PosTerminal({ store, user, products, categories, inventoryMap, permissions }: Props) {
  const router = useRouter()
  const [items, setItems] = useState<PosCartItem[]>([])
  const [coupon, setCoupon] = useState<ValidatedCoupon | null>(null)
  const [showCheckout, setShowCheckout] = useState(false)
  const [showCustom, setShowCustom] = useState(false)
  const [reserveProduct, setReserveProduct] = useState<Product | null>(null)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const addProduct = useCallback((product: Product) => {
    const existing = items.find(i => i.type === 'product' && i.product_id === product.id)
    if (existing) {
      setItems(prev => prev.map(i =>
        i.key === existing.key
          ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.unit_price }
          : i
      ))
    } else {
      const img = product.product_images?.sort((a, b) => a.position - b.position)[0]?.url
      setItems(prev => [...prev, {
        key: `product-${product.id}`,
        type: 'product',
        product_id: product.id,
        name: product.name,
        quantity: 1,
        unit_price: product.price,
        total: product.price,
        image_url: img,
      }])
    }
    toast.success(`${product.name} pridaný`, { duration: 1500 })
  }, [items])

  const addCustom = useCallback((item: Omit<PosCartItem, 'key'>) => {
    const key = `custom-${Date.now()}`
    setItems(prev => [...prev, { ...item, key }])
  }, [])

  const updateQty = useCallback((key: string, qty: number) => {
    if (qty <= 0) {
      setItems(prev => prev.filter(i => i.key !== key))
    } else {
      setItems(prev => prev.map(i =>
        i.key === key ? { ...i, quantity: qty, total: qty * i.unit_price } : i
      ))
    }
  }, [])

  const removeItem = useCallback((key: string) => {
    setItems(prev => prev.filter(i => i.key !== key))
  }, [])

  const handleComplete = async (amountPaid: number, customerEmail: string, note: string) => {
    const idempotencyKey = `${user.id}-${store.id}-${Date.now()}`
    const subtotal = items.reduce((s, i) => s + i.total, 0)

    const res = await fetch('/api/pos/sale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        store_id: store.id,
        items: items.map(i => ({
          type: i.type,
          product_id: i.product_id ?? null,
          name: i.name,
          quantity: i.quantity,
          unit_price: i.unit_price,
          total: i.total,
        })),
        payment_method: 'cash',
        amount_paid: amountPaid,
        coupon_id: coupon?.id ?? null,
        coupon_code: coupon?.code ?? null,
        coupon_discount: coupon?.discount ?? 0,
        customer_email: customerEmail || null,
        note: note || null,
        idempotency_key: idempotencyKey,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      toast.error(data.error || 'Chyba pri vytváraní predaja')
      return
    }

    setShowCheckout(false)
    setItems([])
    setCoupon(null)
    router.push(`/pos/${store.slug}/success?sale_id=${data.sale_id}`)
  }

  const totalItems = items.reduce((s, i) => s + i.quantity, 0)
  const totalPrice = items.reduce((s, i) => s + i.total, 0)

  return (
    <div className="flex flex-col h-screen bg-[#FFF8FB]">
      {/* Header */}
      <header className="bg-white border-b border-pink-100 px-4 py-3 flex items-center justify-between shadow-soft shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/pos" className="p-2 rounded-xl text-gray-400 hover:text-[#C2185B] hover:bg-[#FFF0F7] transition-colors">
            <Store className="w-5 h-5" />
          </Link>
          <div>
            <div className="font-display font-bold text-[#C2185B] text-sm leading-tight">Luna&Beeds POS</div>
            <div className="text-xs text-gray-500">{store.name}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {permissions.includes('pos_store_orders') && (
            <Link href={`/pos/${store.slug}/orders`}
              className="p-2 rounded-xl text-gray-400 hover:text-[#C2185B] hover:bg-[#FFF0F7] transition-colors">
              <Package className="w-5 h-5" />
            </Link>
          )}
          <Link href={`/pos/${store.slug}/sales`}
            className="p-2 rounded-xl text-gray-400 hover:text-[#C2185B] hover:bg-[#FFF0F7] transition-colors">
            <Receipt className="w-5 h-5" />
          </Link>
          <button onClick={handleLogout}
            className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Products - left/top */}
        <div className="flex-1 overflow-hidden flex flex-col border-r border-pink-100">
          <PosProductGrid
            products={products}
            categories={categories}
            inventoryMap={inventoryMap}
            onAdd={addProduct}
            onReserve={setReserveProduct}
          />
        </div>

        {/* Cart - right panel (hidden on mobile, shown as bottom sheet) */}
        <div className="hidden lg:flex w-80 xl:w-96 flex-col bg-white border-l border-pink-100">
          <div className="px-4 py-3 border-b border-pink-50 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-[#C2185B]" />
            <span className="font-semibold text-gray-800 text-sm">Košík</span>
            {totalItems > 0 && (
              <span className="ml-auto bg-[#C2185B] text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {totalItems}
              </span>
            )}
          </div>
          <PosCart
            items={items}
            coupon={coupon}
            onUpdateQty={updateQty}
            onRemove={removeItem}
            onRemoveCoupon={() => setCoupon(null)}
          />
          {items.length > 0 && (
            <div className="p-4 border-t border-pink-100">
              <button
                onClick={() => setShowCheckout(true)}
                className="w-full py-4 bg-[#C2185B] text-white rounded-2xl font-bold text-lg hover:bg-[#880E4F] transition-colors active:scale-[0.98] shadow-soft"
              >
                Zaplatiť {totalPrice.toFixed(2)} €
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile bottom bar */}
      {items.length > 0 && (
        <div className="lg:hidden bg-white border-t border-pink-100 p-4 shrink-0">
          <button
            onClick={() => setShowCheckout(true)}
            className="w-full py-4 bg-[#C2185B] text-white rounded-2xl font-bold text-lg hover:bg-[#880E4F] transition-colors active:scale-[0.98] flex items-center justify-center gap-3"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Zaplatiť {totalPrice.toFixed(2)} €</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">{totalItems} ks</span>
          </button>
        </div>
      )}

      {/* Modals */}
      {showCheckout && (
        <PosCheckout
          items={items}
          coupon={coupon}
          storeId={store.id}
          sellerId={user.id}
          onCouponApply={setCoupon}
          onCouponRemove={() => setCoupon(null)}
          onCustomPayment={() => { setShowCheckout(false); setShowCustom(true) }}
          onComplete={handleComplete}
          onClose={() => setShowCheckout(false)}
        />
      )}

      {showCustom && (
        <PosCustomPaymentModal
          onAdd={(item) => { addCustom(item); setShowCheckout(true) }}
          onClose={() => { setShowCustom(false); setShowCheckout(true) }}
        />
      )}

      {reserveProduct && (
        <PosReserveModal
          product={reserveProduct}
          storeId={store.id}
          onClose={() => setReserveProduct(null)}
        />
      )}
    </div>
  )
}
