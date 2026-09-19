import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PosSuccess from '@/components/pos/PosSuccess'

export default async function PosSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ store: string }>
  searchParams: Promise<{ sale_id?: string }>
}) {
  const { store: storeSlug } = await params
  const { sale_id } = await searchParams

  if (!sale_id) redirect(`/pos/${storeSlug}`)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: sale } = await supabase
    .from('pos_sales')
    .select('*, pos_sale_items(*), stores(name)')
    .eq('id', sale_id)
    .single()

  if (!sale || sale.seller_id !== user.id) redirect(`/pos/${storeSlug}`)

  return <PosSuccess sale={sale} storeSlug={storeSlug} />
}
