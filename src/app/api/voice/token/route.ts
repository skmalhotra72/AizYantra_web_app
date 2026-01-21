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

    // GA API endpoint with correct parameter structure
    const response = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        expires_after: {
          anchor: 'created_at',
          seconds: 600
        },
        session: {
          type: 'realtime',
          model: 'gpt-realtime',
          instructions: `You are Aanya, a friendly AI assistant for AIzYantra, an AI consulting company in India. 
            
Your role:
- Help visitors understand AIzYantra's services
- Gather requirements for AI projects
- Answer questions about AI solutions

Key services: Voice AI Agents, Chatbots, Workflow Automation, Custom AI Solutions

Your personality:
- Warm and friendly
- Patient and helpful
- Speak in a natural, conversational tone
- Keep responses concise (2-3 sentences)
- Use Indian context (rupees, namaste)

Start by greeting: "Namaste! I'm Aanya from AIzYantra. How can I help you today?"`,
          // Voice is inside audio.output, not at session level
          audio: {
            output: {
              voice: 'shimmer'
            }
          }
        }
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('OpenAI API error:', error)
      return NextResponse.json(
        { error: 'Failed to create session', details: error },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('Client secret created, session ID:', data.session?.id || 'unknown')
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error creating OpenAI session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}