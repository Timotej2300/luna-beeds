import { createClient } from '@/lib/supabase/server'
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
  if (!permissions.includes('pos_access')) {
    return NextResponse.json({ error: 'Nemáte prístup k POS' }, { status: 403 })
  }

  const { code, subtotal } = await req.json()

  if (!code || typeof subtotal !== 'number') {
    return NextResponse.json({ error: 'Chýbajú údaje' }, { status: 400 })
  }

  const { data: coupon } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase().trim())
    .eq('is_active', true)
    .single()

  if (!coupon) return NextResponse.json({ error: 'Kupón neexistuje alebo nie je aktívny' }, { status: 404 })

  const now = new Date()

  // Over kanál
  if (coupon.channel === 'ecommerce') {
    return NextResponse.json({ error: 'Tento kupón platí len pre e-shop' }, { status: 400 })
  }

  // Over platnosť
  if (coupon.date_from && new Date(coupon.date_from) > now) {
    return NextResponse.json({ error: 'Kupón ešte nie je platný' }, { status: 400 })
  }
  if (coupon.date_to && new Date(coupon.date_to) < now) {
    return NextResponse.json({ error: 'Kupón vypršal' }, { status: 400 })
  }

  // Over počet použití
  if (coupon.max_uses !== null && coupon.uses >= coupon.max_uses) {
    return NextResponse.json({ error: 'Kupón bol vyčerpaný' }, { status: 400 })
  }

  // Over minimálnu hodnotu
  if (coupon.min_order !== null && subtotal < coupon.min_order) {
    return NextResponse.json({
      error: `Minimálna hodnota objednávky je ${coupon.min_order.toFixed(2)} €`,
    }, { status: 400 })
  }

  // Vypočítaj zľavu
  let discount = 0
  if (coupon.type === 'percentage') {
    discount = (subtotal * coupon.value) / 100
  } else {
    discount = Math.min(coupon.value, subtotal)
  }

  return NextResponse.json({
    id: coupon.id,
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    discount: Math.round(discount * 100) / 100,
  })
}
