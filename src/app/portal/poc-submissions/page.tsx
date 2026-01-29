'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { 
  Lightbulb, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  TrendingUp,
  Loader2,
  AlertCircle,
  ExternalLink,
  Calendar
} from 'lucide-react'

interface Submission {
  id: string
  submission_code: string
  status: string
  idea_title: string
  idea_description: string
  founder_email: string
  idea_id: string | null
  created_at: string
  ai_score_overall: number | null
}

const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
  submitted: { color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: Clock, label: 'Submitted' },
  under_review: { color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', icon: TrendingUp, label: 'Under Review' },
  approved: { color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: CheckCircle2, label: 'Approved' },
  rejected: { color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: XCircle, label: 'Rejected' },
}

export default function POCSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    loadSubmissions()
  }, [])

  const loadSubmissions = async () => {
    const supabase = createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    setUserEmail(user.email || null)

    // Get submissions for this user's email
    const { data, error } = await supabase
      .from('poc_submissions')
      .select('*')
      .eq('founder_email', user.email)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setSubmissions(data)
    }

    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--bg-primary))] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[hsl(var(--accent-primary))] animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-primary))]">
      {/* Header */}
      <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary))]">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-2">My POC Submissions</h1>
              <p className="text-[hsl(var(--foreground-muted))]">Track the progress of your submitted ideas</p>
            </div>
            <Link
              href="/poc/submit"
              className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--accent-primary))] hover:bg-[hsl(var(--accent-primary))]/90 text-white font-medium rounded-lg transition-all"
            >
              <Lightbulb className="w-4 h-4" />
              Submit New Idea
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {submissions.length === 0 ? (
          <div className="text-center py-16">
            <Lightbulb className="w-16 h-16 text-[hsl(var(--foreground-muted))] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-2">No submissions yet</h3>
            <p className="text-[hsl(var(--foreground-muted))] mb-6">Ready to submit your first idea?</p>
            <Link
              href="/poc/submit"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[hsl(var(--accent-primary))] hover:bg-[hsl(var(--accent-primary))]/90 text-white font-medium rounded-lg transition-all"
            >
              <Lightbulb className="w-4 h-4" />
              Submit Your First Idea
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {submissions.map((submission) => {
              const StatusIcon = statusConfig[submission.status]?.icon || AlertCircle
              const statusColor = statusConfig[submission.status]?.color || 'bg-gray-500/10 text-gray-500'
              const statusLabel = statusConfig[submission.status]?.label || submission.status

              return (
                <Link
                  key={submission.id}
                  href={`/portal/poc-submissions/${submission.id}`}
                  className="card-bordered p-6 hover:border-[hsl(var(--accent-primary))] transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--accent-primary))] transition-colors">
                          {submission.idea_title}
                        </h3>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${statusColor}`}>
                          <StatusIcon className="w-4 h-4" />
                          {statusLabel}
                        </span>
                      </div>
                      <p className="text-sm font-mono text-[hsl(var(--foreground-muted))]">{submission.submission_code}</p>
                    </div>
                    <ExternalLink className="w-5 h-5 text-[hsl(var(--foreground-muted))] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <p className="text-[hsl(var(--foreground-muted))] mb-4 line-clamp-2">
                    {submission.idea_description}
                  </p>

                  <div className="flex items-center gap-6 text-sm text-[hsl(var(--foreground-muted))]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(submission.created_at).toLocaleDateString('en-IN', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    {submission.ai_score_overall !== null && (
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Score: {submission.ai_score_overall.toFixed(1)}/10
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}