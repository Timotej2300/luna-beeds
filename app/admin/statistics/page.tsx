import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Štatistiky | Admin' }
export default async function AdminStatisticsPage() {
  const supabase = await createClient()
  const { data: orders = [] } = await supabase.from('orders').select('total, status, created_at, payment_method')
  const paid = (orders || []).filter((o: any) => o.status !== 'cancelled')
  const revenue = paid.reduce((s: number, o: any) => s + (o.total || 0), 0)
  const byMethod = (orders || []).reduce((acc: any, o: any) => { acc[o.payment_method] = (acc[o.payment_method] || 0) + 1; return acc }, {})
  const byStatus: Record<string,number> = (orders || []).reduce((acc: any, o: any) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc }, {})
  const STATUS_LABELS: Record<string,string> = { new:'Nové', processing:'Spracovávajú sa', paid:'Zaplatené', shipped:'Odoslané', delivered:'Doručené', returned:'Vrátené', cancelled:'Zrušené' }
  const STATUS_COLORS: Record<string,string> = { new:'#2196F3', processing:'#FF9800', paid:'#4CAF50', shipped:'#9C27B0', delivered:'#00BCD4', returned:'#FF5722', cancelled:'#9E9E9E' }
  return (
    <div className="space-y-8">
      <div><h1 className="text-2xl font-display font-bold text-[#880E4F]">Štatistiky</h1></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          ['Celkové tržby', formatPrice(revenue), '#C2185B'],
          ['Objednávky', (orders || []).length, '#2196F3'],
          ['Priemerná objednávka', formatPrice(paid.length ? revenue / paid.length : 0), '#4CAF50'],
          ['Stripe', byMethod['stripe'] || 0, '#635BFF'],
        ].map(([label, value, color]: any) => (
          <div key={label} className="bg-white rounded-3xl shadow-soft p-6 border border-pink-50">
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-3xl shadow-soft p-6 border border-pink-50">
        <h2 className="font-display font-semibold text-[#880E4F] mb-5">Objednávky podľa stavu</h2>
        <div className="space-y-3">
          {Object.entries(byStatus).map(([status, count]) => {
            const pct = (orders || []).length ? Math.round((count / (orders || []).length) * 100) : 0
            return (
              <div key={status}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{STATUS_LABELS[status] || status}</span>
                  <span className="font-medium">{count} ({pct}%)</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: STATUS_COLORS[status] || '#ccc' }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
