import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes - no protection needed
  const publicRoutes = [
    '/',
    '/about',
    '/services',
    '/contact',
    '/blog',
    '/careers',
    '/privacy',
    '/terms',
    '/team',
  ]

  // Check if it's a public route or static file
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith('/api/public')
  )
  const isStaticFile = pathname.startsWith('/_next') || 
                       pathname.startsWith('/favicon') ||
                       pathname.includes('.')

  // Allow public routes and static files
  if (isPublicRoute || isStaticFile) {
    return NextResponse.next()
  }

  // Get session
  const { user, supabaseResponse } = await updateSession(request)

  // Auth routes (login pages) - redirect to dashboard if already logged in
  const authRoutes = ['/login', '/portal/login', '/auth']
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  if (isAuthRoute) {
    if (user) {
      // User is logged in, check their role and redirect appropriately
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll()
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            },
          },
        }
      )

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role === 'client') {
        return NextResponse.redirect(new URL('/portal/dashboard', request.url))
      } else {
        return NextResponse.redirect(new URL('/crm', request.url))
      }
    }
    return supabaseResponse
  }

  // Protected routes - require authentication
  const protectedRoutes = ['/crm', '/portal', '/admin', '/dashboard']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  if (isProtectedRoute) {
    if (!user) {
      // Not logged in - redirect to appropriate login page
      if (pathname.startsWith('/portal')) {
        return NextResponse.redirect(new URL('/portal/login', request.url))
      }
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // User is logged in - check role-based access
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          },
        },
      }
    )

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const userRole = profile?.role || 'client'

    // CRM routes - only team members, admins, super_admins
    if (pathname.startsWith('/crm')) {
      const allowedRoles = ['super_admin', 'admin', 'team_member']
      if (!allowedRoles.includes(userRole)) {
        return NextResponse.redirect(new URL('/portal/dashboard', request.url))
      }
    }

    // Admin routes - only admins and super_admins
    if (pathname.startsWith('/admin')) {
      const allowedRoles = ['super_admin', 'admin']
      if (!allowedRoles.includes(userRole)) {
        return NextResponse.redirect(new URL('/crm', request.url))
      }
    }

    // Portal routes - only clients (but team can also access for testing)
    if (pathname.startsWith('/portal') && !pathname.startsWith('/portal/login')) {
      // Allow both clients and team members to access portal
      // (Team members might need to test/view client experience)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}