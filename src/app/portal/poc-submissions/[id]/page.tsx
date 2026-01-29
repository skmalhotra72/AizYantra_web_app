'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft,
  Lightbulb,
  Target,
  TrendingUp,
  Briefcase,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  BarChart3,
  Calendar
} from 'lucide-react'

interface Submission {
  id: string
  submission_code: string
  status: string
  idea_title: string
  idea_description: string
  problem_statement: string | null
  target_market: string | null
  unique_value_proposition: string | null
  business_model: string | null
  idea_id: string | null
  created_at: string
}

interface EvaluationStage {
  id: string
  stage_number: number
  stage_name: string
  status: string
  score: number | null
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

export default function POCSubmissionDetailPage() {
  const params = useParams()
  const submissionId = params.id as string

  const [submission, setSubmission] = useState<Submission | null>(null)
  const [evaluationStages, setEvaluationStages] = useState<EvaluationStage[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [submissionId])

  const loadData = async () => {
    const supabase = createClient()
    
    // Get submission
    const { data: submissionData, error: submissionError } = await supabase
      .from('poc_submissions')
      .select('*')
      .eq('id', submissionId)
      .single()

    if (!submissionError && submissionData) {
      setSubmission(submissionData)

      // Get evaluation stages if idea_id exists
      if (submissionData.idea_id) {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--bg-primary))] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[hsl(var(--accent-primary))] animate-spin" />
      </div>
    )
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-[hsl(var(--bg-primary))] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-[hsl(var(--foreground))]">Submission not found</p>
        </div>
      </div>
    )
  }

  const StatusIcon = statusConfig[submission.status]?.icon || AlertCircle
  const statusColor = statusConfig[submission.status]?.color || 'bg-gray-500/10 text-gray-500'

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-primary))]">
      {/* Header */}
      <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary))]">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Link 
            href="/portal/poc-submissions"
            className="inline-flex items-center gap-2 text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--foreground))] mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Submissions
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">{submission.idea_title}</h1>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${statusColor}`}>
                  <StatusIcon className="w-4 h-4" />
                  {submission.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-[hsl(var(--foreground-muted))] font-mono">{submission.submission_code}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Evaluation Progress */}
        {evaluationStages.length > 0 && (
          <div className="card-bordered p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-[hsl(var(--accent-primary))]" />
              <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Evaluation Progress</h2>
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
                        {stage.completed_at && (
                          <div className="text-xs text-[hsl(var(--foreground-muted))] mt-0.5">
                            Completed: {new Date(stage.completed_at).toLocaleDateString('en-IN')}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {stage.score !== null && (
                        <div className="text-right">
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
          </div>
        )}

        {/* Idea Details */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card-bordered p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-[hsl(var(--accent-primary))]" />
              <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Idea Description</h2>
            </div>
            <p className="text-[hsl(var(--foreground-muted))] whitespace-pre-wrap">{submission.idea_description}</p>
          </div>

          {submission.problem_statement && (
            <div className="card-bordered p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-[hsl(var(--accent-primary))]" />
                <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Problem Statement</h2>
              </div>
              <p className="text-[hsl(var(--foreground-muted))] whitespace-pre-wrap">{submission.problem_statement}</p>
            </div>
          )}

          {submission.target_market && (
            <div className="card-bordered p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-[hsl(var(--accent-primary))]" />
                <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Target Market</h2>
              </div>
              <p className="text-[hsl(var(--foreground-muted))] whitespace-pre-wrap">{submission.target_market}</p>
            </div>
          )}

          {submission.unique_value_proposition && (
            <div className="card-bordered p-6">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-[hsl(var(--accent-primary))]" />
                <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Value Proposition</h2>
              </div>
              <p className="text-[hsl(var(--foreground-muted))] whitespace-pre-wrap">{submission.unique_value_proposition}</p>
            </div>
          )}
        </div>

        {/* Status Messages */}
        {submission.status === 'submitted' && (
          <div className="card-bordered p-6 bg-blue-500/5 border-blue-500/20">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-[hsl(var(--foreground))] mb-1">Submission Received</h3>
                <p className="text-[hsl(var(--foreground-muted))]">
                  Your idea has been submitted successfully! Our team will review it and start the evaluation process soon.
                </p>
              </div>
            </div>
          </div>
        )}

        {submission.status === 'under_review' && (
          <div className="card-bordered p-6 bg-yellow-500/5 border-yellow-500/20">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-[hsl(var(--foreground))] mb-1">Evaluation In Progress</h3>
                <p className="text-[hsl(var(--foreground-muted))]">
                  Your idea is currently being evaluated by our AI systems. Check back soon for updates!
                </p>
              </div>
            </div>
          </div>
        )}

        {submission.status === 'approved' && (
          <div className="card-bordered p-6 bg-green-500/5 border-green-500/20">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-[hsl(var(--foreground))] mb-1">Congratulations! 🎉</h3>
                <p className="text-[hsl(var(--foreground-muted))]">
                  Your idea has been approved! Our team will reach out to you shortly to discuss next steps.
                </p>
              </div>
            </div>
          </div>
        )}

        {submission.status === 'rejected' && (
          <div className="card-bordered p-6 bg-red-500/5 border-red-500/20">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-[hsl(var(--foreground))] mb-1">Not Selected</h3>
                <p className="text-[hsl(var(--foreground-muted))]">
                  Thank you for your submission. Unfortunately, we won't be able to move forward with this idea at this time. We encourage you to submit new ideas in the future!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}