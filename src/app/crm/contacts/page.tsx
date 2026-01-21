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
  ChevronLeft,
  ArrowUpDown,
  Eye,
  Edit,
  Trash2,
  User,
  Linkedin,
  X,
  MapPin,
  Briefcase
} from 'lucide-react'

// Mock data - will be replaced with Supabase
const allContacts = [
  {
    id: '1',
    name: 'Dr. Rajesh Kumar',
    email: 'rajesh.kumar@apollo.com',
    phone: '+91 98765 43210',
    role: 'Chief Technology Officer',
    department: 'Technology',
    organization: 'Apollo Hospitals',
    organizationId: 'org-1',
    isPrimary: true,
    isDecisionMaker: true,
    linkedinUrl: 'https://linkedin.com/in/rajeshkumar',
    location: 'Chennai',
    photoUrl: null,
    tags: ['Decision Maker', 'Technical'],
    lastContactDate: '2026-01-20',
    notes: 'Very interested in AI automation for hospital workflows'
  },
  {
    id: '2',
    name: 'Priya Sharma',
    email: 'priya.sharma@maxhealthcare.com',
    phone: '+91 98765 43211',
    role: 'Head of Operations',
    department: 'Operations',
    organization: 'Max Healthcare',
    organizationId: 'org-2',
    isPrimary: true,
    isDecisionMaker: true,
    linkedinUrl: 'https://linkedin.com/in/priyasharma',
    location: 'Delhi',
    photoUrl: null,
    tags: ['Decision Maker'],
    lastContactDate: '2026-01-20',
    notes: 'Looking for workflow automation solutions'
  },
  {
    id: '3',
    name: 'Amit Verma',
    email: 'amit.v@fortis.com',
    phone: '+91 98765 43212',
    role: 'VP Engineering',
    department: 'Engineering',
    organization: 'Fortis Diagnostics',
    organizationId: 'org-3',
    isPrimary: false,
    isDecisionMaker: true,
    linkedinUrl: 'https://linkedin.com/in/amitverma',
    location: 'Bangalore',
    photoUrl: null,
    tags: ['Technical', 'Decision Maker'],
    lastContactDate: '2026-01-19',
    notes: 'Technical evaluation of our AI integration proposal'
  },
  {
    id: '4',
    name: 'Dr. Sneha Gupta',
    email: 's.gupta@medanta.org',
    phone: '+91 98765 43213',
    role: 'Medical Director',
    department: 'Medical',
    organization: 'Medanta Labs',
    organizationId: 'org-4',
    isPrimary: true,
    isDecisionMaker: false,
    linkedinUrl: null,
    location: 'Gurugram',
    photoUrl: null,
    tags: ['Clinical'],
    lastContactDate: '2026-01-18',
    notes: 'Interested in voice agents for patient intake'
  },
  {
    id: '5',
    name: 'Vikram Singh',
    email: 'v.singh@narayana.com',
    phone: '+91 98765 43214',
    role: 'CEO',
    department: 'Executive',
    organization: 'Narayana Health',
    organizationId: 'org-5',
    isPrimary: true,
    isDecisionMaker: true,
    linkedinUrl: 'https://linkedin.com/in/vikramsingh',
    location: 'Bangalore',
    photoUrl: null,
    tags: ['C-Suite', 'Decision Maker'],
    lastContactDate: '2026-01-15',
    notes: 'Negotiating fractional CTO engagement'
  },
  {
    id: '6',
    name: 'Anita Desai',
    email: 'anita.d@srl.com',
    phone: '+91 98765 43215',
    role: 'IT Manager',
    department: 'IT',
    organization: 'SRL Diagnostics',
    organizationId: 'org-6',
    isPrimary: false,
    isDecisionMaker: false,
    linkedinUrl: null,
    location: 'Mumbai',
    photoUrl: null,
    tags: ['Technical'],
    lastContactDate: '2026-01-10',
    notes: 'Implementation contact for AI chatbot project'
  },
  {
    id: '7',
    name: 'Dr. Ravi Menon',
    email: 'ravi.m@manipal.edu',
    phone: '+91 98765 43216',
    role: 'Head of Digital Innovation',
    department: 'Innovation',
    organization: 'Manipal Hospitals',
    organizationId: 'org-7',
    isPrimary: true,
    isDecisionMaker: true,
    linkedinUrl: 'https://linkedin.com/in/ravimenon',
    location: 'Manipal',
    photoUrl: null,
    tags: ['Innovation', 'Decision Maker'],
    lastContactDate: '2026-01-08',
    notes: 'Deal lost to competitor - keep warm for future'
  },
  {
    id: '8',
    name: 'Sarah Chen',
    email: 'sarah.c@columbiaasia.com',
    phone: '+91 98765 43217',
    role: 'COO',
    department: 'Operations',
    organization: 'Columbia Asia',
    organizationId: 'org-8',
    isPrimary: true,
    isDecisionMaker: true,
    linkedinUrl: 'https://linkedin.com/in/sarahchen',
    location: 'Bangalore',
    photoUrl: null,
    tags: ['C-Suite', 'Decision Maker'],
    lastContactDate: '2026-01-21',
    notes: 'Very recent inquiry - high priority follow-up'
  },
]

const roleOptions = [
  { value: 'all', label: 'All Roles' },
  { value: 'ceo', label: 'CEO' },
  { value: 'cto', label: 'CTO' },
  { value: 'coo', label: 'COO' },
  { value: 'vp', label: 'VP' },
  { value: 'director', label: 'Director' },
  { value: 'manager', label: 'Manager' },
  { value: 'other', label: 'Other' },
]

export default function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [showDecisionMakersOnly, setShowDecisionMakersOnly] = useState(false)
  const [showNewContactModal, setShowNewContactModal] = useState(false)
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])

  // Filter contacts
  const filteredContacts = allContacts.filter(contact => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.role.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesRole = roleFilter === 'all' || 
      contact.role.toLowerCase().includes(roleFilter.toLowerCase())
    
    const matchesDecisionMaker = !showDecisionMakersOnly || contact.isDecisionMaker

    return matchesSearch && matchesRole && matchesDecisionMaker
  })

  const toggleSelectAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([])
    } else {
      setSelectedContacts(filteredContacts.map(c => c.id))
    }
  }

  const toggleSelectContact = (id: string) => {
    if (selectedContacts.includes(id)) {
      setSelectedContacts(selectedContacts.filter(c => c !== id))
    } else {
      setSelectedContacts([...selectedContacts, id])
    }
  }

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
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
                  Contacts
                </h1>
                <p className="text-sm text-[hsl(var(--foreground-muted))] mt-1">
                  {filteredContacts.length} contacts found
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowNewContactModal(true)}
              className="btn-tactile btn-tactile-primary"
            >
              <Plus className="w-4 h-4" />
              Add Contact
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
              placeholder="Search contacts by name, email, organization, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-subtle))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-primary))] focus:border-transparent transition-all"
            />
          </div>

          {/* Role Filter */}
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-primary))] focus:border-transparent transition-all cursor-pointer"
            >
              {roleOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--foreground-muted))] pointer-events-none" />
          </div>

          {/* Decision Makers Toggle */}
          <label className="flex items-center gap-2 px-4 py-2.5 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-lg cursor-pointer hover:border-[hsl(var(--accent-primary))] transition-colors">
            <input
              type="checkbox"
              checked={showDecisionMakersOnly}
              onChange={(e) => setShowDecisionMakersOnly(e.target.checked)}
              className="w-4 h-4 rounded border-[hsl(var(--border))] text-[hsl(var(--accent-primary))] focus:ring-[hsl(var(--accent-primary))]"
            />
            <span className="text-sm text-[hsl(var(--foreground))]">Decision Makers Only</span>
          </label>
        </div>

        {/* Bulk Actions Bar */}
        {selectedContacts.length > 0 && (
          <div className="flex items-center gap-4 mb-4 p-3 bg-[hsl(var(--accent-primary)/.1)] border border-[hsl(var(--accent-primary)/.2)] rounded-lg">
            <span className="text-sm font-medium text-[hsl(var(--foreground))]">
              {selectedContacts.length} selected
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
              onClick={() => setSelectedContacts([])}
              className="ml-auto p-1 hover:bg-[hsl(var(--bg-secondary))] rounded transition-colors"
            >
              <X className="w-4 h-4 text-[hsl(var(--foreground-muted))]" />
            </button>
          </div>
        )}

        {/* Contacts Table */}
        <div className="card-bordered overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[hsl(var(--bg-secondary))]">
                  <th className="text-left py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-[hsl(var(--border))] text-[hsl(var(--accent-primary))] focus:ring-[hsl(var(--accent-primary))]"
                    />
                  </th>
                  <th className="text-left py-3 px-4">
                    <button className="flex items-center gap-1 text-xs font-medium text-[hsl(var(--foreground-muted))] uppercase tracking-wider hover:text-[hsl(var(--foreground))]">
                      Contact
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-[hsl(var(--foreground-muted))] uppercase tracking-wider">
                    Role & Organization
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-[hsl(var(--foreground-muted))] uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-[hsl(var(--foreground-muted))] uppercase tracking-wider">
                    Tags
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-[hsl(var(--foreground-muted))] uppercase tracking-wider">
                    Last Contact
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-[hsl(var(--foreground-muted))] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map((contact) => (
                  <tr 
                    key={contact.id} 
                    className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--bg-secondary)/.5)] transition-colors"
                  >
                    <td className="py-4 px-4">
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(contact.id)}
                        onChange={() => toggleSelectContact(contact.id)}
                        className="w-4 h-4 rounded border-[hsl(var(--border))] text-[hsl(var(--accent-primary))] focus:ring-[hsl(var(--accent-primary))]"
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(var(--accent-primary))] to-[hsl(var(--accent-secondary))] flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
                          {getInitials(contact.name)}
                        </div>
                        <div>
                          <div className="font-medium text-[hsl(var(--foreground))] flex items-center gap-2">
                            {contact.name}
                            {contact.isPrimary && (
                              <span className="px-1.5 py-0.5 bg-[hsl(var(--accent-primary)/.1)] text-[hsl(var(--accent-primary))] text-xs rounded">
                                Primary
                              </span>
                            )}
                          </div>
                          {contact.location && (
                            <div className="flex items-center gap-1 text-xs text-[hsl(var(--foreground-muted))] mt-0.5">
                              <MapPin className="w-3 h-3" />
                              {contact.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Briefcase className="w-3 h-3 text-[hsl(var(--foreground-muted))]" />
                          <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                            {contact.role}
                          </span>
                        </div>
                        <Link
                          href={`/crm/organizations/${contact.organizationId}`}
                          className="flex items-center gap-1 text-sm text-[hsl(var(--accent-primary))] hover:underline"
                        >
                          <Building2 className="w-3 h-3" />
                          {contact.organization}
                        </Link>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <a 
                          href={`mailto:${contact.email}`}
                          className="flex items-center gap-2 text-sm text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--accent-primary))]"
                        >
                          <Mail className="w-3 h-3" />
                          {contact.email}
                        </a>
                        <a 
                          href={`tel:${contact.phone}`}
                          className="flex items-center gap-2 text-sm text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--accent-primary))]"
                        >
                          <Phone className="w-3 h-3" />
                          {contact.phone}
                        </a>
                        {contact.linkedinUrl && (
                          <a 
                            href={contact.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-[hsl(var(--accent-primary))] hover:underline"
                          >
                            <Linkedin className="w-3 h-3" />
                            LinkedIn
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1">
                        {contact.tags.slice(0, 2).map((tag) => (
                          <span 
                            key={tag}
                            className={`px-2 py-0.5 rounded text-xs ${
                              tag.includes('Decision Maker') 
                                ? 'bg-green-500/10 text-green-500' 
                                : tag.includes('C-Suite')
                                ? 'bg-purple-500/10 text-purple-500'
                                : 'bg-[hsl(var(--bg-secondary))] text-[hsl(var(--foreground-muted))]'
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                        {contact.tags.length > 2 && (
                          <span className="px-2 py-0.5 bg-[hsl(var(--bg-secondary))] text-[hsl(var(--foreground-muted))] text-xs rounded">
                            +{contact.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-[hsl(var(--foreground-muted))]">
                        {new Date(contact.lastContactDate).toLocaleDateString('en-IN', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
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
              Showing 1-{filteredContacts.length} of {filteredContacts.length} contacts
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredContacts.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-[hsl(var(--bg-secondary))] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-[hsl(var(--foreground-muted))]" />
            </div>
            <h3 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-2">No contacts found</h3>
            <p className="text-[hsl(var(--foreground-muted))] mb-6">Try adjusting your search or filter criteria</p>
            <button 
              onClick={() => {
                setSearchQuery('')
                setRoleFilter('all')
                setShowDecisionMakersOnly(false)
              }}
              className="text-[hsl(var(--accent-primary))] hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* New Contact Modal */}
      {showNewContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowNewContactModal(false)}
          />
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-2xl shadow-2xl m-4">
            <div className="sticky top-0 bg-[hsl(var(--bg-tertiary))] border-b border-[hsl(var(--border))] px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">Add New Contact</h2>
              <button 
                onClick={() => setShowNewContactModal(false)}
                className="p-2 hover:bg-[hsl(var(--bg-secondary))] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[hsl(var(--foreground-muted))]" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Personal Info */}
              <div>
                <h3 className="text-sm font-medium text-[hsl(var(--foreground))] mb-4 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm text-[hsl(var(--foreground-muted))] mb-1">Full Name *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Dr. Rajesh Kumar"
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
                    <label className="block text-sm text-[hsl(var(--foreground-muted))] mb-1">Phone *</label>
                    <input 
                      type="tel" 
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-subtle))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-primary))]"
                    />
                  </div>
                </div>
              </div>

              {/* Organization & Role */}
              <div>
                <h3 className="text-sm font-medium text-[hsl(var(--foreground))] mb-4 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Organization & Role
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[hsl(var(--foreground-muted))] mb-1">Organization *</label>
                    <select className="w-full px-3 py-2 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-primary))]">
                      <option value="">Select organization</option>
                      <option value="apollo">Apollo Hospitals</option>
                      <option value="max">Max Healthcare</option>
                      <option value="fortis">Fortis Diagnostics</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-[hsl(var(--foreground-muted))] mb-1">Role/Title *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. CTO, Manager"
                      className="w-full px-3 py-2 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-subtle))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-primary))]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[hsl(var(--foreground-muted))] mb-1">Department</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Technology"
                      className="w-full px-3 py-2 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-subtle))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-primary))]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[hsl(var(--foreground-muted))] mb-1">LinkedIn URL</label>
                    <input 
                      type="url" 
                      placeholder="https://linkedin.com/in/..."
                      className="w-full px-3 py-2 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-subtle))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-primary))]"
                    />
                  </div>
                </div>
              </div>

              {/* Attributes */}
              <div>
                <h3 className="text-sm font-medium text-[hsl(var(--foreground))] mb-4">Attributes</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4 rounded border-[hsl(var(--border))] text-[hsl(var(--accent-primary))] focus:ring-[hsl(var(--accent-primary))]" />
                    <span className="text-sm text-[hsl(var(--foreground))]">Primary Contact for Organization</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4 rounded border-[hsl(var(--border))] text-[hsl(var(--accent-primary))] focus:ring-[hsl(var(--accent-primary))]" />
                    <span className="text-sm text-[hsl(var(--foreground))]">Decision Maker</span>
                  </label>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm text-[hsl(var(--foreground-muted))] mb-1">Notes</label>
                <textarea 
                  rows={3}
                  placeholder="Any additional information about this contact..."
                  className="w-full px-3 py-2 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-subtle))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-primary))] resize-none"
                />
              </div>
            </div>
            <div className="sticky bottom-0 bg-[hsl(var(--bg-tertiary))] border-t border-[hsl(var(--border))] px-6 py-4 flex items-center justify-end gap-3">
              <button 
                onClick={() => setShowNewContactModal(false)}
                className="btn-tactile btn-tactile-outline"
              >
                Cancel
              </button>
              <button className="btn-tactile btn-tactile-primary">
                <Plus className="w-4 h-4" />
                Create Contact
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}