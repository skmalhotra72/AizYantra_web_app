'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Search,
  TrendingUp,
  Clock,
  Calendar,
  Users,
  ArrowRight,
  Activity,
  Loader2,
  AlertCircle,
  Briefcase
} from 'lucide-react'

interface Project {
  id: string
  project_code: string
  name: string
  description: string | null
  status: string | null
  current_phase: string | null
  progress_percentage: number | null
  health_status: string | null
  planned_start_date: string | null
  planned_end_date: string | null
  contract_value: number | null
  invoiced_amount: number | null
  team: any
  updated_at: string
}

const statusOptions = [
  { value: 'all', label: 'All Projects' },
  { value: 'planning', label: 'Planning' },
  { value: 'design', label: 'Design' },
  { value: 'development', label: 'Development' },
  { value: 'testing', label: 'Testing' },
  { value: 'completed', label: 'Completed' },
]

const healthColors: Record<string, string> = {
  on_track: 'bg-green-500/10 text-green-500 border-green-500/20',
  at_risk: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  delayed: 'bg-red-500/10 text-red-500 border-red-500/20',
}

const statusColors: Record<string, string> = {
  planning: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  design: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  development: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  testing: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  completed: 'bg-green-500/10 text-green-500 border-green-500/20',
}

const formatCurrency = (value: number | null) => {
  if (!value) return '₹0'
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(1)}Cr`
  } else if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`
  }
  return `₹${value.toLocaleString()}`
}

const getTimeAgo = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return 'Just now'
  if (diffInHours < 24) return `${diffInHours} hours ago`
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays === 1) return '1 day ago'
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
  return `${Math.floor(diffInDays / 30)} months ago`
}

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    const fetchProjects = async () => {
      const supabase = createClient()
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.error('No authenticated user:', userError)
        router.push('/portal/login')
        return
      }

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

      if (contact?.organization_id) {
        // Fetch projects for user's organization
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .eq('organization_id', contact.organization_id)
          .order('updated_at', { ascending: false })

        if (projectsError) {
          console.error('Error fetching projects:', projectsError)
        } else if (projectsData) {
          setProjects(projectsData)
        }
      }

      setIsLoading(false)
    }

    fetchProjects()
  }, [router])

  // Filter projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.project_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const activeProjects = filteredProjects.filter(p => p.status !== 'completed').length

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--bg-primary))] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[hsl(var(--accent-primary))] animate-spin mx-auto mb-4" />
          <p className="text-[hsl(var(--foreground-muted))]">Loading projects...</p>
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
              <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
                Projects
              </h1>
              <p className="text-[hsl(var(--foreground-muted))] mt-1">
                {filteredProjects.length} projects • {activeProjects} active
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {projects.length === 0 ? (
          // Empty State - No projects at all
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-[hsl(var(--accent-primary)/.1)] rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-[hsl(var(--accent-primary))]" />
            </div>
            <h3 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-2">
              No projects yet
            </h3>
            <p className="text-[hsl(var(--foreground-muted))]">
              Your projects will appear here once they're created
            </p>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--foreground-muted))]" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-subtle))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-primary))] focus:border-transparent transition-all"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2.5 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-primary))] focus:border-transparent transition-all cursor-pointer"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Projects Grid */}
            {filteredProjects.length === 0 ? (
              // Empty State - No results from filter
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-[hsl(var(--bg-secondary))] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8 text-[hsl(var(--foreground-muted))]" />
                </div>
                <h3 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-2">No projects found</h3>
                <p className="text-[hsl(var(--foreground-muted))]">Try adjusting your search or filter</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {filteredProjects.map((project) => {
                  const teamMembers = Array.isArray(project.team) ? project.team.length : 0

                  return (
                    <Link
                      key={project.id}
                      href={`/portal/projects/${project.id}`}
                      className="card-bordered p-6 hover:border-[hsl(var(--accent-primary)/.3)] hover:shadow-lg transition-all group"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--accent-primary))] transition-colors">
                              {project.name}
                            </h3>
                            <ArrowRight className="w-5 h-5 text-[hsl(var(--foreground-muted))] opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <p className="text-sm text-[hsl(var(--foreground-muted))] font-mono mb-2">
                            {project.project_code}
                          </p>
                          {project.description && (
                            <p className="text-sm text-[hsl(var(--foreground-muted))]">
                              {project.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {project.status && (
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${statusColors[project.status] || 'bg-slate-500/10 text-slate-500 border-slate-500/20'}`}>
                              {project.status}
                            </span>
                          )}
                          {project.health_status && (
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${healthColors[project.health_status] || 'bg-slate-500/10 text-slate-500 border-slate-500/20'}`}>
                              {project.health_status.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Progress */}
                      {project.progress_percentage !== null && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-[hsl(var(--foreground-muted))]">
                              {project.current_phase || 'In Progress'}
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

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {/* Timeline */}
                        {project.planned_start_date && project.planned_end_date && (
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                              <Calendar className="w-4 h-4 text-blue-500" />
                            </div>
                            <div>
                              <div className="text-xs text-[hsl(var(--foreground-muted))]">Timeline</div>
                              <div className="text-sm font-medium text-[hsl(var(--foreground))]">
                                {new Date(project.planned_start_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} - {new Date(project.planned_end_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Budget */}
                        {project.contract_value !== null && (
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-green-500/10">
                              <TrendingUp className="w-4 h-4 text-green-500" />
                            </div>
                            <div>
                              <div className="text-xs text-[hsl(var(--foreground-muted))]">Budget</div>
                              <div className="text-sm font-medium text-[hsl(var(--foreground))]">
                                {formatCurrency(project.invoiced_amount)} / {formatCurrency(project.contract_value)}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Team */}
                        {teamMembers > 0 && (
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-purple-500/10">
                              <Users className="w-4 h-4 text-purple-500" />
                            </div>
                            <div>
                              <div className="text-xs text-[hsl(var(--foreground-muted))]">Team</div>
                              <div className="text-sm font-medium text-[hsl(var(--foreground))]">
                                {teamMembers} members
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Status */}
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-[hsl(var(--accent-primary)/.1)]">
                            <Activity className="w-4 h-4 text-[hsl(var(--accent-primary))]" />
                          </div>
                          <div>
                            <div className="text-xs text-[hsl(var(--foreground-muted))]">Status</div>
                            <div className="text-sm font-medium text-[hsl(var(--foreground))] capitalize">
                              {project.current_phase || project.status || 'Active'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-[hsl(var(--border))]">
                        <span className="text-xs text-[hsl(var(--foreground-subtle))]">
                          Updated {getTimeAgo(project.updated_at)}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}