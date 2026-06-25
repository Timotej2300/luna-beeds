'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import { Plus, Pencil, Trash2, Search, Package } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import type { Product } from '@/types'
import ProductFormModal from '@/components/admin/ProductFormModal'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)

  const load = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('products')
      .select('*, images:product_images(*), category:categories(name)')
      .order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Naozaj vymazať produkt?')) return
    const supabase = createClient()
    await supabase.from('products').delete().eq('id', id)
    toast.success('Produkt vymazaný')
    load()
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-[#880E4F]">Produkty</h1>
          <p className="text-gray-500 mt-1">{products.length} produktov celkom</p>
        </div>
        <button onClick={() => { setEditing(null); setModalOpen(true) }}
          className="flex items-center gap-2 bg-[#C2185B] text-white px-5 py-2.5 rounded-2xl font-medium hover:bg-[#880E4F] transition-colors shadow-soft"
        >
          <Plus className="w-4 h-4" /> Pridať produkt
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Hľadať produkty..."
          className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-gray-200 outline-none focus:border-[#C2185B] focus:ring-2 focus:ring-[#FFB6D9]/30 shadow-soft"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-soft border border-pink-50 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#FFF0F7]">
              {['Produkt', 'Kategória', 'Cena', 'Sklad', 'Aktívny', 'Akcie'].map(h => (
                <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-[#C2185B] uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-pink-50">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(6)].map((_, j) => (
                    <td key={j} className="px-6 py-4"><div className="h-4 bg-gray-100 rounded-xl animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-16 text-gray-400">
                <Package className="w-12 h-12 mx-auto mb-3 text-[#FFB6D9]" />
                Žiadne produkty
              </td></tr>
            ) : filtered.map(product => (
              <tr key={product.id} className="hover:bg-[#FFF8FB] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#FFF0F7] rounded-xl overflow-hidden relative shrink-0">
                      {product.images?.[0] ? (
                        <Image src={product.images[0].url} alt={product.name} fill className="object-cover" />
                      ) : <div className="absolute inset-0 flex items-center justify-center text-xl">💎</div>}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{product.name}</p>
                      <p className="text-xs text-gray-400">{product.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{(product.category as any)?.name || '—'}</td>
                <td className="px-6 py-4 text-sm font-semibold text-[#C2185B]">{formatPrice(product.price)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${product.stock > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                    {product.stock} ks
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className={`w-5 h-5 rounded-full ${product.is_active ? 'bg-emerald-400' : 'bg-gray-300'}`} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => { setEditing(product); setModalOpen(true) }}
                      className="p-2 rounded-xl bg-[#FFF0F7] text-[#C2185B] hover:bg-[#FFB6D9]/30 transition-colors"
                    ><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(product.id)}
                      className="p-2 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 transition-colors"
                    ><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ProductFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} product={editing} onSave={load} />
    </div>
  )
}
