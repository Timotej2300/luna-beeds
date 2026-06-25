'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('newsletter_subscribers').insert({ email })
      if (error && error.code === '23505') { toast.error('Tento email je už prihlásený.'); return }
      if (error) throw error
      setDone(true)
      toast.success('Prihlásenie na newsletter úspešné! 🎉')
    } catch {
      toast.error('Nastala chyba. Skúste znova.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto text-center">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <div className="bg-[#FFF0F7] rounded-4xl p-10">
          <Mail className="w-12 h-12 text-[#C2185B] mx-auto mb-4" />
          <h2 className="text-2xl font-display font-bold text-[#880E4F] mb-2">Buď prvá, kto vie o novinkách!</h2>
          <p className="text-gray-500 mb-6">Prihláste sa na newsletter a získajte 10% zľavu na prvý nákup.</p>

          {done ? (
            <div className="flex items-center justify-center gap-2 text-[#C2185B] font-semibold">
              <CheckCircle className="w-5 h-5" /> Ďakujeme za prihlásenie!
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="váš@email.sk"
                className="flex-1 px-4 py-3 rounded-2xl border border-pink-200 outline-none focus:border-[#C2185B] focus:ring-2 focus:ring-[#FFB6D9]/30"
                required
              />
              <button
                type="submit" disabled={loading}
                className="bg-[#C2185B] text-white px-6 py-3 rounded-2xl font-semibold hover:bg-[#880E4F] transition-colors disabled:opacity-50"
              >
                {loading ? '...' : 'Prihlásiť'}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </section>
  )
}
