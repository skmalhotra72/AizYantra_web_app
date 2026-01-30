'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  ArrowRight, ArrowLeft, Loader2, CheckCircle2, Clock, 
  Zap, BarChart3, Brain, HelpCircle, Sparkles, AlertCircle,
  MessageSquare, ChevronRight, Lightbulb, Target, Save,
  BrainCircuit, Building2, Users, TrendingUp, PieChart, X, Send
} from 'lucide-react'
import { getQuestionsForTier, getDimensions, AssessmentQuestion } from '@/lib/assessment/questions'

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

// Dimension icons
const dimensionIcons: Record<string, any> = {
  'Customer Experience': Users,
  'Operational Efficiency': Target,
  'Data & Decisions': PieChart,
  'Growth & Business Development': TrendingUp,
  'Team Productivity': Zap,
  'Technology Readiness': BrainCircuit,
  'Strategic': Lightbulb,
}

interface AssessmentData {
  id: string
  tier: 'quick' | 'complete' | 'advanced'
  company_name: string
  industry: string
  company_size: string
  full_name: string
  email: string
}

interface Response {
  questionId: string
  value: any
  score: number
  timeSpent: number
}

interface FollowUp {
  id: string
  question: string
  dimension: string
  type: string
}

function AssessmentFlowContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const assessmentId = searchParams.get('id')

  // State
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [assessment, setAssessment] = useState<AssessmentData | null>(null)
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, Response>>({})
  const [selectedValue, setSelectedValue] = useState<any>(null)
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now())
  const [showInsight, setShowInsight] = useState(false)

  // Follow-up state
  const [showFollowUp, setShowFollowUp] = useState(false)
  const [currentFollowUp, setCurrentFollowUp] = useState<FollowUp | null>(null)
  const [followUpResponse, setFollowUpResponse] = useState('')
  const [savingFollowUp, setSavingFollowUp] = useState(false)
  const [followUpCount, setFollowUpCount] = useState(0)

  // Derived state
  const currentQuestion = questions[currentIndex]
  const isLastQuestion = currentIndex === questions.length - 1
  const progress = questions.length > 0 ? Math.round(((currentIndex + 1) / questions.length) * 100) : 0

  // Load assessment data
  useEffect(() => {
    async function loadAssessment() {
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

        setAssessment(assessmentData as AssessmentData)

        // Load questions for this tier
        const tierQuestions = getQuestionsForTier(assessmentData.tier)
        setQuestions(tierQuestions)

        // Load existing responses
        const { data: existingResponses } = await supabase
          .from('assessment_responses')
          .select('*')
          .eq('assessment_id', assessmentId)

        if (existingResponses && existingResponses.length > 0) {
          const responsesMap: Record<string, Response> = {}
          existingResponses.forEach(r => {
            responsesMap[r.question_id] = {
              questionId: r.question_id,
              value: r.response_value,
              score: r.score || 0,
              timeSpent: r.time_spent_seconds || 0
            }
          })
          setResponses(responsesMap)

          // Resume from last answered question
          const lastAnsweredIndex = tierQuestions.findIndex(q => !responsesMap[q.id])
          if (lastAnsweredIndex > 0) {
            setCurrentIndex(lastAnsweredIndex)
          }
        }

        // Load follow-up count
        const { count } = await supabase
          .from('ai_follow_ups')
          .select('*', { count: 'exact', head: true })
          .eq('assessment_id', assessmentId)
          .eq('status', 'answered')

        setFollowUpCount(count || 0)

        setLoading(false)
      } catch (err: any) {
        console.error('Error loading assessment:', err)
        setError(err.message || 'Failed to load assessment')
        setLoading(false)
      }
    }

    loadAssessment()
  }, [assessmentId])

  // Reset selected value when question changes
  useEffect(() => {
    if (currentQuestion) {
      const existingResponse = responses[currentQuestion.id]
      if (existingResponse) {
        setSelectedValue(existingResponse.value)
      } else {
        setSelectedValue(currentQuestion.type === 'multiple_choice' ? [] : null)
      }
      setQuestionStartTime(Date.now())
    }
  }, [currentIndex, currentQuestion, responses])

  // Calculate score for current answer
  const calculateScore = () => {
    if (!currentQuestion || selectedValue === null) return 0

    if (currentQuestion.type === 'single_choice') {
      const option = currentQuestion.options?.find(o => o.value === selectedValue)
      return option?.score || 0
    } else if (currentQuestion.type === 'multiple_choice') {
      const selectedOptions = currentQuestion.options?.filter(o => 
        Array.isArray(selectedValue) && selectedValue.includes(o.value)
      )
      if (selectedOptions && selectedOptions.length > 0) {
        return Math.round(selectedOptions.reduce((sum, o) => sum + o.score, 0) / selectedOptions.length)
      }
    } else if (currentQuestion.type === 'scale') {
      return (selectedValue as number) * 20
    } else if (currentQuestion.type === 'open_text') {
      return 50 // Neutral score for open text
    }
    return 0
  }

  // Get answer text for follow-up context
  const getAnswerText = (): string => {
    if (!currentQuestion || selectedValue === null) return ''

    if (currentQuestion.type === 'single_choice') {
      const option = currentQuestion.options?.find(o => o.value === selectedValue)
      return option?.label || String(selectedValue)
    } else if (currentQuestion.type === 'multiple_choice') {
      const selectedOptions = currentQuestion.options?.filter(o => 
        Array.isArray(selectedValue) && selectedValue.includes(o.value)
      )
      return selectedOptions?.map(o => o.label).join(', ') || ''
    } else if (currentQuestion.type === 'open_text') {
      return String(selectedValue)
    }
    return String(selectedValue)
  }

  // Save response to database
  const saveResponse = async () => {
    if (!assessmentId || !currentQuestion || selectedValue === null) return false

    setSaving(true)
    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000)
    const score = calculateScore()

    try {
      const supabase = createClient()

      // Prepare the response value based on question type
      let responseValue = selectedValue
      let responseText = null

      if (currentQuestion.type === 'open_text') {
        responseText = selectedValue
      }

      // Upsert response
      const { error: saveError } = await supabase
        .from('assessment_responses')
        .upsert({
          assessment_id: assessmentId,
          question_id: currentQuestion.id,
          question_text: currentQuestion.text,
          question_type: currentQuestion.type,
          dimension: currentQuestion.dimension,
          response_value: responseValue,
          response_text: responseText,
          score: score,
          time_spent_seconds: timeSpent,
          answered_at: new Date().toISOString()
        }, {
          onConflict: 'assessment_id,question_id'
        })

      if (saveError) throw saveError

      // Update local state
      setResponses(prev => ({
        ...prev,
        [currentQuestion.id]: {
          questionId: currentQuestion.id,
          value: selectedValue,
          score,
          timeSpent
        }
      }))

      // Update assessment progress
      const newProgress = Math.round(((currentIndex + 1) / questions.length) * 100)
      await supabase
        .from('ai_assessments')
        .update({
          current_question: currentIndex + 1,
          completion_percentage: newProgress,
          last_activity_at: new Date().toISOString()
        })
        .eq('id', assessmentId)

      setSaving(false)
      return true
    } catch (err: any) {
      console.error('Error saving response:', err)
      setError('Failed to save your response. Please try again.')
      setSaving(false)
      return false
    }
  }

  // Check for follow-up question
  const checkForFollowUp = async (): Promise<boolean> => {
    if (!assessmentId || !currentQuestion) return false

    // Limit follow-ups to avoid fatigue (max 5 per assessment for quick, 10 for complete/advanced)
    const maxFollowUps = assessment?.tier === 'quick' ? 5 : 10
    if (followUpCount >= maxFollowUps) return false

    try {
      const response = await fetch('/api/assessment/followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessment_id: assessmentId,
          question_id: currentQuestion.id,
          question_text: currentQuestion.text,
          answer_value: selectedValue,
          answer_text: getAnswerText(),
          dimension: currentQuestion.dimension,
          score: calculateScore()
        })
      })

      const data = await response.json()

      if (data.success && data.has_followup && data.followup) {
        setCurrentFollowUp(data.followup)
        setShowFollowUp(true)
        return true
      }

      return false
    } catch (err) {
      console.error('Error checking for follow-up:', err)
      return false
    }
  }

  // Save follow-up response
  const saveFollowUpResponse = async () => {
    if (!currentFollowUp || !followUpResponse.trim()) {
      // Skip if empty
      setShowFollowUp(false)
      setCurrentFollowUp(null)
      setFollowUpResponse('')
      return
    }

    setSavingFollowUp(true)

    try {
      const response = await fetch('/api/assessment/followup', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          followup_id: currentFollowUp.id,
          response_text: followUpResponse.trim()
        })
      })

      if (response.ok) {
        setFollowUpCount(prev => prev + 1)
      }
    } catch (err) {
      console.error('Error saving follow-up:', err)
    }

    setSavingFollowUp(false)
    setShowFollowUp(false)
    setCurrentFollowUp(null)
    setFollowUpResponse('')
  }

  // Skip follow-up
  const skipFollowUp = () => {
    setShowFollowUp(false)
    setCurrentFollowUp(null)
    setFollowUpResponse('')
    proceedToNext()
  }

  // Proceed to next question
  const proceedToNext = () => {
    if (isLastQuestion) {
      completeAssessment()
    } else {
      setCurrentIndex(prev => prev + 1)
    }
  }

  // Handle next question
  const handleNext = async () => {
    if (selectedValue === null || (Array.isArray(selectedValue) && selectedValue.length === 0)) {
      setError('Please select an answer to continue')
      return
    }

    setError(null)
    const saved = await saveResponse()
    if (!saved) return

    // Show insight briefly
    const score = calculateScore()
    if (score > 0 && currentQuestion?.options) {
      setShowInsight(true)
      await new Promise(resolve => setTimeout(resolve, 1200))
      setShowInsight(false)
    }

    // Check for follow-up question (only for non-last questions and certain question types)
    if (!isLastQuestion && currentQuestion?.type !== 'open_text') {
      const hasFollowUp = await checkForFollowUp()
      if (hasFollowUp) {
        return // Will proceed after follow-up is answered/skipped
      }
    }

    // No follow-up, proceed directly
    proceedToNext()
  }

  // Handle previous question
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  // Complete assessment
  const completeAssessment = async () => {
    if (!assessmentId) return

    setLoading(true)
    try {
      const supabase = createClient()

      // Calculate final scores
      const dimensionScores = calculateDimensionScores()
      const overallScore = calculateOverallScore(dimensionScores)
      const maturityLevel = getMaturityLevel(overallScore)

      // Update assessment as completed
      await supabase
        .from('ai_assessments')
        .update({
          status: 'completed',
          completion_percentage: 100,
          overall_score: overallScore,
          dimension_scores: dimensionScores,
          maturity_level: maturityLevel,
          completed_at: new Date().toISOString()
        })
        .eq('id', assessmentId)

      // Redirect to results page
      router.push(`/ai-assessment/results?id=${assessmentId}`)
    } catch (err: any) {
      console.error('Error completing assessment:', err)
      setError('Failed to complete assessment. Please try again.')
      setLoading(false)
    }
  }

  // Calculate dimension scores
  const calculateDimensionScores = () => {
    const dimensions = getDimensions()
    const scores: Record<string, number> = {}

    dimensions.forEach(dim => {
      const dimQuestions = questions.filter(q => q.dimension === dim.name && q.weight > 0)
      const dimResponses = dimQuestions.map(q => responses[q.id]).filter(Boolean)
      
      if (dimResponses.length > 0) {
        const totalScore = dimResponses.reduce((sum, r) => sum + r.score, 0)
        scores[dim.name] = Math.round(totalScore / dimResponses.length)
      } else {
        scores[dim.name] = 0
      }
    })

    return scores
  }

  // Calculate overall score
  const calculateOverallScore = (dimensionScores: Record<string, number>) => {
    const dimensions = getDimensions()
    let totalWeight = 0
    let weightedSum = 0

    dimensions.forEach(dim => {
      if (dimensionScores[dim.name] !== undefined) {
        weightedSum += dimensionScores[dim.name] * dim.weight
        totalWeight += dim.weight
      }
    })

    return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0
  }

  // Get maturity level
  const getMaturityLevel = (score: number): string => {
    if (score >= 75) return 'AI Ready'
    if (score >= 50) return 'AI Curious'
    if (score >= 25) return 'AI Aware'
    return 'AI Newcomer'
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (showFollowUp) return // Disable during follow-up

      if (e.key === 'Enter' && selectedValue !== null) {
        handleNext()
      } else if (currentQuestion?.type === 'single_choice' || currentQuestion?.type === 'scale') {
        const num = parseInt(e.key)
        if (num >= 1 && num <= 5) {
          if (currentQuestion.type === 'scale') {
            setSelectedValue(num)
          } else if (currentQuestion.options && num <= currentQuestion.options.length) {
            setSelectedValue(currentQuestion.options[num - 1].value)
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [selectedValue, currentQuestion, showFollowUp])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--bg-primary))] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-[hsl(var(--foreground-muted))]">Loading your assessment...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !assessment) {
    return (
      <div className="min-h-screen bg-[hsl(var(--bg-primary))] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-2">Something went wrong</h1>
          <p className="text-[hsl(var(--foreground-muted))] mb-6">{error}</p>
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

  if (!assessment || !currentQuestion) return null

  const config = tierConfig[assessment.tier]
  const TierIcon = config.icon
  const DimensionIcon = dimensionIcons[currentQuestion.dimension] || HelpCircle

  // Get current insight based on selected answer
  const currentInsight = currentQuestion.type === 'single_choice' 
    ? currentQuestion.options?.find(o => o.value === selectedValue)?.aiOpportunity 
    : null

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(var(--bg-primary))] to-[hsl(var(--bg-secondary))]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))]/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TierIcon className="w-6 h-6" style={{ color: config.color }} />
              <div>
                <h1 className="font-semibold text-[hsl(var(--foreground))]">{config.name}</h1>
                <p className="text-sm text-[hsl(var(--foreground-muted))]">{assessment.company_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                  {currentIndex + 1} of {questions.length}
                </p>
                <p className="text-xs text-[hsl(var(--foreground-muted))]">{progress}% complete</p>
              </div>
              {/* Progress bar */}
              <div className="w-32 h-2 bg-[hsl(var(--bg-tertiary))] rounded-full overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r ${config.gradient}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Dimension badge */}
            <div className="flex items-center gap-2 mb-6">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r ${config.gradient} text-white`}>
                <DimensionIcon className="w-4 h-4" />
                {currentQuestion.dimension}
              </span>
              {followUpCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-purple-500/10 text-purple-600">
                  <MessageSquare className="w-3 h-3" />
                  {followUpCount} follow-ups answered
                </span>
              )}
            </div>

            {/* Question */}
            <h2 className="text-2xl md:text-3xl font-bold text-[hsl(var(--foreground))] mb-4">
              {currentQuestion.text}
            </h2>

            {/* Help text */}
            {currentQuestion.helpText && (
              <p className="flex items-start gap-2 text-[hsl(var(--foreground-muted))] mb-8">
                <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                {currentQuestion.helpText}
              </p>
            )}

            {/* Answer options */}
            <div className="space-y-3 mb-8">
              {currentQuestion.type === 'single_choice' && currentQuestion.options?.map((option, index) => (
                <motion.button
                  key={option.value}
                  onClick={() => setSelectedValue(option.value)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    selectedValue === option.value
                      ? `border-blue-500 bg-blue-500/10`
                      : 'border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] hover:border-blue-500/50'
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                      selectedValue === option.value
                        ? 'bg-blue-500 text-white'
                        : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--foreground-muted))]'
                    }`}>
                      {index + 1}
                    </span>
                    <span className={`flex-1 ${
                      selectedValue === option.value
                        ? 'text-[hsl(var(--foreground))] font-medium'
                        : 'text-[hsl(var(--foreground))]'
                    }`}>
                      {option.label}
                    </span>
                    {selectedValue === option.value && (
                      <CheckCircle2 className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                </motion.button>
              ))}

              {currentQuestion.type === 'multiple_choice' && currentQuestion.options?.map((option, index) => {
                const isSelected = Array.isArray(selectedValue) && selectedValue.includes(option.value)
                return (
                  <motion.button
                    key={option.value}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedValue((prev: string[]) => prev.filter(v => v !== option.value))
                      } else {
                        setSelectedValue((prev: string[]) => [...(prev || []), option.value])
                      }
                    }}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? `border-blue-500 bg-blue-500/10`
                        : 'border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] hover:border-blue-500/50'
                    }`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                        isSelected
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'border-[hsl(var(--border))]'
                      }`}>
                        {isSelected && <CheckCircle2 className="w-4 h-4" />}
                      </span>
                      <span className="flex-1 text-[hsl(var(--foreground))]">{option.label}</span>
                    </div>
                  </motion.button>
                )
              })}

              {currentQuestion.type === 'open_text' && (
                <textarea
                  value={selectedValue || ''}
                  onChange={(e) => setSelectedValue(e.target.value)}
                  placeholder="Share your thoughts..."
                  rows={4}
                  className="w-full p-4 rounded-xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-muted))] focus:outline-none focus:border-blue-500 resize-none"
                />
              )}

              {currentQuestion.type === 'scale' && (
                <div className="flex justify-between gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <motion.button
                      key={num}
                      onClick={() => setSelectedValue(num)}
                      className={`flex-1 p-4 rounded-xl border-2 text-center transition-all ${
                        selectedValue === num
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] hover:border-blue-500/50'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="text-2xl font-bold">{num}</span>
                      <p className="text-xs mt-1 opacity-70">
                        {num === 1 ? 'Strongly Disagree' : num === 5 ? 'Strongly Agree' : ''}
                      </p>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {/* AI Insight (shown briefly after selection) */}
            <AnimatePresence>
              {showInsight && currentInsight && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl"
                >
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-purple-600 mb-1">AI Opportunity Detected</p>
                      <p className="text-sm text-[hsl(var(--foreground-muted))]">{currentInsight}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="flex items-center gap-2 px-4 py-2 text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--foreground))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>

              <button
                onClick={handleNext}
                disabled={saving || selectedValue === null || (Array.isArray(selectedValue) && selectedValue.length === 0)}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${config.gradient} hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : isLastQuestion ? (
                  <>
                    See My Results
                    <Sparkles className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Keyboard hint */}
            <p className="text-center text-xs text-[hsl(var(--foreground-muted))] mt-6">
              Tip: Press <kbd className="px-1.5 py-0.5 bg-[hsl(var(--bg-tertiary))] rounded">1</kbd> - <kbd className="px-1.5 py-0.5 bg-[hsl(var(--bg-tertiary))] rounded">5</kbd> to select options, <kbd className="px-1.5 py-0.5 bg-[hsl(var(--bg-tertiary))] rounded">Enter</kbd> to continue
            </p>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Follow-up Question Modal */}
      <AnimatePresence>
        {showFollowUp && currentFollowUp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-[hsl(var(--bg-secondary))] rounded-2xl shadow-2xl border border-[hsl(var(--border))] overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-[hsl(var(--border))] bg-gradient-to-r from-purple-500/10 to-blue-500/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-purple-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[hsl(var(--foreground))]">Quick Follow-up</h3>
                      <p className="text-xs text-[hsl(var(--foreground-muted))]">Help us understand better</p>
                    </div>
                  </div>
                  <button
                    onClick={skipFollowUp}
                    className="p-2 hover:bg-[hsl(var(--bg-tertiary))] rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-[hsl(var(--foreground-muted))]" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-lg text-[hsl(var(--foreground))] mb-4">
                  {currentFollowUp.question}
                </p>

                <textarea
                  value={followUpResponse}
                  onChange={(e) => setFollowUpResponse(e.target.value)}
                  placeholder="Share your thoughts... (optional)"
                  rows={3}
                  autoFocus
                  className="w-full p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-primary))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-muted))] focus:outline-none focus:border-purple-500 resize-none"
                />

                <p className="text-xs text-[hsl(var(--foreground-muted))] mt-2">
                  Your response helps us provide more personalized recommendations
                </p>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-[hsl(var(--border))] flex items-center justify-between">
                <button
                  onClick={skipFollowUp}
                  className="px-4 py-2 text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--foreground))] transition-colors"
                >
                  Skip
                </button>

                <button
                  onClick={async () => {
                    await saveFollowUpResponse()
                    proceedToNext()
                  }}
                  disabled={savingFollowUp}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 transition-all"
                >
                  {savingFollowUp ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {followUpResponse.trim() ? 'Submit & Continue' : 'Continue'}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function AssessmentFlowPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[hsl(var(--bg-primary))] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    }>
      <AssessmentFlowContent />
    </Suspense>
  )
}