'use client'
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/store/cart'
import toast from 'react-hot-toast'

export default function PayPalCheckoutClient() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const router = useRouter()
  const { getTotalPrice, clearCart } = useCartStore()
  const total = (getTotalPrice() + 3.99).toFixed(2)

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <h1 className="text-2xl font-display font-bold text-[#880E4F] mb-8">Platba cez PayPal</h1>
      <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test', currency: 'EUR' }}>
        <PayPalButtons
          style={{ layout: 'vertical', shape: 'rect', color: 'gold' }}
          createOrder={(_data, actions) => actions.order.create({
            intent: 'CAPTURE',
            purchase_units: [{ amount: { currency_code: 'EUR', value: total } }],
          })}
          onApprove={async (_data, actions) => {
            await actions.order!.capture()
            const supabase = createClient()
            await supabase.from('orders').update({ status: 'paid', payment_status: 'paid' }).eq('id', orderId)
            clearCart()
            toast.success('Platba úspešná! 🎉')
            router.push('/checkout/success')
          }}
          onError={() => toast.error('Platba zlyhala. Skúste znova.')}
        />
      </PayPalScriptProvider>
    </div>
  )
}
