'use client'

import { FileText, Plus, Search, Filter, MoreHorizontal, Eye, Send, Clock } from 'lucide-react'

export default function ProposalsPage() {
  const proposals = [
    { id: 'PROP-2026-001', client: 'Apollo Hospitals', title: 'AI Voice Agent Implementation', value: '₹15L', status: 'sent', date: '2026-01-18' },
    { id: 'PROP-2026-002', client: 'Max Healthcare', title: 'Workflow Automation Suite', value: '₹22L', status: 'draft', date: '2026-01-20' },
    { id: 'PROP-2026-003', client: 'Fortis Healthcare', title: 'Patient Engagement Platform', value: '₹18L', status: 'viewed', date: '2026-01-15' },
    { id: 'PROP-2026-004', client: 'Medanta', title: 'AI Chatbot Integration', value: '₹8L', status: 'accepted', date: '2026-01-10' },
  ]

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
      sent: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
      viewed: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
      accepted: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
      rejected: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
    }
    return styles[status] || styles.draft
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Proposals</h1>
          <p className="text-slate-600 dark:text-slate-400">Create and track client proposals</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          New Proposal
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search proposals..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Proposals List */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900/50">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Proposal</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Client</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Value</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {proposals.map((proposal) => (
              <tr key={proposal.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{proposal.id}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{proposal.title}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{proposal.client}</td>
                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{proposal.value}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(proposal.status)}`}>
                    {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{proposal.date}</td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}