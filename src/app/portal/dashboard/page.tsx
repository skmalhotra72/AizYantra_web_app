'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import POCSubmissionsWidget from '@/components/portal/POCSubmissionsWidget'
import { useRouter } from 'next/navigation'
import { 
  Clock,
  CheckCircle2,
  FileText,
  Receipt,
  Calendar,
  AlertCircle,
  ArrowUpRight,
  Download,
  MessageSquare,
  Activity,
  Briefcase,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

interface UserProfile {
  id: string
  email: string
  full_name: string
  phone: string
  role: string
}

interface Project {
  id: string
  project_code: string
  name: string
  description: string | null
  status: string | null
  current_phase: string | null
  progress_percentage: number | null
  health_status: string | null
  updated_at: string
}

interface Milestone {
  id: string
  project_id: string
  name: string
  planned_end_date: string | null
  status: string | null
  projects?: {
    name: string
  }
}

interface Document {
  id: string
  name: string
  file_size: number | null
  file_type: string | null
  created_at: string
}

interface Invoice {
  id: string
  invoice_number: string
  total_amount: number | null
  amount_due: number | null
  status: string | null
  invoice_date: string | null
  due_date: string | null
}

export default function ClientDashboard() {
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      const supabase = createClient()
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.error('No authenticated user:', userError)
        router.push('/portal/login')
        return
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Error fetching profile:', profileError)
        setIsLoading(false)
        return
      }

      setUserProfile(profile)

      // Get user's contact to find organization_id
      const { data: contact, error: contactError } = await supabase
        .from('contacts')
        .select('organization_id')
        .eq('user_id', user.id)
        .single()

      if (contactError) {
        console.error('Error fetching contact:', contactError)
        setIsLoading(false)
        return
      }

      const orgId = contact?.organization_id

      if (orgId) {
        // Fetch projects
        const { data: projectsData } = await supabase
          .from('projects')
          .select('*')
          .eq('organization_id', orgId)
          .order('updated_at', { ascending: false })

        if (projectsData) {
          setProjects(projectsData)

          // Fetch milestones for these projects
          const projectIds = projectsData.map(p => p.id)
          if (projectIds.length > 0) {
            const { data: milestonesData } = await supabase
              .from('project_milestones')
              .select('*, projects(name)')
              .in('project_id', projectIds)
              .order('planned_end_date', { ascending: true })

            if (milestonesData) {
              setMilestones(milestonesData)
            }
          }
        }

        // Fetch documents (client-visible only)
        const { data: documentsData } = await supabase
          .from('documents')
          .select('*')
          .eq('organization_id', orgId)
          .eq('is_client_visible', true)
          .order('created_at', { ascending: false })
          .limit(10)

        if (documentsData) {
          setDocuments(documentsData)
        }

        // Fetch invoices
        const { data: invoicesData } = await supabase
          .from('invoices')
          .select('*')
          .eq('organization_id', orgId)
          .order('invoice_date', { ascending: false })

        if (invoicesData) {
          setInvoices(invoicesData)
        }
      }

      setIsLoading(false)
    }

    fetchUserData()
  }, [router])

  // Calculate stats
  const completedMilestones = milestones.filter(m => m.status === 'completed').length
  const pendingInvoices = invoices.filter(i => i.status === 'pending' || i.status === 'sent').length
  const upcomingMilestones = milestones
    .filter(m => m.status !== 'completed' && m.planned_end_date)
    .slice(0, 3)
    .map(m => ({
      id: m.id,
      project: m.projects?.name || 'Unknown Project',
      milestone: m.name,
      dueDate: m.planned_end_date!,
      daysUntil: Math.ceil((new Date(m.planned_end_date!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
      status: 'upcoming' as const,
    }))

  const recentDocuments = documents.slice(0, 3)

  const healthColors: Record<string, string> = {
    on_track: 'bg-green-500/10 text-green-400 border-green-500/30',
    at_risk: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    delayed: 'bg-red-500/10 text-red-400 border-red-500/30',
  }

  // Helper functions
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours} hours ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return '1 day ago'
    return `${diffInDays} days ago`
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--bg-primary))] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[hsl(var(--accent-primary))] animate-spin mx-auto mb-4" />
          <p className="text-[hsl(var(--foreground-muted))]">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (!userProfile) {
    return (
      <div className="min-h-screen bg-[hsl(var(--bg-primary))] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-[hsl(var(--foreground-muted))] mb-4">Failed to load profile</p>
          <Link href="/portal/login" className="text-[hsl(var(--accent-primary))] hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-primary))]">
      {/* Header */}
      <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary))]">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
            Welcome back, {userProfile.full_name}
          </h1>
          <p className="text-[hsl(var(--foreground-muted))] mt-1">
            Here's what's happening with your projects
          </p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/portal/projects" className="card-bordered p-6 hover:border-[hsl(var(--accent-primary)/.3)] transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 rounded-lg bg-[hsl(var(--accent-primary)/.1)]">
                <Briefcase className="w-5 h-5 text-[hsl(var(--accent-primary))]" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-[hsl(var(--foreground-muted))] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-3xl font-bold text-[hsl(var(--foreground))] mb-1">
              {projects.length}
            </div>
            <div className="text-sm text-[hsl(var(--foreground-muted))]">
              Active Projects
            </div>
          </Link>

          <div className="card-bordered p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
            </div>
            <div className="text-3xl font-bold text-[hsl(var(--foreground))] mb-1">
              {completedMilestones}
            </div>
            <div className="text-sm text-[hsl(var(--foreground-muted))]">
              Milestones Completed
            </div>
          </div>

          <Link href="/portal/documents" className="card-bordered p-6 hover:border-[hsl(var(--accent-primary)/.3)] transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <FileText className="w-5 h-5 text-blue-500" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-[hsl(var(--foreground-muted))] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-3xl font-bold text-[hsl(var(--foreground))] mb-1">
              {documents.length}
            </div>
            <div className="text-sm text-[hsl(var(--foreground-muted))]">
              Recent Documents
            </div>
          </Link>

          <Link href="/portal/invoices" className="card-bordered p-6 hover:border-[hsl(var(--accent-primary)/.3)] transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Receipt className="w-5 h-5 text-purple-500" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-[hsl(var(--foreground-muted))] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-3xl font-bold text-[hsl(var(--foreground))] mb-1">
              {pendingInvoices}
            </div>
            <div className="text-sm text-[hsl(var(--foreground-muted))]">
              Pending Invoices
            </div>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Projects */}
            <div className="card-bordered p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">
                  Active Projects
                </h2>
                {projects.length > 0 && (
                  <Link 
                    href="/portal/projects"
                    className="text-sm text-[hsl(var(--accent-primary))] hover:underline"
                  >
                    View All →
                  </Link>
                )}
              </div>
              
              {projects.length === 0 ? (
                // Empty State
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-[hsl(var(--accent-primary)/.1)] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-8 h-8 text-[hsl(var(--accent-primary))]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-2">
                    No active projects yet
                  </h3>
                  <p className="text-sm text-[hsl(var(--foreground-muted))] mb-6">
                    Once your projects are created, they'll appear here
                  </p>
                </div>
              ) : (
                // Projects List
                <div className="space-y-4">
                  {projects.slice(0, 3).map((project) => (
                    <Link
                      key={project.id}
                      href={`/portal/projects/${project.id}`}
                      className="block p-4 rounded-lg border border-[hsl(var(--border))] hover:border-[hsl(var(--accent-primary)/.3)] hover:bg-[hsl(var(--bg-secondary))] transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-[hsl(var(--foreground))] mb-1">
                            {project.name}
                          </h3>
                          <p className="text-xs text-[hsl(var(--foreground-muted))] font-mono">
                            {project.project_code}
                          </p>
                        </div>
                        {project.health_status && (
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${healthColors[project.health_status] || 'bg-slate-500/10 text-slate-400'}`}>
                            {project.health_status.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                      
                      {project.progress_percentage !== null && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-[hsl(var(--foreground-muted))]">
                              Progress: {project.current_phase || 'In Progress'}
                            </span>
                            <span className="font-semibold text-[hsl(var(--foreground))]">
                              {project.progress_percentage}%
                            </span>
                          </div>
                          <div className="h-2 bg-[hsl(var(--bg-secondary))] rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[hsl(var(--accent-primary))] transition-all"
                              style={{ width: `${project.progress_percentage}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-[hsl(var(--foreground-muted))]">
                          <Calendar className="w-4 h-4" />
                          <span>Status: {project.status || 'Active'}</span>
                        </div>
                        <span className="text-[hsl(var(--foreground-subtle))]">
                          Updated {getTimeAgo(project.updated_at)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity - Empty State */}
            <div className="card-bordered p-6">
              <h2 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-6">
                Recent Activity
              </h2>
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-[hsl(var(--foreground-muted))] mx-auto mb-3 opacity-50" />
                <p className="text-sm text-[hsl(var(--foreground-muted))]">
                  Activity updates will appear here
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">

{/* POC Submissions Widget */}
<div className="card-bordered p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">My POC Submissions</h2>
            <Link 
              href="/portal/poc-submissions"
              className="text-sm text-[hsl(var(--accent-primary))] hover:underline"
            >
              View All
            </Link>
          </div>
          <POCSubmissionsWidget />
        </div>

            {/* Recent Documents */}
            <div className="card-bordered p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">
                  Recent Documents
                </h2>
                {documents.length > 0 && (
                  <Link 
                    href="/portal/documents"
                    className="text-sm text-[hsl(var(--accent-primary))] hover:underline"
                  >
                    View All
                  </Link>
                )}
              </div>
              {recentDocuments.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-10 h-10 text-[hsl(var(--foreground-muted))] mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-[hsl(var(--foreground-muted))]">
                    No documents yet
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentDocuments.map((doc) => (
                    <div 
                      key={doc.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-[hsl(var(--bg-secondary))] transition-colors cursor-pointer"
                    >
                      <div className="p-2 rounded-lg bg-[hsl(var(--accent-primary)/.1)] flex-shrink-0">
                        <FileText className="w-4 h-4 text-[hsl(var(--accent-primary))]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm text-[hsl(var(--foreground))] truncate">
                          {doc.name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-[hsl(var(--foreground-muted))] mt-0.5">
                          <span>{formatFileSize(doc.file_size)}</span>
                          <span>•</span>
                          <span>{getTimeAgo(doc.created_at)}</span>
                        </div>
                      </div>
                      <button className="p-2 hover:bg-[hsl(var(--bg-tertiary))] rounded-lg transition-colors">
                        <Download className="w-4 h-4 text-[hsl(var(--foreground-muted))]" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

{/* Upcoming Milestones */}
<div className="card-bordered p-6">
              <h2 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">
                Upcoming Milestones
              </h2>
              {upcomingMilestones.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-10 h-10 text-[hsl(var(--foreground-muted))] mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-[hsl(var(--foreground-muted))]">
                    No upcoming milestones
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingMilestones.map((milestone) => (
                    <div 
                      key={milestone.id}
                      className="p-3 rounded-lg bg-[hsl(var(--bg-secondary))]"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <Clock className="w-4 h-4 text-[hsl(var(--accent-primary))] mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm text-[hsl(var(--foreground))]">
                            {milestone.milestone}
                          </h3>
                          <p className="text-xs text-[hsl(var(--foreground-muted))] mt-0.5">
                            {milestone.project}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[hsl(var(--foreground-muted))]">
                          {new Date(milestone.dueDate).toLocaleDateString('en-IN', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                        <span className="font-medium text-[hsl(var(--accent-primary))]">
                          {milestone.daysUntil} days
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Support */}
            <div className="card-bordered p-6 bg-gradient-to-br from-[hsl(var(--accent-primary)/.05)] to-[hsl(var(--accent-secondary)/.05)] border-[hsl(var(--accent-primary)/.2)]">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 rounded-lg bg-[hsl(var(--accent-primary)/.1)]">
                  <MessageSquare className="w-5 h-5 text-[hsl(var(--accent-primary))]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[hsl(var(--foreground))] mb-1">
                    Need Help?
                  </h3>
                  <p className="text-sm text-[hsl(var(--foreground-muted))]">
                    Our team is here to assist you
                  </p>
                </div>
              </div>
              <button className="w-full py-2 bg-[hsl(var(--accent-primary))] hover:bg-[hsl(var(--accent-primary))]/90 text-white font-medium rounded-lg transition-all text-sm">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}