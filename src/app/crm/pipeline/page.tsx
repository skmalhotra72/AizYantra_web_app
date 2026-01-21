'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ChevronLeft,
  Plus,
  MoreHorizontal,
  Building2,
  User,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  GripVertical,
  Filter,
  ArrowUpDown,
  Eye,
  Edit,
  Trash2,
  ChevronDown,
  X
} from 'lucide-react'

// Pipeline stages configuration
const pipelineStages = [
  { id: 'new', name: 'New', color: 'bg-gray-500', borderColor: 'border-gray-500' },
  { id: 'contacted', name: 'Contacted', color: 'bg-blue-500', borderColor: 'border-blue-500' },
  { id: 'qualified', name: 'Qualified', color: 'bg-cyan-500', borderColor: 'border-cyan-500' },
  { id: 'proposal', name: 'Proposal', color: 'bg-orange-500', borderColor: 'border-orange-500' },
  { id: 'negotiation', name: 'Negotiation', color: 'bg-purple-500', borderColor: 'border-purple-500' },
  { id: 'won', name: 'Won', color: 'bg-green-500', borderColor: 'border-green-500' },
  { id: 'lost', name: 'Lost', color: 'bg-red-500', borderColor: 'border-red-500' },
]

// Mock leads data
const initialLeads = [
  { 
    id: '1',
    organization: 'Apollo Hospitals',
    contact: 'Dr. Rajesh Kumar',
    email: 'rajesh.kumar@apollo.com',
    phone: '+91 98765 43210',
    status: 'qualified',
    expectedValue: 2500000,
    probability: 60,
    serviceInterest: ['Voice Agents', 'AI Chatbots'],
    daysInStage: 3,
    lastActivity: '2 hours ago'
  },
  { 
    id: '2',
    organization: 'Max Healthcare',
    contact: 'Priya Sharma',
    email: 'priya.sharma@maxhealthcare.com',
    phone: '+91 98765 43211',
    status: 'new',
    expectedValue: 1500000,
    probability: 20,
    serviceInterest: ['Workflow Automation'],
    daysInStage: 1,
    lastActivity: '5 hours ago'
  },
  { 
    id: '3',
    organization: 'Fortis Diagnostics',
    contact: 'Amit Verma',
    email: 'amit.v@fortis.com',
    phone: '+91 98765 43212',
    status: 'proposal',
    expectedValue: 3500000,
    probability: 75,
    serviceInterest: ['AI Integration'],
    daysInStage: 5,
    lastActivity: '1 day ago'
  },
  { 
    id: '4',
    organization: 'Medanta Labs',
    contact: 'Dr. Sneha Gupta',
    email: 's.gupta@medanta.org',
    phone: '+91 98765 43213',
    status: 'contacted',
    expectedValue: 2000000,
    probability: 40,
    serviceInterest: ['Voice Agents'],
    daysInStage: 2,
    lastActivity: '2 days ago'
  },
  { 
    id: '5',
    organization: 'Narayana Health',
    contact: 'Vikram Singh',
    email: 'v.singh@narayana.com',
    phone: '+91 98765 43214',
    status: 'negotiation',
    expectedValue: 4500000,
    probability: 85,
    serviceInterest: ['Fractional CTO'],
    daysInStage: 7,
    lastActivity: '3 hours ago'
  },
  { 
    id: '6',
    organization: 'SRL Diagnostics',
    contact: 'Anita Desai',
    email: 'anita.d@srl.com',
    phone: '+91 98765 43215',
    status: 'won',
    expectedValue: 1800000,
    probability: 100,
    serviceInterest: ['AI Chatbots'],
    daysInStage: 0,
    lastActivity: '1 week ago'
  },
  { 
    id: '7',
    organization: 'Columbia Asia',
    contact: 'Sarah Chen',
    email: 'sarah.c@columbiaasia.com',
    phone: '+91 98765 43217',
    status: 'new',
    expectedValue: 1200000,
    probability: 15,
    serviceInterest: ['AI Integration'],
    daysInStage: 0,
    lastActivity: '1 hour ago'
  },
  { 
    id: '8',
    organization: 'Manipal Hospitals',
    contact: 'Dr. Ravi Menon',
    email: 'ravi.m@manipal.edu',
    phone: '+91 98765 43216',
    status: 'lost',
    expectedValue: 2200000,
    probability: 0,
    serviceInterest: ['Voice Agents'],
    daysInStage: 14,
    lastActivity: '2 weeks ago'
  },
  { 
    id: '9',
    organization: 'Hinduja Hospital',
    contact: 'Dr. Meera Patel',
    email: 'meera.p@hinduja.com',
    phone: '+91 98765 43218',
    status: 'qualified',
    expectedValue: 2800000,
    probability: 55,
    serviceInterest: ['Workflow Automation', 'AI Chatbots'],
    daysInStage: 4,
    lastActivity: '1 day ago'
  },
  { 
    id: '10',
    organization: 'Kokilaben Hospital',
    contact: 'Rahul Mehta',
    email: 'r.mehta@kokilaben.com',
    phone: '+91 98765 43219',
    status: 'contacted',
    expectedValue: 1900000,
    probability: 35,
    serviceInterest: ['Custom Development'],
    daysInStage: 3,
    lastActivity: '4 hours ago'
  },
]

const formatCurrency = (value: number) => {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(1)}Cr`
  } else if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`
  }
  return `₹${value.toLocaleString()}`
}

interface Lead {
  id: string
  organization: string
  contact: string
  email: string
  phone: string
  status: string
  expectedValue: number
  probability: number
  serviceInterest: string[]
  daysInStage: number
  lastActivity: string
}

export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showMoveModal, setShowMoveModal] = useState(false)

  // Calculate stage metrics
  const getStageMetrics = (stageId: string) => {
    const stageLeads = leads.filter(lead => lead.status === stageId)
    const totalValue = stageLeads.reduce((sum, lead) => sum + lead.expectedValue, 0)
    const weightedValue = stageLeads.reduce((sum, lead) => sum + (lead.expectedValue * lead.probability / 100), 0)
    return {
      count: stageLeads.length,
      totalValue,
      weightedValue,
      leads: stageLeads
    }
  }

  // Handle drag start
  const handleDragStart = (lead: Lead) => {
    setDraggedLead(lead)
  }

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  // Handle drop
  const handleDrop = (stageId: string) => {
    if (draggedLead && draggedLead.status !== stageId) {
      setLeads(leads.map(lead => 
        lead.id === draggedLead.id 
          ? { ...lead, status: stageId, daysInStage: 0 }
          : lead
      ))
    }
    setDraggedLead(null)
  }

  // Handle move via modal (for mobile/accessibility)
  const handleMoveToStage = (stageId: string) => {
    if (selectedLead) {
      setLeads(leads.map(lead => 
        lead.id === selectedLead.id 
          ? { ...lead, status: stageId, daysInStage: 0 }
          : lead
      ))
      setShowMoveModal(false)
      setSelectedLead(null)
    }
  }

  // Calculate total pipeline value
  const totalPipelineValue = leads
    .filter(l => !['won', 'lost'].includes(l.status))
    .reduce((sum, lead) => sum + lead.expectedValue, 0)
  
  const totalWeightedValue = leads
    .filter(l => !['won', 'lost'].includes(l.status))
    .reduce((sum, lead) => sum + (lead.expectedValue * lead.probability / 100), 0)

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-primary))]">
      {/* Header */}
      <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary))]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/crm"
                className="p-2 hover:bg-[hsl(var(--bg-secondary))] rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-[hsl(var(--foreground-muted))]" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-[hsl(var(--foreground))]">
                  Sales Pipeline
                </h1>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-sm text-[hsl(var(--foreground-muted))]">
                    Total: <span className="font-semibold text-[hsl(var(--foreground))]">{formatCurrency(totalPipelineValue)}</span>
                  </span>
                  <span className="text-sm text-[hsl(var(--foreground-muted))]">
                    Weighted: <span className="font-semibold text-green-500">{formatCurrency(totalWeightedValue)}</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="btn-tactile btn-tactile-outline text-sm py-2">
                <Filter className="w-4 h-4" />
                Filter
              </button>
              <Link href="/crm/leads?new=true" className="btn-tactile btn-tactile-primary text-sm py-2">
                <Plus className="w-4 h-4" />
                Add Lead
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Board */}
      <div className="p-4 overflow-x-auto">
        <div className="flex gap-4 min-w-max">
          {pipelineStages.map((stage) => {
            const metrics = getStageMetrics(stage.id)
            
            return (
              <div
                key={stage.id}
                className="w-80 flex-shrink-0"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(stage.id)}
              >
                {/* Stage Header */}
                <div className={`rounded-t-xl p-4 border-t-4 ${stage.borderColor} bg-[hsl(var(--bg-tertiary))] border-x border-[hsl(var(--border))]`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${stage.color}`}></span>
                      <h3 className="font-semibold text-[hsl(var(--foreground))]">{stage.name}</h3>
                      <span className="px-2 py-0.5 bg-[hsl(var(--bg-secondary))] rounded-full text-xs font-medium text-[hsl(var(--foreground-muted))]">
                        {metrics.count}
                      </span>
                    </div>
                    <button className="p-1 hover:bg-[hsl(var(--bg-secondary))] rounded transition-colors">
                      <MoreHorizontal className="w-4 h-4 text-[hsl(var(--foreground-muted))]" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[hsl(var(--foreground-muted))]">
                      {formatCurrency(metrics.totalValue)}
                    </span>
                    {!['won', 'lost'].includes(stage.id) && (
                      <span className="text-green-500 text-xs">
                        ~{formatCurrency(metrics.weightedValue)} weighted
                      </span>
                    )}
                  </div>
                </div>

                {/* Stage Cards Container */}
                <div className={`min-h-[500px] p-2 bg-[hsl(var(--bg-secondary)/.5)] border-x border-b border-[hsl(var(--border))] rounded-b-xl space-y-3 ${
                  draggedLead && draggedLead.status !== stage.id ? 'ring-2 ring-[hsl(var(--accent-primary))] ring-opacity-50' : ''
                }`}>
                  {metrics.leads.map((lead) => (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={() => handleDragStart(lead)}
                      className={`bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl p-4 cursor-grab active:cursor-grabbing hover:border-[hsl(var(--accent-primary)/.3)] hover:shadow-lg transition-all group ${
                        draggedLead?.id === lead.id ? 'opacity-50 scale-95' : ''
                      }`}
                    >
                      {/* Drag Handle */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <GripVertical className="w-4 h-4 text-[hsl(var(--foreground-subtle))]" />
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => {
                              setSelectedLead(lead)
                              setShowMoveModal(true)
                            }}
                            className="p-1.5 hover:bg-[hsl(var(--bg-secondary))] rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            title="Move to stage"
                          >
                            <ArrowUpDown className="w-3.5 h-3.5 text-[hsl(var(--foreground-muted))]" />
                          </button>
                          <button 
                            className="p-1.5 hover:bg-[hsl(var(--bg-secondary))] rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            title="View details"
                          >
                            <Eye className="w-3.5 h-3.5 text-[hsl(var(--foreground-muted))]" />
                          </button>
                          <button 
                            className="p-1.5 hover:bg-[hsl(var(--bg-secondary))] rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            title="More actions"
                          >
                            <MoreHorizontal className="w-3.5 h-3.5 text-[hsl(var(--foreground-muted))]" />
                          </button>
                        </div>
                      </div>

                      {/* Organization */}
                      <div className="flex items-start gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-[hsl(var(--accent-primary)/.1)] flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-4 h-4 text-[hsl(var(--accent-primary))]" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-medium text-[hsl(var(--foreground))] truncate">
                            {lead.organization}
                          </h4>
                          <div className="flex items-center gap-1 text-xs text-[hsl(var(--foreground-muted))]">
                            <User className="w-3 h-3" />
                            {lead.contact}
                          </div>
                        </div>
                      </div>

                      {/* Value & Probability */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-green-500" />
                          <span className="font-semibold text-[hsl(var(--foreground))]">
                            {formatCurrency(lead.expectedValue)}
                          </span>
                        </div>
                        <div className="px-2 py-0.5 bg-[hsl(var(--bg-secondary))] rounded text-xs font-medium text-[hsl(var(--foreground-muted))]">
                          {lead.probability}%
                        </div>
                      </div>

                      {/* Services */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {lead.serviceInterest.slice(0, 2).map((service) => (
                          <span 
                            key={service}
                            className="px-2 py-0.5 bg-[hsl(var(--accent-secondary)/.1)] text-[hsl(var(--accent-secondary))] text-xs rounded"
                          >
                            {service}
                          </span>
                        ))}
                        {lead.serviceInterest.length > 2 && (
                          <span className="px-2 py-0.5 bg-[hsl(var(--bg-secondary))] text-[hsl(var(--foreground-muted))] text-xs rounded">
                            +{lead.serviceInterest.length - 2}
                          </span>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-[hsl(var(--border))]">
                        <div className="flex items-center gap-2">
                          <button className="p-1.5 hover:bg-[hsl(var(--bg-secondary))] rounded-lg transition-colors" title="Call">
                            <Phone className="w-3.5 h-3.5 text-[hsl(var(--foreground-muted))]" />
                          </button>
                          <button className="p-1.5 hover:bg-[hsl(var(--bg-secondary))] rounded-lg transition-colors" title="Email">
                            <Mail className="w-3.5 h-3.5 text-[hsl(var(--foreground-muted))]" />
                          </button>
                          <button className="p-1.5 hover:bg-[hsl(var(--bg-secondary))] rounded-lg transition-colors" title="Schedule">
                            <Calendar className="w-3.5 h-3.5 text-[hsl(var(--foreground-muted))]" />
                          </button>
                        </div>
                        <span className="text-xs text-[hsl(var(--foreground-subtle))]">
                          {lead.daysInStage === 0 ? 'Today' : `${lead.daysInStage}d in stage`}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Empty State */}
                  {metrics.count === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="w-12 h-12 rounded-xl bg-[hsl(var(--bg-tertiary))] flex items-center justify-center mb-3">
                        <Plus className="w-6 h-6 text-[hsl(var(--foreground-subtle))]" />
                      </div>
                      <p className="text-sm text-[hsl(var(--foreground-muted))]">No leads in this stage</p>
                      <p className="text-xs text-[hsl(var(--foreground-subtle))]">Drag leads here or add new</p>
                    </div>
                  )}

                  {/* Add Lead Button */}
                  <button className="w-full py-2 border-2 border-dashed border-[hsl(var(--border))] rounded-xl text-sm text-[hsl(var(--foreground-muted))] hover:border-[hsl(var(--accent-primary))] hover:text-[hsl(var(--accent-primary))] transition-colors flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Lead
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Move to Stage Modal */}
      {showMoveModal && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowMoveModal(false)
              setSelectedLead(null)
            }}
          />
          <div className="relative w-full max-w-md bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-2xl shadow-2xl m-4">
            <div className="px-6 py-4 border-b border-[hsl(var(--border))] flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Move Lead</h2>
              <button 
                onClick={() => {
                  setShowMoveModal(false)
                  setSelectedLead(null)
                }}
                className="p-2 hover:bg-[hsl(var(--bg-secondary))] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[hsl(var(--foreground-muted))]" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-[hsl(var(--foreground-muted))] mb-4">
                Move <span className="font-medium text-[hsl(var(--foreground))]">{selectedLead.organization}</span> to:
              </p>
              <div className="space-y-2">
                {pipelineStages.map((stage) => (
                  <button
                    key={stage.id}
                    onClick={() => handleMoveToStage(stage.id)}
                    disabled={selectedLead.status === stage.id}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      selectedLead.status === stage.id
                        ? 'bg-[hsl(var(--bg-secondary))] opacity-50 cursor-not-allowed'
                        : 'hover:bg-[hsl(var(--bg-secondary))]'
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full ${stage.color}`}></span>
                    <span className="text-[hsl(var(--foreground))]">{stage.name}</span>
                    {selectedLead.status === stage.id && (
                      <span className="ml-auto text-xs text-[hsl(var(--foreground-muted))]">Current</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}