import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PosTerminal from '@/components/pos/PosTerminal'

export default async function PosStorePage({ params }: { params: Promise<{ store: string }> }) {
  const { store: storeSlug } = await params
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

  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', storeSlug)
    .eq('is_active', true)
    .single()

  if (!store) redirect('/pos')

  // Over či predajca patrí do predajne (alebo je vlastník/manažér)
  const canManageAllStores = permissions.includes('pos_manage_stores')
  if (!canManageAllStores) {
    const { data: membership } = await supabase
      .from('store_users')
      .select('id')
      .eq('store_id', store.id)
      .eq('user_id', user.id)
      .single()
    if (!membership) redirect('/pos')
  }

  const { data: products } = await supabase
    .from('products')
    .select('id, name, slug, price, stock, category_id, is_active, product_images(url, position)')
    .eq('is_active', true)
    .order('name')

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('position')

  // Sklad predajne
  const { data: inventory } = await supabase
    .from('store_inventory')
    .select('product_id, stock')
    .eq('store_id', store.id)

  const inventoryMap: Record<string, number> = {}
  for (const item of inventory ?? []) {
    inventoryMap[item.product_id] = item.stock
  }

  return (
    <PosTerminal
      store={store}
      user={{ id: user.id, firstName: adminUser.first_name, lastName: adminUser.last_name }}
      products={products ?? []}
      categories={categories ?? []}
      inventoryMap={inventoryMap}
      permissions={permissions}
    />
  )
}
