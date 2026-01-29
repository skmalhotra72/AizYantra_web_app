'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Globe,
  Calendar,
  Users,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  Lightbulb,
  Target,
  Briefcase,
  DollarSign,
  Loader2,
  AlertCircle,
  ExternalLink,
  PlayCircle,
  BarChart3
} from 'lucide-react'

interface Submission {
  id: string
  submission_code: string
  status: string
  founder_name: string
  founder_email: string
  founder_phone: string | null
  company_name: string | null
  company_website: string | null
  idea_title: string
  idea_description: string
  problem_statement: string | null
  target_market: string | null
  competitors: string | null
  unique_value_proposition: string | null
  business_model: string | null
  tech_stack: string[] | null
  team_size: number | null
  current_stage: string | null
  funding_raised: number | null
  ai_score_overall: number | null
  idea_id: string | null
  created_at: string
}

interface EvaluationStage {
  id: string
  stage_number: number
  stage_name: string
  status: string
  model_used: string | null
  score: number | null
  started_at: string | null
  completed_at: string | null
}

const statusConfig: Record<string, { color: string; icon: any }> = {
  submitted: { color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: Clock },
  under_review: { color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', icon: Clock },
  approved: { color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: CheckCircle2 },
  rejected: { color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: XCircle },
}

const stageStatusConfig: Record<string, { color: string; icon: any }> = {
  pending: { color: 'bg-gray-500/10 text-gray-500 border-gray-500/20', icon: Clock },
  processing: { color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: Loader2 },
  completed: { color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: CheckCircle2 },
  failed: { color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: XCircle },
}

export default function SubmissionDetailPage() {
  const router = useRouter()
  const params = useParams()
  const submissionId = params.id as string

  const [submission, setSubmission] = useState<Submission | null>(null)
  const [evaluationStages, setEvaluationStages] = useState<EvaluationStage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [error, setError] = useState('')

  const fetchData = async () => {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('poc_submissions')
      .select('*')
      .eq('id', submissionId)
      .single()

    if (error) {
      console.error('Error fetching submission:', error)
      setError('Failed to load submission')
    } else if (data) {
      setSubmission(data)

      // Fetch evaluation stages if idea_id exists
      if (data.idea_id) {
        const { data: stages } = await supabase
          .from('i2e_evaluation_stages')
          .select('*')
          .eq('submission_id', submissionId)
          .order('stage_number', { ascending: true })

        if (stages) {
          setEvaluationStages(stages)
        }
      }
    }

    setIsLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [submissionId])

  const updateStatus = async (newStatus: string) => {
    if (!submission) return

    setIsUpdating(true)
    setError('')

    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('poc_submissions')
        .update({ 
          status: newStatus,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', submission.id)

      if (error) throw error

      setSubmission({ ...submission, status: newStatus })
      alert(`Submission ${newStatus === 'approved' ? 'approved' : 'rejected'} successfully!`)
      
    } catch (err: any) {
      setError(err.message || 'Failed to update status')
    } finally {
      setIsUpdating(false)
    }
  }

  const startEvaluation = async () => {
    if (!submission) return

    setIsEvaluating(true)
    setError('')

    try {
      const response = await fetch('/api/poc/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId: submission.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Evaluation failed')
      }

      alert('Evaluation pipeline started! Click "View in I2E System" to run evaluations.')
      
      // Refresh data
      await fetchData()
      
    } catch (err: any) {
      setError(err.message || 'Failed to start evaluation')
    } finally {
      setIsEvaluating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--bg-primary))] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[hsl(var(--accent-primary))] animate-spin mx-auto mb-4" />
          <p className="text-[hsl(var(--foreground-muted))]">Loading submission...</p>
        </div>
      </div>
    )
  }

  if (error && !submission) {
    return (
      <div className="min-h-screen bg-[hsl(var(--bg-primary))] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-[hsl(var(--foreground))] mb-4">{error}</p>
          <Link href="/admin/poc/submissions" className="text-[hsl(var(--accent-primary))] hover:underline">
            Back to Submissions
          </Link>
        </div>
      </div>
    )
  }

  const StatusIcon = statusConfig[submission!.status]?.icon || AlertCircle
  const statusColor = statusConfig[submission!.status]?.color || 'bg-gray-500/10 text-gray-500'

  const showEvaluationButton = submission!.status === 'submitted' && evaluationStages.length === 0

  // Only show approval buttons after all 5 evaluation stages are completed
  const allStagesCompleted = evaluationStages.length === 5 && 
    evaluationStages.every(stage => stage.status === 'completed')

  const showApprovalButtons = (submission!.status === 'under_review' && allStagesCompleted)

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-primary))]">
      {/* Header */}
      <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary))]">
        <div className="p-6">
          <Link 
            href="/admin/poc/submissions"
            className="inline-flex items-center gap-2 text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--foreground))] mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Submissions
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">{submission!.idea_title}</h1>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${statusColor}`}>
                  <StatusIcon className="w-4 h-4" />
                  {submission!.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-[hsl(var(--foreground-muted))] font-mono">{submission!.submission_code}</p>
            </div>
            <div className="flex gap-3">
              {/* Start Evaluation Button */}
              {showEvaluationButton && (
                <button
                  onClick={startEvaluation}
                  disabled={isEvaluating}
                  className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--accent-primary))] hover:bg-[hsl(var(--accent-primary))]/90 text-white font-medium rounded-lg transition-all disabled:opacity-50"
                >
                  {isEvaluating ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
                  Start I2E Evaluation
                </button>
              )}
              
              {/* View in I2E System Button - NEW */}
              {submission!.idea_id && (
                <Link
                  href={`/crm/innovation/ideas/${submission!.idea_id}`}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition-all"
                >
                  <BarChart3 className="w-4 h-4" />
                  View in I2E System
                </Link>
              )}
              
              {/* Approval Buttons */}
              {showApprovalButtons && (
                <>
                  <button
                    onClick={() => updateStatus('rejected')}
                    disabled={isUpdating}
                    className="flex items-center gap-2 px-4 py-2 border border-red-500/20 hover:bg-red-500/10 text-red-500 font-medium rounded-lg transition-all disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                  <button
                    onClick={() => updateStatus('approved')}
                    disabled={isUpdating}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-all disabled:opacity-50"
                  >
                    {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Approve
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Evaluation Stages Progress */}
        {evaluationStages.length > 0 && (
          <div className="card-bordered p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[hsl(var(--accent-primary))]" />
                <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">I2E Evaluation Progress</h2>
              </div>
              {submission!.idea_id && (
                <Link
                  href={`/crm/innovation/ideas/${submission!.idea_id}`}
                  className="text-sm text-[hsl(var(--accent-primary))] hover:underline flex items-center gap-1"
                >
                  Open Full I2E Interface
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>
            <div className="space-y-4">
              {evaluationStages.map((stage) => {
                const StageStatusIcon = stageStatusConfig[stage.status]?.icon || Clock
                const stageStatusColor = stageStatusConfig[stage.status]?.color || 'bg-gray-500/10 text-gray-500'
                
                return (
                  <div key={stage.id} className="flex items-center justify-between p-4 bg-[hsl(var(--bg-secondary))] rounded-lg">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stageStatusColor} border`}>
                        <span className="font-bold">{stage.stage_number}</span>
                      </div>
                      <div>
                        <div className="font-medium text-[hsl(var(--foreground))]">{stage.stage_name}</div>
                        <div className="text-xs text-[hsl(var(--foreground-muted))] mt-0.5">
                          Model: {stage.model_used || 'Not assigned'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {stage.score !== null && (
                        <div className="text-right">
                          <div className="text-xs text-[hsl(var(--foreground-muted))]">Score</div>
                          <div className="text-lg font-bold text-[hsl(var(--accent-primary))]">{stage.score.toFixed(1)}</div>
                        </div>
                      )}
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${stageStatusColor}`}>
                        <StageStatusIcon className={`w-3.5 h-3.5 ${stage.status === 'processing' ? 'animate-spin' : ''}`} />
                        {stage.status}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
            
            {/* Helper Text */}
            <div className="mt-4 p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg">
              <p className="text-sm text-[hsl(var(--foreground-muted))]">
                💡 <strong>Tip:</strong> Click "View in I2E System" above to run each evaluation stage and see detailed results.
              </p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Idea Description */}
            <div className="card-bordered p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-[hsl(var(--accent-primary))]" />
                <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Idea Description</h2>
              </div>
              <p className="text-[hsl(var(--foreground-muted))] whitespace-pre-wrap">{submission!.idea_description}</p>
            </div>

            {/* Problem Statement */}
            {submission!.problem_statement && (
              <div className="card-bordered p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-[hsl(var(--accent-primary))]" />
                  <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Problem Statement</h2>
                </div>
                <p className="text-[hsl(var(--foreground-muted))] whitespace-pre-wrap">{submission!.problem_statement}</p>
              </div>
            )}

            {/* Target Market */}
            {submission!.target_market && (
              <div className="card-bordered p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-[hsl(var(--accent-primary))]" />
                  <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Target Market</h2>
                </div>
                <p className="text-[hsl(var(--foreground-muted))] whitespace-pre-wrap">{submission!.target_market}</p>
              </div>
            )}

            {/* Unique Value Proposition */}
            {submission!.unique_value_proposition && (
              <div className="card-bordered p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className="w-5 h-5 text-[hsl(var(--accent-primary))]" />
                  <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Unique Value Proposition</h2>
                </div>
                <p className="text-[hsl(var(--foreground-muted))] whitespace-pre-wrap">{submission!.unique_value_proposition}</p>
              </div>
            )}

            {/* Business Model */}
            {submission!.business_model && (
              <div className="card-bordered p-6">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-5 h-5 text-[hsl(var(--accent-primary))]" />
                  <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Business Model</h2>
                </div>
                <p className="text-[hsl(var(--foreground-muted))] whitespace-pre-wrap">{submission!.business_model}</p>
              </div>
            )}

            {/* Competitors */}
            {submission!.competitors && (
              <div className="card-bordered p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-[hsl(var(--accent-primary))]" />
                  <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Known Competitors</h2>
                </div>
                <p className="text-[hsl(var(--foreground-muted))] whitespace-pre-wrap">{submission!.competitors}</p>
              </div>
            )}
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="card-bordered p-6">
              <h2 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">Contact Information</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-[hsl(var(--foreground-muted))] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm text-[hsl(var(--foreground-muted))]">Founder</div>
                    <div className="font-medium text-[hsl(var(--foreground))]">{submission!.founder_name}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[hsl(var(--foreground-muted))] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm text-[hsl(var(--foreground-muted))]">Email</div>
                    <a href={`mailto:${submission!.founder_email}`} className="font-medium text-[hsl(var(--accent-primary))] hover:underline">
                      {submission!.founder_email}
                    </a>
                  </div>
                </div>
                {submission!.founder_phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-[hsl(var(--foreground-muted))] flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm text-[hsl(var(--foreground-muted))]">Phone</div>
                      <a href={`tel:${submission!.founder_phone}`} className="font-medium text-[hsl(var(--accent-primary))] hover:underline">
                        {submission!.founder_phone}
                      </a>
                    </div>
                  </div>
                )}
                {submission!.company_name && (
                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-[hsl(var(--foreground-muted))] flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm text-[hsl(var(--foreground-muted))]">Company</div>
                      <div className="font-medium text-[hsl(var(--foreground))]">{submission!.company_name}</div>
                    </div>
                  </div>
                )}
                {submission!.company_website && (
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-[hsl(var(--foreground-muted))] flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm text-[hsl(var(--foreground-muted))]">Website</div>
                      <a href={submission!.company_website} target="_blank" rel="noopener noreferrer" className="font-medium text-[hsl(var(--accent-primary))] hover:underline inline-flex items-center gap-1">
                        {submission!.company_website}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Technical Details */}
            <div className="card-bordered p-6">
              <h2 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">Technical Details</h2>
              <div className="space-y-4">
                {submission!.current_stage && (
                  <div>
                    <div className="text-sm text-[hsl(var(--foreground-muted))] mb-1">Current Stage</div>
                    <div className="px-3 py-1 bg-[hsl(var(--bg-secondary))] rounded text-sm font-medium text-[hsl(var(--foreground))] capitalize inline-block">
                      {submission!.current_stage.replace('_', ' ')}
                    </div>
                  </div>
                )}
                {submission!.team_size !== null && (
                  <div>
                    <div className="text-sm text-[hsl(var(--foreground-muted))] mb-1">Team Size</div>
                    <div className="font-medium text-[hsl(var(--foreground))]">{submission!.team_size} members</div>
                  </div>
                )}
                {submission!.funding_raised !== null && (
                  <div>
                    <div className="text-sm text-[hsl(var(--foreground-muted))] mb-1">Funding Raised</div>
                    <div className="font-medium text-[hsl(var(--foreground))]">₹{submission!.funding_raised.toLocaleString('en-IN')}</div>
                  </div>
                )}
                {submission!.tech_stack && submission!.tech_stack.length > 0 && (
                  <div>
                    <div className="text-sm text-[hsl(var(--foreground-muted))] mb-2">Tech Stack</div>
                    <div className="flex flex-wrap gap-2">
                      {submission!.tech_stack.map((tech, idx) => (
                        <span key={idx} className="px-2 py-1 bg-[hsl(var(--bg-secondary))] rounded text-xs font-medium text-[hsl(var(--foreground))]">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submission Info */}
            <div className="card-bordered p-6">
              <h2 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">Submission Info</h2>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-[hsl(var(--foreground-muted))] mb-1">Submitted</div>
                  <div className="font-medium text-[hsl(var(--foreground))]">
                    {new Date(submission!.created_at).toLocaleDateString('en-IN', { 
                      month: 'long', 
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                {submission!.idea_id && (
                  <div>
                    <div className="text-sm text-[hsl(var(--foreground-muted))] mb-1">Linked to I2E</div>
                    <Link 
                      href={`/crm/innovation/ideas/${submission!.idea_id}`}
                      className="font-medium text-green-500 text-xs font-mono hover:underline flex items-center gap-1"
                    >
                      {submission!.idea_id}
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}