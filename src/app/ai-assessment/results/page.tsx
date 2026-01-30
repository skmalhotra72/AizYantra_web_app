'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Loader2, CheckCircle2, ArrowRight, Download, Share2, RefreshCw,
  Zap, BarChart3, Brain, TrendingUp, Users, Target, PieChart,
  Sparkles, Award, ChevronRight, Calendar, Phone, Mail,
  Lightbulb, Rocket, Building2, Clock, DollarSign, ThumbsUp,
  AlertCircle, Star, ArrowUpRight, ChevronDown, ChevronUp, Globe,
  Briefcase, Activity, MapPin, BarChart2
} from 'lucide-react'

// Tier configurations
const tierConfig = {
  quick: {
    name: 'Quick Pulse',
    color: '#22C55E',
    gradient: 'from-green-500 to-emerald-500',
    icon: Zap,
  },
  complete: {
    name: 'Complete Analysis',
    color: '#3B82F6',
    gradient: 'from-blue-500 to-indigo-500',
    icon: BarChart3,
  },
  advanced: {
    name: 'Deep Dive',
    color: '#8B5CF6',
    gradient: 'from-purple-500 to-violet-500',
    icon: Brain,
  }
}

// Maturity level configurations
const maturityConfig: Record<string, { color: string; gradient: string; description: string; icon: any }> = {
  'AI Newcomer': {
    color: '#EF4444',
    gradient: 'from-red-500 to-orange-500',
    description: 'Just starting your AI journey - huge potential ahead!',
    icon: Lightbulb
  },
  'AI Aware': {
    color: '#F59E0B',
    gradient: 'from-amber-500 to-yellow-500',
    description: 'Building awareness - ready for quick wins!',
    icon: Target
  },
  'AI Curious': {
    color: '#3B82F6',
    gradient: 'from-blue-500 to-cyan-500',
    description: 'Actively exploring - time to accelerate!',
    icon: Rocket
  },
  'AI Ready': {
    color: '#22C55E',
    gradient: 'from-green-500 to-emerald-500',
    description: 'Well-prepared for AI transformation!',
    icon: Award
  }
}

// Dimension icons
const dimensionIcons: Record<string, any> = {
  'Customer Experience': Users,
  'Operational Efficiency': Target,
  'Data & Decisions': PieChart,
  'Growth & Business Development': TrendingUp,
  'Team Productivity': Zap,
}

// Industry benchmarks (average AI readiness scores by industry)
const industryBenchmarks: Record<string, Record<string, number>> = {
  'Healthcare & Life Sciences': {
    'Customer Experience': 42,
    'Operational Efficiency': 38,
    'Data & Decisions': 45,
    'Growth & Business Development': 40,
    'Team Productivity': 44
  },
  'Technology': {
    'Customer Experience': 62,
    'Operational Efficiency': 58,
    'Data & Decisions': 68,
    'Growth & Business Development': 60,
    'Team Productivity': 55
  },
  'Manufacturing': {
    'Customer Experience': 35,
    'Operational Efficiency': 52,
    'Data & Decisions': 42,
    'Growth & Business Development': 38,
    'Team Productivity': 40
  },
  'Retail & E-commerce': {
    'Customer Experience': 52,
    'Operational Efficiency': 48,
    'Data & Decisions': 50,
    'Growth & Business Development': 55,
    'Team Productivity': 42
  },
  'Finance & Banking': {
    'Customer Experience': 50,
    'Operational Efficiency': 55,
    'Data & Decisions': 62,
    'Growth & Business Development': 48,
    'Team Productivity': 52
  },
  'Professional Services': {
    'Customer Experience': 48,
    'Operational Efficiency': 45,
    'Data & Decisions': 52,
    'Growth & Business Development': 50,
    'Team Productivity': 48
  },
  'default': {
    'Customer Experience': 45,
    'Operational Efficiency': 45,
    'Data & Decisions': 48,
    'Growth & Business Development': 45,
    'Team Productivity': 45
  }
}

// AIzYantra recommendations based on scores
const getRecommendations = (overallScore: number, dimensionScores: Record<string, number>) => {
  const recommendations = []

  // Quick Wins (always include 1-2)
  if (dimensionScores['Customer Experience'] < 60) {
    recommendations.push({
      tier: 'Quick Win',
      title: 'AI-Powered Customer Support Chatbot',
      description: 'Deploy a 24/7 AI chatbot to handle common customer inquiries instantly, reducing response time by 80%.',
      impact: 'Immediate customer satisfaction improvement',
      timeline: '2-4 weeks',
      icon: Users,
      color: 'green'
    })
  }

  if (dimensionScores['Operational Efficiency'] < 60) {
    recommendations.push({
      tier: 'Quick Win',
      title: 'Intelligent Document Processing',
      description: 'Automate invoice processing, form extraction, and document classification with AI.',
      impact: '60% reduction in manual data entry',
      timeline: '3-4 weeks',
      icon: Target,
      color: 'green'
    })
  }

  // Strategic (include 2-3)
  if (dimensionScores['Data & Decisions'] < 70) {
    recommendations.push({
      tier: 'Strategic',
      title: 'AI Analytics Dashboard',
      description: 'Real-time business intelligence with predictive insights and automated reporting.',
      impact: 'Data-driven decisions in minutes, not days',
      timeline: '6-8 weeks',
      icon: PieChart,
      color: 'blue'
    })
  }

  if (dimensionScores['Growth & Business Development'] < 70) {
    recommendations.push({
      tier: 'Strategic',
      title: 'AI Sales Intelligence Platform',
      description: 'Lead scoring, personalized outreach, and sales pipeline optimization powered by AI.',
      impact: '40% improvement in conversion rates',
      timeline: '8-10 weeks',
      icon: TrendingUp,
      color: 'blue'
    })
  }

  recommendations.push({
    tier: 'Strategic',
    title: 'Process Automation Suite',
    description: 'End-to-end workflow automation for your most time-consuming processes.',
    impact: '20+ hours saved per week',
    timeline: '6-8 weeks',
    icon: Zap,
    color: 'blue'
  })

  // Transformational (always include 1)
  recommendations.push({
    tier: 'Transformational',
    title: 'Complete AI Transformation Partnership',
    description: 'Comprehensive AI strategy, implementation, and ongoing optimization with AIzYantra as your Technical Co-Founder.',
    impact: 'Full digital transformation with 10x ROI',
    timeline: '3-6 months',
    icon: Rocket,
    color: 'purple'
  })

  return recommendations
}

// Get strengths based on company research AND high scores
const getStrengths = (dimensionScores: Record<string, number>, companyResearch: any) => {
  const strengths = []
  
  // First, add AI-researched company strengths (from Perplexity/fallback)
  if (companyResearch?.strengths && Array.isArray(companyResearch.strengths)) {
    companyResearch.strengths.forEach((strength: string, index: number) => {
      if (index < 3) { // Limit to top 3 research-based strengths
        strengths.push({
          dimension: 'Company Strength',
          score: null,
          message: strength,
          source: 'research'
        })
      }
    })
  }

  // Add growth indicators from research
  if (companyResearch?.growth_indicators && Array.isArray(companyResearch.growth_indicators)) {
    companyResearch.growth_indicators.forEach((indicator: string, index: number) => {
      if (index < 2) { // Limit to top 2
        strengths.push({
          dimension: 'Growth Indicator',
          score: null,
          message: indicator,
          source: 'research'
        })
      }
    })
  }

  // Add AI readiness signals from research
  if (companyResearch?.ai_readiness_signals && Array.isArray(companyResearch.ai_readiness_signals)) {
    companyResearch.ai_readiness_signals.forEach((signal: string, index: number) => {
      if (index < 2) { // Limit to top 2
        strengths.push({
          dimension: 'AI Readiness',
          score: null,
          message: signal,
          source: 'research'
        })
      }
    })
  }
  
  // Then add assessment-based strengths (from high dimension scores)
  Object.entries(dimensionScores).forEach(([dimension, score]) => {
    if (score >= 60) {
      strengths.push({
        dimension,
        score,
        message: score >= 75 
          ? `Excellent foundation in ${dimension.toLowerCase()}!`
          : `Good progress in ${dimension.toLowerCase()}.`,
        source: 'assessment'
      })
    }
  })

  // If still no strengths, add encouraging defaults
  if (strengths.length === 0) {
    strengths.push({
      dimension: 'Growth Potential',
      score: 100,
      message: 'Massive opportunity for AI-driven improvement across all areas!',
      source: 'default'
    })
  }

  return strengths
}

// Get improvement areas based on low scores
const getImprovementAreas = (dimensionScores: Record<string, number>) => {
  const areas = [
    { key: 'productivity', label: 'Productivity', icon: Zap, dimension: 'Operational Efficiency' },
    { key: 'accuracy', label: 'Accuracy', icon: Target, dimension: 'Data & Decisions' },
    { key: 'roi', label: 'Cost Savings (ROI)', icon: DollarSign, dimension: 'Operational Efficiency' },
    { key: 'business_dev', label: 'Business Development', icon: TrendingUp, dimension: 'Growth & Business Development' },
    { key: 'customer_sat', label: 'Customer Satisfaction', icon: ThumbsUp, dimension: 'Customer Experience' },
  ]

  return areas.map(area => {
    const score = dimensionScores[area.dimension] || 50
    return {
      ...area,
      score,
      potential: 100 - score,
      description: score < 40 
        ? `High potential for ${area.label.toLowerCase()} improvement`
        : score < 60
          ? `Good opportunity to enhance ${area.label.toLowerCase()}`
          : `Optimize existing ${area.label.toLowerCase()} processes`
    }
  })
}

// Company Research Section Component with Read More
function CompanyResearchSection({ companyName, companyResearch }: { 
  companyName: string, 
  companyResearch: any 
}) {
  const [expanded, setExpanded] = useState(false)

  // Get detailed analysis or fall back to overview
  const detailedAnalysis = companyResearch.detailed_analysis || ''
  const overview = companyResearch.company_overview || ''
  
  // Create the full text for display
  const fullText = detailedAnalysis || overview
  
  // Get first 2-3 sentences for preview (approximately 150 characters)
  const getPreviewText = (text: string) => {
    if (!text) return ''
    // Find a good break point around 150 chars
    const breakPoint = text.indexOf('.', 100)
    if (breakPoint > 0 && breakPoint < 200) {
      return text.substring(0, breakPoint + 1)
    }
    // Fallback: cut at 150 chars
    if (text.length > 150) {
      return text.substring(0, 150).trim() + '...'
    }
    return text
  }

  const previewText = getPreviewText(fullText)
  const hasMoreContent = fullText.length > previewText.length

  // Key metrics from research
  const keyMetrics = companyResearch.key_metrics || [
    { label: 'Industry', value: 'Business Services' },
    { label: 'Market Position', value: companyResearch.industry_position || 'Established Player' }
  ]

  return (
    <section className="py-8 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 border border-blue-500/20 rounded-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-blue-500/10">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-7 h-7 text-blue-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-[hsl(var(--foreground))]">
                      About {companyName}
                    </h3>
                    <span className="px-2 py-0.5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 text-xs font-medium rounded-full border border-blue-500/20">
                      AI Researched
                    </span>
                  </div>
                  <p className="text-sm text-[hsl(var(--foreground-muted))] flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-500" />
                    Real-time intelligence gathered by AIzYantra
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Main Analysis Text */}
            <div className="mb-6">
              <p className="text-[hsl(var(--foreground-muted))] leading-relaxed">
                {expanded ? fullText : previewText}
              </p>
              
              {hasMoreContent && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="mt-3 inline-flex items-center gap-1 text-blue-500 hover:text-blue-600 font-medium text-sm transition-colors"
                >
                  {expanded ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Read Full Analysis
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Key Metrics Grid */}
            {keyMetrics.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {keyMetrics.slice(0, 4).map((metric: any, index: number) => (
                  <div 
                    key={index}
                    className="bg-[hsl(var(--bg-secondary))]/50 rounded-lg p-3 border border-[hsl(var(--border))]"
                  >
                    <p className="text-xs text-[hsl(var(--foreground-muted))] mb-1">{metric.label}</p>
                    <p className="text-sm font-semibold text-[hsl(var(--foreground))]">{metric.value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Market Position & Strengths Preview */}
            <div className="flex flex-wrap gap-2">
              {companyResearch.industry_position && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 text-green-600 text-sm rounded-full border border-green-500/20">
                  <Activity className="w-3 h-3" />
                  {companyResearch.industry_position}
                </span>
              )}
              {companyResearch.strengths?.slice(0, 2).map((strength: string, index: number) => (
                <span 
                  key={index}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-600 text-sm rounded-full border border-blue-500/20"
                >
                  <Star className="w-3 h-3" />
                  {strength.length > 40 ? strength.substring(0, 40) + '...' : strength}
                </span>
              ))}
            </div>
          </div>

          {/* Footer - Expanded Content */}
          {expanded && companyResearch.strengths && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-6 pb-6 border-t border-blue-500/10 pt-4"
            >
              <h4 className="font-semibold text-[hsl(var(--foreground))] mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" />
                Key Strengths Identified
              </h4>
              <div className="grid md:grid-cols-2 gap-3">
                {companyResearch.strengths.map((strength: string, index: number) => (
                  <div 
                    key={index}
                    className="flex items-start gap-2 p-3 bg-[hsl(var(--bg-secondary))]/50 rounded-lg"
                  >
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-[hsl(var(--foreground-muted))]">{strength}</span>
                  </div>
                ))}
              </div>

              {/* Competitors & AI Opportunities */}
              {(companyResearch.competitors || companyResearch.ai_readiness_signals) && (
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  {companyResearch.competitors && (
                    <div>
                      <h4 className="font-semibold text-[hsl(var(--foreground))] mb-2 text-sm">
                        Competitive Landscape
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {companyResearch.competitors.slice(0, 4).map((competitor: string, index: number) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--foreground-muted))] text-xs rounded-full"
                          >
                            {competitor}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {companyResearch.ai_readiness_signals && (
                    <div>
                      <h4 className="font-semibold text-[hsl(var(--foreground))] mb-2 text-sm">
                        AI Readiness Signals
                      </h4>
                      <ul className="space-y-1">
                        {companyResearch.ai_readiness_signals.slice(0, 3).map((signal: string, index: number) => (
                          <li key={index} className="text-xs text-[hsl(var(--foreground-muted))] flex items-start gap-1.5">
                            <Sparkles className="w-3 h-3 text-purple-500 mt-0.5 flex-shrink-0" />
                            {signal}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  )
}

function ResultsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const assessmentId = searchParams.get('id')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [assessment, setAssessment] = useState<any>(null)
  const [responses, setResponses] = useState<any[]>([])
  const [downloading, setDownloading] = useState(false)

  // Handle PDF Download
  const handleDownloadPDF = async () => {
    if (!assessmentId) return
    
    setDownloading(true)
    try {
      const response = await fetch(`/api/assessment/report?id=${assessmentId}`)
      
      if (!response.ok) {
        throw new Error('Failed to generate report')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `AI-Readiness-Report-${assessment?.company_name?.replace(/[^a-z0-9]/gi, '-') || 'Report'}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Download failed:', err)
      alert('Failed to download report. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  // Handle Share Results
  const handleShare = async () => {
    const shareUrl = window.location.href
    const shareText = `Check out my AI Readiness Assessment results from AIzYantra! Score: ${assessment?.overall_score}/100`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI Readiness Assessment Results',
          text: shareText,
          url: shareUrl,
        })
      } catch (err) {
        // User cancelled or share failed
        copyToClipboard(shareUrl)
      }
    } else {
      copyToClipboard(shareUrl)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Link copied to clipboard!')
  }

  useEffect(() => {
    async function loadResults() {
      if (!assessmentId) {
        setError('No assessment ID provided')
        setLoading(false)
        return
      }

      try {
        const supabase = createClient()

        // Fetch assessment
        const { data: assessmentData, error: assessmentError } = await supabase
          .from('ai_assessments')
          .select('*')
          .eq('id', assessmentId)
          .single()

        if (assessmentError) throw assessmentError
        if (!assessmentData) throw new Error('Assessment not found')

        setAssessment(assessmentData)

        // Fetch responses
        const { data: responsesData } = await supabase
          .from('assessment_responses')
          .select('*')
          .eq('assessment_id', assessmentId)

        setResponses(responsesData || [])
        setLoading(false)

      } catch (err: any) {
        console.error('Error loading results:', err)
        setError(err.message || 'Failed to load results')
        setLoading(false)
      }
    }

    loadResults()
  }, [assessmentId])

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--bg-primary))] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-[hsl(var(--foreground-muted))]">Loading your results...</p>
        </div>
      </div>
    )
  }

  if (error || !assessment) {
    return (
      <div className="min-h-screen bg-[hsl(var(--bg-primary))] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-2">Results Not Found</h1>
          <p className="text-[hsl(var(--foreground-muted))] mb-6">
            {error || 'We couldn\'t find your assessment results.'}
          </p>
          <Link
            href="/ai-assessment"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
          >
            Start New Assessment
          </Link>
        </div>
      </div>
    )
  }

  const tier = assessment.tier || 'quick'
  const config = tierConfig[tier as keyof typeof tierConfig]
  const TierIcon = config.icon

  const overallScore = assessment.overall_score || 0
  const dimensionScores = assessment.dimension_scores || {}
  const maturityLevel = assessment.maturity_level || 'AI Newcomer'
  const maturity = maturityConfig[maturityLevel] || maturityConfig['AI Newcomer']
  const MaturityIcon = maturity.icon

  // Get company research data from assessment
  const companyResearch = assessment.company_research_data || null

  const strengths = getStrengths(dimensionScores, companyResearch)
  const improvementAreas = getImprovementAreas(dimensionScores)
  const recommendations = getRecommendations(overallScore, dimensionScores)

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(var(--bg-primary))] to-[hsl(var(--bg-secondary))]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
        <div className="max-w-6xl mx-auto px-6 py-16 relative">
          {/* Success Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="text-green-600 font-medium">Assessment Complete</span>
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-[hsl(var(--foreground))] mb-4">
              Your AI Readiness Results
            </h1>
            <p className="text-xl text-[hsl(var(--foreground-muted))]">
              {assessment.company_name} • {config.name} Assessment
            </p>
          </motion.div>

          {/* Score Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-3xl p-8 shadow-xl">
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Score Circle */}
                <div className="relative">
                  <svg className="w-40 h-40 transform -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      className="text-[hsl(var(--bg-tertiary))]"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="url(#scoreGradient)"
                      strokeWidth="12"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${overallScore * 4.4} 440`}
                    />
                    <defs>
                      <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#8B5CF6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-bold text-[hsl(var(--foreground))]">{overallScore}</span>
                    <span className="text-sm text-[hsl(var(--foreground-muted))]">out of 100</span>
                  </div>
                </div>

                {/* Maturity Level */}
                <div className="flex-1 text-center md:text-left">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${maturity.gradient} text-white mb-4`}>
                    <MaturityIcon className="w-5 h-5" />
                    <span className="font-semibold">{maturityLevel}</span>
                  </div>
                  <p className="text-lg text-[hsl(var(--foreground))] mb-2">
                    {maturity.description}
                  </p>
                  <p className="text-sm text-[hsl(var(--foreground-muted))]">
                    Based on {responses.length} responses across {Object.keys(dimensionScores).length} dimensions
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Company Overview from AI Research - Enhanced */}
      {companyResearch && (
        <CompanyResearchSection 
          companyName={assessment.company_name}
          companyResearch={companyResearch}
        />
      )}

      {/* Dimension Scores */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-2 text-center">
            Dimension Breakdown
          </h2>
          <p className="text-[hsl(var(--foreground-muted))] mb-8 text-center">
            Compared to {assessment.industry || 'industry'} benchmarks
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(dimensionScores).map(([dimension, score], index) => {
              const DimIcon = dimensionIcons[dimension] || Target
              const numScore = score as number
              const benchmarks = industryBenchmarks[assessment.industry] || industryBenchmarks['default']
              const benchmark = benchmarks[dimension] || 45
              const diff = numScore - benchmark
              
              return (
                <motion.div
                  key={dimension}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-xl p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <DimIcon className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-[hsl(var(--foreground))] text-sm">{dimension}</h3>
                    </div>
                    <span className="text-2xl font-bold text-[hsl(var(--foreground))]">{numScore}</span>
                  </div>
                  <div className="h-3 bg-[hsl(var(--bg-tertiary))] rounded-full overflow-hidden mb-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${numScore}%` }}
                      transition={{ delay: 0.3 + 0.1 * index, duration: 0.5 }}
                      className={`h-full rounded-full ${
                        numScore >= 70 ? 'bg-green-500' : numScore >= 40 ? 'bg-blue-500' : 'bg-amber-500'
                      }`}
                    />
                  </div>
                  {/* Benchmark comparison */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[hsl(var(--foreground-muted))]">
                      Industry avg: {benchmark}
                    </span>
                    <span className={`font-medium ${
                      diff > 5 ? 'text-green-500' : diff < -5 ? 'text-amber-500' : 'text-[hsl(var(--foreground-muted))]'
                    }`}>
                      {diff > 0 ? '+' : ''}{diff} pts {diff > 5 ? '↑' : diff < -5 ? '↓' : ''}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Strengths */}
      <section className="py-16 px-6 bg-[hsl(var(--bg-secondary))]">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Star className="w-6 h-6 text-amber-500" />
            <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">
              Your Strengths
            </h2>
            {companyResearch && (
              <span className="px-2 py-1 bg-blue-500/10 text-blue-600 text-xs font-medium rounded-full">
                AI-Researched
              </span>
            )}
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {strengths.map((strength, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`rounded-xl p-6 ${
                  strength.source === 'research' 
                    ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20'
                    : 'bg-green-500/10 border border-green-500/20'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    strength.source === 'research' ? 'bg-blue-500/20' : 'bg-green-500/20'
                  }`}>
                    {strength.source === 'research' ? (
                      <Sparkles className="w-5 h-5 text-blue-500" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-[hsl(var(--foreground))]">{strength.dimension}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        strength.source === 'research' 
                          ? 'bg-blue-500/10 text-blue-600' 
                          : 'bg-green-500/10 text-green-600'
                      }`}>
                        {strength.source === 'research' ? 'AI Research' : 'Assessment'}
                      </span>
                    </div>
                    <p className="text-[hsl(var(--foreground-muted))]">{strength.message}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Improvement Areas - 5 Focus Areas */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-4">
            Areas for AI-Powered Improvement
          </h2>
          <p className="text-[hsl(var(--foreground-muted))] mb-8">
            Focus on these 5 key areas for maximum business impact
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {improvementAreas.map((area, index) => {
              const AreaIcon = area.icon
              return (
                <motion.div
                  key={area.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-xl p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                      <AreaIcon className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[hsl(var(--foreground))]">{area.label}</h3>
                      <p className="text-sm text-[hsl(var(--foreground-muted))]">
                        {area.potential}% improvement potential
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-[hsl(var(--foreground-muted))]">{area.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* AIzYantra Recommendations */}
      <section className="py-16 px-6 bg-gradient-to-b from-[hsl(var(--bg-secondary))] to-[hsl(var(--bg-primary))]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-4">
              Personalized AIzYantra Recommendations
            </h2>
            <p className="text-[hsl(var(--foreground-muted))] max-w-2xl mx-auto">
              Based on your assessment, here's our tailored roadmap to accelerate your AI transformation
            </p>
          </div>

          <div className="space-y-6">
            {recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`bg-[hsl(var(--bg-secondary))] border rounded-2xl p-6 ${
                  rec.color === 'green' 
                    ? 'border-green-500/30' 
                    : rec.color === 'blue'
                      ? 'border-blue-500/30'
                      : 'border-purple-500/30'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    rec.color === 'green'
                      ? 'bg-green-500/10'
                      : rec.color === 'blue'
                        ? 'bg-blue-500/10'
                        : 'bg-purple-500/10'
                  }`}>
                    <rec.icon className={`w-7 h-7 ${
                      rec.color === 'green'
                        ? 'text-green-500'
                        : rec.color === 'blue'
                          ? 'text-blue-500'
                          : 'text-purple-500'
                    }`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        rec.color === 'green'
                          ? 'bg-green-500/10 text-green-600'
                          : rec.color === 'blue'
                            ? 'bg-blue-500/10 text-blue-600'
                            : 'bg-purple-500/10 text-purple-600'
                      }`}>
                        {rec.tier}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-[hsl(var(--foreground-muted))]">
                        <Clock className="w-4 h-4" />
                        {rec.timeline}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-2">
                      {rec.title}
                    </h3>
                    <p className="text-[hsl(var(--foreground-muted))] mb-3">
                      {rec.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span className="text-[hsl(var(--foreground))] font-medium">{rec.impact}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Actions Bar - Moved above CTA */}
      <section className="py-8 px-6 border-y border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] mb-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 transition-all"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Download Report
                </>
              )}
            </button>
            <button 
              onClick={handleShare}
              className="flex items-center gap-2 px-6 py-3 bg-[hsl(var(--bg-tertiary))] rounded-xl font-semibold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--border))] transition-colors"
            >
              <Share2 className="w-5 h-5" />
              Share Results
            </button>
          </div>
          <Link
            href="/ai-assessment"
            className="flex items-center gap-2 text-blue-500 hover:text-blue-600 font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Take Another Assessment
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 pb-40 mb-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Transform Your Business with AI?
            </h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Let's discuss how AIzYantra can help you implement these recommendations and achieve measurable results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-white/90 transition-colors"
              >
                <Calendar className="w-5 h-5" />
                Schedule Free Consultation
              </Link>
              <a
                href="tel:+919876543210"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 border border-white/20 rounded-xl font-semibold hover:bg-white/20 transition-colors"
              >
                <Phone className="w-5 h-5" />
                Call Now
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[hsl(var(--bg-primary))] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    }>
      <ResultsContent />
    </Suspense>
  )
}