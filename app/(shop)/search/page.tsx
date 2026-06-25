import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/shop/ProductCard'
import { Search } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Vyhľadávanie' }

interface Props { searchParams: Promise<{ q?: string }> }

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams
  const supabase = await createClient()

  const { data: products = [] } = q ? await supabase
    .from('products')
    .select('*, images:product_images(*), category:categories(name,slug)')
    .eq('is_active', true)
    .or(`name.ilike.%${q}%,description.ilike.%${q}%`)
    .limit(24)
  : { data: [] }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-display font-bold text-[#880E4F] mb-2">Vyhľadávanie</h1>
      {q && <p className="text-gray-500 mb-8">Výsledky pre: <strong className="text-[#C2185B]">"{q}"</strong> — {products?.length} produktov</p>}

      {!q ? (
        <div className="text-center py-20 text-gray-400">
          <Search className="w-16 h-16 mx-auto mb-4 text-[#FFB6D9]" />
          <p className="text-lg">Zadajte hľadaný výraz</p>
        </div>
      ) : products?.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Search className="w-16 h-16 mx-auto mb-4 text-[#FFB6D9]" />
          <p className="text-lg font-medium">Nič sme nenašli</p>
          <p className="text-sm mt-1">Skúste iný výraz</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products?.map((p: any, i: number) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      )}
    </div>
  )
}
