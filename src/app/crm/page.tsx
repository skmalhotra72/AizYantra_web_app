'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Users, 
  Building2, 
  TrendingUp, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Phone,
  Mail,
  Calendar,
  Plus,
  Filter,
  MoreHorizontal,
  ChevronRight,
  Target,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

// Mock data - will be replaced with Supabase data
const stats = [
  { 
    label: 'Total Leads', 
    value: '47', 
    change: '+12%', 
    changeType: 'positive',
    icon: Users,
    href: '/crm/leads'
  },
  { 
    label: 'Pipeline Value', 
    value: '₹1.2Cr', 
    change: '+23%', 
    changeType: 'positive',
    icon: TrendingUp,
    href: '/crm/pipeline'
  },
  { 
    label: 'Won This Month', 
    value: '₹18.5L', 
    change: '+8%', 
    changeType: 'positive',
    icon: DollarSign,
    href: '/crm/pipeline'
  },
  { 
    label: 'Conversion Rate', 
    value: '24%', 
    change: '-2%', 
    changeType: 'negative',
    icon: Target,
    href: '/crm/leads'
  },
]

const recentLeads = [
  { 
    id: 1, 
    name: 'Apollo Hospitals', 
    contact: 'Dr. Rajesh Kumar',
    email: 'rajesh.kumar@apollo.com',
    status: 'qualified',
    value: '₹25L',
    source: 'LinkedIn',
    createdAt: '2 hours ago'
  },
  { 
    id: 2, 
    name: 'Max Healthcare', 
    contact: 'Priya Sharma',
    email: 'priya.sharma@maxhealthcare.com',
    status: 'new',
    value: '₹15L',
    source: 'Website',
    createdAt: '5 hours ago'
  },
  { 
    id: 3, 
    name: 'Fortis Diagnostics', 
    contact: 'Amit Verma',
    email: 'amit.v@fortis.com',
    status: 'proposal',
    value: '₹35L',
    source: 'Referral',
    createdAt: '1 day ago'
  },
  { 
    id: 4, 
    name: 'Medanta Labs', 
    contact: 'Dr. Sneha Gupta',
    email: 's.gupta@medanta.org',
    status: 'contacted',
    value: '₹20L',
    source: 'Voice Agent',
    createdAt: '2 days ago'
  },
]

const pipelineStages = [
  { name: 'New', count: 12, value: '₹45L', color: 'bg-gray-500' },
  { name: 'Contacted', count: 8, value: '₹32L', color: 'bg-blue-500' },
  { name: 'Qualified', count: 15, value: '₹58L', color: 'bg-cyan-500' },
  { name: 'Proposal', count: 6, value: '₹42L', color: 'bg-orange-500' },
  { name: 'Negotiation', count: 4, value: '₹28L', color: 'bg-purple-500' },
  { name: 'Won', count: 2, value: '₹18L', color: 'bg-green-500' },
]

const upcomingActivities = [
  { 
    id: 1, 
    type: 'call',
    title: 'Discovery call with Apollo Hospitals',
    time: 'Today, 3:00 PM',
    icon: Phone,
    iconBg: 'bg-green-500/10',
    iconColor: 'text-green-500'
  },
  { 
    id: 2, 
    type: 'email',
    title: 'Send proposal to Max Healthcare',
    time: 'Today, 5:00 PM',
    icon: Mail,
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-500'
  },
  { 
    id: 3, 
    type: 'meeting',
    title: 'Demo presentation - Fortis',
    time: 'Tomorrow, 11:00 AM',
    icon: Calendar,
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-500'
  },
]

const statusColors: Record<string, string> = {
  new: 'bg-gray-500/10 text-gray-500',
  contacted: 'bg-blue-500/10 text-blue-500',
  qualified: 'bg-cyan-500/10 text-cyan-500',
  proposal: 'bg-orange-500/10 text-orange-500',
  negotiation: 'bg-purple-500/10 text-purple-500',
  won: 'bg-green-500/10 text-green-500',
  lost: 'bg-red-500/10 text-red-500',
}

export default function CRMDashboard() {
  return (
    <div className="min-h-screen bg-[hsl(var(--bg-primary))]">
      {/* Header */}
      <div className="border-b border-[hsl(var(--border))]">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
                CRM Dashboard
              </h1>
              <p className="text-sm text-[hsl(var(--foreground-muted))] mt-1">
                Track leads, manage pipeline, close deals
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="btn-tactile btn-tactile-outline">
                <Filter className="w-4 h-4" />
                Filter
              </button>
              <Link href="/crm/leads?new=true" className="btn-tactile btn-tactile-primary">
                <Plus className="w-4 h-4" />
                Add Lead
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="card-bordered p-6 hover:border-[hsl(var(--accent-primary)/.3)] transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 rounded-lg bg-[hsl(var(--bg-secondary))]">
                  <stat.icon className="w-5 h-5 text-[hsl(var(--foreground-muted))]" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {stat.changeType === 'positive' ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {stat.change}
                </div>
              </div>
              <div className="text-3xl font-semibold text-[hsl(var(--foreground))] mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-[hsl(var(--foreground-muted))] flex items-center justify-between">
                {stat.label}
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-8">
            {/* Pipeline Overview */}
            <div className="card-bordered p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">
                  Pipeline Overview
                </h2>
                <Link 
                  href="/crm/pipeline"
                  className="text-sm text-[hsl(var(--accent-primary))] hover:underline flex items-center gap-1"
                >
                  View Pipeline
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-4">
                {pipelineStages.map((stage) => (
                  <div key={stage.name} className="flex items-center gap-4">
                    <div className="w-24 text-sm text-[hsl(var(--foreground-muted))]">
                      {stage.name}
                    </div>
                    <div className="flex-1 h-8 bg-[hsl(var(--bg-secondary))] rounded-lg overflow-hidden">
                      <div 
                        className={`h-full ${stage.color} flex items-center justify-end px-3 transition-all`}
                        style={{ width: `${(stage.count / 47) * 100}%`, minWidth: '60px' }}
                      >
                        <span className="text-xs font-medium text-white">{stage.count}</span>
                      </div>
                    </div>
                    <div className="w-20 text-sm font-medium text-[hsl(var(--foreground))] text-right">
                      {stage.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Leads */}
            <div className="card-bordered p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">
                  Recent Leads
                </h2>
                <Link 
                  href="/crm/leads"
                  className="text-sm text-[hsl(var(--accent-primary))] hover:underline flex items-center gap-1"
                >
                  View All
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[hsl(var(--border))]">
                      <th className="text-left py-3 px-4 text-xs font-medium text-[hsl(var(--foreground-muted))] uppercase tracking-wider">
                        Organization
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-[hsl(var(--foreground-muted))] uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-[hsl(var(--foreground-muted))] uppercase tracking-wider">
                        Value
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-[hsl(var(--foreground-muted))] uppercase tracking-wider">
                        Source
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-[hsl(var(--foreground-muted))] uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLeads.map((lead) => (
                      <tr 
                        key={lead.id} 
                        className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--bg-secondary))] transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-medium text-[hsl(var(--foreground))]">
                              {lead.name}
                            </div>
                            <div className="text-sm text-[hsl(var(--foreground-muted))]">
                              {lead.contact}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[lead.status]}`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-medium text-[hsl(var(--foreground))]">
                            {lead.value}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-[hsl(var(--foreground-muted))]">
                            {lead.source}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button className="p-2 hover:bg-[hsl(var(--bg-tertiary))] rounded-lg transition-colors">
                            <MoreHorizontal className="w-4 h-4 text-[hsl(var(--foreground-muted))]" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="card-bordered p-6">
              <h2 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">
                Quick Actions
              </h2>
              <div className="space-y-2">
                <Link 
                  href="/crm/leads?new=true"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-[hsl(var(--bg-secondary))] transition-colors"
                >
                  <div className="p-2 rounded-lg bg-[hsl(var(--accent-primary)/.1)]">
                    <Plus className="w-4 h-4 text-[hsl(var(--accent-primary))]" />
                  </div>
                  <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                    Add New Lead
                  </span>
                </Link>
                <Link 
                  href="/crm/organizations?new=true"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-[hsl(var(--bg-secondary))] transition-colors"
                >
                  <div className="p-2 rounded-lg bg-[hsl(var(--accent-secondary)/.1)]">
                    <Building2 className="w-4 h-4 text-[hsl(var(--accent-secondary))]" />
                  </div>
                  <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                    Add Organization
                  </span>
                </Link>
                <Link 
                  href="/crm/contacts?new=true"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-[hsl(var(--bg-secondary))] transition-colors"
                >
                  <div className="p-2 rounded-lg bg-[hsl(var(--accent-cyan)/.1)]">
                    <Users className="w-4 h-4 text-[hsl(var(--accent-cyan))]" />
                  </div>
                  <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                    Add Contact
                  </span>
                </Link>
              </div>
            </div>

            {/* Upcoming Activities */}
            <div className="card-bordered p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">
                  Upcoming Activities
                </h2>
                <span className="text-xs font-medium text-[hsl(var(--foreground-muted))] bg-[hsl(var(--bg-secondary))] px-2 py-1 rounded">
                  3 today
                </span>
              </div>
              <div className="space-y-4">
                {upcomingActivities.map((activity) => (
                  <div 
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-[hsl(var(--bg-secondary))] transition-colors cursor-pointer"
                  >
                    <div className={`p-2 rounded-lg ${activity.iconBg}`}>
                      <activity.icon className={`w-4 h-4 ${activity.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[hsl(var(--foreground))] truncate">
                        {activity.title}
                      </div>
                      <div className="text-xs text-[hsl(var(--foreground-muted))] flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {activity.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-2 text-sm text-[hsl(var(--accent-primary))] hover:bg-[hsl(var(--bg-secondary))] rounded-lg transition-colors">
                View All Activities
              </button>
            </div>

            {/* Performance Summary */}
            <div className="card-bordered p-6">
              <h2 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">
                This Month
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-[hsl(var(--foreground-muted))]">Deals Won</span>
                  </div>
                  <span className="font-semibold text-[hsl(var(--foreground))]">4</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-[hsl(var(--foreground-muted))]">Deals Lost</span>
                  </div>
                  <span className="font-semibold text-[hsl(var(--foreground))]">2</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-[hsl(var(--foreground-muted))]">Calls Made</span>
                  </div>
                  <span className="font-semibold text-[hsl(var(--foreground))]">28</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-[hsl(var(--foreground-muted))]">Emails Sent</span>
                  </div>
                  <span className="font-semibold text-[hsl(var(--foreground))]">156</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}