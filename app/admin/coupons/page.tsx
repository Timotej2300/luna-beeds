'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Pencil, Trash2, Ticket } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import { formatPrice, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Coupon } from '@/types'

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Coupon | null>(null)
  const [form, setForm] = useState({ code: '', type: 'percentage' as 'percentage' | 'fixed', value: '', min_order: '', max_uses: '', date_from: '', date_to: '', is_active: true })

  const load = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false })
    setCoupons(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openEdit = (c?: Coupon) => {
    setEditing(c || null)
    setForm(c ? { code: c.code, type: c.type, value: String(c.value), min_order: String(c.min_order || ''), max_uses: String(c.max_uses || ''), date_from: c.date_from || '', date_to: c.date_to || '', is_active: c.is_active }
      : { code: '', type: 'percentage', value: '', min_order: '', max_uses: '', date_from: '', date_to: '', is_active: true })
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    const data = { code: form.code.toUpperCase(), type: form.type, value: Number(form.value), min_order: form.min_order ? Number(form.min_order) : null, max_uses: form.max_uses ? Number(form.max_uses) : null, date_from: form.date_from || null, date_to: form.date_to || null, is_active: form.is_active, uses: 0 }
    const { error } = editing ? await supabase.from('coupons').update(data).eq('id', editing.id) : await supabase.from('coupons').insert(data)
    if (error) { toast.error(error.message); return }
    toast.success('Uložené!'); setModalOpen(false); load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Vymazať kupón?')) return
    const supabase = createClient()
    await supabase.from('coupons').delete().eq('id', id)
    toast.success('Vymazané'); load()
  }

  const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#C2185B] focus:ring-2 focus:ring-[#FFB6D9]/20 text-sm'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-[#880E4F]">Kupóny</h1>
          <p className="text-gray-500 mt-1">{coupons.length} kupónov</p>
        </div>
        <button onClick={() => openEdit()} className="flex items-center gap-2 bg-[#C2185B] text-white px-5 py-2.5 rounded-2xl font-medium hover:bg-[#880E4F] transition-colors shadow-soft">
          <Plus className="w-4 h-4" /> Nový kupón
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-soft border border-pink-50 overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-[#FFF0F7]">
            {['Kód', 'Zľava', 'Min. objednávka', 'Použití', 'Platnosť', 'Aktívny', 'Akcie'].map(h => <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[#C2185B] uppercase tracking-wider">{h}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-pink-50">
            {loading ? [...Array(3)].map((_, i) => <tr key={i}>{[...Array(7)].map((_, j) => <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 rounded-xl animate-pulse" /></td>)}</tr>)
            : coupons.length === 0 ? <tr><td colSpan={7} className="text-center py-16 text-gray-400"><Ticket className="w-12 h-12 mx-auto mb-3 text-[#FFB6D9]" /><p>Žiadne kupóny</p></td></tr>
            : coupons.map(c => (
              <tr key={c.id} className="hover:bg-[#FFF8FB] transition-colors">
                <td className="px-5 py-4"><span className="font-mono font-bold text-[#C2185B] bg-[#FFF0F7] px-2 py-1 rounded-lg text-sm">{c.code}</span></td>
                <td className="px-5 py-4 text-sm font-semibold">{c.type === 'percentage' ? `${c.value}%` : formatPrice(c.value)}</td>
                <td className="px-5 py-4 text-sm text-gray-500">{c.min_order ? formatPrice(c.min_order) : '—'}</td>
                <td className="px-5 py-4 text-sm text-gray-500">{c.uses} / {c.max_uses || '∞'}</td>
                <td className="px-5 py-4 text-sm text-gray-400">{c.date_to ? formatDate(c.date_to) : '—'}</td>
                <td className="px-5 py-4"><div className={`w-4 h-4 rounded-full ${c.is_active ? 'bg-emerald-400' : 'bg-gray-300'}`} /></td>
                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(c)} className="p-2 rounded-xl bg-[#FFF0F7] text-[#C2185B] hover:bg-[#FFB6D9]/30"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(c.id)} className="p-2 rounded-xl bg-red-50 text-red-400 hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Upraviť kupón' : 'Nový kupón'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kód *</label>
              <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} required className={inputCls} placeholder="ZIMA20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Typ</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))} className={inputCls}>
                <option value="percentage">Percentuálna (%)</option>
                <option value="fixed">Pevná (€)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hodnota *</label>
              <input type="number" step="0.01" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} required className={inputCls} placeholder={form.type === 'percentage' ? '10' : '2.00'} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min. objednávka (€)</label>
              <input type="number" step="0.01" value={form.min_order} onChange={e => setForm(f => ({ ...f, min_order: e.target.value }))} className={inputCls} placeholder="20.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max. použití</label>
              <input type="number" value={form.max_uses} onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))} className={inputCls} placeholder="100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Platný od</label>
              <input type="date" value={form.date_from} onChange={e => setForm(f => ({ ...f, date_from: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Platný do</label>
              <input type="date" value={form.date_to} onChange={e => setForm(f => ({ ...f, date_to: e.target.value }))} className={inputCls} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="coup_active" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 accent-[#C2185B]" />
            <label htmlFor="coup_active" className="text-sm text-gray-700">Aktívny</label>
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
