'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sparkles, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function LoginClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { toast.error('Nesprávny email alebo heslo.'); setLoading(false); return }
    toast.success('Vitajte späť! 👋')
    router.push(redirect)
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF0F7] to-[#FFD6EC] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-[#FFB6D9] to-[#C2185B] rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-[#C2185B]">Luna&Beeds</span>
          </Link>
          <h1 className="text-2xl font-bold text-[#880E4F]">Prihlásiť sa</h1>
          <p className="text-gray-500 mt-1">Vitajte späť!</p>
        </div>
        <div className="bg-white rounded-3xl shadow-[0_8px_40px_rgba(194,24,91,0.12)] p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="váš@email.sk"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 outline-none focus:border-[#C2185B] focus:ring-2 focus:ring-[#FFB6D9]/30" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heslo</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 rounded-2xl border border-gray-200 outline-none focus:border-[#C2185B] focus:ring-2 focus:ring-[#FFB6D9]/30" />
                <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#C2185B]">
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <Link href="/auth/forgot-password" className="text-sm text-[#C2185B] hover:underline">Zabudnuté heslo?</Link>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-[#C2185B] text-white py-3.5 rounded-2xl font-semibold hover:bg-[#880E4F] transition-colors disabled:opacity-50 shadow-[0_2px_20px_rgba(194,24,91,0.08)]"
            >{loading ? 'Prihlasujem...' : 'Prihlásiť sa'}</button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            Nemáte účet?{' '}
            <Link href="/auth/register" className="text-[#C2185B] font-semibold hover:underline">Registrovať sa</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
