'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Megaphone, Info, Tag, AlertTriangle, Wrench } from 'lucide-react'
import type { Announcement } from '@/types'

const icons: Record<string, React.ReactNode> = {
  maintenance: <Wrench className="w-4 h-4" />,
  news: <Megaphone className="w-4 h-4" />,
  info: <Info className="w-4 h-4" />,
  sale: <Tag className="w-4 h-4" />,
  warning: <AlertTriangle className="w-4 h-4" />,
}

interface Props { announcements: Announcement[] }

export default function AnnouncementBar({ announcements }: Props) {
  const [dismissed, setDismissed] = useState<string[]>([])
  const active = announcements.filter(a => !dismissed.includes(a.id))
  if (!active.length) return null

  return (
    <div className="space-y-0">
      <AnimatePresence>
        {active.map(a => (
          <motion.div
            key={a.id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ backgroundColor: a.color, color: '#fff' }}
            className="w-full px-4 py-2.5 text-sm font-medium"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-1 justify-center">
                {icons[a.type]}
                <span className="font-semibold">{a.title}:</span>
                <span>{a.text}</span>
              </div>
              {a.type !== 'maintenance' && (
                <button
                  onClick={() => setDismissed(d => [...d, a.id])}
                  className="p-1 rounded-lg hover:bg-white/20 transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
