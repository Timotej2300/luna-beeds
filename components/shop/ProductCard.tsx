'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingBag, Star } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { useWishlistStore } from '@/store/wishlist'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/types'
import toast from 'react-hot-toast'

interface Props { product: Product; index?: number }

export default function ProductCard({ product, index = 0 }: Props) {
  const addItem = useCartStore(s => s.addItem)
  const { toggleItem, hasItem } = useWishlistStore()
  const inWishlist = hasItem(product.id)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -6 }}
      className="group bg-white rounded-3xl shadow-soft border border-pink-50 overflow-hidden"
    >
      <Link href={`/products/${product.slug}`} className="block relative">
        <div className="relative h-64 bg-gradient-to-br from-[#FFF0F7] to-[#FFD6EC] overflow-hidden">
          {product.images?.[0] ? (
            <Image
              src={product.images[0].url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-[#FFB6D9] text-6xl">💎</div>
          )}
          {product.compare_price && (
            <div className="absolute top-3 left-3 bg-[#C2185B] text-white text-xs font-bold px-2 py-1 rounded-lg">
              -{Math.round((1 - product.price / product.compare_price) * 100)}%
            </div>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <span className="bg-gray-800 text-white text-sm px-4 py-2 rounded-xl">Vypredané</span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-gray-800 hover:text-[#C2185B] transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1 mt-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-3 h-3 ${i < 4 ? 'text-[#FFB6D9] fill-[#FFB6D9]' : 'text-gray-200 fill-gray-200'}`} />
          ))}
          <span className="text-xs text-gray-400 ml-1">(12)</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-[#C2185B]">{formatPrice(product.price)}</span>
            {product.compare_price && (
              <span className="ml-2 text-sm text-gray-400 line-through">{formatPrice(product.compare_price)}</span>
            )}
          </div>

          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => toggleItem(product)}
              className={`p-2 rounded-xl transition-colors ${inWishlist ? 'bg-[#FFB6D9] text-[#C2185B]' : 'bg-[#FFF0F7] text-gray-400 hover:bg-[#FFB6D9] hover:text-[#C2185B]'}`}
            >
              <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              disabled={product.stock === 0}
              onClick={() => {
                addItem(product)
                toast.success('Pridané do košíka! 🛍️')
              }}
              className="p-2 rounded-xl bg-[#C2185B] text-white hover:bg-[#880E4F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingBag className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
