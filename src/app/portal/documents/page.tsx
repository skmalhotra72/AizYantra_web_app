'use client'

import { useState } from 'react'
import { 
  Search,
  Filter,
  FileText,
  Download,
  Eye,
  File,
  Image,
  FileSpreadsheet,
  FileArchive,
  Calendar,
  ChevronDown,
  FolderOpen
} from 'lucide-react'

// Mock data - will be replaced with Supabase
const allDocuments = [
  {
    id: 'doc-1',
    name: 'Technical Architecture v3.pdf',
    type: 'pdf',
    size: '2.4 MB',
    category: 'Technical',
    project: 'AI Voice Agent Integration',
    projectId: 'proj-1',
    uploadedAt: '2026-01-19',
    uploadedBy: 'Rohan Balu',
  },
  {
    id: 'doc-2',
    name: 'API Integration Guide.pdf',
    type: 'pdf',
    size: '1.8 MB',
    category: 'Documentation',
    project: 'AI Voice Agent Integration',
    projectId: 'proj-1',
    uploadedAt: '2026-01-17',
    uploadedBy: 'Kumar Pushpam',
  },
  {
    id: 'doc-3',
    name: 'Sprint Review Presentation.pptx',
    type: 'presentation',
    size: '8.1 MB',
    category: 'Review',
    project: 'AI Voice Agent Integration',
    projectId: 'proj-1',
    uploadedAt: '2026-01-15',
    uploadedBy: 'Rohan Balu',
  },
  {
    id: 'doc-4',
    name: 'Project Timeline - Updated.xlsx',
    type: 'spreadsheet',
    size: '156 KB',
    category: 'Planning',
    project: 'AI Voice Agent Integration',
    projectId: 'proj-1',
    uploadedAt: '2026-01-20',
    uploadedBy: 'Kunal Bellur',
  },
  {
    id: 'doc-5',
    name: 'Workflow Design Document.pdf',
    type: 'pdf',
    size: '3.2 MB',
    category: 'Design',
    project: 'Workflow Automation System',
    projectId: 'proj-2',
    uploadedAt: '2026-01-19',
    uploadedBy: 'Kunal Bellur',
  },
  {
    id: 'doc-6',
    name: 'Process Flow Diagrams.pdf',
    type: 'pdf',
    size: '4.5 MB',
    category: 'Design',
    project: 'Workflow Automation System',
    projectId: 'proj-2',
    uploadedAt: '2026-01-18',
    uploadedBy: 'Abdul Aziz',
  },
  {
    id: 'doc-7',
    name: 'Requirements Specification.docx',
    type: 'document',
    size: '890 KB',
    category: 'Requirements',
    project: 'Workflow Automation System',
    projectId: 'proj-2',
    uploadedAt: '2026-01-16',
    uploadedBy: 'Kunal Bellur',
  },
  {
    id: 'doc-8',
    name: 'Project Kickoff Recording.mp4',
    type: 'video',
    size: '125 MB',
    category: 'Meetings',
    project: 'AI Voice Agent Integration',
    projectId: 'proj-1',
    uploadedAt: '2026-01-10',
    uploadedBy: 'Sanjeev Malhotra',
  },
]

const categoryOptions = [
  { value: 'all', label: 'All Categories' },
  { value: 'Technical', label: 'Technical' },
  { value: 'Documentation', label: 'Documentation' },
  { value: 'Design', label: 'Design' },
  { value: 'Planning', label: 'Planning' },
  { value: 'Review', label: 'Review' },
  { value: 'Requirements', label: 'Requirements' },
  { value: 'Meetings', label: 'Meetings' },
]

const typeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'pdf', label: 'PDF' },
  { value: 'document', label: 'Document' },
  { value: 'spreadsheet', label: 'Spreadsheet' },
  { value: 'presentation', label: 'Presentation' },
  { value: 'video', label: 'Video' },
]

const getFileIcon = (type: string) => {
  switch (type) {
    case 'pdf':
      return <FileText className="w-5 h-5 text-red-500" />
    case 'document':
      return <FileText className="w-5 h-5 text-blue-500" />
    case 'spreadsheet':
      return <FileSpreadsheet className="w-5 h-5 text-green-500" />
    case 'presentation':
      return <FileText className="w-5 h-5 text-orange-500" />
    case 'video':
      return <File className="w-5 h-5 text-purple-500" />
    default:
      return <File className="w-5 h-5 text-gray-500" />
  }
}

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  // Filter documents
  const filteredDocuments = allDocuments.filter(doc => {
    const matchesSearch = 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.project.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter
    const matchesType = typeFilter === 'all' || doc.type === typeFilter

    return matchesSearch && matchesCategory && matchesType
  })

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-primary))]">
      {/* Header */}
      <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary))]">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
            Documents
          </h1>
          <p className="text-[hsl(var(--foreground-muted))] mt-1">
            {filteredDocuments.length} documents available
          </p>
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
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-subtle))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-primary))] focus:border-transparent transition-all"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-primary))] focus:border-transparent transition-all cursor-pointer"
            >
              {categoryOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--foreground-muted))] pointer-events-none" />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-primary))] focus:border-transparent transition-all cursor-pointer"
            >
              {typeOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--foreground-muted))] pointer-events-none" />
          </div>
        </div>

        {/* Documents Grid */}
        <div className="grid gap-4">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className="card-bordered p-4 hover:border-[hsl(var(--accent-primary)/.3)] hover:shadow-lg transition-all group"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="p-3 rounded-lg bg-[hsl(var(--bg-secondary))] flex-shrink-0">
                  {getFileIcon(doc.type)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[hsl(var(--foreground))] mb-1 truncate group-hover:text-[hsl(var(--accent-primary))] transition-colors">
                    {doc.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-[hsl(var(--foreground-muted))]">
                    <span className="px-2 py-0.5 bg-[hsl(var(--bg-secondary))] rounded text-xs">
                      {doc.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <FolderOpen className="w-3 h-3" />
                      {doc.project}
                    </span>
                    <span>{doc.size}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(doc.uploadedAt).toLocaleDateString('en-IN', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                    <span>by {doc.uploadedBy}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button 
                    className="p-2 hover:bg-[hsl(var(--bg-secondary))] rounded-lg transition-colors"
                    title="Preview"
                  >
                    <Eye className="w-5 h-5 text-[hsl(var(--foreground-muted))]" />
                  </button>
                  <button 
                    className="p-2 hover:bg-[hsl(var(--accent-primary)/.1)] rounded-lg transition-colors"
                    title="Download"
                  >
                    <Download className="w-5 h-5 text-[hsl(var(--accent-primary))]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredDocuments.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-[hsl(var(--bg-secondary))] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-[hsl(var(--foreground-muted))]" />
            </div>
            <h3 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-2">No documents found</h3>
            <p className="text-[hsl(var(--foreground-muted))]">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}