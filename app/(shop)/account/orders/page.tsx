import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatPrice, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils'
import { ShoppingBag } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Moje objednávky' }

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth/login?redirect=/account/orders')

  const { data: ordersData } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  const orders = ordersData || []

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-display font-bold text-[#880E4F] mb-8">Moje objednávky</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-[#FFB6D9]" />
          <p className="text-lg font-medium">Zatiaľ žiadne objednávky</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <div key={order.id} className="bg-white rounded-3xl shadow-soft border border-pink-50 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-sm text-gray-400">#{order.id.slice(0, 8)}</p>
                  <p className="text-sm text-gray-500 mt-1">{formatDate(order.created_at)}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${ORDER_STATUS_COLORS[order.status] || 'bg-gray-100'}`}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                  <p className="text-lg font-bold text-[#C2185B] mt-2">{formatPrice(order.total)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
