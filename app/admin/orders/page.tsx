'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils'
import { Search, Eye } from 'lucide-react'
import type { Order, OrderStatus } from '@/types'

const STATUSES: OrderStatus[] = ['new', 'processing', 'paid', 'shipped', 'delivered', 'returned', 'cancelled']

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const load = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const updateStatus = async (id: string, status: OrderStatus) => {
    const supabase = createClient()
    await supabase.from('orders').update({ status }).eq('id', id)
    setOrders(o => o.map(x => x.id === id ? { ...x, status } : x))
  }

  const filtered = orders.filter(o => {
    const addr = o.shipping_address as any
    const matchSearch = !search || `${addr?.first_name} ${addr?.last_name} ${addr?.email}`.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || o.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-[#880E4F]">Objednávky</h1>
        <p className="text-gray-500 mt-1">{orders.length} objednávok celkom</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Hľadať objednávky..."
            className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-gray-200 outline-none focus:border-[#C2185B] focus:ring-2 focus:ring-[#FFB6D9]/30 shadow-soft"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setStatusFilter('all')}
            className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${statusFilter === 'all' ? 'bg-[#C2185B] text-white' : 'bg-white text-gray-500 hover:bg-[#FFF0F7] border border-gray-200'}`}
          >Všetky</button>
          {STATUSES.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${statusFilter === s ? 'bg-[#C2185B] text-white' : 'bg-white text-gray-500 hover:bg-[#FFF0F7] border border-gray-200'}`}
            >{ORDER_STATUS_LABELS[s]}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-soft border border-pink-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#FFF0F7]">
                {['#ID', 'Zákazník', 'Dátum', 'Suma', 'Platba', 'Stav', 'Akcie'].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-[#C2185B] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-50">
              {loading ? [...Array(5)].map((_, i) => (
                <tr key={i}>{[...Array(7)].map((_, j) => <td key={j} className="px-6 py-4"><div className="h-4 bg-gray-100 rounded-xl animate-pulse" /></td>)}</tr>
              )) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-16 text-gray-400">Žiadne objednávky</td></tr>
              ) : filtered.map(order => {
                const addr = order.shipping_address as any
                return (
                  <tr key={order.id} className="hover:bg-[#FFF8FB] transition-colors">
                    <td className="px-6 py-4 text-xs font-mono text-gray-400">#{order.id.slice(0, 8)}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-800">{addr?.first_name} {addr?.last_name}</p>
                      <p className="text-xs text-gray-400">{addr?.email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(order.created_at)}</td>
                    <td className="px-6 py-4 text-sm font-bold text-[#C2185B]">{formatPrice(order.total)}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg capitalize">{order.payment_method}</span>
                    </td>
                    <td className="px-6 py-4">
                      <select value={order.status} onChange={e => updateStatus(order.id, e.target.value as OrderStatus)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-xl border-0 outline-none cursor-pointer ${ORDER_STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <button className="p-2 rounded-xl bg-[#FFF0F7] text-[#C2185B] hover:bg-[#FFB6D9]/30 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
