'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, TrendingDown, Minus, DollarSign, Building2, ChevronDown, ChevronUp,
  Loader2, CheckCircle2, XCircle, AlertCircle, BarChart3, Target, Zap, Shield, Globe, Sparkles, RefreshCw
} from 'lucide-react'

interface MarketSizing {
  id: string
  tam: { value: number; currency: string; year: number; description: string; sources: string[]; confidence: 'high' | 'medium' | 'low' } | null
  sam: { value: number; currency: string; description: string; methodology: string; confidence: 'high' | 'medium' | 'low' } | null
  som: { value: number; currency: string; description: string; assumptions: string[]; confidence: 'high' | 'medium' | 'low' } | null
  cagr: number
  trend_direction: 'growing' | 'stable' | 'declining'
  competitors: { name: string; description: string; market_share?: string; funding?: string }[]
  market_drivers: string[]
  market_barriers: string[]
  summary: string
  gate_passed: boolean
  recommendation: 'advance' | 'iterate' | 'pivot' | 'decline'
  concerns: string[]
  opportunities: string[]
  created_at: string
}

interface MarketSizingPanelProps {
  ideaId: string
  currentStage: number
  existingMarketSizing?: MarketSizing | null
  onMarketSizingComplete?: (result: MarketSizing) => void
}

export default function MarketSizingPanel({ ideaId, currentStage, existingMarketSizing, onMarketSizingComplete }: MarketSizingPanelProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [generatedMarketSizing, setGeneratedMarketSizing] = useState<MarketSizing | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ competitors: false, drivers: false, barriers: false, opportunities: false })

  const marketSizing = generatedMarketSizing || existingMarketSizing || null
  const toggleSection = (section: string) => { setExpandedSections(prev => ({ ...prev, [section]: !prev[section] })) }

  const handleAnalyze = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsAnalyzing(true)
    setError(null)
    try {
      const response = await fetch('/api/innovation/market-sizing', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ideaId }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Market sizing failed')
      setGeneratedMarketSizing(data.marketSizing)
      setIsExpanded(true)
      onMarketSizingComplete?.(data.marketSizing)
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to analyze market') }
    finally { setIsAnalyzing(false) }
  }

  const formatCurrency = (value: number): string => { if (!value) return '$0M'; if (value >= 1000) return `$${(value / 1000).toFixed(1)}B`; return `$${value.toFixed(0)}M` }
  const getConfidenceColor = (c: string) => { if (c === 'high') return 'bg-green-500/20 text-green-400 border-green-500/50'; if (c === 'medium') return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'; return 'bg-red-500/20 text-red-400 border-red-500/50' }
  const getTrendDisplay = (t: string) => { if (t === 'growing') return { icon: TrendingUp, color: 'text-green-400', label: 'Growing' }; if (t === 'declining') return { icon: TrendingDown, color: 'text-red-400', label: 'Declining' }; return { icon: Minus, color: 'text-yellow-400', label: 'Stable' } }
  const getStatusDisplay = (passed: boolean) => passed ? { color: 'text-green-400', bgColor: 'bg-green-500/20', borderColor: 'border-green-500/50', icon: CheckCircle2, label: 'PASSED' } : { color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', borderColor: 'border-yellow-500/50', icon: AlertCircle, label: 'ITERATE' }

  if (marketSizing) {
    const status = getStatusDisplay(marketSizing.gate_passed)
    const StatusIcon = status.icon
    const trend = getTrendDisplay(marketSizing.trend_direction)

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] overflow-hidden">
        {/* Header Banner */}
        <div onClick={() => setIsExpanded(!isExpanded)} className={`p-4 ${status.bgColor} border-b ${status.borderColor} cursor-pointer hover:bg-opacity-80 transition-all`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-[#FF6B35]" />
              <h3 className="text-lg font-semibold text-white">Market Sizing Analysis</h3>
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${status.bgColor} border ${status.borderColor}`}>
                <StatusIcon className={`w-4 h-4 ${status.color}`} />
                <span className={`text-sm font-medium ${status.color}`}>{status.label}</span>
              </div>
              <span className="text-white font-bold">{formatCurrency(marketSizing.som?.value || 0)} SOM</span>
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
                {marketSizing.summary && <div className="bg-[#0d0d0d] rounded-lg p-4"><p className="text-gray-300 leading-relaxed">{marketSizing.summary}</p></div>}

                {/* TAM/SAM/SOM */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl p-5 border border-blue-500/30">
                    <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><Globe className="w-5 h-5 text-blue-400" /><span className="text-blue-400 font-medium">TAM</span></div>{marketSizing.tam?.confidence && <span className={`text-xs px-2 py-1 rounded-full border ${getConfidenceColor(marketSizing.tam.confidence)}`}>{marketSizing.tam.confidence}</span>}</div>
                    <div className="text-3xl font-bold text-white mb-1">{formatCurrency(marketSizing.tam?.value || 0)}</div>
                    <p className="text-sm text-gray-400">Total Addressable</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl p-5 border border-purple-500/30">
                    <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><Target className="w-5 h-5 text-purple-400" /><span className="text-purple-400 font-medium">SAM</span></div>{marketSizing.sam?.confidence && <span className={`text-xs px-2 py-1 rounded-full border ${getConfidenceColor(marketSizing.sam.confidence)}`}>{marketSizing.sam.confidence}</span>}</div>
                    <div className="text-3xl font-bold text-white mb-1">{formatCurrency(marketSizing.sam?.value || 0)}</div>
                    <p className="text-sm text-gray-400">Serviceable Addressable</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl p-5 border border-green-500/30">
                    <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><DollarSign className="w-5 h-5 text-green-400" /><span className="text-green-400 font-medium">SOM</span></div>{marketSizing.som?.confidence && <span className={`text-xs px-2 py-1 rounded-full border ${getConfidenceColor(marketSizing.som.confidence)}`}>{marketSizing.som.confidence}</span>}</div>
                    <div className="text-3xl font-bold text-white mb-1">{formatCurrency(marketSizing.som?.value || 0)}</div>
                    <p className="text-sm text-gray-400">Serviceable Obtainable</p>
                  </div>
                </div>

                {/* Trend & CAGR */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#0d0d0d] rounded-lg p-4 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full ${trend.color === 'text-green-400' ? 'bg-green-500/20' : 'bg-yellow-500/20'} flex items-center justify-center`}><trend.icon className={`w-6 h-6 ${trend.color}`} /></div>
                    <div><p className="text-gray-400 text-sm">Market Trend</p><p className={`text-lg font-semibold ${trend.color}`}>{trend.label}</p></div>
                  </div>
                  <div className="bg-[#0d0d0d] rounded-lg p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#FF6B35]/20 flex items-center justify-center"><TrendingUp className="w-6 h-6 text-[#FF6B35]" /></div>
                    <div><p className="text-gray-400 text-sm">CAGR</p><p className="text-lg font-semibold text-white">{marketSizing.cagr || 0}%</p></div>
                  </div>
                </div>

                {/* Competitors */}
                {marketSizing.competitors?.length > 0 && (
                  <div>
                    <button onClick={() => toggleSection('competitors')} className="w-full flex items-center justify-between p-3 bg-[#0d0d0d] rounded-lg hover:bg-[#151515] transition-colors">
                      <div className="flex items-center gap-2"><Building2 className="w-5 h-5 text-[#FF6B35]" /><span className="text-white font-medium">Competitors ({marketSizing.competitors.length})</span></div>
                      {expandedSections.competitors ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                    </button>
                    <AnimatePresence>{expandedSections.competitors && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="grid gap-3 mt-3">{marketSizing.competitors.map((c, i) => (<div key={i} className="bg-[#0d0d0d] rounded-lg p-4"><div className="flex items-center justify-between mb-2"><span className="text-white font-medium">{c.name}</span>{c.funding && <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">{c.funding}</span>}</div><p className="text-gray-400 text-sm">{c.description}</p></div>))}</div>
                      </motion.div>
                    )}</AnimatePresence>
                  </div>
                )}

                {/* Drivers */}
                {marketSizing.market_drivers?.length > 0 && (
                  <div>
                    <button onClick={() => toggleSection('drivers')} className="w-full flex items-center justify-between p-3 bg-green-500/10 rounded-lg hover:bg-green-500/20 transition-colors border border-green-500/30">
                      <div className="flex items-center gap-2"><Zap className="w-5 h-5 text-green-400" /><span className="text-green-400 font-medium">Market Drivers ({marketSizing.market_drivers.length})</span></div>
                      {expandedSections.drivers ? <ChevronUp className="w-5 h-5 text-green-400" /> : <ChevronDown className="w-5 h-5 text-green-400" />}
                    </button>
                    <AnimatePresence>{expandedSections.drivers && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <ul className="mt-3 space-y-2">{marketSizing.market_drivers.map((d, i) => (<li key={i} className="flex items-start gap-2 text-gray-300 bg-[#0d0d0d] p-3 rounded-lg"><CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />{d}</li>))}</ul>
                      </motion.div>
                    )}</AnimatePresence>
                  </div>
                )}

                {/* Barriers */}
                {marketSizing.market_barriers?.length > 0 && (
                  <div>
                    <button onClick={() => toggleSection('barriers')} className="w-full flex items-center justify-between p-3 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors border border-red-500/30">
                      <div className="flex items-center gap-2"><Shield className="w-5 h-5 text-red-400" /><span className="text-red-400 font-medium">Market Barriers ({marketSizing.market_barriers.length})</span></div>
                      {expandedSections.barriers ? <ChevronUp className="w-5 h-5 text-red-400" /> : <ChevronDown className="w-5 h-5 text-red-400" />}
                    </button>
                    <AnimatePresence>{expandedSections.barriers && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <ul className="mt-3 space-y-2">{marketSizing.market_barriers.map((b, i) => (<li key={i} className="flex items-start gap-2 text-gray-300 bg-[#0d0d0d] p-3 rounded-lg"><XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />{b}</li>))}</ul>
                      </motion.div>
                    )}</AnimatePresence>
                  </div>
                )}

                <div className="text-center text-gray-500 text-sm pt-4 border-t border-[#2a2a2a]">Analysis completed on {new Date(marketSizing.created_at).toLocaleString()}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  // No data state
  if (currentStage < 2) return <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-6"><div className="flex items-center gap-3 text-gray-400"><AlertCircle className="w-5 h-5 text-yellow-400" /><span>Complete Stage 2 to unlock Market Sizing</span></div></div>

  const isDataMissing = currentStage > 3
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-6">
      <div className="text-center">
        <div className={`w-16 h-16 ${isDataMissing ? 'bg-yellow-500/20' : 'bg-[#FF6B35]/20'} rounded-full flex items-center justify-center mx-auto mb-4`}>{isDataMissing ? <AlertCircle className="w-8 h-8 text-yellow-400" /> : <BarChart3 className="w-8 h-8 text-[#FF6B35]" />}</div>
        <h3 className="text-xl font-semibold text-white mb-2">{isDataMissing ? 'Market Sizing Data Missing' : 'Stage 3: Market Sizing'}</h3>
        <p className="text-gray-400 mb-6">{isDataMissing ? 'Click below to run the market analysis.' : 'Analyze market opportunity with TAM/SAM/SOM.'}</p>
        {error && <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-4"><p className="text-red-400">{error}</p></div>}
        <button onClick={handleAnalyze} disabled={isAnalyzing} className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6B35] hover:bg-[#ff8555] disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors">
          {isAnalyzing ? <><Loader2 className="w-5 h-5 animate-spin" />Analyzing...</> : <><BarChart3 className="w-5 h-5" />Run Market Analysis</>}
        </button>
      </div>
    </motion.div>
  )
}