import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    // Simple mock response for now
    const response = {
      message: {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'This is a mock AI response. The actual AI integration is not yet implemented.',
        timestamp: new Date().toISOString()
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('AI Chat API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}