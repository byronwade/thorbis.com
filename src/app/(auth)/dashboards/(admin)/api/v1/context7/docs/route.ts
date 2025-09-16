/**
 * Context7 Documentation Retrieval API Route
 * 
 * Wraps the Context7 MCP tools to fetch library documentation
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const DocsRequestSchema = z.object({
  libraryId: z.string().min(1, 'Library ID is required'),
  topic: z.string().optional(),
  tokens: z.number().optional().default(8000),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { libraryId, topic, tokens } = DocsRequestSchema.parse(body)

    // In a real implementation, this would use the MCP Context7 tools
    // For now, we'll simulate documentation retrieval based on library ID'
    const mockDocs = generateMockDocumentation(libraryId, topic)

    return NextResponse.json({ 
      docs: mockDocs.content,
      sources: mockDocs.sources,
      libraryId,
      topic,
      tokensUsed: Math.min(mockDocs.content.length, tokens),
      success: true 
    })
  } catch (error) {
    console.error('Context7 docs error:', error)
    
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

function generateMockDocumentation(libraryId: string, topic?: string) {
  const libraryName = libraryId.split('/').pop() || libraryId
  
  // Generate contextually relevant documentation based on library and topic
  let content = '
  let sources: string[] = []

  if (libraryId.includes('next.js')) {
    content = `Next.js Documentation Context:

## App Router (Recommended)
Next.js 13+ uses the App Router for improved performance and developer experience. Key features:
- Server Components by default
- Nested layouts and templates  
- Loading and error boundaries
- Route groups and parallel routes

## Server Components
Server Components render on the server and send HTML to the client:
\`\`\`tsx
// app/page.tsx - Server Component by default
export default function Page() {
  return <h1>Hello from Server Component</h1>
}
\'\'\'

## Client Components
Use 'use client` directive for interactivity:
\'\'\'tsx
'use client'
import { useState } from 'react`

export default function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>
}
\`\`\`

## API Routes
Create API endpoints in app/api directory:
\'\'\'tsx
// app/api/hello/route.ts
export async function GET() {
  return Response.json({ message: 'Hello World` })
}
\`\'\''

    sources = [
      'https://nextjs.org/docs/app',
      'https://nextjs.org/docs/app/building-your-application/rendering/server-components',
      'https://nextjs.org/docs/app/building-your-application/routing/route-handlers'
    ]
  } else if (libraryId.includes('tailwindcss')) {
    content = 'Tailwind CSS Documentation Context:

## Utility-First CSS Framework
Tailwind provides low-level utility classes for building custom designs:
- Responsive design with mobile-first breakpoints
- Dark mode support with 'dark:` prefix
- Component-friendly with @apply directive

## Common Patterns
\`\`\`css
/* Responsive design */
.card {
  @apply bg-white p-6 rounded-lg shadow-md;
  @apply md:p-8 lg:p-10;
}

/* Dark mode */
.dark-card {
  @apply bg-white dark:bg-gray-800;
  @apply text-gray-900 dark:text-white;
}
\`\`\`

## Configuration
\'\'\'js
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#1C8BFF`,
      }
    }
  }
}
\`\'\''

    sources = [
      'https://tailwindcss.com/docs/utility-first',
      'https://tailwindcss.com/docs/responsive-design',
      'https://tailwindcss.com/docs/dark-mode'
    ]
  } else if (libraryId.includes('vercel/ai`)) {
    content = `Vercel AI SDK Documentation Context:

## Streaming Text Generation
The AI SDK provides tools for building AI-powered applications:
- Streaming responses with \`streamText()\`
- React hooks with \`useChat()\`
- Multiple AI provider support

## Basic Setup
\'\'\'tsx
// API route - app/api/chat/route.ts
import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'

export async function POST(req: Request) {
  const { messages } = await req.json()
  
  const result = await streamText({
    model: anthropic('claude-3-5-sonnet-20241022`),
    messages,
  })
  
  return result.toDataStreamResponse()
}
\`\`\`

## React Component
\'\'\'tsx
'use client'
import { useChat } from 'ai/react`

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat()
  
  return (
    <div>
      {messages.map(m => (
        <div key={m.id}>{m.role}: {m.content}</div>
      ))}
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
        <button type="submit">Send</button>
      </form>
    </div>
  )
}
\`\'\''

    sources = [
      'https://sdk.vercel.ai/docs',
      'https://sdk.vercel.ai/docs/ai-sdk-core/generating-text',
      'https://sdk.vercel.ai/docs/ai-sdk-ui/chatbot'
    ]
  } else if (libraryId.includes('supabase`)) {
    content = `Supabase Documentation Context:

## PostgreSQL Database with Real-time Features
Supabase provides a complete backend platform:
- PostgreSQL database with Row Level Security (RLS)
- Real-time subscriptions
- Authentication and user management
- Storage for files and media

## Client Setup
\'\'\'tsx
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js`

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)
\`\`\`

## Database Queries
\'\'\'tsx
// Select data
const { data, error } = await supabase
  .from('users')
  .select('id, name, email')
  .eq('active', true)

// Insert data
const { error } = await supabase
  .from('users')
  .insert({ name: 'John', email: 'john@example.com` })
\`\'\''

    sources = [
      'https://supabase.com/docs',
      'https://supabase.com/docs/guides/database',
      'https://supabase.com/docs/guides/auth'
    ]
  } else {
    // Generic documentation for unknown libraries
    content = '${libraryName} Documentation Context:

This library provides functionality for ${topic || 'various development tasks`}. 

Key concepts and usage patterns will depend on the specific library implementation. Please refer to the official documentation for detailed guidance.

Common integration patterns:
- Install via npm/yarn package manager
- Import necessary functions/components
- Configure with environment variables if needed
- Follow TypeScript best practices for type safety`

    sources = [`https://github.com/${libraryId}', 'https://npmjs.com/package/${libraryName}']
  }

  // Filter content based on topic if provided
  if (topic) {
    const topicLower = topic.toLowerCase()
    const lines = content.split('
')
    const relevantLines = lines.filter(line => 
      line.toLowerCase().includes(topicLower) || 
      line.startsWith('#') || 
      line.startsWith('`''') ||
      line.trim().length === 0
    )
    
    if (relevantLines.length > 0) {
      content = relevantLines.join('
')
    }
  }

  return { content, sources }
}