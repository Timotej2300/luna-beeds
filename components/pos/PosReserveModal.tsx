'use client'
import { useState } from 'react'
import { X } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Product {
  id: string
  name: string
  price: number
}

interface Props {
  product: Product
  storeId: string
  onClose: () => void
}

export default function PosReserveModal({ product, storeId, onClose }: Props) {
  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    quantity: '1',
    note: '',
    contact_via: [] as string[],
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<{ order_number: string } | null>(null)

  const toggleContact = (val: string) => {
    setForm(f => ({
      ...f,
      contact_via: f.contact_via.includes(val)
        ? f.contact_via.filter(v => v !== val)
        : [...f.contact_via, val],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/pos/store-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_id: storeId,
          product_id: product.id,
          quantity: parseInt(form.quantity) || 1,
          customer_name: form.customer_name,
          customer_email: form.customer_email || null,
          customer_phone: form.customer_phone || null,
          contact_via: form.contact_via,
          note: form.note || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Chyba'); return }
      setSuccess(data)
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#C2185B] focus:ring-2 focus:ring-[#FFB6D9]/20'

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-card max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-pink-50">
          <h2 className="font-display font-bold text-[#880E4F]">Rezervovať na predajňu</h2>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50">
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-3xl">✓</span>
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Objednávka vytvorená</h3>
            <div className="bg-[#FFF0F7] rounded-2xl p-4 text-left space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Číslo</span>
                <span className="font-mono font-bold text-[#C2185B]">{success.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Produkt</span>
                <span className="font-medium">{product.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Zákazník</span>
                <span className="font-medium">{form.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Stav</span>
                <span className="text-yellow-600 font-medium">Čaká na vybavenie</span>
              </div>
            </div>
            <button onClick={onClose}
              className="w-full py-3 bg-[#C2185B] text-white rounded-2xl font-bold hover:bg-[#880E4F] transition-colors">
              Zatvoriť
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Product info */}
            <div className="bg-[#FFF0F7] rounded-xl px-4 py-3 text-sm flex justify-between">
              <span className="text-gray-600 font-medium">{product.name}</span>
              <span className="font-bold text-[#C2185B]">{formatPrice(product.price)}</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Množstvo</label>
              <input type="number" min="1" value={form.quantity}
                onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                className={inputCls} />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Meno zákazníka *</label>
              <input value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))}
                required placeholder="Ján Novák" className={inputCls} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
                <input type="email" value={form.customer_email}
                  onChange={e => setForm(f => ({ ...f, customer_email: e.target.value }))}
                  placeholder="jan@email.sk" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Telefón</label>
                <input type="tel" value={form.customer_phone}
                  onChange={e => setForm(f => ({ ...f, customer_phone: e.target.value }))}
                  placeholder="+421 9xx xxx xxx" className={inputCls} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Kontaktovať cez</label>
              <div className="flex gap-3">
                {['email', 'phone', 'both'].map(opt => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.contact_via.includes(opt)}
                      onChange={() => toggleContact(opt)}
                      className="w-4 h-4 accent-[#C2185B]" />
                    <span className="text-sm text-gray-600 capitalize">
                      {opt === 'email' ? 'Email' : opt === 'phone' ? 'Telefón' : 'Oboje'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Poznámka</label>
              <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                rows={2} placeholder="Voliteľná poznámka..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#C2185B] resize-none" />
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 py-2.5 rounded-2xl border border-gray-200 text-gray-600 text-sm">
                Zrušiť
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 py-2.5 rounded-2xl bg-[#C2185B] text-white font-bold text-sm hover:bg-[#880E4F] disabled:opacity-50 transition-colors">
                {loading ? 'Ukladám...' : 'Vytvoriť rezerváciu'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
