'use client'
import { useState } from 'react'
import { X, Banknote, Ticket, Plus, User, ChevronRight } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { PosCartItem, ValidatedCoupon } from '@/types/pos'

interface Props {
  items: PosCartItem[]
  coupon: ValidatedCoupon | null
  storeId: string
  sellerId: string
  onCouponApply: (coupon: ValidatedCoupon) => void
  onCouponRemove: () => void
  onCustomPayment: () => void
  onComplete: (amountPaid: number, customerEmail: string, note: string) => Promise<void>
  onClose: () => void
}

const QUICK_AMOUNTS = [5, 10, 20, 50, 100]

export default function PosCheckout({
  items, coupon, storeId, sellerId,
  onCouponApply, onCouponRemove, onCustomPayment, onComplete, onClose,
}: Props) {
  const subtotal = items.reduce((s, i) => s + i.total, 0)
  const discount = coupon?.discount ?? 0
  const total = Math.max(0, subtotal - discount)

  const [step, setStep] = useState<'review' | 'payment'>('review')
  const [amountPaid, setAmountPaid] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [note, setNote] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const paid = parseFloat(amountPaid) || 0
  const change = paid - total

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    setCouponError('')
    try {
      const res = await fetch('/api/pos/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), subtotal }),
      })
      const data = await res.json()
      if (!res.ok) { setCouponError(data.error); return }
      onCouponApply(data)
      setCouponCode('')
    } finally {
      setCouponLoading(false)
    }
  }

  const handleComplete = async () => {
    if (paid < total) return
    setSubmitting(true)
    try {
      await onComplete(paid, customerEmail, note)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-card max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-pink-50">
          <h2 className="font-display font-bold text-[#880E4F] text-lg">
            {step === 'review' ? 'Prehľad košíka' : 'Platba'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'review' ? (
          <div className="p-5 space-y-4">
            {/* Items summary */}
            <div className="space-y-2">
              {items.map(item => (
                <div key={item.key} className="flex justify-between text-sm">
                  <span className="text-gray-700">{item.name} ×{item.quantity}</span>
                  <span className="font-medium">{formatPrice(item.total)}</span>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="border-t border-pink-50 pt-4">
              {coupon ? (
                <div className="flex items-center justify-between bg-green-50 rounded-xl px-4 py-3">
                  <div>
                    <div className="text-sm font-semibold text-green-700">🎟 {coupon.code}</div>
                    <div className="text-xs text-green-600">Zľava -{formatPrice(coupon.discount)}</div>
                  </div>
                  <button onClick={onCouponRemove} className="text-green-400 hover:text-red-400">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">🎟 Kupón</label>
                  <div className="flex gap-2">
                    <input
                      value={couponCode}
                      onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError('') }}
                      placeholder="Zadajte kód..."
                      className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#C2185B] focus:ring-2 focus:ring-[#FFB6D9]/20"
                    />
                    <button onClick={handleApplyCoupon} disabled={couponLoading || !couponCode}
                      className="px-4 py-2 bg-[#FFF0F7] text-[#C2185B] rounded-xl text-sm font-medium hover:bg-[#FFB6D9]/30 disabled:opacity-50 transition-colors">
                      {couponLoading ? '...' : 'Použiť'}
                    </button>
                  </div>
                  {couponError && <p className="text-red-500 text-xs mt-1">{couponError}</p>}
                </div>
              )}
            </div>

            {/* Custom payment button */}
            <button onClick={onCustomPayment}
              className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-[#FFB6D9] text-[#C2185B] text-sm font-medium hover:bg-[#FFF0F7] transition-colors">
              <Plus className="w-4 h-4" />
              Vlastná platba / Služba
            </button>

            {/* Customer email */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                <User className="w-3 h-3 inline mr-1" />
                Email zákazníka (voliteľné)
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={e => setCustomerEmail(e.target.value)}
                placeholder="zakaznik@email.sk"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#C2185B] focus:ring-2 focus:ring-[#FFB6D9]/20"
              />
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Poznámka</label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={2}
                placeholder="Voliteľná poznámka..."
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#C2185B] resize-none"
              />
            </div>

            {/* Total */}
            <div className="bg-[#FFF0F7] rounded-2xl p-4 space-y-1">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Medzisúčet</span><span>{formatPrice(subtotal)}</span>
              </div>
              {coupon && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Zľava</span><span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-xl text-[#880E4F] pt-1 border-t border-[#FFB6D9]/30">
                <span>Spolu</span><span>{formatPrice(total)}</span>
              </div>
            </div>

            <button onClick={() => setStep('payment')}
              className="w-full py-4 bg-[#C2185B] text-white rounded-2xl font-bold text-lg hover:bg-[#880E4F] transition-colors active:scale-[0.98] flex items-center justify-center gap-2">
              <Banknote className="w-5 h-5" />
              Pokračovať k platbe
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="p-5 space-y-5">
            <div className="text-center">
              <div className="text-4xl font-bold text-[#880E4F]">{formatPrice(total)}</div>
              <div className="text-gray-500 text-sm mt-1">Na zaplatenie</div>
            </div>

            {/* Quick amounts */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Zákazník zaplatil</label>
              <div className="flex gap-2 flex-wrap mb-3">
                {QUICK_AMOUNTS.map(amount => (
                  <button key={amount} onClick={() => setAmountPaid(String(amount))}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      parseFloat(amountPaid) === amount
                        ? 'bg-[#C2185B] text-white'
                        : 'bg-[#FFF0F7] text-[#C2185B] hover:bg-[#FFB6D9]/30'
                    }`}>
                    {amount} €
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={amountPaid}
                onChange={e => setAmountPaid(e.target.value)}
                placeholder="Zadajte sumu..."
                min={0}
                step="0.01"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xl font-bold text-center outline-none focus:border-[#C2185B] focus:ring-2 focus:ring-[#FFB6D9]/20"
                autoFocus
              />
            </div>

            {/* Change */}
            {paid >= total && paid > 0 && (
              <div className="bg-emerald-50 rounded-2xl p-4 text-center">
                <div className="text-sm text-emerald-600 mb-1">Výdavok zákazníkovi</div>
                <div className="text-3xl font-bold text-emerald-700">{formatPrice(change)}</div>
              </div>
            )}

            {paid > 0 && paid < total && (
              <div className="bg-red-50 rounded-2xl p-3 text-center">
                <div className="text-sm text-red-600">Nedostatok: {formatPrice(total - paid)}</div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep('review')}
                className="flex-1 py-3.5 rounded-2xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors">
                Späť
              </button>
              <button
                onClick={handleComplete}
                disabled={submitting || paid < total || paid === 0}
                className="flex-2 flex-1 py-3.5 rounded-2xl bg-[#C2185B] text-white font-bold hover:bg-[#880E4F] transition-colors disabled:opacity-50 active:scale-[0.98]"
              >
                {submitting ? 'Spracovávam...' : '✓ Dokončiť predaj'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
