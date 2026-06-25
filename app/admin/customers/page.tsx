import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import { Users } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Zákazníci | Admin' }

export default async function AdminCustomersPage() {
  const supabase = await createClient()
  const { data: users } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-[#880E4F]">Zákazníci</h1>
        <p className="text-gray-500 mt-1">{users?.length || 0} registrovaných zákazníkov</p>
      </div>

      <div className="bg-white rounded-3xl shadow-soft border border-pink-50 overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-[#FFF0F7]">
            {['Zákazník', 'Email', 'Registrovaný', 'Objednávky'].map(h => (
              <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-[#C2185B] uppercase tracking-wider">{h}</th>
            ))}
          </tr></thead>
          <tbody className="divide-y divide-pink-50">
            {!users?.length ? (
              <tr><td colSpan={4} className="text-center py-16 text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-3 text-[#FFB6D9]" />
                Žiadni zákazníci
              </td></tr>
            ) : users.map((user: any) => (
              <tr key={user.id} className="hover:bg-[#FFF8FB] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-[#FFB6D9] to-[#C2185B] rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {(user.first_name?.[0] || user.email?.[0] || '?').toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-800 text-sm">{user.first_name} {user.last_name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4 text-sm text-gray-400">{formatDate(user.created_at)}</td>
                <td className="px-6 py-4 text-sm text-gray-500">—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
