import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', { apiVersion: '2026-05-27.dahlia' })

export async function POST(req: NextRequest) {
  const { orderId, items, total } = await req.json()
  const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL

  const stripe = getStripe()
  const lineItems = items.map((item: any) => ({
    price_data: {
      currency: 'eur',
      product_data: {
        name: item.product.name,
        images: item.product.images?.[0] ? [item.product.images[0].url] : [],
      },
      unit_amount: Math.round((item.custom_options?.total_price ?? item.product.price) * 100),
    },
    quantity: item.quantity,
  }))

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
    cancel_url: `${origin}/checkout?cancelled=true`,
    metadata: { orderId },
    shipping_options: [{
      shipping_rate_data: {
        type: 'fixed_amount',
        fixed_amount: { amount: 399, currency: 'eur' },
        display_name: 'Štandardná doprava',
        delivery_estimate: { minimum: { unit: 'business_day', value: 1 }, maximum: { unit: 'business_day', value: 3 } },
      },
    }],
  })

  return NextResponse.json({ url: session.url })
}
