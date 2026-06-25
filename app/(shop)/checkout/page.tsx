'use client'
import { useState } from 'react'
import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { CreditCard, Wallet, Truck } from 'lucide-react'

const FIELDS = [
  ['first_name', 'Meno', 'text'], ['last_name', 'Priezvisko', 'text'],
  ['email', 'Email', 'email'], ['phone', 'Telefón', 'tel'],
  ['street', 'Ulica a číslo', 'text'], ['zip', 'PSČ', 'text'],
  ['city', 'Mesto', 'text'], ['country', 'Štát', 'text'],
]

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCartStore()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [payMethod, setPayMethod] = useState<'stripe' | 'paypal'>('stripe')
  const [form, setForm] = useState<Record<string,string>>({
    first_name: '', last_name: '', email: '', phone: '',
    street: '', zip: '', city: '', country: 'Slovensko', note: '',
  })

  const total = getTotalPrice()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          status: 'new',
          payment_method: payMethod,
          payment_status: 'pending',
          shipping_address: form,
          subtotal: total,
          shipping_cost: 3.99,
          discount: 0,
          total: total + 3.99,
          note: form.note,
          items: items.map(i => ({
            product_id: i.product.id,
            quantity: i.quantity,
            price: i.custom_options ? i.custom_options.total_price : i.product.price,
            custom_options: i.custom_options,
          })),
        })
        .select()
        .single()

      if (error) throw error

      if (payMethod === 'stripe') {
        const res = await fetch('/api/stripe/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: order.id, items, total: total + 3.99 }),
        })
        const { url } = await res.json()
        if (url) { window.location.href = url; return }
      } else {
        router.push(`/checkout/paypal?orderId=${order.id}`)
        return
      }

      clearCart()
      toast.success('Objednávka odoslaná!')
      router.push(`/account/orders`)
    } catch (err) {
      toast.error('Nastala chyba. Skúste znova.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) return (
    <div className="text-center py-32 text-gray-400">
      <div className="text-6xl mb-4">🛒</div>
      <p className="text-xl font-medium">Košík je prázdny</p>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-display font-bold text-[#880E4F] mb-8">Pokladňa</h1>
      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery info */}
            <div className="bg-white rounded-3xl shadow-soft p-6">
              <h2 className="font-display font-semibold text-[#880E4F] text-lg mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5" /> Doručovacie údaje
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {FIELDS.map(([name, label, type]) => (
                  <div key={name} className={name === 'street' || name === 'email' ? 'col-span-2' : ''}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label} *</label>
                    <input
                      type={type} required
                      value={form[name] || ''}
                      onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 outline-none focus:border-[#C2185B] focus:ring-2 focus:ring-[#FFB6D9]/30"
                    />
                  </div>
                ))}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Poznámka</label>
                  <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                    rows={3} className="w-full px-4 py-3 rounded-2xl border border-gray-200 outline-none focus:border-[#C2185B] focus:ring-2 focus:ring-[#FFB6D9]/30 resize-none"
                    placeholder="Poznámka k objednávke..."
                  />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-3xl shadow-soft p-6">
              <h2 className="font-display font-semibold text-[#880E4F] text-lg mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" /> Platba
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {[['stripe', 'Stripe', <CreditCard key="s" className="w-6 h-6" />], ['paypal', 'PayPal', <Wallet key="p" className="w-6 h-6" />]].map(([val, label, icon]: any) => (
                  <button key={val} type="button" onClick={() => setPayMethod(val)}
                    className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition-all ${payMethod === val ? 'border-[#C2185B] bg-[#FFF0F7]' : 'border-gray-200 hover:border-[#FFB6D9]'}`}
                  >
                    <div className={payMethod === val ? 'text-[#C2185B]' : 'text-gray-400'}>{icon}</div>
                    <span className={`font-semibold ${payMethod === val ? 'text-[#C2185B]' : 'text-gray-600'}`}>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div>
            <div className="bg-white rounded-3xl shadow-soft p-6 sticky top-24">
              <h2 className="font-display font-semibold text-[#880E4F] text-lg mb-4">Súhrn objednávky</h2>
              <div className="space-y-3 mb-4">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate pr-2">{item.product.name} ×{item.quantity}</span>
                    <span className="font-medium shrink-0">{formatPrice((item.custom_options?.total_price ?? item.product.price) * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-pink-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600"><span>Medzisúčet:</span><span>{formatPrice(total)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Doprava:</span><span>{formatPrice(3.99)}</span></div>
                <div className="flex justify-between font-bold text-lg text-[#C2185B] pt-2 border-t border-pink-100">
                  <span>Celkom:</span><span>{formatPrice(total + 3.99)}</span>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full mt-6 bg-[#C2185B] text-white py-4 rounded-2xl font-semibold hover:bg-[#880E4F] transition-colors disabled:opacity-50 shadow-soft"
              >
                {loading ? 'Spracováva sa...' : `Zaplatiť ${formatPrice(total + 3.99)}`}
              </button>
              <p className="text-xs text-gray-400 text-center mt-3">🔒 Bezpečná platba cez SSL</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
