'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Pencil, Trash2, Truck } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { ShippingMethod } from '@/types'

export default function AdminShippingPage() {
  const [methods, setMethods] = useState<ShippingMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ShippingMethod | null>(null)
  const [form, setForm] = useState({ name: '', description: '', price: '', delivery_time: '', is_active: true })

  const load = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('shipping_methods').select('*').order('price')
    setMethods(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openEdit = (method?: ShippingMethod) => {
    setEditing(method || null)
    setForm(method
      ? { name: method.name, description: method.description || '', price: String(method.price), delivery_time: method.delivery_time, is_active: method.is_active }
      : { name: '', description: '', price: '', delivery_time: '', is_active: true }
    )
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    const data = { ...form, price: Number(form.price) }
    const { error } = editing
      ? await supabase.from('shipping_methods').update(data).eq('id', editing.id)
      : await supabase.from('shipping_methods').insert(data)
    if (error) { toast.error(error.message); return }
    toast.success('Uložené!'); setModalOpen(false); load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Vymazať spôsob dopravy?')) return
    const supabase = createClient()
    await supabase.from('shipping_methods').delete().eq('id', id)
    toast.success('Vymazané'); load()
  }

  const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#C2185B] focus:ring-2 focus:ring-[#FFB6D9]/20 text-sm'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-[#880E4F]">Doprava</h1>
          <p className="text-gray-500 mt-1">Spravujte spôsoby doručenia</p>
        </div>
        <button onClick={() => openEdit()}
          className="flex items-center gap-2 bg-[#C2185B] text-white px-5 py-2.5 rounded-2xl font-medium hover:bg-[#880E4F] transition-colors shadow-soft"
        ><Plus className="w-4 h-4" /> Pridať spôsob dopravy</button>
      </div>

      <div className="grid gap-4">
        {loading ? [...Array(3)].map((_, i) => <div key={i} className="h-24 bg-white rounded-3xl shadow-soft animate-pulse" />)
        : methods.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl shadow-soft text-gray-400">
            <Truck className="w-12 h-12 mx-auto mb-3 text-[#FFB6D9]" />
            <p>Žiadne spôsoby dopravy</p>
          </div>
        ) : methods.map(method => (
          <div key={method.id} className="bg-white rounded-3xl shadow-soft border border-pink-50 p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#FFF0F7] rounded-2xl flex items-center justify-center">
                <Truck className="w-6 h-6 text-[#C2185B]" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">{method.name}</p>
                <p className="text-sm text-gray-500">{method.description}</p>
                <p className="text-xs text-gray-400 mt-0.5">⏱ {method.delivery_time}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xl font-bold text-[#C2185B]">{formatPrice(method.price)}</span>
              <div className={`w-3 h-3 rounded-full ${method.is_active ? 'bg-emerald-400' : 'bg-gray-300'}`} title={method.is_active ? 'Aktívna' : 'Neaktívna'} />
              <div className="flex gap-2">
                <button onClick={() => openEdit(method)} className="p-2 rounded-xl bg-[#FFF0F7] text-[#C2185B] hover:bg-[#FFB6D9]/30 transition-colors"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(method.id)} className="p-2 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Upraviť dopravu' : 'Nový spôsob dopravy'}>
        <form onSubmit={handleSave} className="space-y-4">
          {[['name', 'Názov *', 'text', 'napr. Packeta'], ['description', 'Popis', 'text', 'Doručenie na výdajné miesto'], ['price', 'Cena (€) *', 'number', '2.99'], ['delivery_time', 'Čas doručenia', 'text', '1-2 pracovné dni']].map(([k, l, t, ph]) => (
            <div key={k}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{l}</label>
              <input type={t} value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                required={l.includes('*')} step={t === 'number' ? '0.01' : undefined}
                className={inputCls} placeholder={ph} />
            </div>
          ))}
          <div className="flex items-center gap-3">
            <input type="checkbox" id="ship_active" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 accent-[#C2185B]" />
            <label htmlFor="ship_active" className="text-sm text-gray-700">Aktívna</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-2xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm">Zrušiť</button>
            <button type="submit" className="flex-1 py-2.5 rounded-2xl bg-[#C2185B] text-white hover:bg-[#880E4F] text-sm font-semibold">Uložiť</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
