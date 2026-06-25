'use client'
import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/lib/utils'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore()

  if (!items.length) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-gray-400">
      <ShoppingBag className="w-20 h-20 mb-4 text-[#FFB6D9]" />
      <p className="text-xl font-medium mb-2">Košík je prázdny</p>
      <Link href="/products" className="mt-4 text-[#C2185B] font-semibold hover:underline">Prezrieť produkty</Link>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-display font-bold text-[#880E4F] mb-8">Košík</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {items.map(item => (
              <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-3xl shadow-soft p-5 flex gap-4 border border-pink-50"
              >
                <div className="w-24 h-24 bg-[#FFF0F7] rounded-2xl overflow-hidden shrink-0 relative">
                  {item.product.images?.[0] ? <Image src={item.product.images[0].url} alt={item.product.name} fill className="object-cover" /> : <div className="absolute inset-0 flex items-center justify-center text-3xl">💎</div>}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{item.product.name}</p>
                  {item.custom_options && <p className="text-xs text-[#C2185B] mt-0.5">Custom naramok</p>}
                  <p className="text-[#C2185B] font-bold mt-1">{formatPrice(item.custom_options?.total_price ?? item.product.price)}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 rounded-lg bg-[#FFF0F7] flex items-center justify-center hover:bg-[#FFB6D9]/30"><Minus className="w-3 h-3" /></button>
                    <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 rounded-lg bg-[#FFF0F7] flex items-center justify-center hover:bg-[#FFB6D9]/30"><Plus className="w-3 h-3" /></button>
                  </div>
                </div>
                <button onClick={() => removeItem(item.id)} className="p-2 text-gray-300 hover:text-red-400 self-start"><Trash2 className="w-4 h-4" /></button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div className="bg-white rounded-3xl shadow-soft p-6 border border-pink-50 h-fit sticky top-24">
          <h2 className="font-display font-semibold text-[#880E4F] mb-4">Súhrn</h2>
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between"><span className="text-gray-500">Medzisúčet</span><span>{formatPrice(getTotalPrice())}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Doprava</span><span className="text-emerald-600">od 2.49 €</span></div>
          </div>
          <div className="flex justify-between font-bold text-lg text-[#C2185B] border-t border-pink-100 pt-3 mb-5">
            <span>Spolu</span><span>{formatPrice(getTotalPrice())}</span>
          </div>
          <Link href="/checkout" className="block w-full bg-[#C2185B] text-white text-center py-3.5 rounded-2xl font-semibold hover:bg-[#880E4F] transition-colors shadow-soft">
            Pokračovať k pokladni
          </Link>
        </div>
      </div>
    </div>
  )
}
