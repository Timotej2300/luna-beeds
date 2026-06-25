import Link from 'next/link'
import { Sparkles, Star, Globe, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#FFF0F7] border-t border-pink-100 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#FFB6D9] to-[#C2185B] rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-display font-bold text-[#C2185B]">Luna&Beeds</span>
            </div>
            <p className="text-sm text-gray-600">Luxusné handmade šperky a naramky vyrobené s láskou.</p>
            <div className="flex gap-3">
              <a href="#" className="p-2 rounded-xl bg-white hover:bg-[#FFB6D9] text-gray-500 hover:text-[#C2185B] transition-all shadow-soft">
                <Star className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-xl bg-white hover:bg-[#FFB6D9] text-gray-500 hover:text-[#C2185B] transition-all shadow-soft">
                <Globe className="w-4 h-4" />
              </a>
              <a href="mailto:info@lunabeeds.sk" className="p-2 rounded-xl bg-white hover:bg-[#FFB6D9] text-gray-500 hover:text-[#C2185B] transition-all shadow-soft">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-[#C2185B] mb-4">Obchod</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {[['Produkty', '/products'], ['Kategórie', '/categories'], ['Custom Naramok', '/custom-bracelet'], ['Novinky', '/products?tag=novinky']].map(([label, href]) => (
                <li key={href}><Link href={href} className="hover:text-[#C2185B] transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-[#C2185B] mb-4">Informácie</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {[['O nás', '/o-nas'], ['Kontakt', '/contact'], ['FAQ', '/faq'], ['Reklamácie', '/reklamacie']].map(([label, href]) => (
                <li key={href}><Link href={href} className="hover:text-[#C2185B] transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-[#C2185B] mb-4">Právne</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {[['GDPR', '/gdpr'], ['Obchodné podmienky', '/obchodne-podmienky'], ['Ochrana súkromia', '/gdpr']].map(([label, href]) => (
                <li key={href}><Link href={href} className="hover:text-[#C2185B] transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-pink-200 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Luna&Beeds. Všetky práva vyhradené.</p>
          <p>Vyrobené s ❤️ na Slovensku</p>
        </div>
      </div>
    </footer>
  )
}
