'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  TrendingUp,
  Target,
  Users,
  Clock,
  Lightbulb,
  ThumbsUp,
  AlertTriangle,
  ArrowRight,
  RefreshCw
} from 'lucide-react'

interface EvaluationScores {
  problem_clarity: number
  market_need: number
  target_audience: number
  urgency_timing: number
  differentiation: number
}

interface AIEvaluation {
  id: string
  scores: EvaluationScores
  composite_score: number
  gate_passed: boolean
  advance_recommendation: 'advance' | 'iterate' | 'pivot' | 'decline'
  summary: string
  strengths: string[]
  concerns: string[]
  recommendations: string[]
  pivot_suggestions: string[]
  created_at: string
}

interface AIEvaluationPanelProps {
  ideaId: string
  currentStage: number
  existingEvaluation?: AIEvaluation | null
  onEvaluationComplete?: (evaluation: AIEvaluation) => void
}

const scoreCriteria = [
  { key: 'problem_clarity', label: 'Problem Clarity', icon: Target, description: 'Is the problem well-defined?' },
  { key: 'market_need', label: 'Market Need', icon: TrendingUp, description: 'Does this solve a real pain point?' },
  { key: 'target_audience', label: 'Target Audience', icon: Users, description: 'Is the audience clearly identified?' },
  { key: 'urgency_timing', label: 'Urgency/Timing', icon: Clock, description: 'Is the timing right?' },
  { key: 'differentiation', label: 'Differentiation', icon: Lightbulb, description: 'What makes this unique?' },
]

export default function AIEvaluationPanel({ 
  ideaId, 
  currentStage, 
  existingEvaluation,
  onEvaluationComplete 
}: AIEvaluationPanelProps) {
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [generatedEvaluation, setGeneratedEvaluation] = useState<AIEvaluation | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false) // Collapsed by default
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    scores: true,
    strengths: false,
    concerns: false,
    recommendations: false,
    pivots: false
  })

  const evaluation = generatedEvaluation || existingEvaluation || null

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const handleEvaluate = async (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent panel toggle
    setIsEvaluating(true)
    setError(null)

    try {
      const response = await fetch('/api/innovation/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Evaluation failed')
      }

      setGeneratedEvaluation(data.evaluation)
      setIsExpanded(true) // Expand to show new results
      onEvaluationComplete?.(data.evaluation)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to evaluate idea')
    } finally {
      setIsEvaluating(false)
    }
  }

  const getStatusDisplay = (recommendation: string, passed: boolean) => {
    if (passed && (recommendation === 'advance')) {
      return { color: 'text-green-400', bgColor: 'bg-green-500/20', borderColor: 'border-green-500/50', icon: CheckCircle2, label: 'PASSED' }
    } else if (recommendation === 'iterate') {
      return { color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', borderColor: 'border-yellow-500/50', icon: AlertCircle, label: 'ITERATE' }
    } else if (recommendation === 'pivot') {
      return { color: 'text-orange-400', bgColor: 'bg-orange-500/20', borderColor: 'border-orange-500/50', icon: RefreshCw, label: 'PIVOT' }
    } else {
      return { color: 'text-red-400', bgColor: 'bg-red-500/20', borderColor: 'border-red-500/50', icon: XCircle, label: 'DECLINED' }
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-yellow-500'
    if (score >= 40) return 'bg-orange-500'
    return 'bg-red-500'
  }

  // ==========================================
  // DATA EXISTS - Show collapsible panel
  // ==========================================
  if (evaluation) {
    const status = getStatusDisplay(evaluation.advance_recommendation, evaluation.gate_passed)
    const StatusIcon = status.icon

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] overflow-hidden"
      >
        {/* Collapsible Header Banner */}
        <div 
          onClick={() => setIsExpanded(!isExpanded)}
          className={`p-4 ${status.bgColor} border-b ${status.borderColor} cursor-pointer hover:bg-opacity-80 transition-all`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[#FF6B35]" />
              <h3 className="text-lg font-semibold text-white">AI Evaluation Results</h3>
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${status.bgColor} border ${status.borderColor}`}>
                <StatusIcon className={`w-4 h-4 ${status.color}`} />
                <span className={`text-sm font-medium ${status.color}`}>{status.label}</span>
              </div>
              <span className="text-white font-bold">{evaluation.composite_score}/500</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleEvaluate}
                disabled={isEvaluating}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0d0d0d] hover:bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg transition-colors text-sm disabled:opacity-50"
              >
                {isEvaluating ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF6B35]" /> : <RefreshCw className="w-3.5 h-3.5 text-[#FF6B35]" />}
                <span className="text-gray-300">Re-analyze</span>
              </button>
              {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </div>
          </div>
        </div>

        {/* Expandable Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-6 space-y-6">
                {error && (
                  <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                    <p className="text-red-400">{error}</p>
                  </div>
                )}

                {/* Composite Score */}
                <div className="text-center">
                  <div className="text-5xl font-bold text-white mb-2">
                    {evaluation.composite_score}
                    <span className="text-xl text-gray-400">/500</span>
                  </div>
                  <div className="w-full bg-[#2a2a2a] rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(evaluation.composite_score / 500) * 100}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={`h-full ${evaluation.gate_passed ? 'bg-green-500' : 'bg-orange-500'}`}
                    />
                  </div>
                  <p className="text-gray-400 text-sm mt-2">Pass threshold: 350 points</p>
                </div>

                {/* Summary */}
                {evaluation.summary && (
                  <div className="bg-[#0d0d0d] rounded-lg p-4">
                    <p className="text-gray-300 leading-relaxed">{evaluation.summary}</p>
                  </div>
                )}

                {/* Individual Scores */}
                <div>
                  <button onClick={() => toggleSection('scores')} className="w-full flex items-center justify-between p-3 bg-[#0d0d0d] rounded-lg hover:bg-[#151515] transition-colors">
                    <span className="text-white font-medium">Detailed Scores</span>
                    {expandedSections.scores ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </button>
                  <AnimatePresence>
                    {expandedSections.scores && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="grid gap-3 mt-3">
                          {scoreCriteria.map((criteria) => {
                            const score = evaluation.scores?.[criteria.key as keyof EvaluationScores] || 0
                            const Icon = criteria.icon
                            return (
                              <div key={criteria.key} className="bg-[#0d0d0d] rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Icon className="w-4 h-4 text-[#FF6B35]" />
                                    <span className="text-white font-medium">{criteria.label}</span>
                                  </div>
                                  <span className="text-white font-bold">{score}/100</span>
                                </div>
                                <div className="w-full bg-[#2a2a2a] rounded-full h-2 overflow-hidden">
                                  <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} className={`h-full ${getScoreColor(score)}`} />
                                </div>
                                <p className="text-gray-500 text-sm mt-1">{criteria.description}</p>
                              </div>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Strengths */}
                {evaluation.strengths && evaluation.strengths.length > 0 && (
                  <div>
                    <button onClick={() => toggleSection('strengths')} className="w-full flex items-center justify-between p-3 bg-green-500/10 rounded-lg hover:bg-green-500/20 transition-colors border border-green-500/30">
                      <div className="flex items-center gap-2">
                        <ThumbsUp className="w-5 h-5 text-green-400" />
                        <span className="text-green-400 font-medium">Strengths ({evaluation.strengths.length})</span>
                      </div>
                      {expandedSections.strengths ? <ChevronUp className="w-5 h-5 text-green-400" /> : <ChevronDown className="w-5 h-5 text-green-400" />}
                    </button>
                    <AnimatePresence>
                      {expandedSections.strengths && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <ul className="mt-3 space-y-2">
                            {evaluation.strengths.map((strength, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-gray-300 bg-[#0d0d0d] p-3 rounded-lg">
                                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />{strength}
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Concerns */}
                {evaluation.concerns && evaluation.concerns.length > 0 && (
                  <div>
                    <button onClick={() => toggleSection('concerns')} className="w-full flex items-center justify-between p-3 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors border border-red-500/30">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        <span className="text-red-400 font-medium">Concerns ({evaluation.concerns.length})</span>
                      </div>
                      {expandedSections.concerns ? <ChevronUp className="w-5 h-5 text-red-400" /> : <ChevronDown className="w-5 h-5 text-red-400" />}
                    </button>
                    <AnimatePresence>
                      {expandedSections.concerns && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <ul className="mt-3 space-y-2">
                            {evaluation.concerns.map((concern, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-gray-300 bg-[#0d0d0d] p-3 rounded-lg">
                                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />{concern}
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Recommendations */}
                {evaluation.recommendations && evaluation.recommendations.length > 0 && (
                  <div>
                    <button onClick={() => toggleSection('recommendations')} className="w-full flex items-center justify-between p-3 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition-colors border border-blue-500/30">
                      <div className="flex items-center gap-2">
                        <ArrowRight className="w-5 h-5 text-blue-400" />
                        <span className="text-blue-400 font-medium">Recommendations ({evaluation.recommendations.length})</span>
                      </div>
                      {expandedSections.recommendations ? <ChevronUp className="w-5 h-5 text-blue-400" /> : <ChevronDown className="w-5 h-5 text-blue-400" />}
                    </button>
                    <AnimatePresence>
                      {expandedSections.recommendations && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <ul className="mt-3 space-y-2">
                            {evaluation.recommendations.map((rec, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-gray-300 bg-[#0d0d0d] p-3 rounded-lg">
                                <Lightbulb className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />{rec}
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Pivot Suggestions */}
                {evaluation.pivot_suggestions && evaluation.pivot_suggestions.length > 0 && !evaluation.gate_passed && (
                  <div>
                    <button onClick={() => toggleSection('pivots')} className="w-full flex items-center justify-between p-3 bg-orange-500/10 rounded-lg hover:bg-orange-500/20 transition-colors border border-orange-500/30">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-5 h-5 text-orange-400" />
                        <span className="text-orange-400 font-medium">Pivot Suggestions ({evaluation.pivot_suggestions.length})</span>
                      </div>
                      {expandedSections.pivots ? <ChevronUp className="w-5 h-5 text-orange-400" /> : <ChevronDown className="w-5 h-5 text-orange-400" />}
                    </button>
                    <AnimatePresence>
                      {expandedSections.pivots && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <ul className="mt-3 space-y-2">
                            {evaluation.pivot_suggestions.map((pivot, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-gray-300 bg-[#0d0d0d] p-3 rounded-lg">
                                <RefreshCw className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />{pivot}
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                <div className="text-center text-gray-500 text-sm pt-4 border-t border-[#2a2a2a]">
                  Evaluated on {new Date(evaluation.created_at).toLocaleString()}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  // ==========================================
  // NO DATA - Show run button
  // ==========================================
  const isDataMissing = currentStage > 2
  
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-6">
      <div className="text-center">
        <div className={`w-16 h-16 ${isDataMissing ? 'bg-yellow-500/20' : 'bg-[#FF6B35]/20'} rounded-full flex items-center justify-center mx-auto mb-4`}>
          {isDataMissing ? <AlertCircle className="w-8 h-8 text-yellow-400" /> : <Sparkles className="w-8 h-8 text-[#FF6B35]" />}
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">{isDataMissing ? 'AI Evaluation Data Missing' : 'Stage 2: AI Evaluation'}</h3>
        <p className="text-gray-400 mb-6">{isDataMissing ? 'The evaluation data for this idea was not found. Click below to run the AI evaluation.' : 'Let Claude AI evaluate this idea on 5 key criteria.'}</p>
        {error && <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-4"><p className="text-red-400">{error}</p></div>}
        <button onClick={handleEvaluate} disabled={isEvaluating} className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6B35] hover:bg-[#ff8555] disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors">
          {isEvaluating ? <><Loader2 className="w-5 h-5 animate-spin" />Evaluating...</> : <><Sparkles className="w-5 h-5" />{isDataMissing ? 'Run AI Evaluation' : 'Evaluate with AI'}</>}
        </button>
      </div>
    </motion.div>
  )
}