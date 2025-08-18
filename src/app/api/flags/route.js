// Feature flags API endpoint for Vercel Toolbar integration
import { evaluateAllFlags } from '@/lib/flags/server';

export async function GET() {
  try {
    const flags = await evaluateAllFlags();
    
    return new Response(JSON.stringify(flags), {
      headers: { 
        'content-type': 'application/json',
        'cache-control': 'no-store' // Always fresh for toolbar
      }
    });
  } catch (error) {
    console.error('Flags API error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch feature flags',
        flags: {
          netflixLayout: true,
          enhancedHover: true,
          continueBrowsing: false
        }
      }), 
      {
        status: 500,
        headers: { 'content-type': 'application/json' }
      }
    );
  }
}
