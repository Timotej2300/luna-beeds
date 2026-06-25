import { createClient } from '@/lib/supabase/server'
import { formatPrice, formatDate } from '@/lib/utils'
import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Platby | Admin' }
export default async function AdminPaymentsPage() {
  const supabase = await createClient()
  const { data: orders = [] } = await supabase.from('orders').select('id,total,payment_method,payment_status,created_at,shipping_address').order('created_at', { ascending: false }).limit(50)
  const totalStripe = (orders||[]).filter((o:any)=>o.payment_method==='stripe'&&o.payment_status==='paid').reduce((s:number,o:any)=>s+o.total,0)
  const totalPaypal = (orders||[]).filter((o:any)=>o.payment_method==='paypal'&&o.payment_status==='paid').reduce((s:number,o:any)=>s+o.total,0)
  const STATUS_COLORS: Record<string,string> = { pending:'bg-yellow-50 text-yellow-600', paid:'bg-emerald-50 text-emerald-600', failed:'bg-red-50 text-red-500', refunded:'bg-gray-100 text-gray-500' }
  const STATUS_LABELS: Record<string,string> = { pending:'Čaká', paid:'Zaplatené', failed:'Zlyhalo', refunded:'Vrátené' }
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-display font-bold text-[#880E4F]">Platby</h1></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl shadow-soft p-6 border border-pink-50">
          <p className="text-sm text-gray-500 mb-1">Stripe (celkom)</p>
          <p className="text-2xl font-bold" style={{color:'#635BFF'}}>{formatPrice(totalStripe)}</p>
        </div>
        <div className="bg-white rounded-3xl shadow-soft p-6 border border-pink-50">
          <p className="text-sm text-gray-500 mb-1">PayPal (celkom)</p>
          <p className="text-2xl font-bold" style={{color:'#003087'}}>{formatPrice(totalPaypal)}</p>
        </div>
      </div>
      <div className="bg-white rounded-3xl shadow-soft border border-pink-50 overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-[#FFF0F7]">{['#ID','Zákazník','Suma','Metóda','Stav','Dátum'].map(h=><th key={h} className="text-left px-6 py-3 text-xs font-semibold text-[#C2185B] uppercase tracking-wider">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-pink-50">
            {!(orders||[]).length ? <tr><td colSpan={6} className="text-center py-12 text-gray-400">Žiadne platby</td></tr>
            : (orders||[]).map((o:any) => (
              <tr key={o.id} className="hover:bg-[#FFF8FB]">
                <td className="px-6 py-4 text-xs font-mono text-gray-400">#{o.id.slice(0,8)}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{o.shipping_address?.first_name} {o.shipping_address?.last_name}</td>
                <td className="px-6 py-4 text-sm font-bold text-[#C2185B]">{formatPrice(o.total)}</td>
                <td className="px-6 py-4"><span className="px-2 py-1 rounded-lg text-xs font-medium capitalize" style={{backgroundColor: o.payment_method==='stripe'?'#635BFF20':'#003087','color': o.payment_method==='stripe'?'#635BFF':'#003087'}}>{o.payment_method}</span></td>
                <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[o.payment_status]||'bg-gray-100 text-gray-500'}`}>{STATUS_LABELS[o.payment_status]||o.payment_status}</span></td>
                <td className="px-6 py-4 text-sm text-gray-400">{formatDate(o.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
