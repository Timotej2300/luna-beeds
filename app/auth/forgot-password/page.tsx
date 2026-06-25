'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles, Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (error) { toast.error(error.message); setLoading(false); return }
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF0F7] to-[#FFD6EC] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-[#FFB6D9] to-[#C2185B] rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-display font-bold text-[#C2185B]">Luna&Beeds</span>
          </Link>
          <h1 className="text-2xl font-display font-bold text-[#880E4F]">Zabudnuté heslo</h1>
        </div>

        <div className="bg-white rounded-3xl shadow-card p-8">
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle className="w-16 h-16 text-[#C2185B] mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-[#880E4F] mb-2">Email odoslaný!</h2>
              <p className="text-gray-500 mb-6">Skontrolujte si emailovú schránku a kliknite na odkaz pre obnovenie hesla.</p>
              <Link href="/auth/login" className="text-[#C2185B] font-semibold hover:underline">Späť na prihlásenie</Link>
            </div>
          ) : (
            <>
              <p className="text-gray-500 mb-6 text-sm">Zadajte váš email a pošleme vám odkaz na obnovenie hesla.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                      placeholder="váš@email.sk"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 outline-none focus:border-[#C2185B] focus:ring-2 focus:ring-[#FFB6D9]/30"
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-[#C2185B] text-white py-3.5 rounded-2xl font-semibold hover:bg-[#880E4F] transition-colors disabled:opacity-50"
                >
                  {loading ? 'Odosielam...' : 'Odoslať odkaz'}
                </button>
              </form>
              <Link href="/auth/login" className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-[#C2185B] transition-colors mt-4">
                <ArrowLeft className="w-4 h-4" /> Späť na prihlásenie
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
