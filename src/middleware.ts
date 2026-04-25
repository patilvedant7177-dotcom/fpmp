import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create a fresh client for middleware as requested
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh the session by calling getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Protected paths: /faculty or /admin
  const isFacultyPath = pathname.startsWith('/faculty')
  const isAdminPath = pathname.startsWith('/admin')

  if (isFacultyPath || isAdminPath) {
    // Determine if it's the public faculty profile route: /faculty/[slug]
    const parts = pathname.split('/').filter(Boolean)
    const isPublicFacultySlug = parts.length === 2 && parts[0] === 'faculty' && 
      !['dashboard', 'editor', 'cv-upload', 'messages', 'login'].includes(parts[1])

    if (!isPublicFacultySlug && !user) {
      const loginPath = isFacultyPath ? '/login/faculty' : '/login/admin'
      return NextResponse.redirect(new URL(loginPath, request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - any image file
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
