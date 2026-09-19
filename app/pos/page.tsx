import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PosHome from '@/components/pos/PosHome'

export default async function PosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/pos')

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id, first_name, last_name, roles(permissions)')
    .eq('id', user.id)
    .single()

  if (!adminUser) redirect('/')

  const permissions: string[] = (adminUser as any).roles?.permissions ?? []
  if (!permissions.includes('pos_access')) redirect('/admin/dashboard?error=no_pos_access')

  // Načítaj predajne dostupné pre tohto predajcu
  const { data: storeUsers } = await supabase
    .from('store_users')
    .select('store_id, stores(id, name, slug, city, is_active)')
    .eq('user_id', user.id)

  const stores = (storeUsers ?? [])
    .map((su: any) => su.stores)
    .filter((s: any) => s?.is_active)

  // Ak má iba jednu predajňu, presmeruj priamo
  if (stores.length === 1) {
    redirect(`/pos/${stores[0].slug}`)
  }

  return (
    <PosHome
      stores={stores}
      user={{ id: user.id, firstName: adminUser.first_name, lastName: adminUser.last_name }}
      permissions={permissions}
    />
  )
}
