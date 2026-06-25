'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Plus, Pencil, GripVertical, Shield } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import toast from 'react-hot-toast'
import type { Role } from '@/types'

const ALL_PERMISSIONS = [
  { key: 'dashboard', label: 'Dashboard', category: 'Prehľad' },
  { key: 'products_read', label: 'Produkty – čítať', category: 'Produkty' },
  { key: 'products_write', label: 'Produkty – upravovať', category: 'Produkty' },
  { key: 'orders_read', label: 'Objednávky – čítať', category: 'Objednávky' },
  { key: 'orders_write', label: 'Objednávky – upravovať', category: 'Objednávky' },
  { key: 'customers_read', label: 'Zákazníci – čítať', category: 'Zákazníci' },
  { key: 'payments_read', label: 'Platby – čítať', category: 'Platby' },
  { key: 'shipping_write', label: 'Doprava – spravovať', category: 'Doprava' },
  { key: 'announcements_write', label: 'Announcement – spravovať', category: 'Announcement' },
  { key: 'statistics_read', label: 'Štatistiky – čítať', category: 'Štatistiky' },
  { key: 'settings_write', label: 'Nastavenia – upravovať', category: 'Nastavenia' },
  { key: 'roles_write', label: 'Role – spravovať', category: 'Role' },
  { key: 'users_write', label: 'Používatelia – spravovať', category: 'Používatelia' },
]

const ROLE_COLORS = ['#C2185B', '#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#F44336', '#00BCD4']
const ROLE_ICONS = ['👑', '🥈', '👔', '💼', '🛠️', '🎨', '🔍']
const DEFAULT_ROLES = [
  { name: 'Vlastník', color: '#C2185B', icon: '👑', hierarchy: 1 },
  { name: 'Spoluvlastník', color: '#880E4F', icon: '🥈', hierarchy: 2 },
  { name: 'Manažér', color: '#2196F3', icon: '👔', hierarchy: 3 },
  { name: 'Obchodný manažér', color: '#FF9800', icon: '💼', hierarchy: 4 },
  { name: 'Správa', color: '#4CAF50', icon: '🛠️', hierarchy: 5 },
  { name: 'Design', color: '#9C27B0', icon: '🎨', hierarchy: 6 },
  { name: 'QA', color: '#00BCD4', icon: '🔍', hierarchy: 7 },
]

function SortableRole({ role, onEdit }: { role: any; onEdit: (r: any) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: role.id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  return (
    <div ref={setNodeRef} style={style} className="bg-white rounded-2xl shadow-soft border border-pink-50 p-4 flex items-center gap-4">
      <button {...attributes} {...listeners} className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing">
        <GripVertical className="w-5 h-5" />
      </button>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: role.color + '20' }}>
        {role.icon}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-gray-800 text-sm">{role.name}</p>
        <p className="text-xs text-gray-400">{role.description || 'Bez popisu'}</p>
        <div className="flex flex-wrap gap-1 mt-1">
          {(role.permissions || []).slice(0, 3).map((p: string) => (
            <span key={p} className="px-1.5 py-0.5 bg-[#FFF0F7] text-[#C2185B] text-xs rounded">{p}</span>
          ))}
          {(role.permissions || []).length > 3 && <span className="text-xs text-gray-400">+{role.permissions.length - 3}</span>}
        </div>
      </div>
      <span className="text-xs font-bold text-gray-300 w-6 text-center">#{role.hierarchy}</span>
      {role.name !== 'Vlastník' && (
        <button onClick={() => onEdit(role)} className="p-2 rounded-xl bg-[#FFF0F7] text-[#C2185B] hover:bg-[#FFB6D9]/30 transition-colors">
          <Pencil className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ name: '', description: '', color: '#C2185B', icon: '👔', permissions: [] as string[] })

  const load = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('roles').select('*').order('hierarchy')
    if (data?.length) { setRoles(data); setLoading(false); return }
    // seed defaults
    await supabase.from('roles').insert(DEFAULT_ROLES.map(r => ({ ...r, permissions: r.hierarchy === 1 ? ALL_PERMISSIONS.map(p => p.key) : [] })))
    load()
  }

  useEffect(() => { load() }, [])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = roles.findIndex(r => r.id === active.id)
    const newIdx = roles.findIndex(r => r.id === over.id)
    if (roles[oldIdx].name === 'Vlastník' || roles[newIdx].name === 'Vlastník') return
    const newRoles = [...roles]
    const [moved] = newRoles.splice(oldIdx, 1)
    newRoles.splice(newIdx, 0, moved)
    const reordered = newRoles.map((r, i) => ({ ...r, hierarchy: i + 1 }))
    setRoles(reordered)
    const supabase = createClient()
    await Promise.all(reordered.map(r => supabase.from('roles').update({ hierarchy: r.hierarchy }).eq('id', r.id)))
  }

  const openEdit = (role?: any) => {
    setEditing(role || null)
    setForm(role ? { name: role.name, description: role.description || '', color: role.color, icon: role.icon, permissions: role.permissions || [] }
      : { name: '', description: '', color: '#C2185B', icon: '👔', permissions: [] })
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    const { error } = editing
      ? await supabase.from('roles').update(form).eq('id', editing.id)
      : await supabase.from('roles').insert({ ...form, hierarchy: roles.length + 1 })
    if (error) { toast.error(error.message); return }
    toast.success('Uložené!'); setModalOpen(false); load()
  }

  const togglePermission = (key: string) => setForm(f => ({
    ...f, permissions: f.permissions.includes(key) ? f.permissions.filter(p => p !== key) : [...f.permissions, key]
  }))

  const categories = [...new Set(ALL_PERMISSIONS.map(p => p.category))]
  const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#C2185B] focus:ring-2 focus:ring-[#FFB6D9]/20 text-sm'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-[#880E4F]">Role</h1>
          <p className="text-gray-500 mt-1">Presúvajte role drag & drop pre zmenu hierarchie</p>
        </div>
        <button onClick={() => openEdit()} className="flex items-center gap-2 bg-[#C2185B] text-white px-5 py-2.5 rounded-2xl font-medium hover:bg-[#880E4F] transition-colors shadow-soft">
          <Plus className="w-4 h-4" /> Nová rola
        </button>
      </div>

      {loading ? <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-white rounded-2xl shadow-soft animate-pulse" />)}</div>
      : (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={roles.map(r => r.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {roles.map(role => <SortableRole key={role.id} role={role} onEdit={openEdit} />)}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Upraviť rolu' : 'Nová rola'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Názov *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className={inputCls} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Popis</label>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Farba</label>
              <div className="flex gap-2 flex-wrap">
                {ROLE_COLORS.map(c => <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
                  className={`w-7 h-7 rounded-full ${form.color === c ? 'scale-125 ring-2 ring-offset-1' : ''}`} style={{ backgroundColor: c }} />)}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ikona</label>
              <div className="flex gap-2 flex-wrap">
                {ROLE_ICONS.map(ic => <button key={ic} type="button" onClick={() => setForm(f => ({ ...f, icon: ic }))}
                  className={`w-9 h-9 rounded-xl text-xl flex items-center justify-center transition-all ${form.icon === ic ? 'bg-[#FFF0F7] ring-2 ring-[#C2185B]' : 'bg-gray-50 hover:bg-[#FFF0F7]'}`}>{ic}</button>)}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Oprávnenia</label>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {categories.map(cat => (
                <div key={cat}>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2">{cat}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {ALL_PERMISSIONS.filter(p => p.category === cat).map(p => (
                      <label key={p.key} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.permissions.includes(p.key)} onChange={() => togglePermission(p.key)} className="w-4 h-4 accent-[#C2185B]" />
                        <span className="text-sm text-gray-600">{p.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
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
