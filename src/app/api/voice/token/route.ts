import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    // For Beta WebSocket API, just return the API key
    // The voice-agent.tsx uses: openai-insecure-api-key.${clientSecret}
    // So it expects the actual API key
    
    return NextResponse.json({
      client_secret: apiKey
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}