'use client'

import { 
  TrendingUp,
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
  Briefcase
} from 'lucide-react'
import Link from 'next/link'

// Mock data - will be replaced with Supabase
const clientData = {
  name: 'Apollo Hospitals',
  contactName: 'Dr. Rajesh Kumar',
  activeProjects: 2,
  completedMilestones: 8,
  pendingInvoices: 1,
  totalInvoiced: 2500000,
}

const activeProjects = [
  {
    id: 'proj-1',
    name: 'AI Voice Agent Integration',
    code: 'PROJ-HC-2026-001',
    status: 'development',
    progress: 65,
    currentPhase: 'Development',
    nextMilestone: 'Beta Testing',
    nextMilestoneDate: '2026-02-05',
    health: 'on_track',
    lastUpdate: '2 hours ago',
  },
  {
    id: 'proj-2',
    name: 'Workflow Automation System',
    code: 'PROJ-HC-2026-002',
    status: 'design',
    progress: 35,
    currentPhase: 'Design',
    nextMilestone: 'Design Review',
    nextMilestoneDate: '2026-01-28',
    health: 'on_track',
    lastUpdate: '1 day ago',
  },
]

const recentActivities = [
  {
    id: '1',
    type: 'milestone',
    title: 'Milestone completed: Voice Agent Core',
    description: 'Voice recognition module successfully deployed to staging',
    timestamp: '2 hours ago',
    icon: CheckCircle2,
    iconBg: 'bg-green-500/10',
    iconColor: 'text-green-500',
  },
  {
    id: '2',
    type: 'document',
    title: 'New document uploaded',
    description: 'API Integration Guide v2.pdf',
    timestamp: '5 hours ago',
    icon: FileText,
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
  },
  {
    id: '3',
    type: 'invoice',
    title: 'Invoice generated',
    description: 'Invoice #INV-2026-0042 for ₹7.5L',
    timestamp: '1 day ago',
    icon: Receipt,
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-500',
  },
  {
    id: '4',
    type: 'update',
    title: 'Project status updated',
    description: 'Workflow Automation moved to Design phase',
    timestamp: '2 days ago',
    icon: Activity,
    iconBg: 'bg-orange-500/10',
    iconColor: 'text-orange-500',
  },
]

const upcomingMilestones = [
  {
    id: '1',
    project: 'Workflow Automation System',
    milestone: 'Design Review',
    dueDate: '2026-01-28',
    daysUntil: 7,
    status: 'upcoming',
  },
  {
    id: '2',
    project: 'AI Voice Agent Integration',
    milestone: 'Beta Testing',
    dueDate: '2026-02-05',
    daysUntil: 15,
    status: 'upcoming',
  },
]

const recentDocuments = [
  {
    id: '1',
    name: 'API Integration Guide v2.pdf',
    size: '2.4 MB',
    uploadedAt: '5 hours ago',
    category: 'Technical',
  },
  {
    id: '2',
    name: 'Project Timeline - Updated.xlsx',
    size: '156 KB',
    uploadedAt: '1 day ago',
    category: 'Planning',
  },
  {
    id: '3',
    name: 'Sprint Review Presentation.pptx',
    size: '8.1 MB',
    uploadedAt: '3 days ago',
    category: 'Review',
  },
]

const healthColors: Record<string, string> = {
  on_track: 'bg-green-500/10 text-green-400 border-green-500/30',
  at_risk: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  delayed: 'bg-red-500/10 text-red-400 border-red-500/30',
}

export default function ClientDashboard() {
  return (
    <div className="min-h-screen bg-[hsl(var(--bg-primary))]">
      {/* Header */}
      <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary))]">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
            Welcome back, {clientData.contactName}
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
              {clientData.activeProjects}
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
              {clientData.completedMilestones}
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
              {recentDocuments.length}
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
              {clientData.pendingInvoices}
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
                <Link 
                  href="/portal/projects"
                  className="text-sm text-[hsl(var(--accent-primary))] hover:underline"
                >
                  View All →
                </Link>
              </div>
              <div className="space-y-4">
                {activeProjects.map((project) => (
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
                          {project.code}
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${healthColors[project.health]}`}>
                        {project.health.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-[hsl(var(--foreground-muted))]">
                          Progress: {project.currentPhase}
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

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-[hsl(var(--foreground-muted))]">
                        <Calendar className="w-4 h-4" />
                        <span>Next: {project.nextMilestone}</span>
                      </div>
                      <span className="text-[hsl(var(--foreground-subtle))]">
                        Updated {project.lastUpdate}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card-bordered p-6">
              <h2 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-6">
                Recent Activity
              </h2>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div 
                    key={activity.id}
                    className="flex items-start gap-4"
                  >
                    <div className={`p-2 rounded-lg ${activity.iconBg} flex-shrink-0`}>
                      <activity.icon className={`w-5 h-5 ${activity.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-[hsl(var(--foreground))] text-sm">
                        {activity.title}
                      </h3>
                      <p className="text-sm text-[hsl(var(--foreground-muted))] mt-1">
                        {activity.description}
                      </p>
                      <p className="text-xs text-[hsl(var(--foreground-subtle))] mt-1">
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Upcoming Milestones */}
            <div className="card-bordered p-6">
              <h2 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">
                Upcoming Milestones
              </h2>
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
            </div>

            {/* Recent Documents */}
            <div className="card-bordered p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">
                  Recent Documents
                </h2>
                <Link 
                  href="/portal/documents"
                  className="text-sm text-[hsl(var(--accent-primary))] hover:underline"
                >
                  View All
                </Link>
              </div>
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
                        <span>{doc.size}</span>
                        <span>•</span>
                        <span>{doc.uploadedAt}</span>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-[hsl(var(--bg-tertiary))] rounded-lg transition-colors">
                      <Download className="w-4 h-4 text-[hsl(var(--foreground-muted))]" />
                    </button>
                  </div>
                ))}
              </div>
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