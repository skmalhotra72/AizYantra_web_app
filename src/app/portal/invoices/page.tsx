'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
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
  Loader2
} from 'lucide-react'

interface Invoice {
  id: string
  invoice_number: string
  project_id: string | null
  status: string | null
  invoice_date: string | null
  due_date: string | null
  subtotal: number | null
  cgst_amount: number | null
  sgst_amount: number | null
  igst_amount: number | null
  total_amount: number | null
  amount_paid: number | null
  amount_due: number | null
  document_url: string | null
  notes: string | null
  projects?: {
    name: string
  }
}

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'overdue', label: 'Overdue' },
]

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
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

const formatCurrency = (value: number | null) => {
  if (!value) return '₹0'
  return `₹${value.toLocaleString('en-IN')}`
}

const getInvoiceStatus = (invoice: Invoice): 'paid' | 'pending' | 'overdue' => {
  if (invoice.status === 'paid') return 'paid'
  
  if (invoice.due_date) {
    const dueDate = new Date(invoice.due_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (dueDate < today && invoice.status !== 'paid') {
      return 'overdue'
    }
  }
  
  return 'pending'
}

export default function InvoicesPage() {
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    const fetchInvoices = async () => {
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
        const { data: invoicesData, error: invoicesError } = await supabase
          .from('invoices')
          .select('*, projects(name)')
          .eq('organization_id', contact.organization_id)
          .order('invoice_date', { ascending: false })

        if (invoicesError) {
          console.error('Error fetching invoices:', invoicesError)
        } else if (invoicesData) {
          setInvoices(invoicesData)
        }
      }

      setIsLoading(false)
    }

    fetchInvoices()
  }, [router])

  const filteredInvoices = invoices.filter(invoice => {
    const computedStatus = getInvoiceStatus(invoice)
    
    const matchesSearch = 
      invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (invoice.projects?.name && invoice.projects.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (invoice.notes && invoice.notes.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' || computedStatus === statusFilter

    return matchesSearch && matchesStatus
  })

  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0)
  const paidAmount = filteredInvoices.filter(inv => getInvoiceStatus(inv) === 'paid').reduce((sum, inv) => sum + (inv.total_amount || 0), 0)
  const pendingAmount = filteredInvoices.filter(inv => getInvoiceStatus(inv) === 'pending').reduce((sum, inv) => sum + (inv.total_amount || 0), 0)
  const overdueAmount = filteredInvoices.filter(inv => getInvoiceStatus(inv) === 'overdue').reduce((sum, inv) => sum + (inv.total_amount || 0), 0)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--bg-primary))] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[hsl(var(--accent-primary))] animate-spin mx-auto mb-4" />
          <p className="text-[hsl(var(--foreground-muted))]">Loading invoices...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-primary))]">
      <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary))]">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Invoices</h1>
          <p className="text-[hsl(var(--foreground-muted))] mt-1">
            {filteredInvoices.length} invoices • {formatCurrency(totalAmount)} total
          </p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {invoices.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-[hsl(var(--accent-primary)/.1)] rounded-full flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-8 h-8 text-[hsl(var(--accent-primary))]" />
            </div>
            <h3 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-2">No invoices yet</h3>
            <p className="text-[hsl(var(--foreground-muted))]">Your invoices will appear here once they are generated</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="card-bordered p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Receipt className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-sm text-[hsl(var(--foreground-muted))]">Total</div>
                    <div className="text-xl font-bold text-[hsl(var(--foreground))]">{formatCurrency(totalAmount)}</div>
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
                    <div className="text-xl font-bold text-green-500">{formatCurrency(paidAmount)}</div>
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
                    <div className="text-xl font-bold text-yellow-500">{formatCurrency(pendingAmount)}</div>
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
                    <div className="text-xl font-bold text-red-500">{formatCurrency(overdueAmount)}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
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

            {filteredInvoices.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-[hsl(var(--bg-secondary))] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Receipt className="w-8 h-8 text-[hsl(var(--foreground-muted))]" />
                </div>
                <h3 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-2">No invoices found</h3>
                <p className="text-[hsl(var(--foreground-muted))]">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <div className="card-bordered overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[hsl(var(--bg-secondary))]">
                        <th className="text-left py-3 px-4 text-xs font-medium text-[hsl(var(--foreground-muted))] uppercase tracking-wider">Invoice</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-[hsl(var(--foreground-muted))] uppercase tracking-wider">Project</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-[hsl(var(--foreground-muted))] uppercase tracking-wider">Amount</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-[hsl(var(--foreground-muted))] uppercase tracking-wider">Status</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-[hsl(var(--foreground-muted))] uppercase tracking-wider">Due Date</th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-[hsl(var(--foreground-muted))] uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInvoices.map((invoice) => {
                        const computedStatus = getInvoiceStatus(invoice)
                        const StatusIcon = statusConfig[computedStatus].icon
                        const gstAmount = (invoice.cgst_amount || 0) + (invoice.sgst_amount || 0) + (invoice.igst_amount || 0)
                        
                        return (
                          <tr key={invoice.id} className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--bg-secondary)/.5)] transition-colors">
                            <td className="py-4 px-4">
                              <div>
                                <div className="font-semibold text-[hsl(var(--foreground))] font-mono">{invoice.invoice_number}</div>
                                {invoice.notes && (
                                  <div className="text-sm text-[hsl(var(--foreground-muted))] mt-0.5">{invoice.notes}</div>
                                )}
                                {invoice.invoice_date && (
                                  <div className="text-xs text-[hsl(var(--foreground-subtle))] mt-1">
                                    Issued: {new Date(invoice.invoice_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="text-sm text-[hsl(var(--foreground))]">{invoice.projects?.name || 'N/A'}</div>
                            </td>
                            <td className="py-4 px-4">
                              <div>
                                <div className="font-semibold text-[hsl(var(--foreground))]">{formatCurrency(invoice.total_amount)}</div>
                                {invoice.subtotal && gstAmount > 0 && (
                                  <div className="text-xs text-[hsl(var(--foreground-muted))] mt-0.5">
                                    Base: {formatCurrency(invoice.subtotal)} + GST: {formatCurrency(gstAmount)}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig[computedStatus].color}`}>
                                <StatusIcon className="w-3.5 h-3.5" />
                                {statusConfig[computedStatus].label}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              {invoice.due_date && (
                                <div className="text-sm text-[hsl(var(--foreground))]">
                                  {new Date(invoice.due_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                              )}
                              {computedStatus === 'paid' && invoice.amount_paid && (
                                <div className="text-xs text-green-500 mt-0.5">Paid: {formatCurrency(invoice.amount_paid)}</div>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center justify-end gap-2">
                                {invoice.document_url && (
                                  <>
                                    <button onClick={() => window.open(invoice.document_url || '', '_blank')} className="p-2 hover:bg-[hsl(var(--bg-tertiary))] rounded-lg transition-colors" title="View Invoice">
                                      <Eye className="w-4 h-4 text-[hsl(var(--foreground-muted))]" />
                                    </button>
                                    <a href={invoice.document_url || ''} download className="p-2 hover:bg-[hsl(var(--accent-primary)/.1)] rounded-lg transition-colors" title="Download PDF">
                                      <Download className="w-4 h-4 text-[hsl(var(--accent-primary))]" />
                                    </a>
                                  </>
                                )}
                                {computedStatus === 'pending' && (
                                  <button className="px-3 py-1.5 bg-[hsl(var(--accent-primary))] hover:bg-[hsl(var(--accent-primary))]/90 text-white text-xs font-medium rounded-lg transition-all flex items-center gap-1">
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
            )}
          </>
        )}
      </div>
    </div>
  )
}