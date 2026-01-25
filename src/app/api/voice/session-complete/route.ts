// src/app/api/voice/session-complete/route.ts
// EXACT MATCH to database schema - January 25, 2026

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use SERVICE ROLE KEY to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const N8N_WEBHOOK_URL = process.env.N8N_POST_CALL_WEBHOOK_URL

export async function POST(request: NextRequest) {
  console.log('========================================')
  console.log('📞 SESSION-COMPLETE API CALLED')
  console.log('========================================')
  
  try {
    const body = await request.json()
    const { sessionId } = body

    console.log('📥 Received sessionId:', sessionId)

    if (!sessionId) {
      console.error('❌ No sessionId provided')
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // ========================================
    // STEP 1: Fetch the session by session_id STRING
    // ========================================
    console.log('🔍 Step 1: Fetching session...')
    
    const { data: session, error: sessionError } = await supabase
      .from('voice_sessions')
      .select(`
        id,
        session_id,
        channel,
        phone_number,
        contact_id,
        organization_id,
        lead_id,
        status,
        language_detected,
        started_at,
        ended_at,
        duration_seconds,
        transcript,
        summary,
        caller_name,
        caller_company,
        caller_role,
        caller_email,
        caller_phone,
        objective_captured,
        intent,
        sentiment,
        metadata,
        created_at
      `)
      .eq('session_id', sessionId)
      .single()

    if (sessionError || !session) {
      console.error('❌ Session error:', sessionError)
      return NextResponse.json(
        { error: 'Session not found', details: sessionError?.message },
        { status: 404 }
      )
    }

    console.log('✅ Session found:', {
      uuid: session.id,
      caller_name: session.caller_name,
      caller_phone: session.caller_phone,
      contact_id: session.contact_id,
      lead_id: session.lead_id,
      duration: session.duration_seconds
    })

    // ========================================
    // STEP 2: Fetch voice_turns using session UUID
    // ========================================
    console.log('🔍 Step 2: Fetching turns with UUID:', session.id)
    
    const { data: turns, error: turnsError } = await supabase
      .from('voice_turns')
      .select('*')
      .eq('session_id', session.id)
      .order('turn_number', { ascending: true })

    if (turnsError) {
      console.error('⚠️ Turns error:', turnsError)
    }

    console.log('📝 Turns found:', turns?.length || 0)

    // ========================================
    // STEP 3: Build transcript from turns
    // ========================================
    let transcript = session.transcript || ''
    
    if ((!transcript || transcript.length < 10) && turns && turns.length > 0) {
      transcript = turns.map(turn => {
        const speaker = turn.speaker === 'tripti' || turn.speaker === 'agent' ? 'Tripti' : 'Caller'
        return `${speaker}: ${turn.content}`
      }).join('\n\n')
      console.log('📜 Built transcript from turns:', transcript.length, 'chars')
    } else {
      console.log('📜 Using existing transcript:', transcript.length, 'chars')
    }

    // ========================================
    // STEP 4: Fetch contact if exists
    // ========================================
    let contact = null
    if (session.contact_id) {
      const { data: contactData } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', session.contact_id)
        .single()
      contact = contactData
      console.log('👤 Contact:', contact?.name || 'not found')
    }

    // ========================================
    // STEP 5: Fetch organization if exists
    // ========================================
    let organization = null
    if (session.organization_id) {
      const { data: orgData } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', session.organization_id)
        .single()
      organization = orgData
      console.log('🏢 Organization:', organization?.name || 'not found')
    }

    // ========================================
    // STEP 6: Fetch or find lead
    // ========================================
    let lead = null
    let leadId = session.lead_id

    if (leadId) {
      const { data: leadData } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single()
      lead = leadData
      console.log('📋 Lead found:', lead?.lead_number)
    } else if (session.contact_id) {
      // Try to find existing lead for this contact
      const { data: existingLead } = await supabase
        .from('leads')
        .select('*')
        .eq('contact_id', session.contact_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      if (existingLead) {
        lead = existingLead
        leadId = existingLead.id
        console.log('📋 Found lead by contact:', existingLead.lead_number)
      }
    }

    // ========================================
    // STEP 7: Calculate duration
    // ========================================
    const durationSeconds = session.duration_seconds || 
      (session.ended_at && session.started_at 
        ? Math.round((new Date(session.ended_at).getTime() - new Date(session.started_at).getTime()) / 1000)
        : 0)

    // ========================================
    // STEP 8: Build webhook payload
    // ========================================
    const webhookPayload = {
      session: {
        id: session.id,
        session_id: session.session_id,
        status: session.status || 'completed',
        started_at: session.started_at,
        ended_at: session.ended_at,
        duration_seconds: durationSeconds,
        language_detected: session.language_detected || 'en-IN',
        intent: session.intent || 'initial_inquiry',
        sentiment: session.sentiment || 'neutral',
        summary: session.summary || '',
        objective_captured: session.objective_captured || '',
      },
      
      caller: {
        name: session.caller_name || contact?.name || 'Unknown Caller',
        email: session.caller_email || contact?.email || '',
        phone: session.caller_phone || contact?.phone || '',
        company: session.caller_company || organization?.name || '',
        role: session.caller_role || contact?.role || '',
      },
      
      contact_id: session.contact_id || null,
      organization_id: session.organization_id || null,
      lead_id: leadId || null,
      lead_number: lead?.lead_number || null,
      
      transcript: transcript || 'No transcript available',
      turn_count: turns?.length || 0,
      
      processed_at: new Date().toISOString(),
    }

    console.log('========================================')
    console.log('📤 PAYLOAD SUMMARY:')
    console.log('  Caller:', webhookPayload.caller.name)
    console.log('  Phone:', webhookPayload.caller.phone)
    console.log('  Company:', webhookPayload.caller.company)
    console.log('  Lead:', webhookPayload.lead_number || 'none')
    console.log('  Turns:', webhookPayload.turn_count)
    console.log('  Transcript:', webhookPayload.transcript.length, 'chars')
    console.log('  Duration:', webhookPayload.session.duration_seconds, 'sec')
    console.log('========================================')

    // ========================================
    // STEP 9: Send to n8n webhook
    // ========================================
    let webhookTriggered = false
    
    if (N8N_WEBHOOK_URL) {
      console.log('🔗 Sending to n8n...')
      
      try {
        const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(webhookPayload),
        })

        if (n8nResponse.ok) {
          console.log('✅ n8n webhook SUCCESS')
          webhookTriggered = true
        } else {
          console.error('❌ n8n failed:', n8nResponse.status)
        }
      } catch (err) {
        console.error('❌ n8n error:', err)
      }
    } else {
      console.error('❌ N8N_POST_CALL_WEBHOOK_URL not set!')
    }

    // ========================================
    // STEP 10: Return response
    // ========================================
    return NextResponse.json({
      success: true,
      message: 'Session completion processed',
      session_id: sessionId,
      webhook_triggered: webhookTriggered,
      data_summary: {
        caller_name: webhookPayload.caller.name,
        caller_phone: webhookPayload.caller.phone,
        caller_company: webhookPayload.caller.company,
        turn_count: webhookPayload.turn_count,
        transcript_length: webhookPayload.transcript.length,
        lead_id: webhookPayload.lead_id,
        lead_number: webhookPayload.lead_number,
        duration_seconds: webhookPayload.session.duration_seconds
      }
    })

  } catch (error) {
    console.error('❌ CRITICAL ERROR:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}