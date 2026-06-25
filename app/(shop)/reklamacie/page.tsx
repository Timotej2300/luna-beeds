import type { Metadata } from 'next'
import Link from 'next/link'
export const metadata: Metadata = { title: 'Reklamácie' }
export default function ReklamaciePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-display font-bold text-[#880E4F] mb-8">Reklamácie</h1>
      <div className="space-y-6">
        <div className="bg-[#FFF0F7] rounded-3xl p-8 border border-pink-100">
          <h2 className="text-xl font-display font-bold text-[#C2185B] mb-3">Ako podať reklamáciu?</h2>
          <ol className="list-decimal pl-5 space-y-2 text-gray-700">
            <li>Kontaktujte nás e-mailom na <a href="mailto:reklamacie@lunabeeds.sk" className="text-[#C2185B] font-medium">reklamacie@lunabeeds.sk</a></li>
            <li>Uveďte číslo objednávky a popis závady</li>
            <li>Priložte fotografie poškodeného tovaru</li>
            <li>Reklamáciu vyriešime do 30 dní</li>
          </ol>
        </div>
        {[
          ['Záručná doba', 'Na všetky naše produkty poskytujeme 24-mesačnú záručnú dobu v súlade so zákonom č. 40/1964 Zb. (Občiansky zákonník).'],
          ['Postup reklamácie', 'Po prijatí reklamácie vás budeme kontaktovať do 3 pracovných dní. Reklamáciu vyriešime opravou, výmenou alebo vrátením peňazí.'],
        ].map(([title, text]) => (
          <div key={title} className="bg-white rounded-3xl shadow-soft p-8 border border-pink-50">
            <h2 className="text-xl font-display font-bold text-[#C2185B] mb-3">{title}</h2>
            <p className="text-gray-700">{text}</p>
          </div>
        ))}
        <div className="text-center">
          <Link href="/contact" className="inline-flex items-center gap-2 bg-[#C2185B] text-white px-8 py-4 rounded-2xl font-semibold hover:bg-[#880E4F] transition-colors shadow-soft">
            Kontaktovať podporu
          </Link>
        </div>
      </div>
    </div>
  )
}
