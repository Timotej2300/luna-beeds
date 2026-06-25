import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'

const FALLBACK_CATEGORIES = [
  { id: '1', name: 'Naramky', slug: 'naramky', icon: '💎', color: '#FFB6D9' },
  { id: '2', name: 'Custom Naramky', slug: 'custom-naramky', icon: '✨', color: '#C2185B' },
  { id: '3', name: 'Novinky', slug: 'novinky', icon: '🌸', color: '#880E4F' },
  { id: '4', name: 'Náhrdelníky', slug: 'nahrdelníky', icon: '💕', color: '#FF8EC7' },
]

async function getCategories() {
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('categories').select('*').eq('is_active', true).order('position')
    return data?.length ? data : FALLBACK_CATEGORIES
  } catch { return FALLBACK_CATEGORIES }
}

export default async function CategoryGrid() {
  const categories = await getCategories()

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h2 className="text-3xl font-display font-bold text-[#880E4F] mb-8 text-center">Kategórie</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((cat: any) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className="group relative overflow-hidden rounded-3xl aspect-square flex items-end p-6 hover:shadow-card transition-all duration-300"
            style={{ background: `linear-gradient(135deg, ${cat.color}30, ${cat.color}60)` }}
          >
            {cat.image_url ? (
              <Image src={cat.image_url} alt={cat.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-30 group-hover:opacity-50 group-hover:scale-110 transition-all duration-500">
                {cat.icon || '💎'}
              </div>
            )}
            <div className="relative z-10">
              <h3 className="text-white font-display font-bold text-lg drop-shadow-sm">{cat.name}</h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
