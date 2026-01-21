'use client'

import { use } from 'react'
import Link from 'next/link'
import { 
  ChevronLeft,
  Calendar,
  Users,
  TrendingUp,
  CheckCircle2,
  Clock,
  FileText,
  MessageSquare,
  Download,
  ExternalLink,
  Activity
} from 'lucide-react'

// Mock data - will be replaced with Supabase
const projectsData: Record<string, any> = {
  'proj-1': {
    id: 'proj-1',
    name: 'AI Voice Agent Integration',
    code: 'PROJ-HC-2026-001',
    status: 'development',
    progress: 65,
    currentPhase: 'Development',
    description: 'Implementing GPT-4o based voice agent for patient intake and appointment scheduling with multi-language support and real-time transcription.',
    startDate: '2026-01-10',
    targetDate: '2026-03-15',
    budget: 3500000,
    spent: 2275000,
    health: 'on_track',
    team: [
      { name: 'Rohan Balu', role: 'Technical Lead', avatar: 'RB' },
      { name: 'Kumar Pushpam', role: 'Analytics Lead', avatar: 'KP' },
      { name: 'Sanjeev Malhotra', role: 'Project Advisor', avatar: 'SM' },
    ],
    milestones: [
      {
        id: 'm1',
        name: 'Requirements & Design',
        status: 'completed',
        completedDate: '2026-01-15',
        description: 'Completed requirement gathering and architecture design',
      },
      {
        id: 'm2',
        name: 'Voice Engine Integration',
        status: 'completed',
        completedDate: '2026-01-22',
        description: 'GPT-4o Realtime API integrated successfully',
      },
      {
        id: 'm3',
        name: 'Multi-language Support',
        status: 'completed',
        completedDate: '2026-01-28',
        description: 'Added support for Hindi, Tamil, Telugu',
      },
      {
        id: 'm4',
        name: 'Appointment Booking Flow',
        status: 'completed',
        completedDate: '2026-02-01',
        description: 'Voice-based appointment scheduling implemented',
      },
      {
        id: 'm5',
        name: 'Patient Intake Module',
        status: 'completed',
        completedDate: '2026-02-03',
        description: 'Symptom collection and triage system active',
      },
      {
        id: 'm6',
        name: 'Beta Testing',
        status: 'in_progress',
        dueDate: '2026-02-05',
        description: 'Internal testing with sample patient scenarios',
      },
      {
        id: 'm7',
        name: 'Production Deployment',
        status: 'pending',
        dueDate: '2026-02-20',
        description: 'Deploy to production environment',
      },
      {
        id: 'm8',
        name: 'Training & Handoff',
        status: 'pending',
        dueDate: '2026-03-15',
        description: 'Staff training and documentation handoff',
      },
    ],
    recentUpdates: [
      {
        id: 'u1',
        title: 'Beta testing milestone started',
        description: 'Internal testing phase has begun with positive initial results',
        timestamp: '2 hours ago',
        author: 'Rohan Balu',
      },
      {
        id: 'u2',
        title: 'Patient intake module completed',
        description: 'Symptom collection achieving 95% accuracy in test scenarios',
        timestamp: '1 day ago',
        author: 'Kumar Pushpam',
      },
      {
        id: 'u3',
        title: 'Multi-language testing successful',
        description: 'Hindi, Tamil, and Telugu voice recognition working flawlessly',
        timestamp: '3 days ago',
        author: 'Rohan Balu',
      },
    ],
    documents: [
      {
        id: 'd1',
        name: 'Technical Architecture v3.pdf',
        size: '2.4 MB',
        uploadedAt: '2 days ago',
        category: 'Technical',
      },
      {
        id: 'd2',
        name: 'API Integration Guide.pdf',
        size: '1.8 MB',
        uploadedAt: '5 days ago',
        category: 'Documentation',
      },
      {
        id: 'd3',
        name: 'Sprint Review Presentation.pptx',
        size: '8.1 MB',
        uploadedAt: '1 week ago',
        category: 'Review',
      },
    ],
  },
  'proj-2': {
    id: 'proj-2',
    name: 'Workflow Automation System',
    code: 'PROJ-HC-2026-002',
    status: 'design',
    progress: 35,
    currentPhase: 'Design',
    description: 'n8n-based automation for lab report processing and patient notification workflows with intelligent routing.',
    startDate: '2026-01-15',
    targetDate: '2026-04-30',
    budget: 2500000,
    spent: 875000,
    health: 'on_track',
    team: [
      { name: 'Kunal Bellur', role: 'CPO', avatar: 'KB' },
      { name: 'Abdul Aziz', role: 'Product Advisor', avatar: 'AA' },
    ],
    milestones: [
      {
        id: 'm1',
        name: 'Requirements Gathering',
        status: 'completed',
        completedDate: '2026-01-18',
        description: 'Workflow requirements documented',
      },
      {
        id: 'm2',
        name: 'Process Mapping',
        status: 'completed',
        completedDate: '2026-01-22',
        description: 'Current process flows mapped and analyzed',
      },
      {
        id: 'm3',
        name: 'Design Review',
        status: 'in_progress',
        dueDate: '2026-01-28',
        description: 'Design review with stakeholders',
      },
      {
        id: 'm4',
        name: 'Development Phase 1',
        status: 'pending',
        dueDate: '2026-02-28',
        description: 'Core automation workflows',
      },
    ],
    recentUpdates: [
      {
        id: 'u1',
        title: 'Process mapping completed',
        description: 'All current workflows documented and bottlenecks identified',
        timestamp: '1 day ago',
        author: 'Kunal Bellur',
      },
    ],
    documents: [
      {
        id: 'd1',
        name: 'Workflow Design Document.pdf',
        size: '3.2 MB',
        uploadedAt: '2 days ago',
        category: 'Design',
      },
    ],
  },
}

const statusColors = {
  completed: 'bg-green-500/10 text-green-500 border-green-500/20',
  in_progress: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  pending: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
}

const healthColors = {
  on_track: 'bg-green-500/10 text-green-500 border-green-500/20',
  at_risk: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  delayed: 'bg-red-500/10 text-red-500 border-red-500/20',
}

const formatCurrency = (value: number) => {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(1)}Cr`
  } else if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`
  }
  return `₹${value.toLocaleString()}`
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const project = projectsData[id]

  if (!project) {
    return (
      <div className="min-h-screen bg-[hsl(var(--bg-primary))] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-2">Project not found</h1>
          <Link href="/portal/projects" className="text-[hsl(var(--accent-primary))] hover:underline">
            ← Back to projects
          </Link>
        </div>
      </div>
    )
  }

  const completedMilestones = project.milestones.filter((m: any) => m.status === 'completed').length
  const budgetPercentage = (project.spent / project.budget) * 100

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-primary))]">
      {/* Header */}
      <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary))]">
        <div className="p-6">
          <Link 
            href="/portal/projects"
            className="inline-flex items-center gap-2 text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--foreground))] mb-4 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Projects
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-1">
                {project.name}
              </h1>
              <p className="text-sm text-[hsl(var(--foreground-muted))] font-mono mb-3">
                {project.code}
              </p>
              <p className="text-[hsl(var(--foreground-muted))] max-w-3xl">
                {project.description}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${healthColors[project.health]}`}>
              {project.health.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Overview */}
            <div className="card-bordered p-6">
              <h2 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">
                Progress Overview
              </h2>
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-[hsl(var(--foreground-muted))]">
                    Overall Progress
                  </span>
                  <span className="font-semibold text-[hsl(var(--foreground))]">
                    {project.progress}%
                  </span>
                </div>
                <div className="h-3 bg-[hsl(var(--bg-secondary))] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[hsl(var(--accent-primary))] transition-all"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[hsl(var(--foreground))]">
                    {completedMilestones}
                  </div>
                  <div className="text-xs text-[hsl(var(--foreground-muted))] mt-1">
                    Completed
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[hsl(var(--accent-primary))]">
                    {project.milestones.filter((m: any) => m.status === 'in_progress').length}
                  </div>
                  <div className="text-xs text-[hsl(var(--foreground-muted))] mt-1">
                    In Progress
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-500">
                    {project.milestones.filter((m: any) => m.status === 'pending').length}
                  </div>
                  <div className="text-xs text-[hsl(var(--foreground-muted))] mt-1">
                    Pending
                  </div>
                </div>
              </div>
            </div>

            {/* Milestones */}
            <div className="card-bordered p-6">
              <h2 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">
                Milestones
              </h2>
              <div className="space-y-4">
                {project.milestones.map((milestone: any, index: number) => (
                  <div 
                    key={milestone.id}
                    className="flex gap-4"
                  >
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        milestone.status === 'completed' 
                          ? 'bg-green-500 text-white' 
                          : milestone.status === 'in_progress'
                          ? 'bg-[hsl(var(--accent-primary))] text-white'
                          : 'bg-[hsl(var(--bg-secondary))] text-[hsl(var(--foreground-muted))]'
                      }`}>
                        {milestone.status === 'completed' ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <span className="text-sm font-medium">{index + 1}</span>
                        )}
                      </div>
                      {index < project.milestones.length - 1 && (
                        <div className={`w-0.5 flex-1 mt-2 ${
                          milestone.status === 'completed' 
                            ? 'bg-green-500' 
                            : 'bg-[hsl(var(--border))]'
                        }`} style={{ minHeight: '40px' }} />
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-[hsl(var(--foreground))]">
                            {milestone.name}
                          </h3>
                          <p className="text-sm text-[hsl(var(--foreground-muted))] mt-1">
                            {milestone.description}
                          </p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border capitalize whitespace-nowrap ml-4 ${statusColors[milestone.status]}`}>
                          {milestone.status.replace('_', ' ')}
                        </span>
                      </div>
                      {milestone.completedDate && (
                        <div className="text-xs text-green-500 mt-2">
                          ✓ Completed {new Date(milestone.completedDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      )}
                      {milestone.dueDate && (
                        <div className="text-xs text-[hsl(var(--foreground-muted))] mt-2">
                          📅 Due {new Date(milestone.dueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Updates */}
            <div className="card-bordered p-6">
              <h2 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">
                Recent Updates
              </h2>
              <div className="space-y-4">
                {project.recentUpdates.map((update: any) => (
                  <div key={update.id} className="flex gap-4">
                    <div className="p-2 rounded-lg bg-[hsl(var(--accent-primary)/.1)] h-fit">
                      <Activity className="w-4 h-4 text-[hsl(var(--accent-primary))]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-[hsl(var(--foreground))]">
                        {update.title}
                      </h3>
                      <p className="text-sm text-[hsl(var(--foreground-muted))] mt-1">
                        {update.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-[hsl(var(--foreground-subtle))]">
                        <span>{update.author}</span>
                        <span>•</span>
                        <span>{update.timestamp}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Stats */}
            <div className="card-bordered p-6">
              <h3 className="font-semibold text-[hsl(var(--foreground))] mb-4">
                Project Details
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-sm text-[hsl(var(--foreground-muted))] mb-1">
                    <Calendar className="w-4 h-4" />
                    Timeline
                  </div>
                  <div className="text-sm font-medium text-[hsl(var(--foreground))]">
                    {new Date(project.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {' - '}
                    {new Date(project.targetDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-[hsl(var(--foreground-muted))] mb-1">
                    <TrendingUp className="w-4 h-4" />
                    Budget
                  </div>
                  <div className="text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                    {formatCurrency(project.spent)} / {formatCurrency(project.budget)}
                  </div>
                  <div className="h-2 bg-[hsl(var(--bg-secondary))] rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        budgetPercentage > 90 ? 'bg-red-500' : budgetPercentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-[hsl(var(--foreground-muted))] mt-1">
                    {budgetPercentage.toFixed(1)}% utilized
                  </div>
                </div>
              </div>
            </div>

            {/* Team */}
            <div className="card-bordered p-6">
              <h3 className="font-semibold text-[hsl(var(--foreground))] mb-4">
                Project Team
              </h3>
              <div className="space-y-3">
                {project.team.map((member: any, index: number) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(var(--accent-primary))] to-[hsl(var(--accent-secondary))] flex items-center justify-center text-white font-medium text-sm">
                      {member.avatar}
                    </div>
                    <div>
                      <div className="font-medium text-sm text-[hsl(var(--foreground))]">
                        {member.name}
                      </div>
                      <div className="text-xs text-[hsl(var(--foreground-muted))]">
                        {member.role}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Documents */}
            <div className="card-bordered p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[hsl(var(--foreground))]">
                  Documents
                </h3>
                <Link 
                  href="/portal/documents"
                  className="text-sm text-[hsl(var(--accent-primary))] hover:underline"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-2">
                {project.documents.map((doc: any) => (
                  <div 
                    key={doc.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-[hsl(var(--bg-secondary))] transition-colors cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-[hsl(var(--accent-primary)/.1)] flex-shrink-0">
                      <FileText className="w-4 h-4 text-[hsl(var(--accent-primary))]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-[hsl(var(--foreground))] truncate">
                        {doc.name}
                      </h4>
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

            {/* Quick Actions */}
            <div className="card-bordered p-6">
              <h3 className="font-semibold text-[hsl(var(--foreground))] mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button className="w-full py-2.5 px-4 bg-[hsl(var(--accent-primary))] hover:bg-[hsl(var(--accent-primary))]/90 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2 text-sm">
                  <MessageSquare className="w-4 h-4" />
                  Contact Team
                </button>
                <button className="w-full py-2.5 px-4 bg-[hsl(var(--bg-secondary))] hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--foreground))] font-medium rounded-lg transition-all flex items-center justify-center gap-2 text-sm">
                  <FileText className="w-4 h-4" />
                  Request Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}