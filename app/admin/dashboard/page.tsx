import { createClient } from '@/lib/supabase/server'
import { formatPrice, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils'
import { ShoppingCart, Users, Package, TrendingUp, ArrowUp } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard | Admin' }

async function getStats() {
  try {
    const supabase = await createClient()
    const today = new Date().toISOString().split('T')[0]
    const [orders, customers, products, todayOrders] = await Promise.all([
      supabase.from('orders').select('id, total, status, created_at').order('created_at', { ascending: false }),
      supabase.from('auth.users').select('id', { count: 'exact', head: true }),
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('orders').select('total').gte('created_at', today),
    ])
    const allOrders = orders.data || []
    return {
      total_orders: allOrders.length,
      total_revenue: allOrders.filter(o => o.status !== 'cancelled').reduce((s: number, o: any) => s + o.total, 0),
      total_customers: customers.count || 0,
      total_products: products.count || 0,
      orders_today: todayOrders.data?.length || 0,
      revenue_today: todayOrders.data?.reduce((s: number, o: any) => s + o.total, 0) || 0,
      recent_orders: allOrders.slice(0, 8),
    }
  } catch { return { total_orders: 0, total_revenue: 0, total_customers: 0, total_products: 0, orders_today: 0, revenue_today: 0, recent_orders: [] } }
}

export default async function DashboardPage() {
  const stats = await getStats()

  const cards = [
    { label: 'Celkové objednávky', value: stats.total_orders, sub: `+${stats.orders_today} dnes`, icon: ShoppingCart, color: '#C2185B' },
    { label: 'Celkové tržby', value: formatPrice(stats.total_revenue), sub: `+${formatPrice(stats.revenue_today)} dnes`, icon: TrendingUp, color: '#880E4F' },
    { label: 'Zákazníci', value: stats.total_customers, sub: 'Registrovaní', icon: Users, color: '#FFB6D9' },
    { label: 'Aktívne produkty', value: stats.total_products, sub: 'V obchode', icon: Package, color: '#FF8EC7' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-[#880E4F]">Dashboard</h1>
        <p className="text-gray-500 mt-1">Vitajte v administrácii Luna&Beeds</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-3xl shadow-soft p-6 border border-pink-50">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: card.color + '20' }}>
                <card.icon className="w-6 h-6" style={{ color: card.color }} />
              </div>
              <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-full">
                <ArrowUp className="w-3 h-3" /> +12%
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{card.value}</p>
            <p className="text-sm text-gray-500 mt-1">{card.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-3xl shadow-soft border border-pink-50 overflow-hidden">
        <div className="p-6 border-b border-pink-100">
          <h2 className="font-display font-semibold text-[#880E4F]">Posledné objednávky</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#FFF0F7]">
                {['ID', 'Zákazník', 'Dátum', 'Suma', 'Stav'].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-[#C2185B] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-50">
              {stats.recent_orders.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">Žiadne objednávky</td></tr>
              ) : stats.recent_orders.map((order: any) => (
                <tr key={order.id} className="hover:bg-[#FFF8FB] transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-gray-500">#{order.id.slice(0, 8)}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{order.shipping_address?.first_name} {order.shipping_address?.last_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(order.created_at)}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-800">{formatPrice(order.total)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${ORDER_STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {ORDER_STATUS_LABELS[order.status] || order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
