'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const FAQ = [
  { q: 'Ako dlho trvá doručenie?', a: 'Objednávky zvyčajne doručujeme do 2-3 pracovných dní. Pri custom naramkoch môže doručenie trvať 5-7 pracovných dní.' },
  { q: 'Môžem vrátiť tovar?', a: 'Áno, tovar môžete vrátiť do 14 dní od doručenia. Tovar musí byť v pôvodnom stave. Custom naramky sú vyrobené na zákazku a nemôžu byť vrátené.' },
  { q: 'Aké spôsoby platby akceptujete?', a: 'Akceptujeme platby cez Stripe (kreditné/debetné karty) a PayPal.' },
  { q: 'Sú vaše šperky hypoalergénne?', a: 'Väčšina našich produktov je vyrobená z hypoalergénnych materiálov. Detaily sú uvedené pri každom produkte.' },
  { q: 'Ako si správne vymeriam naramok?', a: 'Odporúčame obvod zápästia + 1-2 cm. Napr. ak máte obvod 16 cm, vyberte veľkosť 17-18 cm.' },
  { q: 'Ponúkate darčekové balenie?', a: 'Áno! Všetky objednávky môžu byť zabalené do darčekového balenia. Možnosť vyberiete pri pokladni.' },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-white rounded-2xl shadow-soft border border-pink-50 overflow-hidden">
      <button onClick={() => setOpen(s => !s)} className="w-full px-6 py-4 flex items-center justify-between text-left">
        <span className="font-medium text-gray-800">{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }}><ChevronDown className="w-5 h-5 text-[#C2185B]" /></motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <p className="px-6 pb-4 text-gray-600 text-sm leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-display font-bold text-[#880E4F] mb-3">Časté otázky</h1>
        <p className="text-gray-500">Odpovede na najčastejšie otázky našich zákazníkov</p>
      </div>
      <div className="space-y-3">
        {FAQ.map((item, i) => <FAQItem key={i} {...item} />)}
      </div>
    </div>
  )
}
