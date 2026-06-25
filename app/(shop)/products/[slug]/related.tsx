import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/shop/ProductCard'
import type { Metadata } from 'next'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('products').select('name,description').eq('slug', slug).single()
  return { title: data?.name || 'Produkt', description: data?.description || '' }
}

export default async function ProductPageServer({ params }: Props) {
  // The client component handles the main product display
  // This server component just adds related products
  const { slug } = await params
  const supabase = await createClient()
  const { data: product } = await supabase.from('products').select('category_id').eq('slug', slug).single()

  const { data: related = [] } = product?.category_id ? await supabase
    .from('products')
    .select('*, images:product_images(*)')
    .eq('category_id', product.category_id)
    .eq('is_active', true)
    .neq('slug', slug)
    .limit(4)
  : { data: [] }

  return (
    <>
      {related && related.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-pink-100">
          <h2 className="text-2xl font-display font-bold text-[#880E4F] mb-6">Podobné produkty</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((p: any, i: number) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </div>
      )}
    </>
  )
}
