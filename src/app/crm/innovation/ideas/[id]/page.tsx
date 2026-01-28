'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Lightbulb, 
  Users, 
  Target, 
  Clock,
  User,
  Calendar,
  Loader2,
  CheckCircle2,
  Pencil
} from 'lucide-react'
import { getIdeaById, getStageByNumber } from '@/lib/innovation/i2e-db'
import type { Idea, WorkflowStage } from '@/lib/innovation/i2e-db'
import { createClient } from '@/lib/supabase/client'
import AIEvaluationPanel from '@/components/innovation/AIEvaluationPanel'
import MarketSizingPanel from '@/components/innovation/MarketSizingPanel'
import ImpactAssessmentPanel from '@/components/innovation/ImpactAssessmentPanel'
import FeasibilityPanel from '@/components/innovation/FeasibilityPanel'
import PitchDeckPanel from '@/components/innovation/PitchDeckPanel'
import VotingPanel from '@/components/innovation/VotingPanel'

// Type for AI Evaluation from database
interface AIEvaluation {
  id: string
  idea_id: string
  stage_number: number
  evaluation_type: string
  scores: {
    problem_clarity: number
    market_need: number
    target_audience: number
    urgency_timing: number
    differentiation: number
  }
  composite_score: number
  summary: string
  recommendations: string[]
  red_flags: string[]
  raw_ai_response: {
    response: string
    strengths: string[]
    pivot_suggestions: string[]
  }
  gate_passed: boolean
  advance_recommendation: 'advance' | 'iterate' | 'pivot' | 'decline'
  created_at: string
}

export default function IdeaDetailPage() {
  const router = useRouter()
  const params = useParams()
  const ideaId = params.id as string

  const [idea, setIdea] = useState<Idea | null>(null)
  const [stage, setStage] = useState<WorkflowStage | null>(null)
  const [evaluation, setEvaluation] = useState<any | null>(null)
  const [marketSizing, setMarketSizing] = useState<any | null>(null)
  const [impactAssessment, setImpactAssessment] = useState<any | null>(null)
  const [feasibility, setFeasibility] = useState<any | null>(null)
  const [pitchDeck, setPitchDeck] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Debug logging (console only, no UI)
  const addDebug = (msg: string) => {
    console.log(`[DEBUG] ${msg}`)
  }

  useEffect(() => {
    loadIdea()
  }, [ideaId])

  const loadIdea = async () => {
    setIsLoading(true)

    addDebug(`Loading idea: ${ideaId}`)

    const ideaData = await getIdeaById(ideaId)

    if (ideaData) {
      addDebug(`Idea loaded: ${ideaData.title}, Stage: ${ideaData.current_stage}`)
      setIdea(ideaData)
      const stageData = await getStageByNumber(ideaData.current_stage)
      setStage(stageData)

      // Load evaluations - try API first, then direct Supabase
      await loadAllEvaluations(ideaId)
    } else {
      addDebug('ERROR: Idea not found!')
    }

    setIsLoading(false)
  }

  // Load evaluations - try API route first (server-side bypasses RLS), then fall back to direct query      
  const loadAllEvaluations = async (ideaId: string) => {
    addDebug('Searching for evaluation data...')

    // Method 1: Try API route first (server-side, proper auth - bypasses RLS)
    try {
      const response = await fetch(`/api/innovation/get-evaluations?ideaId=${ideaId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.evaluations && Object.keys(data.evaluations).length > 0) {
          addDebug(`API returned ${data.count} evaluations`)
          processEvaluationsFromAPI(data.evaluations)
          return
        }
      }
      addDebug('API route returned no data, trying direct query...')
    } catch (error) {
      addDebug(`API route error: ${error}, trying direct query...`)
    }

    // Method 2: Direct Supabase query (may be blocked by RLS)
    await loadEvaluationsDirectFromSupabase(ideaId)
  }

  // Process evaluations returned from API route
  const processEvaluationsFromAPI = (evals: Record<number, any>) => {
    // Stage 2: AI Evaluation
    if (evals[2]) {
      const e = evals[2]
      const rd = e.result_data || {}
      setEvaluation({
        id: e.id,
        scores: rd.scores || {
          problem_clarity: 0,
          market_need: 0,
          target_audience: 0,
          urgency_timing: 0,
          differentiation: 0
        },
        composite_score: rd.composite_score || e.confidence_score || 0,
        gate_passed: e.pass_fail === 'pass',
        advance_recommendation: rd.advance_recommendation || (e.pass_fail === 'pass' ? 'advance' : 'iterate'),
        summary: rd.summary || '',
        strengths: e.strengths || rd.strengths || [],
        concerns: e.concerns || rd.concerns || [],
        recommendations: e.recommendations || rd.recommendations || [],
        pivot_suggestions: e.pivot_suggestions || rd.pivot_suggestions || [],
        created_at: e.created_at
      })
      addDebug('Stage 2 (AI Evaluation) loaded from API')
    }

    // Stage 3: Market Sizing
    if (evals[3]) {
      const e = evals[3]
      const rd = e.result_data || {}
      setMarketSizing({
        id: e.id,
        tam: rd.tam || null,
        sam: rd.sam || null,
        som: rd.som || null,
        cagr: rd.cagr || 0,
        trend_direction: rd.trend_direction || 'stable',
        competitors: rd.competitors || [],
        market_drivers: rd.market_drivers || [],
        market_barriers: rd.market_barriers || [],
        summary: rd.summary || '',
        gate_passed: e.pass_fail === 'pass',
        recommendation: rd.recommendation || 'iterate',
        concerns: e.concerns || rd.concerns || [],
        opportunities: rd.opportunities || [],
        created_at: e.created_at
      })
      addDebug('Stage 3 (Market Sizing) loaded from API')
    }

    // Stage 4: Impact Assessment
    if (evals[4]) {
      const e = evals[4]
      const rd = e.result_data || {}
      setImpactAssessment({
        id: e.id,
        dimensions: rd.dimensions || {},
        composite_score: rd.composite_score || e.confidence_score || 0,
        spike_dimensions: rd.spike_dimensions || [],
        key_insight: rd.key_insight || '',
        summary: rd.summary || '',
        gate_passed: e.pass_fail === 'pass',
        recommendation: rd.recommendation || 'iterate',
        red_flags: rd.red_flags || [],
        opportunities: rd.opportunities || [],
        created_at: e.created_at
      })
      addDebug('Stage 4 (Impact Assessment) loaded from API')
    }

    // Stage 5: Feasibility
    if (evals[5]) {
      const e = evals[5]
      const rd = e.result_data || {}
      setFeasibility({
        id: e.id,
        dimensions: rd.dimensions || {},
        technical_score: rd.technical_score || e.confidence_score || 0,
        mvp_timeline: rd.mvp_timeline || { weeks: 0, description: '', phases: [] },
        tech_stack: rd.tech_stack || { frontend: [], backend: [], ai_ml: [], infrastructure: [], third_party: [] },
        risks: rd.risks || { technical: [], market: [], execution: [] },
        resource_requirements: rd.resource_requirements || { team: [], budget_estimate: [], total_budget: '' },
        funding_options: rd.funding_options || [],
        critical_dependencies: rd.critical_dependencies || [],
        summary: rd.summary || '',
        gate_passed: e.pass_fail === 'pass',
        recommendation: rd.recommendation || 'iterate',
        created_at: e.created_at
      })
      addDebug('Stage 5 (Feasibility) loaded from API')
    }

    // Stage 6: Pitch Deck
    if (evals[6]) {
      const e = evals[6]
      const rd = e.result_data || {}
      setPitchDeck({
        id: e.id,
        slides: rd.slides || [],
        executiveSummary: rd.executiveSummary || rd.executive_summary || '',
        oneLinePitch: rd.oneLinePitch || rd.one_line_pitch || '',
        elevatorPitch: rd.elevatorPitch || rd.elevator_pitch || '',
        keyMetrics: rd.keyMetrics || rd.key_metrics || [],
        gate_passed: e.pass_fail === 'pass',
        recommendation: rd.recommendation || 'advance',
        created_at: e.created_at
      })
      addDebug('Stage 6 (Pitch Deck) loaded from API')
    }
  }

  // Direct Supabase query (fallback if API route doesn't exist)
  const loadEvaluationsDirectFromSupabase = async (ideaId: string) => {
    const supabase = createClient()

    // Try ai_evaluations table
    try {
      const { data: aiEvalData, error: aiEvalError } = await supabase
        .from('ai_evaluations')
        .select('*')
        .eq('idea_id', ideaId)

      if (aiEvalError) {
        addDebug(`ai_evaluations table error: ${aiEvalError.message}`)
      } else {
        addDebug(`ai_evaluations found ${aiEvalData?.length || 0} records`)
        if (aiEvalData && aiEvalData.length > 0) {
          console.log('AI Evaluations data:', aiEvalData)
          processEvaluationData(aiEvalData)
          return
        }
      }
    } catch (e) {
      addDebug(`ai_evaluations catch error: ${e}`)
    }

    // Try innovation_evaluations table
    try {
      const { data: innovEvalData, error: innovEvalError } = await supabase
        .from('innovation_evaluations')
        .select('*')
        .eq('idea_id', ideaId)

      if (innovEvalError) {
        addDebug(`innovation_evaluations table error: ${innovEvalError.message}`)
      } else {
        addDebug(`innovation_evaluations found ${innovEvalData?.length || 0} records`)
        if (innovEvalData && innovEvalData.length > 0) {
          console.log('Innovation Evaluations data:', innovEvalData)
          processEvaluationData(innovEvalData)
          return
        }
      }
    } catch (e) {
      addDebug(`innovation_evaluations catch error: ${e}`)
    }

    // Try idea_evaluations table
    try {
      const { data: ideaEvalData, error: ideaEvalError } = await supabase
        .from('idea_evaluations')
        .select('*')
        .eq('idea_id', ideaId)

      if (ideaEvalError) {
        addDebug(`idea_evaluations table error: ${ideaEvalError.message}`)
      } else {
        addDebug(`idea_evaluations found ${ideaEvalData?.length || 0} records`)
        if (ideaEvalData && ideaEvalData.length > 0) {
          console.log('Idea Evaluations data:', ideaEvalData)
          processEvaluationData(ideaEvalData)
          return
        }
      }
    } catch (e) {
      addDebug(`idea_evaluations catch error: ${e}`)
    }

    // Try evaluations table (generic name)
    try {
      const { data: evalData, error: evalError } = await supabase
        .from('evaluations')
        .select('*')
        .eq('idea_id', ideaId)

      if (evalError) {
        addDebug(`evaluations table error: ${evalError.message}`)
      } else {
        addDebug(`evaluations found ${evalData?.length || 0} records`)
        if (evalData && evalData.length > 0) {
          console.log('Evaluations data:', evalData)
          processEvaluationData(evalData)
          return
        }
      }
    } catch (e) {
      addDebug(`evaluations catch error: ${e}`)
    }

    // Check if data is embedded in the ideas table itself
    try {
      const { data: ideaWithEmbedded, error: ideaError } = await supabase
        .from('ideas')
        .select('*')
        .eq('id', ideaId)
        .single()
      
      if (ideaWithEmbedded) {
        addDebug(`Checking ideas table for embedded data...`)
        console.log('Full idea record:', ideaWithEmbedded)

        // Check for embedded evaluation fields
        if (ideaWithEmbedded.ai_evaluation || ideaWithEmbedded.evaluation_data || ideaWithEmbedded.metadata) {
          addDebug('Found embedded evaluation data in ideas table!')

          const embedded = ideaWithEmbedded.ai_evaluation ||
                          ideaWithEmbedded.evaluation_data ||
                          ideaWithEmbedded.metadata?.evaluations

          if (embedded) {
            console.log('Embedded data:', embedded)
            processEmbeddedData(embedded, ideaWithEmbedded.metadata)
            return
          }
        }
      }
    } catch (e) {
      addDebug(`ideas embed check error: ${e}`)
    }

    addDebug('NO EVALUATION DATA FOUND IN ANY TABLE!')
    addDebug('This idea may need to be re-evaluated.')
  }

  // Process evaluation data from a table with stage_number column
  const processEvaluationData = (data: any[]) => {
    for (const record of data) {
      const stageNum = record.stage_number || record.stage || record.evaluation_stage
      const resultData = record.result_data || record.result || record.data || record

      addDebug(`Processing stage ${stageNum} data`)
      console.log(`Stage ${stageNum} raw:`, record)
      console.log(`Stage ${stageNum} result:`, resultData)

      switch (stageNum) {
        case 2:
          setEvaluation(extractEvaluationData(record, resultData))
          break
        case 3:
          setMarketSizing(extractMarketSizingData(record, resultData))
          break
        case 4:
          setImpactAssessment(extractImpactData(record, resultData))
          break
        case 5:
          setFeasibility(extractFeasibilityData(record, resultData))
          break
        case 6:
          setPitchDeck(extractPitchDeckData(record, resultData))
          break
      }
    }
  }

  // Process embedded data from metadata field
  const processEmbeddedData = (embedded: any, metadata: any) => {
    if (embedded.evaluation || embedded.stage2) {
      setEvaluation(extractEvaluationData(embedded, embedded.evaluation || embedded.stage2))
    }
    if (embedded.marketSizing || embedded.stage3 || embedded.market_sizing) {
      setMarketSizing(extractMarketSizingData(embedded, embedded.marketSizing || embedded.stage3 || embedded.market_sizing))
    }
    if (embedded.impactAssessment || embedded.stage4 || embedded.impact_assessment) {
      setImpactAssessment(extractImpactData(embedded, embedded.impactAssessment || embedded.stage4 || embedded.impact_assessment))
    }
    if (embedded.feasibility || embedded.stage5) {
      setFeasibility(extractFeasibilityData(embedded, embedded.feasibility || embedded.stage5))
    }
    if (embedded.pitchDeck || embedded.stage6 || embedded.pitch_deck) {
      setPitchDeck(extractPitchDeckData(embedded, embedded.pitchDeck || embedded.stage6 || embedded.pitch_deck))
    }
  }

  // Extract AI Evaluation (Stage 2) data
  const extractEvaluationData = (record: any, resultData: any) => {
    const data = resultData || record
    return {
      id: record.id || 'embedded',
      scores: data.scores || {
        problem_clarity: data.problem_clarity || 0,
        market_need: data.market_need || 0,
        target_audience: data.target_audience || 0,
        urgency_timing: data.urgency_timing || 0,
        differentiation: data.differentiation || 0
      },
      composite_score: data.composite_score || data.total_score || data.score || record.confidence_score || 0,
      gate_passed: data.gate_passed ?? data.passed ?? (record.pass_fail === 'pass') ?? false,
      advance_recommendation: data.advance_recommendation || data.recommendation || (record.pass_fail === 'pass' ? 'advance' : 'iterate'),
      summary: data.summary || data.ai_summary || '',
      strengths: record.strengths || data.strengths || [],
      concerns: record.concerns || data.concerns || data.weaknesses || [],
      recommendations: record.recommendations || data.recommendations || [],
      pivot_suggestions: record.pivot_suggestions || data.pivot_suggestions || [],
      created_at: record.created_at || new Date().toISOString()
    }
  }

  // Extract Market Sizing (Stage 3) data
  const extractMarketSizingData = (record: any, resultData: any) => {
    const data = resultData || record
    return {
      id: record.id || 'embedded',
      tam: data.tam || null,
      sam: data.sam || null,
      som: data.som || null,
      cagr: data.cagr || 0,
      trend_direction: data.trend_direction || 'stable',
      competitors: data.competitors || [],
      market_drivers: data.market_drivers || [],
      market_barriers: data.market_barriers || [],
      summary: data.summary || '',
      gate_passed: data.gate_passed ?? data.passed ?? (record.pass_fail === 'pass') ?? false,
      recommendation: data.recommendation || 'iterate',
      concerns: record.concerns || data.concerns || [],
      opportunities: data.opportunities || [],
      created_at: record.created_at || new Date().toISOString()
    }
  }

  // Extract Impact Assessment (Stage 4) data
  const extractImpactData = (record: any, resultData: any) => {
    const data = resultData || record
    return {
      id: record.id || 'embedded',
      dimensions: data.dimensions || {},
      composite_score: data.composite_score || record.confidence_score || 0,
      spike_dimensions: data.spike_dimensions || [],
      key_insight: data.key_insight || '',
      summary: data.summary || '',
      gate_passed: data.gate_passed ?? data.passed ?? (record.pass_fail === 'pass') ?? false,
      recommendation: data.recommendation || 'iterate',
      red_flags: data.red_flags || [],
      opportunities: data.opportunities || [],
      created_at: record.created_at || new Date().toISOString()
    }
  }

  // Extract Feasibility (Stage 5) data
  const extractFeasibilityData = (record: any, resultData: any) => {
    const data = resultData || record
    return {
      id: record.id || 'embedded',
      dimensions: data.dimensions || {},
      technical_score: data.technical_score || record.confidence_score || 0,
      mvp_timeline: data.mvp_timeline || { weeks: 0, description: '', phases: [] },
      tech_stack: data.tech_stack || { frontend: [], backend: [], ai_ml: [], infrastructure: [], third_party: [] },
      risks: data.risks || { technical: [], market: [], execution: [] },
      resource_requirements: data.resource_requirements || { team: [], budget_estimate: [], total_budget: '' },
      funding_options: data.funding_options || [],
      critical_dependencies: data.critical_dependencies || [],
      summary: data.summary || '',
      gate_passed: data.gate_passed ?? data.passed ?? (record.pass_fail === 'pass') ?? false,
      recommendation: data.recommendation || 'iterate',
      created_at: record.created_at || new Date().toISOString()
    }
  }

  // Extract Pitch Deck (Stage 6) data
  const extractPitchDeckData = (record: any, resultData: any) => {
    const data = resultData || record
    return {
      id: record.id || 'embedded',
      slides: data.slides || [],
      executiveSummary: data.executiveSummary || data.executive_summary || '',
      oneLinePitch: data.oneLinePitch || data.one_line_pitch || '',
      elevatorPitch: data.elevatorPitch || data.elevator_pitch || '',
      keyMetrics: data.keyMetrics || data.key_metrics || [],
      gate_passed: data.gate_passed ?? (record.pass_fail === 'pass') ?? true,
      recommendation: data.recommendation || 'advance',
      created_at: record.created_at || new Date().toISOString()
    }
  }

  const handleEvaluationComplete = (newEvaluation: any) => {
    console.log('Evaluation complete, refreshing...', newEvaluation)
    setEvaluation(newEvaluation)
    loadIdea()
  }

  const handleMarketSizingComplete = (newMarketSizing: any) => {
    console.log('Market sizing complete, refreshing...', newMarketSizing)
    setMarketSizing(newMarketSizing)
    loadIdea()
  }

  const handleImpactAssessmentComplete = (newAssessment: any) => {
    console.log('Impact assessment complete, refreshing...', newAssessment)
    setImpactAssessment(newAssessment)
    loadIdea()
  }

  const handleFeasibilityComplete = (newFeasibility: any) => {
    console.log('Feasibility complete, refreshing...', newFeasibility)
    setFeasibility(newFeasibility)
    loadIdea()
  }

  const handlePitchDeckComplete = (newPitchDeck: any) => {
    console.log('Pitch deck complete, refreshing...', newPitchDeck)
    setPitchDeck(newPitchDeck)
    loadIdea()
  }

  const handleVotingComplete = (decision: string) => {
    console.log('Voting complete, decision:', decision)
    loadIdea()
  }

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
      approved: 'bg-green-500/10 text-green-500 border-green-500/20',
      declined: 'bg-red-500/10 text-red-500 border-red-500/20',
      on_hold: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      completed: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      voting: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      conditional: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    }
    return colors[status as keyof typeof colors] || colors.active
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--bg-primary))] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[hsl(var(--accent-primary))] animate-spin mx-auto mb-4" />     
          <p className="text-[hsl(var(--foreground-muted))]">Loading idea...</p>
        </div>
      </div>
    )
  }

  if (!idea) {
    return (
      <div className="min-h-screen bg-[hsl(var(--bg-primary))] flex items-center justify-center">
        <div className="text-center">
          <Lightbulb className="w-16 h-16 text-[hsl(var(--foreground-muted))] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-2">
            Idea Not Found
          </h2>
          <p className="text-[hsl(var(--foreground-muted))] mb-6">
            The idea you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => router.push('/crm/innovation')}
            className="btn-tactile btn-tactile-primary"
          >
            Back to Innovation Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Debug: Log all loaded data (console only)
  console.log('=== RENDER DEBUG ===')
  console.log('Idea current_stage:', idea.current_stage)
  console.log('Evaluation state:', evaluation)
  console.log('MarketSizing state:', marketSizing)
  console.log('ImpactAssessment state:', impactAssessment)
  console.log('Feasibility state:', feasibility)
  console.log('PitchDeck state:', pitchDeck)
  console.log('====================')

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-primary))]">
      {/* Header */}
      <div className="border-b border-[hsl(var(--border))]">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push('/crm/innovation')}
              className="p-2 hover:bg-[hsl(var(--bg-secondary))] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[hsl(var(--foreground-muted))]" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">
                  {idea.title}
                </h1>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(idea.status)}`}>
                  {idea.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              {stage && (
                <p className="text-sm text-[hsl(var(--foreground-muted))]">
                  Stage {stage.stage_number}: {stage.name}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Metadata */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-bordered p-4 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-[hsl(var(--foreground-muted))]" />
              <div>
                <p className="text-xs text-[hsl(var(--foreground-muted))]">Submitted</p>
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                  {new Date(idea.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-[hsl(var(--foreground-muted))]" />
              <div>
                <p className="text-xs text-[hsl(var(--foreground-muted))]">Submitter</p>
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                  {idea.is_anonymous ? 'Anonymous' : 'Team Member'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[hsl(var(--foreground-muted))]" />
              <div>
                <p className="text-xs text-[hsl(var(--foreground-muted))]">Current Stage</p>
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                  {idea.current_stage} of 10
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-[hsl(var(--foreground-muted))]" />
              <div>
                <p className="text-xs text-[hsl(var(--foreground-muted))]">Last Updated</p>
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                  {new Date(idea.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Problem Statement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-bordered p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-[hsl(var(--accent-primary))]" />
              <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">
                Problem Statement
              </h2>
            </div>
            <p className="text-[hsl(var(--foreground-muted))] leading-relaxed">
              {idea.problem_statement}
            </p>
          </motion.div>

          {/* Target Users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-bordered p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-[hsl(var(--accent-primary))]" />
              <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">
                Target Users
              </h2>
            </div>
            <p className="text-[hsl(var(--foreground-muted))]">
              {idea.target_users}
            </p>
          </motion.div>

          {/* Proposed Solution */}
          {idea.proposed_solution && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card-bordered p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-[hsl(var(--accent-primary))]" />
                <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">
                  Proposed Solution
                </h2>
              </div>
              <p className="text-[hsl(var(--foreground-muted))] leading-relaxed whitespace-pre-wrap">       
                {idea.proposed_solution}
              </p>
            </motion.div>
          )}

          {/* Industry Category */}
          {idea.industry_category && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card-bordered p-4"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm text-[hsl(var(--foreground-muted))]">
                  Industry:
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-[hsl(var(--bg-secondary))] text-[hsl(var(--foreground))]">
                  {idea.industry_category}
                </span>
              </div>
            </motion.div>
          )}

          {/* AI Evaluation Panel - Stage 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <AIEvaluationPanel
              ideaId={ideaId}
              currentStage={idea.current_stage}
              existingEvaluation={evaluation}
              onEvaluationComplete={handleEvaluationComplete}
            />
          </motion.div>

          {/* Market Sizing Panel - Stage 3 */}
          {(idea.current_stage >= 2 || marketSizing) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <MarketSizingPanel
                ideaId={ideaId}
                currentStage={idea.current_stage}
                existingMarketSizing={marketSizing}
                onMarketSizingComplete={handleMarketSizingComplete}
              />
            </motion.div>
          )}

          {/* Impact Assessment Panel - Stage 4 */}
          {(idea.current_stage >= 3 || impactAssessment) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <ImpactAssessmentPanel
                ideaId={ideaId}
                currentStage={idea.current_stage}
                existingAssessment={impactAssessment}
                onAssessmentComplete={handleImpactAssessmentComplete}
              />
            </motion.div>
          )}

          {/* Feasibility Panel - Stage 5 */}
          {(idea.current_stage >= 4 || feasibility) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <FeasibilityPanel
                ideaId={ideaId}
                currentStage={idea.current_stage}
                existingAnalysis={feasibility}
                onAnalysisComplete={handleFeasibilityComplete}
              />
            </motion.div>
          )}

          {/* Pitch Deck Panel - Stage 6 */}
          {(idea.current_stage >= 5 || pitchDeck) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <PitchDeckPanel
                ideaId={ideaId}
                currentStage={idea.current_stage}
                existingPitchDeck={pitchDeck}
                onPitchDeckComplete={handlePitchDeckComplete}
              />
            </motion.div>
          )}

          {/* Voting Panel - Stage 7 */}
          {(idea.current_stage >= 6 || idea.status === 'voting') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
            >
              <VotingPanel
                ideaId={ideaId}
                currentStage={idea.current_stage}
                onVotingComplete={handleVotingComplete}
              />
            </motion.div>
          )}

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="flex items-center gap-3 pt-4"
          >
            <button
              onClick={() => router.push('/crm/innovation')}
              className="btn-tactile btn-tactile-outline"
            >
              Back to Dashboard
            </button>

            {/* Edit button - show when idea needs improvement at any stage */}
            {(
              idea.current_stage === 1 ||
              (evaluation && !evaluation.gate_passed) ||
              (marketSizing && !marketSizing.gate_passed) ||
              (impactAssessment && !impactAssessment.gate_passed) ||
              (feasibility && !feasibility.gate_passed)
            ) && (
              <button
                onClick={() => router.push(`/crm/innovation/ideas/${ideaId}/edit`)}
                className="flex items-center gap-2 px-4 py-2 bg-[#FF6B35] hover:bg-[#ff8555] text-white rounded-lg transition-colors"
              >
                <Pencil className="w-4 h-4" />
                Edit & Resubmit
              </button>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}