import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import { Mail } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Newsletter | Admin' }

export default async function AdminNewsletterPage() {
  const supabase = await createClient()
  const { data: subscribers, count } = await supabase
    .from('newsletter_subscribers')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  const active = subscribers?.filter(s => s.is_active).length || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-[#880E4F]">Newsletter</h1>
        <p className="text-gray-500 mt-1">Správa odberateľov newslettera</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[['Celkom odberateľov', count || 0, '#C2185B'], ['Aktívnych', active, '#4CAF50'], ['Neaktívnych', (count || 0) - active, '#9E9E9E']].map(([label, value, color]: any) => (
          <div key={label} className="bg-white rounded-3xl shadow-soft p-6 border border-pink-50">
            <p className="text-3xl font-bold" style={{ color }}>{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-soft border border-pink-50 overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-[#FFF0F7]">
            {['Email', 'Dátum prihlásenia', 'Stav'].map(h => <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-[#C2185B] uppercase tracking-wider">{h}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-pink-50">
            {!subscribers?.length ? (
              <tr><td colSpan={3} className="text-center py-16 text-gray-400">
                <Mail className="w-12 h-12 mx-auto mb-3 text-[#FFB6D9]" />
                Žiadni odberatelia
              </td></tr>
            ) : subscribers.map((s: any) => (
              <tr key={s.id} className="hover:bg-[#FFF8FB]">
                <td className="px-6 py-4 text-sm text-gray-700">{s.email}</td>
                <td className="px-6 py-4 text-sm text-gray-400">{formatDate(s.created_at)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                    {s.is_active ? 'Aktívny' : 'Neaktívny'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
