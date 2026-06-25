'use client'
import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-6xl mb-6">😔</div>
      <h1 className="text-2xl font-display font-bold text-[#880E4F] mb-2">Nastala chyba</h1>
      <p className="text-gray-500 mb-6">Ospravedlňujeme sa za nepríjemnosti.</p>
      <div className="flex gap-3">
        <button onClick={reset} className="bg-[#C2185B] text-white px-6 py-3 rounded-2xl font-semibold hover:bg-[#880E4F] transition-colors">Skúsiť znova</button>
        <Link href="/" className="border-2 border-[#C2185B] text-[#C2185B] px-6 py-3 rounded-2xl font-semibold hover:bg-[#C2185B] hover:text-white transition-colors">Domov</Link>
      </div>
    </div>
  )
}
