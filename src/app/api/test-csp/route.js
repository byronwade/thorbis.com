import { NextResponse } from 'next/server';

export async function GET() {
  // Return the CSP header content for testing
  const cspHeader = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://*.supabase.co https://va.vercel-scripts.com https://*.vercel-scripts.com https://maps.googleapis.com; script-src-elem 'self' 'unsafe-inline' https://vercel.live https://*.supabase.co https://va.vercel-scripts.com https://*.vercel-scripts.com https://maps.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob: https://maps.googleapis.com https://maps.gstatic.com; connect-src 'self' https: https://*.supabase.co https://api.pwnedpasswords.com https://va.vercel-scripts.com https://vercel.live https://*.vercel-scripts.com https://maps.googleapis.com https://maps.gstatic.com; media-src 'self' https:; worker-src 'self' blob:; object-src 'none'; frame-ancestors 'none';";
  
  return new NextResponse(cspHeader, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
