'use client'
import { use, useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import { Send, ArrowLeft, User, Shield, Clock, Ticket } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

const STATUS_LABELS: Record<string, string> = {
  open: 'Otvorený', in_progress: 'Rieši sa', resolved: 'Vyriešený', closed: 'Zatvorený',
}
const STATUS_COLORS: Record<string, string> = {
  open: 'bg-blue-50 text-blue-600',
  in_progress: 'bg-yellow-50 text-yellow-600',
  resolved: 'bg-emerald-50 text-emerald-600',
  closed: 'bg-gray-100 text-gray-500',
}

interface Props { params: Promise<{ id: string }> }

export default function AccountTicketDetailPage({ params }: Props) {
  const { id } = use(params)
  const [ticket, setTicket] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [user, setUser] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const load = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    setUser(user)

    const { data: t } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!t) { router.push('/account/tickets'); return }

    const { data: m } = await supabase
      .from('ticket_messages')
      .select('*')
      .eq('ticket_id', id)
      .order('created_at')

    setTicket(t)
    setMessages(m || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [id])
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reply.trim() || !user) return
    setSending(true)
    const supabase = createClient()

    const { error } = await supabase.from('ticket_messages').insert({
      ticket_id: id,
      sender_id: user.id,
      sender_name: user.user_metadata?.first_name
        ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
        : user.email,
      sender_email: user.email,
      is_admin: false,
      message: reply.trim(),
    })

    if (error) { toast.error('Chyba pri odosielaní'); setSending(false); return }

    // Reopen ticket if it was resolved/closed
    if (ticket?.status === 'resolved' || ticket?.status === 'closed') {
      await supabase.from('tickets').update({ status: 'open' }).eq('id', id)
      setTicket((t: any) => ({ ...t, status: 'open' }))
    }

    setReply('')
    toast.success('Správa odoslaná! 💌')
    load()
    setSending(false)
  }

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">
      <div className="h-8 w-48 bg-gray-100 rounded-2xl animate-pulse" />
      <div className="h-96 bg-white rounded-3xl shadow-soft animate-pulse" />
    </div>
  )

  if (!ticket) return null

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Back */}
      <Link href="/account/tickets" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#C2185B] transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Späť na tickety
      </Link>

      {/* Ticket header */}
      <div className="bg-white rounded-3xl shadow-soft border border-pink-50 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#FFF0F7] rounded-2xl flex items-center justify-center shrink-0">
              <Ticket className="w-6 h-6 text-[#C2185B]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-[#C2185B]">#{ticket.ticket_number}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[ticket.status]}`}>
                  {STATUS_LABELS[ticket.status]}
                </span>
              </div>
              <h1 className="text-lg font-bold text-[#880E4F]">{ticket.subject}</h1>
              <p className="text-sm text-gray-400 mt-1">Vytvorený: {formatDate(ticket.created_at)}</p>
            </div>
          </div>
        </div>

        {ticket.status === 'resolved' && (
          <div className="mt-4 bg-emerald-50 rounded-2xl p-3 text-sm text-emerald-600 font-medium">
            ✅ Tento ticket bol vyriešený. Ak problém pretrváva, odpovedzte a ticket sa znova otvorí.
          </div>
        )}
        {ticket.status === 'closed' && (
          <div className="mt-4 bg-gray-50 rounded-2xl p-3 text-sm text-gray-500 font-medium">
            🔒 Tento ticket je zatvorený. Odpovedzte ak potrebujete ďalšiu pomoc.
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="space-y-4">
        {messages.map((msg, i) => (
          <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className={`flex gap-3 ${msg.is_admin ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
              msg.is_admin
                ? 'bg-gradient-to-br from-[#FFB6D9] to-[#C2185B]'
                : 'bg-gray-100'
            }`}>
              {msg.is_admin
                ? <Shield className="w-4 h-4 text-white" />
                : <User className="w-4 h-4 text-gray-400" />
              }
            </div>

            {/* Bubble */}
            <div className={`max-w-[78%] flex flex-col gap-1 ${msg.is_admin ? 'items-end' : 'items-start'}`}>
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.is_admin
                  ? 'bg-gradient-to-br from-[#C2185B] to-[#880E4F] text-white rounded-tr-sm'
                  : 'bg-white border border-pink-100 text-gray-700 rounded-tl-sm shadow-soft'
              }`}>
                {msg.message}
              </div>
              <div className={`flex items-center gap-1 text-xs text-gray-400 ${msg.is_admin ? 'flex-row-reverse' : ''}`}>
                <span className="font-medium">{msg.is_admin ? '💎 Podpora Luna&Beeds' : msg.sender_name}</span>
                <span>·</span>
                <Clock className="w-3 h-3" />
                <span>{formatDate(msg.created_at)}</span>
              </div>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply form */}
      <form onSubmit={sendReply} className="bg-white rounded-3xl shadow-soft border border-pink-50 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {ticket.status === 'closed' ? 'Znova otvoriť ticket — napíšte správu' : 'Odpovedať'}
        </label>
        <textarea
          value={reply}
          onChange={e => setReply(e.target.value)}
          rows={4}
          placeholder="Napíšte vašu správu..."
          className="w-full px-4 py-3 rounded-2xl border border-gray-200 outline-none focus:border-[#C2185B] focus:ring-2 focus:ring-[#FFB6D9]/30 resize-none text-sm"
        />
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-gray-400">Zvyčajne odpovedáme do 24 hodín</p>
          <button type="submit" disabled={sending || !reply.trim()}
            className="flex items-center gap-2 bg-[#C2185B] text-white px-6 py-2.5 rounded-2xl font-medium hover:bg-[#880E4F] transition-colors disabled:opacity-50 shadow-soft text-sm"
          >
            <Send className="w-4 h-4" />
            {sending ? 'Odosielam...' : 'Odoslať'}
          </button>
        </div>
      </form>
    </div>
  )
}
