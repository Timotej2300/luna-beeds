'use client'
import { useState } from 'react'
import { Search, PackageX } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface Product {
  id: string
  name: string
  price: number
  stock: number
  category_id: string
  product_images: { url: string; position: number }[]
}

interface Category {
  id: string
  name: string
  slug: string
}

interface Props {
  products: Product[]
  categories: Category[]
  inventoryMap: Record<string, number>
  onAdd: (product: Product) => void
  onReserve: (product: Product) => void
}

export default function PosProductGrid({ products, categories, inventoryMap, onAdd, onReserve }: Props) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = !activeCategory || p.category_id === activeCategory
    return matchSearch && matchCat
  })

  const getStock = (p: Product) => inventoryMap[p.id] ?? p.stock

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b border-pink-50">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Hľadať produkt..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#FFF8FB] border border-pink-100 text-sm outline-none focus:border-[#C2185B] focus:ring-2 focus:ring-[#FFB6D9]/20"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 px-3 py-2 overflow-x-auto border-b border-pink-50 scrollbar-hide">
        <button
          onClick={() => setActiveCategory(null)}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            !activeCategory ? 'bg-[#C2185B] text-white' : 'bg-[#FFF0F7] text-[#C2185B] hover:bg-[#FFB6D9]/30'
          }`}
        >
          Všetky
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeCategory === cat.id ? 'bg-[#C2185B] text-white' : 'bg-[#FFF0F7] text-[#C2185B] hover:bg-[#FFB6D9]/30'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products grid */}
      <div className="flex-1 overflow-y-auto p-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <PackageX className="w-10 h-10 text-[#FFB6D9] mb-2" />
            <p className="text-gray-400 text-sm">Žiadne produkty</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2">
            {filtered.map(product => {
              const stock = getStock(product)
              const inStock = stock > 0
              const img = product.product_images?.sort((a, b) => a.position - b.position)[0]?.url

              return (
                <div key={product.id}
                  className={`bg-white rounded-xl border overflow-hidden transition-all ${
                    inStock ? 'border-pink-50 hover:border-[#FFB6D9] hover:shadow-soft' : 'border-gray-100 opacity-70'
                  }`}
                >
                  {/* Image */}
                  <div className="aspect-square bg-[#FFF8FB] relative overflow-hidden">
                    {img ? (
                      <img src={img} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">💎</div>
                    )}
                    {!inStock && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                        <span className="text-xs font-semibold text-gray-500 bg-white px-2 py-1 rounded-full border">Vypredané</span>
                      </div>
                    )}
                  </div>

                  <div className="p-2">
                    <div className="text-xs font-medium text-gray-800 line-clamp-2 leading-tight mb-1">{product.name}</div>
                    <div className="font-bold text-[#C2185B] text-sm mb-2">{formatPrice(product.price)}</div>
                    <div className="text-xs text-gray-400 mb-2">Sklad: {stock} ks</div>

                    <div className="space-y-1.5">
                      {inStock ? (
                        <button
                          onClick={() => onAdd(product)}
                          className="w-full py-1.5 rounded-lg bg-[#C2185B] text-white text-xs font-semibold hover:bg-[#880E4F] transition-colors active:scale-95"
                        >
                          + Pridať
                        </button>
                      ) : (
                        <button
                          onClick={() => onReserve(product)}
                          className="w-full py-1.5 rounded-lg bg-[#FFF0F7] text-[#C2185B] text-xs font-medium hover:bg-[#FFB6D9]/30 transition-colors border border-[#FFB6D9]"
                        >
                          Rezervovať
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
