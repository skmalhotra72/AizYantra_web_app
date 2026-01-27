'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  Search,
  Filter,
  Plus,
  ChevronDown,
  MoreHorizontal,
  Phone,
  Mail,
  Building2,
  Calendar,
  ArrowUpDown,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  User,
  DollarSign,
  Tag
} from 'lucide-react'
import { supabase } from '@/lib/innovation/i2e-db'

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
]

const sourceOptions = [
  { value: 'all', label: 'All Sources' },
  { value: 'website', label: 'Website' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'referral', label: 'Referral' },
  { value: 'voice_agent', label: 'Voice Agent' },
  { value: 'voice_call', label: 'Voice Call' },
  { value: 'ai_assessment', label: 'AI Assessment' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'cold_outreach', label: 'Cold Outreach' },
]

const statusColors: Record<string, string> = {
  new: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  contacted: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  qualified: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  proposal: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  negotiation: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  won: 'bg-green-500/10 text-green-500 border-green-500/20',
  lost: 'bg-red-500/10 text-red-500 border-red-500/20',
}

const formatCurrency = (value: number) => {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(1)}Cr`
  } else if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`
  }
  return `₹${value.toLocaleString()}`
}

export default function LeadsPage() {
  const searchParams = useSearchParams()
  const sourceFromUrl = searchParams.get('source') || 'all'

  const [leads, setLeads] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState(sourceFromUrl)
  const [showNewLeadModal, setShowNewLeadModal] = useState(false)
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])

  // Update source filter when URL param changes
  useEffect(() => {
    setSourceFilter(sourceFromUrl)
  }, [sourceFromUrl])

  // Load leads from Supabase
  useEffect(() => {
    loadLeads()
  }, [])

  const loadLeads = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          contact:contact_id(name, email, phone),
          organization:organization_id(name, industry)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Format data to match component structure
      const formattedLeads = (data || []).map((lead: any) => ({
        id: lead.id,
        leadNumber: lead.lead_number,
        organization: lead.organization?.name || 'Unknown',
        contact: lead.contact?.name || 'Unknown',
        email: lead.contact?.email || '',
        phone: lead.contact?.phone || '',
        status: lead.status,
        source: lead.source,
        expectedValue: 0, // Can be added to DB later
        probability: lead.score || 0,
        serviceInterest: [],
        assignedTo: 'Unassigned', // Can be added to DB later
        createdAt: new Date(lead.created_at).toLocaleDateString(),
        lastActivity: 'Recently'
      }))

      setLeads(formattedLeads)
    } catch (error) {
      console.error('Error loading leads:', error)
      // Fallback to empty array on error
      setLeads([])
    } finally {
      setIsLoading(false)
    }
  }

  // Filter leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.leadNumber.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter
    const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter

    return matchesSearch && matchesStatus && matchesSource
  })

  const toggleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([])
    } else {
      setSelectedLeads(filteredLeads.map(l => l.id))
    }
  }

  const toggleSelectLead = (id: string) => {
    if (selectedLeads.includes(id)) {
      setSelectedLeads(selectedLeads.filter(l => l !== id))
    } else {
      setSelectedLeads([...selectedLeads, id])
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--bg-primary))] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[hsl(var(--accent-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[hsl(var(--foreground-muted))]">Loading leads...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-primary))]">
      {/* Header */}
      <div className="border-b border-[hsl(var(--border))]">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/crm"
                className="p-2 hover:bg-[hsl(var(--bg-secondary))] rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-[hsl(var(--foreground-muted))]" />
              </Link>
              <div>
                <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
                  Leads
                </h1>
                <p className="text-sm text-[hsl(var(--foreground-muted))] mt-1">
                  {filteredLeads.length} leads found
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowNewLeadModal(true)}
              className="btn-tactile btn-tactile-primary"
            >
              <Plus className="w-4 h-4" />
              Add Lead
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--foreground-muted))]" />
            <input
              type="text"
              placeholder="Search leads by name, email, or lead number..."
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
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--foreground-muted))] pointer-events-none" />
          </div>

          {/* Source Filter */}
          <div className="relative">
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-primary))] focus:border-transparent transition-all cursor-pointer"
            >
              {sourceOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--foreground-muted))] pointer-events-none" />
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedLeads.length > 0 && (
          <div className="flex items-center gap-4 mb-4 p-3 bg-[hsl(var(--accent-primary)/.1)] border border-[hsl(var(--accent-primary)/.2)] rounded-lg">
            <span className="text-sm font-medium text-[hsl(var(--foreground))]">
              {selectedLeads.length} selected
            </span>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-sm bg-[hsl(var(--bg-tertiary))] hover:bg-[hsl(var(--bg-secondary))] rounded-lg transition-colors">
                Update Status
              </button>
              <button className="px-3 py-1.5 text-sm bg-[hsl(var(--bg-tertiary))] hover:bg-[hsl(var(--bg-secondary))] rounded-lg transition-colors">
                Assign To
              </button>
              <button className="px-3 py-1.5 text-sm text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors">
                Delete
              </button>
            </div>
            <button 
              onClick={() => setSelectedLeads([])}
              className="ml-auto p-1 hover:bg-[hsl(var(--bg-secondary))] rounded transition-colors"
            >
              <X className="w-4 h-4 text-[hsl(var(--foreground-muted))]" />
            </button>
          </div>
        )}

        {/* Leads Table */}
        <div className="card-bordered overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[hsl(var(--bg-secondary))]">
                  <th className="text-left py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-[hsl(var(--border))] text-[hsl(var(--accent-primary))] focus:ring-[hsl(var(--accent-primary))]"
                    />
                  </th>
                  <th className="text-left py-3 px-4">
                    <button className="flex items-center gap-1 text-xs font-medium text-[hsl(var(--foreground-muted))] uppercase tracking-wider hover:text-[hsl(var(--foreground))]">
                      Lead
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-[hsl(var(--foreground-muted))] uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-[hsl(var(--foreground-muted))] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left py-3 px-4">
                    <button className="flex items-center gap-1 text-xs font-medium text-[hsl(var(--foreground-muted))] uppercase tracking-wider hover:text-[hsl(var(--foreground))]">
                      Value
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-[hsl(var(--foreground-muted))] uppercase tracking-wider">
                    Source
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-[hsl(var(--foreground-muted))] uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-[hsl(var(--foreground-muted))] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr 
                    key={lead.id} 
                    className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--bg-secondary)/.5)] transition-colors"
                  >
                    <td className="py-4 px-4">
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead.id)}
                        onChange={() => toggleSelectLead(lead.id)}
                        className="w-4 h-4 rounded border-[hsl(var(--border))] text-[hsl(var(--accent-primary))] focus:ring-[hsl(var(--accent-primary))]"
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-[hsl(var(--foreground-muted))]" />
                          <span className="font-medium text-[hsl(var(--foreground))]">
                            {lead.organization}
                          </span>
                        </div>
                        <div className="text-xs text-[hsl(var(--foreground-subtle))] mt-1 font-mono">
                          {lead.leadNumber}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <User className="w-3 h-3 text-[hsl(var(--foreground-muted))]" />
                          <span className="text-sm text-[hsl(var(--foreground))]">
                            {lead.contact}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <a href={`mailto:${lead.email}`} className="flex items-center gap-1 text-xs text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--accent-primary))]">
                            <Mail className="w-3 h-3" />
                            {lead.email}
                          </a>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize border ${statusColors[lead.status]}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-semibold text-[hsl(var(--foreground))]">
                          {formatCurrency(lead.expectedValue)}
                        </div>
                        <div className="text-xs text-[hsl(var(--foreground-muted))]">
                          {lead.probability}% probability
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-[hsl(var(--bg-secondary))] rounded text-xs text-[hsl(var(--foreground-muted))]">
                        <Tag className="w-3 h-3" />
                        {lead.source}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-[hsl(var(--foreground-muted))]">
                        {lead.assignedTo}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          className="p-2 hover:bg-[hsl(var(--bg-tertiary))] rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-[hsl(var(--foreground-muted))]" />
                        </button>
                        <button 
                          className="p-2 hover:bg-[hsl(var(--bg-tertiary))] rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-[hsl(var(--foreground-muted))]" />
                        </button>
                        <button 
                          className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-[hsl(var(--border))]">
            <div className="text-sm text-[hsl(var(--foreground-muted))]">
              Showing 1-{filteredLeads.length} of {filteredLeads.length} leads
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-[hsl(var(--bg-secondary))] rounded-lg transition-colors disabled:opacity-50" disabled>
                <ChevronLeft className="w-4 h-4 text-[hsl(var(--foreground-muted))]" />
              </button>
              <span className="px-3 py-1 bg-[hsl(var(--accent-primary))] text-white text-sm rounded-lg">1</span>
              <button className="p-2 hover:bg-[hsl(var(--bg-secondary))] rounded-lg transition-colors disabled:opacity-50" disabled>
                <ChevronRight className="w-4 h-4 text-[hsl(var(--foreground-muted))]" />
              </button>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredLeads.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-[hsl(var(--bg-secondary))] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-[hsl(var(--foreground-muted))]" />
            </div>
            <h3 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-2">No leads found</h3>
            <p className="text-[hsl(var(--foreground-muted))] mb-6">Try adjusting your search or filter criteria</p>
            <button 
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('all')
                setSourceFilter('all')
              }}
              className="text-[hsl(var(--accent-primary))] hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* New Lead Modal */}
      {showNewLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowNewLeadModal(false)}
          />
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-2xl shadow-2xl m-4">
            <div className="sticky top-0 bg-[hsl(var(--bg-tertiary))] border-b border-[hsl(var(--border))] px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">Add New Lead</h2>
              <button 
                onClick={() => setShowNewLeadModal(false)}
                className="p-2 hover:bg-[hsl(var(--bg-secondary))] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[hsl(var(--foreground-muted))]" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Organization Info */}
              <div>
                <h3 className="text-sm font-medium text-[hsl(var(--foreground))] mb-4 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Organization
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[hsl(var(--foreground-muted))] mb-1">Organization Name *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Apollo Hospitals"
                      className="w-full px-3 py-2 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-subtle))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-primary))]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[hsl(var(--foreground-muted))] mb-1">Industry</label>
                    <select className="w-full px-3 py-2 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-primary))]">
                      <option value="">Select industry</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="diagnostics">Diagnostics</option>
                      <option value="pharma">Pharma</option>
                      <option value="professional_services">Professional Services</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="text-sm font-medium text-[hsl(var(--foreground))] mb-4 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Primary Contact
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[hsl(var(--foreground-muted))] mb-1">Contact Name *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Dr. Rajesh Kumar"
                      className="w-full px-3 py-2 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-subtle))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-primary))]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[hsl(var(--foreground-muted))] mb-1">Role</label>
                    <input 
                      type="text" 
                      placeholder="e.g. CTO"
                      className="w-full px-3 py-2 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-subtle))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-primary))]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[hsl(var(--foreground-muted))] mb-1">Email *</label>
                    <input 
                      type="email" 
                      placeholder="email@company.com"
                      className="w-full px-3 py-2 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-subtle))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-primary))]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[hsl(var(--foreground-muted))] mb-1">Phone</label>
                    <input 
                      type="tel" 
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-subtle))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-primary))]"
                    />
                  </div>
                </div>
              </div>

              {/* Lead Details */}
              <div>
                <h3 className="text-sm font-medium text-[hsl(var(--foreground))] mb-4 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Lead Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[hsl(var(--foreground-muted))] mb-1">Source *</label>
                    <select className="w-full px-3 py-2 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-primary))]">
                      <option value="">Select source</option>
                      <option value="website">Website</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="referral">Referral</option>
                      <option value="voice_agent">Voice Agent</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="cold_outreach">Cold Outreach</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-[hsl(var(--foreground-muted))] mb-1">Expected Value</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 25,00,000"
                      className="w-full px-3 py-2 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-subtle))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-primary))]"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm text-[hsl(var(--foreground-muted))] mb-1">Services Interested In</label>
                    <div className="flex flex-wrap gap-2">
                      {['Voice Agents', 'AI Chatbots', 'Workflow Automation', 'AI Integration', 'Fractional CTO', 'Custom Development'].map(service => (
                        <label key={service} className="flex items-center gap-2 px-3 py-1.5 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg cursor-pointer hover:border-[hsl(var(--accent-primary))] transition-colors">
                          <input type="checkbox" className="w-4 h-4 rounded border-[hsl(var(--border))] text-[hsl(var(--accent-primary))] focus:ring-[hsl(var(--accent-primary))]" />
                          <span className="text-sm text-[hsl(var(--foreground))]">{service}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm text-[hsl(var(--foreground-muted))] mb-1">Notes</label>
                <textarea 
                  rows={3}
                  placeholder="Any additional information about this lead..."
                  className="w-full px-3 py-2 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-subtle))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-primary))] resize-none"
                />
              </div>
            </div>
            <div className="sticky bottom-0 bg-[hsl(var(--bg-tertiary))] border-t border-[hsl(var(--border))] px-6 py-4 flex items-center justify-end gap-3">
              <button 
                onClick={() => setShowNewLeadModal(false)}
                className="btn-tactile btn-tactile-outline"
              >
                Cancel
              </button>
              <button className="btn-tactile btn-tactile-primary">
                <Plus className="w-4 h-4" />
                Create Lead
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}