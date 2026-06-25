import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'GDPR & Ochrana súkromia' }
export default function GDPRPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-display font-bold text-[#880E4F] mb-8">GDPR & Ochrana súkromia</h1>
      <div className="prose prose-pink max-w-none space-y-6 text-gray-700">
        <section className="bg-white rounded-3xl shadow-soft p-8 border border-pink-50">
          <h2 className="text-xl font-display font-bold text-[#C2185B] mb-3">1. Správca osobných údajov</h2>
          <p>Správcom vašich osobných údajov je spoločnosť Luna&Beeds, so sídlom na Slovensku. Kontakt: info@lunabeeds.sk</p>
        </section>
        <section className="bg-white rounded-3xl shadow-soft p-8 border border-pink-50">
          <h2 className="text-xl font-display font-bold text-[#C2185B] mb-3">2. Aké údaje zbierame</h2>
          <p>Zbierame iba údaje nevyhnutné na spracovanie vašej objednávky: meno, priezvisko, e-mail, telefónne číslo a doručovaciu adresu.</p>
        </section>
        <section className="bg-white rounded-3xl shadow-soft p-8 border border-pink-50">
          <h2 className="text-xl font-display font-bold text-[#C2185B] mb-3">3. Vaše práva</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Právo na prístup k vašim údajom</li>
            <li>Právo na opravu nesprávnych údajov</li>
            <li>Právo na vymazanie (právo byť zabudnutý)</li>
            <li>Právo na prenosnosť údajov</li>
            <li>Právo namietať spracúvanie</li>
          </ul>
        </section>
        <section className="bg-white rounded-3xl shadow-soft p-8 border border-pink-50">
          <h2 className="text-xl font-display font-bold text-[#C2185B] mb-3">4. Súbory cookies</h2>
          <p>Používame iba nevyhnutné technické cookies pre správnu funkciu košíka a prihlásenia. Nepoužívame žiadne sledovacie cookies bez vášho súhlasu.</p>
        </section>
      </div>
    </div>
  )
}
