'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Pencil, Store, ExternalLink } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import toast from 'react-hot-toast'
import type { Store as StoreType } from '@/types/pos'

export default function AdminStoresPage() {
  const [stores, setStores] = useState<StoreType[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<StoreType | null>(null)
  const [form, setForm] = useState({ name: '', address: '', city: '', phone: '', email: '', is_active: true })

  const load = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('stores').select('*').order('created_at', { ascending: false })
    setStores(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openEdit = (s?: StoreType) => {
    setEditing(s || null)
    setForm(s
      ? { name: s.name, address: s.address ?? '', city: s.city ?? '', phone: s.phone ?? '', email: s.email ?? '', is_active: s.is_active }
      : { name: '', address: '', city: '', phone: '', email: '', is_active: true }
    )
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    const slug = form.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').trim()
    const payload = { ...form, slug }
    const { error } = editing
      ? await supabase.from('stores').update(payload).eq('id', editing.id)
      : await supabase.from('stores').insert(payload)
    if (error) { toast.error(error.message); return }
    toast.success('Uložené!'); setModalOpen(false); load()
  }

  const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#C2185B] focus:ring-2 focus:ring-[#FFB6D9]/20 text-sm'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-[#880E4F]">Predajne</h1>
          <p className="text-gray-500 mt-1">{stores.length} predajní</p>
        </div>
        <div className="flex gap-3">
          <a href="/pos" target="_blank"
            className="flex items-center gap-2 border border-[#C2185B] text-[#C2185B] px-4 py-2.5 rounded-2xl text-sm font-medium hover:bg-[#FFF0F7] transition-colors">
            <ExternalLink className="w-4 h-4" /> Otvoriť POS
          </a>
          <button onClick={() => openEdit()}
            className="flex items-center gap-2 bg-[#C2185B] text-white px-5 py-2.5 rounded-2xl font-medium hover:bg-[#880E4F] transition-colors shadow-soft">
            <Plus className="w-4 h-4" /> Nová predajňa
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-3xl p-5 border border-pink-50 animate-pulse h-40" />)
        ) : stores.length === 0 ? (
          <div className="col-span-full text-center py-16 text-gray-400">
            <Store className="w-12 h-12 mx-auto mb-3 text-[#FFB6D9]" />
            <p>Žiadne predajne</p>
          </div>
        ) : stores.map(s => (
          <div key={s.id} className="bg-white rounded-3xl p-5 border border-pink-50 shadow-soft hover:shadow-card transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-[#FFF0F7] rounded-xl flex items-center justify-center">
                <Store className="w-5 h-5 text-[#C2185B]" />
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${s.is_active ? 'bg-green-400' : 'bg-gray-300'}`} />
                <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg text-gray-400 hover:text-[#C2185B] hover:bg-[#FFF0F7] transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{s.name}</h3>
            {s.city && <div className="text-sm text-gray-500">{s.city}</div>}
            {s.address && <div className="text-xs text-gray-400">{s.address}</div>}
            {s.phone && <div className="text-xs text-gray-400 mt-1">{s.phone}</div>}
            {s.email && <div className="text-xs text-gray-400">{s.email}</div>}
            <a href={`/pos/${s.slug}`} target="_blank"
              className="mt-3 text-xs text-[#C2185B] hover:underline flex items-center gap-1">
              <ExternalLink className="w-3 h-3" /> Otvoriť POS
            </a>
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Upraviť predajňu' : 'Nová predajňa'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Názov *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className={inputCls} placeholder="Predajňa Spišská Belá" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mesto</label>
              <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className={inputCls} placeholder="Spišská Belá" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresa</label>
              <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className={inputCls} placeholder="Hlavná 1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefón</label>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputCls} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="store_active" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 accent-[#C2185B]" />
            <label htmlFor="store_active" className="text-sm text-gray-700">Aktívna</label>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-2xl border border-gray-200 text-gray-600 text-sm">Zrušiť</button>
            <button type="submit" className="flex-1 py-2.5 rounded-2xl bg-[#C2185B] text-white hover:bg-[#880E4F] text-sm font-semibold">Uložiť</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
