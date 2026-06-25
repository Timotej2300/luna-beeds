import { createClient } from '@/lib/supabase/server'
import ProductCard from './ProductCard'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

async function getFeaturedProducts() {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('products')
      .select('*, images:product_images(*), category:categories(name,slug)')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(8)
    return data || []
  } catch { return [] }
}

export default async function FeaturedProducts() {
  const products = await getFeaturedProducts()

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-3xl font-display font-bold text-[#880E4F]">Odporúčané produkty</h2>
          <p className="text-gray-500 mt-1">Naše najobľúbenejšie kúsky</p>
        </div>
        <Link href="/products" className="flex items-center gap-1 text-[#C2185B] font-medium hover:gap-2 transition-all">
          Všetky produkty <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gradient-to-br from-[#FFF0F7] to-[#FFD6EC] rounded-3xl h-80 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product: any, i: number) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      )}
    </section>
  )
}
