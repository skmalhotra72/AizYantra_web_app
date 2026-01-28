'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, AlertTriangle, Rocket, Users, Target, Clock, ChevronDown, ChevronUp, Loader2, CheckCircle2, XCircle, AlertCircle, Sparkles, TrendingUp, Star, Zap, RefreshCw } from 'lucide-react'

interface ImpactDimension { score: number; weight: number; justification: string }
interface ImpactAssessment {
  id: string
  dimensions: { lives_impacted: ImpactDimension; problem_severity: ImpactDimension; exponential_potential: ImpactDimension; underserved_reach: ImpactDimension; strategic_alignment: ImpactDimension; sustainability: ImpactDimension }
  composite_score: number
  spike_dimensions: string[]
  key_insight: string
  red_flags: string[]
  opportunities: string[]
  summary: string
  gate_passed: boolean
  recommendation: 'advance' | 'conditional' | 'iterate' | 'decline'
  created_at: string
}

interface ImpactAssessmentPanelProps { ideaId: string; currentStage: number; existingAssessment?: ImpactAssessment | null; onAssessmentComplete?: (result: ImpactAssessment) => void }

const dimensionMeta = {
  lives_impacted: { label: 'Lives Impacted', icon: Heart, color: 'text-pink-400', bgColor: 'bg-pink-500/20' },
  problem_severity: { label: 'Problem Severity', icon: AlertTriangle, color: 'text-red-400', bgColor: 'bg-red-500/20' },
  exponential_potential: { label: 'Exponential Potential', icon: Rocket, color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
  underserved_reach: { label: 'Underserved Reach', icon: Users, color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  strategic_alignment: { label: 'Strategic Alignment', icon: Target, color: 'text-green-400', bgColor: 'bg-green-500/20' },
  sustainability: { label: 'Sustainability', icon: Clock, color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' }
}

export default function ImpactAssessmentPanel({ ideaId, currentStage, existingAssessment, onAssessmentComplete }: ImpactAssessmentPanelProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [generatedAssessment, setGeneratedAssessment] = useState<ImpactAssessment | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ dimensions: true, redFlags: false, opportunities: false })

  const assessment = generatedAssessment || existingAssessment || null
  const toggleSection = (section: string) => { setExpandedSections(prev => ({ ...prev, [section]: !prev[section] })) }

  const handleAnalyze = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsAnalyzing(true)
    setError(null)
    try {
      const response = await fetch('/api/innovation/impact-assessment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ideaId }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Impact assessment failed')
      setGeneratedAssessment(data.impactAssessment)
      setIsExpanded(true)
      onAssessmentComplete?.(data.impactAssessment)
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to assess impact') }
    finally { setIsAnalyzing(false) }
  }

  const getScoreColor = (score: number) => { if (score >= 8) return 'text-green-400'; if (score >= 6) return 'text-yellow-400'; return 'text-red-400' }
  const getScoreBarColor = (score: number) => { if (score >= 8) return 'bg-green-500'; if (score >= 6) return 'bg-yellow-500'; return 'bg-red-500' }
  const getStatusDisplay = (passed: boolean) => passed ? { color: 'text-green-400', bgColor: 'bg-green-500/20', borderColor: 'border-green-500/50', icon: CheckCircle2, label: 'PASSED' } : { color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', borderColor: 'border-yellow-500/50', icon: AlertCircle, label: 'ITERATE' }

  if (assessment) {
    const status = getStatusDisplay(assessment.gate_passed)
    const StatusIcon = status.icon

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] overflow-hidden">
        {/* Header Banner */}
        <div onClick={() => setIsExpanded(!isExpanded)} className={`p-4 ${status.bgColor} border-b ${status.borderColor} cursor-pointer hover:bg-opacity-80 transition-all`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[#FF6B35]" />
              <h3 className="text-lg font-semibold text-white">Impact Assessment</h3>
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${status.bgColor} border ${status.borderColor}`}>
                <StatusIcon className={`w-4 h-4 ${status.color}`} />
                <span className={`text-sm font-medium ${status.color}`}>{status.label}</span>
              </div>
              <span className={`font-bold ${getScoreColor(assessment.composite_score)}`}>{assessment.composite_score?.toFixed(1)}/10</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleAnalyze} disabled={isAnalyzing} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0d0d0d] hover:bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg transition-colors text-sm disabled:opacity-50">
                {isAnalyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF6B35]" /> : <RefreshCw className="w-3.5 h-3.5 text-[#FF6B35]" />}
                <span className="text-gray-300">Re-analyze</span>
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

                {/* Score */}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-[#FF6B35]/20 to-[#FF6B35]/5 border-4 border-[#FF6B35]/30">
                    <div><div className={`text-3xl font-bold ${getScoreColor(assessment.composite_score)}`}>{assessment.composite_score?.toFixed(1)}</div><div className="text-sm text-gray-400">/10</div></div>
                  </div>
                  <p className="text-gray-400 mt-2">Composite Impact Score</p>
                </div>

                {/* Spikes */}
                {assessment.spike_dimensions?.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2">
                    {assessment.spike_dimensions.map((spike, idx) => (<span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm border border-green-500/30"><Star className="w-4 h-4" /> {spike}</span>))}
                  </div>
                )}

                {/* Key Insight */}
                {assessment.key_insight && (
                  <div className="bg-gradient-to-r from-[#FF6B35]/10 to-transparent rounded-lg p-4 border-l-4 border-[#FF6B35]">
                    <div className="flex items-start gap-3"><Zap className="w-5 h-5 text-[#FF6B35] flex-shrink-0" /><p className="text-gray-300 italic">{assessment.key_insight}</p></div>
                  </div>
                )}

                {assessment.summary && <div className="bg-[#0d0d0d] rounded-lg p-4"><p className="text-gray-300 leading-relaxed">{assessment.summary}</p></div>}

                {/* Dimensions */}
                {assessment.dimensions && (
                  <div>
                    <button onClick={() => toggleSection('dimensions')} className="w-full flex items-center justify-between p-3 bg-[#0d0d0d] rounded-lg hover:bg-[#151515] transition-colors">
                      <div className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-[#FF6B35]" /><span className="text-white font-medium">Dimension Scores</span></div>
                      {expandedSections.dimensions ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                    </button>
                    <AnimatePresence>{expandedSections.dimensions && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="grid gap-4 mt-4">
                          {Object.entries(assessment.dimensions).map(([key, dim]) => {
                            const meta = dimensionMeta[key as keyof typeof dimensionMeta]
                            if (!meta || !dim) return null
                            const Icon = meta.icon
                            const isSpike = dim.score >= 8
                            return (
                              <div key={key} className={`bg-[#0d0d0d] rounded-lg p-4 ${isSpike ? 'ring-2 ring-green-500/50' : ''}`}>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2"><div className={`w-8 h-8 rounded-lg ${meta.bgColor} flex items-center justify-center`}><Icon className={`w-4 h-4 ${meta.color}`} /></div><span className="text-white font-medium">{meta.label}</span>{isSpike && <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full">SPIKE</span>}</div>
                                  <span className={`text-xl font-bold ${getScoreColor(dim.score)}`}>{dim.score}/10</span>
                                </div>
                                <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden mb-2"><motion.div initial={{ width: 0 }} animate={{ width: `${dim.score * 10}%` }} className={`h-full ${getScoreBarColor(dim.score)} rounded-full`} /></div>
                                <p className="text-sm text-gray-400">{dim.justification}</p>
                              </div>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}</AnimatePresence>
                  </div>
                )}

                {/* Red Flags */}
                {assessment.red_flags?.length > 0 && (
                  <div>
                    <button onClick={() => toggleSection('redFlags')} className="w-full flex items-center justify-between p-3 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors border border-red-500/30">
                      <div className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-red-400" /><span className="text-red-400 font-medium">Red Flags ({assessment.red_flags.length})</span></div>
                      {expandedSections.redFlags ? <ChevronUp className="w-5 h-5 text-red-400" /> : <ChevronDown className="w-5 h-5 text-red-400" />}
                    </button>
                    <AnimatePresence>{expandedSections.redFlags && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <ul className="mt-3 space-y-2">{assessment.red_flags.map((f, i) => (<li key={i} className="flex items-start gap-2 text-gray-300 bg-[#0d0d0d] p-3 rounded-lg"><XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />{f}</li>))}</ul>
                      </motion.div>
                    )}</AnimatePresence>
                  </div>
                )}

                {/* Opportunities */}
                {assessment.opportunities?.length > 0 && (
                  <div>
                    <button onClick={() => toggleSection('opportunities')} className="w-full flex items-center justify-between p-3 bg-green-500/10 rounded-lg hover:bg-green-500/20 transition-colors border border-green-500/30">
                      <div className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-green-400" /><span className="text-green-400 font-medium">Opportunities ({assessment.opportunities.length})</span></div>
                      {expandedSections.opportunities ? <ChevronUp className="w-5 h-5 text-green-400" /> : <ChevronDown className="w-5 h-5 text-green-400" />}
                    </button>
                    <AnimatePresence>{expandedSections.opportunities && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <ul className="mt-3 space-y-2">{assessment.opportunities.map((o, i) => (<li key={i} className="flex items-start gap-2 text-gray-300 bg-[#0d0d0d] p-3 rounded-lg"><CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />{o}</li>))}</ul>
                      </motion.div>
                    )}</AnimatePresence>
                  </div>
                )}

                <div className="text-center text-gray-500 text-sm pt-4 border-t border-[#2a2a2a]">Assessment completed on {new Date(assessment.created_at).toLocaleString()}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  // No data state
  if (currentStage < 3) return <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-6"><div className="flex items-center gap-3 text-gray-400"><AlertCircle className="w-5 h-5 text-yellow-400" /><span>Complete Stage 3 to unlock Impact Assessment</span></div></div>

  const isDataMissing = currentStage > 4
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-6">
      <div className="text-center">
        <div className={`w-16 h-16 ${isDataMissing ? 'bg-yellow-500/20' : 'bg-[#FF6B35]/20'} rounded-full flex items-center justify-center mx-auto mb-4`}>{isDataMissing ? <AlertCircle className="w-8 h-8 text-yellow-400" /> : <Sparkles className="w-8 h-8 text-[#FF6B35]" />}</div>
        <h3 className="text-xl font-semibold text-white mb-2">{isDataMissing ? 'Impact Assessment Data Missing' : 'Stage 4: Impact Assessment'}</h3>
        <p className="text-gray-400 mb-6">Click below to run the impact assessment.</p>
        {error && <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-4"><p className="text-red-400">{error}</p></div>}
        <button onClick={handleAnalyze} disabled={isAnalyzing} className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6B35] hover:bg-[#ff8555] disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors">
          {isAnalyzing ? <><Loader2 className="w-5 h-5 animate-spin" />Assessing...</> : <><Sparkles className="w-5 h-5" />Run Impact Assessment</>}
        </button>
      </div>
    </motion.div>
  )
}