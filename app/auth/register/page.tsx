'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sparkles, Mail, Lock, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirm) { toast.error('Heslá sa nezhodujú'); return }
    if (form.password.length < 6) { toast.error('Heslo musí mať aspoň 6 znakov'); return }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { first_name: form.firstName, last_name: form.lastName } },
    })
    if (error) { toast.error(error.message); setLoading(false); return }
    toast.success('Registrácia úspešná! Skontrolujte email.')
    router.push('/auth/login')
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
          <h1 className="text-2xl font-display font-bold text-[#880E4F]">Registrácia</h1>
          <p className="text-gray-500 mt-1">Vytvorte si účet zadarmo</p>
        </div>

        <div className="bg-white rounded-3xl shadow-card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[['firstName', 'Meno', User], ['lastName', 'Priezvisko', User]].map(([key, label, Icon]: any) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <div className="relative">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input value={(form as any)[key]} onChange={set(key)} required placeholder={label}
                      className="w-full pl-9 pr-3 py-3 rounded-2xl border border-gray-200 outline-none focus:border-[#C2185B] focus:ring-2 focus:ring-[#FFB6D9]/30 text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
            {[['email', 'Email', 'email', Mail, 'váš@email.sk'], ['password', 'Heslo', 'password', Lock, '••••••••'], ['confirm', 'Potvrdiť heslo', 'password', Lock, '••••••••']].map(([key, label, type, Icon, ph]: any) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type={type} value={(form as any)[key]} onChange={set(key)} required placeholder={ph}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 outline-none focus:border-[#C2185B] focus:ring-2 focus:ring-[#FFB6D9]/30"
                  />
                </div>
              </div>
            ))}
            <button type="submit" disabled={loading}
              className="w-full bg-[#C2185B] text-white py-3.5 rounded-2xl font-semibold hover:bg-[#880E4F] transition-colors disabled:opacity-50 shadow-soft mt-2"
            >
              {loading ? 'Registrujem...' : 'Vytvoriť účet'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            Máte účet?{' '}
            <Link href="/auth/login" className="text-[#C2185B] font-semibold hover:underline">Prihlásiť sa</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
