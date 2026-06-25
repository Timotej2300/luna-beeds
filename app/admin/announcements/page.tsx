'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Pencil, Trash2, Megaphone } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import { ANNOUNCEMENT_TYPE_LABELS, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Announcement, AnnouncementType } from '@/types'

const TYPE_OPTIONS: AnnouncementType[] = ['maintenance', 'news', 'info', 'sale', 'warning']
const COLORS = ['#C2185B', '#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#F44336']

export default function AdminAnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Announcement | null>(null)
  const [form, setForm] = useState({ title: '', text: '', icon: '', color: '#C2185B', type: 'info' as AnnouncementType, date_from: '', date_to: '', is_active: true })

  const load = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false })
    setItems(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openEdit = (item?: Announcement) => {
    setEditing(item || null)
    setForm(item
      ? { title: item.title, text: item.text, icon: item.icon || '', color: item.color, type: item.type, date_from: item.date_from || '', date_to: item.date_to || '', is_active: item.is_active }
      : { title: '', text: '', icon: '📢', color: '#C2185B', type: 'info', date_from: '', date_to: '', is_active: true }
    )
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    const data = { ...form, date_from: form.date_from || null, date_to: form.date_to || null }
    const { error } = editing
      ? await supabase.from('announcements').update(data).eq('id', editing.id)
      : await supabase.from('announcements').insert(data)
    if (error) { toast.error(error.message); return }
    toast.success('Uložené!'); setModalOpen(false); load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Vymazať?')) return
    const supabase = createClient()
    await supabase.from('announcements').delete().eq('id', id)
    toast.success('Vymazané'); load()
  }

  const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#C2185B] focus:ring-2 focus:ring-[#FFB6D9]/20 text-sm'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-[#880E4F]">Announcement</h1>
          <p className="text-gray-500 mt-1">Správy zobrazené zákazníkom v hornom páse</p>
        </div>
        <button onClick={() => openEdit()} className="flex items-center gap-2 bg-[#C2185B] text-white px-5 py-2.5 rounded-2xl font-medium hover:bg-[#880E4F] transition-colors shadow-soft">
          <Plus className="w-4 h-4" /> Nový announcement
        </button>
      </div>

      <div className="space-y-3">
        {loading ? [...Array(3)].map((_, i) => <div key={i} className="h-20 bg-white rounded-3xl shadow-soft animate-pulse" />)
        : items.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl shadow-soft text-gray-400">
            <Megaphone className="w-12 h-12 mx-auto mb-3 text-[#FFB6D9]" />
            <p>Žiadne announcements</p>
          </div>
        ) : items.map(item => (
          <div key={item.id} className="bg-white rounded-3xl shadow-soft border border-pink-50 p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ backgroundColor: item.color + '20' }}>
              {item.icon || '📢'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="font-semibold text-gray-800 text-sm">{item.title}</p>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: item.color + '20', color: item.color }}>
                  {ANNOUNCEMENT_TYPE_LABELS[item.type]}
                </span>
                {item.type === 'maintenance' && <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs rounded-full font-medium">Nezatvárateľné</span>}
              </div>
              <p className="text-sm text-gray-500 truncate">{item.text}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className={`w-3 h-3 rounded-full ${item.is_active ? 'bg-emerald-400' : 'bg-gray-300'}`} />
              <button onClick={() => openEdit(item)} className="p-2 rounded-xl bg-[#FFF0F7] text-[#C2185B] hover:bg-[#FFB6D9]/30 transition-colors"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(item.id)} className="p-2 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Upraviť' : 'Nový announcement'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nadpis *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required className={inputCls} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Text *</label>
              <textarea value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} required rows={2} className={inputCls + ' resize-none'} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ikona (emoji)</label>
              <input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} className={inputCls} placeholder="📢" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Typ</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as AnnouncementType }))} className={inputCls}>
                {TYPE_OPTIONS.map(t => <option key={t} value={t}>{ANNOUNCEMENT_TYPE_LABELS[t]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Farba</label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
                    className={`w-7 h-7 rounded-full transition-transform ${form.color === c ? 'scale-125 ring-2 ring-offset-1' : 'hover:scale-110'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Platný od</label>
              <input type="datetime-local" value={form.date_from} onChange={e => setForm(f => ({ ...f, date_from: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Platný do</label>
              <input type="datetime-local" value={form.date_to} onChange={e => setForm(f => ({ ...f, date_to: e.target.value }))} className={inputCls} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="ann_active" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 accent-[#C2185B]" />
            <label htmlFor="ann_active" className="text-sm text-gray-700">Aktívny</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-2xl border border-gray-200 text-gray-600 text-sm">Zrušiť</button>
            <button type="submit" className="flex-1 py-2.5 rounded-2xl bg-[#C2185B] text-white hover:bg-[#880E4F] text-sm font-semibold">Uložiť</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
