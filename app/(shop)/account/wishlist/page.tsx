'use client'
import { useWishlistStore } from '@/store/wishlist'
import ProductCard from '@/components/shop/ProductCard'
import { Heart } from 'lucide-react'
import Link from 'next/link'

export default function WishlistPage() {
  const items = useWishlistStore(s => s.items)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-display font-bold text-[#880E4F] mb-8">Wishlist</h1>

      {items.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Heart className="w-16 h-16 mx-auto mb-4 text-[#FFB6D9]" />
          <p className="text-lg font-medium">Váš wishlist je prázdny</p>
          <Link href="/products" className="mt-4 inline-block text-[#C2185B] hover:underline font-medium">
            Prezrieť produkty
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      )}
    </div>
  )
}
