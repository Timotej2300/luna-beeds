'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import { Search, Ticket, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const STATUS_LABELS: Record<string, string> = {
  open: 'Otvorený', in_progress: 'Rieši sa', resolved: 'Vyriešený', closed: 'Zatvorený'
}
const STATUS_COLORS: Record<string, string> = {
  open: 'bg-blue-50 text-blue-600',
  in_progress: 'bg-yellow-50 text-yellow-600',
  resolved: 'bg-emerald-50 text-emerald-600',
  closed: 'bg-gray-100 text-gray-500',
}
const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-500',
  normal: 'bg-blue-50 text-blue-500',
  high: 'bg-orange-50 text-orange-500',
  urgent: 'bg-red-50 text-red-500',
}
const PRIORITY_LABELS: Record<string, string> = {
  low: 'Nízka', normal: 'Normálna', high: 'Vysoká', urgent: 'Urgentná'
}
const CATEGORY_LABELS: Record<string, string> = {
  general: 'Všeobecná', order: 'Objednávka', payment: 'Platba',
  shipping: 'Doprava', return: 'Vrátenie', custom: 'Custom naramok', other: 'Iné'
}

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false })
      setTickets(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = tickets.filter(t => {
    const matchSearch = !search ||
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase()) ||
      String(t.ticket_number).includes(search)
    const matchStatus = statusFilter === 'all' || t.status === statusFilter
    return matchSearch && matchStatus
  })

  const counts = {
    all: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    in_progress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    closed: tickets.filter(t => t.status === 'closed').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#880E4F]">Tickety</h1>
          <p className="text-gray-500 mt-1">{tickets.length} ticketov celkom</p>
        </div>
        <Link href="/support" target="_blank"
          className="flex items-center gap-2 border border-[#C2185B] text-[#C2185B] px-4 py-2.5 rounded-2xl text-sm font-medium hover:bg-[#FFF0F7] transition-colors"
        >
          <Ticket className="w-4 h-4" /> Nový ticket (zákazník)
        </Link>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap">
        {[['all', 'Všetky'], ['open', 'Otvorené'], ['in_progress', 'Riešia sa'], ['resolved', 'Vyriešené'], ['closed', 'Zatvorené']].map(([val, label]) => (
          <button key={val} onClick={() => setStatusFilter(val)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${statusFilter === val ? 'bg-[#C2185B] text-white' : 'bg-white text-gray-500 hover:bg-[#FFF0F7] border border-gray-200'}`}
          >
            {label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${statusFilter === val ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
              {(counts as any)[val]}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Hľadať podľa mena, emailu, predmetu alebo čísla..."
          className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-gray-200 outline-none focus:border-[#C2185B] focus:ring-2 focus:ring-[#FFB6D9]/30 shadow-sm"
        />
      </div>

      {/* Tickets list */}
      <div className="space-y-3">
        {loading ? (
          [...Array(5)].map((_, i) => <div key={i} className="h-24 bg-white rounded-3xl shadow-soft animate-pulse" />)
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-pink-50 text-gray-400">
            <Ticket className="w-12 h-12 mx-auto mb-3 text-[#FFB6D9]" />
            <p>Žiadne tickety</p>
          </div>
        ) : filtered.map(ticket => (
          <motion.div key={ticket.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Link href={`/admin/tickets/${ticket.id}`}
              className="block bg-white rounded-3xl shadow-soft border border-pink-50 p-5 hover:border-[#FFB6D9] hover:shadow-card transition-all group"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-[#FFF0F7] rounded-2xl flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-[#C2185B]">#{ticket.ticket_number}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{ticket.subject}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{ticket.name} · {ticket.email}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[ticket.status]}`}>
                        {STATUS_LABELS[ticket.status]}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[ticket.priority]}`}>
                        {PRIORITY_LABELS[ticket.priority]}
                      </span>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">
                        {CATEGORY_LABELS[ticket.category] || ticket.category}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-gray-400">{formatDate(ticket.created_at)}</span>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#C2185B] transition-colors" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
