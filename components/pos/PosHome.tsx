'use client'
import Link from 'next/link'
import { Store, LogOut, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Store as StoreType } from '@/types/pos'

interface Props {
  stores: StoreType[]
  user: { id: string; firstName: string; lastName: string }
  permissions: string[]
}

export default function PosHome({ stores, user, permissions }: Props) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF0F7] to-white flex flex-col">
      <header className="bg-white border-b border-pink-100 px-6 py-4 flex items-center justify-between shadow-soft">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-[#FFB6D9] to-[#C2185B] rounded-xl flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-[#C2185B] text-lg">Luna&Beeds POS</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{user.firstName} {user.lastName}</span>
          <button onClick={handleLogout} className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-display font-bold text-[#880E4F] mb-2">Vyberte predajňu</h1>
        <p className="text-gray-500 text-sm mb-8">Prihláste sa do konkrétnej predajne pre spustenie POS</p>

        {stores.length === 0 ? (
          <div className="text-center">
            <Store className="w-16 h-16 text-[#FFB6D9] mx-auto mb-3" />
            <p className="text-gray-500">Nie ste priradený k žiadnej predajni.</p>
            <p className="text-gray-400 text-sm mt-1">Kontaktujte administrátora.</p>
          </div>
        ) : (
          <div className="grid gap-4 w-full max-w-md">
            {stores.map((store) => (
              <Link key={store.id} href={`/pos/${store.slug}`}
                className="bg-white rounded-2xl p-5 border border-pink-100 shadow-soft hover:shadow-card hover:border-[#FFB6D9] transition-all flex items-center gap-4 group">
                <div className="w-12 h-12 bg-[#FFF0F7] rounded-xl flex items-center justify-center group-hover:bg-[#FFB6D9]/20 transition-colors">
                  <Store className="w-6 h-6 text-[#C2185B]" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{store.name}</div>
                  <div className="text-sm text-gray-500">{store.city}</div>
                </div>
                <div className="ml-auto text-[#C2185B] opacity-0 group-hover:opacity-100 transition-opacity">→</div>
              </Link>
            ))}
          </div>
        )}

        {permissions.includes('pos_manage_stores') && (
          <Link href="/admin/dashboard" className="mt-8 text-sm text-gray-400 hover:text-[#C2185B] transition-colors">
            ← Späť do administrácie
          </Link>
        )}
      </div>
    </div>
  )
}
