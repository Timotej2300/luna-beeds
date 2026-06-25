'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ShoppingBag, RotateCcw } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { BeadOption, CharmOption } from '@/types'

const BEADS: BeadOption[] = [
  { id: 'b1', name: 'Ružová perla', color: '#FFB6D9', price: 0.5 },
  { id: 'b2', name: 'Biela perla', color: '#F5F5F5', price: 0.5 },
  { id: 'b3', name: 'Zlatá perla', color: '#FFD700', price: 0.8 },
  { id: 'b4', name: 'Ružový krištáľ', color: '#FF69B4', price: 1.0 },
  { id: 'b5', name: 'Fialová perla', color: '#DDA0DD', price: 0.7 },
  { id: 'b6', name: 'Strieborná perla', color: '#C0C0C0', price: 0.6 },
  { id: 'b7', name: 'Červená perla', color: '#DC143C', price: 0.6 },
  { id: 'b8', name: 'Tyrkysová perla', color: '#40E0D0', price: 0.7 },
]

const CHARMS: CharmOption[] = [
  { id: 'c1', name: 'Srdiečko', icon: '💖', price: 1.5 },
  { id: 'c2', name: 'Hviezda', icon: '⭐', price: 1.2 },
  { id: 'c3', name: 'Mesiac', icon: '🌙', price: 1.3 },
  { id: 'c4', name: 'Kvet', icon: '🌸', price: 1.0 },
  { id: 'c5', name: 'Diamant', icon: '💎', price: 2.0 },
  { id: 'c6', name: 'Motýľ', icon: '🦋', price: 1.4 },
]

const SIZES = ['XS (14cm)', 'S (16cm)', 'M (18cm)', 'L (20cm)', 'XL (22cm)']
const BASE_PRICE = 4.99

export default function CustomBraceletPage() {
  const [selectedBeads, setSelectedBeads] = useState<BeadOption[]>([])
  const [selectedCharms, setSelectedCharms] = useState<CharmOption[]>([])
  const [letters, setLetters] = useState('')
  const [size, setSize] = useState('M (18cm)')
  const addItem = useCartStore(s => s.addItem)

  const totalPrice = BASE_PRICE
    + selectedBeads.reduce((s, b) => s + b.price, 0)
    + selectedCharms.reduce((s, c) => s + c.price, 0)
    + letters.length * 0.3

  const addBead = (bead: BeadOption) => {
    if (selectedBeads.length >= 20) { toast.error('Max 20 koráikov'); return }
    setSelectedBeads(b => [...b, { ...bead, id: bead.id + Date.now() }])
  }

  const removeBead = (idx: number) => setSelectedBeads(b => b.filter((_, i) => i !== idx))

  const toggleCharm = (charm: CharmOption) =>
    setSelectedCharms(c => c.some(x => x.id === charm.id) ? c.filter(x => x.id !== charm.id) : [...c, charm])

  const reset = () => { setSelectedBeads([]); setSelectedCharms([]); setLetters(''); setSize('M (18cm)') }

  const handleAddToCart = () => {
    const fakeProduct = {
      id: 'custom-bracelet',
      name: 'Custom Naramok',
      slug: 'custom-bracelet',
      description: 'Vlastný naramok',
      price: totalPrice,
      stock: 99,
      category_id: '',
      images: [],
      is_active: true,
      is_featured: false,
      tags: [],
      created_at: '',
      updated_at: '',
    }
    addItem(fakeProduct, 1, { beads: selectedBeads, letters, charms: selectedCharms, size, color: '#FFB6D9', total_price: totalPrice })
    toast.success('Custom naramok pridaný do košíka! 💎')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-2 bg-[#FFB6D9]/30 text-[#C2185B] px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" /> Custom Builder
        </span>
        <h1 className="text-4xl font-display font-bold text-[#880E4F] mb-2">Vytvor si vlastný naramok</h1>
        <p className="text-gray-500">Vyber koráiky, písmená a prívesky – cena sa aktualizuje automaticky</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Builder */}
        <div className="lg:col-span-2 space-y-8">
          {/* Beads */}
          <div className="bg-white rounded-3xl shadow-soft p-6">
            <h2 className="font-display font-semibold text-[#880E4F] text-lg mb-4">1. Koráiky ({selectedBeads.length}/20)</h2>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {BEADS.map(bead => (
                <motion.button key={bead.id} whileTap={{ scale: 0.9 }} onClick={() => addBead(bead)}
                  className="flex flex-col items-center gap-1 p-2 rounded-2xl hover:bg-[#FFF0F7] transition-colors group"
                  title={bead.name}
                >
                  <div className="w-10 h-10 rounded-full shadow-soft border-2 border-white group-hover:scale-110 transition-transform" style={{ backgroundColor: bead.color }} />
                  <span className="text-xs text-gray-500 text-center leading-tight">{bead.name.split(' ')[0]}</span>
                  <span className="text-xs text-[#C2185B] font-medium">+{formatPrice(bead.price)}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Letters */}
          <div className="bg-white rounded-3xl shadow-soft p-6">
            <h2 className="font-display font-semibold text-[#880E4F] text-lg mb-4">2. Písmená (max 10)</h2>
            <input
              value={letters} onChange={e => setLetters(e.target.value.toUpperCase().slice(0, 10))}
              placeholder="napr. LUNA"
              className="w-full px-4 py-3 rounded-2xl border border-pink-200 outline-none focus:border-[#C2185B] focus:ring-2 focus:ring-[#FFB6D9]/30 text-2xl font-bold tracking-widest text-center text-[#C2185B]"
            />
            {letters && <p className="text-xs text-gray-400 mt-2 text-center">+{formatPrice(letters.length * 0.3)} za {letters.length} písmená</p>}
          </div>

          {/* Charms */}
          <div className="bg-white rounded-3xl shadow-soft p-6">
            <h2 className="font-display font-semibold text-[#880E4F] text-lg mb-4">3. Prívesky</h2>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {CHARMS.map(charm => {
                const selected = selectedCharms.some(c => c.id === charm.id)
                return (
                  <motion.button key={charm.id} whileTap={{ scale: 0.9 }} onClick={() => toggleCharm(charm)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all ${selected ? 'border-[#C2185B] bg-[#FFF0F7]' : 'border-transparent hover:bg-[#FFF0F7]'}`}
                  >
                    <span className="text-3xl">{charm.icon}</span>
                    <span className="text-xs text-gray-600 font-medium">{charm.name}</span>
                    <span className="text-xs text-[#C2185B]">+{formatPrice(charm.price)}</span>
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Size */}
          <div className="bg-white rounded-3xl shadow-soft p-6">
            <h2 className="font-display font-semibold text-[#880E4F] text-lg mb-4">4. Veľkosť</h2>
            <div className="flex flex-wrap gap-3">
              {SIZES.map(s => (
                <button key={s} onClick={() => setSize(s)}
                  className={`px-4 py-2 rounded-xl border-2 font-medium text-sm transition-all ${size === s ? 'border-[#C2185B] bg-[#FFF0F7] text-[#C2185B]' : 'border-gray-200 text-gray-600 hover:border-[#FFB6D9]'}`}
                >{s}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Preview & summary */}
        <div className="space-y-6">
          {/* Live preview */}
          <div className="bg-white rounded-3xl shadow-soft p-6 sticky top-24">
            <h2 className="font-display font-semibold text-[#880E4F] text-lg mb-4">Náhľad 👁️</h2>
            <div className="bg-gradient-to-br from-[#FFF0F7] to-[#FFD6EC] rounded-2xl p-6 min-h-40 flex flex-col items-center justify-center">
              <div className="flex flex-wrap gap-1 justify-center mb-3 max-w-48">
                {selectedBeads.length === 0 && selectedCharms.length === 0 && !letters ? (
                  <p className="text-gray-400 text-sm text-center">Začni pridávať koráiky ✨</p>
                ) : (
                  <>
                    {selectedBeads.map((b, i) => (
                      <motion.button key={i} onClick={() => removeBead(i)} initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="w-6 h-6 rounded-full border-2 border-white shadow-sm hover:scale-125 transition-transform"
                        style={{ backgroundColor: b.color }} title={`Odstrániť ${b.name}`}
                      />
                    ))}
                    {letters && (
                      <div className="flex gap-0.5 mt-1">
                        {letters.split('').map((l, i) => (
                          <span key={i} className="w-5 h-5 bg-[#C2185B] text-white text-xs font-bold rounded flex items-center justify-center">{l}</span>
                        ))}
                      </div>
                    )}
                    {selectedCharms.map(c => <span key={c.id} className="text-xl">{c.icon}</span>)}
                  </>
                )}
              </div>
              <p className="text-xs text-gray-400">Klik na koráik ho odstráni</p>
            </div>

            <div className="mt-6 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Základ:</span><span>{formatPrice(BASE_PRICE)}</span></div>
              {selectedBeads.length > 0 && <div className="flex justify-between text-gray-600"><span>Koráiky ({selectedBeads.length}x):</span><span>{formatPrice(selectedBeads.reduce((s,b)=>s+b.price,0))}</span></div>}
              {letters && <div className="flex justify-between text-gray-600"><span>Písmená:</span><span>{formatPrice(letters.length * 0.3)}</span></div>}
              {selectedCharms.length > 0 && <div className="flex justify-between text-gray-600"><span>Prívesky:</span><span>{formatPrice(selectedCharms.reduce((s,c)=>s+c.price,0))}</span></div>}
              <div className="flex justify-between text-[#C2185B] font-bold text-lg border-t border-pink-100 pt-2">
                <span>Celkom:</span><span>{formatPrice(totalPrice)}</span>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <button onClick={handleAddToCart}
                className="w-full flex items-center justify-center gap-2 bg-[#C2185B] text-white py-3.5 rounded-2xl font-semibold hover:bg-[#880E4F] transition-colors shadow-soft"
              >
                <ShoppingBag className="w-5 h-5" /> Pridať do košíka
              </button>
              <button onClick={reset}
                className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-[#C2185B] text-sm transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Začať odznova
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
