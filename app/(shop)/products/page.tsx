import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/shop/ProductCard'
import type { Metadata } from 'next'
import { SlidersHorizontal } from 'lucide-react'

export const metadata: Metadata = { title: 'Produkty' }

interface Props { searchParams: Promise<{ category?: string; sort?: string; min?: string; max?: string }> }

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams
  const supabase = await createClient()
  let query = supabase
    .from('products')
    .select('*, images:product_images(*), category:categories(name,slug)')
    .eq('is_active', true)

  if (params.category) query = query.eq('category_id', params.category)
  if (params.min) query = query.gte('price', Number(params.min))
  if (params.max) query = query.lte('price', Number(params.max))

  if (params.sort === 'price_asc') query = query.order('price')
  else if (params.sort === 'price_desc') query = query.order('price', { ascending: false })
  else query = query.order('created_at', { ascending: false })

  const { data: products = [] } = await query

  const { data: categories = [] } = await supabase
    .from('categories').select('id,name,slug').eq('is_active', true)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-3xl shadow-soft p-6 sticky top-24">
            <div className="flex items-center gap-2 mb-6">
              <SlidersHorizontal className="w-5 h-5 text-[#C2185B]" />
              <h2 className="font-semibold text-[#880E4F]">Filtre</h2>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Kategória</h3>
              <div className="space-y-2">
                <a href="/products" className={`block px-3 py-2 rounded-xl text-sm transition-colors ${!params.category ? 'bg-[#FFF0F7] text-[#C2185B] font-medium' : 'text-gray-600 hover:bg-[#FFF0F7]'}`}>
                  Všetky
                </a>
                {categories?.map((c: any) => (
                  <a key={c.id} href={`/products?category=${c.id}`}
                    className={`block px-3 py-2 rounded-xl text-sm transition-colors ${params.category === c.id ? 'bg-[#FFF0F7] text-[#C2185B] font-medium' : 'text-gray-600 hover:bg-[#FFF0F7]'}`}
                  >{c.name}</a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Zoradiť podľa</h3>
              <div className="space-y-2">
                {[['', 'Najnovšie'], ['price_asc', 'Cena: od najnižšej'], ['price_desc', 'Cena: od najvyššej']].map(([val, label]) => (
                  <a key={val} href={`/products?${new URLSearchParams({ ...(params.category && { category: params.category }), sort: val })}`}
                    className={`block px-3 py-2 rounded-xl text-sm transition-colors ${params.sort === val || (!params.sort && !val) ? 'bg-[#FFF0F7] text-[#C2185B] font-medium' : 'text-gray-600 hover:bg-[#FFF0F7]'}`}
                  >{label}</a>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Products grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-display font-bold text-[#880E4F]">
              {params.category ? categories?.find((c: any) => c.id === params.category)?.name : 'Všetky produkty'}
            </h1>
            <span className="text-sm text-gray-500">{products?.length} produktov</span>
          </div>

          {products?.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-lg font-medium">Žiadne produkty nenájdené</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {products?.map((p: any, i: number) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
