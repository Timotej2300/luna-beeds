'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils'
import { Search, Eye, X, Sparkles } from 'lucide-react'
import type { Order, OrderStatus } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'

const STATUSES: OrderStatus[] = ['new', 'processing', 'paid', 'shipped', 'delivered', 'returned', 'cancelled']

function CustomBraceletPreview({ options }: { options: any }) {
  if (!options) return null
  return (
    <div className="bg-gradient-to-br from-[#FFF0F7] to-[#FFD6EC] rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-[#C2185B]" />
        <span className="text-sm font-semibold text-[#C2185B]">Custom Naramok</span>
      </div>

      {/* Bead preview */}
      {options.beads?.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-1.5">Koráiky ({options.beads.length}x):</p>
          <div className="flex flex-wrap gap-1.5">
            {options.beads.map((bead: any, i: number) => (
              <div key={i} title={bead.name}
                className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: bead.color }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Letters */}
      {options.letters && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-1.5">Písmená:</p>
          <div className="flex gap-1">
            {options.letters.split('').map((l: string, i: number) => (
              <span key={i} className="w-6 h-6 bg-[#C2185B] text-white text-xs font-bold rounded flex items-center justify-center">
                {l}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Charms */}
      {options.charms?.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-1.5">Prívesky:</p>
          <div className="flex gap-2">
            {options.charms.map((charm: any, i: number) => (
              <span key={i} className="text-xl" title={charm.name}>{charm.icon}</span>
            ))}
          </div>
        </div>
      )}

      {/* Size & Price */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-pink-200">
        <span className="text-xs text-gray-500">Veľkosť: <strong>{options.size}</strong></span>
        <span className="text-sm font-bold text-[#C2185B]">{formatPrice(options.total_price)}</span>
      </div>
    </div>
  )
}

function OrderDetailModal({ order, onClose }: { order: any; onClose: () => void }) {
  const addr = order.shipping_address as any
  const items = order.items as any[] || []

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={onClose}
      />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-3xl shadow-[0_8px_40px_rgba(194,24,91,0.15)] z-50 p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#880E4F]">Objednávka #{order.id.slice(0, 8)}</h2>
            <p className="text-sm text-gray-400">{formatDate(order.created_at)}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-[#FFF0F7] text-gray-400 hover:text-[#C2185B] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Zákazník */}
          <div className="bg-[#FFF0F7] rounded-2xl p-4">
            <h3 className="font-semibold text-[#C2185B] mb-3 text-sm">Zákazník</h3>
            <div className="space-y-1 text-sm text-gray-700">
              <p><strong>{addr?.first_name} {addr?.last_name}</strong></p>
              <p>{addr?.email}</p>
              <p>{addr?.phone}</p>
              <p className="mt-2">{addr?.street}</p>
              <p>{addr?.zip} {addr?.city}</p>
              <p>{addr?.country}</p>
            </div>
          </div>

          {/* Platba & Doprava */}
          <div className="bg-[#FFF0F7] rounded-2xl p-4">
            <h3 className="font-semibold text-[#C2185B] mb-3 text-sm">Platba & Doprava</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Platba:</span>
                <span className="font-medium capitalize">{order.payment_method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status platby:</span>
                <span className="font-medium">{order.payment_status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Medzisúčet:</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Doprava:</span>
                <span>{formatPrice(order.shipping_cost)}</span>
              </div>
              <div className="flex justify-between font-bold text-[#C2185B] text-base border-t border-pink-200 pt-2 mt-2">
                <span>Celkom:</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Produkty */}
        {items.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-[#C2185B] mb-3 text-sm">Produkty</h3>
            <div className="space-y-3">
              {items.map((item: any, i: number) => (
                <div key={i} className="border border-pink-100 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {item.custom_options && <Sparkles className="w-4 h-4 text-[#C2185B]" />}
                      <span className="font-medium text-sm text-gray-800">
                        {item.custom_options ? 'Custom Naramok' : `Produkt #${item.product_id?.slice(0, 8)}`}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-400">×{item.quantity}</span>
                      <span className="ml-2 font-bold text-[#C2185B]">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                  {item.custom_options && (
                    <CustomBraceletPreview options={item.custom_options} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Poznámka */}
        {order.note && (
          <div className="mt-4 bg-yellow-50 rounded-2xl p-4">
            <p className="text-xs font-semibold text-yellow-700 mb-1">Poznámka zákazníka:</p>
            <p className="text-sm text-yellow-800">{order.note}</p>
          </div>
        )}
      </motion.div>
    </>
  )
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

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

  const hasCustom = (order: any) => {
    const items = order.items as any[] || []
    return items.some((i: any) => i.custom_options)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#880E4F]">Objednávky</h1>
        <p className="text-gray-500 mt-1">{orders.length} objednávok celkom</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Hľadať objednávky..."
            className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-gray-200 outline-none focus:border-[#C2185B] focus:ring-2 focus:ring-[#FFB6D9]/30 shadow-sm"
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

      <div className="bg-white rounded-3xl shadow-sm border border-pink-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#FFF0F7]">
                {['#ID', 'Zákazník', 'Produkty', 'Dátum', 'Suma', 'Platba', 'Stav', 'Detail'].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-[#C2185B] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-50">
              {loading ? [...Array(5)].map((_, i) => (
                <tr key={i}>{[...Array(8)].map((_, j) => <td key={j} className="px-6 py-4"><div className="h-4 bg-gray-100 rounded-xl animate-pulse" /></td>)}</tr>
              )) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-16 text-gray-400">Žiadne objednávky</td></tr>
              ) : filtered.map(order => {
                const addr = order.shipping_address as any
                const isCustom = hasCustom(order)
                const items = (order.items as any[]) || []
                return (
                  <tr key={order.id} className="hover:bg-[#FFF8FB] transition-colors">
                    <td className="px-6 py-4 text-xs font-mono text-gray-400">#{order.id.slice(0, 8)}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-800">{addr?.first_name} {addr?.last_name}</p>
                      <p className="text-xs text-gray-400">{addr?.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-gray-500">{items.length} položiek</span>
                        {isCustom && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#FFF0F7] text-[#C2185B] text-xs rounded-lg font-medium w-fit">
                            <Sparkles className="w-3 h-3" /> Custom
                          </span>
                        )}
                      </div>
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
                      <button onClick={() => setSelectedOrder(order)}
                        className="p-2 rounded-xl bg-[#FFF0F7] text-[#C2185B] hover:bg-[#FFB6D9]/30 transition-colors"
                      >
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

      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}
