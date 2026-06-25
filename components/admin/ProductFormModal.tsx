'use client'
import { useEffect, useState } from 'react'
import Modal from '@/components/ui/Modal'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Product, Category } from '@/types'

interface Props { isOpen: boolean; onClose: () => void; product: Product | null; onSave: () => void }

export default function ProductFormModal({ isOpen, onClose, product, onSave }: Props) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', slug: '', description: '', price: '', compare_price: '',
    stock: '', category_id: '', is_active: true, is_featured: false, tags: '',
  })

  useEffect(() => {
    const loadCategories = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('categories').select('*').eq('is_active', true)
      setCategories(data || [])
    }
    loadCategories()
  }, [])

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name, slug: product.slug, description: product.description,
        price: String(product.price), compare_price: String(product.compare_price || ''),
        stock: String(product.stock), category_id: product.category_id,
        is_active: product.is_active, is_featured: product.is_featured,
        tags: product.tags?.join(', ') || '',
      })
    } else {
      setForm({ name: '', slug: '', description: '', price: '', compare_price: '', stock: '0', category_id: '', is_active: true, is_featured: false, tags: '' })
    }
  }, [product, isOpen])

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const data = {
      name: form.name, slug: form.slug || slugify(form.name),
      description: form.description, price: Number(form.price),
      compare_price: form.compare_price ? Number(form.compare_price) : null,
      stock: Number(form.stock), category_id: form.category_id || null,
      is_active: form.is_active, is_featured: form.is_featured,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    }
    const { error } = product
      ? await supabase.from('products').update(data).eq('id', product.id)
      : await supabase.from('products').insert(data)

    if (error) { toast.error(error.message); setLoading(false); return }
    toast.success(product ? 'Produkt aktualizovaný!' : 'Produkt pridaný!')
    onSave(); onClose()
    setLoading(false)
  }

  const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#C2185B] focus:ring-2 focus:ring-[#FFB6D9]/20 text-sm'
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={product ? 'Upraviť produkt' : 'Nový produkt'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={labelCls}>Názov *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))}
              required className={inputCls} placeholder="Ružový naramok z perál" />
          </div>
          <div className="col-span-2">
            <label className={labelCls}>Slug</label>
            <input value={form.slug} onChange={set('slug')} className={inputCls} placeholder="ruzovy-naramok-z-peral" />
          </div>
          <div className="col-span-2">
            <label className={labelCls}>Popis</label>
            <textarea value={form.description} onChange={set('description')} rows={3}
              className={inputCls + ' resize-none'} placeholder="Popis produktu..." />
          </div>
          <div>
            <label className={labelCls}>Cena (€) *</label>
            <input type="number" step="0.01" value={form.price} onChange={set('price')} required className={inputCls} placeholder="9.99" />
          </div>
          <div>
            <label className={labelCls}>Pôvodná cena (€)</label>
            <input type="number" step="0.01" value={form.compare_price} onChange={set('compare_price')} className={inputCls} placeholder="14.99" />
          </div>
          <div>
            <label className={labelCls}>Sklad *</label>
            <input type="number" value={form.stock} onChange={set('stock')} required className={inputCls} placeholder="10" />
          </div>
          <div>
            <label className={labelCls}>Kategória</label>
            <select value={form.category_id} onChange={set('category_id')} className={inputCls}>
              <option value="">-- bez kategórie --</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className={labelCls}>Tagy (oddelené čiarkou)</label>
            <input value={form.tags} onChange={set('tags')} className={inputCls} placeholder="naramok, perla, ruzova" />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="is_active" checked={form.is_active}
              onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
              className="w-4 h-4 accent-[#C2185B]" />
            <label htmlFor="is_active" className="text-sm text-gray-700">Aktívny</label>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="is_featured" checked={form.is_featured}
              onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))}
              className="w-4 h-4 accent-[#C2185B]" />
            <label htmlFor="is_featured" className="text-sm text-gray-700">Odporúčaný</label>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-2xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium">
            Zrušiť
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 py-2.5 rounded-2xl bg-[#C2185B] text-white hover:bg-[#880E4F] transition-colors text-sm font-semibold disabled:opacity-50"
          >
            {loading ? 'Ukladám...' : product ? 'Uložiť zmeny' : 'Pridať produkt'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
