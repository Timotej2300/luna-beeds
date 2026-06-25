import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          res = NextResponse.next({ request: req })
          cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = req.nextUrl.pathname

  if (path.startsWith('/admin')) {
    if (!user) return NextResponse.redirect(new URL('/auth/login?redirect=/admin/dashboard', req.url))
    const { data: adminUser } = await supabase.from('admin_users').select('id').eq('id', user.id).single()
    if (!adminUser) return NextResponse.redirect(new URL('/', req.url))
  }

  if (path.startsWith('/account') && !user) {
    return NextResponse.redirect(new URL(`/auth/login?redirect=${path}`, req.url))
  }

  return res
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*'],
}
