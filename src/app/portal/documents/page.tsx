'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  Search,
  FileText,
  Download,
  Eye,
  File,
  FileSpreadsheet,
  Calendar,
  ChevronDown,
  FolderOpen,
  Loader2
} from 'lucide-react'

interface Document {
  id: string
  name: string
  description: string | null
  file_type: string | null
  mime_type: string | null
  file_size: number | null
  url: string | null
  category: string | null
  tags: string[] | null
  created_at: string
  project_id: string | null
  projects?: {
    name: string
  }
}

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
  { value: 'image', label: 'Image' },
]

const getFileIcon = (fileType: string | null, mimeType: string | null) => {
  const type = fileType?.toLowerCase() || mimeType?.toLowerCase() || ''
  
  if (type.includes('pdf')) {
    return <FileText className="w-5 h-5 text-red-500" />
  }
  if (type.includes('doc') || type.includes('word')) {
    return <FileText className="w-5 h-5 text-blue-500" />
  }
  if (type.includes('sheet') || type.includes('excel') || type.includes('xls')) {
    return <FileSpreadsheet className="w-5 h-5 text-green-500" />
  }
  if (type.includes('presentation') || type.includes('ppt') || type.includes('powerpoint')) {
    return <FileText className="w-5 h-5 text-orange-500" />
  }
  if (type.includes('image') || type.includes('png') || type.includes('jpg') || type.includes('jpeg')) {
    return <File className="w-5 h-5 text-purple-500" />
  }
  return <File className="w-5 h-5 text-gray-500" />
}

const getFileType = (fileType: string | null, mimeType: string | null): string => {
  const type = fileType?.toLowerCase() || mimeType?.toLowerCase() || ''
  
  if (type.includes('pdf')) return 'pdf'
  if (type.includes('doc') || type.includes('word')) return 'document'
  if (type.includes('sheet') || type.includes('excel') || type.includes('xls')) return 'spreadsheet'
  if (type.includes('presentation') || type.includes('ppt') || type.includes('powerpoint')) return 'presentation'
  if (type.includes('image') || type.includes('png') || type.includes('jpg') || type.includes('jpeg')) return 'image'
  return 'other'
}

const formatFileSize = (bytes: number | null): string => {
  if (!bytes) return 'Unknown size'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
}

export default function DocumentsPage() {
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    const fetchDocuments = async () => {
      const supabase = createClient()
      
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.error('No authenticated user:', userError)
        router.push('/portal/login')
        return
      }

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
        const { data: documentsData, error: documentsError } = await supabase
          .from('documents')
          .select('*, projects(name)')
          .eq('organization_id', contact.organization_id)
          .eq('is_client_visible', true)
          .order('created_at', { ascending: false })

        if (documentsError) {
          console.error('Error fetching documents:', documentsError)
        } else if (documentsData) {
          setDocuments(documentsData)
        }
      }

      setIsLoading(false)
    }

    fetchDocuments()
  }, [router])

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.category && doc.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.projects?.name && doc.projects.name.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter
    
    const docType = getFileType(doc.file_type, doc.mime_type)
    const matchesType = typeFilter === 'all' || docType === typeFilter

    return matchesSearch && matchesCategory && matchesType
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--bg-primary))] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[hsl(var(--accent-primary))] animate-spin mx-auto mb-4" />
          <p className="text-[hsl(var(--foreground-muted))]">Loading documents...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-primary))]">
      <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary))]">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Documents</h1>
          <p className="text-[hsl(var(--foreground-muted))] mt-1">{filteredDocuments.length} documents available</p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {documents.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-[hsl(var(--accent-primary)/.1)] rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-[hsl(var(--accent-primary))]" />
            </div>
            <h3 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-2">No documents yet</h3>
            <p className="text-[hsl(var(--foreground-muted))]">Documents shared with you will appear here</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row gap-4">
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

            {filteredDocuments.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-[hsl(var(--bg-secondary))] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-[hsl(var(--foreground-muted))]" />
                </div>
                <h3 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-2">No documents found</h3>
                <p className="text-[hsl(var(--foreground-muted))]">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredDocuments.map((doc) => (
                  <div key={doc.id} className="card-bordered p-4 hover:border-[hsl(var(--accent-primary)/.3)] hover:shadow-lg transition-all group">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-[hsl(var(--bg-secondary))] flex-shrink-0">
                        {getFileIcon(doc.file_type, doc.mime_type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[hsl(var(--foreground))] mb-1 truncate group-hover:text-[hsl(var(--accent-primary))] transition-colors">
                          {doc.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-[hsl(var(--foreground-muted))]">
                          {doc.category && (
                            <span className="px-2 py-0.5 bg-[hsl(var(--bg-secondary))] rounded text-xs">
                              {doc.category}
                            </span>
                          )}
                          {doc.projects?.name && (
                            <span className="flex items-center gap-1">
                              <FolderOpen className="w-3 h-3" />
                              {doc.projects.name}
                            </span>
                          )}
                          <span>{formatFileSize(doc.file_size)}</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(doc.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {doc.url && (
                          <>
                            <button onClick={() => window.open(doc.url || '', '_blank')} className="p-2 hover:bg-[hsl(var(--bg-secondary))] rounded-lg transition-colors" title="Preview">
                              <Eye className="w-5 h-5 text-[hsl(var(--foreground-muted))]" />
                            </button>
                            <a href={doc.url || ''} download className="p-2 hover:bg-[hsl(var(--accent-primary)/.1)] rounded-lg transition-colors" title="Download">
                              <Download className="w-5 h-5 text-[hsl(var(--accent-primary))]" />
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}