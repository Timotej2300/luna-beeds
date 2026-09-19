'use client'
import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { formatPrice, formatDate } from '@/lib/utils'
import { STORE_ORDER_STATUS_LABELS, STORE_ORDER_STATUS_COLORS } from '@/types/pos'
import type { StoreOrder, StoreOrderStatus } from '@/types/pos'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { useParams } from 'next/navigation'

export default function PosOrdersPage() {
  const params = useParams()
  const storeSlug = params.store as string
  const [orders, setOrders] = useState<StoreOrder[]>([])
  const [storeId, setStoreId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: store } = await supabase.from('stores').select('id').eq('slug', storeSlug).single()
      if (!store) return
      setStoreId(store.id)
      const { data } = await supabase
        .from('store_orders')
        .select('*, products(name, price, product_images(url, position))')
        .eq('store_id', store.id)
        .order('created_at', { ascending: false })
      setOrders((data as any) ?? [])
      setLoading(false)
    }
    load()
  }, [storeSlug])

  const updateStatus = async (id: string, status: StoreOrderStatus) => {
    const res = await fetch('/api/pos/store-order', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    if (!res.ok) { toast.error('Chyba'); return }
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
    toast.success('Stav aktualizovaný')
  }

  return (
    <div className="min-h-screen bg-[#FFF8FB]">
      <header className="bg-white border-b border-pink-100 px-4 py-3 flex items-center gap-3">
        <Link href={`/pos/${storeSlug}`} className="p-2 rounded-xl text-gray-400 hover:text-[#C2185B] hover:bg-[#FFF0F7]">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="font-display font-bold text-[#C2185B] text-sm">Objednávky predajne</div>
      </header>

      <div className="p-4 space-y-3 max-w-2xl mx-auto">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-pink-50 p-4 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-2/3" />
            </div>
          ))
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">📦</div>
            <p>Žiadne objednávky</p>
          </div>
        ) : orders.map(order => (
          <div key={order.id} className="bg-white rounded-2xl border border-pink-50 shadow-soft p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-mono font-bold text-[#C2185B] text-sm">{order.order_number}</div>
                <div className="text-xs text-gray-400">{formatDate(order.created_at)}</div>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STORE_ORDER_STATUS_COLORS[order.status]}`}>
                {STORE_ORDER_STATUS_LABELS[order.status]}
              </span>
            </div>

            <div className="text-sm text-gray-700 mb-3">
              <div className="font-medium">{(order as any).products?.name}</div>
              <div className="text-gray-500">
                {order.quantity} ks · {formatPrice(order.unit_price)}
              </div>
            </div>

            <div className="border-t border-pink-50 pt-3 mb-3">
              <div className="text-sm font-medium text-gray-800">{order.customer_name}</div>
              {order.customer_email && <div className="text-xs text-gray-400">✉️ {order.customer_email}</div>}
              {order.customer_phone && <div className="text-xs text-gray-400">📞 {order.customer_phone}</div>}
            </div>

            {/* Status update */}
            <select
              value={order.status}
              onChange={e => updateStatus(order.id, e.target.value as StoreOrderStatus)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#C2185B] bg-white"
            >
              {Object.entries(STORE_ORDER_STATUS_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}
