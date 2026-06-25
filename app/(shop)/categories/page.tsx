import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Kategórie' }
export default async function CategoriesPage() {
  const supabase = await createClient()
  const { data: categories = [] } = await supabase.from('categories').select('*').eq('is_active', true).order('position')
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-display font-bold text-[#880E4F] mb-8">Kategórie</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {(categories?.length ? categories : [
          { id: '1', name: 'Naramky', slug: 'naramky', icon: '💎' },
          { id: '2', name: 'Custom Naramky', slug: 'custom-naramky', icon: '✨' },
          { id: '3', name: 'Novinky', slug: 'novinky', icon: '🌸' },
        ]).map((cat: any) => (
          <Link key={cat.id} href={`/products?category=${cat.id}`}
            className="group relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-[#FFF0F7] to-[#FFD6EC] hover:shadow-card transition-all"
          >
            {cat.image_url
              ? <Image src={cat.image_url} alt={cat.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              : <div className="absolute inset-0 flex items-center justify-center text-7xl opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-500">{cat.icon || '💎'}</div>
            }
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#C2185B]/70 to-transparent p-5">
              <h2 className="text-white font-display font-bold text-lg">{cat.name}</h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
