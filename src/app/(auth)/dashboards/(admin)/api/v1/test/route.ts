export async function GET() {
  return new Response(JSON.stringify({ message: 'API is working' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    return new Response(JSON.stringify({ 
      message: 'POST received', 
      received: body 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Failed to parse JSON',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}
