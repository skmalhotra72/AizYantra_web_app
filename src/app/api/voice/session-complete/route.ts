import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase with service role for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// n8n webhook URL - add this to your Vercel environment variables
const N8N_WEBHOOK_URL = process.env.N8N_POST_CALL_WEBHOOK_URL

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId } = body

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // 1. Fetch the complete session data
    const { data: session, error: sessionError } = await supabase
      .from('voice_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .single()

    if (sessionError || !session) {
      console.error('Error fetching session:', sessionError)
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // 2. Fetch all conversation turns
    const { data: turns, error: turnsError } = await supabase
      .from('voice_turns')
      .select('*')
      .eq('session_id', session.id)
      .order('turn_number', { ascending: true })

    if (turnsError) {
      console.error('Error fetching turns:', turnsError)
    }

    // 3. Fetch contact if exists
    let contact = null
    if (session.contact_id) {
      const { data: contactData } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', session.contact_id)
        .single()
      contact = contactData
    }

    // 4. Fetch organization if exists
    let organization = null
    if (session.organization_id) {
      const { data: orgData } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', session.organization_id)
        .single()
      organization = orgData
    }

    // 5. Fetch lead if exists
    let lead = null
    if (session.lead_id) {
      const { data: leadData } = await supabase
        .from('leads')
        .select('*')
        .eq('id', session.lead_id)
        .single()
      lead = leadData
    }

    // 6. Build the full transcript
    const transcript = turns?.map(turn => 
      `${turn.speaker === 'agent' ? 'Tripti' : 'Caller'}: ${turn.content}`
    ).join('\n') || ''

    // 7. Prepare the payload for n8n
    const webhookPayload = {
      // Session metadata
      session: {
        id: session.id,
        session_id: session.session_id,
        status: session.status,
        started_at: session.started_at,
        ended_at: session.ended_at,
        duration_seconds: session.duration_seconds,
        language_detected: session.language_detected,
        pipeline_stage: session.pipeline_stage,
        intent: session.intent,
      },
      // Caller information
      caller: {
        name: session.caller_name || contact?.name,
        email: session.caller_email || contact?.email,
        phone: session.caller_phone || contact?.phone,
        company: session.caller_company || organization?.name,
        role: session.caller_role || contact?.role,
        preferred_language: contact?.preferred_language,
        communication_preference: contact?.communication_preference,
      },
      // Related records
      contact_id: session.contact_id,
      organization_id: session.organization_id,
      lead_id: session.lead_id,
      lead_number: lead?.lead_number,
      // Full conversation
      transcript: transcript,
      turn_count: turns?.length || 0,
      // Timestamp
      processed_at: new Date().toISOString(),
    }

    // 8. Send to n8n webhook
    if (N8N_WEBHOOK_URL) {
      try {
        const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookPayload),
        })

        if (!n8nResponse.ok) {
          console.error('n8n webhook failed:', await n8nResponse.text())
          // Don't fail the request, just log the error
        } else {
          console.log('✅ n8n webhook triggered successfully')
        }
      } catch (webhookError) {
        console.error('Error calling n8n webhook:', webhookError)
        // Don't fail the request, just log the error
      }
    } else {
      console.warn('⚠️ N8N_POST_CALL_WEBHOOK_URL not configured')
    }

    // 9. Update session to mark as processed
    await supabase
      .from('voice_sessions')
      .update({ 
        metadata: {
          ...session.metadata,
          n8n_processed: true,
          n8n_processed_at: new Date().toISOString()
        }
      })
      .eq('id', session.id)

    return NextResponse.json({
      success: true,
      message: 'Session completion processed',
      session_id: sessionId,
      webhook_triggered: !!N8N_WEBHOOK_URL
    })

  } catch (error) {
    console.error('Error processing session completion:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}