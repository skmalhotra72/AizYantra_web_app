'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Search,
  Filter,
  Plus,
  ChevronDown,
  MoreHorizontal,
  Building2,
  ChevronLeft,
  ArrowUpDown,
  Eye,
  Edit,
  Trash2,
  X,
  MapPin,
  Users,
  TrendingUp,
  FileText,
  Globe,
  Briefcase,
  DollarSign
} from 'lucide-react'

// Mock data - will be replaced with Supabase
const allOrganizations = [
  {
    id: 'org-1',
    name: 'Apollo Hospitals',
    legalName: 'Apollo Hospitals Enterprise Limited',
    industry: 'Healthcare',
    organizationType: 'Hospital Chain',
    website: 'https://www.apollohospitals.com',
    employeeCount: '70,000+',
    annualRevenue: '₹10,000+ Cr',
    location: 'Chennai, Tamil Nadu',
    contactsCount: 3,
    activeLeadsCount: 2,
    activeProjectsCount: 0,
    totalContractValue: 0,
    logoUrl: null,
    tags: ['Enterprise', 'Healthcare'],
    status: 'prospect',
    createdAt: '2026-01-15'
  },
  {
    id: 'org-2',
    name: 'Max Healthcare',
    legalName: 'Max Healthcare Institute Limited',
    industry: 'Healthcare',
    organizationType: 'Hospital Chain',
    website: 'https://www.maxhealthcare.in',
    employeeCount: '10,000+',
    annualRevenue: '₹4,000+ Cr',
    location: 'Delhi NCR',
    contactsCount: 2,
    activeLeadsCount: 1,
    activeProjectsCount: 0,
    totalContractValue: 0,
    logoUrl: null,
    tags: ['Enterprise', 'Healthcare'],
    status: 'prospect',
    createdAt: '2026-01-18'
  },
  {
    id: 'org-3',
    name: 'Fortis Diagnostics',
    legalName: 'Fortis Healthcare Limited',
    industry: 'Healthcare',
    organizationType: 'Diagnostic Lab',
    website: 'https://www.fortishealthcare.com',
    employeeCount: '5,000+',
    annualRevenue: '₹2,500+ Cr',
    location: 'Bangalore, Karnataka',
    contactsCount: 2,
    activeLeadsCount: 1,
    activeProjectsCount: 0,
    totalContractValue: 3500000,
    logoUrl: null,
    tags: ['Enterprise', 'Healthcare', 'Diagnostics'],
    status: 'negotiating',
    createdAt: '2026-01-10'
  },
  {
    id: 'org-4',
    name: 'Medanta Labs',
    legalName: 'Medanta Holdings Private Limited',
    industry: 'Healthcare',
    organizationType: 'Diagnostic Lab',
    website: 'https://www.medanta.org',
    employeeCount: '2,000+',
    annualRevenue: '₹1,500+ Cr',
    location: 'Gurugram, Haryana',
    contactsCount: 1,
    activeLeadsCount: 1,
    activeProjectsCount: 0,
    totalContractValue: 0,
    logoUrl: null,
    tags: ['Healthcare', 'Diagnostics'],
    status: 'prospect',
    createdAt: '2026-01-12'
  },
  {
    id: 'org-5',
    name: 'Narayana Health',
    legalName: 'Narayana Hrudayalaya Limited',
    industry: 'Healthcare',
    organizationType: 'Hospital Chain',
    website: 'https://www.narayanahealth.org',
    employeeCount: '15,000+',
    annualRevenue: '₹3,500+ Cr',
    location: 'Bangalore, Karnataka',
    contactsCount: 2,
    activeLeadsCount: 1,
    activeProjectsCount: 0,
    totalContractValue: 4500000,
    logoUrl: null,
    tags: ['Enterprise', 'Healthcare', 'Hot Lead'],
    status: 'negotiating',
    createdAt: '2026-01-05'
  },
  {
    id: 'org-6',
    name: 'SRL Diagnostics',
    legalName: 'SRL Limited',
    industry: 'Healthcare',
    organizationType: 'Diagnostic Lab',
    website: 'https://www.srldiagnostics.com',
    employeeCount: '8,000+',
    annualRevenue: '₹2,000+ Cr',
    location: 'Mumbai, Maharashtra',
    contactsCount: 1,
    activeLeadsCount: 0,
    activeProjectsCount: 1,
    totalContractValue: 1800000,
    logoUrl: null,
    tags: ['Client', 'Healthcare', 'Diagnostics'],
    status: 'active_client',
    createdAt: '2025-12-01'
  },
  {
    id: 'org-7',
    name: 'Manipal Hospitals',
    legalName: 'Manipal Hospitals Private Limited',
    industry: 'Healthcare',
    organizationType: 'Hospital Chain',
    website: 'https://www.manipalhospitals.com',
    employeeCount: '12,000+',
    annualRevenue: '₹3,000+ Cr',
    location: 'Bangalore, Karnataka',
    contactsCount: 1,
    activeLeadsCount: 0,
    activeProjectsCount: 0,
    totalContractValue: 0,
    logoUrl: null,
    tags: ['Healthcare', 'Lost Deal'],
    status: 'lost',
    createdAt: '2025-11-15'
  },
  {
    id: 'org-8',
    name: 'Columbia Asia',
    legalName: 'Columbia Asia Hospitals Private Limited',
    industry: 'Healthcare',
    organizationType: 'Hospital Chain',
    website: 'https://www.columbiaasia.com',
    employeeCount: '3,000+',
    annualRevenue: '₹1,200+ Cr',
    location: 'Bangalore, Karnataka',
    contactsCount: 1,
    activeLeadsCount: 1,
    activeProjectsCount: 0,
    totalContractValue: 0,
    logoUrl: null,
    tags: ['Healthcare', 'New'],
    status: 'prospect',
    createdAt: '2026-01-21'
  },
]

const industryOptions = [
  { value: 'all', label: 'All Industries' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'diagnostics', label: 'Diagnostics' },
  { value: 'pharma', label: 'Pharma' },
  { value: 'professional_services', label: 'Professional Services' },
  { value: 'other', label: 'Other' },
]

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'prospect', label: 'Prospect' },
  { value: 'negotiating', label: 'Negotiating' },
  { value: 'active_client', label: 'Active Client' },
  { value: 'past_client', label: 'Past Client' },
  { value: 'lost', label: 'Lost' },
]

const statusColors: Record<string, string> = {
  prospect: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  negotiating: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  active_client: 'bg-green-500/10 text-green-500 border-green-500/20',
  past_client: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  lost: 'bg-red-500/10 text-red-500 border-red-500/20',
}

const formatCurrency = (value: number) => {
  if (value === 0) return '₹0'
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(1)}Cr`
  } else if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`
  }
  return `₹${value.toLocaleString()}`
}

export default function OrganizationsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [industryFilter, setIndustryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showNewOrgModal, setShowNewOrgModal] = useState(false)
  const [selectedOrgs, setSelectedOrgs] = useState<string[]>([])

  // Filter organizations
  const filteredOrganizations = allOrganizations.filter(org => {
    const matchesSearch = 
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.organizationType.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesIndustry = industryFilter === 'all' || 
      org.industry.toLowerCase() === industryFilter.toLowerCase()
    
    const matchesStatus = statusFilter === 'all' || org.status === statusFilter

    return matchesSearch && matchesIndustry && matchesStatus
  })

  const toggleSelectAll = () => {
    if (selectedOrgs.length === filteredOrganizations.length) {
      setSelectedOrgs([])
    } else {
      setSelectedOrgs(filteredOrganizations.map(o => o.id))
    }
  }

  const toggleSelectOrg = (id: string) => {
    if (selectedOrgs.includes(id)) {
      setSelectedOrgs(selectedOrgs.filter(o => o !== id))
    } else {
      setSelectedOrgs([...selectedOrgs, id])
    }
  }

  // Get initials for logo
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Calculate summary stats
  const totalOrgs = filteredOrganizations.length
  const activeClients = filteredOrganizations.filter(o => o.status === 'active_client').length
  const totalPipelineValue = filteredOrganizations.reduce((sum, org) => sum + org.totalContractValue, 0)

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
                  Organizations
                </h1>
                <p className="text-sm text-[hsl(var(--foreground-muted))] mt-1">
                  {totalOrgs} organizations • {activeClients} active clients • {formatCurrency(totalPipelineValue)} pipeline
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowNewOrgModal(true)}
              className="btn-tactile btn-tactile-primary"
            >
              <Plus className="w-4 h-4" />
              Add Organization
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
              placeholder="Search organizations by name, location, or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-subtle))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-primary))] focus:border-transparent transition-all"
            />
          </div>

          {/* Industry Filter */}
          <div className="relative">
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-primary))] focus:border-transparent transition-all cursor-pointer"
            >
              {industryOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--foreground-muted))] pointer-events-none" />
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
        </div>

        {/* Bulk Actions Bar */}
        {selectedOrgs.length > 0 && (
          <div className="flex items-center gap-4 mb-4 p-3 bg-[hsl(var(--accent-primary)/.1)] border border-[hsl(var(--accent-primary)/.2)] rounded-lg">
            <span className="text-sm font-medium text-[hsl(var(--foreground))]">
              {selectedOrgs.length} selected
            </span>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-sm bg-[hsl(var(--bg-tertiary))] hover:bg-[hsl(var(--bg-secondary))] rounded-lg transition-colors">
                Export
              </button>
              <button className="px-3 py-1.5 text-sm bg-[hsl(var(--bg-tertiary))] hover:bg-[hsl(var(--bg-secondary))] rounded-lg transition-colors">
                Add Tags
              </button>
              <button className="px-3 py-1.5 text-sm text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors">
                Delete
              </button>
            </div>
            <button 
              onClick={() => setSelectedOrgs([])}
              className="ml-auto p-1 hover:bg-[hsl(var(--bg-secondary))] rounded transition-colors"
            >
              <X className="w-4 h-4 text-[hsl(var(--foreground-muted))]" />
            </button>
          </div>
        )}

        {/* Organizations Table */}
        <div className="card-bordered overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[hsl(var(--bg-secondary))]">
                  <th className="text-left py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedOrgs.length === filteredOrganizations.length && filteredOrganizations.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-[hsl(var(--border))] text-[hsl(var(--accent-primary))] focus:ring-[hsl(var(--accent-primary))]"
                    />
                  </th>
                  <th className="text-left py-3 px-4">
                    <button className="flex items-center gap-1 text-xs font-medium text-[hsl(var(--foreground-muted))] uppercase tracking-wider hover:text-[hsl(var(--foreground))]">
                      Organization
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-[hsl(var(--foreground-muted))] uppercase tracking-wider">
                    Industry & Type
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-[hsl(var(--foreground-muted))] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-[hsl(var(--foreground-muted))] uppercase tracking-wider">
                    Contacts
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-[hsl(var(--foreground-muted))] uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-[hsl(var(--foreground-muted))] uppercase tracking-wider">
                    Value
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-[hsl(var(--foreground-muted))] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrganizations.map((org) => (
                  <tr 
                    key={org.id} 
                    className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--bg-secondary)/.5)] transition-colors"
                  >
                    <td className="py-4 px-4">
                      <input
                        type="checkbox"
                        checked={selectedOrgs.includes(org.id)}
                        onChange={() => toggleSelectOrg(org.id)}
                        className="w-4 h-4 rounded border-[hsl(var(--border))] text-[hsl(var(--accent-primary))] focus:ring-[hsl(var(--accent-primary))]"
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[hsl(var(--accent-primary))] to-[hsl(var(--accent-secondary))] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {getInitials(org.name)}
                        </div>
                        <div>
                          <div className="font-medium text-[hsl(var(--foreground))]">
                            {org.name}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            {org.website && (
                              <a 
                                href={org.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-[hsl(var(--accent-primary))] hover:underline"
                              >
                                <Globe className="w-3 h-3" />
                                Website
                              </a>
                            )}
                            <div className="flex items-center gap-1 text-xs text-[hsl(var(--foreground-muted))]">
                              <MapPin className="w-3 h-3" />
                              {org.location}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="text-sm font-medium text-[hsl(var(--foreground))]">
                          {org.industry}
                        </div>
                        <div className="text-xs text-[hsl(var(--foreground-muted))] mt-0.5">
                          {org.organizationType}
                        </div>
                        <div className="text-xs text-[hsl(var(--foreground-subtle))] mt-0.5">
                          {org.employeeCount} employees
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize border ${statusColors[org.status]}`}>
                        {org.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <Link
                        href={`/crm/contacts?org=${org.id}`}
                        className="flex items-center gap-2 text-sm text-[hsl(var(--foreground))] hover:text-[hsl(var(--accent-primary))]"
                      >
                        <Users className="w-4 h-4" />
                        <span className="font-medium">{org.contactsCount}</span>
                        <span className="text-[hsl(var(--foreground-muted))]">contacts</span>
                      </Link>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        {org.activeLeadsCount > 0 && (
                          <Link
                            href={`/crm/leads?org=${org.id}`}
                            className="flex items-center gap-1 text-xs text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--accent-primary))]"
                          >
                            <TrendingUp className="w-3 h-3" />
                            {org.activeLeadsCount} active leads
                          </Link>
                        )}
                        {org.activeProjectsCount > 0 && (
                          <Link
                            href={`/crm/projects?org=${org.id}`}
                            className="flex items-center gap-1 text-xs text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--accent-primary))]"
                          >
                            <Briefcase className="w-3 h-3" />
                            {org.activeProjectsCount} active projects
                          </Link>
                        )}
                        {org.activeLeadsCount === 0 && org.activeProjectsCount === 0 && (
                          <span className="text-xs text-[hsl(var(--foreground-subtle))]">No activity</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        {org.totalContractValue > 0 ? (
                          <>
                            <div className="flex items-center gap-1 font-semibold text-[hsl(var(--foreground))]">
                              <DollarSign className="w-4 h-4 text-green-500" />
                              {formatCurrency(org.totalContractValue)}
                            </div>
                            <div className="text-xs text-[hsl(var(--foreground-muted))] mt-0.5">
                              Contract value
                            </div>
                          </>
                        ) : (
                          <span className="text-sm text-[hsl(var(--foreground-subtle))]">—</span>
                        )}
                      </div>
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
              Showing 1-{filteredOrganizations.length} of {filteredOrganizations.length} organizations
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredOrganizations.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-[hsl(var(--bg-secondary))] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-[hsl(var(--foreground-muted))]" />
            </div>
            <h3 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-2">No organizations found</h3>
            <p className="text-[hsl(var(--foreground-muted))] mb-6">Try adjusting your search or filter criteria</p>
            <button 
              onClick={() => {
                setSearchQuery('')
                setIndustryFilter('all')
                setStatusFilter('all')
              }}
              className="text-[hsl(var(--accent-primary))] hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* New Organization Modal */}
      {showNewOrgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowNewOrgModal(false)}
          />
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-2xl shadow-2xl m-4">
            <div className="sticky top-0 bg-[hsl(var(--bg-tertiary))] border-b border-[hsl(var(--border))] px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">Add New Organization</h2>
              <button 
                onClick={() => setShowNewOrgModal(false)}
                className="p-2 hover:bg-[hsl(var(--bg-secondary))] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[hsl(var(--foreground-muted))]" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-sm font-medium text-[hsl(var(--foreground))] mb-4 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm text-[hsl(var(--foreground-muted))] mb-1">Organization Name *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Apollo Hospitals"
                      className="w-full px-3 py-2 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-subtle))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-primary))]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[hsl(var(--foreground-muted))] mb-1">Legal Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Apollo Hospitals Enterprise Ltd"
                      className="w-full px-3 py-2 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-subtle))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-primary))]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[hsl(var(--foreground-muted))] mb-1">Website</label>
                    <input 
                      type="url" 
                      placeholder="https://example.com"
                      className="w-full px-3 py-2 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-subtle))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-primary))]"
                    />
                  </div>
                </div>
              </div>

              {/* Classification */}
              <div>
                <h3 className="text-sm font-medium text-[hsl(var(--foreground))] mb-4">Classification</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[hsl(var(--foreground-muted))] mb-1">Industry *</label>
                    <select className="w-full px-3 py-2 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-primary))]">
                      <option value="">Select industry</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="diagnostics">Diagnostics</option>
                      <option value="pharma">Pharma</option>
                      <option value="professional_services">Professional Services</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-[hsl(var(--foreground-muted))] mb-1">Organization Type</label>
                    <select className="w-full px-3 py-2 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-primary))]">
                      <option value="">Select type</option>
                      <option value="hospital">Hospital</option>
                      <option value="diagnostic_lab">Diagnostic Lab</option>
                      <option value="clinic">Clinic</option>
                      <option value="startup">Startup</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-[hsl(var(--foreground-muted))] mb-1">Employee Count</label>
                    <select className="w-full px-3 py-2 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-primary))]">
                      <option value="">Select range</option>
                      <option value="1-10">1-10</option>
                      <option value="11-50">11-50</option>
                      <option value="51-200">51-200</option>
                      <option value="201-500">201-500</option>
                      <option value="500+">500+</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-[hsl(var(--foreground-muted))] mb-1">Annual Revenue</label>
                    <input 
                      type="text" 
                      placeholder="e.g. ₹10,000+ Cr"
                      className="w-full px-3 py-2 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-subtle))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-primary))]"
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <h3 className="text-sm font-medium text-[hsl(var(--foreground))] mb-4">Location</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[hsl(var(--foreground-muted))] mb-1">City</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Mumbai"
                      className="w-full px-3 py-2 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-subtle))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-primary))]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[hsl(var(--foreground-muted))] mb-1">State</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Maharashtra"
                      className="w-full px-3 py-2 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-subtle))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-primary))]"
                    />
                  </div>
                </div>
              </div>

              {/* GST Details */}
              <div>
                <h3 className="text-sm font-medium text-[hsl(var(--foreground))] mb-4">Tax Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[hsl(var(--foreground-muted))] mb-1">GSTIN</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 29XXXXX1234X1ZX"
                      className="w-full px-3 py-2 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-subtle))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-primary))]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[hsl(var(--foreground-muted))] mb-1">PAN</label>
                    <input 
                      type="text" 
                      placeholder="e.g. ABCDE1234F"
                      className="w-full px-3 py-2 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-subtle))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-primary))]"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm text-[hsl(var(--foreground-muted))] mb-1">Notes</label>
                <textarea 
                  rows={3}
                  placeholder="Any additional information about this organization..."
                  className="w-full px-3 py-2 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-subtle))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-primary))] resize-none"
                />
              </div>
            </div>
            <div className="sticky bottom-0 bg-[hsl(var(--bg-tertiary))] border-t border-[hsl(var(--border))] px-6 py-4 flex items-center justify-end gap-3">
              <button 
                onClick={() => setShowNewOrgModal(false)}
                className="btn-tactile btn-tactile-outline"
              >
                Cancel
              </button>
              <button className="btn-tactile btn-tactile-primary">
                <Plus className="w-4 h-4" />
                Create Organization
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}