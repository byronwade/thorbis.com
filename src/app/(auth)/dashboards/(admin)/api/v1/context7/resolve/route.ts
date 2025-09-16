/**
 * Context7 Library Resolution API Route
 * 
 * Wraps the Context7 MCP tools to resolve library names to Context7-compatible IDs
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const ResolveRequestSchema = z.object({
  libraryName: z.string().min(1, 'Library name is required'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { libraryName } = ResolveRequestSchema.parse(body)

    // In a real implementation, this would use the MCP Context7 tools
    // For now, we'll simulate the library ID resolution'
    const libraryMappings: Record<string, string> = {
      'next.js': '/vercel/next.js',
      'nextjs': '/vercel/next.js',
      'react': '/facebook/react',
      'tailwindcss': '/tailwindlabs/tailwindcss',
      'tailwind': '/tailwindlabs/tailwindcss',
      'supabase': '/supabase/supabase',
      'stripe': '/stripe/stripe-node',
      'anthropic': '/anthropics/anthropic-sdk-typescript',
      'claude': '/anthropics/anthropic-sdk-typescript',
      'vercel ai sdk': '/vercel/ai',
      'ai sdk': '/vercel/ai',
      'typescript': '/microsoft/TypeScript',
      'prisma': '/prisma/prisma',
      'mongodb': '/mongodb/node-mongodb-native',
      'express': '/expressjs/express',
      'fastify': '/fastify/fastify',
    }

    const libraryId = libraryMappings[libraryName.toLowerCase()]

    if (!libraryId) {
      return NextResponse.json({ 
        error: 'Library "${libraryName}" not found in Context7 registry',
        libraryId: null 
      }, { status: 404 })
    }

    return NextResponse.json({ 
      libraryId,
      libraryName,
      success: true 
    })
  } catch (error) {
    console.error('Context7 resolve error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request format', 
        details: error.errors 
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error : 'An error occurred'
    }, { status: 500 })
  }
}