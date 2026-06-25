'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Sparkles, Palette, Type, Star } from 'lucide-react'

const features = [
  { icon: <Palette />, label: 'Vyber farby' },
  { icon: <Star />, label: 'Pridaj koráiky' },
  { icon: <Type />, label: 'Vlož písmená' },
  { icon: <Sparkles />, label: 'Live náhľad' },
]

export default function CustomBraceletPromo() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-[#C2185B] to-[#880E4F] rounded-4xl p-12 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" /> Nové! Custom Builder
              </span>
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
                Vytvor si<br />vlastný naramok
              </h2>
              <p className="text-white/80 text-lg mb-8">
                Vyber koráiky, farby, písmená a prívesky. Uvidíš náhľad v reálnom čase a cena sa automaticky prepočíta.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {features.map(f => (
                  <div key={f.label} className="flex items-center gap-3 bg-white/10 rounded-2xl p-3">
                    <div className="text-white/80">{f.icon}</div>
                    <span className="text-sm font-medium">{f.label}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/custom-bracelet"
                className="inline-flex items-center gap-2 bg-white text-[#C2185B] px-8 py-4 rounded-2xl font-bold text-lg hover:bg-[#FFF0F7] transition-colors shadow-lg"
              >
                <Sparkles className="w-5 h-5" />
                Začať tvoriť
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-64 h-64 bg-white/10 rounded-full text-9xl">
                💎
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
