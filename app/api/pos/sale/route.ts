import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Neautorizovaný' }, { status: 401 })

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id, roles(permissions)')
    .eq('id', user.id)
    .single()

  if (!adminUser) return NextResponse.json({ error: 'Prístup zamietnutý' }, { status: 403 })
  const permissions: string[] = (adminUser as any).roles?.permissions ?? []
  if (!permissions.includes('pos_sales')) {
    return NextResponse.json({ error: 'Nemáte oprávnenie vytvárať predaje' }, { status: 403 })
  }

  const body = await req.json()
  const {
    store_id,
    items,
    payment_method = 'cash',
    amount_paid,
    coupon_id,
    coupon_code,
    coupon_discount = 0,
    customer_email,
    note,
    idempotency_key,
  } = body

  if (!store_id || !items?.length || amount_paid === undefined) {
    return NextResponse.json({ error: 'Chýbajú povinné údaje' }, { status: 400 })
  }

  // Over či predajca patrí do predajne
  const canManageAll = permissions.includes('pos_manage_stores')
  if (!canManageAll) {
    const { data: membership } = await supabase
      .from('store_users')
      .select('id')
      .eq('store_id', store_id)
      .eq('user_id', user.id)
      .single()
    if (!membership) return NextResponse.json({ error: 'Nemáte prístup k tejto predajni' }, { status: 403 })
  }

  // Použijeme admin client pre RPC (security definer funkcia)
  const admin = createAdminClient()

  const { data, error } = await admin.rpc('create_pos_sale', {
    p_store_id: store_id,
    p_seller_id: user.id,
    p_items: items,
    p_payment_method: payment_method,
    p_amount_paid: amount_paid,
    p_coupon_id: coupon_id ?? null,
    p_coupon_code: coupon_code ?? null,
    p_coupon_discount: coupon_discount,
    p_customer_email: customer_email ?? null,
    p_note: note ?? null,
    p_idempotency_key: idempotency_key ?? null,
  })

  if (error) {
    console.error('POS sale error:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data)
}
