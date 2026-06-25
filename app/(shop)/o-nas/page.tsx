import { motion } from 'framer-motion'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'O nás' }

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-display font-bold text-[#880E4F] mb-4">O nás</h1>
        <p className="text-xl text-gray-500">Príbeh Luna&Beeds</p>
      </div>

      <div className="prose prose-lg max-w-none">
        <div className="bg-gradient-to-br from-[#FFF0F7] to-[#FFD6EC] rounded-4xl p-10 mb-10">
          <h2 className="text-2xl font-display font-bold text-[#C2185B] mb-4">Náš príbeh</h2>
          <p className="text-gray-700 leading-relaxed">
            Luna&Beeds vznikol z lásky ku korálkovaniu a handmade šperkom. Každý náš výrobok je ručne vyrobený s dôrazom na kvalitu, detail a originalitu.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {[
            { icon: '💎', title: 'Kvalita', desc: 'Používame len prvotriedne materiály od overených dodávateľov.' },
            { icon: '❤️', title: 'S láskou', desc: 'Každý kúsok je ručne vyrobený a zabalený s osobitnou starostlivosťou.' },
            { icon: '✨', title: 'Originalita', desc: 'Naše dizajny sú unikátne a každý naramok je malé umelecké dielo.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-white rounded-3xl shadow-soft p-6 text-center border border-pink-50">
              <div className="text-4xl mb-3">{icon}</div>
              <h3 className="font-display font-bold text-[#C2185B] mb-2">{title}</h3>
              <p className="text-gray-500 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
