'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, Trash2, Plus, Minus } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'

export default function CartSidebar() {
  const { isOpen, closeCart, items, removeItem, updateQuantity, getTotalPrice } = useCartStore()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={closeCart}
          />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-card"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-pink-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#C2185B]" />
                <h2 className="text-lg font-display font-semibold text-[#880E4F]">Košík</h2>
                <span className="bg-[#FFB6D9] text-[#880E4F] text-xs font-bold px-2 py-0.5 rounded-full">{items.length}</span>
              </div>
              <button onClick={closeCart} className="p-2 rounded-xl hover:bg-[#FFF0F7] text-gray-400 hover:text-[#C2185B] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <AnimatePresence>
                {items.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 text-gray-400">
                    <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-[#FFB6D9]" />
                    <p className="font-medium">Košík je prázdny</p>
                    <p className="text-sm mt-1">Pridajte niečo krásne 💖</p>
                  </motion.div>
                ) : (
                  items.map(item => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="flex gap-4 p-3 bg-[#FFF0F7] rounded-2xl"
                    >
                      <div className="w-20 h-20 bg-[#FFD6EC] rounded-xl overflow-hidden shrink-0 relative">
                        {item.product.images?.[0] && (
                          <Image src={item.product.images[0].url} alt={item.product.name} fill className="object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 text-sm truncate">{item.product.name}</p>
                        {item.custom_options && <p className="text-xs text-[#C2185B] mt-0.5">Custom naramok</p>}
                        <p className="text-[#C2185B] font-bold mt-1">
                          {formatPrice(item.custom_options ? item.custom_options.total_price : item.product.price)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-gray-500 hover:text-[#C2185B] shadow-soft">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-gray-500 hover:text-[#C2185B] shadow-soft">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors self-start">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-pink-100 space-y-4">
                <div className="flex items-center justify-between text-lg font-bold">
                  <span className="text-gray-700">Spolu:</span>
                  <span className="text-[#C2185B]">{formatPrice(getTotalPrice())}</span>
                </div>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="block w-full bg-[#C2185B] text-white text-center py-3.5 rounded-2xl font-semibold hover:bg-[#880E4F] transition-colors shadow-soft"
                >
                  Pokračovať k pokladni
                </Link>
                <button onClick={closeCart} className="block w-full text-center text-sm text-gray-500 hover:text-[#C2185B] transition-colors">
                  Pokračovať v nákupe
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
