#!/usr/bin/env node

/**
 * Test middleware route protection
 */

console.log('🛡️ Testing Middleware Route Protection');
console.log('====================================\n');

// Simulate middleware logic
function testMiddleware(pathname) {
  console.log(`Testing route: ${pathname}`);
  
  // Mock session check - assume no session for testing
  const hasSession = false;
  
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
  ];

  // Check if the current route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  const isAssetRoute = pathname.startsWith('/_next') || 
                      pathname.startsWith('/favicon') || 
                      pathname.startsWith('/robots') ||
                      pathname.startsWith('/sitemap') ||
                      pathname.startsWith('/manifest');

  // Always allow public routes and asset routes
  if (isPublicRoute || isAssetRoute) {
    console.log(`✅ Route allowed (public): ${pathname}\n`);
    return 'allowed';
  }

  // For protected routes, require authentication
  const protectedRoutes = ['/dashboards', '/dashboard', '/admin', '/settings'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (isProtectedRoute) {
    if (!hasSession) {
      console.log(`🚫 Route blocked (requires auth): ${pathname}`);
      console.log(`   Redirect to: /login?redirectTo=${pathname}\n`);
      return 'blocked';
    } else {
      console.log(`✅ Route allowed (authenticated): ${pathname}\n`);
      return 'allowed';
    }
  }

  // Default allow for other routes
  console.log(`✅ Route allowed (default): ${pathname}\n`);
  return 'allowed';
}

// Test various routes
const testRoutes = [
  '/',
  '/login',
  '/dashboards',
  '/dashboards/hs', 
  '/dashboards/(verticals)/hs',
  '/dashboard',
  '/admin',
  '/settings',
  '/contact',
  '/help',
  '/_next/static/chunk.js',
  '/some-other-route'
];

console.log('🧪 Testing Routes:\n');

const results = testRoutes.map(route => ({
  route,
  result: testMiddleware(route)
}));

// Summary
console.log('📊 Test Results Summary:');
console.log('=======================');

const blocked = results.filter(r => r.result === 'blocked');
const allowed = results.filter(r => r.result === 'allowed');

console.log(`✅ Allowed routes: ${allowed.length}`);
allowed.forEach(r => console.log(`   • ${r.route}`));

console.log(`🚫 Blocked routes: ${blocked.length}`);
blocked.forEach(r => console.log(`   • ${r.route}`));

// Check specific concern
console.log('\n🔍 Analysis:');
const dashboardHs = results.find(r => r.route === '/dashboards/hs');
if (dashboardHs) {
  if (dashboardHs.result === 'blocked') {
    console.log('✅ /dashboards/hs is correctly blocked by middleware');
    console.log('   If you can still access it, the issue might be:');
    console.log('   1. Server not restarted after middleware changes');
    console.log('   2. Mock session cookie still present in browser');
    console.log('   3. Route exists outside the expected structure');
  } else {
    console.log('❌ /dashboards/hs is NOT blocked - middleware issue!');
  }
}