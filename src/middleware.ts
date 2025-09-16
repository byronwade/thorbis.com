import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const pathname = req.nextUrl.pathname

  // Check for valid authentication session
  let hasSession = false
  
  // First check for Supabase session token
  const supabaseToken = req.cookies.get('sb-access-token')?.value ||
                       req.cookies.get('supabase.auth.token')?.value
  
  if (supabaseToken) {
    try {
      // Validate Supabase token
      const tokenParts = supabaseToken.split('.')
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]))
        hasSession = payload.exp && payload.exp * 1000 > Date.now()
      }
    } catch (_error) {
      hasSession = false
    }
  }
  
  // Fallback to custom auth token validation
  if (!hasSession) {
    hasSession = checkAuthToken(req)
  }

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/signup', 
    '/onboarding',
    '/password-reset',
    '/verify-email',
    '/email-verified',
    '/otp',
    '/contact',
    '/help',
    '/legal',
    '/company',
    '/advertise',
    '/blog',
    '/discover',
    '/businesses',
    '/cars',
    '/deals',
    '/education',
    '/events',
    '/health',
    '/homes',
    '/jobs',
    '/marketplace',
    '/rentals',
    '/services',
    '/unauthorized',
    '/add-a-business',
    '/claim-a-business',
    '/business',
    '/report',
    '/support-ticket'
  ]

  // Define API routes that don't require authentication
  const publicApiRoutes = [
    '/api/auth',
    '/api/v1/business-submissions',
    '/api/v1/business-verification', 
    '/api/v1/reports/submit',
    '/api/v1/business-directory'
  ]

  // Check if the current route is public (with exact matching for root route)
  const isPublicRoute = publicRoutes.some(route => {
    if (route === '/') {
      return pathname === '/' // Exact match for root route
    }
    return pathname.startsWith(route)
  })
  const isPublicApiRoute = publicApiRoutes.some(route => pathname.startsWith(route))
  const isAssetRoute = pathname.startsWith('/_next') || 
                      pathname.startsWith('/favicon') || 
                      pathname.startsWith('/robots') ||
                      pathname.startsWith('/sitemap') ||
                      pathname.startsWith('/manifest')

  // Always allow public routes, API routes, and asset routes
  if (isPublicRoute || isPublicApiRoute || isAssetRoute) {
    return res
  }

  // For protected routes, require authentication
  // All dashboard routes and any route that should be protected
  const protectedRoutes = ['/dashboards', '/dashboard', '/admin', '/settings']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  if (isProtectedRoute) {
    if (!hasSession) {
      // Redirect to login with return URL
      const redirectUrl = new URL('/login', req.url)
      redirectUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return res
}

// Helper function to check for auth token
function checkAuthToken(req: NextRequest): boolean {
  // Check for Authorization header
  const authHeader = req.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return true
  }
  
  // Check for session cookie
  const sessionCookie = req.cookies.get('supabase-auth-token')?.value
  return !!sessionCookie
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}