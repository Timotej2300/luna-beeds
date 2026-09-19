'use client'
import { Trash2, Plus, Minus } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { PosCartItem, ValidatedCoupon } from '@/types/pos'

interface Props {
  items: PosCartItem[]
  coupon: ValidatedCoupon | null
  onUpdateQty: (key: string, qty: number) => void
  onRemove: (key: string) => void
  onRemoveCoupon: () => void
}

export default function PosCart({ items, coupon, onUpdateQty, onRemove, onRemoveCoupon }: Props) {
  const subtotal = items.reduce((s, i) => s + i.total, 0)
  const discount = coupon?.discount ?? 0
  const total = Math.max(0, subtotal - discount)

  if (items.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-center p-6">
        <div>
          <div className="text-4xl mb-3">🛒</div>
          <p className="text-gray-400 text-sm">Košík je prázdny</p>
          <p className="text-gray-300 text-xs mt-1">Pridajte produkty zo zoznamu</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Items */}
      <div className="flex-1 overflow-y-auto space-y-2 p-4">
        {items.map((item) => (
          <div key={item.key} className="bg-white rounded-xl p-3 border border-pink-50 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-gray-900 truncate">{item.name}</div>
              <div className="text-xs text-gray-500">{formatPrice(item.unit_price)} / ks</div>
            </div>
            {/* Qty controls */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button onClick={() => onUpdateQty(item.key, item.quantity - 1)}
                className="w-7 h-7 rounded-lg bg-[#FFF0F7] text-[#C2185B] flex items-center justify-center hover:bg-[#FFB6D9]/30 transition-colors">
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-6 text-center text-sm font-semibold text-gray-800">{item.quantity}</span>
              <button onClick={() => onUpdateQty(item.key, item.quantity + 1)}
                className="w-7 h-7 rounded-lg bg-[#FFF0F7] text-[#C2185B] flex items-center justify-center hover:bg-[#FFB6D9]/30 transition-colors">
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <div className="text-sm font-bold text-gray-900 w-16 text-right shrink-0">
              {formatPrice(item.total)}
            </div>
            <button onClick={() => onRemove(item.key)}
              className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors shrink-0">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="p-4 border-t border-pink-100 space-y-2 bg-white">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Medzisúčet</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {coupon && (
          <div className="flex justify-between text-sm text-green-600">
            <div className="flex items-center gap-1">
              <span>Kupón {coupon.code}</span>
              <button onClick={onRemoveCoupon} className="text-gray-300 hover:text-red-400 ml-1">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-lg text-[#880E4F] pt-2 border-t border-pink-50">
          <span>Spolu</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  )
}
