'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import toast from 'react-hot-toast'
import type { CustomMessage } from '@/types'

const COLORS = ['#C2185B','#2196F3','#4CAF50','#FF9800','#9C27B0']

export default function AdminMessagesPage() {
  const [items, setItems] = useState<CustomMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<CustomMessage | null>(null)
  const [form, setForm] = useState({ title:'', text:'', icon:'💬', color:'#C2185B', priority:0, date_from:'', date_to:'', is_active:true, show_on_home:true, show_in_admin:false, show_on_order:false, show_on_checkout:false, show_on_products:false })

  const load = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('custom_messages').select('*').order('priority', { ascending: false })
    setItems(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openEdit = (item?: CustomMessage) => {
    setEditing(item || null)
    setForm(item ? { title:item.title, text:item.text, icon:item.icon||'💬', color:item.color, priority:item.priority, date_from:item.date_from||'', date_to:item.date_to||'', is_active:item.is_active, show_on_home:item.show_on_home, show_in_admin:item.show_in_admin, show_on_order:item.show_on_order, show_on_checkout:item.show_on_checkout, show_on_products:item.show_on_products }
      : { title:'', text:'', icon:'💬', color:'#C2185B', priority:0, date_from:'', date_to:'', is_active:true, show_on_home:true, show_in_admin:false, show_on_order:false, show_on_checkout:false, show_on_products:false })
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    const data = { ...form, date_from: form.date_from||null, date_to: form.date_to||null }
    const { error } = editing ? await supabase.from('custom_messages').update(data).eq('id', editing.id) : await supabase.from('custom_messages').insert(data)
    if (error) { toast.error(error.message); return }
    toast.success('Uložené!'); setModalOpen(false); load()
  }

  const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#C2185B] focus:ring-2 focus:ring-[#FFB6D9]/20 text-sm'
  const checkboxes = [['show_on_home','Hlavná stránka'],['show_in_admin','Administrácia'],['show_on_order','Pri objednávke'],['show_on_checkout','Pri pokladni'],['show_on_products','Pri produktoch']]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-display font-bold text-[#880E4F]">Custom správy</h1><p className="text-gray-500 mt-1">Vlastné správy pre zákazníkov</p></div>
        <button onClick={() => openEdit()} className="flex items-center gap-2 bg-[#C2185B] text-white px-5 py-2.5 rounded-2xl font-medium hover:bg-[#880E4F] transition-colors shadow-soft"><Plus className="w-4 h-4" /> Nová správa</button>
      </div>
      <div className="space-y-3">
        {loading ? [...Array(3)].map((_,i) => <div key={i} className="h-20 bg-white rounded-3xl shadow-soft animate-pulse" />)
        : items.map(item => (
          <div key={item.id} className="bg-white rounded-3xl shadow-soft border border-pink-50 p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: item.color+'20' }}>{item.icon}</div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-gray-800">{item.title}</p>
              <p className="text-xs text-gray-500 truncate">{item.text}</p>
              <div className="flex gap-2 mt-1 flex-wrap">
                {item.show_on_home && <span className="text-xs bg-[#FFF0F7] text-[#C2185B] px-2 py-0.5 rounded">Domov</span>}
                {item.show_on_checkout && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">Pokladňa</span>}
                {item.show_on_products && <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded">Produkty</span>}
              </div>
            </div>
            <div className={`w-3 h-3 rounded-full ${item.is_active ? 'bg-emerald-400' : 'bg-gray-300'}`} />
            <div className="flex gap-2">
              <button onClick={() => openEdit(item)} className="p-2 rounded-xl bg-[#FFF0F7] text-[#C2185B] hover:bg-[#FFB6D9]/30"><Pencil className="w-4 h-4" /></button>
              <button onClick={async () => { if(!confirm('Vymazať?')) return; const s=createClient(); await s.from('custom_messages').delete().eq('id',item.id); load() }} className="p-2 rounded-xl bg-red-50 text-red-400 hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Upraviť správu' : 'Nová správa'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Nadpis *</label><input value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} required className={inputCls} /></div>
            <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Text *</label><textarea value={form.text} onChange={e => setForm(f=>({...f,text:e.target.value}))} required rows={2} className={inputCls+' resize-none'} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Ikona</label><input value={form.icon} onChange={e => setForm(f=>({...f,icon:e.target.value}))} className={inputCls} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Priorita</label><input type="number" value={form.priority} onChange={e => setForm(f=>({...f,priority:Number(e.target.value)}))} className={inputCls} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Farba</label><div className="flex gap-2">{COLORS.map(c => <button key={c} type="button" onClick={() => setForm(f=>({...f,color:c}))} className={`w-7 h-7 rounded-full ${form.color===c?'scale-125 ring-2 ring-offset-1':''}`} style={{backgroundColor:c}} />)}</div></div>
          </div>
          <div><p className="text-sm font-medium text-gray-700 mb-2">Zobraziť na:</p><div className="grid grid-cols-2 gap-2">{checkboxes.map(([k,l]) => (<label key={k} className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={(form as any)[k]} onChange={e => setForm(f=>({...f,[k]:e.target.checked}))} className="w-4 h-4 accent-[#C2185B]" /><span className="text-sm text-gray-600">{l}</span></label>))}</div></div>
          <div className="flex gap-3"><button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-2xl border border-gray-200 text-gray-600 text-sm">Zrušiť</button><button type="submit" className="flex-1 py-2.5 rounded-2xl bg-[#C2185B] text-white text-sm font-semibold">Uložiť</button></div>
        </form>
      </Modal>
    </div>
  )
}
