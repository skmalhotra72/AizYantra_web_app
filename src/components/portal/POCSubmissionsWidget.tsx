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
  ArrowRight
} from 'lucide-react'

interface Submission {
  id: string
  submission_code: string
  status: string
  idea_title: string
  created_at: string
}

const statusConfig: Record<string, { color: string; icon: any }> = {
  submitted: { color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: Clock },
  under_review: { color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', icon: TrendingUp },
  approved: { color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: CheckCircle2 },
  rejected: { color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: XCircle },
}

export default function POCSubmissionsWidget() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadSubmissions()
  }, [])

  const loadSubmissions = async () => {
    const supabase = createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setIsLoading(false)
      return
    }

    // Get recent submissions (last 3)
    const { data, error } = await supabase
      .from('poc_submissions')
      .select('id, submission_code, status, idea_title, created_at')
      .eq('founder_email', user.email)
      .order('created_at', { ascending: false })
      .limit(3)

    if (!error && data) {
      setSubmissions(data)
    }

    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 text-[hsl(var(--accent-primary))] animate-spin" />
      </div>
    )
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-8">
        <Lightbulb className="w-12 h-12 text-[hsl(var(--foreground-muted))] mx-auto mb-3" />
        <p className="text-[hsl(var(--foreground-muted))] mb-4">No submissions yet</p>
        <Link
          href="/poc/submit"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(var(--accent-primary))] hover:bg-[hsl(var(--accent-primary))]/90 text-white text-sm font-medium rounded-lg transition-all"
        >
          <Lightbulb className="w-4 h-4" />
          Submit Your First Idea
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {submissions.map((submission) => {
        const StatusIcon = statusConfig[submission.status]?.icon || Clock
        const statusColor = statusConfig[submission.status]?.color || 'bg-gray-500/10 text-gray-500'

        return (
          <Link
            key={submission.id}
            href={`/portal/poc-submissions/${submission.id}`}
            className="block p-4 bg-[hsl(var(--bg-secondary))] hover:bg-[hsl(var(--bg-tertiary))] rounded-lg transition-all group"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-medium text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--accent-primary))] transition-colors line-clamp-1">
                {submission.idea_title}
              </h3>
              <ArrowRight className="w-4 h-4 text-[hsl(var(--foreground-muted))] flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[hsl(var(--foreground-muted))]">
                {submission.submission_code}
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${statusColor}`}>
                <StatusIcon className="w-3 h-3" />
                {submission.status.replace('_', ' ')}
              </span>
            </div>
          </Link>
        )
      })}
      
      <Link
        href="/portal/poc-submissions"
        className="block text-center py-2 text-sm text-[hsl(var(--accent-primary))] hover:underline"
      >
        View All Submissions →
      </Link>
    </div>
  )
}