'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Package, Tag, ShoppingCart, Users, Truck,
  CreditCard, Megaphone, MessageSquare, Settings, BarChart3,
  Mail, Ticket, Shield, Sparkles, Menu, X, ChevronRight, LogOut
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const NAV = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/products', icon: Package, label: 'Produkty' },
  { href: '/admin/categories', icon: Tag, label: 'Kategórie' },
  { href: '/admin/orders', icon: ShoppingCart, label: 'Objednávky' },
  { href: '/admin/customers', icon: Users, label: 'Zákazníci' },
  { href: '/admin/shipping', icon: Truck, label: 'Doprava' },
  { href: '/admin/payments', icon: CreditCard, label: 'Platby' },
  { href: '/admin/coupons', icon: Ticket, label: 'Kupóny' },
  { href: '/admin/newsletter', icon: Mail, label: 'Newsletter' },
  { href: '/admin/announcements', icon: Megaphone, label: 'Announcement' },
  { href: '/admin/messages', icon: MessageSquare, label: 'Správy' },
  { href: '/admin/statistics', icon: BarChart3, label: 'Štatistiky' },
  { href: '/admin/roles', icon: Shield, label: 'Role' },
  { href: '/admin/settings', icon: Settings, label: 'Nastavenia' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 240 : 72 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="bg-white border-r border-pink-100 flex flex-col shadow-soft shrink-0 relative z-30"
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-pink-100 gap-3 overflow-hidden">
          <div className="w-8 h-8 bg-gradient-to-br from-[#FFB6D9] to-[#C2185B] rounded-full flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="font-display font-bold text-[#C2185B] whitespace-nowrap"
              >Luna&Beeds</motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative ${
                  active ? 'bg-[#FFF0F7] text-[#C2185B]' : 'text-gray-500 hover:bg-gray-50 hover:text-[#C2185B]'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-[#C2185B]' : ''}`} />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >{label}</motion.span>
                  )}
                </AnimatePresence>
                {active && sidebarOpen && <ChevronRight className="w-4 h-4 ml-auto text-[#C2185B]" />}
                {!sidebarOpen && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                    {label}
                  </div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-pink-100">
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all w-full"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Odhlásiť</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-pink-100 flex items-center px-6 gap-4 shadow-soft">
          <button onClick={() => setSidebarOpen(s => !s)} className="p-2 rounded-xl hover:bg-[#FFF0F7] text-gray-400 hover:text-[#C2185B] transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <Link href="/" target="_blank" className="text-sm text-gray-400 hover:text-[#C2185B] transition-colors">
            Zobraziť obchod ↗
          </Link>
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
