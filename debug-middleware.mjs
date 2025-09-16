#!/usr/bin/env node

/**
 * Debug middleware route protection
 */

console.log('🔍 Debugging Middleware Route Protection');
console.log('=======================================\n');

function debugMiddleware(pathname) {
  console.log(`\n🧪 Testing route: ${pathname}`);
  console.log('=====================================');
  
  // Define public routes exactly as in middleware
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
  ];

  // Check each step
  console.log('Step 1: Check if public route');
  const matchingPublicRoutes = publicRoutes.filter(route => pathname.startsWith(route));
  const isPublicRoute = matchingPublicRoutes.length > 0;
  console.log(`   Matching public routes: ${matchingPublicRoutes.join(', ') || 'none'}`);
  console.log(`   Is public route: ${isPublicRoute}`);

  console.log('\nStep 2: Check if asset route');
  const isAssetRoute = pathname.startsWith('/_next') || 
                      pathname.startsWith('/favicon') || 
                      pathname.startsWith('/robots') ||
                      pathname.startsWith('/sitemap') ||
                      pathname.startsWith('/manifest');
  console.log(`   Is asset route: ${isAssetRoute}`);

  console.log('\nStep 3: Early return check');
  if (isPublicRoute || isAssetRoute) {
    console.log(`   ✅ Would return early (allow) - route is public or asset`);
    return 'allowed-early';
  }

  console.log('   ⏭️  Continuing to protected route check');

  console.log('\nStep 4: Check if protected route');
  const protectedRoutes = ['/dashboards', '/dashboard', '/admin', '/settings'];
  const matchingProtectedRoutes = protectedRoutes.filter(route => pathname.startsWith(route));
  const isProtectedRoute = matchingProtectedRoutes.length > 0;
  console.log(`   Matching protected routes: ${matchingProtectedRoutes.join(', ') || 'none'}`);
  console.log(`   Is protected route: ${isProtectedRoute}`);

  if (isProtectedRoute) {
    console.log('\nStep 5: Check authentication');
    const hasSession = false; // Mock no session
    console.log(`   Has session: ${hasSession}`);
    
    if (!hasSession) {
      console.log(`   🚫 Would redirect to login`);
      return 'blocked';
    } else {
      console.log(`   ✅ Would allow (authenticated)`);
      return 'allowed-auth';
    }
  }

  console.log('\nStep 6: Default allow');
  console.log(`   ✅ Would allow (default)`);
  return 'allowed-default';
}

// Test the problematic route
const result = debugMiddleware('/dashboards/hs');

console.log(`\n🎯 Final Result: ${result}`);

if (result === 'allowed-early') {
  console.log('\n❌ PROBLEM IDENTIFIED:');
  console.log('The route is being allowed by the public route check!');
  console.log('This means one of the public routes matches /dashboards/hs');
  
  // Find which public route is causing the issue
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
  ];
  
  console.log('\n🔍 Checking which public route matches:');
  publicRoutes.forEach(route => {
    if ('/dashboards/hs'.startsWith(route)) {
      console.log(`   📍 MATCH: "${route}" matches "/dashboards/hs"`);
    }
  });
} else if (result === 'blocked') {
  console.log('\n✅ MIDDLEWARE WORKING CORRECTLY');
  console.log('The route should be blocked. If you can still access it:');
  console.log('1. Clear browser cookies (especially mock-session)');
  console.log('2. Restart the development server');
  console.log('3. Check for cached responses');
}