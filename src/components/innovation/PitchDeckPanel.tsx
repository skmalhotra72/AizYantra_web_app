'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Presentation, Download, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Loader2, CheckCircle2, AlertCircle, FileText, Target, TrendingUp, Lightbulb, Users, Swords, Code, Rocket, Building, MessageSquare, Quote, RefreshCw, Sparkles } from 'lucide-react'

interface Slide { slideNumber: number; title: string; headline: string; keyPoints: string[]; visualSuggestion: string; speakerNotes: string; dataSource: string }
interface PitchDeck {
  id: string
  slides: Slide[]
  executiveSummary: string
  oneLinePitch: string
  elevatorPitch: string
  keyMetrics: { label: string; value: string }[]
  gate_passed: boolean
  recommendation: string
  created_at: string
}

interface PitchDeckPanelProps { ideaId: string; currentStage: number; existingPitchDeck?: PitchDeck | null; onPitchDeckComplete?: (result: PitchDeck) => void }

const slideIcons = [Presentation, AlertCircle, TrendingUp, Lightbulb, Sparkles, Swords, Code, Rocket, Building, MessageSquare]
const slideColors = ['from-[#FF6B35]/20 to-[#FF6B35]/5 border-[#FF6B35]/30','from-red-500/20 to-red-500/5 border-red-500/30','from-green-500/20 to-green-500/5 border-green-500/30','from-blue-500/20 to-blue-500/5 border-blue-500/30','from-purple-500/20 to-purple-500/5 border-purple-500/30','from-orange-500/20 to-orange-500/5 border-orange-500/30','from-cyan-500/20 to-cyan-500/5 border-cyan-500/30','from-pink-500/20 to-pink-500/5 border-pink-500/30','from-yellow-500/20 to-yellow-500/5 border-yellow-500/30','from-emerald-500/20 to-emerald-500/5 border-emerald-500/30']

export default function PitchDeckPanel({ ideaId, currentStage, existingPitchDeck, onPitchDeckComplete }: PitchDeckPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPitchDeck, setGeneratedPitchDeck] = useState<PitchDeck | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ summary: true, slides: true, elevator: false })

  const pitchDeck = generatedPitchDeck || existingPitchDeck || null
  const toggleSection = (section: string) => { setExpandedSections(prev => ({ ...prev, [section]: !prev[section] })) }

  const handleGenerate = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsGenerating(true)
    setError(null)
    try {
      const response = await fetch('/api/innovation/pitch-deck', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ideaId }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Pitch deck generation failed')
      setGeneratedPitchDeck(data.pitchDeck)
      setIsExpanded(true)
      onPitchDeckComplete?.(data.pitchDeck)
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to generate pitch deck') }
    finally { setIsGenerating(false) }
  }

  const nextSlide = () => { if (pitchDeck && currentSlide < (pitchDeck.slides?.length || 0) - 1) setCurrentSlide(currentSlide + 1) }
  const prevSlide = () => { if (currentSlide > 0) setCurrentSlide(currentSlide - 1) }

  if (pitchDeck) {
    const slides = pitchDeck.slides || []
    const slide = slides[currentSlide]
    const SlideIcon = slideIcons[currentSlide] || Presentation

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] overflow-hidden">
        {/* Header Banner */}
        <div onClick={() => setIsExpanded(!isExpanded)} className="p-4 bg-gradient-to-r from-[#FF6B35]/20 to-transparent border-b border-[#FF6B35]/30 cursor-pointer hover:bg-opacity-80 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Presentation className="w-5 h-5 text-[#FF6B35]" />
              <h3 className="text-lg font-semibold text-white">Pitch Deck</h3>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/50">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-green-400">Ready for Voting</span>
              </div>
              <span className="text-gray-400 text-sm">{slides.length} slides</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleGenerate} disabled={isGenerating} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0d0d0d] hover:bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg transition-colors text-sm disabled:opacity-50">
                {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF6B35]" /> : <RefreshCw className="w-3.5 h-3.5 text-[#FF6B35]" />}
                <span className="text-gray-300">Regenerate</span>
              </button>
              <button onClick={(e) => { e.stopPropagation(); window.open(`/api/innovation/pitch-deck/download?ideaId=${ideaId}&format=full`, '_blank') }} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0d0d0d] hover:bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg transition-colors text-sm">
                <Download className="w-3.5 h-3.5 text-[#FF6B35]" /><span className="text-gray-300">Download</span>
              </button>
              {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="p-6 space-y-6">
                {error && <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4"><p className="text-red-400">{error}</p></div>}

                {/* One-Line Pitch */}
                {pitchDeck.oneLinePitch && (
                  <div className="bg-gradient-to-r from-[#FF6B35]/10 to-transparent rounded-lg p-4 border-l-4 border-[#FF6B35]">
                    <p className="text-xl font-medium text-white italic">"{pitchDeck.oneLinePitch}"</p>
                  </div>
                )}

                {/* Key Metrics */}
                {pitchDeck.keyMetrics?.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {pitchDeck.keyMetrics.map((m, i) => (<div key={i} className="bg-[#0d0d0d] rounded-lg p-4 text-center"><div className="text-2xl font-bold text-[#FF6B35]">{m.value}</div><div className="text-sm text-gray-400">{m.label}</div></div>))}
                  </div>
                )}

                {/* Executive Summary */}
                {pitchDeck.executiveSummary && (
                  <div>
                    <button onClick={() => toggleSection('summary')} className="w-full flex items-center justify-between p-3 bg-[#0d0d0d] rounded-lg hover:bg-[#151515] transition-colors">
                      <div className="flex items-center gap-2"><FileText className="w-5 h-5 text-[#FF6B35]" /><span className="text-white font-medium">Executive Summary</span></div>
                      {expandedSections.summary ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                    </button>
                    <AnimatePresence>{expandedSections.summary && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="mt-3 p-4 bg-[#0d0d0d] rounded-lg"><p className="text-gray-300 leading-relaxed">{pitchDeck.executiveSummary}</p></div>
                      </motion.div>
                    )}</AnimatePresence>
                  </div>
                )}

                {/* Slides */}
                {slides.length > 0 && (
                  <div>
                    <button onClick={() => toggleSection('slides')} className="w-full flex items-center justify-between p-3 bg-purple-500/10 rounded-lg hover:bg-purple-500/20 transition-colors border border-purple-500/30">
                      <div className="flex items-center gap-2"><Presentation className="w-5 h-5 text-purple-400" /><span className="text-purple-400 font-medium">Slide Deck ({slides.length} Slides)</span></div>
                      {expandedSections.slides ? <ChevronUp className="w-5 h-5 text-purple-400" /> : <ChevronDown className="w-5 h-5 text-purple-400" />}
                    </button>
                    <AnimatePresence>{expandedSections.slides && slide && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="mt-3">
                          {/* Nav */}
                          <div className="flex items-center justify-between mb-4">
                            <button onClick={prevSlide} disabled={currentSlide === 0} className="p-2 rounded-lg bg-[#0d0d0d] hover:bg-[#1a1a1a] disabled:opacity-50 transition-colors"><ChevronLeft className="w-5 h-5 text-gray-400" /></button>
                            <div className="flex items-center gap-2">{slides.map((_, i) => (<button key={i} onClick={() => setCurrentSlide(i)} className={`w-3 h-3 rounded-full transition-colors ${i === currentSlide ? 'bg-[#FF6B35]' : 'bg-gray-600 hover:bg-gray-500'}`} />))}</div>
                            <button onClick={nextSlide} disabled={currentSlide === slides.length - 1} className="p-2 rounded-lg bg-[#0d0d0d] hover:bg-[#1a1a1a] disabled:opacity-50 transition-colors"><ChevronRight className="w-5 h-5 text-gray-400" /></button>
                          </div>

                          {/* Current Slide */}
                          <motion.div key={currentSlide} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={`bg-gradient-to-br ${slideColors[currentSlide] || slideColors[0]} rounded-xl p-6 border`}>
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 rounded-lg bg-[#0d0d0d] flex items-center justify-center"><SlideIcon className="w-5 h-5 text-[#FF6B35]" /></div>
                              <div><span className="text-xs text-gray-500">Slide {slide.slideNumber} of {slides.length}</span><h4 className="text-lg font-semibold text-white">{slide.title}</h4></div>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">{slide.headline}</h3>
                            {slide.keyPoints?.length > 0 && (<ul className="space-y-2 mb-4">{slide.keyPoints.map((p, i) => (<li key={i} className="flex items-start gap-2 text-gray-300"><CheckCircle2 className="w-4 h-4 text-[#FF6B35] flex-shrink-0 mt-1" />{p}</li>))}</ul>)}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                              <div><span className="text-xs text-gray-500">Visual Suggestion</span><p className="text-sm text-gray-400">{slide.visualSuggestion}</p></div>
                              <div><span className="text-xs text-gray-500">Data Source</span><p className="text-sm text-gray-400">{slide.dataSource}</p></div>
                            </div>
                            {slide.speakerNotes && (<div className="mt-4 p-3 bg-[#0d0d0d]/50 rounded-lg"><span className="text-xs text-gray-500">Speaker Notes</span><p className="text-sm text-gray-300 italic">{slide.speakerNotes}</p></div>)}
                          </motion.div>

                          {/* Thumbnails */}
                          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                            {slides.map((_, i) => { const Icon = slideIcons[i] || Presentation; return (<button key={i} onClick={() => setCurrentSlide(i)} className={`flex-shrink-0 p-3 rounded-lg border transition-all ${i === currentSlide ? 'bg-[#FF6B35]/20 border-[#FF6B35]/50' : 'bg-[#0d0d0d] border-[#2a2a2a] hover:border-[#3a3a3a]'}`}><Icon className={`w-4 h-4 ${i === currentSlide ? 'text-[#FF6B35]' : 'text-gray-500'}`} /></button>) })}
                          </div>
                        </div>
                      </motion.div>
                    )}</AnimatePresence>
                  </div>
                )}

                {/* Elevator Pitch */}
                {pitchDeck.elevatorPitch && (
                  <div>
                    <button onClick={() => toggleSection('elevator')} className="w-full flex items-center justify-between p-3 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition-colors border border-blue-500/30">
                      <div className="flex items-center gap-2"><Quote className="w-5 h-5 text-blue-400" /><span className="text-blue-400 font-medium">60-Second Elevator Pitch</span></div>
                      {expandedSections.elevator ? <ChevronUp className="w-5 h-5 text-blue-400" /> : <ChevronDown className="w-5 h-5 text-blue-400" />}
                    </button>
                    <AnimatePresence>{expandedSections.elevator && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="mt-3 p-4 bg-[#0d0d0d] rounded-lg border-l-4 border-blue-500"><p className="text-gray-300 leading-relaxed italic">{pitchDeck.elevatorPitch}</p></div>
                      </motion.div>
                    )}</AnimatePresence>
                  </div>
                )}

                <div className="text-center text-gray-500 text-sm pt-4 border-t border-[#2a2a2a]">Pitch deck generated on {new Date(pitchDeck.created_at).toLocaleString()}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  // No data state
  if (currentStage < 5) return <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-6"><div className="flex items-center gap-3 text-gray-400"><AlertCircle className="w-5 h-5 text-yellow-400" /><span>Complete Stage 5 to unlock Pitch Deck</span></div></div>

  const isDataMissing = currentStage > 6
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-6">
      <div className="text-center">
        <div className={`w-16 h-16 ${isDataMissing ? 'bg-yellow-500/20' : 'bg-[#FF6B35]/20'} rounded-full flex items-center justify-center mx-auto mb-4`}>{isDataMissing ? <AlertCircle className="w-8 h-8 text-yellow-400" /> : <Presentation className="w-8 h-8 text-[#FF6B35]" />}</div>
        <h3 className="text-xl font-semibold text-white mb-2">{isDataMissing ? 'Pitch Deck Data Missing' : 'Stage 6: Pitch Deck Generation'}</h3>
        <p className="text-gray-400 mb-6">Generate a compelling 10-slide pitch deck from all previous evaluations.</p>
        {error && <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-4"><p className="text-red-400">{error}</p></div>}
        <button onClick={handleGenerate} disabled={isGenerating} className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6B35] hover:bg-[#ff8555] disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors">
          {isGenerating ? <><Loader2 className="w-5 h-5 animate-spin" />Generating...</> : <><Presentation className="w-5 h-5" />Generate Pitch Deck</>}
        </button>
      </div>
    </motion.div>
  )
}