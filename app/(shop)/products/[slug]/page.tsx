'use client'
import { use, useEffect, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Heart, ShoppingBag, Star, Truck, Shield, RotateCcw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/store/cart'
import { useWishlistStore } from '@/store/wishlist'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Product } from '@/types'

interface Props { params: Promise<{ slug: string }> }

export default function ProductPage({ params }: Props) {
  const { slug } = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [activeImg, setActiveImg] = useState(0)
  const addItem = useCartStore(s => s.addItem)
  const { toggleItem, hasItem } = useWishlistStore()

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('products')
        .select('*, images:product_images(*), category:categories(name,slug)')
        .eq('slug', slug)
        .single()
      setProduct(data)
      setLoading(false)
    }
    fetch()
  }, [slug])

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-12">
      <div className="aspect-square bg-gradient-to-br from-[#FFF0F7] to-[#FFD6EC] rounded-3xl animate-pulse" />
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => <div key={i} className="h-6 bg-gray-100 rounded-xl animate-pulse" style={{ width: `${80 - i * 10}%` }} />)}
      </div>
    </div>
  )

  if (!product) return (
    <div className="text-center py-32 text-gray-400">
      <div className="text-6xl mb-4">🔍</div>
      <p className="text-xl font-medium">Produkt nenájdený</p>
    </div>
  )

  const inWishlist = hasItem(product.id)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        {/* Images */}
        <div>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="relative aspect-square bg-gradient-to-br from-[#FFF0F7] to-[#FFD6EC] rounded-3xl overflow-hidden mb-4"
          >
            {product.images?.[activeImg] ? (
              <Image src={product.images[activeImg].url} alt={product.name} fill className="object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-8xl">💎</div>
            )}
          </motion.div>
          {product.images?.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, i) => (
                <button key={img.id} onClick={() => setActiveImg(i)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-colors ${activeImg === i ? 'border-[#C2185B]' : 'border-transparent'}`}
                >
                  <Image src={img.url} alt={product.name} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          {product.category && (
            <span className="text-sm text-[#C2185B] font-medium">{(product.category as any).name}</span>
          )}
          <h1 className="text-3xl font-display font-bold text-[#880E4F] mt-2 mb-4">{product.name}</h1>

          <div className="flex items-center gap-2 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-4 h-4 ${i < 4 ? 'text-[#FFB6D9] fill-[#FFB6D9]' : 'text-gray-200 fill-gray-200'}`} />
            ))}
            <span className="text-sm text-gray-400">(12 recenzií)</span>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl font-bold text-[#C2185B]">{formatPrice(product.price)}</span>
            {product.compare_price && <span className="text-xl text-gray-400 line-through">{formatPrice(product.compare_price)}</span>}
          </div>

          <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2 bg-[#FFF0F7] rounded-2xl p-1">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-gray-600 hover:text-[#C2185B] shadow-soft font-bold">−</button>
              <span className="w-8 text-center font-semibold">{qty}</span>
              <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-gray-600 hover:text-[#C2185B] shadow-soft font-bold">+</button>
            </div>
            <span className="text-sm text-gray-400">Na sklade: {product.stock} ks</span>
          </div>

          <div className="flex gap-3 mb-8">
            <button
              disabled={product.stock === 0}
              onClick={() => { addItem(product, qty); toast.success('Pridané do košíka! 🛍️') }}
              className="flex-1 flex items-center justify-center gap-2 bg-[#C2185B] text-white py-4 rounded-2xl font-semibold hover:bg-[#880E4F] transition-colors disabled:opacity-50 shadow-soft"
            >
              <ShoppingBag className="w-5 h-5" />
              {product.stock === 0 ? 'Vypredané' : 'Pridať do košíka'}
            </button>
            <button
              onClick={() => toggleItem(product)}
              className={`p-4 rounded-2xl border-2 transition-colors ${inWishlist ? 'border-[#C2185B] bg-[#FFF0F7] text-[#C2185B]' : 'border-gray-200 text-gray-400 hover:border-[#C2185B] hover:text-[#C2185B]'}`}
            >
              <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-pink-100 pt-6">
            {[[<Truck className="w-5 h-5" />, 'Doprava do 3 dní'], [<Shield className="w-5 h-5" />, 'Bezpečná platba'], [<RotateCcw className="w-5 h-5" />, '14 dní na vrátenie']].map(([icon, label]: any, i) => (
              <div key={i} className="text-center text-sm text-gray-500">
                <div className="text-[#C2185B] flex justify-center mb-1">{icon}</div>
                {label}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
