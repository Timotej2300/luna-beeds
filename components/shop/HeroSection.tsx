'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Sparkles, ArrowRight } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFF0F7] via-white to-[#FFD6EC]" />
      <div className="absolute top-20 right-20 w-80 h-80 bg-[#FFB6D9]/30 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-60 h-60 bg-[#C2185B]/10 rounded-full blur-3xl" />

      {/* Floating decorations */}
      {['💎', '✨', '🌸', '💕', '⭐'].map((emoji, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl select-none pointer-events-none"
          style={{ left: `${15 + i * 18}%`, top: `${20 + (i % 2) * 50}%` }}
          animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.5 }}
        >
          {emoji}
        </motion.div>
      ))}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 bg-[#FFB6D9]/40 text-[#C2185B] px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Handmade s láskou ✨
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-display font-bold text-[#880E4F] leading-tight mb-6"
          >
            Luna
            <span className="text-[#FFB6D9]">&</span>
            <br />Beeds
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-600 mb-8 leading-relaxed"
          >
            Objavte svet luxusných handmade šperkov a naramkov. Každý kúsok je unikátny príbeh vyrozprávaný korálikmi a láskou.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 bg-[#C2185B] text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-[#880E4F] transition-all duration-200 shadow-glow hover:shadow-card"
            >
              Preskúmať kolekciu
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/custom-bracelet"
              className="inline-flex items-center justify-center gap-2 border-2 border-[#C2185B] text-[#C2185B] px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-[#C2185B] hover:text-white transition-all duration-200"
            >
              <Sparkles className="w-5 h-5" />
              Vytvor vlastný naramok
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
