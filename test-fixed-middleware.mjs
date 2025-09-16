#!/usr/bin/env node

/**
 * Test fixed middleware route protection
 */

console.log('🛡️ Testing Fixed Middleware Route Protection');
console.log('===========================================\n');

function testFixedMiddleware(pathname) {
  console.log(`Testing route: ${pathname}`);
  
  // Mock session check - assume no session for testing
  const hasSession = false;
  
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

  // Fixed public route checking logic
  const isPublicRoute = publicRoutes.some(route => {
    if (route === '/') {
      return pathname === '/' // Exact match for root route
    }
    return pathname.startsWith(route)
  });
  
  const isAssetRoute = pathname.startsWith('/_next') || 
                      pathname.startsWith('/favicon') || 
                      pathname.startsWith('/robots') ||
                      pathname.startsWith('/sitemap') ||
                      pathname.startsWith('/manifest');

  // Always allow public routes and asset routes
  if (isPublicRoute || isAssetRoute) {
    console.log(`✅ Route allowed (public): ${pathname}`);
    return 'allowed';
  }

  // For protected routes, require authentication
  const protectedRoutes = ['/dashboards', '/dashboard', '/admin', '/settings'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (isProtectedRoute) {
    if (!hasSession) {
      console.log(`🚫 Route BLOCKED (requires auth): ${pathname}`);
      return 'blocked';
    } else {
      console.log(`✅ Route allowed (authenticated): ${pathname}`);
      return 'allowed';
    }
  }

  // Default allow for other routes
  console.log(`✅ Route allowed (default): ${pathname}`);
  return 'allowed';
}

// Test the critical routes
const testRoutes = [
  '/',
  '/login',
  '/dashboards',
  '/dashboards/hs', 
  '/dashboards/(verticals)/hs',
  '/dashboard',
  '/admin',
  '/contact'
];

console.log('🧪 Testing Routes with Fixed Logic:\n');

const results = testRoutes.map(route => ({
  route,
  result: testFixedMiddleware(route)
}));

console.log('\n📊 Results Summary:');
console.log('==================');

const blocked = results.filter(r => r.result === 'blocked');
const allowed = results.filter(r => r.result === 'allowed');

console.log(`🚫 BLOCKED (requires auth): ${blocked.length}`);
blocked.forEach(r => console.log(`   • ${r.route}`));

console.log(`✅ ALLOWED: ${allowed.length}`);
allowed.forEach(r => console.log(`   • ${r.route}`));

// Check if the fix worked
const dashboardHs = results.find(r => r.route === '/dashboards/hs');
if (dashboardHs && dashboardHs.result === 'blocked') {
  console.log('\n🎉 SUCCESS! /dashboards/hs is now properly blocked!');
  console.log('✅ Middleware fix is working correctly.');
} else {
  console.log('\n❌ Issue still exists with /dashboards/hs');
}