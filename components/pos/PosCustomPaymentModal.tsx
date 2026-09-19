'use client'
import { useState } from 'react'
import { X } from 'lucide-react'
import type { PosCartItem } from '@/types/pos'

interface Props {
  onAdd: (item: Omit<PosCartItem, 'key'>) => void
  onClose: () => void
}

export default function PosCustomPaymentModal({ onAdd, onClose }: Props) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [qty, setQty] = useState('1')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const quantity = Math.max(1, parseInt(qty) || 1)
    const unit_price = parseFloat(price)
    if (!name.trim() || isNaN(unit_price) || unit_price <= 0) return
    onAdd({
      type: 'custom',
      name: name.trim(),
      quantity,
      unit_price,
      total: unit_price * quantity,
    })
    onClose()
  }

  const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#C2185B] focus:ring-2 focus:ring-[#FFB6D9]/20'

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-card">
        <div className="flex items-center justify-between p-5 border-b border-pink-50">
          <h2 className="font-display font-bold text-[#880E4F]">Vlastná platba</h2>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Názov / popis *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="napr. Oprava náramku"
              required
              autoFocus
              className={inputCls}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Cena (€) *</label>
              <input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="0.00"
                min="0.01"
                step="0.01"
                required
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Množstvo</label>
              <input
                type="number"
                value={qty}
                onChange={e => setQty(e.target.value)}
                min="1"
                className={inputCls}
              />
            </div>
          </div>
          {name && price && (
            <div className="bg-[#FFF0F7] rounded-xl px-4 py-3 text-sm">
              <span className="text-gray-500">Spolu: </span>
              <span className="font-bold text-[#C2185B]">
                {((parseFloat(price) || 0) * (parseInt(qty) || 1)).toFixed(2)} €
              </span>
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-2xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50">
              Zrušiť
            </button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-2xl bg-[#C2185B] text-white text-sm font-bold hover:bg-[#880E4F] transition-colors">
              Pridať
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
