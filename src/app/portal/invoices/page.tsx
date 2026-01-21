'use client'

import { useState } from 'react'
import { 
  Search,
  Download,
  Eye,
  Calendar,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronDown,
  Receipt,
  ExternalLink
} from 'lucide-react'

// Mock data - will be replaced with Supabase
const allInvoices = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2026-0042',
    project: 'AI Voice Agent Integration',
    projectId: 'proj-1',
    amount: 750000,
    gst: 135000,
    total: 885000,
    status: 'paid',
    issueDate: '2026-01-15',
    dueDate: '2026-01-30',
    paidDate: '2026-01-18',
    description: 'Milestone 3: Multi-language Support',
    paymentMethod: 'Bank Transfer',
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2026-0045',
    project: 'AI Voice Agent Integration',
    projectId: 'proj-1',
    amount: 750000,
    gst: 135000,
    total: 885000,
    status: 'pending',
    issueDate: '2026-01-20',
    dueDate: '2026-02-05',
    paidDate: null,
    description: 'Milestone 4: Appointment Booking Flow',
    paymentMethod: null,
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-2026-0020',
    project: 'Workflow Automation System',
    projectId: 'proj-2',
    amount: 500000,
    gst: 90000,
    total: 590000,
    status: 'paid',
    issueDate: '2026-01-10',
    dueDate: '2026-01-25',
    paidDate: '2026-01-15',
    description: 'Milestone 1: Requirements & Process Mapping',
    paymentMethod: 'Bank Transfer',
  },
  {
    id: 'inv-4',
    invoiceNumber: 'INV-2025-0312',
    project: 'Patient Portal Enhancement',
    projectId: 'proj-3',
    amount: 600000,
    gst: 108000,
    total: 708000,
    status: 'paid',
    issueDate: '2025-12-20',
    dueDate: '2026-01-05',
    paidDate: '2025-12-28',
    description: 'Final Milestone: Launch & Training',
    paymentMethod: 'Bank Transfer',
  },
  {
    id: 'inv-5',
    invoiceNumber: 'INV-2025-0298',
    project: 'Patient Portal Enhancement',
    projectId: 'proj-3',
    amount: 550000,
    gst: 99000,
    total: 649000,
    status: 'overdue',
    issueDate: '2025-11-25',
    dueDate: '2025-12-10',
    paidDate: null,
    description: 'Milestone 4: Testing & Deployment',
    paymentMethod: null,
  },
]

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'overdue', label: 'Overdue' },
]

const statusConfig = {
  paid: {
    label: 'Paid',
    color: 'bg-green-500/10 text-green-500 border-green-500/20',
    icon: CheckCircle2,
  },
  pending: {
    label: 'Pending',
    color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    icon: Clock,
  },
  overdue: {
    label: 'Overdue',
    color: 'bg-red-500/10 text-red-500 border-red-500/20',
    icon: AlertCircle,
  },
}

const formatCurrency = (value: number) => {
  return `₹${value.toLocaleString('en-IN')}`
}

export default function InvoicesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Filter invoices
  const filteredInvoices = allInvoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Calculate summary
  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0)
  const paidAmount = filteredInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0)
  const pendingAmount = filteredInvoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.total, 0)
  const overdueAmount = filteredInvoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.total, 0)

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-primary))]">
      {/* Header */}
      <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary))]">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
            Invoices
          </h1>
          <p className="text-[hsl(var(--foreground-muted))] mt-1">
            {filteredInvoices.length} invoices • {formatCurrency(totalAmount)} total
          </p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card-bordered p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Receipt className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <div className="text-sm text-[hsl(var(--foreground-muted))]">Total</div>
                <div className="text-xl font-bold text-[hsl(var(--foreground))]">
                  {formatCurrency(totalAmount)}
                </div>
              </div>
            </div>
          </div>

          <div className="card-bordered p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <div className="text-sm text-[hsl(var(--foreground-muted))]">Paid</div>
                <div className="text-xl font-bold text-green-500">
                  {formatCurrency(paidAmount)}
                </div>
              </div>
            </div>
          </div>

          <div className="card-bordered p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <div className="text-sm text-[hsl(var(--foreground-muted))]">Pending</div>
                <div className="text-xl font-bold text-yellow-500">
                  {formatCurrency(pendingAmount)}
                </div>
              </div>
            </div>
          </div>

          <div className="card-bordered p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <div className="text-sm text-[hsl(var(--foreground-muted))]">Overdue</div>
                <div className="text-xl font-bold text-red-500">
                  {formatCurrency(overdueAmount)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--foreground-muted))]" />
            <input
              type="text"
              placeholder="Search invoices..."
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
        </div>

        {/* Invoices List */}
        <div className="card-bordered overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[hsl(var(--bg-secondary))]">
                  <th className="text-left py-3 px-4 text-xs font-medium text-[hsl(var(--foreground-muted))] uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-[hsl(var(--foreground-muted))] uppercase tracking-wider">
                    Project
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-[hsl(var(--foreground-muted))] uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-[hsl(var(--foreground-muted))] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-[hsl(var(--foreground-muted))] uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-[hsl(var(--foreground-muted))] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => {
                  const StatusIcon = statusConfig[invoice.status].icon
                  
                  return (
                    <tr 
                      key={invoice.id}
                      className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--bg-secondary)/.5)] transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-semibold text-[hsl(var(--foreground))] font-mono">
                            {invoice.invoiceNumber}
                          </div>
                          <div className="text-sm text-[hsl(var(--foreground-muted))] mt-0.5">
                            {invoice.description}
                          </div>
                          <div className="text-xs text-[hsl(var(--foreground-subtle))] mt-1">
                            Issued: {new Date(invoice.issueDate).toLocaleDateString('en-IN', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-[hsl(var(--foreground))]">
                          {invoice.project}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-semibold text-[hsl(var(--foreground))]">
                            {formatCurrency(invoice.total)}
                          </div>
                          <div className="text-xs text-[hsl(var(--foreground-muted))] mt-0.5">
                            Base: {formatCurrency(invoice.amount)} + GST: {formatCurrency(invoice.gst)}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig[invoice.status].color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusConfig[invoice.status].label}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-[hsl(var(--foreground))]">
                          {new Date(invoice.dueDate).toLocaleDateString('en-IN', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                        {invoice.paidDate && (
                          <div className="text-xs text-green-500 mt-0.5">
                            Paid: {new Date(invoice.paidDate).toLocaleDateString('en-IN', { 
                              month: 'short', 
                              day: 'numeric'
                            })}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            className="p-2 hover:bg-[hsl(var(--bg-tertiary))] rounded-lg transition-colors"
                            title="View Invoice"
                          >
                            <Eye className="w-4 h-4 text-[hsl(var(--foreground-muted))]" />
                          </button>
                          <button 
                            className="p-2 hover:bg-[hsl(var(--accent-primary)/.1)] rounded-lg transition-colors"
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4 text-[hsl(var(--accent-primary))]" />
                          </button>
                          {invoice.status === 'pending' && (
                            <button 
                              className="px-3 py-1.5 bg-[hsl(var(--accent-primary))] hover:bg-[hsl(var(--accent-primary))]/90 text-white text-xs font-medium rounded-lg transition-all flex items-center gap-1"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              Pay Now
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {filteredInvoices.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-[hsl(var(--bg-secondary))] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-8 h-8 text-[hsl(var(--foreground-muted))]" />
            </div>
            <h3 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-2">No invoices found</h3>
            <p className="text-[hsl(var(--foreground-muted))]">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}