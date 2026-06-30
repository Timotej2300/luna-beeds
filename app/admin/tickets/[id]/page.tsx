'use client'
import { use, useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import { Send, ArrowLeft, User, Shield, Clock } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = [
  { value: 'open', label: 'Otvorený', color: 'bg-blue-50 text-blue-600' },
  { value: 'in_progress', label: 'Rieši sa', color: 'bg-yellow-50 text-yellow-600' },
  { value: 'resolved', label: 'Vyriešený', color: 'bg-emerald-50 text-emerald-600' },
  { value: 'closed', label: 'Zatvorený', color: 'bg-gray-100 text-gray-500' },
]
const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Nízka' },
  { value: 'normal', label: 'Normálna' },
  { value: 'high', label: 'Vysoká' },
  { value: 'urgent', label: 'Urgentná' },
]
const CATEGORY_LABELS: Record<string, string> = {
  general: 'Všeobecná', order: 'Objednávka', payment: 'Platba',
  shipping: 'Doprava', return: 'Vrátenie', custom: 'Custom naramok', other: 'Iné'
}

interface Props { params: Promise<{ id: string }> }

export default function AdminTicketDetailPage({ params }: Props) {
  const { id } = use(params)
  const [ticket, setTicket] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [adminUser, setAdminUser] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const load = async () => {
    const supabase = createClient()
    const [{ data: t }, { data: m }, { data: { user } }] = await Promise.all([
      supabase.from('tickets').select('*').eq('id', id).single(),
      supabase.from('ticket_messages').select('*').eq('ticket_id', id).order('created_at'),
      supabase.auth.getUser(),
    ])
    setTicket(t)
    setMessages(m || [])
    if (user) {
      const { data: au } = await supabase.from('admin_users').select('*, role:roles(name,color,icon)').eq('id', user.id).single()
      setAdminUser({ ...au, email: user.email })
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [id])
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const updateStatus = async (status: string) => {
    const supabase = createClient()
    await supabase.from('tickets').update({
      status,
      closed_at: status === 'closed' ? new Date().toISOString() : null
    }).eq('id', id)
    setTicket((t: any) => ({ ...t, status }))
    toast.success('Status aktualizovaný')
  }

  const updatePriority = async (priority: string) => {
    const supabase = createClient()
    await supabase.from('tickets').update({ priority }).eq('id', id)
    setTicket((t: any) => ({ ...t, priority }))
    toast.success('Priorita aktualizovaná')
  }

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reply.trim()) return
    setSending(true)
    const supabase = createClient()
    const { error } = await supabase.from('ticket_messages').insert({
      ticket_id: id,
      sender_id: adminUser?.id || null,
      sender_name: `${adminUser?.first_name} ${adminUser?.last_name}` || 'Admin',
      sender_email: adminUser?.email || 'admin@lunabeeds.sk',
      is_admin: true,
      message: reply.trim(),
    })
    if (error) { toast.error('Chyba pri odosielaní'); setSending(false); return }

    // Auto set to in_progress if was open
    if (ticket?.status === 'open') {
      await supabase.from('tickets').update({ status: 'in_progress' }).eq('id', id)
      setTicket((t: any) => ({ ...t, status: 'in_progress' }))
    }

    setReply('')
    toast.success('Odpoveď odoslaná!')
    load()
    setSending(false)
  }

  const currentStatus = STATUS_OPTIONS.find(s => s.value === ticket?.status)

  if (loading) return (
    <div className="space-y-4">
      <div className="h-8 w-48 bg-gray-100 rounded-2xl animate-pulse" />
      <div className="h-64 bg-white rounded-3xl shadow-soft animate-pulse" />
    </div>
  )

  if (!ticket) return (
    <div className="text-center py-20 text-gray-400">
      <p>Ticket nenájdený</p>
      <Link href="/admin/tickets" className="text-[#C2185B] hover:underline mt-2 block">Späť na tickety</Link>
    </div>
  )

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back */}
      <Link href="/admin/tickets" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#C2185B] transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Späť na tickety
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main - messages */}
        <div className="lg:col-span-2 space-y-4">
          {/* Ticket header */}
          <div className="bg-white rounded-3xl shadow-soft border border-pink-50 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-[#C2185B]">#{ticket.ticket_number}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${currentStatus?.color}`}>
                    {currentStatus?.label}
                  </span>
                </div>
                <h1 className="text-lg font-bold text-[#880E4F]">{ticket.subject}</h1>
                <p className="text-sm text-gray-500 mt-1">
                  {ticket.name} · {ticket.email} · {formatDate(ticket.created_at)}
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="space-y-3">
            {messages.map((msg, i) => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className={`flex gap-3 ${msg.is_admin ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${msg.is_admin ? 'bg-gradient-to-br from-[#FFB6D9] to-[#C2185B]' : 'bg-gray-100'}`}>
                  {msg.is_admin
                    ? <Shield className="w-4 h-4 text-white" />
                    : <User className="w-4 h-4 text-gray-400" />
                  }
                </div>

                {/* Bubble */}
                <div className={`max-w-[75%] ${msg.is_admin ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.is_admin
                      ? 'bg-gradient-to-br from-[#C2185B] to-[#880E4F] text-white rounded-tr-sm'
                      : 'bg-white border border-pink-100 text-gray-700 rounded-tl-sm shadow-soft'
                  }`}>
                    {msg.message}
                  </div>
                  <div className={`flex items-center gap-1 text-xs text-gray-400 ${msg.is_admin ? 'flex-row-reverse' : ''}`}>
                    <span className="font-medium">{msg.sender_name}</span>
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
          {ticket.status !== 'closed' ? (
            <form onSubmit={sendReply} className="bg-white rounded-3xl shadow-soft border border-pink-50 p-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">Odpovedať</label>
              <textarea
                value={reply}
                onChange={e => setReply(e.target.value)}
                rows={4}
                placeholder="Napíšte odpoveď..."
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 outline-none focus:border-[#C2185B] focus:ring-2 focus:ring-[#FFB6D9]/30 resize-none text-sm"
              />
              <div className="flex justify-end mt-3">
                <button type="submit" disabled={sending || !reply.trim()}
                  className="flex items-center gap-2 bg-[#C2185B] text-white px-6 py-2.5 rounded-2xl font-medium hover:bg-[#880E4F] transition-colors disabled:opacity-50 shadow-soft text-sm"
                >
                  <Send className="w-4 h-4" />
                  {sending ? 'Odosielam...' : 'Odoslať odpoveď'}
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-gray-50 rounded-3xl border border-gray-100 p-5 text-center text-sm text-gray-400">
              Ticket je zatvorený. Znova otvorte ticket aby ste mohli odpovedať.
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status */}
          <div className="bg-white rounded-3xl shadow-soft border border-pink-50 p-5">
            <h3 className="font-semibold text-[#880E4F] mb-3 text-sm">Status</h3>
            <div className="space-y-2">
              {STATUS_OPTIONS.map(s => (
                <button key={s.value} onClick={() => updateStatus(s.value)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    ticket.status === s.value
                      ? s.color + ' ring-2 ring-offset-1 ring-current'
                      : 'hover:bg-[#FFF0F7] text-gray-500'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div className="bg-white rounded-3xl shadow-soft border border-pink-50 p-5">
            <h3 className="font-semibold text-[#880E4F] mb-3 text-sm">Priorita</h3>
            <select value={ticket.priority} onChange={e => updatePriority(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#C2185B] text-sm"
            >
              {PRIORITY_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>

          {/* Info */}
          <div className="bg-white rounded-3xl shadow-soft border border-pink-50 p-5">
            <h3 className="font-semibold text-[#880E4F] mb-3 text-sm">Informácie</h3>
            <div className="space-y-2 text-sm">
              {[
                ['Zákazník', ticket.name],
                ['Email', ticket.email],
                ['Kategória', CATEGORY_LABELS[ticket.category] || ticket.category],
                ['Vytvorený', formatDate(ticket.created_at)],
                ['Správ', messages.length],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-2">
                  <span className="text-gray-400">{label}:</span>
                  <span className="font-medium text-gray-700 text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-3xl shadow-soft border border-pink-50 p-5">
            <h3 className="font-semibold text-[#880E4F] mb-3 text-sm">Rýchle akcie</h3>
            <div className="space-y-2">
              <button onClick={() => updateStatus('resolved')}
                className="w-full py-2 rounded-xl bg-emerald-50 text-emerald-600 text-sm font-medium hover:bg-emerald-100 transition-colors"
              >✅ Označiť ako vyriešený</button>
              <button onClick={() => updateStatus('closed')}
                className="w-full py-2 rounded-xl bg-gray-100 text-gray-500 text-sm font-medium hover:bg-gray-200 transition-colors"
              >🔒 Zatvoriť ticket</button>
              <button onClick={() => updateStatus('open')}
                className="w-full py-2 rounded-xl bg-blue-50 text-blue-500 text-sm font-medium hover:bg-blue-100 transition-colors"
              >🔓 Znova otvoriť</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
