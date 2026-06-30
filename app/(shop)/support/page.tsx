'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Ticket, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { value: 'general', label: 'Všeobecná otázka' },
  { value: 'order', label: 'Objednávka' },
  { value: 'payment', label: 'Platba' },
  { value: 'shipping', label: 'Doprava' },
  { value: 'return', label: 'Vrátenie / Reklamácia' },
  { value: 'custom', label: 'Custom naramok' },
  { value: 'other', label: 'Iné' },
]

export default function NewTicketPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', category: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState<number | null>(null)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.category) { toast.error('Vyber kategóriu'); return }
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      const { data: ticket, error } = await supabase
        .from('tickets')
        .insert({
          user_id: user?.id || null,
          name: form.name,
          email: form.email,
          subject: form.subject,
          category: form.category,
          status: 'open',
          priority: 'normal',
        })
        .select()
        .single()

      if (error) throw error

      await supabase.from('ticket_messages').insert({
        ticket_id: ticket.id,
        sender_id: user?.id || null,
        sender_name: form.name,
        sender_email: form.email,
        is_admin: false,
        message: form.message,
      })

      setDone(ticket.ticket_number)
      toast.success('Ticket vytvorený!')
    } catch {
      toast.error('Nastala chyba. Skúste znova.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full px-4 py-3 rounded-2xl border border-gray-200 outline-none focus:border-[#C2185B] focus:ring-2 focus:ring-[#FFB6D9]/30 transition-all text-sm'

  if (done) return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
        <div className="w-20 h-20 bg-gradient-to-br from-[#FFB6D9] to-[#C2185B] rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-[#880E4F] mb-2">Ticket vytvorený! 🎉</h1>
        <p className="text-gray-500 mb-2">Číslo vášho ticketu:</p>
        <div className="bg-[#FFF0F7] rounded-2xl px-6 py-3 inline-block mb-6">
          <span className="text-2xl font-bold text-[#C2185B]">#{done}</span>
        </div>
        <p className="text-sm text-gray-400 mb-6">Odpoveď vám pošleme na email. Zvyčajne odpovedáme do 24 hodín.</p>
        <a href="/" className="inline-block bg-[#C2185B] text-white px-8 py-3 rounded-2xl font-semibold hover:bg-[#880E4F] transition-colors">
          Späť domov
        </a>
      </motion.div>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-[#FFB6D9] to-[#C2185B] rounded-2xl flex items-center justify-center">
            <Ticket className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#880E4F]">Nový ticket</h1>
            <p className="text-gray-500 text-sm">Máte problém alebo otázku? Napíšte nám.</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-soft border border-pink-50 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meno *</label>
                <input value={form.name} onChange={set('name')} required className={inputCls} placeholder="Jana Kováčová" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" value={form.email} onChange={set('email')} required className={inputCls} placeholder="jana@email.sk" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Predmet *</label>
              <input value={form.subject} onChange={set('subject')} required className={inputCls} placeholder="Krátky popis problému" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategória *</label>
              <select value={form.category} onChange={set('category')} className={inputCls}>
                <option value="">-- Vybrať --</option>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Správa *</label>
              <textarea value={form.message} onChange={set('message')} required rows={6}
                className={inputCls + ' resize-none'} placeholder="Popíšte váš problém čo najpodrobnejšie..." />
            </div>
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#C2185B] text-white py-3.5 rounded-2xl font-semibold hover:bg-[#880E4F] transition-colors disabled:opacity-50 shadow-soft"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Odosielam...' : 'Vytvoriť ticket'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
