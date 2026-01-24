// voice-db-helpers.ts - EXACT SCHEMA MATCH VERSION
// Matches actual Supabase schema for voice_sessions and voice_turns
import { createClient } from '@/lib/supabase/client'

// Types
export interface CallerData {
  name?: string
  phone?: string
  email?: string
  company?: string
  designation?: string
}

export interface VoiceSessionParams {
  sessionId: string
  channel?: string
  callerName?: string
  callerCompany?: string
  callerPhone?: string
  callerEmail?: string
  callerRole?: string
  contactId?: string
  organizationId?: string
}

export interface VoiceTurnParams {
  sessionId: string
  speaker: 'user' | 'tripti'
  content: string
  language?: string
  confidence?: number
}

export interface CallerLookupResult {
  isReturning: boolean
  contactId?: string
  organizationId?: string
  contactName?: string
  organizationName?: string
  sessionCount?: number
  lastSessionSummary?: string
  lastPipelineStage?: string
  previousRequirements?: string[]
}

export interface CallerRecordResult {
  contactId: string
  organizationId?: string
  leadId?: string
}

// Track turn numbers per session
const turnCounters: Record<string, number> = {}

// ========== START VOICE SESSION ==========
// Stores caller info directly in voice_sessions (no contacts table needed)
export async function startVoiceSession(params: VoiceSessionParams): Promise<string | null> {
  const supabase = createClient()
  
  try {
    console.log('🎙️ Starting voice session...', params.sessionId)
    
    // Build insert matching exact schema
    const insertData: Record<string, any> = {
      session_id: params.sessionId,
      channel: params.channel || 'web_voice',
      status: 'active',
      started_at: new Date().toISOString()
    }
    
    // Caller info - stored directly in voice_sessions
    if (params.callerName) insertData.caller_name = params.callerName
    if (params.callerCompany) insertData.caller_company = params.callerCompany
    if (params.callerPhone) insertData.caller_phone = params.callerPhone
    if (params.callerEmail) insertData.caller_email = params.callerEmail
    if (params.callerRole) insertData.caller_role = params.callerRole
    
    // Optional FK links
    if (params.contactId) insertData.contact_id = params.contactId
    if (params.organizationId) insertData.organization_id = params.organizationId
    
    const { data, error } = await supabase
      .from('voice_sessions')
      .insert(insertData)
      .select('id')
      .single()
    
    if (error) {
      console.error('❌ Error starting voice session:', error.message)
      return null
    }
    
    // Initialize turn counter for this session
    turnCounters[params.sessionId] = 0
    
    console.log('✅ Voice session started:', data.id)
    return data.id
  } catch (error) {
    console.error('❌ Exception starting voice session:', error)
    return null
  }
}

// ========== SAVE VOICE TURN ==========
// Uses correct schema: session_id (UUID), turn_number, language
export async function saveVoiceTurn(params: VoiceTurnParams): Promise<boolean> {
  const supabase = createClient()
  
  try {
    // Get the voice_sessions UUID from our string session_id
    const { data: sessionData, error: sessionError } = await supabase
      .from('voice_sessions')
      .select('id')
      .eq('session_id', params.sessionId)
      .single()
    
    if (sessionError || !sessionData) {
      console.log('⚠️ Voice session not found for turn save:', params.sessionId)
      return false
    }
    
    // Increment turn counter
    if (!turnCounters[params.sessionId]) {
      turnCounters[params.sessionId] = 0
    }
    turnCounters[params.sessionId]++
    
    // Insert with correct schema
    const { error } = await supabase
      .from('voice_turns')
      .insert({
        session_id: sessionData.id,  // UUID reference to voice_sessions.id
        turn_number: turnCounters[params.sessionId],
        speaker: params.speaker,
        content: params.content,
        language: params.language || 'en-IN',
        confidence: params.confidence || 0.95,
        timestamp: new Date().toISOString()
      })
    
    if (error) {
      console.error('❌ Error saving voice turn:', error.message)
      return false
    }
    
    console.log(`✅ Turn ${turnCounters[params.sessionId]} saved (${params.speaker})`)
    return true
    
  } catch (error) {
    console.error('❌ Exception saving voice turn:', error)
    return false
  }
}

// ========== LOOKUP CALLER ==========
// Looks up by phone in BOTH contacts table AND voice_sessions
export async function lookupCaller(
  phone?: string, 
  email?: string
): Promise<CallerLookupResult | null> {
  if (!phone && !email) return null
  
  const supabase = createClient()
  
  try {
    console.log('🔍 Looking up caller by phone:', phone)
    
    const cleanPhone = phone?.replace(/[^0-9]/g, '') || ''
    
    // First, check contacts table (more authoritative)
    if (cleanPhone) {
      const { data: contacts, error: contactError } = await supabase
        .from('contacts')
        .select('id, name, email, phone, role, organization_id')
        .or(`phone.eq.${cleanPhone},phone.ilike.%${cleanPhone}%`)
        .limit(1)
      
      if (!contactError && contacts && contacts.length > 0) {
        const contact = contacts[0]
        console.log('👤 Found contact:', contact.name)
        
        // Get organization name
        let organizationName = ''
        if (contact.organization_id) {
          const { data: org } = await supabase
            .from('organizations')
            .select('name')
            .eq('id', contact.organization_id)
            .single()
          organizationName = org?.name || ''
        }
        
        // Count previous voice sessions for this contact
        const { data: sessions } = await supabase
          .from('voice_sessions')
          .select('id, summary')
          .eq('contact_id', contact.id)
          .order('created_at', { ascending: false })
          .limit(10)
        
        const sessionCount = sessions?.length || 0
        
        return {
          isReturning: sessionCount > 0,
          contactId: contact.id,
          organizationId: contact.organization_id || undefined,
          contactName: contact.name || undefined,
          organizationName,
          sessionCount,
          lastSessionSummary: sessions?.[0]?.summary
        }
      }
    }
    
    // Fallback: Look in voice_sessions for previous calls with this phone
    let query = supabase
      .from('voice_sessions')
      .select('id, caller_name, caller_company, caller_phone, caller_email, contact_id, organization_id, summary, created_at')
      .order('created_at', { ascending: false })
    
    if (cleanPhone) {
      query = query.or(`caller_phone.eq.${cleanPhone},caller_phone.ilike.%${cleanPhone}%`)
    } else if (email) {
      query = query.ilike('caller_email', email)
    }
    
    const { data: sessions, error } = await query.limit(10)
    
    if (error) {
      console.log('⚠️ Error looking up caller:', error.message)
      return { isReturning: false }
    }
    
    if (!sessions || sessions.length === 0) {
      console.log('🆕 No previous sessions found for this caller')
      return { isReturning: false }
    }
    
    // Found previous sessions!
    const latestSession = sessions[0]
    const sessionCount = sessions.length
    
    console.log('👋 Returning caller found:', latestSession.caller_name, '| Sessions:', sessionCount)
    
    return {
      isReturning: true,
      contactId: latestSession.contact_id || undefined,
      organizationId: latestSession.organization_id || undefined,
      contactName: latestSession.caller_name || undefined,
      organizationName: latestSession.caller_company || undefined,
      sessionCount,
      lastSessionSummary: latestSession.summary || undefined
    }
    
  } catch (error) {
    console.log('⚠️ Exception looking up caller:', error)
    return { isReturning: false }
  }
}

// ========== CREATE OR UPDATE CALLER RECORD ==========
// Creates organization and contact with exact schema match
export async function createOrUpdateCallerRecord(
  data: CallerData
): Promise<CallerRecordResult | null> {
  const supabase = createClient()
  
  try {
    let organizationId: string | undefined
    let contactId: string | undefined
    let leadId: string | undefined
    
    // 1. Create or find organization if company provided
    if (data.company) {
      const { data: existingOrgs } = await supabase
        .from('organizations')
        .select('id')
        .ilike('name', data.company)
        .limit(1)
      
      if (existingOrgs && existingOrgs.length > 0) {
        organizationId = existingOrgs[0].id
        console.log('📁 Found existing organization:', organizationId)
      } else {
        const { data: newOrg, error: orgError } = await supabase
          .from('organizations')
          .insert({ name: data.company })
          .select('id')
          .single()
        
        if (!orgError && newOrg) {
          organizationId = newOrg.id
          console.log('🏢 Created organization:', organizationId)
        } else {
          console.log('⚠️ Could not create organization:', orgError?.message)
        }
      }
    }
    
    // 2. Check for existing contact by phone
    const cleanPhone = data.phone?.replace(/[^0-9]/g, '') || ''
    
    if (cleanPhone) {
      const { data: existingContacts } = await supabase
        .from('contacts')
        .select('id')
        .or(`phone.eq.${cleanPhone},phone.ilike.%${cleanPhone}%`)
        .limit(1)
      
      if (existingContacts && existingContacts.length > 0) {
        contactId = existingContacts[0].id
        console.log('👤 Found existing contact:', contactId)
        
        // Update existing contact with latest info
        const updateData: Record<string, any> = {}
        if (data.name) updateData.name = data.name
        if (data.email) updateData.email = data.email.toLowerCase()
        if (data.designation) updateData.role = data.designation
        if (organizationId) updateData.organization_id = organizationId
        
        if (Object.keys(updateData).length > 0) {
          await supabase
            .from('contacts')
            .update(updateData)
            .eq('id', contactId)
          console.log('✏️ Updated existing contact')
        }
      }
    }
    
    // 3. Create new contact if not found
    if (!contactId && data.name) {
      // Build insert matching exact contacts schema
      const insertData: Record<string, any> = {
        name: data.name,
        phone: cleanPhone || null,
        email: data.email?.toLowerCase() || null,
        role: data.designation || null,  // "role" not "title"
        organization_id: organizationId || null,
        preferred_language: 'en-IN',
        communication_preference: 'voice',
        is_primary: true,
        is_decision_maker: false,  // Can be updated later
        notes: `Created via Tripti voice agent on ${new Date().toLocaleDateString()}`
      }
      
      const { data: newContact, error: contactError } = await supabase
        .from('contacts')
        .insert(insertData)
        .select('id')
        .single()
      
      if (!contactError && newContact) {
        contactId = newContact.id
        console.log('👤 Created contact:', contactId)
      } else {
        console.log('⚠️ Could not create contact:', contactError?.message)
      }
    }
    
    // 4. Create lead if we have contact or organization
    if (contactId || organizationId) {
      try {
        const leadData: Record<string, any> = {
          source: 'voice_agent',
          status: 'new',
          title: `Voice inquiry from ${data.name || 'Unknown'}`
        }
        if (contactId) leadData.contact_id = contactId
        if (organizationId) leadData.organization_id = organizationId
        
        const { data: newLead, error: leadError } = await supabase
          .from('leads')
          .insert(leadData)
          .select('id')
          .single()
        
        if (!leadError && newLead) {
          leadId = newLead.id
          console.log('📋 Created lead:', leadId)
        }
      } catch (e) {
        console.log('⚠️ Could not create lead')
      }
    }
    
    return { 
      contactId: contactId || '', 
      organizationId, 
      leadId 
    }
    
  } catch (error) {
    console.error('❌ Exception creating caller record:', error)
    return null
  }
}

// ========== UPDATE VOICE SESSION IDS ==========
export async function updateVoiceSessionIds(
  sessionId: string,
  contactId?: string,
  organizationId?: string,
  leadId?: string,
  requirementId?: string
): Promise<boolean> {
  const supabase = createClient()
  
  try {
    const updateData: Record<string, any> = {}
    if (contactId) updateData.contact_id = contactId
    if (organizationId) updateData.organization_id = organizationId
    if (leadId) updateData.lead_id = leadId
    if (requirementId) updateData.requirement_id = requirementId
    
    if (Object.keys(updateData).length === 0) return true
    
    const { error } = await supabase
      .from('voice_sessions')
      .update(updateData)
      .eq('session_id', sessionId)
    
    if (error) {
      console.log('⚠️ Error updating voice session IDs:', error.message)
      return false
    }
    
    console.log('✅ Voice session IDs updated')
    return true
  } catch (error) {
    console.log('⚠️ Exception updating voice session IDs:', error)
    return false
  }
}

// ========== END VOICE SESSION ==========
export async function endVoiceSession(
  sessionId: string,
  summary?: string,
  transcript?: string,
  topics?: string[],
  sentiment?: string,
  intent?: string,
  objectiveCaptured?: string
): Promise<boolean> {
  const supabase = createClient()
  
  try {
    console.log('🏁 Ending voice session...', sessionId)
    
    // Get started_at to calculate duration
    const { data: sessionData } = await supabase
      .from('voice_sessions')
      .select('started_at')
      .eq('session_id', sessionId)
      .single()
    
    let durationSeconds: number | undefined
    if (sessionData?.started_at) {
      const startTime = new Date(sessionData.started_at).getTime()
      durationSeconds = Math.floor((Date.now() - startTime) / 1000)
    }
    
    const updateData: Record<string, any> = {
      status: 'completed',
      ended_at: new Date().toISOString()
    }
    
    if (durationSeconds) updateData.duration_seconds = durationSeconds
    if (summary) updateData.summary = summary
    if (transcript) updateData.transcript = transcript
    if (sentiment) updateData.sentiment = sentiment
    if (intent) updateData.intent = intent
    if (objectiveCaptured) updateData.objective_captured = objectiveCaptured
    if (topics && topics.length > 0) updateData.topics = topics
    
    const { error } = await supabase
      .from('voice_sessions')
      .update(updateData)
      .eq('session_id', sessionId)
    
    if (error) {
      console.error('❌ Error ending voice session:', error.message)
      return false
    }
    
    // Clean up turn counter
    delete turnCounters[sessionId]
    
    console.log('✅ Voice session ended successfully', durationSeconds ? `(${durationSeconds}s)` : '')
    return true
  } catch (error) {
    console.error('❌ Exception ending voice session:', error)
    return false
  }
}

// ========== GET CALLER HISTORY ==========
export async function getCallerHistory(phone: string): Promise<{
  sessions: any[]
  totalCalls: number
  lastCallDate?: string
} | null> {
  const supabase = createClient()
  
  try {
    const cleanPhone = phone.replace(/[^0-9]/g, '')
    
    const { data: sessions, error } = await supabase
      .from('voice_sessions')
      .select('*')
      .or(`caller_phone.eq.${cleanPhone},caller_phone.ilike.%${cleanPhone}%`)
      .order('created_at', { ascending: false })
      .limit(20)
    
    if (error) {
      console.log('⚠️ Error getting caller history:', error.message)
      return null
    }
    
    return {
      sessions: sessions || [],
      totalCalls: sessions?.length || 0,
      lastCallDate: sessions?.[0]?.created_at
    }
  } catch (error) {
    console.log('⚠️ Exception getting caller history:', error)
    return null
  }
}