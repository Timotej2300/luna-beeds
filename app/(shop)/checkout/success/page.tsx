'use client'
import { useEffect } from 'react'
import { useCartStore } from '@/store/cart'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
export default function CheckoutSuccessPage() {
  const clearCart = useCartStore(s => s.clearCart)
  useEffect(() => { clearCart() }, [clearCart])
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
          className="w-24 h-24 bg-gradient-to-br from-[#FFB6D9] to-[#C2185B] rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-12 h-12 text-white" />
        </motion.div>
        <h1 className="text-3xl font-display font-bold text-[#880E4F] mb-3">Objednávka prijatá! 🎉</h1>
        <p className="text-gray-500 mb-8">Ďakujeme za váš nákup. Potvrdenie sme odoslali na váš e-mail.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/account/orders" className="bg-[#C2185B] text-white px-6 py-3 rounded-2xl font-semibold hover:bg-[#880E4F] transition-colors shadow-soft">
            Zobraziť objednávky
          </Link>
          <Link href="/products" className="border-2 border-[#C2185B] text-[#C2185B] px-6 py-3 rounded-2xl font-semibold hover:bg-[#C2185B] hover:text-white transition-colors">
            Pokračovať v nákupe
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
