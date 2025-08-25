import { NextRequest, NextResponse } from "next/server";
import { createAuthMiddleware } from "@lib/database/supabase/middleware";
import { createI18nMiddleware, getLocaleFromPath } from "@lib/i18n/middleware";

// Create i18n middleware instance
const i18nMiddleware = createI18nMiddleware({
  defaultLocale: 'en',
  locales: ['en', 'es', 'fr', 'de', 'pt', 'it', 'nl', 'ja', 'ko', 'zh', 'ru', 'ar', 'hi'],
  ignoredPaths: ['/api', '/admin', '/_next', '/_vercel', '/favicon.ico', '/robots.txt', '/sitemap.xml', '/manifest.json'],
  redirectRoot: true,
  cookieName: 'thorbis_locale'
});

// Combined middleware for i18n, auth and URL sanitization
export async function middleware(request: NextRequest) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Skip i18n processing for API routes and static files
  const skipI18n = ['/api', '/admin', '/_next', '/_vercel'].some(path => 
    pathname.startsWith(path)
  ) || pathname.includes('.');

  // Normalize SEO-friendly location paths: lowercase, hyphen-collapsed
  try {
    const locationMatch = pathname.match(/^\/([a-z]{2})\/([^/]+)\/([^/]+)\/(.+)$/);
    if (locationMatch) {
      const [ , country, state, city, tail ] = locationMatch;
      const normalize = (s: string) => s.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9\-\s]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
      const nCountry = normalize(country);
      const nState = normalize(state);
      const nCity = normalize(city);
      const nTail = normalize(tail);
      const normalized = `/${nCountry}/${nState}/${nCity}/${nTail}`;
      if (normalized !== pathname) {
        return NextResponse.rewrite(new URL(normalized + url.search, url.origin));
      }
    }
  } catch {}

  let response: NextResponse;

  if (!skipI18n) {
    // First, handle internationalization
    const i18nResponse = i18nMiddleware(request);
    if (i18nResponse) {
      response = i18nResponse;
      // If this is a redirect, return it immediately
      if (response.status >= 300 && response.status < 400) {
        return response;
      }
    } else {
      response = NextResponse.next();
    }
  } else {
    response = NextResponse.next();
  }

  // Get the current locale for protected routes
  const locale = getLocaleFromPath(pathname);

  // TEMPORARILY DISABLED - Handle authentication for protected routes
  // const isProtectedRoute = pathname.startsWith("/dashboard") || 
  //                         pathname.startsWith("/admin") ||
  //                         pathname.startsWith(`/${locale}/dashboard`) ||
  //                         pathname.startsWith(`/${locale}/admin`);

  // if (isProtectedRoute) {
  //   console.log("🔍 Middleware: Processing protected route:", pathname, "Locale:", locale, "Referer:", request.headers.get("referer"));
  //   try {
  //     const authResponse = await createAuthMiddleware(request);
  //     if (authResponse) {
  //       // If auth middleware returned a response, use it but preserve i18n headers
  //       if (response.headers.get('x-locale')) {
  //         authResponse.headers.set('x-locale', response.headers.get('x-locale'));
  //       }
  //       return authResponse;
  //     }
  //   } catch (error) {
  //     console.error("Auth middleware error:", error);
  //     // Fail securely - redirect to localized login
  //     const loginPath = locale === 'en' ? '/login' : `/${locale}/login`;
  //     const loginUrl = new URL(loginPath, url.origin);
  //     loginUrl.searchParams.set("redirectTo", pathname);
  //     return NextResponse.redirect(loginUrl);
  //   }
  // }

  // Sanitize sensitive query parameters from login pages
  const isLoginPage = pathname === "/login" || pathname.endsWith("/login");
  if (isLoginPage) {
    const originalParams = url.searchParams;
    let mutated = false;

    // Keys we never want in URLs
    const sensitiveKeys = new Set(["password", "pass", "pwd"]);
    // Also treat PII keys as sensitive in URL for safety
    const piiKeys = new Set(["email"]);

    // Remove sensitive params
    for (const key of Array.from(originalParams.keys())) {
      if (sensitiveKeys.has(key) || piiKeys.has(key)) {
        originalParams.delete(key);
        mutated = true;
      }
    }

    if (mutated) {
      // Rebuild a clean URL preserving allowed params
      const cleanUrl = new URL(url.origin + url.pathname);
      for (const [key, value] of originalParams.entries()) {
        cleanUrl.searchParams.append(key, value);
      }

      // Use 302 to avoid caching the sensitive URL in browser history
      return NextResponse.redirect(cleanUrl, 302);
    }
  }

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Temporary rewrites for product route cleanup during development
  try {
    if (/^\/store\/product\//.test(pathname)) {
      const rewritten = pathname.replace(/^\/store\/product\//, '/store/');
      return NextResponse.rewrite(new URL(rewritten + url.search, url.origin));
    }
  } catch {}

  return response;
}

// Apply middleware to all routes except static files and API routes
export const config = {
  matcher: [
    // Match all pathnames except for:
    // - API routes
    // - Static files
    // - Images and assets
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json|sw.js|images|icons|assets).*)',
  ],
};


