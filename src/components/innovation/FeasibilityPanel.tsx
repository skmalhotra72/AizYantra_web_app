'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wrench, Users, Clock, AlertTriangle, Database, Plug, DollarSign, ChevronDown, ChevronUp, Loader2, CheckCircle2, XCircle, AlertCircle, Code, Calendar, Layers, Shield, Cpu, Server, Cloud, Zap, RefreshCw } from 'lucide-react'

interface FeasibilityDimension { score: number; assessment: string; details: string[] }
interface Risk { risk: string; probability: 'high' | 'medium' | 'low'; impact: 'high' | 'medium' | 'low'; mitigation: string }
interface FeasibilityAnalysis {
  id: string
  dimensions: { technical_buildability: FeasibilityDimension; team_capability: FeasibilityDimension; resource_estimation: FeasibilityDimension; technology_risk: FeasibilityDimension; data_requirements: FeasibilityDimension; integration_complexity: FeasibilityDimension; funding_fit: FeasibilityDimension }
  technical_score: number
  mvp_timeline: { weeks: number; description: string; phases: { phase: string; duration: string; deliverables: string[] }[] }
  tech_stack: { frontend: string[]; backend: string[]; ai_ml: string[]; infrastructure: string[]; third_party: string[] }
  risks: { technical: Risk[]; market: Risk[]; execution: Risk[] }
  resource_requirements: { team: { role: string; allocation: string; duration: string }[]; budget_estimate: { category: string; amount: string; notes: string }[]; total_budget: string }
  funding_options: { option: string; viability: 'high' | 'medium' | 'low'; description: string }[]
  critical_dependencies: string[]
  summary: string
  gate_passed: boolean
  recommendation: 'advance' | 'conditional' | 'iterate' | 'decline'
  created_at: string
}

interface FeasibilityPanelProps { ideaId: string; currentStage: number; existingAnalysis?: FeasibilityAnalysis | null; onAnalysisComplete?: (result: FeasibilityAnalysis) => void }

const dimensionMeta = {
  technical_buildability: { label: 'Technical Buildability', icon: Wrench, color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  team_capability: { label: 'Team Capability', icon: Users, color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
  resource_estimation: { label: 'Resource Estimation', icon: Clock, color: 'text-green-400', bgColor: 'bg-green-500/20' },
  technology_risk: { label: 'Technology Risk', icon: AlertTriangle, color: 'text-red-400', bgColor: 'bg-red-500/20' },
  data_requirements: { label: 'Data Requirements', icon: Database, color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  integration_complexity: { label: 'Integration Complexity', icon: Plug, color: 'text-orange-400', bgColor: 'bg-orange-500/20' },
  funding_fit: { label: 'Funding Fit', icon: DollarSign, color: 'text-emerald-400', bgColor: 'bg-emerald-500/20' }
}

export default function FeasibilityPanel({ ideaId, currentStage, existingAnalysis, onAnalysisComplete }: FeasibilityPanelProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [generatedAnalysis, setGeneratedAnalysis] = useState<FeasibilityAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ dimensions: true, timeline: false, techStack: false, risks: false, resources: false, funding: false })

  const analysis = generatedAnalysis || existingAnalysis || null
  const toggleSection = (section: string) => { setExpandedSections(prev => ({ ...prev, [section]: !prev[section] })) }

  const handleAnalyze = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsAnalyzing(true)
    setError(null)
    try {
      const response = await fetch('/api/innovation/feasibility', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ideaId }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Feasibility analysis failed')
      setGeneratedAnalysis(data.feasibility)
      setIsExpanded(true)
      onAnalysisComplete?.(data.feasibility)
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to analyze feasibility') }
    finally { setIsAnalyzing(false) }
  }

  const getScoreColor = (s: number) => { if (s >= 8) return 'text-green-400'; if (s >= 6) return 'text-yellow-400'; return 'text-red-400' }
  const getScoreBarColor = (s: number) => { if (s >= 8) return 'bg-green-500'; if (s >= 6) return 'bg-yellow-500'; return 'bg-red-500' }
  const getViabilityColor = (v: string) => { if (v === 'high') return 'bg-green-500/20 text-green-400 border-green-500/30'; if (v === 'medium') return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'; return 'bg-red-500/20 text-red-400 border-red-500/30' }
  const getRiskColor = (p: string, i: string) => { if (p === 'high' && i === 'high') return 'bg-red-500/20 border-red-500/30'; if (p === 'high' || i === 'high') return 'bg-orange-500/20 border-orange-500/30'; return 'bg-yellow-500/20 border-yellow-500/30' }
  const getStatusDisplay = (passed: boolean) => passed ? { color: 'text-green-400', bgColor: 'bg-green-500/20', borderColor: 'border-green-500/50', icon: CheckCircle2, label: 'PASSED' } : { color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', borderColor: 'border-yellow-500/50', icon: AlertCircle, label: 'ITERATE' }

  if (analysis) {
    const status = getStatusDisplay(analysis.gate_passed)
    const StatusIcon = status.icon

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] overflow-hidden">
        {/* Header Banner */}
        <div onClick={() => setIsExpanded(!isExpanded)} className={`p-4 ${status.bgColor} border-b ${status.borderColor} cursor-pointer hover:bg-opacity-80 transition-all`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wrench className="w-5 h-5 text-[#FF6B35]" />
              <h3 className="text-lg font-semibold text-white">Feasibility Analysis</h3>
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${status.bgColor} border ${status.borderColor}`}>
                <StatusIcon className={`w-4 h-4 ${status.color}`} />
                <span className={`text-sm font-medium ${status.color}`}>{status.label}</span>
              </div>
              <span className={`font-bold ${getScoreColor(analysis.technical_score || 0)}`}>{(analysis.technical_score || 0).toFixed(1)}/10</span>
              <span className="text-gray-400 text-sm">{analysis.mvp_timeline?.weeks || 0} weeks MVP</span>
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

                {/* Score Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-[#FF6B35]/20 to-[#FF6B35]/5 rounded-xl p-5 border border-[#FF6B35]/30 text-center">
                    <div className={`text-4xl font-bold ${getScoreColor(analysis.technical_score || 0)}`}>{(analysis.technical_score || 0).toFixed(1)}</div>
                    <div className="text-sm text-gray-400">/10 Technical Score</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 rounded-xl p-5 border border-blue-500/30 text-center">
                    <div className="text-4xl font-bold text-blue-400">{analysis.mvp_timeline?.weeks || 0}</div>
                    <div className="text-sm text-gray-400">Weeks to MVP</div>
                  </div>
                </div>

                {analysis.summary && <div className="bg-[#0d0d0d] rounded-lg p-4"><p className="text-gray-300 leading-relaxed">{analysis.summary}</p></div>}

                {/* Dimensions */}
                {analysis.dimensions && (
                  <div>
                    <button onClick={() => toggleSection('dimensions')} className="w-full flex items-center justify-between p-3 bg-[#0d0d0d] rounded-lg hover:bg-[#151515] transition-colors">
                      <div className="flex items-center gap-2"><Layers className="w-5 h-5 text-[#FF6B35]" /><span className="text-white font-medium">Dimension Scores (7)</span></div>
                      {expandedSections.dimensions ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                    </button>
                    <AnimatePresence>{expandedSections.dimensions && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="grid gap-3 mt-3">
                          {Object.entries(analysis.dimensions).map(([key, dim]) => {
                            const meta = dimensionMeta[key as keyof typeof dimensionMeta]
                            if (!meta || !dim) return null
                            const Icon = meta.icon
                            return (
                              <div key={key} className="bg-[#0d0d0d] rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2"><div className={`w-8 h-8 rounded-lg ${meta.bgColor} flex items-center justify-center`}><Icon className={`w-4 h-4 ${meta.color}`} /></div><span className="text-white font-medium">{meta.label}</span></div>
                                  <span className={`text-xl font-bold ${getScoreColor(dim.score || 0)}`}>{dim.score || 0}/10</span>
                                </div>
                                <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden mb-2"><motion.div initial={{ width: 0 }} animate={{ width: `${(dim.score || 0) * 10}%` }} className={`h-full ${getScoreBarColor(dim.score || 0)} rounded-full`} /></div>
                                <p className="text-sm text-gray-400">{dim.assessment}</p>
                              </div>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}</AnimatePresence>
                  </div>
                )}

                {/* Timeline */}
                {analysis.mvp_timeline?.phases?.length > 0 && (
                  <div>
                    <button onClick={() => toggleSection('timeline')} className="w-full flex items-center justify-between p-3 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition-colors border border-blue-500/30">
                      <div className="flex items-center gap-2"><Calendar className="w-5 h-5 text-blue-400" /><span className="text-blue-400 font-medium">MVP Timeline ({analysis.mvp_timeline.phases.length} Phases)</span></div>
                      {expandedSections.timeline ? <ChevronUp className="w-5 h-5 text-blue-400" /> : <ChevronDown className="w-5 h-5 text-blue-400" />}
                    </button>
                    <AnimatePresence>{expandedSections.timeline && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="mt-3 space-y-3">{analysis.mvp_timeline.phases.map((p, i) => (<div key={i} className="bg-[#0d0d0d] rounded-lg p-4 border-l-4 border-blue-500"><div className="flex items-center justify-between mb-2"><span className="text-white font-medium">{p.phase}</span><span className="text-blue-400 text-sm">{p.duration}</span></div><ul className="space-y-1">{p.deliverables?.map((d, j) => (<li key={j} className="text-sm text-gray-400 flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-blue-400" /> {d}</li>))}</ul></div>))}</div>
                      </motion.div>
                    )}</AnimatePresence>
                  </div>
                )}

                {/* Tech Stack */}
                {analysis.tech_stack && (
                  <div>
                    <button onClick={() => toggleSection('techStack')} className="w-full flex items-center justify-between p-3 bg-purple-500/10 rounded-lg hover:bg-purple-500/20 transition-colors border border-purple-500/30">
                      <div className="flex items-center gap-2"><Code className="w-5 h-5 text-purple-400" /><span className="text-purple-400 font-medium">Recommended Tech Stack</span></div>
                      {expandedSections.techStack ? <ChevronUp className="w-5 h-5 text-purple-400" /> : <ChevronDown className="w-5 h-5 text-purple-400" />}
                    </button>
                    <AnimatePresence>{expandedSections.techStack && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                          {[{ label: 'Frontend', items: analysis.tech_stack.frontend || [], icon: Cpu, color: 'text-blue-400' },{ label: 'Backend', items: analysis.tech_stack.backend || [], icon: Server, color: 'text-green-400' },{ label: 'AI/ML', items: analysis.tech_stack.ai_ml || [], icon: Zap, color: 'text-yellow-400' },{ label: 'Infrastructure', items: analysis.tech_stack.infrastructure || [], icon: Cloud, color: 'text-purple-400' },{ label: 'Third Party', items: analysis.tech_stack.third_party || [], icon: Plug, color: 'text-orange-400' }].map((s, i) => (<div key={i} className="bg-[#0d0d0d] rounded-lg p-3"><div className="flex items-center gap-2 mb-2"><s.icon className={`w-4 h-4 ${s.color}`} /><span className="text-white text-sm font-medium">{s.label}</span></div><div className="flex flex-wrap gap-1">{s.items.map((t, j) => (<span key={j} className="text-xs px-2 py-1 bg-[#1a1a1a] text-gray-300 rounded">{t}</span>))}</div></div>))}
                        </div>
                      </motion.div>
                    )}</AnimatePresence>
                  </div>
                )}

{/* Risks */}
{analysis.risks && (
  <div>
    <button onClick={() => toggleSection('risks')} className="w-full flex items-center justify-between p-3 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors border border-red-500/30">    
      <div className="flex items-center gap-2"><Shield className="w-5 h-5 text-red-400" /><span className="text-red-400 font-medium">Risk Assessment</span></div>
      {expandedSections.risks ? <ChevronUp className="w-5 h-5 text-red-400" /> : <ChevronDown className="w-5 h-5 text-red-400" />}
    </button>
    <AnimatePresence>{expandedSections.risks && (
      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
        <div className="mt-3 space-y-4">
          {[
            { label: 'Technical Risks', risks: analysis.risks.technical || [], color: 'red' },
            { label: 'Market Risks', risks: analysis.risks.market || [], color: 'orange' },
            { label: 'Execution Risks', risks: analysis.risks.execution || [], color: 'yellow' }
          ].map((cat, i) => cat.risks.length > 0 && (
            <div key={i}>
              <h4 className="text-white font-medium mb-2">{cat.label}</h4>
              <div className="space-y-2">
                {cat.risks.map((r: any, j: number) => {
                  // Handle both string format and object format
                  const isString = typeof r === 'string';
                  const riskText = isString ? r : (r.risk || r.description || 'Unknown risk');
                  const probability = isString ? 'medium' : (r.probability || 'medium');
                  const impact = isString ? 'medium' : (r.impact || 'medium');
                  const mitigation = isString ? null : r.mitigation;
                  
                  return (
                    <div key={j} className={`bg-[#0d0d0d] rounded-lg p-3 border ${
                      cat.color === 'red' ? 'border-red-500/30' : 
                      cat.color === 'orange' ? 'border-orange-500/30' : 
                      'border-yellow-500/30'
                    }`}>
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-white text-sm flex-1">{riskText}</span>
                        <div className="flex gap-2 shrink-0">
                          <span className={`text-xs px-2 py-0.5 rounded ${probability === 'high' ? 'bg-red-500/20 text-red-400' : probability === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                            P: {probability}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded ${impact === 'high' ? 'bg-red-500/20 text-red-400' : impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                            I: {impact}
                          </span>
                        </div>
                      </div>
                      {mitigation && (
                        <p className="text-xs text-gray-400 mt-2">Mitigation: {mitigation}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    )}</AnimatePresence>
  </div>
)}

                {/* Resources */}
                {analysis.resource_requirements && (
                  <div>
                    <button onClick={() => toggleSection('resources')} className="w-full flex items-center justify-between p-3 bg-green-500/10 rounded-lg hover:bg-green-500/20 transition-colors border border-green-500/30">
                      <div className="flex items-center gap-2"><Users className="w-5 h-5 text-green-400" /><span className="text-green-400 font-medium">Resource Requirements ({analysis.resource_requirements.total_budget || 'N/A'})</span></div>
                      {expandedSections.resources ? <ChevronUp className="w-5 h-5 text-green-400" /> : <ChevronDown className="w-5 h-5 text-green-400" />}
                    </button>
                    <AnimatePresence>{expandedSections.resources && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-[#0d0d0d] rounded-lg p-4"><h4 className="text-white font-medium mb-3">Team</h4><div className="space-y-2">{(analysis.resource_requirements.team || []).map((t, i) => (<div key={i} className="flex justify-between text-sm"><span className="text-gray-300">{t.role}</span><span className="text-gray-400">{t.allocation} • {t.duration}</span></div>))}</div></div>
                          <div className="bg-[#0d0d0d] rounded-lg p-4"><h4 className="text-white font-medium mb-3">Budget</h4><div className="space-y-2">{(analysis.resource_requirements.budget_estimate || []).map((b, i) => (<div key={i} className="flex justify-between text-sm"><span className="text-gray-300">{b.category}</span><span className="text-green-400">{b.amount}</span></div>))}<div className="border-t border-[#2a2a2a] pt-2 flex justify-between font-medium"><span className="text-white">Total</span><span className="text-green-400">{analysis.resource_requirements.total_budget || 'N/A'}</span></div></div></div>
                        </div>
                      </motion.div>
                    )}</AnimatePresence>
                  </div>
                )}

{/* Funding */}
{analysis.funding_options && Array.isArray(analysis.funding_options) && analysis.funding_options.length > 0 && (
  <div>
    <button onClick={() => toggleSection('funding')} className="w-full flex items-center justify-between p-3 bg-emerald-500/10 rounded-lg hover:bg-emerald-500/20 transition-colors border border-emerald-500/30">
      <div className="flex items-center gap-2"><DollarSign className="w-5 h-5 text-emerald-400" /><span className="text-emerald-400 font-medium">Funding Options ({analysis.funding_options.length})</span></div>
      {expandedSections.funding ? <ChevronUp className="w-5 h-5 text-emerald-400" /> : <ChevronDown className="w-5 h-5 text-emerald-400" />}
    </button>
    <AnimatePresence>{expandedSections.funding && (
      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
        <div className="mt-3 space-y-2">
          {analysis.funding_options.map((f: any, i: number) => {
            if (!f) return null;
            
            // Handle both string format and object format
            const isString = typeof f === 'string';
            const optionName = isString ? f : (f.option || f.name || 'Funding Option');
            const viability = isString ? 'medium' : (f.viability || 'medium');
            const description = isString ? `Potential funding source for this project` : (f.description || 'No description available');
            
            return (
              <div key={i} className={`bg-[#0d0d0d] rounded-lg p-3 border ${getViabilityColor(viability)}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white font-medium">{optionName}</span>
                  <span className={`text-xs px-2 py-1 rounded-full border ${getViabilityColor(viability)}`}>{viability.toUpperCase()}</span>
                </div>
                <p className="text-sm text-gray-400">{description}</p>
              </div>
            );
          })}
        </div>
      </motion.div>
    )}</AnimatePresence>
  </div>
)}

                <div className="text-center text-gray-500 text-sm pt-4 border-t border-[#2a2a2a]">Analysis completed on {new Date(analysis.created_at).toLocaleString()}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  // No data state
  if (currentStage < 4) return <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-6"><div className="flex items-center gap-3 text-gray-400"><AlertCircle className="w-5 h-5 text-yellow-400" /><span>Complete Stage 4 to unlock Feasibility Analysis</span></div></div>

  const isDataMissing = currentStage > 5
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-6">
      <div className="text-center">
        <div className={`w-16 h-16 ${isDataMissing ? 'bg-yellow-500/20' : 'bg-[#FF6B35]/20'} rounded-full flex items-center justify-center mx-auto mb-4`}>{isDataMissing ? <AlertCircle className="w-8 h-8 text-yellow-400" /> : <Wrench className="w-8 h-8 text-[#FF6B35]" />}</div>
        <h3 className="text-xl font-semibold text-white mb-2">{isDataMissing ? 'Feasibility Data Missing' : 'Stage 5: Feasibility Analysis'}</h3>
        <p className="text-gray-400 mb-6">Click below to run the feasibility analysis.</p>
        {error && <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-4"><p className="text-red-400">{error}</p></div>}
        <button onClick={handleAnalyze} disabled={isAnalyzing} className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6B35] hover:bg-[#ff8555] disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors">
          {isAnalyzing ? <><Loader2 className="w-5 h-5 animate-spin" />Analyzing...</> : <><Wrench className="w-5 h-5" />Run Feasibility Analysis</>}
        </button>
      </div>
    </motion.div>
  )
}