'use client'

import { useState } from 'react'
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

// Mock data - will be replaced with Supabase
const allLeads = [
  { 
    id: '1',
    leadNumber: 'LEAD-2026-0001',
    organization: 'Apollo Hospitals',
    contact: 'Dr. Rajesh Kumar',
    email: 'rajesh.kumar@apollo.com',
    phone: '+91 98765 43210',
    status: 'qualified',
    source: 'LinkedIn',
    expectedValue: 2500000,
    probability: 60,
    serviceInterest: ['Voice Agents', 'AI Chatbots'],
    assignedTo: 'Sanjeev Malhotra',
    createdAt: '2026-01-20',
    lastActivity: '2 hours ago'
  },
  { 
    id: '2',
    leadNumber: 'LEAD-2026-0002',
    organization: 'Max Healthcare',
    contact: 'Priya Sharma',
    email: 'priya.sharma@maxhealthcare.com',
    phone: '+91 98765 43211',
    status: 'new',
    source: 'Website',
    expectedValue: 1500000,
    probability: 20,
    serviceInterest: ['Workflow Automation'],
    assignedTo: 'Kunal Bellur',
    createdAt: '2026-01-20',
    lastActivity: '5 hours ago'
  },
  { 
    id: '3',
    leadNumber: 'LEAD-2026-0003',
    organization: 'Fortis Diagnostics',
    contact: 'Amit Verma',
    email: 'amit.v@fortis.com',
    phone: '+91 98765 43212',
    status: 'proposal',
    source: 'Referral',
    expectedValue: 3500000,
    probability: 75,
    serviceInterest: ['AI Integration', 'Custom Development'],
    assignedTo: 'Sanjeev Malhotra',
    createdAt: '2026-01-19',
    lastActivity: '1 day ago'
  },
  { 
    id: '4',
    leadNumber: 'LEAD-2026-0004',
    organization: 'Medanta Labs',
    contact: 'Dr. Sneha Gupta',
    email: 's.gupta@medanta.org',
    phone: '+91 98765 43213',
    status: 'contacted',
    source: 'Voice Agent',
    expectedValue: 2000000,
    probability: 40,
    serviceInterest: ['Voice Agents'],
    assignedTo: 'Abdul Aziz',
    createdAt: '2026-01-18',
    lastActivity: '2 days ago'
  },
  { 
    id: '5',
    leadNumber: 'LEAD-2026-0005',
    organization: 'Narayana Health',
    contact: 'Vikram Singh',
    email: 'v.singh@narayana.com',
    phone: '+91 98765 43214',
    status: 'negotiation',
    source: 'Cold Outreach',
    expectedValue: 4500000,
    probability: 85,
    serviceInterest: ['Fractional CTO', 'AI Strategy'],
    assignedTo: 'Sanjeev Malhotra',
    createdAt: '2026-01-15',
    lastActivity: '3 hours ago'
  },
  { 
    id: '6',
    leadNumber: 'LEAD-2026-0006',
    organization: 'SRL Diagnostics',
    contact: 'Anita Desai',
    email: 'anita.d@srl.com',
    phone: '+91 98765 43215',
    status: 'won',
    source: 'LinkedIn',
    expectedValue: 1800000,
    probability: 100,
    serviceInterest: ['AI Chatbots', 'Workflow Automation'],
    assignedTo: 'Kunal Bellur',
    createdAt: '2026-01-10',
    lastActivity: '1 week ago'
  },
  { 
    id: '7',
    leadNumber: 'LEAD-2026-0007',
    organization: 'Manipal Hospitals',
    contact: 'Dr. Ravi Menon',
    email: 'ravi.m@manipal.edu',
    phone: '+91 98765 43216',
    status: 'lost',
    source: 'Website',
    expectedValue: 2200000,
    probability: 0,
    serviceInterest: ['Voice Agents'],
    assignedTo: 'Abdul Aziz',
    createdAt: '2026-01-08',
    lastActivity: '2 weeks ago'
  },
  { 
    id: '8',
    leadNumber: 'LEAD-2026-0008',
    organization: 'Columbia Asia',
    contact: 'Sarah Chen',
    email: 'sarah.c@columbiaasia.com',
    phone: '+91 98765 43217',
    status: 'new',
    source: 'WhatsApp',
    expectedValue: 1200000,
    probability: 15,
    serviceInterest: ['AI Integration'],
    assignedTo: 'Sanjeev Malhotra',
    createdAt: '2026-01-21',
    lastActivity: '1 hour ago'
  },
]

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
  { value: 'Website', label: 'Website' },
  { value: 'LinkedIn', label: 'LinkedIn' },
  { value: 'Referral', label: 'Referral' },
  { value: 'Voice Agent', label: 'Voice Agent' },
  { value: 'WhatsApp', label: 'WhatsApp' },
  { value: 'Cold Outreach', label: 'Cold Outreach' },
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
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [showNewLeadModal, setShowNewLeadModal] = useState(false)
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])

  // Filter leads
  const filteredLeads = allLeads.filter(lead => {
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