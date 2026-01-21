'use client'

import { useState } from 'react'
import { MessageSquare, X } from 'lucide-react'
import { VoiceAgent } from './voice-agent'

export function VoiceAgentWidget() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="animate-in slide-in-from-bottom-5 duration-300">
          <VoiceAgent isWidget onClose={() => setIsOpen(false)} />
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="group w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300 hover:shadow-teal-500/25"
        >
          <div className="relative">
            <MessageSquare className="w-7 h-7 text-white" />
            {/* Pulse animation */}
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
          </div>
          
          {/* Tooltip */}
          <div className="absolute right-full mr-3 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Talk to Aanya
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-2 h-2 bg-slate-800 rotate-45" />
          </div>
        </button>
      )}
    </div>
  )
}