'use client'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const PayPalCheckout = dynamic(() => import('./PayPalCheckoutClient'), { ssr: false })

export default function PayPalCheckoutPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">Načítavam...</div>}>
      <PayPalCheckout />
    </Suspense>
  )
}
