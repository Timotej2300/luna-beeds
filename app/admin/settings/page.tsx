'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminSettingsPage() {
  const [form, setForm] = useState({ shop_name: 'Luna&Beeds', shop_email: 'info@lunabeeds.sk', shop_phone: '', currency: 'EUR', free_shipping_from: '50' })
  const [loading, setLoading] = useState(false)
  const inputCls = 'w-full px-4 py-3 rounded-2xl border border-gray-200 outline-none focus:border-[#C2185B] focus:ring-2 focus:ring-[#FFB6D9]/30 text-sm'

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('settings').select('*')
      if (data) data.forEach((s: any) => setForm(f => ({ ...f, [s.key]: s.value })))
    }
    load()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    await Promise.all(Object.entries(form).map(([key, value]) =>
      supabase.from('settings').upsert({ key, value }, { onConflict: 'key' })
    ))
    toast.success('Nastavenia uložené!')
    setLoading(false)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h1 className="text-2xl font-display font-bold text-[#880E4F]">Nastavenia</h1></div>
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-3xl shadow-soft p-6 border border-pink-50 space-y-4">
          <h2 className="font-display font-semibold text-[#880E4F]">Základné informácie</h2>
          {[['shop_name','Názov obchodu'], ['shop_email','Kontaktný email'], ['shop_phone','Telefón']].map(([k,l]) => (
            <div key={k}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{l}</label>
              <input value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} className={inputCls} />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-3xl shadow-soft p-6 border border-pink-50 space-y-4">
          <h2 className="font-display font-semibold text-[#880E4F]">Doprava & Platby</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mena</label>
            <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} className={inputCls}>
              <option value="EUR">EUR (€)</option>
              <option value="CZK">CZK (Kč)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Doprava zadarmo od (€)</label>
            <input type="number" value={form.free_shipping_from} onChange={e => setForm(f => ({ ...f, free_shipping_from: e.target.value }))} className={inputCls} />
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="flex items-center gap-2 bg-[#C2185B] text-white px-6 py-3 rounded-2xl font-semibold hover:bg-[#880E4F] transition-colors shadow-soft disabled:opacity-50"
        >
          <Save className="w-4 h-4" />{loading ? 'Ukladám...' : 'Uložiť nastavenia'}
        </button>
      </form>
    </div>
  )
}
