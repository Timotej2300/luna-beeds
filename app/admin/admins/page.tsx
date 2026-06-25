'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Role } from '@/types'

export default function AdminUsersPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [form, setForm] = useState({ first_name:'', last_name:'', company_email:'', private_email:'', password:'', role_id:'' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    createClient().from('roles').select('*').order('hierarchy').then(({ data }) => setRoles(data || []))
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Admin účet vytvorený!')
      setForm({ first_name:'', last_name:'', company_email:'', private_email:'', password:'', role_id:'' })
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full px-4 py-3 rounded-2xl border border-gray-200 outline-none focus:border-[#C2185B] focus:ring-2 focus:ring-[#FFB6D9]/30 text-sm'

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h1 className="text-2xl font-display font-bold text-[#880E4F]">Správa adminov</h1></div>
      <div className="bg-white rounded-3xl shadow-soft p-8 border border-pink-50">
        <h2 className="font-display font-semibold text-[#880E4F] mb-6 flex items-center gap-2"><UserPlus className="w-5 h-5" /> Vytvoriť admin účet</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[['first_name','Meno'],['last_name','Priezvisko']].map(([k,l]) => (
              <div key={k}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{l} *</label>
                <input value={(form as any)[k]} onChange={e => setForm(f=>({...f,[k]:e.target.value}))} required className={inputCls} />
              </div>
            ))}
          </div>
          {[['company_email','Firemný email (@lunabeeds.sk)','email'],['private_email','Súkromný email','email'],['password','Heslo','password']].map(([k,l,t]) => (
            <div key={k}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{l} {k!=='private_email'?'*':''}</label>
              <input type={t} value={(form as any)[k]} onChange={e => setForm(f=>({...f,[k]:e.target.value}))} required={k!=='private_email'} className={inputCls} />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rola *</label>
            <select value={form.role_id} onChange={e => setForm(f=>({...f,role_id:e.target.value}))} required className={inputCls}>
              <option value="">-- vyberte rolu --</option>
              {roles.map(r => <option key={r.id} value={r.id}>{r.icon} {r.name}</option>)}
            </select>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-[#C2185B] text-white py-3.5 rounded-2xl font-semibold hover:bg-[#880E4F] transition-colors disabled:opacity-50 shadow-soft"
          >{loading ? 'Vytváram...' : 'Vytvoriť admin účet'}</button>
        </form>
      </div>
    </div>
  )
}
