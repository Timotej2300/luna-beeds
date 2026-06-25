import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Obchodné podmienky' }
export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-display font-bold text-[#880E4F] mb-8">Obchodné podmienky</h1>
      <div className="space-y-6 text-gray-700">
        {[
          ['1. Všeobecné ustanovenia', 'Tieto obchodné podmienky upravujú vzťahy medzi predávajúcim Luna&Beeds a kupujúcim pri nákupe tovaru prostredníctvom e-shopu lunabeeds.sk.'],
          ['2. Objednávka', 'Objednávka je záväzná po jej potvrdení e-mailom. Predávajúci si vyhradzuje právo odmietnuť objednávku v prípade nedostupnosti tovaru.'],
          ['3. Ceny a platba', 'Všetky ceny sú uvedené v EUR vrátane DPH. Akceptujeme platby kartou (Stripe) a cez PayPal.'],
          ['4. Dodacie podmienky', 'Tovar expedujeme do 2 pracovných dní od potvrdenia platby. Doprava na celom území SR.'],
          ['5. Odstúpenie od zmluvy', 'Kupujúci má právo odstúpiť od zmluvy do 14 dní od prevzatia tovaru bez udania dôvodu, okrem custom produktov vyrobených na zákazku.'],
          ['6. Reklamácie', 'Reklamácie vybavujeme do 30 dní. Podrobnosti v sekcii Reklamácie.'],
        ].map(([title, text]) => (
          <section key={title} className="bg-white rounded-3xl shadow-soft p-8 border border-pink-50">
            <h2 className="text-xl font-display font-bold text-[#C2185B] mb-3">{title}</h2>
            <p>{text}</p>
          </section>
        ))}
      </div>
    </div>
  )
}
