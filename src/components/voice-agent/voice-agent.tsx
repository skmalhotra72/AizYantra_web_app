'use client'

import { useState, useRef, useEffect } from 'react'
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

interface Message {
  id: string
  role: 'agent' | 'user'
  content: string
  timestamp: Date
}

interface VoiceAgentProps {
  isWidget?: boolean
  onClose?: () => void
}

export function VoiceAgent({ isWidget = false, onClose }: VoiceAgentProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [agentState, setAgentState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle')
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioStreamRef = useRef<MediaStream | null>(null)
  const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null)
  
  // Audio playback queue for smooth playback
  const audioQueueRef = useRef<Int16Array[]>([])
  const isPlayingRef = useRef(false)
  const nextPlayTimeRef = useRef(0)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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

  // Connect to OpenAI Realtime API
  const connectToOpenAI = async () => {
    setConnectionStatus('connecting')
    
    try {
      // Get ephemeral token from your backend
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

      const clientSecret = data.value
      
      if (!clientSecret) {
        console.error('Response structure:', JSON.stringify(data, null, 2))
        throw new Error('No client secret found in response')
      }
      
      console.log('Using client secret:', clientSecret.substring(0, 10) + '...')
      
      // Connect to OpenAI Realtime API
      const ws = new WebSocket(
        `wss://api.openai.com/v1/realtime?model=gpt-realtime`,
        ['realtime', `openai-insecure-api-key.${clientSecret}`]
      )
      
      wsRef.current = ws

      ws.onopen = () => {
        console.log('WebSocket connected to OpenAI Realtime API')
        setConnectionStatus('connected')
        
        // Start audio streaming
        startAudioStreaming()
        
        // Trigger initial greeting
        setTimeout(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'response.create',
              response: {
                instructions: 'Greet the user warmly with "Namaste! I am Aanya from AIzYantra. How can I help you today?"'
              }
            }))
          }
        }, 500)
      }

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        handleRealtimeEvent(data)
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setConnectionStatus('error')
      }

      ws.onclose = (event) => {
        console.log('Disconnected from OpenAI:', event.code, event.reason)
        setConnectionStatus('disconnected')
        setIsConnected(false)
      }

    } catch (error) {
      console.error('Error connecting to OpenAI:', error)
      setConnectionStatus('error')
      alert('Failed to connect to voice service. Please try again.')
    }
  }

  // Handle OpenAI Realtime events
  const handleRealtimeEvent = (event: any) => {
    // Don't log every audio delta to reduce noise
    if (event.type !== 'response.output_audio.delta' && event.type !== 'response.output_audio_transcript.delta') {
      console.log('Realtime event:', event.type)
    }
    
    switch (event.type) {
      case 'session.created':
        console.log('Session created successfully')
        break

      case 'session.updated':
        console.log('Session updated')
        break

      case 'input_audio_buffer.speech_started':
        setAgentState('listening')
        // Clear audio queue when user starts speaking (interrupt)
        audioQueueRef.current = []
        break

      case 'input_audio_buffer.speech_stopped':
        setAgentState('thinking')
        break

      case 'input_audio_buffer.committed':
        console.log('Audio buffer committed')
        break

      case 'conversation.item.input_audio_transcription.completed':
        const userText = event.transcript
        if (userText) {
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'user',
            content: userText,
            timestamp: new Date()
          }])
        }
        break

      case 'response.output_audio_transcript.done':
        const agentText = event.transcript
        if (agentText) {
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'agent',
            content: agentText,
            timestamp: new Date()
          }])
        }
        break

      case 'response.output_audio.delta':
        if (event.delta) {
          queueAudioChunk(event.delta)
        }
        setAgentState('speaking')
        break

      case 'response.output_audio.done':
        // Audio finished, will switch to listening when queue empties
        break

      case 'response.done':
        // Response complete
        break

      case 'error':
        console.error('OpenAI error:', event.error)
        break
    }
  }

  // Queue audio chunk for smooth playback
  const queueAudioChunk = (base64Audio: string) => {
    const audioData = base64DecodeAudio(base64Audio)
    audioQueueRef.current.push(audioData)
    
    // Start playing if not already playing
    if (!isPlayingRef.current) {
      playNextChunk()
    }
  }

  // Play audio chunks from queue
  const playNextChunk = () => {
    if (!audioContextRef.current || audioQueueRef.current.length === 0) {
      isPlayingRef.current = false
      // Only switch to listening if we're still in speaking state
      if (agentState === 'speaking') {
        setAgentState('listening')
      }
      return
    }

    isPlayingRef.current = true
    
    // Get all queued chunks and combine them for smoother playback
    const chunks = audioQueueRef.current.splice(0, Math.min(5, audioQueueRef.current.length))
    
    // Calculate total length
    let totalLength = 0
    chunks.forEach(chunk => totalLength += chunk.length)
    
    // Combine chunks
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
      
      // Calculate when to start this chunk
      const currentTime = audioContextRef.current.currentTime
      const startTime = Math.max(currentTime, nextPlayTimeRef.current)
      
      source.start(startTime)
      
      // Update next play time
      nextPlayTimeRef.current = startTime + audioBuffer.duration
      
      // Schedule next chunk
      source.onended = () => {
        // Small delay before playing next chunk
        setTimeout(playNextChunk, 10)
      }
    } catch (error) {
      console.error('Error playing audio chunk:', error)
      isPlayingRef.current = false
      // Try next chunk
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
      
      // Create audio processor
      await audioContextRef.current.audioWorklet.addModule('/audio-processor.js')
      const workletNode = new AudioWorkletNode(audioContextRef.current, 'audio-processor')
      audioWorkletNodeRef.current = workletNode

      workletNode.port.onmessage = (event) => {
        if (wsRef.current?.readyState === WebSocket.OPEN && !isMuted) {
          const audioData = base64EncodeAudio(event.data)
          wsRef.current.send(JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: audioData
          }))
        }
      }

      source.connect(workletNode)
      
      setIsListening(true)
      setAgentState('listening')
      console.log('Audio streaming started')
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
    const audioReady = await initializeAudio()
    if (!audioReady) return

    setIsConnected(true)
    await connectToOpenAI()
  }

  // End conversation
  const endConversation = () => {
    if (wsRef.current) {
      wsRef.current.close()
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop())
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
    
    // Clear audio queue
    audioQueueRef.current = []
    isPlayingRef.current = false
    
    setIsConnected(false)
    setIsListening(false)
    setAgentState('idle')
    setMessages([])
    setConnectionStatus('disconnected')
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
            <span className="text-white font-bold">A</span>
          </div>
          <div>
            <h3 className="text-white font-semibold">Aanya - Realtime</h3>
            <p className="text-white/70 text-xs">
              {connectionStatus === 'connecting' && '⏳ Connecting...'}
              {connectionStatus === 'connected' && agentState === 'listening' && '🎤 Listening...'}
              {connectionStatus === 'connected' && agentState === 'thinking' && '💭 Thinking...'}
              {connectionStatus === 'connected' && agentState === 'speaking' && '🔊 Speaking...'}
              {connectionStatus === 'disconnected' && 'AI Voice Assistant'}
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

      {/* Voice Visualization */}
      <div className="p-6 flex flex-col items-center justify-center bg-slate-800/50">
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
          {agentState === 'idle' && !isConnected && '⚡ Real-time conversation with zero lag'}
          {agentState === 'idle' && isConnected && 'Ready to chat'}
          {agentState === 'listening' && '🎤 Listening... Say something!'}
          {agentState === 'thinking' && 'Processing...'}
          {agentState === 'speaking' && '🔊 Aanya is speaking...'}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-900">
        {messages.length === 0 && (
          <div className="text-center text-slate-500 py-8">
            <p className="font-medium">OpenAI Realtime API</p>
            <p className="text-xs mt-2">Ultra-low latency • Natural conversation</p>
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