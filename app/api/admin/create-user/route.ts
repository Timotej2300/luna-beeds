import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { first_name, last_name, company_email, private_email, password, role_id } = await req.json()

  const supabase = createAdminClient()

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: company_email,
    password,
    email_confirm: true,
    user_metadata: { first_name, last_name },
  })

  if (authError) return NextResponse.json({ error: authError.message }, { status: 400 })

  // Create admin_users record
  const { error: adminError } = await supabase.from('admin_users').insert({
    id: authData.user.id,
    first_name,
    last_name,
    company_email,
    private_email,
    role_id,
  })

  if (adminError) {
    await supabase.auth.admin.deleteUser(authData.user.id)
    return NextResponse.json({ error: adminError.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
