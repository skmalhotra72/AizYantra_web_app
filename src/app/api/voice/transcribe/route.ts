import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('🎙️ Whisper transcription request received')

    // Get the API key from environment
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.error('❌ OPENAI_API_KEY not found in environment')
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    // Get the form data from the request
    const formData = await request.formData()
    const audioFile = formData.get('file') as File
    const language = formData.get('language') as string || 'en'

    if (!audioFile) {
      console.error('❌ No audio file provided')
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    console.log('📦 Audio file received:', audioFile.name, audioFile.size, 'bytes')

    // Create new FormData for OpenAI API
    const openaiFormData = new FormData()
    openaiFormData.append('file', audioFile)
    openaiFormData.append('model', 'whisper-1')
    openaiFormData.append('language', language)
    openaiFormData.append('response_format', 'json')

    console.log('🚀 Sending to OpenAI Whisper API...')

    // Call OpenAI Whisper API
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: openaiFormData
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ OpenAI Whisper API error:', response.status, errorText)
      return NextResponse.json(
        { error: 'Transcription failed', details: errorText },
        { status: response.status }
      )
    }

    const result = await response.json()
    console.log('✅ Transcription successful:', result.text?.substring(0, 50) + '...')

    return NextResponse.json({
      text: result.text,
      language: result.language
    })

  } catch (error) {
    console.error('❌ Error in transcription route:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}