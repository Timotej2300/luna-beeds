import Link from 'next/link'
export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-8xl mb-6">🔍</div>
      <h1 className="text-4xl font-display font-bold text-[#880E4F] mb-2">404</h1>
      <p className="text-xl text-gray-500 mb-6">Stránka nenájdená</p>
      <Link href="/" className="bg-[#C2185B] text-white px-8 py-3.5 rounded-2xl font-semibold hover:bg-[#880E4F] transition-colors shadow-soft">
        Späť domov
      </Link>
    </div>
  )
}
