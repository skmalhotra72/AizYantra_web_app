'use client'

import { FolderOpen, Plus, Search, Filter, MoreHorizontal, Clock, Users, CheckCircle } from 'lucide-react'

export default function ProjectsPage() {
  const projects = [
    { id: 'PROJ-HC-2026-001', name: 'Apollo AI Voice Agent', client: 'Apollo Hospitals', status: 'in_progress', progress: 65, team: 4, dueDate: '2026-02-28' },
    { id: 'PROJ-HC-2026-002', name: 'Max Workflow Automation', client: 'Max Healthcare', status: 'planning', progress: 15, team: 3, dueDate: '2026-03-15' },
    { id: 'PROJ-HC-2026-003', name: 'Fortis Patient Portal', client: 'Fortis Healthcare', status: 'in_progress', progress: 40, team: 5, dueDate: '2026-03-30' },
    { id: 'PROJ-PS-2026-001', name: 'LegalTech AI Assistant', client: 'Khaitan & Co', status: 'completed', progress: 100, team: 2, dueDate: '2026-01-15' },
  ]

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string, text: string, label: string }> = {
      planning: { bg: 'bg-slate-100 dark:bg-slate-700', text: 'text-slate-700 dark:text-slate-300', label: 'Planning' },
      in_progress: { bg: 'bg-blue-100 dark:bg-blue-500/20', text: 'text-blue-700 dark:text-blue-400', label: 'In Progress' },
      on_hold: { bg: 'bg-yellow-100 dark:bg-yellow-500/20', text: 'text-yellow-700 dark:text-yellow-400', label: 'On Hold' },
      completed: { bg: 'bg-green-100 dark:bg-green-500/20', text: 'text-green-700 dark:text-green-400', label: 'Completed' },
    }
    return styles[status] || styles.planning
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Projects</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage client projects and deliverables</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((project) => {
          const status = getStatusBadge(project.status)
          return (
            <div
              key={project.id}
              className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-teal-500 dark:hover:border-teal-500 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{project.id}</p>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{project.name}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{project.client}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.bg} ${status.text}`}>
                  {status.label}
                </span>
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Progress</span>
                  <span className="font-medium text-slate-900 dark:text-white">{project.progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-500 rounded-full transition-all"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              {/* Meta info */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                    <Users className="w-4 h-4" />
                    <span>{project.team}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                    <Clock className="w-4 h-4" />
                    <span>{project.dueDate}</span>
                  </div>
                </div>
                <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}