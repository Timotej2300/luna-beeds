import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'

export default async function PosSalesPage({ params }: { params: Promise<{ store: string }> }) {
  const { store: storeSlug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: store } = await supabase
    .from('stores').select('id, name, slug').eq('slug', storeSlug).single()
  if (!store) redirect('/pos')

  const { data: sales } = await supabase
    .from('pos_sales')
    .select('*, pos_sale_items(name, quantity, total, type)')
    .eq('store_id', store.id)
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="min-h-screen bg-[#FFF8FB]">
      <header className="bg-white border-b border-pink-100 px-4 py-3 flex items-center gap-3">
        <Link href={`/pos/${storeSlug}`} className="p-2 rounded-xl text-gray-400 hover:text-[#C2185B] hover:bg-[#FFF0F7]">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="font-display font-bold text-[#C2185B] text-sm">História predajov</div>
          <div className="text-xs text-gray-500">{store.name}</div>
        </div>
      </header>

      <div className="p-4 space-y-3 max-w-2xl mx-auto">
        {!sales?.length ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">🧾</div>
            <p>Žiadne predaje</p>
          </div>
        ) : sales.map(sale => (
          <div key={sale.id} className="bg-white rounded-2xl border border-pink-50 shadow-soft p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-mono font-bold text-[#C2185B] text-sm">{sale.sale_number}</div>
                <div className="text-xs text-gray-400">{formatDate(sale.created_at)}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">{formatPrice(sale.total)}</div>
                <div className="text-xs text-gray-400">Hotovosť</div>
              </div>
            </div>
            <div className="space-y-1 text-sm text-gray-600 border-t border-pink-50 pt-3">
              {sale.pos_sale_items?.map((item: any, i: number) => (
                <div key={i} className="flex justify-between">
                  <span className="truncate max-w-[200px]">
                    {item.name}
                    {item.type === 'custom' && <span className="ml-1 text-xs text-purple-500">(vlastná)</span>}
                    <span className="text-gray-400 ml-1">×{item.quantity}</span>
                  </span>
                  <span>{formatPrice(item.total)}</span>
                </div>
              ))}
            </div>
            {sale.coupon_code && (
              <div className="mt-2 pt-2 border-t border-pink-50 text-xs text-green-600 flex justify-between">
                <span>Kupón {sale.coupon_code}</span>
                <span>-{formatPrice(sale.coupon_discount)}</span>
              </div>
            )}
            {sale.customer_email && (
              <div className="mt-2 text-xs text-gray-400">✉️ {sale.customer_email}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
