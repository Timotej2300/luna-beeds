'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Send } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    toast.success('Správa odoslaná! Ozveme sa do 24 hodín. 💌')
    setForm({ name: '', email: '', subject: '', message: '' })
    setLoading(false)
  }

  const inputCls = 'w-full px-4 py-3 rounded-2xl border border-gray-200 outline-none focus:border-[#C2185B] focus:ring-2 focus:ring-[#FFB6D9]/30 transition-all'

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="text-4xl font-display font-bold text-[#880E4F] mb-3">Kontaktujte nás</h1>
        <p className="text-gray-500 text-lg">Radi vám pomôžeme s akoukoľvek otázkou</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-12">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          {[
            { icon: <Mail />, label: 'Email', value: 'info@lunabeeds.sk' },
            { icon: <Phone />, label: 'Telefón', value: '+421 900 000 000' },
            { icon: <MapPin />, label: 'Adresa', value: 'Slovensko' },
          ].map(({ icon, label, value }) => (
            <div key={label} className="flex items-center gap-4 p-4 bg-[#FFF0F7] rounded-2xl">
              <div className="text-[#C2185B] w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-soft">{icon}</div>
              <div>
                <p className="text-xs text-gray-400 font-medium">{label}</p>
                <p className="text-gray-800 font-medium">{value}</p>
              </div>
            </div>
          ))}
        </motion.div>

        <motion.form initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meno *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className={inputCls} placeholder="Jana Kováčová" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required className={inputCls} placeholder="jana@email.sk" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Predmet</label>
            <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className={inputCls} placeholder="Otázka k objednávke..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Správa *</label>
            <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required rows={5} className={inputCls + ' resize-none'} placeholder="Vaša správa..." />
          </div>
          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#C2185B] text-white py-3.5 rounded-2xl font-semibold hover:bg-[#880E4F] transition-colors disabled:opacity-50 shadow-soft"
          >
            <Send className="w-4 h-4" />
            {loading ? 'Odosielam...' : 'Odoslať správu'}
          </button>
        </motion.form>
      </div>
    </div>
  )
}
