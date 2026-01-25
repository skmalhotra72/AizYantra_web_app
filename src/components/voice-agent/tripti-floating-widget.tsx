'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { 
  X, 
  MessageCircle, 
  Mic, 
  MicOff, 
  PhoneOff,
  Volume2,
  Loader2,
  Phone,
  User,
  Building2,
  Mail,
  Briefcase,
  MessageSquareText,
  ArrowRight,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Shield
} from 'lucide-react'

// Import database helpers
import {
  startVoiceSession,
  saveVoiceTurn,
  endVoiceSession,
  lookupCaller,
  createOrUpdateCallerRecord,
  updateVoiceSessionIds,
  type CallerData
} from '@/lib/supabase/voice-db-helpers'

interface Message {
  id: string
  role: 'agent' | 'user'
  content: string
  timestamp: Date
}

// Sales Pipeline Stages
type PipelineStage = 
  | 'unaware'
  | 'exploring'
  | 'need_identified'
  | 'nurturing'
  | 'ready'

// Verification Levels for Secure Data Access
type VerificationLevel = 0 | 1 | 2 | 3 | 4

// Pre-call form data
interface PreCallFormData {
  name: string
  phone: string
  company: string
  designation: string
  email: string
  purpose: string
}

// Caller context from database
interface CallerContext {
  isReturning: boolean
  contactId?: string
  organizationId?: string
  contactName?: string
  organizationName?: string
  sessionCount?: number
  lastSessionSummary?: string
  lastPipelineStage?: PipelineStage
  previousRequirements?: string[]
}

interface TriptiFloatingWidgetProps {
  position?: 'bottom-right' | 'bottom-left'
}

// ========== FORM STEPS ==========
type FormStep = 'phone' | 'details' | 'ready'

// ========== DATA QUERY INTENT DETECTION ==========
interface DataQueryIntent {
  type: 'project_list' | 'project_status' | 'invoice_list' | 'payment_history' | 'proposal_list' | null
  params?: Record<string, string>
}

// ========== GENERATE TRIPTI SYSTEM PROMPT WITH CONTEXT ==========
const generateSystemPrompt = (
  formData: PreCallFormData, 
  callerContext: CallerContext,
  verificationLevel: VerificationLevel
): string => {
  const isReturning = callerContext.isReturning
  const name = formData.name || callerContext.contactName || 'there'
  const company = formData.company || callerContext.organizationName || ''
  const purpose = formData.purpose || ''
  
  let contextSection = ''
  
  if (isReturning) {
    contextSection = `
## IMPORTANT: RETURNING CALLER
This is ${name} from ${company}. They have called ${callerContext.sessionCount || 1} time(s) before.
${callerContext.lastSessionSummary ? `Last conversation summary: ${callerContext.lastSessionSummary}` : ''}
${callerContext.lastPipelineStage ? `Last pipeline stage: ${callerContext.lastPipelineStage}` : ''}

**YOUR GREETING FOR THIS RETURNING CALLER:**
"Hello ${name}! Great to hear from you again. ${purpose ? `I see you're calling about ${purpose}. ` : ''}How can I help you today?"

DO NOT ask for their name, phone, or company - you already have it!
`
  } else {
    contextSection = `
## NEW CALLER INFORMATION
- Name: ${name}
- Company: ${company}
- Designation: ${formData.designation || 'Not provided'}
- Email: ${formData.email || 'Not provided'}
- Phone: ${formData.phone}
${purpose ? `- Reason for calling: ${purpose}` : ''}

**YOUR GREETING FOR THIS NEW CALLER:**
"Hello ${name}! Welcome to AIzYantra. ${purpose ? `I understand you're interested in ${purpose}. ` : ''}I'm Tripti, and I'm here to help you explore how AI can transform ${company || 'your business'}. How can I assist you today?"

You already have their basic details - focus on understanding their needs!
`
  }

  // Data access section - simplified, no query markers
  const dataAccessSection = `
## DATA ACCESS CAPABILITIES

You have access to this caller's account information. When they ask about projects, invoices, proposals, or payments, the data will be provided to you automatically via system messages.

**CURRENT VERIFICATION LEVEL: ${verificationLevel}**
${verificationLevel >= 3 ? '✅ FULL ACCESS: Projects, invoices, payments, proposals' :
  verificationLevel >= 2 ? '✅ STANDARD ACCESS: Project details and milestones' :
  verificationLevel >= 1 ? '✅ BASIC ACCESS: Project status' :
  '❌ NO DATA ACCESS: Verification needed'}

**HOW IT WORKS:**
- When the caller asks about their projects, invoices, etc., the data will appear in a system message
- Read the data naturally and conversationally
- DO NOT say things like "let me check" or "looking up" - just speak the information naturally
- If you receive data, incorporate it smoothly into your response

**WHAT YOU CAN SHARE:**
✅ Project name, status, phase, completion percentage
✅ Milestone names and due dates
✅ Proposal title, value, status (if verification level 3+)
✅ Invoice amounts, due dates, payment status (if verification level 3+)

**WHAT YOU CANNOT SHARE (NEVER):**
❌ Internal costs or profit margins
❌ Other clients' information  
❌ Technical backend details (databases, APIs, tools)
❌ Full document contents (offer to email instead)

**IF DATA IS NOT AVAILABLE:**
Say: "I don't have that information in front of me right now. Would you like me to have our team follow up with you?"
`

  return `You are Tripti, a warm and intelligent AI sales representative for AIzYantra (pronounced "AI's Yantra"). You're having a real-time voice conversation.

${contextSection}

${dataAccessSection}

## YOUR PERSONALITY
- Speak like a friendly, knowledgeable colleague - warm but professional
- Be genuinely curious about the caller's business and challenges
- Indian cultural context - comfortable with Hindi/Hinglish if caller prefers
- Calm, confident, trustworthy voice that builds rapport
- NEVER robotic or scripted-sounding

## CRITICAL CONVERSATION RULES
1. **LISTEN FULLY**: When you ask a question, WAIT for the caller to completely finish answering. Don't interrupt.
2. **MINIMAL POLITENESS**: Say "thank you" ONCE at most. No repeated thanks or apologies.
3. **NATURAL FLOW**: Respond like a human - brief acknowledgments, then move forward.
4. **ONE QUESTION AT A TIME**: Never ask multiple questions in one response.
5. **SHORT RESPONSES**: Keep responses to 2-3 sentences maximum. Be concise.
6. **USE THEIR NAME**: Address them by name occasionally to build rapport.
7. **NO TECHNICAL JARGON**: Never mention queries, databases, or technical terms.

## SALES JOURNEY - GUIDE THEM THROUGH STAGES:

### Stage 1: UNAWARE (They don't know AI can help)
- Ask about daily challenges and pain points
- Listen for problems AI can solve

### Stage 2: EXPLORING (They're curious)
- Share brief success stories

### Stage 3: NEED IDENTIFIED (They see the value)
- Get specific about THEIR situation

### Stage 4: NURTURING (Building trust)
- Address concerns gently

### Stage 5: READY (Want to move forward)
- Offer clear next step
- "Would you like to schedule a demo with our solutions team?"

## AIZYANTRA SERVICES:
- AI Voice Agents (like me!)
- Conversational AI & Chatbots
- Workflow Automation
- Custom AI Solutions for Healthcare
- AI Strategy Consulting

## LANGUAGE:
- If they speak Hindi/Hinglish, respond naturally in the same style

## REMEMBER:
- You're having a CONVERSATION, not reading a script
- Match the caller's energy and pace
- End with a clear next step when appropriate
- When data is provided to you, speak it naturally without mentioning "checking" or "looking up"`
}

export function TriptiFloatingWidget({ position = 'bottom-right' }: TriptiFloatingWidgetProps) {
  // ========== UI STATES ==========
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [showPulse, setShowPulse] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  
  // ========== NEW: FORM STEP STATE ==========
  const [formStep, setFormStep] = useState<FormStep>('phone')
  const [phoneLookupLoading, setPhoneLookupLoading] = useState(false)
  
  // ========== FORM DATA ==========
  const [formData, setFormData] = useState<PreCallFormData>({
    name: '',
    phone: '',
    company: '',
    designation: '',
    email: '',
    purpose: ''
  })
  
  // Keep a ref for formData to use in callbacks
  const formDataRef = useRef<PreCallFormData>(formData)
  useEffect(() => {
    formDataRef.current = formData
  }, [formData])
  
  // ========== CALLER CONTEXT ==========
  const [callerContext, setCallerContext] = useState<CallerContext>({
    isReturning: false
  })
  
  // ========== VERIFICATION LEVEL STATE ==========
  const [verificationLevel, setVerificationLevel] = useState<VerificationLevel>(0)
  const verificationLevelRef = useRef<VerificationLevel>(0)
  
  // ========== CONVERSATION STATES ==========
  const [isConnected, setIsConnected] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [agentState, setAgentState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle')
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')
  
  // ========== SALES PIPELINE STATE ==========
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>('unaware')

  // ========== AUDIO REFS ==========
  const wsRef = useRef<WebSocket | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioStreamRef = useRef<MediaStream | null>(null)
  const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null)
  const audioQueueRef = useRef<Int16Array[]>([])
  const isPlayingRef = useRef(false)
  const nextPlayTimeRef = useRef(0)
  
  // ========== SESSION TRACKING ==========
  const sessionIdRef = useRef<string>('')
  const dbSessionIdRef = useRef<string | null>(null)
  const callerContextRef = useRef<CallerContext>({ isReturning: false })
  const pipelineStageRef = useRef<PipelineStage>('unaware')
  
  // ========== WHISPER AUDIO CAPTURE ==========
  const userAudioChunksRef = useRef<Int16Array[]>([])
  const isCapturingAudioRef = useRef(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Position classes
  const positionClasses = position === 'bottom-right' 
    ? 'right-4 sm:right-6' 
    : 'left-4 sm:left-6'

  // ========== SCROLL TO BOTTOM ==========
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ========== HIDE PULSE AFTER DELAY ==========
  useEffect(() => {
    const timer = setTimeout(() => setShowPulse(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  // ========== LOAD LAST CALLER FROM LOCALSTORAGE ==========
  useEffect(() => {
    const savedPhone = localStorage.getItem('tripti_last_phone')
    if (savedPhone) {
      setFormData(prev => ({ ...prev, phone: savedPhone }))
    }
  }, [])

  // ========== VALIDATE PHONE NUMBER ==========
  const validatePhone = (phone: string): boolean => {
    const cleanPhone = phone.replace(/[^0-9]/g, '')
    return cleanPhone.length === 10 && /^[6-9]/.test(cleanPhone)
  }

  // ========== DETECT DATA QUERY INTENT ==========
  const detectDataQueryIntent = (text: string): DataQueryIntent => {
    const lowerText = text.toLowerCase()
    
    // Project queries
    if (lowerText.includes('project') && (
      lowerText.includes('status') || 
      lowerText.includes('how is') || 
      lowerText.includes('update') ||
      lowerText.includes('progress')
    )) {
      return { type: 'project_status' }
    }
    
    if (lowerText.includes('project') || lowerText.includes('projects')) {
      return { type: 'project_list' }
    }
    
    // Invoice queries
    if (lowerText.includes('invoice') || lowerText.includes('invoices') || lowerText.includes('bill')) {
      return { type: 'invoice_list' }
    }
    
    // Payment queries
    if (lowerText.includes('payment') || lowerText.includes('paid') || lowerText.includes('pay')) {
      return { type: 'payment_history' }
    }
    
    // Proposal queries
    if (lowerText.includes('proposal') || lowerText.includes('quote') || lowerText.includes('quotation')) {
      return { type: 'proposal_list' }
    }
    
    return { type: null }
  }

  // ========== FETCH DATA AND INJECT TO TRIPTI ==========
  const fetchAndInjectData = async (queryType: string, params: Record<string, string> = {}) => {
    const contactId = callerContextRef.current.contactId
    
    if (!contactId) {
      console.log('⚠️ No contact ID available for data query')
      return
    }

    try {
      console.log('🔐 Fetching data for Tripti:', queryType)
      
      const response = await fetch('/api/voice/secure-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionIdRef.current,
          contact_id: contactId,
          query_type: queryType,
          query_params: params,
          verification_level: verificationLevelRef.current
        })
      })

      const result = await response.json()
      
      if (result.success && result.message) {
        console.log('✅ Data fetched, injecting to Tripti:', result.message)
        
        // Inject the data as a system message BEFORE Tripti responds
        injectDataToTripti(queryType, result.message)
      } else if (result.verification_prompt) {
        console.log('🔒 Verification needed:', result.verification_prompt)
        // Inject verification request
        injectDataToTripti('verification_needed', result.verification_prompt)
      } else {
        console.log('⚠️ No data found')
        injectDataToTripti(queryType, "I don't have any records for that in your account.")
      }
    } catch (error) {
      console.error('❌ Error fetching data:', error)
    }
  }

  // ========== INJECT DATA TO TRIPTI VIA SYSTEM MESSAGE ==========
  const injectDataToTripti = (queryType: string, data: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const systemMessage = `[ACCOUNT DATA FOR CALLER]
The caller asked about their ${queryType.replace('_', ' ')}. Here is the information from their account:

${data}

Respond naturally with this information. Do NOT say "let me check" or "looking up" - just tell them the information conversationally.`

      console.log('💉 Injecting data to Tripti:', systemMessage)
      
      wsRef.current.send(JSON.stringify({
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'system',
          content: [{ type: 'input_text', text: systemMessage }]
        }
      }))
      
      // Trigger response
      wsRef.current.send(JSON.stringify({ type: 'response.create' }))
    }
  }

  // ========== UPDATE VERIFICATION LEVEL ==========
  const updateVerificationLevel = (newLevel: VerificationLevel) => {
    if (newLevel > verificationLevelRef.current) {
      console.log(`🔐 Verification level increased: ${verificationLevelRef.current} → ${newLevel}`)
      verificationLevelRef.current = newLevel
      setVerificationLevel(newLevel)
    }
  }

  // ========== NEW: PHONE LOOKUP HANDLER ==========
  const handlePhoneLookup = async () => {
    if (!validatePhone(formData.phone)) {
      setFormError('Please enter a valid 10-digit Indian mobile number')
      return
    }
    
    setPhoneLookupLoading(true)
    setFormError('')
    
    try {
      const cleanPhone = formData.phone.replace(/[^0-9]/g, '')
      console.log('🔍 Looking up caller by phone:', cleanPhone)
      
      // Save phone for next time
      localStorage.setItem('tripti_last_phone', cleanPhone)
      
      const existingCaller = await lookupCaller(cleanPhone)
      
      if (existingCaller?.isReturning) {
        // RETURNING CALLER - Skip form!
        console.log('👋 Returning caller found:', existingCaller.contactName)
        
        const context: CallerContext = {
          isReturning: true,
          contactId: existingCaller.contactId,
          organizationId: existingCaller.organizationId,
          contactName: existingCaller.contactName,
          organizationName: existingCaller.organizationName,
          sessionCount: existingCaller.sessionCount,
          lastSessionSummary: existingCaller.lastSessionSummary,
          lastPipelineStage: existingCaller.lastPipelineStage as PipelineStage,
          previousRequirements: existingCaller.previousRequirements
        }
        setCallerContext(context)
        callerContextRef.current = context
        
        // Pre-fill form with existing data
        setFormData(prev => ({
          ...prev,
          phone: cleanPhone,
          name: existingCaller.contactName || '',
          company: existingCaller.organizationName || '',
          email: existingCaller.email || ''
        }))
        
        // Set pipeline stage from last session
        if (existingCaller.lastPipelineStage) {
          setPipelineStage(existingCaller.lastPipelineStage as PipelineStage)
          pipelineStageRef.current = existingCaller.lastPipelineStage as PipelineStage
        }
        
        // RETURNING CALLER gets Level 2 verification automatically
        updateVerificationLevel(2)
        
        // Go directly to ready step (skip details form)
        setFormStep('ready')
        setPhoneLookupLoading(false)
        
      } else {
        // NEW CALLER - Show full form
        console.log('🆕 New caller - showing full form')
        setFormData(prev => ({ ...prev, phone: cleanPhone }))
        
        // Phone verified = Level 1
        updateVerificationLevel(1)
        
        setFormStep('details')
        setPhoneLookupLoading(false)
      }
      
    } catch (error) {
      console.error('❌ Error looking up caller:', error)
      // On error, show full form anyway
      setFormStep('details')
      setPhoneLookupLoading(false)
    }
  }

  // ========== HANDLE DETAILS FORM SUBMIT ==========
  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    
    // Validate required fields
    if (!formData.name.trim()) {
      setFormError('Please enter your name')
      return
    }
    if (!formData.company.trim()) {
      setFormError('Please enter your company name')
      return
    }
    
    setFormSubmitting(true)
    
    try {
      const cleanPhone = formData.phone.replace(/[^0-9]/g, '')
      
      // Create new caller record
      const callerData: CallerData = {
        name: formData.name,
        phone: cleanPhone,
        company: formData.company,
        designation: formData.designation || undefined,
        email: formData.email || undefined
      }
      
      const result = await createOrUpdateCallerRecord(callerData)
      
      if (result) {
        const context: CallerContext = {
          isReturning: false,
          contactId: result.contactId,
          organizationId: result.organizationId,
          contactName: formData.name,
          organizationName: formData.company
        }
        setCallerContext(context)
        callerContextRef.current = context
        
        // Identity confirmed = Level 2
        updateVerificationLevel(2)
      }
      
      // Go to ready step
      setFormStep('ready')
      setFormSubmitting(false)
      
    } catch (error) {
      console.error('❌ Error creating caller record:', error)
      setFormError('Something went wrong. Please try again.')
      setFormSubmitting(false)
    }
  }

  // ========== START CALL (from ready step) ==========
  const handleStartCall = async () => {
    setShowForm(false)
    await startConversation()
  }

  // ========== GENERATE SESSION ID ==========
  const generateSessionId = () => `session_${Date.now()}_${Math.random().toString(36).substring(7)}`

  // ========== BASE64 ENCODE/DECODE ==========
  const base64EncodeAudio = (data: Int16Array): string => {
    const bytes = new Uint8Array(data.buffer)
    let binary = ''
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  const base64DecodeAudio = (base64: string): Int16Array => {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return new Int16Array(bytes.buffer)
  }

  const createWavBlob = (pcm16Data: Int16Array): Blob => {
    const sampleRate = 24000
    const numChannels = 1
    const bytesPerSample = 2
    
    const wavHeader = new ArrayBuffer(44)
    const view = new DataView(wavHeader)
    
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }
    
    writeString(0, 'RIFF')
    view.setUint32(4, 36 + pcm16Data.length * 2, true)
    writeString(8, 'WAVE')
    writeString(12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, numChannels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * numChannels * bytesPerSample, true)
    view.setUint16(32, numChannels * bytesPerSample, true)
    view.setUint16(34, 16, true)
    writeString(36, 'data')
    view.setUint32(40, pcm16Data.length * 2, true)
    
    const wavData = new Uint8Array(44 + pcm16Data.length * 2)
    wavData.set(new Uint8Array(wavHeader), 0)
    wavData.set(new Uint8Array(pcm16Data.buffer), 44)
    
    return new Blob([wavData], { type: 'audio/wav' })
  }

  // ========== TRANSCRIBE USER AUDIO ==========
  const transcribeUserAudio = async () => {
    if (userAudioChunksRef.current.length === 0) return

    try {
      let totalLength = 0
      userAudioChunksRef.current.forEach(chunk => totalLength += chunk.length)
      
      const combinedAudio = new Int16Array(totalLength)
      let offset = 0
      userAudioChunksRef.current.forEach(chunk => {
        combinedAudio.set(chunk, offset)
        offset += chunk.length
      })
      
      const audioBlob = createWavBlob(combinedAudio)
      
      const formDataObj = new FormData()
      formDataObj.append('file', audioBlob, 'audio.wav')
      formDataObj.append('language', 'en')
      
      const response = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formDataObj
      })
      
      if (!response.ok) throw new Error('Transcription failed')
      
      const result = await response.json()
      const userText = result.text
      
      if (userText && userText.trim()) {
        console.log('📝 User transcript:', userText)
        
        const userMessage = {
          id: Date.now().toString(),
          role: 'user' as const,
          content: userText,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, userMessage])
        
        // Save user turn with language
        if (sessionIdRef.current) {
          saveVoiceTurn({
            sessionId: sessionIdRef.current,
            speaker: 'user',
            content: userText,
            language: 'en-IN'
          }).catch(err => console.error('Error saving user turn:', err))
        }
        
        // Detect pipeline stage changes
        detectPipelineStage(userText)
        
        // Detect verification confirmations
        detectVerificationConfirmation(userText)
        
        // ========== NEW: DETECT DATA QUERY AND FETCH DATA ==========
        const queryIntent = detectDataQueryIntent(userText)
        if (queryIntent.type) {
          console.log('🔍 Data query detected:', queryIntent.type)
          // Fetch data and inject to Tripti BEFORE she responds
          await fetchAndInjectData(queryIntent.type, queryIntent.params || {})
        }
      }
      
      userAudioChunksRef.current = []
      
    } catch (error) {
      console.error('❌ Error transcribing audio:', error)
      userAudioChunksRef.current = []
    }
  }

  // ========== DETECT VERIFICATION CONFIRMATION ==========
  const detectVerificationConfirmation = (text: string) => {
    const lowerText = text.toLowerCase()
    const currentFormData = formDataRef.current
    
    // Check if user confirmed their identity
    const nameConfirmations = ['yes', 'that\'s me', 'correct', 'that\'s correct', 'yes i am', 'speaking']
    const confirmedIdentity = nameConfirmations.some(phrase => lowerText.includes(phrase))
    
    // Check if user mentioned their name or company (for Level 2 upgrade)
    const mentionedName = currentFormData.name && lowerText.includes(currentFormData.name.toLowerCase())
    const mentionedCompany = currentFormData.company && lowerText.includes(currentFormData.company.toLowerCase())
    
    if (confirmedIdentity || mentionedName || mentionedCompany) {
      if (verificationLevelRef.current < 2) {
        updateVerificationLevel(2)
      }
    }
    
    // Check for security verification (invoice amount, project name)
    const financialKeywords = ['lakhs', 'lakh', 'thousand', 'crore', 'rupees']
    const projectKeywords = ['patient intake', 'ai patient', 'intake system']
    const mentionedFinancial = financialKeywords.some(keyword => lowerText.includes(keyword))
    const mentionedProject = projectKeywords.some(keyword => lowerText.includes(keyword))
    
    if ((mentionedFinancial || mentionedProject) && verificationLevelRef.current === 2) {
      updateVerificationLevel(3)
    }
  }

  // ========== DETECT PIPELINE STAGE ==========
  const detectPipelineStage = (text: string) => {
    const lowerText = text.toLowerCase()
    const currentStage = pipelineStageRef.current
    
    const stageOrder: PipelineStage[] = ['unaware', 'exploring', 'need_identified', 'nurturing', 'ready']
    const currentIndex = stageOrder.indexOf(currentStage)
    
    let detectedStage: PipelineStage | null = null
    
    if (lowerText.includes('get started') || 
        lowerText.includes('schedule') || 
        lowerText.includes('book') ||
        lowerText.includes('demo') ||
        lowerText.includes('pricing') ||
        lowerText.includes('cost') ||
        lowerText.includes('how much')) {
      detectedStage = 'ready'
    }
    else if (lowerText.includes('but what about') ||
        lowerText.includes('concerned') ||
        lowerText.includes('how long') ||
        lowerText.includes('our team')) {
      detectedStage = 'nurturing'
    }
    else if (lowerText.includes('need') ||
        lowerText.includes('would help') ||
        lowerText.includes('sounds good') ||
        lowerText.includes('interesting')) {
      detectedStage = 'need_identified'
    }
    else if (lowerText.includes('how does') ||
        lowerText.includes('tell me more') ||
        lowerText.includes('curious')) {
      detectedStage = 'exploring'
    }
    
    if (detectedStage) {
      const detectedIndex = stageOrder.indexOf(detectedStage)
      if (detectedIndex > currentIndex) {
        console.log(`📊 Pipeline stage: ${currentStage} → ${detectedStage}`)
        pipelineStageRef.current = detectedStage
        setPipelineStage(detectedStage)
        sendContextToTripti(`[STAGE UPDATE] Caller has progressed to ${detectedStage.toUpperCase()} stage.`)
      }
    }
  }

  // ========== SEND CONTEXT TO TRIPTI ==========
  const sendContextToTripti = (contextMessage: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'system',
          content: [{ type: 'input_text', text: contextMessage }]
        }
      }))
    }
  }

  // ========== QUEUE AUDIO CHUNK ==========
  const queueAudioChunk = (base64Audio: string) => {
    const audioData = base64DecodeAudio(base64Audio)
    audioQueueRef.current.push(audioData)
    if (!isPlayingRef.current) playNextChunk()
  }

  // ========== PLAY NEXT CHUNK ==========
  const playNextChunk = () => {
    if (!audioContextRef.current || audioQueueRef.current.length === 0) {
      isPlayingRef.current = false
      if (agentState === 'speaking') setAgentState('listening')
      return
    }

    isPlayingRef.current = true
    const chunks = audioQueueRef.current.splice(0, Math.min(5, audioQueueRef.current.length))

    let totalLength = 0
    chunks.forEach(chunk => totalLength += chunk.length)

    const combinedAudio = new Int16Array(totalLength)
    let offset = 0
    chunks.forEach(chunk => {
      combinedAudio.set(chunk, offset)
      offset += chunk.length
    })

    try {
      const audioBuffer = audioContextRef.current.createBuffer(1, combinedAudio.length, 24000)
      const channelData = audioBuffer.getChannelData(0)
      for (let i = 0; i < combinedAudio.length; i++) {
        channelData[i] = combinedAudio[i] / 32768
      }

      const source = audioContextRef.current.createBufferSource()
      source.buffer = audioBuffer
      source.connect(audioContextRef.current.destination)

      const currentTime = audioContextRef.current.currentTime
      const startTime = Math.max(currentTime, nextPlayTimeRef.current)
      source.start(startTime)
      nextPlayTimeRef.current = startTime + audioBuffer.duration

      source.onended = () => setTimeout(playNextChunk, 10)
    } catch (error) {
      console.error('Error playing audio:', error)
      isPlayingRef.current = false
      setTimeout(playNextChunk, 50)
    }
  }

  // ========== HANDLE REALTIME EVENTS ==========
  const handleRealtimeEvent = async (event: any) => {
    switch (event.type) {
      case 'session.created':
        console.log('✅ Session created')
        break
        
      case 'session.updated':
        console.log('✅ Session updated')
        break

      case 'input_audio_buffer.speech_started':
        console.log('🎤 User speaking...')
        setAgentState('listening')
        audioQueueRef.current = []
        isCapturingAudioRef.current = true
        userAudioChunksRef.current = []
        break

      case 'input_audio_buffer.speech_stopped':
        console.log('🤐 User stopped speaking')
        setAgentState('thinking')
        isCapturingAudioRef.current = false
        transcribeUserAudio()
        break

      case 'response.output_audio_transcript.done':
        if (event.transcript) {
          const agentMessage = {
            id: Date.now().toString(),
            role: 'agent' as const,
            content: event.transcript,
            timestamp: new Date()
          }
          setMessages(prev => [...prev, agentMessage])
          
          if (sessionIdRef.current) {
            saveVoiceTurn({
              sessionId: sessionIdRef.current,
              speaker: 'tripti',
              content: event.transcript,
              language: 'en-IN'
            }).catch(err => console.error('Error saving turn:', err))
          }
        }
        break

      case 'response.output_audio.delta':
        if (event.delta) {
          queueAudioChunk(event.delta)
        }
        setAgentState('speaking')
        break

      case 'error':
        console.error('❌ OpenAI error:', event.error)
        break
    }
  }

  // ========== START AUDIO STREAMING ==========
  const startAudioStreaming = async () => {
    if (!audioContextRef.current || !audioStreamRef.current || !wsRef.current) return

    try {
      const source = audioContextRef.current.createMediaStreamSource(audioStreamRef.current)
      await audioContextRef.current.audioWorklet.addModule('/audio-processor.js')
      const workletNode = new AudioWorkletNode(audioContextRef.current, 'audio-processor')
      audioWorkletNodeRef.current = workletNode

      workletNode.port.onmessage = (event) => {
        if (wsRef.current?.readyState === WebSocket.OPEN && !isMuted) {
          const audioData = base64EncodeAudio(event.data)
          if (isCapturingAudioRef.current) {
            userAudioChunksRef.current.push(event.data)
          }
          wsRef.current.send(JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: audioData
          }))
        }
      }

      source.connect(workletNode)
      setAgentState('listening')
      console.log('🎤 Audio streaming started')
    } catch (error) {
      console.error('Error starting audio streaming:', error)
    }
  }

  // ========== CONNECT TO OPENAI ==========
  const connectToOpenAI = async () => {
    setConnectionStatus('connecting')

    try {
      const sessionId = generateSessionId()
      sessionIdRef.current = sessionId

      const currentFormData = formDataRef.current
      
      const dbSessionId = await startVoiceSession({
        sessionId: sessionId,
        channel: 'web_voice',
        callerName: currentFormData.name,
        callerCompany: currentFormData.company,
        callerPhone: currentFormData.phone,
        callerEmail: currentFormData.email || undefined,
        callerRole: currentFormData.designation || undefined,
        contactId: callerContextRef.current.contactId,
        organizationId: callerContextRef.current.organizationId
      })

      if (dbSessionId) dbSessionIdRef.current = dbSessionId

      const response = await fetch('/api/voice/token', { method: 'POST' })
      if (!response.ok) throw new Error('Failed to get session token')

      const data = await response.json()
      const clientSecret = typeof data.client_secret === 'string' 
        ? data.client_secret 
        : data.client_secret?.value

      if (!clientSecret) throw new Error('No client secret')

      const ws = new WebSocket(
        `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17`,
        ['realtime', `openai-insecure-api-key.${clientSecret}`]
      )

      wsRef.current = ws

      ws.onopen = () => {
        console.log('✅ WebSocket connected')
        setConnectionStatus('connected')
        
        startAudioStreaming()

        setTimeout(() => {
          if (ws.readyState === WebSocket.OPEN) {
            const currentFormData = formDataRef.current
            const systemPrompt = generateSystemPrompt(
              currentFormData, 
              callerContextRef.current,
              verificationLevelRef.current
            )
            
            ws.send(JSON.stringify({
              type: 'conversation.item.create',
              item: {
                type: 'message',
                role: 'system',
                content: [{
                  type: 'input_text',
                  text: systemPrompt
                }]
              }
            }))

            setTimeout(() => {
              if (ws.readyState === WebSocket.OPEN) {
                console.log('🎤 Triggering Tripti greeting...')
                ws.send(JSON.stringify({ type: 'response.create' }))
              }
            }, 100)
          }
        }, 200)
      }

      ws.onmessage = (event) => handleRealtimeEvent(JSON.parse(event.data))
      ws.onerror = () => setConnectionStatus('error')
      ws.onclose = () => {
        setConnectionStatus('disconnected')
        setIsConnected(false)
        handleSessionEnd()
      }

    } catch (error) {
      console.error('❌ Error connecting:', error)
      setConnectionStatus('error')
    }
  }

  // ========== TRIGGER POST-CALL AUTOMATION ==========
  const triggerPostCallAutomation = async (sessionId: string) => {
    try {
      console.log('🔄 Triggering post-call automation for session:', sessionId)
      
      const response = await fetch('/api/voice/session-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Post-call automation triggered:', data)
      } else {
        const error = await response.json()
        console.error('❌ Post-call automation failed:', error)
      }
    } catch (error) {
      console.error('❌ Error triggering post-call automation:', error)
    }
  }

  // ========== HANDLE SESSION END ==========
  const handleSessionEnd = async () => {
    if (sessionIdRef.current && dbSessionIdRef.current) {
      const transcript = messages
        .map(m => `${m.role === 'user' ? 'User' : 'Tripti'}: ${m.content}`)
        .join('\n\n')

      const currentFormData = formDataRef.current
      const summary = `Call with ${currentFormData.name || 'visitor'} from ${currentFormData.company || 'unknown company'}. Pipeline stage: ${pipelineStageRef.current}. Verification level: ${verificationLevelRef.current}.`

      const intent = pipelineStageRef.current === 'ready' ? 'schedule_demo' : 
                     pipelineStageRef.current === 'need_identified' ? 'learn_more' : 
                     'initial_inquiry'
      
      const topics = ['ai_automation', 'voice_agents']
      
      await endVoiceSession(
        sessionIdRef.current,
        summary,
        transcript,
        topics,
        'neutral',
        intent,
        currentFormData.purpose || undefined
      )

      await triggerPostCallAutomation(sessionIdRef.current)
    }
  }

  // ========== START CONVERSATION ==========
  const startConversation = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, sampleRate: 24000 }
      })
      audioStreamRef.current = stream
      audioContextRef.current = new AudioContext({ sampleRate: 24000 })
      
      setIsConnected(true)
      await connectToOpenAI()
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Please grant microphone permission')
    }
  }

  // ========== END CONVERSATION ==========
  const endConversation = async () => {
    await handleSessionEnd()

    if (wsRef.current) wsRef.current.close()
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop())
    }
    if (audioContextRef.current) {
      try { await audioContextRef.current.close() } catch (e) {}
    }

    audioQueueRef.current = []
    isPlayingRef.current = false

    setIsConnected(false)
    setAgentState('idle')
    setMessages([])
    setConnectionStatus('disconnected')
    setIsExpanded(false)
    setShowForm(false)
    setFormStep('phone')
    
    setFormData({ name: '', phone: '', company: '', designation: '', email: '', purpose: '' })
    setCallerContext({ isReturning: false })
    callerContextRef.current = { isReturning: false }
    
    // Reset verification level
    setVerificationLevel(0)
    verificationLevelRef.current = 0
    
    sessionIdRef.current = ''
    dbSessionIdRef.current = null
    pipelineStageRef.current = 'unaware'
    setPipelineStage('unaware')
  }

  // ========== TOGGLE MUTE ==========
  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (audioStreamRef.current) {
      audioStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = isMuted
      })
    }
  }

  // ========== HANDLE EXPAND ==========
  const handleExpand = useCallback(() => {
    setIsExpanded(true)
    setShowForm(true)
    setShowPulse(false)
    
    // Check if we have a saved phone
    const savedPhone = localStorage.getItem('tripti_last_phone')
    if (savedPhone) {
      setFormData(prev => ({ ...prev, phone: savedPhone }))
    }
  }, [])

  // ========== RENDER: COLLAPSED STATE ==========
  if (!isExpanded) {
    return (
      <div 
        className={`fixed bottom-4 sm:bottom-6 ${positionClasses} z-50 flex flex-col items-center`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {showPulse && (
          <>
            <div className="absolute w-28 h-28 rounded-full bg-teal-500/20 animate-ping" style={{ animationDuration: '2s' }} />
            <div className="absolute w-24 h-24 rounded-full bg-teal-500/30 animate-ping" style={{ animationDuration: '1.5s', animationDelay: '0.5s' }} />
          </>
        )}

        <div 
          className={`relative cursor-pointer transition-all duration-300 ${isHovered ? 'scale-110' : 'scale-100'}`}
          onClick={handleExpand}
        >
          <div className={`absolute -inset-1 rounded-full bg-gradient-to-r from-teal-400 via-blue-500 to-purple-500 opacity-75 blur-sm animate-pulse`} style={{ animationDuration: '3s' }} />
          
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white shadow-2xl ring-2 ring-teal-400/30">
            <img 
              src="/images/Tripti_Voice_agent.jpg" 
              alt="Tripti - AI Assistant"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ transform: 'scale(1.2)', transformOrigin: 'center 20%', zIndex: 5 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-teal-500/10 to-transparent animate-pulse" style={{ animationDuration: '3s', zIndex: 6 }} />
          </div>

          <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-lg">
            <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75" />
          </div>
        </div>

        <button onClick={handleExpand} className={`mt-3 px-4 py-2 rounded-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white text-sm font-medium shadow-lg shadow-teal-500/30 transition-all duration-300 flex items-center gap-2 ${isHovered ? 'scale-105 shadow-xl shadow-teal-500/40' : ''}`}>
          <MessageCircle className="w-4 h-4" />
          Talk to Tripti
        </button>

        {isHovered && (
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-lg shadow-lg whitespace-nowrap">
            Hi! I'm Tripti. Click to chat! 👋
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45" />
          </div>
        )}
      </div>
    )
  }

  // ========== RENDER: PHONE-FIRST FORM (Step 1) ==========
  if (showForm && !isConnected && formStep === 'phone') {
    return (
      <div className={`fixed bottom-4 sm:bottom-6 ${positionClasses} z-50`}>
        <div className="w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-blue-600 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/30">
                <img src="/images/Tripti_Voice_agent.jpg" alt="Tripti" className="w-full h-full object-cover" style={{ transform: 'scale(1.2)', transformOrigin: 'center 20%' }} />
              </div>
              <div>
                <h3 className="text-white font-semibold">Talk to Tripti</h3>
                <p className="text-white/70 text-xs">AI Sales Assistant</p>
              </div>
            </div>
            <button onClick={() => { setIsExpanded(false); setShowForm(false); setFormStep('phone'); }} className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Phone Input */}
          <div className="p-6 space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-teal-100 rounded-full flex items-center justify-center mb-3">
                <Phone className="w-8 h-8 text-teal-600" />
              </div>
              <h4 className="text-lg font-semibold text-slate-800">Enter your phone number</h4>
              <p className="text-sm text-slate-500 mt-1">We'll check if we've spoken before</p>
            </div>
            
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="tel"
                placeholder="10-digit mobile number"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value.replace(/[^0-9]/g, '').slice(0, 10) }))}
                onKeyDown={(e) => e.key === 'Enter' && handlePhoneLookup()}
                className="w-full pl-11 pr-4 py-3 text-lg border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                autoFocus
              />
            </div>
            
            {formError && (
              <p className="text-red-500 text-sm text-center">{formError}</p>
            )}
            
            <button
              onClick={handlePhoneLookup}
              disabled={phoneLookupLoading || formData.phone.length < 10}
              className="w-full py-3 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {phoneLookupLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ========== RENDER: DETAILS FORM (Step 2 - New Callers Only) ==========
  if (showForm && !isConnected && formStep === 'details') {
    return (
      <div className={`fixed bottom-4 sm:bottom-6 ${positionClasses} z-50`}>
        <div className="w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-blue-600 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setFormStep('phone')} className="p-1 hover:bg-white/10 rounded-lg text-white/70 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h3 className="text-white font-semibold">Nice to meet you!</h3>
                <p className="text-white/70 text-xs">Just a few more details</p>
              </div>
            </div>
            <button onClick={() => { setIsExpanded(false); setShowForm(false); setFormStep('phone'); }} className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleDetailsSubmit} className="p-4 space-y-3">
            {/* Name */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Your Name *"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                autoFocus
              />
            </div>
            
            {/* Company */}
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Company Name *"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            
            {/* Designation (Optional) */}
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Designation (Optional)"
                value={formData.designation}
                onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            
            {/* Email (Optional) */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                placeholder="Email (Optional)"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            
            {/* Purpose */}
            <div className="relative">
              <MessageSquareText className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <textarea
                placeholder="What brings you here today? (Optional)"
                value={formData.purpose}
                onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                rows={2}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
              />
            </div>
            
            {formError && (
              <p className="text-red-500 text-xs">{formError}</p>
            )}
            
            <button
              type="submit"
              disabled={formSubmitting}
              className="w-full py-3 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {formSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ========== RENDER: READY TO CALL (Step 3) ==========
  if (showForm && !isConnected && formStep === 'ready') {
    return (
      <div className={`fixed bottom-4 sm:bottom-6 ${positionClasses} z-50`}>
        <div className="w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-blue-600 px-4 py-4 text-center">
            <div className="w-16 h-16 mx-auto rounded-full overflow-hidden border-3 border-white/30 mb-2">
              <img src="/images/Tripti_Voice_agent.jpg" alt="Tripti" className="w-full h-full object-cover" style={{ transform: 'scale(1.2)', transformOrigin: 'center 20%' }} />
            </div>
            {callerContext.isReturning ? (
              <>
                <h3 className="text-white font-semibold text-lg">Welcome back, {formData.name}! 👋</h3>
                <p className="text-white/80 text-sm mt-1">Great to see you again</p>
              </>
            ) : (
              <>
                <h3 className="text-white font-semibold text-lg">Ready to connect!</h3>
                <p className="text-white/80 text-sm mt-1">Hi {formData.name}!</p>
              </>
            )}
          </div>

          {/* Info Summary */}
          <div className="p-4 space-y-3">
            {callerContext.isReturning && (
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 flex items-start gap-2">
                <Sparkles className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-teal-800 text-sm font-medium">Returning caller recognized!</p>
                  <p className="text-teal-600 text-xs mt-0.5">
                    {callerContext.sessionCount} previous call{callerContext.sessionCount !== 1 ? 's' : ''} • 
                    Last stage: {callerContext.lastPipelineStage?.replace('_', ' ')}
                  </p>
                </div>
              </div>
            )}
            
            {/* Verification Level Indicator */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-start gap-2">
              <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-800 text-sm font-medium">Data Access Level: {verificationLevel}</p>
                <p className="text-slate-500 text-xs mt-0.5">
                  {verificationLevel >= 3 ? '🔓 Full access to projects, invoices & payments' :
                   verificationLevel >= 2 ? '🔓 Access to project details & milestones' :
                   verificationLevel >= 1 ? '🔓 Basic project status access' :
                   '🔒 Verification needed for data access'}
                </p>
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Name</span>
                <span className="text-slate-800 font-medium">{formData.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Company</span>
                <span className="text-slate-800 font-medium">{formData.company}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Phone</span>
                <span className="text-slate-800 font-medium">{formData.phone}</span>
              </div>
            </div>
            
            {/* Optional: Add purpose field for returning callers */}
            {callerContext.isReturning && (
              <div className="relative">
                <MessageSquareText className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <textarea
                  placeholder="What would you like to discuss? (Optional)"
                  value={formData.purpose}
                  onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                  rows={2}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                />
              </div>
            )}
            
            <button
              onClick={handleStartCall}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <Phone className="w-5 h-5" />
              Start Conversation
            </button>
            
            {!callerContext.isReturning && (
              <button
                onClick={() => setFormStep('details')}
                className="w-full py-2 text-slate-500 hover:text-slate-700 text-sm transition-colors"
              >
                Edit my details
              </button>
            )}
            
            <button
              onClick={() => { setIsExpanded(false); setShowForm(false); setFormStep('phone'); }}
              className="w-full py-2 text-slate-400 hover:text-slate-600 text-xs transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ========== RENDER: CONVERSATION VIEW ==========
  return (
    <div className={`fixed bottom-4 sm:bottom-6 ${positionClasses} z-50`}>
      <div className="w-96 h-[600px] bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-blue-600 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/30">
              <img src="/images/Tripti_Voice_agent.jpg" alt="Tripti" className="w-full h-full object-cover" style={{ transform: 'scale(1.2)', transformOrigin: 'center 20%' }} />
            </div>
            <div>
              <h3 className="text-white font-semibold">Tripti - AI Sales SDR</h3>
              <p className="text-white/70 text-xs">
                {connectionStatus === 'connecting' && '⏳ Connecting...'}
                {connectionStatus === 'connected' && agentState === 'listening' && '🎤 Listening...'}
                {connectionStatus === 'connected' && agentState === 'thinking' && '💭 Thinking...'}
                {connectionStatus === 'connected' && agentState === 'speaking' && '🔊 Speaking...'}
                {connectionStatus === 'error' && '❌ Connection Error'}
              </p>
            </div>
          </div>
          <button onClick={() => isConnected ? endConversation() : setIsExpanded(false)} className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Caller Info Banner */}
        {callerContext.isReturning && (
          <div className="bg-teal-500/20 px-4 py-2 flex items-center gap-2 text-teal-300 text-xs">
            <CheckCircle2 className="w-4 h-4" />
            Welcome back, {formData.name}! ({callerContext.sessionCount} previous calls)
          </div>
        )}
        
        {/* Verification Level Banner */}
        <div className={`px-4 py-1.5 flex items-center gap-2 text-xs ${
          verificationLevel >= 3 ? 'bg-green-500/20 text-green-300' :
          verificationLevel >= 2 ? 'bg-blue-500/20 text-blue-300' :
          verificationLevel >= 1 ? 'bg-yellow-500/20 text-yellow-300' :
          'bg-slate-500/20 text-slate-400'
        }`}>
          <Shield className="w-3 h-3" />
          {verificationLevel >= 3 ? '🔓 Full Data Access' :
           verificationLevel >= 2 ? '🔓 Project Details Access' :
           verificationLevel >= 1 ? '🔓 Basic Access' :
           '🔒 Verification Needed'}
        </div>

        {/* Avatar Section */}
        <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden" style={{ height: '180px' }}>
          <img 
            src="/images/Tripti_Voice_agent.jpg" 
            alt="Tripti" 
            className="w-full h-full object-cover" 
            style={{ transform: 'scale(1.1)', transformOrigin: 'center 30%' }} 
          />
          
          {agentState === 'speaking' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="absolute w-28 h-28 rounded-full border-4 border-cyan-400/60 animate-ping" style={{ animationDuration: '1.5s' }} />
              <div className="absolute w-36 h-36 rounded-full border-4 border-cyan-500/40 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.3s' }} />
              <div className="absolute w-44 h-44 rounded-full border-4 border-purple-400/30 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.6s' }} />
            </div>
          )}
          
          {agentState === 'listening' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="absolute w-28 h-28 rounded-full border-4 border-teal-400/50 animate-pulse" style={{ animationDuration: '1s' }} />
            </div>
          )}
          
          {agentState === 'thinking' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Loader2 className="w-12 h-12 text-white animate-spin" />
            </div>
          )}
          
          {agentState === 'speaking' && (
            <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/20 via-transparent to-purple-500/10 pointer-events-none" />
          )}
          
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full text-xs text-white flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Tripti Online
          </div>
          
          <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full text-xs text-white capitalize">
            {pipelineStage.replace('_', ' ')}
          </div>
          
          {agentState === 'speaking' && (
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-cyan-500/70 backdrop-blur-sm rounded-full text-xs text-white flex items-center gap-1">
              <Volume2 className="w-3 h-3 animate-pulse" />
              Speaking...
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center text-slate-500 py-4">
              <p className="text-sm">Conversation with {formData.name}</p>
              <p className="text-xs mt-1">{formData.company}</p>
            </div>
          )}
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${message.role === 'user' ? 'bg-teal-500 text-white rounded-br-md' : 'bg-slate-800 text-slate-200 rounded-bl-md'}`}>
                {message.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Controls */}
        <div className="p-4 bg-slate-800 border-t border-slate-700 flex items-center justify-center gap-4">
          <button
            onClick={toggleMute}
            className={`p-3 rounded-full transition-colors ${isMuted ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <button onClick={endConversation} className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors">
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}