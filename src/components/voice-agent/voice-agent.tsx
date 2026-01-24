'use client'

import { useState, useRef, useEffect, useCallback, RefObject } from 'react'
import { 
  Mic, 
  MicOff, 
  Phone,
  PhoneOff,
  Volume2,
  Loader2,
  MessageSquare,
  X,
  Minimize2
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

interface VoiceAgentProps {
  isWidget?: boolean
  onClose?: () => void
  // ✨ NEW: Props for pre-loaded Simli from floating widget
  preloadedSimliClient?: any
  preloadedVideoRef?: RefObject<HTMLVideoElement>
  preloadedAudioRef?: RefObject<HTMLAudioElement>
}

export function VoiceAgent({ 
  isWidget = false, 
  onClose,
  preloadedSimliClient,
  preloadedVideoRef,
  preloadedAudioRef
}: VoiceAgentProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [agentState, setAgentState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle')
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')
  
  // Avatar state
  const [avatarReady, setAvatarReady] = useState(!!preloadedSimliClient)
  const [avatarError, setAvatarError] = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioStreamRef = useRef<MediaStream | null>(null)
  const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null)

  // Simli avatar refs - use preloaded if available
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const localAudioRef = useRef<HTMLAudioElement>(null)
  const videoRef = preloadedVideoRef || localVideoRef
  const audioRef = preloadedAudioRef || localAudioRef
  
  const simliRef = useRef<any>(preloadedSimliClient || null)
  const simliReadyRef = useRef<boolean>(!!preloadedSimliClient)
  const SimliClientRef = useRef<any>(null)
  const usingPreloadedAvatar = useRef<boolean>(!!preloadedSimliClient)

  // Audio playback queue for smooth playback
  const audioQueueRef = useRef<Int16Array[]>([])
  const isPlayingRef = useRef(false)
  const nextPlayTimeRef = useRef(0)

  // DATABASE TRACKING - Session tracking refs
  const sessionIdRef = useRef<string>('')
  const dbSessionIdRef = useRef<string | null>(null)
  const collectedDataRef = useRef<CallerData>({})
  const dataCollectionCompleteRef = useRef(false)

  // Audio capture for Whisper transcription
  const userAudioChunksRef = useRef<Int16Array[]>([])
  const isCapturingAudioRef = useRef(false)

  // ✨ Initialize with preloaded Simli if available
  useEffect(() => {
    if (preloadedSimliClient) {
      console.log('🎭 [VoiceAgent] Using pre-loaded Simli client from floating widget')
      simliRef.current = preloadedSimliClient
      simliReadyRef.current = true
      usingPreloadedAvatar.current = true
      setAvatarReady(true)
      setAvatarError(false)
    }
  }, [preloadedSimliClient])

  // Pre-load Simli SDK on component mount (if not using preloaded)
  useEffect(() => {
    if (preloadedSimliClient) return // Skip if using preloaded
    
    const preloadSimliSDK = async () => {
      try {
        console.log('📦 [VoiceAgent] Pre-loading SimliClient SDK...')
        const { SimliClient } = await import('simli-client')
        SimliClientRef.current = SimliClient
        console.log('✅ [VoiceAgent] SimliClient SDK pre-loaded successfully')
      } catch (error) {
        console.warn('⚠️ [VoiceAgent] Failed to pre-load SimliClient:', error)
      }
    }
    preloadSimliSDK()
  }, [preloadedSimliClient])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Generate unique session ID
  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`
  }

  // Initialize Simli Avatar (only if not using preloaded)
  const initializeSimliAvatar = useCallback(async () => {
    // If using preloaded avatar, just ensure it's set up
    if (usingPreloadedAvatar.current && simliRef.current) {
      console.log('🎭 [VoiceAgent] Avatar already pre-loaded, skipping initialization')
      simliReadyRef.current = true
      setAvatarReady(true)
      return true
    }

    // Prevent multiple initializations
    if (simliRef.current || avatarLoading) {
      console.log('⚠️ [VoiceAgent] Avatar already initializing or initialized')
      return simliReadyRef.current
    }

    setAvatarLoading(true)
    
    try {
      console.log('🎭 [VoiceAgent] Initializing Simli avatar...')
      
      const apiKey = process.env.NEXT_PUBLIC_SIMLI_API_KEY
      const faceId = process.env.NEXT_PUBLIC_SIMLI_FACE_ID

      if (!apiKey || !faceId) {
        console.error('❌ [VoiceAgent] Missing Simli credentials')
        setAvatarError(true)
        setAvatarLoading(false)
        return false
      }

      // Wait for video/audio refs with timeout
      let refWaitCount = 0
      while ((!videoRef.current || !audioRef.current) && refWaitCount < 10) {
        console.log('⏳ [VoiceAgent] Waiting for video/audio refs...', refWaitCount)
        await new Promise(resolve => setTimeout(resolve, 100))
        refWaitCount++
      }

      if (!videoRef.current || !audioRef.current) {
        console.error('❌ [VoiceAgent] Video/Audio refs not ready after waiting')
        setAvatarError(true)
        setAvatarLoading(false)
        return false
      }

      // Use pre-loaded SDK or import fresh
      let SimliClient = SimliClientRef.current
      if (!SimliClient) {
        console.log('📦 [VoiceAgent] Importing SimliClient (not pre-loaded)...')
        const module = await import('simli-client')
        SimliClient = module.SimliClient
        SimliClientRef.current = SimliClient
      }
      
      const simliClient = new SimliClient()
      
      const config = {
        apiKey: apiKey,
        faceID: faceId,
        handleSilence: true,
        maxSessionLength: 600,
        maxIdleTime: 180,
        videoRef: videoRef.current,
        audioRef: audioRef.current,
      }

      console.log('🔧 [VoiceAgent] Initializing Simli with config...')
      const initStart = performance.now()
      
      await simliClient.Initialize(config)
      console.log(`✅ [VoiceAgent] Simli initialized in ${(performance.now() - initStart).toFixed(0)}ms`)
      
      await simliClient.start()
      console.log(`✅ [VoiceAgent] Simli started in ${(performance.now() - initStart).toFixed(0)}ms total`)
      
      simliRef.current = simliClient
      simliReadyRef.current = true
      setAvatarReady(true)
      setAvatarError(false)
      setAvatarLoading(false)
      
      return true
    } catch (error) {
      console.error('❌ [VoiceAgent] Error initializing Simli avatar:', error)
      setAvatarError(true)
      setAvatarLoading(false)
      simliReadyRef.current = false
      return false
    }
  }, [avatarLoading, videoRef, audioRef])

  // Initialize AudioContext
  const initializeAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 24000
        }
      })

      audioStreamRef.current = stream
      audioContextRef.current = new AudioContext({ sampleRate: 24000 })

      return true
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Please grant microphone permission to use voice chat')
      return false
    }
  }

  // Create WAV blob from PCM16 audio
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

  // Transcribe user audio with Whisper API
  const transcribeUserAudio = async () => {
    if (userAudioChunksRef.current.length === 0) {
      console.log('⚠️ No audio chunks to transcribe')
      return
    }

    try {
      console.log('🎙️ Transcribing user audio with Whisper...', userAudioChunksRef.current.length, 'chunks')
      
      let totalLength = 0
      userAudioChunksRef.current.forEach(chunk => totalLength += chunk.length)
      
      const combinedAudio = new Int16Array(totalLength)
      let offset = 0
      userAudioChunksRef.current.forEach(chunk => {
        combinedAudio.set(chunk, offset)
        offset += chunk.length
      })
      
      const audioBlob = createWavBlob(combinedAudio)
      console.log('📦 Audio blob created:', audioBlob.size, 'bytes')
      
      const formData = new FormData()
      formData.append('file', audioBlob, 'audio.wav')
      formData.append('language', 'en')
      
      const response = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('Transcription failed')
      }
      
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
        
        if (sessionIdRef.current) {
          saveVoiceTurn({
            sessionId: sessionIdRef.current,
            speaker: 'user',
            content: userText,
            language: 'en-IN'
          }).catch(err => console.error('Error saving user turn:', err))
        }
        
        extractCallerData(userText)
      }
      
      userAudioChunksRef.current = []
      
    } catch (error) {
      console.error('❌ Error transcribing audio:', error)
      userAudioChunksRef.current = []
    }
  }

  // Connect to OpenAI Realtime API
  const connectToOpenAI = async () => {
    setConnectionStatus('connecting')

    try {
      const sessionId = generateSessionId()
      sessionIdRef.current = sessionId
      console.log('📞 Session ID:', sessionId)

      console.log('🎙️ Starting voice session...', sessionId)
      const dbSessionId = await startVoiceSession({
        sessionId: sessionId,
        channel: 'web_voice',
        language: 'en-IN'
      })

      if (dbSessionId) {
        dbSessionIdRef.current = dbSessionId
        console.log('✅ Database session started:', dbSessionId)
      }

      const response = await fetch('/api/voice/token', {
        method: 'POST'
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Token API error:', errorData)
        throw new Error('Failed to get session token')
      }

      const data = await response.json()
      console.log('Token received:', data)

      const clientSecret = typeof data.client_secret === 'string' 
        ? data.client_secret 
        : data.client_secret?.value

      if (!clientSecret) {
        console.error('❌ No client secret found in response')
        throw new Error('No client secret found in response')
      }

      console.log('✅ Client secret extracted:', clientSecret.substring(0, 15) + '...')

      const ws = new WebSocket(
        `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17`,
        ['realtime', `openai-insecure-api-key.${clientSecret}`]
      )

      wsRef.current = ws

      ws.onopen = () => {
        console.log('✅ WebSocket connected to OpenAI Realtime API')
        setConnectionStatus('connected')

        startAudioStreaming()

        setTimeout(() => {
          if (ws.readyState === WebSocket.OPEN) {
            console.log('🎤 Setting Tripti personality and triggering greeting...')
            
            ws.send(JSON.stringify({
              type: 'conversation.item.create',
              item: {
                type: 'message',
                role: 'system',
                content: [
                  {
                    type: 'input_text',
                    text: `You are Tripti, a friendly and knowledgeable AI sales development representative for AIzYantra (pronounced "AI's Yantra"), an AI consulting company specializing in enterprise AI automation solutions.

PRONUNCIATION GUIDE:
- AIzYantra = "AI's Yantra" (say it as "AI's Yantra", not "Aiz-Yantra")

PERSONALITY:
- Warm and approachable, like a knowledgeable friend
- Professional but not stiff or robotic
- Genuinely curious about visitor needs
- Calm, experienced customer service voice that builds trust
- Culturally aware and comfortable with Indian context
- Patient and engaging - keep the conversation flowing naturally
- Speak warmly and professionally like an experienced Indian customer service representative

YOUR GREETING (Say this EXACTLY when call starts):
"Hello, my name is Tripti. I can help you with your AI Automation related questions. How may I help you today? Main aap ki preferred language mein baat kar sakti hoon. Could you let me know your name and the name of your company to start with?"

CRITICAL DATA COLLECTION FLOW:
Before proceeding with any detailed conversation, you MUST collect at least 3 out of these 5 details:
1. Name (first name + last name)
2. Phone Number
3. Email Address
4. Company Name
5. Designation/Role

IMPORTANT RULES FOR DATA COLLECTION:
- Collect these details naturally and conversationally, not like a form
- Keep the caller engaged while collecting - acknowledge their responses warmly
- If they give you some details but not all, gently ask for the missing ones
- Example: "Thank you [Name]! And what's your role at [Company]? Also, could I have your email and phone number so we can stay in touch?"
- Do NOT proceed to detailed discussion until you have at least 3/5 details
- Track internally which details you have collected
- If caller is hesitant, reassure them: "This helps us serve you better and follow up appropriately"

LANGUAGE HANDLING:
- If caller responds in Hindi or Hinglish, continue naturally in that language
- You can code-switch (mix Hindi and English) comfortably
- Adapt to the caller's language preference immediately

ONCE YOU HAVE MINIMUM 3/5 DETAILS:
- Acknowledge: "Thank you [Name], I have your details. Let me help you with..."
- NEXT STEP: In future, you will search the database to check if this is a new or returning caller
- For now, proceed with the conversation assuming they are a new caller

ENGAGEMENT STRATEGY DURING DATA COLLECTION:
- Use their name once you have it
- Show genuine interest in their company
- Make small talk: "Oh, [Company Name] - I'd love to know more about what you do"
- Keep responses concise (2-3 sentences max) during data collection phase
- Maintain warmth and professionalism throughout

YOUR ROLE AFTER DATA COLLECTION:
- Understand their AI automation needs and challenges
- Gather information about their company (location, industry, business operations, improvement areas, challenges)
- Identify what AI & automation solutions would be applicable
- Check if they already have something specific in mind
- Guide them through their decision-making journey naturally

KEY SERVICES (mention when relevant):
- AI Voice SDRs and Intelligent Agents
- Conversational AI and Chatbots
- Workflow Automation (n8n, Zapier, Make)
- Custom AI Solutions for Healthcare and Professional Services
- AI Integration and Implementation Consulting

CONVERSATION PRINCIPLES:
- Keep responses SHORT (2-3 sentences maximum)
- Ask ONE question at a time
- Listen actively and respond to what they actually say
- Don't overwhelm with information
- Be genuinely helpful, not pushy
- Build trust before trying to sell anything

RESTRICTIONS:
- Never share competitor pricing
- Don't commit to specific project timelines without proper assessment
- Always disclose you are an AI when directly asked
- Keep the conversation natural and human-like

Remember: Your primary goal right now is to warmly greet the caller, collect their basic information (minimum 3/5 fields), and keep them engaged. Be patient, warm, and professional!`
                  }
                ]
              }
            }))

            setTimeout(() => {
              if (ws.readyState === WebSocket.OPEN) {
                console.log('🎤 Requesting initial greeting...')
                ws.send(JSON.stringify({
                  type: 'response.create'
                }))
              }
            }, 300)
          }
        }, 500)
      }

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        handleRealtimeEvent(data)
      }

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error)
        setConnectionStatus('error')
      }

      ws.onclose = (event) => {
        console.log('🔌 Disconnected from OpenAI:', event.code, event.reason)
        setConnectionStatus('disconnected')
        setIsConnected(false)
        handleSessionEnd()
      }

    } catch (error) {
      console.error('❌ Error connecting to OpenAI:', error)
      setConnectionStatus('error')
      alert('Failed to connect to voice service. Please try again.')
    }
  }

  // Handle OpenAI Realtime events
  const handleRealtimeEvent = (event: any) => {
    if (event.type !== 'response.output_audio.delta' && event.type !== 'response.output_audio_transcript.delta') { 
      console.log('📨 Realtime event:', event.type)
    }

    switch (event.type) {
      case 'session.created':
        console.log('✅ Session created successfully')
        break

      case 'session.updated':
        console.log('✅ Session updated')
        break

      case 'input_audio_buffer.speech_started':
        console.log('🎤 User started speaking')
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

      case 'input_audio_buffer.committed':
        console.log('✅ Audio buffer committed')
        break

      case 'response.output_audio_transcript.done':
        const agentText = event.transcript
        console.log('📝 Tripti transcript:', agentText)
        if (agentText) {
          const agentMessage = {
            id: Date.now().toString(),
            role: 'agent' as const,
            content: agentText,
            timestamp: new Date()
          }
          setMessages(prev => [...prev, agentMessage])
          
          if (sessionIdRef.current) {
            saveVoiceTurn({
              sessionId: sessionIdRef.current,
              speaker: 'tripti',
              content: agentText,
              language: 'en-IN'
            }).catch(err => console.error('Error saving agent turn:', err))
          }
        }
        break

      case 'response.output_audio.delta':
        if (event.delta) {
          queueAudioChunk(event.delta)
          // Send audio to Simli for lip-sync
          sendAudioToSimli(event.delta)
        }
        setAgentState('speaking')
        break

      case 'response.output_audio.done':
        console.log('✅ Audio output complete')
        break

      case 'response.done':
        console.log('✅ Response complete')
        break

      case 'error':
        console.error('❌ OpenAI error:', event.error)
        break
    }
  }

  // ✨ Send audio to Simli for avatar lip-sync
  const sendAudioToSimli = (base64Audio: string) => {
    if (simliRef.current && simliReadyRef.current) {
      try {
        // Log occasionally to avoid spam
        if (Math.random() < 0.05) {
          console.log('🎬 Sending audio to Simli, chunk length:', base64Audio.length)
        }
        simliRef.current.sendAudioData(base64Audio)
      } catch (error) {
        console.error('❌ Error sending audio to Simli:', error)
      }
    }
  }

  // Extract caller data from conversation
  const extractCallerData = (text: string) => {
    const lowerText = text.toLowerCase()
    
    // Extract NAME
    if (!collectedDataRef.current.name) {
      const nonNameWords = ['back', 'here', 'calling', 'getting', 'going', 'looking', 'interested', 
        'the', 'a', 'an', 'my', 'our', 'company', 'from', 'at', 'and', 'or', 'this', 'that']
      
      const namePatterns = [
        /(?:my name is|i am|this is|i'm|call me)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*(?:,|\.|\band\b|from|at|$)/i,
        /(?:i'm|i am)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*(?:,|\.|\band\b|from|at|$)/i,
        /\bname\s+is\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
      ]
      
      for (const pattern of namePatterns) {
        const match = text.match(pattern)
        if (match) {
          const name = match[1].trim()
          const firstWord = name.split(' ')[0].toLowerCase()
          if (!nonNameWords.includes(firstWord) && name.length > 1) {
            collectedDataRef.current.name = name
            console.log('📝 Collected name:', collectedDataRef.current.name)
            break
          }
        }
      }
    }

    // Extract COMPANY
    if (!collectedDataRef.current.company) {
      const companyPatterns = [
        /(?:company\s*(?:name)?\s*(?:is)?)\s+([A-Za-z][A-Za-z0-9\s&-]{2,30}?)(?:\.|,|$|\band\b|\bmy\b)/i,
        /(?:from|at|with|work\s+(?:for|at)|calling from)\s+([A-Za-z][A-Za-z0-9\s&-]{2,30}?)(?:\.|,|$|\band\b|\bmy\b)/i,
        /\b([A-Za-z][A-Za-z0-9\s&-]*(?:labs?|tech|corp|inc|solutions|services|healthcare|pharma|pathlabs?|diagnostics?|pvt|ltd|limited|private))\b/i,
      ]
      
      for (const pattern of companyPatterns) {
        const match = text.match(pattern)
        if (match) {
          let company = match[1].trim()
          company = company.replace(/\s+(and|my|the|is|at|from)$/i, '').trim()
          if (company.length > 2) {
            collectedDataRef.current.company = company
            console.log('📝 Collected company:', collectedDataRef.current.company)
            break
          }
        }
      }
    }

    // Extract EMAIL
    if (!collectedDataRef.current.email) {
      const standardEmail = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i)
      if (standardEmail) {
        collectedDataRef.current.email = standardEmail[1].toLowerCase()
        console.log('📝 Collected email:', collectedDataRef.current.email)
      } else {
        const spokenEmail = text.match(/([a-zA-Z0-9]+(?:\s*(?:dot|\.)\s*[a-zA-Z0-9]+)*)\s*(?:at|@)\s*([a-zA-Z0-9]+(?:\s*(?:dot|\.)\s*[a-zA-Z0-9]+)*)\s*(?:dot|\.)\s*(com|in|org|net|co\.in|io)/i)
        if (spokenEmail) {
          const localPart = spokenEmail[1].replace(/\s*(?:dot|\.)\s*/gi, '.').toLowerCase()
          const domain = spokenEmail[2].replace(/\s*(?:dot|\.)\s*/gi, '.').toLowerCase()
          const tld = spokenEmail[3].replace(/\s+/g, '').toLowerCase()
          collectedDataRef.current.email = `${localPart}@${domain}.${tld}`
          console.log('📝 Collected email (spoken):', collectedDataRef.current.email)
        }
      }
    }

    // Extract PHONE
    if (!collectedDataRef.current.phone) {
      let phoneText = text
        .replace(/triple\s*(\d)/gi, '$1$1$1')
        .replace(/double\s*(\d)/gi, '$1$1')
        .replace(/(\d)\s+(\d)/g, '$1$2')
      
      const allDigits = phoneText.replace(/[^0-9]/g, '')
      const phoneMatch = allDigits.match(/(?:91)?([6-9]\d{9})/)
      if (phoneMatch) {
        collectedDataRef.current.phone = phoneMatch[1]
        console.log('📝 Collected phone:', collectedDataRef.current.phone)
      }
    }

    // Extract DESIGNATION
    if (!collectedDataRef.current.designation) {
      const explicitRolePatterns = [
        /(?:role is|position is|working as|designation is|i work as)\s+(?:a|an|the)?\s*([a-zA-Z\s]{3,20}?)(?:\.|,|$|\bat\b|\bin\b|\bof\b)/i,
        /(?:i am|i'm)\s+(?:a|an|the)\s+([a-zA-Z\s]{3,20}?)(?:\.|,|$|\bat\b|\bin\b|\bof\b)/i,
      ]
      
      const jobTitles = [
        'director', 'ceo', 'cto', 'cfo', 'coo', 'cmo', 'founder', 'co-founder', 'cofounder',
        'manager', 'owner', 'president', 'vice president', 'vp', 'head', 'lead', 'chief',
        'senior manager', 'general manager', 'assistant manager', 'project manager',
        'engineer', 'developer', 'analyst', 'consultant', 'executive', 'administrator',
        'partner', 'associate', 'supervisor', 'coordinator', 'specialist', 'officer'
      ]
      
      for (const pattern of explicitRolePatterns) {
        const match = text.match(pattern)
        if (match) {
          const role = match[1].trim().toLowerCase()
          const falsePositives = ['getting', 'going', 'looking', 'calling', 'having', 'being', 'doing', 'making', 'back', 'here', 'there']
          if (!falsePositives.some(fp => role.startsWith(fp))) {
            collectedDataRef.current.designation = match[1].trim()
            console.log('📝 Collected role:', collectedDataRef.current.designation)
            break
          }
        }
      }
      
      if (!collectedDataRef.current.designation) {
        for (const title of jobTitles) {
          const titleRegex = new RegExp(`\\b${title}\\b`, 'i')
          if (titleRegex.test(text)) {
            collectedDataRef.current.designation = title.charAt(0).toUpperCase() + title.slice(1)
            console.log('📝 Collected role (keyword):', collectedDataRef.current.designation)
            break
          }
        }
      }
    }

    checkDataCollectionComplete()
  }

  // Send context message to Tripti via WebSocket
  const sendContextToTripti = (contextMessage: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('📨 Sending context to Tripti:', contextMessage.substring(0, 100) + '...')
      
      wsRef.current.send(JSON.stringify({
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'system',
          content: [
            {
              type: 'input_text',
              text: contextMessage
            }
          ]
        }
      }))
    }
  }

  // Check if we've collected minimum data
  const checkDataCollectionComplete = async () => {
    const data = collectedDataRef.current
    const fieldsCollected = [
      data.name,
      data.phone,
      data.email,
      data.company,
      data.designation
    ].filter(Boolean).length

    console.log(`📊 Fields collected: ${fieldsCollected}/5`)

    if (fieldsCollected >= 3 && !dataCollectionCompleteRef.current) {
      dataCollectionCompleteRef.current = true
      console.log('✅ Minimum data collected! Creating caller record...')

      const existingCaller = await lookupCaller(data.phone, data.email)
      
      if (existingCaller?.isReturning) {
        console.log('👋 Returning caller:', existingCaller.contactName)
        console.log('📞 Previous sessions:', existingCaller.sessionCount)
        
        const contextMessage = `
[IMPORTANT SYSTEM UPDATE - RETURNING CALLER DETECTED]

This is a RETURNING CALLER! They have called before. Here is their information from our database:

- Name: ${existingCaller.contactName || data.name || 'Unknown'}
- Company: ${existingCaller.organizationName || data.company || 'Unknown'}
- Previous Sessions: ${existingCaller.sessionCount}
- Contact ID: ${existingCaller.contactId}

INSTRUCTIONS FOR THIS RETURNING CALLER:
1. Warmly acknowledge that you REMEMBER them: "Welcome back, [Name] ji! Great to hear from you again!"
2. Reference their company: "How are things going at [Company]?"
3. Do NOT ask for their basic details again - you already have them
4. Ask how you can help them TODAY
5. If they ask "do you remember me" or "do you have my details" - confirm YES, you have their information on file

Example greeting for returning caller:
"Welcome back, ${data.name || existingCaller.contactName} ji! It's wonderful to hear from you again. I have your details from our previous conversation. How can I assist you with AI automation today?"
`
        sendContextToTripti(contextMessage)
        
        if (sessionIdRef.current) {
          await updateVoiceSessionIds(
            sessionIdRef.current,
            existingCaller.contactId,
            existingCaller.organizationId,
            undefined,
            undefined
          )
        }
      } else {
        console.log('🆕 New caller - creating records...')
        
        const contextMessage = `
[SYSTEM UPDATE - NEW CALLER CONFIRMED]

This is a NEW CALLER. Their information has been saved to our CRM:

- Name: ${data.name || 'Not provided'}
- Company: ${data.company || 'Not provided'}
- Email: ${data.email || 'Not provided'}
- Phone: ${data.phone || 'Not provided'}
- Role: ${data.designation || 'Not provided'}

INSTRUCTIONS:
1. Thank them for sharing their details
2. Confirm you have their information saved
3. Proceed to understand their AI automation needs
4. You can reference their details naturally in conversation

Example: "Thank you, ${data.name} ji. I have your details saved. Now, tell me more about what AI solutions you're looking for at ${data.company}?"
`
        sendContextToTripti(contextMessage)
        
        const result = await createOrUpdateCallerRecord(data)
        
        if (result) {
          console.log('✅ Caller record created:', result)
          
          if (sessionIdRef.current) {
            await updateVoiceSessionIds(
              sessionIdRef.current,
              result.contactId,
              result.organizationId,
              result.leadId
            )
          }
        }
      }
    }
  }

  // Handle session end
  const handleSessionEnd = async () => {
    console.log('🏁 Ending voice session...', sessionIdRef.current)
    
    if (sessionIdRef.current && dbSessionIdRef.current) {
      const transcript = messages
        .map(m => `${m.role === 'user' ? 'User' : 'Tripti'}: ${m.content}`)
        .join('\n\n')

      const summary = `Call with ${collectedDataRef.current.name || 'visitor'} ${
        collectedDataRef.current.company ? `from ${collectedDataRef.current.company}` : ''
      }. Duration: ${messages.length} exchanges.`

      await endVoiceSession(
        sessionIdRef.current,
        summary,
        transcript,
        [],
        'neutral'
      )

      console.log('📝 Session ended and saved to database')
    }
  }

  // Queue audio chunk for smooth playback
  const queueAudioChunk = (base64Audio: string) => {
    const audioData = base64DecodeAudio(base64Audio)
    audioQueueRef.current.push(audioData)

    if (!isPlayingRef.current) {
      playNextChunk()
    }
  }

  // Play audio chunks from queue
  const playNextChunk = () => {
    if (!audioContextRef.current || audioQueueRef.current.length === 0) {
      isPlayingRef.current = false
      if (agentState === 'speaking') {
        setAgentState('listening')
      }
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
      const audioBuffer = audioContextRef.current.createBuffer(
        1,
        combinedAudio.length,
        24000
      )

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

      source.onended = () => {
        setTimeout(playNextChunk, 10)
      }
    } catch (error) {
      console.error('Error playing audio chunk:', error)
      isPlayingRef.current = false
      setTimeout(playNextChunk, 50)
    }
  }

  // Start streaming audio to OpenAI
  const startAudioStreaming = async () => {
    if (!audioContextRef.current || !audioStreamRef.current || !wsRef.current) {
      console.error('Audio not initialized')
      return
    }

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

      setIsListening(true)
      setAgentState('listening')
      console.log('🎤 Audio streaming started')
    } catch (error) {
      console.error('Error starting audio streaming:', error)
    }
  }

  // Base64 encoding/decoding helpers
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

  // Start conversation
  const startConversation = async () => {
    console.log('🚀 Starting conversation...')
    const startTime = performance.now()
    
    // Initialize audio first (required for conversation)
    const audioReady = await initializeAudio()
    if (!audioReady) return

    setIsConnected(true)
    
    // If using preloaded avatar, just ensure it's ready
    // Otherwise initialize in parallel with OpenAI connection
    if (usingPreloadedAvatar.current && simliRef.current) {
      console.log('🎭 Using pre-loaded avatar, skipping initialization')
      simliReadyRef.current = true
      setAvatarReady(true)
      await connectToOpenAI()
    } else {
      // Initialize avatar and OpenAI in parallel
      await Promise.all([
        initializeSimliAvatar().catch(err => {
          console.error('Avatar initialization failed, continuing voice-only:', err)
          setAvatarError(true)
          return false
        }),
        connectToOpenAI()
      ])
    }
    
    console.log(`🏁 Conversation started in ${(performance.now() - startTime).toFixed(0)}ms`)
  }

  // End conversation (don't close Simli if it's preloaded - let floating widget manage it)
  const endConversation = async () => {
    await handleSessionEnd()

    // Only close Simli if we created it (not preloaded)
    if (!usingPreloadedAvatar.current && simliRef.current) {
      try {
        await simliRef.current.close()
        console.log('🎭 Simli avatar closed')
      } catch (err) {
        console.error('Error closing Simli:', err)
      }
      simliRef.current = null
      simliReadyRef.current = false
      setAvatarReady(false)
    }

    if (wsRef.current) {
      wsRef.current.close()
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop())
    }
    if (audioContextRef.current) {
      try {
        await audioContextRef.current.close()
      } catch (err) {
        console.log('AudioContext already closed')
      }
    }

    audioQueueRef.current = []
    isPlayingRef.current = false

    setIsConnected(false)
    setIsListening(false)
    setAgentState('idle')
    setMessages([])
    setConnectionStatus('disconnected')
    
    sessionIdRef.current = ''
    dbSessionIdRef.current = null
    collectedDataRef.current = {}
    dataCollectionCompleteRef.current = false
    userAudioChunksRef.current = []
    isCapturingAudioRef.current = false
  }

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (audioStreamRef.current) {
      audioStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = isMuted
      })
    }
  }

  if (isMinimized && isWidget) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
      >
        <MessageSquare className="w-7 h-7 text-white" />
      </button>
    )
  }

  return (
    <div className={`
      ${isWidget
        ? 'w-96 h-[600px] rounded-2xl shadow-2xl'
        : 'w-full max-w-2xl mx-auto rounded-2xl'
      }
      bg-slate-900 border border-slate-700 flex flex-col overflow-hidden
    `}>
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 px-4 py-3 flex items-center justify-between">     
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">T</span>
          </div>
          <div>
            <h3 className="text-white font-semibold">Tripti - AI Sales SDR</h3>
            <p className="text-white/70 text-xs">
              {connectionStatus === 'connecting' && '⏳ Connecting...'}
              {connectionStatus === 'connected' && agentState === 'listening' && '🎤 Listening...'}
              {connectionStatus === 'connected' && agentState === 'thinking' && '💭 Thinking...'}
              {connectionStatus === 'connected' && agentState === 'speaking' && '🔊 Tripti is speaking...'}
              {connectionStatus === 'disconnected' && 'AI Voice Assistant with 3D Avatar'}
              {connectionStatus === 'error' && '❌ Connection Error'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isWidget && (
            <>
              <button
                onClick={() => setIsMinimized(true)}
                className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"      
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              {onClose && (
                <button
                  onClick={() => {
                    endConversation()
                    onClose()
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"    
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Avatar Video Section */}
      <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center" 
           style={{ height: '280px' }}>
        {/* Video element - use local or preloaded */}
        {!preloadedVideoRef && (
          <video 
            ref={localVideoRef}
            autoPlay 
            playsInline
            muted={false}
            className={`w-full h-full object-cover ${avatarReady ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
          />
        )}
        
        {/* Show preloaded video if available */}
        {preloadedVideoRef?.current && (
          <div className="w-full h-full">
            {/* The video is managed by the parent floating widget */}
            <div className={`w-full h-full bg-slate-800 flex items-center justify-center ${avatarReady ? '' : ''}`}>
              {avatarReady && (
                <div className="text-center text-slate-400">
                  <p className="text-sm">🎭 Avatar active in floating window</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Hidden audio element - use local if not preloaded */}
        {!preloadedAudioRef && (
          <audio ref={localAudioRef} autoPlay style={{ display: 'none' }} />
        )}
        
        {/* Fallback when avatar is loading or failed */}
        {!avatarReady && !preloadedSimliClient && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`
              relative w-32 h-32 rounded-full flex items-center justify-center
              ${agentState === 'idle' ? 'bg-slate-700' : ''}
              ${agentState === 'listening' ? 'bg-teal-500/20' : ''}
              ${agentState === 'thinking' ? 'bg-yellow-500/20' : ''}
              ${agentState === 'speaking' ? 'bg-blue-500/20' : ''}
              transition-all duration-300
            `}>
              {agentState === 'listening' && (
                <>
                  <div className="absolute inset-0 rounded-full border-2 border-teal-400 animate-ping opacity-30" />   
                  <div className="absolute inset-2 rounded-full border-2 border-teal-400 animate-pulse" />
                </>
              )}
              {agentState === 'speaking' && (
                <>
                  <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping opacity-30" />   
                  <div className="absolute inset-2 rounded-full border-2 border-blue-400 animate-pulse" />
                </>
              )}
              {agentState === 'thinking' && (
                <div className="absolute inset-2 rounded-full border-2 border-yellow-400 animate-spin" style={{ borderTopColor: 'transparent' }} />
              )}

              <div className={`
                w-16 h-16 rounded-full flex items-center justify-center z-10
                ${agentState === 'idle' ? 'bg-slate-600' : ''}
                ${agentState === 'listening' ? 'bg-teal-500' : ''}
                ${agentState === 'thinking' ? 'bg-yellow-500' : ''}
                ${agentState === 'speaking' ? 'bg-blue-500' : ''}
              `}>
                {agentState === 'thinking' ? (
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                ) : agentState === 'listening' ? (
                  <Mic className="w-8 h-8 text-white" />
                ) : agentState === 'speaking' ? (
                  <Volume2 className="w-8 h-8 text-white animate-pulse" />
                ) : (
                  <Phone className="w-8 h-8 text-white" />
                )}
              </div>
            </div>
            
            <p className="mt-4 text-sm text-slate-400 text-center">
              {avatarError && '🎭 Avatar unavailable - Voice mode active'}
              {!avatarError && !isConnected && '⚡ 3D Avatar + Real-time conversation'}
              {!avatarError && isConnected && avatarLoading && '🎭 Loading avatar...'}
              {!avatarError && isConnected && !avatarLoading && !avatarReady && '🎭 Preparing avatar...'}
            </p>
          </div>
        )}
        
        {/* Status indicator when avatar is ready */}
        {avatarReady && (
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full text-xs text-white flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            🎭 Avatar Active
          </div>
        )}
        
        {/* Speaking indicator overlay */}
        {avatarReady && agentState === 'speaking' && (
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-blue-500/70 backdrop-blur-sm rounded-full text-xs text-white flex items-center gap-1">
            <Volume2 className="w-3 h-3 animate-pulse" />
            Speaking...
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-900">
        {messages.length === 0 && (
          <div className="text-center text-slate-500 py-8">
            <p className="font-medium">OpenAI Realtime API + Simli Avatar + Whisper</p>
            <p className="text-xs mt-2">Ultra-low latency • 3D lip-sync • Natural conversation</p>
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`
              max-w-[80%] px-4 py-2 rounded-2xl text-sm
              ${message.role === 'user'
                ? 'bg-teal-500 text-white rounded-br-md'
                : 'bg-slate-800 text-slate-200 rounded-bl-md'
              }
            `}>
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Controls */}
      <div className="p-4 bg-slate-800 border-t border-slate-700 flex items-center justify-center gap-4">
        {!isConnected ? (
          <button
            onClick={startConversation}
            disabled={connectionStatus === 'connecting'}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white rounded-full font-medium transition-all shadow-lg shadow-teal-500/25 disabled:opacity-50"
          >
            <Phone className="w-5 h-5" />
            {connectionStatus === 'connecting' ? 'Connecting...' : 'Start Conversation'}
          </button>
        ) : (
          <>
            <button
              onClick={toggleMute}
              className={`p-3 rounded-full transition-colors ${
                isMuted
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <button
              onClick={endConversation}
              className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
            >
              <PhoneOff className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}