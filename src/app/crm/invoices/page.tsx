'use client'

import { Receipt, Plus, Search, Filter, MoreHorizontal, Download, Send, IndianRupee } from 'lucide-react'

export default function InvoicesPage() {
  const invoices = [
    { id: 'INV-2026-0042', client: 'Apollo Hospitals', project: 'AI Voice Agent', amount: '₹6,00,000', status: 'paid', date: '2026-01-15', dueDate: '2026-01-22' },
    { id: 'INV-2026-0043', client: 'Max Healthcare', project: 'Workflow Automation', amount: '₹8,80,000', status: 'pending', date: '2026-01-18', dueDate: '2026-01-25' },
    { id: 'INV-2026-0044', client: 'Fortis Healthcare', project: 'Patient Portal', amount: '₹7,20,000', status: 'overdue', date: '2026-01-10', dueDate: '2026-01-17' },
    { id: 'INV-2026-0045', client: 'Medanta', project: 'AI Chatbot', amount: '₹3,20,000', status: 'draft', date: '2026-01-20', dueDate: '2026-01-27' },
  ]

  const stats = [
    { label: 'Total Outstanding', value: '₹16,00,000', color: 'text-orange-500' },
    { label: 'Paid This Month', value: '₹18,50,000', color: 'text-green-500' },
    { label: 'Overdue', value: '₹7,20,000', color: 'text-red-500' },
  ]

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
      paid: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
      overdue: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
    }
    return styles[status] || styles.draft
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Invoices</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage billing and payments</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          New Invoice
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoices..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Invoices Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900/50">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Invoice</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Client</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amount</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Due Date</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{invoice.id}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{invoice.project}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{invoice.client}</td>
                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{invoice.amount}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(invoice.status)}`}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{invoice.dueDate}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" title="Download">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" title="Send">
                      <Send className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}