'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import { Ticket, Plus, ChevronRight, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const STATUS_LABELS: Record<string, string> = {
  open: 'Otvorený',
  in_progress: 'Rieši sa',
  resolved: 'Vyriešený',
  closed: 'Zatvorený',
}
const STATUS_COLORS: Record<string, string> = {
  open: 'bg-blue-50 text-blue-600',
  in_progress: 'bg-yellow-50 text-yellow-600',
  resolved: 'bg-emerald-50 text-emerald-600',
  closed: 'bg-gray-100 text-gray-500',
}
const STATUS_ICONS: Record<string, string> = {
  open: '🔵',
  in_progress: '🟡',
  resolved: '🟢',
  closed: '⚫',
}
const CATEGORY_LABELS: Record<string, string> = {
  general: 'Všeobecná', order: 'Objednávka', payment: 'Platba',
  shipping: 'Doprava', return: 'Vrátenie', custom: 'Custom naramok', other: 'Iné',
}

export default function AccountTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (!user) { setLoading(false); return }
      const { data } = await supabase
        .from('tickets')
        .select('*, ticket_messages(count)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setTickets(data || [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#880E4F]">Moje tickety</h1>
          <p className="text-gray-500 mt-1">Vaše požiadavky a komunikácia s podporou</p>
        </div>
        <Link href="/support"
          className="flex items-center gap-2 bg-[#C2185B] text-white px-5 py-2.5 rounded-2xl font-medium hover:bg-[#880E4F] transition-colors shadow-soft text-sm"
        >
          <Plus className="w-4 h-4" /> Nový ticket
        </Link>
      </div>

      {/* Stats */}
      {!loading && tickets.length > 0 && (
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            ['Všetky', tickets.length, '#C2185B'],
            ['Otvorené', tickets.filter(t => t.status === 'open').length, '#2196F3'],
            ['Riešia sa', tickets.filter(t => t.status === 'in_progress').length, '#FF9800'],
            ['Vyriešené', tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length, '#4CAF50'],
          ].map(([label, count, color]: any) => (
            <div key={label} className="bg-white rounded-2xl shadow-soft border border-pink-50 p-4 text-center">
              <p className="text-2xl font-bold" style={{ color }}>{count}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tickets list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-3xl shadow-soft animate-pulse" />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-pink-50">
          <Ticket className="w-16 h-16 mx-auto mb-4 text-[#FFB6D9]" />
          <p className="text-lg font-medium text-gray-600 mb-1">Zatiaľ žiadne tickety</p>
          <p className="text-sm text-gray-400 mb-6">Máte otázku alebo problém? Vytvorte ticket a my vám pomôžeme.</p>
          <Link href="/support"
            className="inline-flex items-center gap-2 bg-[#C2185B] text-white px-6 py-3 rounded-2xl font-semibold hover:bg-[#880E4F] transition-colors shadow-soft"
          >
            <Plus className="w-4 h-4" /> Vytvoriť prvý ticket
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket, i) => (
            <motion.div key={ticket.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link href={`/account/tickets/${ticket.id}`}
                className="block bg-white rounded-3xl shadow-soft border border-pink-50 p-5 hover:border-[#FFB6D9] hover:shadow-card transition-all group"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Ticket number */}
                    <div className="w-12 h-12 bg-[#FFF0F7] rounded-2xl flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-[#C2185B]">#{ticket.ticket_number}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{ticket.subject}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[ticket.status]}`}>
                          {STATUS_ICONS[ticket.status]} {STATUS_LABELS[ticket.status]}
                        </span>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">
                          {CATEGORY_LABELS[ticket.category] || ticket.category}
                        </span>
                        {ticket.ticket_messages?.[0]?.count > 0 && (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <MessageSquare className="w-3 h-3" />
                            {ticket.ticket_messages[0].count} správ
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(ticket.created_at)}</p>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#C2185B] transition-colors shrink-0" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Back to account */}
      <div className="mt-8">
        <Link href="/account" className="text-sm text-gray-400 hover:text-[#C2185B] transition-colors">
          ← Späť na účet
        </Link>
      </div>
    </div>
  )
}
