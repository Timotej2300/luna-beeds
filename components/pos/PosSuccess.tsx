'use client'
import Link from 'next/link'
import { CheckCircle, Receipt, RotateCcw } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'

interface Props {
  sale: {
    id: string
    sale_number: string
    total: number
    amount_paid: number
    change_given: number
    customer_email?: string
    coupon_code?: string
    coupon_discount: number
    subtotal: number
    payment_method: string
    created_at: string
    stores?: { name: string }
    pos_sale_items: { name: string; quantity: number; unit_price: number; total: number; type: string }[]
  }
  storeSlug: string
}

export default function PosSuccess({ sale, storeSlug }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF0F7] to-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        {/* Success icon */}
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-display font-bold text-[#880E4F]">Predaj dokončený</h1>
          <p className="text-gray-500 text-sm mt-1">
            <span className="font-mono font-bold text-[#C2185B]">{sale.sale_number}</span>
          </p>
        </div>

        {/* Receipt */}
        <div className="bg-white rounded-3xl shadow-soft border border-pink-50 overflow-hidden">
          {/* Store info */}
          {sale.stores && (
            <div className="bg-[#FFF0F7] px-5 py-3 text-center">
              <div className="font-display font-bold text-[#C2185B]">Luna&Beeds</div>
              <div className="text-xs text-gray-500">{sale.stores.name}</div>
              <div className="text-xs text-gray-400">{formatDate(sale.created_at)}</div>
            </div>
          )}

          {/* Items */}
          <div className="p-5 space-y-2 border-b border-pink-50">
            {sale.pos_sale_items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <div>
                  <span className="text-gray-700">{item.name}</span>
                  {item.type === 'custom' && (
                    <span className="ml-1 text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded">vlastná</span>
                  )}
                  <span className="text-gray-400 ml-1">×{item.quantity}</span>
                </div>
                <span className="font-medium">{formatPrice(item.total)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="p-5 space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Medzisúčet</span><span>{formatPrice(sale.subtotal)}</span>
            </div>
            {sale.coupon_code && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Kupón {sale.coupon_code}</span>
                <span>-{formatPrice(sale.coupon_discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg text-[#880E4F] border-t border-pink-50 pt-2">
              <span>Spolu</span><span>{formatPrice(sale.total)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Zaplatené</span><span>{formatPrice(sale.amount_paid)}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold text-emerald-600">
              <span>Výdavok</span><span>{formatPrice(sale.change_given)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-400 pt-1">
              <span>Platba</span>
              <span className="capitalize">{sale.payment_method === 'cash' ? 'Hotovosť' : sale.payment_method}</span>
            </div>
          </div>
        </div>

        {/* Email confirmation */}
        {sale.customer_email && (
          <div className="bg-blue-50 rounded-2xl px-4 py-3 text-center">
            <div className="text-xs text-blue-600">
              ✉️ Účtenka odoslaná na <span className="font-medium">{sale.customer_email}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <Link href={`/pos/${storeSlug}`}
            className="w-full flex items-center justify-center gap-2 py-4 bg-[#C2185B] text-white rounded-2xl font-bold text-lg hover:bg-[#880E4F] transition-colors">
            <RotateCcw className="w-5 h-5" />
            Nový predaj
          </Link>
          <Link href={`/pos/${storeSlug}/sales`}
            className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-pink-100 text-[#C2185B] rounded-2xl font-medium text-sm hover:bg-[#FFF0F7] transition-colors">
            <Receipt className="w-4 h-4" />
            História predajov
          </Link>
        </div>
      </div>
    </div>
  )
}
