'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Lightbulb,
  TrendingUp,
  Users,
  Calendar,
  ExternalLink,
  Loader2,
  AlertCircle
} from 'lucide-react'

interface Submission {
  id: string
  submission_code: string
  founder_name: string
  founder_email: string
  company_name: string | null
  idea_title: string
  status: string
  current_stage: string | null
  ai_score_overall: number | null
  created_at: string
}

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'poc_started', label: 'POC Started' },
  { value: 'poc_completed', label: 'POC Completed' },
]

const statusConfig: Record<string, { color: string; icon: any }> = {
  submitted: { color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: Clock },
  under_review: { color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', icon: Clock },
  approved: { color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: CheckCircle2 },
  rejected: { color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: XCircle },
  poc_started: { color: 'bg-purple-500/10 text-purple-500 border-purple-500/20', icon: TrendingUp },
  poc_completed: { color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: CheckCircle2 },
}

export default function AdminPOCSubmissionsPage() {
  const router = useRouter()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    const fetchSubmissions = async () => {
      const supabase = createClient()
      
      // Check if user is authenticated and is team member
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        router.push('/portal/login')
        return
      }

      // Fetch all POC submissions
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('poc_submissions')
        .select('*')
        .order('created_at', { ascending: false })

      if (submissionsError) {
        console.error('Error fetching submissions:', submissionsError)
      } else if (submissionsData) {
        setSubmissions(submissionsData)
      }

      setIsLoading(false)
    }

    fetchSubmissions()
  }, [router])

  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch = 
      sub.founder_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.founder_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.idea_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.submission_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.company_name && sub.company_name.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Calculate stats
  const totalSubmissions = submissions.length
  const newSubmissions = submissions.filter(s => s.status === 'submitted').length
  const underReview = submissions.filter(s => s.status === 'under_review').length
  const approved = submissions.filter(s => s.status === 'approved').length

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--bg-primary))] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[hsl(var(--accent-primary))] animate-spin mx-auto mb-4" />
          <p className="text-[hsl(var(--foreground-muted))]">Loading submissions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-primary))]">
      {/* Header */}
      <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary))]">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">POC Submissions</h1>
              <p className="text-[hsl(var(--foreground-muted))] mt-1">
                {filteredSubmissions.length} submissions • {newSubmissions} new
              </p>
            </div>
            <Link
              href="/poc/submit"
              className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--accent-primary))] hover:bg-[hsl(var(--accent-primary))]/90 text-white font-medium rounded-lg transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              View Public Form
            </Link>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card-bordered p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Lightbulb className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <div className="text-sm text-[hsl(var(--foreground-muted))]">Total</div>
                <div className="text-2xl font-bold text-[hsl(var(--foreground))]">{totalSubmissions}</div>
              </div>
            </div>
          </div>

          <div className="card-bordered p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <div className="text-sm text-[hsl(var(--foreground-muted))]">New</div>
                <div className="text-2xl font-bold text-yellow-500">{newSubmissions}</div>
              </div>
            </div>
          </div>

          <div className="card-bordered p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Users className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <div className="text-sm text-[hsl(var(--foreground-muted))]">Under Review</div>
                <div className="text-2xl font-bold text-purple-500">{underReview}</div>
              </div>
            </div>
          </div>

          <div className="card-bordered p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <div className="text-sm text-[hsl(var(--foreground-muted))]">Approved</div>
                <div className="text-2xl font-bold text-green-500">{approved}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--foreground-muted))]" />
            <input
              type="text"
              placeholder="Search by name, email, company, or idea..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-subtle))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-primary))] transition-all"
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-primary))] transition-all cursor-pointer"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Submissions List */}
        {filteredSubmissions.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-[hsl(var(--bg-secondary))] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="w-8 h-8 text-[hsl(var(--foreground-muted))]" />
            </div>
            <h3 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-2">No submissions found</h3>
            <p className="text-[hsl(var(--foreground-muted))]">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredSubmissions.map((submission) => {
              const StatusIcon = statusConfig[submission.status]?.icon || AlertCircle
              const statusColor = statusConfig[submission.status]?.color || 'bg-gray-500/10 text-gray-500 border-gray-500/20'

              return (
                <Link
                  key={submission.id}
                  href={`/admin/poc/submissions/${submission.id}`}
                  className="card-bordered p-6 hover:border-[hsl(var(--accent-primary)/.3)] hover:shadow-lg transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--accent-primary))] transition-colors">
                          {submission.idea_title}
                        </h3>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {submission.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-[hsl(var(--foreground-muted))] font-mono">{submission.submission_code}</p>
                    </div>
                    {submission.ai_score_overall && (
                      <div className="text-right">
                        <div className="text-xs text-[hsl(var(--foreground-muted))]">AI Score</div>
                        <div className="text-2xl font-bold text-[hsl(var(--accent-primary))]">
                          {submission.ai_score_overall.toFixed(1)}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-xs text-[hsl(var(--foreground-muted))] mb-1">Founder</div>
                      <div className="text-sm font-medium text-[hsl(var(--foreground))]">{submission.founder_name}</div>
                      <div className="text-xs text-[hsl(var(--foreground-subtle))]">{submission.founder_email}</div>
                    </div>

                    {submission.company_name && (
                      <div>
                        <div className="text-xs text-[hsl(var(--foreground-muted))] mb-1">Company</div>
                        <div className="text-sm font-medium text-[hsl(var(--foreground))]">{submission.company_name}</div>
                      </div>
                    )}

                    {submission.current_stage && (
                      <div>
                        <div className="text-xs text-[hsl(var(--foreground-muted))] mb-1">Stage</div>
                        <div className="text-sm font-medium text-[hsl(var(--foreground))] capitalize">
                          {submission.current_stage.replace('_', ' ')}
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="text-xs text-[hsl(var(--foreground-muted))] mb-1">Submitted</div>
                      <div className="text-sm font-medium text-[hsl(var(--foreground))]">
                        {new Date(submission.created_at).toLocaleDateString('en-IN', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end mt-4 pt-4 border-t border-[hsl(var(--border))]">
                    <div className="flex items-center gap-2 text-sm text-[hsl(var(--accent-primary))] font-medium">
                      View Details
                      <Eye className="w-4 h-4" />
                    </div>
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