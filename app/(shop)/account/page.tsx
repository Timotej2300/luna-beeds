import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { User, ShoppingBag, Heart, LogOut, Ticket } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Môj účet' }

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth/login?redirect=/account')

  const user = session.user

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-display font-bold text-[#880E4F] mb-8">Môj účet</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Profile card */}
        <div className="bg-white rounded-3xl shadow-soft p-8 border border-pink-50">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#FFB6D9] to-[#C2185B] rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user.email?.[0].toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{user.user_metadata?.first_name} {user.user_metadata?.last_name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-500"><span className="font-medium">Registrovaný:</span> {new Date(user.created_at).toLocaleDateString('sk-SK')}</p>
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { href: '/account/orders', icon: ShoppingBag, label: 'Moje objednávky', color: '#C2185B' },
            { href: '/account/wishlist', icon: Heart, label: 'Wishlist', color: '#880E4F' },
            { href: '/account/profile', icon: User, label: 'Upraviť profil', color: '#FFB6D9' },
            { href: '/account/tickets', icon: Ticket, label: 'Moje tickety', color: '#2196F3' },
          ].map(({ href, icon: Icon, label, color }) => (
            <Link key={href} href={href}
              className="bg-white rounded-3xl shadow-soft p-6 border border-pink-50 hover:shadow-card transition-all group flex flex-col items-center gap-3 text-center"
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: color + '20' }}>
                <Icon className="w-6 h-6" style={{ color }} />
              </div>
              <span className="text-sm font-medium text-gray-700">{label}</span>
            </Link>
          ))}
          <form action="/auth/logout" method="post">
            <button type="submit"
              className="w-full bg-white rounded-3xl shadow-soft p-6 border border-pink-50 hover:border-red-100 hover:shadow-card transition-all flex flex-col items-center gap-3 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
                <LogOut className="w-6 h-6 text-red-400" />
              </div>
              <span className="text-sm font-medium text-gray-500">Odhlásiť</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
