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
  if (!permissions.includes('pos_store_orders')) {
    return NextResponse.json({ error: 'Nemáte oprávnenie vytvárať objednávky predajne' }, { status: 403 })
  }

  const {
    store_id,
    product_id,
    quantity,
    customer_name,
    customer_email,
    customer_phone,
    contact_via,
    note,
  } = await req.json()

  if (!store_id || !product_id || !quantity || !customer_name) {
    return NextResponse.json({ error: 'Chýbajú povinné údaje' }, { status: 400 })
  }

  // Načítaj cenu produktu server-side
  const { data: product } = await supabase
    .from('products')
    .select('id, price, is_active')
    .eq('id', product_id)
    .eq('is_active', true)
    .single()

  if (!product) return NextResponse.json({ error: 'Produkt nenájdený' }, { status: 404 })

  const admin = createAdminClient()

  // Generuj order_number
  const year = new Date().getFullYear()
  const { count } = await admin
    .from('store_orders')
    .select('*', { count: 'exact', head: true })
    .like('order_number', `STORE-ORDER-${year}-%`)

  const seq = (count ?? 0) + 1
  const order_number = `STORE-ORDER-${year}-${String(seq).padStart(6, '0')}`

  const { data: order, error } = await admin
    .from('store_orders')
    .insert({
      order_number,
      store_id,
      seller_id: user.id,
      product_id,
      quantity,
      unit_price: product.price,
      customer_name,
      customer_email: customer_email || null,
      customer_phone: customer_phone || null,
      contact_via: contact_via || [],
      note: note || null,
      status: 'pending',
      payment_status: 'unpaid',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json(order)
}

export async function PATCH(req: Request) {
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
  if (!permissions.includes('pos_store_orders')) {
    return NextResponse.json({ error: 'Nemáte oprávnenie' }, { status: 403 })
  }

  const { id, status } = await req.json()
  if (!id || !status) return NextResponse.json({ error: 'Chýba id alebo status' }, { status: 400 })

  const validStatuses = ['pending','ordered','in_transit','ready','contacted','picked_up','cancelled']
  if (!validStatuses.includes(status)) return NextResponse.json({ error: 'Neplatný status' }, { status: 400 })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('store_orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}
