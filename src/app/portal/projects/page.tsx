'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Search,
  Filter,
  TrendingUp,
  Clock,
  Calendar,
  Users,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Activity
} from 'lucide-react'

// Mock data - will be replaced with Supabase
const allProjects = [
  {
    id: 'proj-1',
    name: 'AI Voice Agent Integration',
    code: 'PROJ-HC-2026-001',
    status: 'development',
    progress: 65,
    currentPhase: 'Development',
    description: 'Implementing GPT-4o based voice agent for patient intake and appointment scheduling',
    startDate: '2026-01-10',
    targetDate: '2026-03-15',
    budget: 3500000,
    spent: 2275000,
    health: 'on_track',
    team: ['Rohan Balu', 'Kumar Pushpam'],
    nextMilestone: {
      name: 'Beta Testing',
      date: '2026-02-05',
      daysUntil: 15
    },
    completedMilestones: 5,
    totalMilestones: 8,
    lastUpdate: '2 hours ago',
  },
  {
    id: 'proj-2',
    name: 'Workflow Automation System',
    code: 'PROJ-HC-2026-002',
    status: 'design',
    progress: 35,
    currentPhase: 'Design',
    description: 'n8n-based automation for lab report processing and patient notification workflows',
    startDate: '2026-01-15',
    targetDate: '2026-04-30',
    budget: 2500000,
    spent: 875000,
    health: 'on_track',
    team: ['Kunal Bellur', 'Abdul Aziz'],
    nextMilestone: {
      name: 'Design Review',
      date: '2026-01-28',
      daysUntil: 7
    },
    completedMilestones: 2,
    totalMilestones: 7,
    lastUpdate: '1 day ago',
  },
  {
    id: 'proj-3',
    name: 'Patient Portal Enhancement',
    code: 'PROJ-HC-2025-045',
    status: 'completed',
    progress: 100,
    currentPhase: 'Completed',
    description: 'Revamped patient portal with AI chatbot and document management',
    startDate: '2025-10-01',
    targetDate: '2025-12-31',
    budget: 1800000,
    spent: 1750000,
    health: 'on_track',
    team: ['Rohan Balu', 'Ashwini Beloshe'],
    nextMilestone: null,
    completedMilestones: 6,
    totalMilestones: 6,
    lastUpdate: '2 weeks ago',
  },
]

const statusOptions = [
  { value: 'all', label: 'All Projects' },
  { value: 'design', label: 'Design' },
  { value: 'development', label: 'Development' },
  { value: 'testing', label: 'Testing' },
  { value: 'completed', label: 'Completed' },
]

const healthColors = {
  on_track: 'bg-green-500/10 text-green-500 border-green-500/20',
  at_risk: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  delayed: 'bg-red-500/10 text-red-500 border-red-500/20',
}

const statusColors = {
  design: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  development: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  testing: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  completed: 'bg-green-500/10 text-green-500 border-green-500/20',
}

const formatCurrency = (value: number) => {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(1)}Cr`
  } else if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`
  }
  return `₹${value.toLocaleString()}`
}

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Filter projects
  const filteredProjects = allProjects.filter(project => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter

    return matchesSearch && matchesStatus
  })

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
                {filteredProjects.length} projects • {filteredProjects.filter(p => p.status !== 'completed').length} active
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
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
        <div className="grid gap-6">
          {filteredProjects.map((project) => (
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
                    {project.code}
                  </p>
                  <p className="text-sm text-[hsl(var(--foreground-muted))]">
                    {project.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${statusColors[project.status]}`}>
                    {project.status}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${healthColors[project.health]}`}>
                    {project.health.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-[hsl(var(--foreground-muted))]">
                    {project.currentPhase} • {project.completedMilestones}/{project.totalMilestones} milestones
                  </span>
                  <span className="font-semibold text-[hsl(var(--foreground))]">
                    {project.progress}%
                  </span>
                </div>
                <div className="h-2 bg-[hsl(var(--bg-secondary))] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[hsl(var(--accent-primary))] transition-all"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {/* Next Milestone */}
                {project.nextMilestone && (
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-[hsl(var(--accent-primary)/.1)]">
                      <Clock className="w-4 h-4 text-[hsl(var(--accent-primary))]" />
                    </div>
                    <div>
                      <div className="text-xs text-[hsl(var(--foreground-muted))]">Next Milestone</div>
                      <div className="text-sm font-medium text-[hsl(var(--foreground))]">
                        {project.nextMilestone.daysUntil} days
                      </div>
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Calendar className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-xs text-[hsl(var(--foreground-muted))]">Timeline</div>
                    <div className="text-sm font-medium text-[hsl(var(--foreground))]">
                      {new Date(project.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} - {new Date(project.targetDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>

                {/* Budget */}
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <div className="text-xs text-[hsl(var(--foreground-muted))]">Budget</div>
                    <div className="text-sm font-medium text-[hsl(var(--foreground))]">
                      {formatCurrency(project.spent)} / {formatCurrency(project.budget)}
                    </div>
                  </div>
                </div>

                {/* Team */}
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Users className="w-4 h-4 text-purple-500" />
                  </div>
                  <div>
                    <div className="text-xs text-[hsl(var(--foreground-muted))]">Team</div>
                    <div className="text-sm font-medium text-[hsl(var(--foreground))]">
                      {project.team.length} members
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-[hsl(var(--border))]">
                <span className="text-xs text-[hsl(var(--foreground-subtle))]">
                  Updated {project.lastUpdate}
                </span>
                {project.nextMilestone && (
                  <div className="flex items-center gap-2 text-sm text-[hsl(var(--foreground-muted))]">
                    <Activity className="w-4 h-4" />
                    <span>Next: {project.nextMilestone.name}</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-[hsl(var(--bg-secondary))] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 text-[hsl(var(--foreground-muted))]" />
            </div>
            <h3 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-2">No projects found</h3>
            <p className="text-[hsl(var(--foreground-muted))]">Try adjusting your search or filter</p>
          </div>
        )}
      </div>
    </div>
  )
}