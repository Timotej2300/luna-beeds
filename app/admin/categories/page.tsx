'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import { slugify } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Category } from '@/types'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState({ name: '', slug: '', description: '', is_active: true })

  const load = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('categories').select('*').order('position')
    setCategories(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openEdit = (cat?: Category) => {
    setEditing(cat || null)
    setForm(cat ? { name: cat.name, slug: cat.slug, description: cat.description || '', is_active: cat.is_active } : { name: '', slug: '', description: '', is_active: true })
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    const data = { ...form, slug: form.slug || slugify(form.name) }
    const { error } = editing
      ? await supabase.from('categories').update(data).eq('id', editing.id)
      : await supabase.from('categories').insert({ ...data, position: categories.length })
    if (error) { toast.error(error.message); return }
    toast.success(editing ? 'Kategória aktualizovaná' : 'Kategória pridaná')
    setModalOpen(false); load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Vymazať kategóriu?')) return
    const supabase = createClient()
    await supabase.from('categories').delete().eq('id', id)
    toast.success('Kategória vymazaná'); load()
  }

  const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#C2185B] focus:ring-2 focus:ring-[#FFB6D9]/20 text-sm'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-[#880E4F]">Kategórie</h1>
          <p className="text-gray-500 mt-1">{categories.length} kategórií</p>
        </div>
        <button onClick={() => openEdit()}
          className="flex items-center gap-2 bg-[#C2185B] text-white px-5 py-2.5 rounded-2xl font-medium hover:bg-[#880E4F] transition-colors shadow-soft"
        ><Plus className="w-4 h-4" /> Pridať kategóriu</button>
      </div>

      <div className="bg-white rounded-3xl shadow-soft border border-pink-50 overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-[#FFF0F7]">
            {['Názov', 'Slug', 'Aktívna', 'Akcie'].map(h => <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-[#C2185B] uppercase tracking-wider">{h}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-pink-50">
            {loading ? [...Array(3)].map((_, i) => <tr key={i}>{[...Array(4)].map((_, j) => <td key={j} className="px-6 py-4"><div className="h-4 bg-gray-100 rounded-xl animate-pulse" /></td>)}</tr>)
            : categories.map(cat => (
              <tr key={cat.id} className="hover:bg-[#FFF8FB] transition-colors">
                <td className="px-6 py-4 font-medium text-gray-800 text-sm">{cat.name}</td>
                <td className="px-6 py-4 text-sm font-mono text-gray-400">{cat.slug}</td>
                <td className="px-6 py-4"><div className={`w-5 h-5 rounded-full ${cat.is_active ? 'bg-emerald-400' : 'bg-gray-300'}`} /></td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(cat)} className="p-2 rounded-xl bg-[#FFF0F7] text-[#C2185B] hover:bg-[#FFB6D9]/30 transition-colors"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(cat.id)} className="p-2 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Upraviť kategóriu' : 'Nová kategória'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Názov *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))} required className={inputCls} placeholder="Naramky" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className={inputCls} placeholder="naramky" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Popis</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className={inputCls + ' resize-none'} />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="cat_active" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 accent-[#C2185B]" />
            <label htmlFor="cat_active" className="text-sm text-gray-700">Aktívna</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-2xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm">Zrušiť</button>
            <button type="submit" className="flex-1 py-2.5 rounded-2xl bg-[#C2185B] text-white hover:bg-[#880E4F] text-sm font-semibold">{editing ? 'Uložiť' : 'Pridať'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
