import { createClient } from './client'

// ============================================
// TYPES
// ============================================

export interface CallerData {
  name?: string
  firstName?: string
  lastName?: string
  company?: string
  phone?: string
  email?: string
  designation?: string
  language?: string
}

export interface VoiceSessionData {
  sessionId: string
  channel: string
  phoneNumber?: string
  callerData?: CallerData
  language?: string
}

export interface VoiceTurnData {
  sessionId: string
  speaker: 'tripti' | 'user'
  content: string
  language?: string
  confidence?: number
}

// Get a fresh client instance
function getClient() {
  return createClient()
}

// ============================================
// CALLER LOOKUP & IDENTIFICATION
// ============================================

/**
 * Look up caller by phone or email to check if they're returning
 * Returns: contact_id, organization_id, lead_id, previous sessions count
 */
export async function lookupCaller(phone?: string, email?: string) {
  try {
    console.log('🔍 Looking up caller...', { phone, email })
    const supabase = getClient()

    // First, try to find contact by phone or email
    let contactQuery = supabase
      .from('contacts')
      .select('id, name, email, phone, organization_id, user_id')
    
    if (email) {
      contactQuery = contactQuery.eq('email', email)
    } else if (phone) {
      contactQuery = contactQuery.eq('phone', phone)
    } else {
      return null // No identifier provided
    }

    const { data: contact, error: contactError } = await contactQuery.single()

    if (contactError && contactError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error looking up contact:', contactError)
      return null
    }

    if (!contact) {
      console.log('❌ No existing contact found - new caller')
      return null
    }

    console.log('✅ Found existing contact:', contact.name)

    // Get previous voice sessions count
    const { count: sessionCount } = await supabase
      .from('voice_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('contact_id', contact.id)

    // Get last 5 sessions with summaries
    const { data: previousSessions } = await supabase
      .from('voice_sessions')
      .select('id, summary, created_at, objective_captured')
      .eq('contact_id', contact.id)
      .order('created_at', { ascending: false })
      .limit(5)

    // Check for any active requirements
    const { data: requirements } = await supabase
      .from('requirements')
      .select('id, requirement_id, title, status')
      .eq('contact_id', contact.id)
      .in('status', ['captured', 'analysis', 'proposal_pending'])

    // Check for active projects
    const { data: projects } = await supabase
      .from('projects')
      .select('id, project_code, name, status')
      .eq('organization_id', contact.organization_id)
      .in('status', ['kickoff', 'in_progress', 'testing'])

    return {
      isReturning: true,
      contactId: contact.id,
      organizationId: contact.organization_id,
      userId: contact.user_id,
      contactName: contact.name,
      sessionCount: sessionCount || 0,
      previousSessions: previousSessions || [],
      activeRequirements: requirements || [],
      activeProjects: projects || [],
    }
  } catch (error) {
    console.error('Error in lookupCaller:', error)
    return null
  }
}

// ============================================
// CREATE OR UPDATE CONTACT/LEAD
// ============================================

/**
 * Create or update contact and lead from collected data
 * This is called once we have minimum 3/5 fields
 */
export async function createOrUpdateCallerRecord(data: CallerData) {
  try {
    console.log('📝 Creating/updating caller record...', data)
    const supabase = getClient()

    // First, check if organization exists or create it
    let organizationId: string | null = null
    
    if (data.company) {
      const { data: existingOrg } = await supabase
        .from('organizations')
        .select('id')
        .eq('name', data.company)
        .single()

      if (existingOrg) {
        organizationId = existingOrg.id
      } else {
        // Create new organization
        const { data: newOrg, error: orgError } = await supabase
          .from('organizations')
          .insert({
            name: data.company,
            tags: ['voice_call_lead']
          })
          .select('id')
          .single()

        if (orgError) {
          console.error('Error creating organization:', orgError)
        } else {
          organizationId = newOrg.id
        }
      }
    }

    // Create or update contact
    let contactId: string | null = null
    
    const contactData = {
      name: data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim(),
      email: data.email || null,
      phone: data.phone || null,
      role: data.designation || null,
      organization_id: organizationId,
      preferred_language: data.language || 'en-IN',
      tags: ['tripti_voice_call']
    }

// Try to find existing contact
let existingContact = null
if (data.email) {
  const { data: emailResult } = await supabase
    .from('contacts')
    .select('id')
    .eq('email', data.email)
    .single()
  existingContact = emailResult
} else if (data.phone) {
  const { data: phoneResult } = await supabase
    .from('contacts')
    .select('id')
    .eq('phone', data.phone)
    .single()
  existingContact = phoneResult
}
    if (existingContact) {
      // Update existing contact
      const { data: updatedContact, error } = await supabase
        .from('contacts')
        .update(contactData)
        .eq('id', existingContact.id)
        .select('id')
        .single()

      if (error) {
        console.error('Error updating contact:', error)
      } else {
        contactId = updatedContact.id
      }
    } else {
      // Create new contact
      const { data: newContact, error } = await supabase
        .from('contacts')
        .insert(contactData)
        .select('id')
        .single()

      if (error) {
        console.error('Error creating contact:', error)
      } else {
        contactId = newContact.id
      }
    }

    // Create or update lead
    let leadId: string | null = null

    if (contactId) {
      const leadData = {
        organization_id: organizationId,
        contact_id: contactId,
        source: 'voice_call',
        source_detail: 'Tripti AI Voice Agent',
        status: 'new',
        score: 0,
        service_interest: ['ai_automation']
      }

      // Check for existing lead
      const { data: existingLead } = await supabase
        .from('leads')
        .select('id')
        .eq('contact_id', contactId)
        .eq('status', 'new')
        .single()

      if (existingLead) {
        leadId = existingLead.id
      } else {
        const { data: newLead, error: leadError } = await supabase
          .from('leads')
          .insert(leadData)
          .select('id')
          .single()

        if (leadError) {
          console.error('Error creating lead:', leadError)
        } else {
          leadId = newLead.id
        }
      }
    }

    console.log('✅ Caller record created/updated', { contactId, organizationId, leadId })

    return {
      contactId,
      organizationId,
      leadId
    }
  } catch (error) {
    console.error('Error in createOrUpdateCallerRecord:', error)
    return null
  }
}

// ============================================
// VOICE SESSION MANAGEMENT
// ============================================

/**
 * Start a new voice session
 * Returns: session database ID
 */
export async function startVoiceSession(data: VoiceSessionData) {
  try {
    console.log('🎙️ Starting voice session...', data.sessionId)
    const supabase = getClient()

    const sessionData = {
      session_id: data.sessionId,
      channel: data.channel,
      phone_number: data.phoneNumber || null,
      status: 'active',
      language_detected: data.language || null,
      caller_name: data.callerData?.name || null,
      caller_company: data.callerData?.company || null,
      caller_phone: data.callerData?.phone || null,
      caller_email: data.callerData?.email || null,
      caller_role: data.callerData?.designation || null,
      started_at: new Date().toISOString(),
    }

    const { data: session, error } = await supabase
      .from('voice_sessions')
      .insert(sessionData)
      .select('id')
      .single()

    if (error) {
      console.error('Error starting voice session:', error)
      return null
    }

    console.log('✅ Voice session started:', session.id)
    return session.id
  } catch (error) {
    console.error('Error in startVoiceSession:', error)
    return null
  }
}

/**
 * Update voice session with contact/org/lead IDs after identification
 */
export async function updateVoiceSessionIds(
  sessionId: string,
  contactId?: string,
  organizationId?: string,
  leadId?: string,
  requirementId?: string
) {
  try {
    const supabase = getClient()
    const updates: any = {}
    if (contactId) updates.contact_id = contactId
    if (organizationId) updates.organization_id = organizationId
    if (leadId) updates.lead_id = leadId
    if (requirementId) updates.requirement_id = requirementId

    const { error } = await supabase
      .from('voice_sessions')
      .update(updates)
      .eq('session_id', sessionId)

    if (error) {
      console.error('Error updating voice session IDs:', error)
    } else {
      console.log('✅ Voice session updated with IDs')
    }
  } catch (error) {
    console.error('Error in updateVoiceSessionIds:', error)
  }
}

/**
 * Save individual voice turn (message)
 */
export async function saveVoiceTurn(data: VoiceTurnData) {
  try {
    const supabase = getClient()
    
    // First, get the voice_session id from session_id
    const { data: session } = await supabase
      .from('voice_sessions')
      .select('id')
      .eq('session_id', data.sessionId)
      .single()

    if (!session) {
      console.error('Voice session not found for session_id:', data.sessionId)
      return null
    }

    // Get current turn count for this session
    const { count } = await supabase
      .from('voice_turns')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', session.id)

    const turnNumber = (count || 0) + 1

    const turnData = {
      session_id: session.id,
      turn_number: turnNumber,
      speaker: data.speaker,
      content: data.content,
      language: data.language || null,
      confidence: data.confidence || null,
    }

    const { data: turn, error } = await supabase
      .from('voice_turns')
      .insert(turnData)
      .select('id')
      .single()

    if (error) {
      console.error('Error saving voice turn:', error)
      return null
    }

    return turn.id
  } catch (error) {
    console.error('Error in saveVoiceTurn:', error)
    return null
  }
}

/**
 * End voice session with summary
 */
export async function endVoiceSession(
  sessionId: string,
  summary?: string,
  transcript?: string,
  actionItems?: any[],
  sentiment?: string
) {
  try {
    console.log('🏁 Ending voice session...', sessionId)
    const supabase = getClient()

    // Calculate duration
    const { data: session } = await supabase
      .from('voice_sessions')
      .select('started_at')
      .eq('session_id', sessionId)
      .single()

    let durationSeconds = 0
    if (session?.started_at) {
      const started = new Date(session.started_at)
      const ended = new Date()
      durationSeconds = Math.floor((ended.getTime() - started.getTime()) / 1000)
    }

    const { error } = await supabase
      .from('voice_sessions')
      .update({
        status: 'completed',
        ended_at: new Date().toISOString(),
        duration_seconds: durationSeconds,
        summary: summary || null,
        transcript: transcript || null,
        action_items: actionItems || null,
        sentiment: sentiment || null,
        updated_at: new Date().toISOString(),
      })
      .eq('session_id', sessionId)

    if (error) {
      console.error('Error ending voice session:', error)
    } else {
      console.log('✅ Voice session ended successfully')
    }
  } catch (error) {
    console.error('Error in endVoiceSession:', error)
  }
}

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

/**
 * Get full conversation transcript from session
 */
export async function getSessionTranscript(sessionId: string) {
  try {
    const supabase = getClient()
    
    const { data: session } = await supabase
      .from('voice_sessions')
      .select('id')
      .eq('session_id', sessionId)
      .single()

    if (!session) return null

    const { data: turns } = await supabase
      .from('voice_turns')
      .select('speaker, content, timestamp')
      .eq('session_id', session.id)
      .order('turn_number', { ascending: true })

    return turns || []
  } catch (error) {
    console.error('Error getting session transcript:', error)
    return null
  }
}