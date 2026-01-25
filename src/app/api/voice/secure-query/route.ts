// =====================================================
// TRIPTI SECURE DATA ACCESS - API ENDPOINT
// /api/voice/secure-query
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// =====================================================
// CONFIGURATION
// =====================================================

// Query types and their required verification levels
const QUERY_CONFIG: Record<string, {
  level: number;
  description: string;
}> = {
  'project_list': { level: 1, description: 'List all projects' },
  'project_status': { level: 1, description: 'Project status' },
  'project_details': { level: 2, description: 'Project details' },
  'milestones': { level: 1, description: 'Project milestones' },
  'proposal_list': { level: 2, description: 'List proposals' },
  'proposal_details': { level: 3, description: 'Proposal details' },
  'invoice_list': { level: 3, description: 'List invoices' },
  'invoice_details': { level: 3, description: 'Invoice details' },
  'payment_history': { level: 3, description: 'Payment history' },
};

// Fields that are NEVER returned (internal/sensitive)
const FORBIDDEN_FIELDS = [
  'actual_cost', 'estimated_cost', 'profit_margin', 'hourly_rate',
  'internal_notes', 'admin_notes', 'cost_breakdown', 'vendor_cost',
  'discount_reason', 'markup', 'resource_cost', 'transaction_id',
  'gateway_response', 'api_key', 'credentials', 'password',
  'service_role', 'secret', 'token', 'private'
];

// =====================================================
// MAIN HANDLER
// =====================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      session_id,
      contact_id,
      query_type,
      query_params = {},
      verification_level = 0
    } = body;

    console.log('🔐 Secure query request:', { query_type, contact_id, verification_level });

    // Validate required fields
    if (!contact_id || !query_type) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        message: "I need more information to help you. Could you tell me what you'd like to know?"
      }, { status: 400 });
    }

    // Validate query type
    const queryConfig = QUERY_CONFIG[query_type];
    if (!queryConfig) {
      return NextResponse.json({
        success: false,
        error: 'Invalid query type',
        message: "I'm not sure I can help with that specific request. Could you rephrase what you're looking for?"
      }, { status: 400 });
    }

    // Check verification level
    if (verification_level < queryConfig.level) {
      const prompt = getVerificationPrompt(queryConfig.level);
      return NextResponse.json({
        success: false,
        error: 'Insufficient verification',
        required_level: queryConfig.level,
        current_level: verification_level,
        verification_prompt: prompt,
        message: prompt
      }, { status: 403 });
    }

    // Verify contact exists and is active
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select('id, name, organization_id, email, phone')
      .eq('id', contact_id)
      .single();

    if (contactError || !contact) {
      await logAccess(session_id, contact_id, query_type, null, false, 'Contact not found');
      return NextResponse.json({
        success: false,
        error: 'Contact not found',
        message: "I couldn't verify your account. Let me connect you with our team to help."
      }, { status: 403 });
    }

    // Execute the query
    const result = await executeSecureQuery(
      query_type,
      contact_id,
      contact.organization_id,
      query_params
    );

    // Log successful access
    await logAccess(
      session_id,
      contact_id,
      query_type,
      result.data_id,
      true,
      null
    );

    console.log('✅ Secure query successful:', { query_type, data_found: !!result.data });

    return NextResponse.json({
      success: true,
      query_type,
      data: result.data,
      message: result.message,
      follow_up: result.follow_up
    });

  } catch (error) {
    console.error('❌ Secure query error:', error);
    return NextResponse.json({
      success: false,
      error: 'Query failed',
      message: "I encountered an issue retrieving that information. Let me connect you with our team."
    }, { status: 500 });
  }
}

// =====================================================
// QUERY EXECUTOR
// =====================================================

async function executeSecureQuery(
  queryType: string,
  contactId: string,
  organizationId: string,
  params: any
): Promise<{ data: any; data_id: string | null; message: string; follow_up: string }> {
  
  switch (queryType) {
    case 'project_list':
      return await getProjectList(contactId, organizationId);
    case 'project_status':
      return await getProjectStatus(contactId, params);
    case 'project_details':
      return await getProjectDetails(contactId, params);
    case 'milestones':
      return await getMilestones(contactId, params);
    case 'proposal_list':
      return await getProposalList(contactId);
    case 'proposal_details':
      return await getProposalDetails(contactId, params);
    case 'invoice_list':
      return await getInvoiceList(contactId, organizationId);
    case 'invoice_details':
      return await getInvoiceDetails(contactId, params);
    case 'payment_history':
      return await getPaymentHistory(contactId, organizationId);
    default:
      return {
        data: null,
        data_id: null,
        message: "I'm not sure how to help with that request.",
        follow_up: "Could you tell me more about what you're looking for?"
      };
  }
}

// =====================================================
// QUERY HANDLERS
// =====================================================

// Get list of projects for contact
async function getProjectList(contactId: string, organizationId: string) {
  // First try project_contacts table
  let { data, error } = await supabase
    .from('project_contacts')
    .select(`
      project_id,
      role,
      projects (
        id, name, status, current_phase, progress_percentage,
        planned_start_date, planned_end_date, description
      )
    `)
    .eq('contact_id', contactId);

  // If no direct links, try organization-based projects
  if (!data || data.length === 0) {
    const orgProjects = await supabase
      .from('projects')
      .select('id, name, status, current_phase, progress_percentage, planned_start_date, planned_end_date, description')
      .eq('organization_id', organizationId)
      .neq('status', 'cancelled')
      .order('updated_at', { ascending: false })
      .limit(10);
    
    data = orgProjects.data?.map(p => ({ project_id: p.id, role: 'stakeholder', projects: p })) || [];
  }

  if (!data || data.length === 0) {
    return {
      data: null,
      data_id: null,
      message: "I couldn't find any active projects associated with your account.",
      follow_up: "Would you like me to have our team look into this for you?"
    };
  }

  const projects = data.map(d => sanitizeData(d.projects)).filter(Boolean);
  
  if (projects.length === 1) {
    const p = projects[0];
    return {
      data: projects,
      data_id: p.id,
      message: `I found your project "${p.name}". It's currently ${p.status} in the ${p.current_phase || 'active'} phase at ${p.progress_percentage || 0}% completion.`,
      follow_up: "Would you like more details about this project?"
    };
  }

  const projectNames = projects.map((p: any) => p.name).join(', ');
  return {
    data: projects,
    data_id: null,
    message: `I found ${projects.length} projects associated with your account: ${projectNames}.`,
    follow_up: "Which project would you like to know more about?"
  };
}

// Get specific project status
async function getProjectStatus(contactId: string, params: any) {
  const { project_id, project_name } = params;

  let query = supabase
    .from('projects')
    .select(`
      id, name, status, current_phase, progress_percentage,
      planned_start_date, planned_end_date, description
    `);

  if (project_id) {
    query = query.eq('id', project_id);
  } else if (project_name) {
    query = query.ilike('name', `%${project_name}%`);
  } else {
    return {
      data: null,
      data_id: null,
      message: "Which project would you like to know about?",
      follow_up: "Please tell me the project name."
    };
  }

  const { data, error } = await query.limit(1).single();

  if (error || !data) {
    return {
      data: null,
      data_id: null,
      message: "I couldn't find that project. Could you double-check the project name?",
      follow_up: "Would you like me to list all your projects instead?"
    };
  }

  const project = sanitizeData(data);
  return {
    data: project,
    data_id: project.id,
    message: `Your project "${project.name}" is currently ${project.status}. It's in the ${project.current_phase || 'active'} phase at ${project.progress_percentage || 0}% completion. ${project.planned_end_date ? `Expected completion is ${formatDate(project.planned_end_date)}.` : ''}`,
    follow_up: "Would you like to know about the milestones or any specific details?"
  };
}

// Get project details
async function getProjectDetails(contactId: string, params: any) {
  const { project_id } = params;

  if (!project_id) {
    return {
      data: null,
      data_id: null,
      message: "Which project would you like details about?",
      follow_up: ""
    };
  }

  const { data, error } = await supabase
    .from('projects')
    .select(`
      id, name, status, current_phase, progress_percentage,
      planned_start_date, planned_end_date, description,
      contract_value, health_status, service_type
    `)
    .eq('id', project_id)
    .single();

  if (error || !data) {
    return {
      data: null,
      data_id: null,
      message: "I couldn't find that project.",
      follow_up: "Would you like me to list your projects?"
    };
  }

  const project = sanitizeData(data);

  return {
    data: project,
    data_id: project.id,
    message: `Here are the details for "${project.name}": ${project.description || 'No description available.'}. Status: ${project.status}, Phase: ${project.current_phase || 'active'}, Progress: ${project.progress_percentage || 0}%. Health: ${project.health_status || 'Good'}.`,
    follow_up: "Would you like information about invoices or payments?"
  };
}

// Get milestones - check if table exists first
async function getMilestones(contactId: string, params: any) {
  const { project_id } = params;

  if (!project_id) {
    return {
      data: null,
      data_id: null,
      message: "Which project's milestones would you like to see?",
      follow_up: ""
    };
  }

  // Try project_milestones table first
  let { data, error } = await supabase
    .from('project_milestones')
    .select('id, name, description, status, due_date')
    .eq('project_id', project_id)
    .order('due_date', { ascending: true })
    .limit(10);

  // If project_milestones doesn't exist, try milestones table
  if (error) {
    const fallback = await supabase
      .from('milestones')
      .select('id, name, description, status, due_date')
      .eq('project_id', project_id)
      .order('due_date', { ascending: true })
      .limit(10);
    
    data = fallback.data;
    error = fallback.error;
  }

  if (error) {
    // Table might not exist or no data
    return {
      data: null,
      data_id: null,
      message: "Milestone tracking is being set up for this project.",
      follow_up: "Would you like to know something else about the project?"
    };
  }

  if (!data || data.length === 0) {
    return {
      data: null,
      data_id: null,
      message: "I couldn't find any milestones for this project yet.",
      follow_up: "Would you like to know something else about the project?"
    };
  }

  const milestones = data.map(m => sanitizeData(m));
  const upcoming = milestones.filter((m: any) => m.status !== 'completed');
  const completed = milestones.filter((m: any) => m.status === 'completed');

  let message = `This project has ${milestones.length} milestones. ${completed.length} completed, ${upcoming.length} upcoming.`;
  
  if (upcoming.length > 0) {
    const nextMilestone = upcoming[0];
    message += ` The next milestone is "${nextMilestone.name}" due ${formatDate(nextMilestone.due_date)}.`;
  }

  return {
    data: milestones,
    data_id: null,
    message,
    follow_up: "Would you like details on any specific milestone?"
  };
}

// Get proposal list
async function getProposalList(contactId: string) {
  const { data, error } = await supabase
    .from('proposals')
    .select(`
      id, proposal_number, title, status, total_value,
      valid_until, created_at,
      leads!inner (contact_id)
    `)
    .eq('leads.contact_id', contactId)
    .order('created_at', { ascending: false })
    .limit(5);

  if (error || !data || data.length === 0) {
    return {
      data: null,
      data_id: null,
      message: "I couldn't find any proposals associated with your account.",
      follow_up: "Would you like to discuss a new proposal with our team?"
    };
  }

  const proposals = data.map(p => sanitizeData(p));
  
  if (proposals.length === 1) {
    const p = proposals[0];
    return {
      data: proposals,
      data_id: p.id,
      message: `I found your proposal "${p.title}" for ₹${formatCurrency(p.total_value)}. Status: ${p.status}. ${p.valid_until ? `Valid until ${formatDate(p.valid_until)}.` : ''}`,
      follow_up: "Would you like more details about this proposal?"
    };
  }

  return {
    data: proposals,
    data_id: null,
    message: `I found ${proposals.length} proposals on your account. The most recent is "${proposals[0].title}" for ₹${formatCurrency(proposals[0].total_value)}.`,
    follow_up: "Which proposal would you like to know more about?"
  };
}

// Get proposal details
async function getProposalDetails(contactId: string, params: any) {
  const { proposal_id } = params;

  if (!proposal_id) {
    return await getProposalList(contactId);
  }

  const { data, error } = await supabase
    .from('proposals')
    .select(`
      id, proposal_number, title, status, total_value,
      valid_until, created_at, sent_at,
      leads!inner (contact_id)
    `)
    .eq('id', proposal_id)
    .eq('leads.contact_id', contactId)
    .single();

  if (error || !data) {
    return {
      data: null,
      data_id: null,
      message: "I couldn't find that proposal or it may not be associated with your account.",
      follow_up: "Would you like me to list your proposals?"
    };
  }

  const proposal = sanitizeData(data);
  return {
    data: proposal,
    data_id: proposal.id,
    message: `Proposal "${proposal.title}" (${proposal.proposal_number}): Value ₹${formatCurrency(proposal.total_value)}, Status: ${proposal.status}. ${proposal.valid_until ? `Valid until ${formatDate(proposal.valid_until)}.` : ''} ${proposal.status === 'pending' ? 'This proposal is awaiting your review.' : ''}`,
    follow_up: "Would you like me to send this proposal to your email, or do you have any questions?"
  };
}

// Get invoice list
async function getInvoiceList(contactId: string, organizationId: string) {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      id, invoice_number, amount, tax_amount, total_amount,
      due_date, status, created_at
    `)
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error || !data || data.length === 0) {
    return {
      data: null,
      data_id: null,
      message: "I couldn't find any invoices associated with your account.",
      follow_up: "Would you like me to check with our finance team?"
    };
  }

  const invoices = data.map(i => sanitizeData(i));
  const pending = invoices.filter((i: any) => i.status === 'pending' || i.status === 'overdue');
  const totalPending = pending.reduce((sum: number, i: any) => sum + (i.total_amount || 0), 0);

  let message = `I found ${invoices.length} invoice(s) on your account.`;
  if (pending.length > 0) {
    message += ` You have ${pending.length} pending invoice(s) totaling ₹${formatCurrency(totalPending)}.`;
  }
  message += ` Your most recent invoice is ${invoices[0].invoice_number} for ₹${formatCurrency(invoices[0].total_amount)}.`;

  return {
    data: invoices,
    data_id: null,
    message,
    follow_up: "Would you like details on a specific invoice or payment information?"
  };
}

// Get invoice details
async function getInvoiceDetails(contactId: string, params: any) {
  const { invoice_id, invoice_number } = params;

  let query = supabase
    .from('invoices')
    .select(`
      id, invoice_number, amount, tax_amount, total_amount,
      due_date, status, created_at
    `);

  if (invoice_id) {
    query = query.eq('id', invoice_id);
  } else if (invoice_number) {
    query = query.ilike('invoice_number', `%${invoice_number}%`);
  } else {
    return {
      data: null,
      data_id: null,
      message: "Which invoice would you like details about?",
      follow_up: "Please provide the invoice number."
    };
  }

  const { data, error } = await query.single();

  if (error || !data) {
    return {
      data: null,
      data_id: null,
      message: "I couldn't find that invoice.",
      follow_up: "Would you like me to list your invoices?"
    };
  }

  const invoice = sanitizeData(data);
  const daysUntilDue = Math.ceil((new Date(invoice.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  
  let statusMessage = '';
  if (invoice.status === 'paid') {
    statusMessage = 'This invoice has been paid. Thank you!';
  } else if (invoice.status === 'overdue') {
    statusMessage = `This invoice is overdue by ${Math.abs(daysUntilDue)} days. Please remit at your earliest convenience.`;
  } else if (daysUntilDue <= 7) {
    statusMessage = `Payment is due in ${daysUntilDue} days.`;
  }

  return {
    data: invoice,
    data_id: invoice.id,
    message: `Invoice ${invoice.invoice_number}: Amount ₹${formatCurrency(invoice.amount)}, GST ₹${formatCurrency(invoice.tax_amount)}, Total ₹${formatCurrency(invoice.total_amount)}. Due date: ${formatDate(invoice.due_date)}. Status: ${invoice.status}. ${statusMessage}`,
    follow_up: "Would you like payment details sent to your email?"
  };
}

// Get payment history
async function getPaymentHistory(contactId: string, organizationId: string) {
  const { data, error } = await supabase
    .from('payments')
    .select(`
      id, amount, payment_date, status,
      invoices (invoice_number)
    `)
    .eq('organization_id', organizationId)
    .eq('status', 'completed')
    .order('payment_date', { ascending: false })
    .limit(10);

  if (error || !data || data.length === 0) {
    return {
      data: null,
      data_id: null,
      message: "I couldn't find any payment records.",
      follow_up: "Would you like to check on pending invoices instead?"
    };
  }

  const payments = data.map(p => sanitizeData(p));
  const totalPaid = payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

  return {
    data: payments,
    data_id: null,
    message: `I found ${payments.length} payment(s) totaling ₹${formatCurrency(totalPaid)}. Your last payment was ₹${formatCurrency(payments[0].amount)} on ${formatDate(payments[0].payment_date)}.`,
    follow_up: "Would you like a detailed payment statement sent to your email?"
  };
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

// Sanitize data - remove forbidden fields
function sanitizeData(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized: any = Array.isArray(obj) ? [] : {};
  
  for (const [key, value] of Object.entries(obj)) {
    // Skip forbidden fields
    const lowerKey = key.toLowerCase();
    if (FORBIDDEN_FIELDS.some(f => lowerKey.includes(f))) {
      continue;
    }
    
    if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeData(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

// Log data access
async function logAccess(
  sessionId: string | null,
  contactId: string,
  queryType: string,
  dataId: string | null,
  granted: boolean,
  denialReason: string | null
) {
  try {
    await supabase.from('data_access_log').insert({
      session_id: sessionId,
      contact_id: contactId,
      data_type: queryType.split('_')[0],
      data_id: dataId,
      query_type: queryType,
      access_granted: granted,
      denial_reason: denialReason
    });
  } catch (e) {
    console.error('Failed to log access:', e);
  }
}

// Get verification prompt
function getVerificationPrompt(level: number): string {
  switch (level) {
    case 2:
      return "For security, could you please confirm your full name and company?";
    case 3:
      return "Before I share financial details, could you confirm the name of one of your projects with us, or the approximate amount of your last invoice?";
    case 4:
      return "For highly sensitive information, please provide your client PIN, or I can send a verification code to your registered email.";
    default:
      return "Could you help me verify your identity?";
  }
}

// Format date for voice
function formatDate(dateStr: string): string {
  if (!dateStr) return 'not yet determined';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
}

// Format currency
function formatCurrency(amount: number): string {
  if (!amount) return '0';
  return amount.toLocaleString('en-IN');
}