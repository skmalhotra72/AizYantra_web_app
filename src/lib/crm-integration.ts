// ═══════════════════════════════════════════════════════════════
// AIzYantra CRM Integration Service
// Path: src/lib/crm-integration.ts
// Purpose: Auto-create organizations, contacts, and leads from assessments
// ═══════════════════════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface AssessmentUserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  organization_name: string;
  designation: string;
  organization_size?: string;
  industry?: string;
}

export interface CRMIntegrationResult {
  success: boolean;
  organizationId: string | null;
  contactId: string | null;
  leadId: string | null;
  error?: string;
}

// ═══════════════════════════════════════════════════════════════
// Helper: Generate Lead Number
// ═══════════════════════════════════════════════════════════════

async function generateLeadNumber(): Promise<string> {
  const year = new Date().getFullYear();
  
  // Get the latest lead number for this year
  const { data } = await supabase
    .from('leads')
    .select('lead_number')
    .like('lead_number', `LEAD-${year}-%`)
    .order('created_at', { ascending: false })
    .limit(1);

  let nextNumber = 1;
  
  if (data && data.length > 0) {
    const lastNumber = data[0].lead_number;
    const match = lastNumber.match(/LEAD-\d{4}-(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  return `LEAD-${year}-${String(nextNumber).padStart(4, '0')}`;
}

// ═══════════════════════════════════════════════════════════════
// Find or Create Organization
// ═══════════════════════════════════════════════════════════════

export async function findOrCreateOrganization(
  orgName: string,
  industry?: string,
  employeeCount?: string
): Promise<{ id: string | null; isNew: boolean; error?: string }> {
  try {
    // Try to find existing organization by name (case-insensitive)
    const { data: existing } = await supabase
      .from('organizations')
      .select('id, name')
      .ilike('name', orgName)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log('Found existing organization:', existing[0].name);
      return { id: existing[0].id, isNew: false };
    }

    // Create new organization
    const { data: newOrg, error } = await supabase
      .from('organizations')
      .insert([{
        name: orgName,
        industry: industry || null,
        employee_count: employeeCount || null,
        tags: ['ai_assessment', 'website_lead'],
        notes: `Created from AI Assessment on ${new Date().toLocaleDateString()}`,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating organization:', error);
      return { id: null, isNew: false, error: error.message };
    }

    console.log('Created new organization:', newOrg.name);
    return { id: newOrg.id, isNew: true };

  } catch (error: any) {
    console.error('Organization error:', error);
    return { id: null, isNew: false, error: error.message };
  }
}

// ═══════════════════════════════════════════════════════════════
// Find or Create Contact
// ═══════════════════════════════════════════════════════════════

export async function findOrCreateContact(
  name: string,
  email: string,
  phone: string,
  role: string,
  organizationId: string | null
): Promise<{ id: string | null; isNew: boolean; error?: string }> {
  try {
    // Try to find existing contact by email
    const { data: existing } = await supabase
      .from('contacts')
      .select('id, name, email')
      .eq('email', email)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log('Found existing contact:', existing[0].email);
      
      // Update organization_id if not set
      if (organizationId && !existing[0].organization_id) {
        await supabase
          .from('contacts')
          .update({ organization_id: organizationId })
          .eq('id', existing[0].id);
      }
      
      return { id: existing[0].id, isNew: false };
    }

    // Create new contact
    const { data: newContact, error } = await supabase
      .from('contacts')
      .insert([{
        name: name,
        email: email,
        phone: phone,
        role: role,
        organization_id: organizationId,
        is_primary: true,
        is_decision_maker: ['CEO', 'CTO', 'COO', 'CFO', 'Director', 'VP', 'Head', 'Owner', 'Founder'].some(
          title => role?.toLowerCase().includes(title.toLowerCase())
        ),
        tags: ['ai_assessment'],
        notes: `Created from AI Assessment on ${new Date().toLocaleDateString()}`,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating contact:', error);
      return { id: null, isNew: false, error: error.message };
    }

    console.log('Created new contact:', newContact.email);
    return { id: newContact.id, isNew: true };

  } catch (error: any) {
    console.error('Contact error:', error);
    return { id: null, isNew: false, error: error.message };
  }
}

// ═══════════════════════════════════════════════════════════════
// Create Lead from Assessment
// ═══════════════════════════════════════════════════════════════

export async function createLeadFromAssessment(
  assessmentUserId: string,
  contactId: string | null,
  organizationId: string | null,
  aiReadinessScore: number,
  assessmentData: {
    userName: string;
    industry?: string;
    organizationName: string;
    strengths?: string[];
    gaps?: string[];
    recommendations?: string[];
  }
): Promise<{ id: string | null; leadNumber: string | null; error?: string }> {
  try {
    const leadNumber = await generateLeadNumber();
    
    // Determine priority based on score and role
    let priority = 'medium';
    if (aiReadinessScore >= 60) {
      priority = 'high';
    } else if (aiReadinessScore < 30) {
      priority = 'low';
    }

    // Build AI insights
    const aiInsights = {
      source: 'ai_assessment',
      assessed_at: new Date().toISOString(),
      readiness_score: aiReadinessScore,
      strengths: assessmentData.strengths || [],
      gaps: assessmentData.gaps || [],
      summary: `${assessmentData.userName} from ${assessmentData.organizationName} completed AI Readiness Assessment with score ${aiReadinessScore}/100.`,
    };

    // Build recommended actions based on gaps
    const recommendedActions = assessmentData.recommendations?.slice(0, 3) || [
      'Schedule discovery call to discuss assessment results',
      'Share relevant case studies from similar industry',
      'Propose pilot project based on identified opportunities',
    ];

    const { data: newLead, error } = await supabase
      .from('leads')
      .insert([{
        lead_number: leadNumber,
        organization_id: organizationId,
        contact_id: contactId,
        assessment_user_id: assessmentUserId,
        source: 'ai_assessment',
        source_detail: 'Website AI Readiness Assessment',
        title: `AI Assessment: ${assessmentData.organizationName}`,
        description: `${assessmentData.userName} completed AI Readiness Assessment. Score: ${aiReadinessScore}/100. Industry: ${assessmentData.industry || 'Not specified'}.`,
        status: 'new',
        score: Math.round(aiReadinessScore * 0.8), // Convert to lead score (0-80 range)
        ai_readiness_score: aiReadinessScore,
        lead_score: Math.round(aiReadinessScore * 0.8),
        priority: priority,
        service_interest: ['AI Consulting', 'AI Assessment'],
        ai_insights: aiInsights,
        ai_recommended_actions: recommendedActions,
        probability: aiReadinessScore >= 50 ? 30 : 15, // Initial probability
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating lead:', error);
      return { id: null, leadNumber: null, error: error.message };
    }

    console.log('Created new lead:', newLead.lead_number);
    return { id: newLead.id, leadNumber: newLead.lead_number };

  } catch (error: any) {
    console.error('Lead creation error:', error);
    return { id: null, leadNumber: null, error: error.message };
  }
}

// ═══════════════════════════════════════════════════════════════
// Main Integration Function
// ═══════════════════════════════════════════════════════════════

export async function integrateAssessmentWithCRM(
  assessmentUser: AssessmentUserData,
  assessmentResult: {
    overall_score: number;
    strengths?: string[];
    gaps?: string[];
    recommendations?: string[];
  }
): Promise<CRMIntegrationResult> {
  console.log('Starting CRM integration for:', assessmentUser.email);

  try {
    // Step 1: Find or create organization
    const orgResult = await findOrCreateOrganization(
      assessmentUser.organization_name,
      assessmentUser.industry,
      assessmentUser.organization_size
    );

    if (orgResult.error) {
      console.warn('Organization creation warning:', orgResult.error);
    }

    // Step 2: Find or create contact
    const contactResult = await findOrCreateContact(
      assessmentUser.name,
      assessmentUser.email,
      assessmentUser.phone,
      assessmentUser.designation,
      orgResult.id
    );

    if (contactResult.error) {
      console.warn('Contact creation warning:', contactResult.error);
    }

    // Step 3: Create lead
    const leadResult = await createLeadFromAssessment(
      assessmentUser.id,
      contactResult.id,
      orgResult.id,
      assessmentResult.overall_score,
      {
        userName: assessmentUser.name,
        industry: assessmentUser.industry,
        organizationName: assessmentUser.organization_name,
        strengths: assessmentResult.strengths,
        gaps: assessmentResult.gaps,
        recommendations: assessmentResult.recommendations,
      }
    );

    if (leadResult.error) {
      console.error('Lead creation failed:', leadResult.error);
      return {
        success: false,
        organizationId: orgResult.id,
        contactId: contactResult.id,
        leadId: null,
        error: leadResult.error,
      };
    }

    // Step 4: Update assessment_users with CRM IDs (optional)
    await supabase
      .from('assessment_users')
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq('id', assessmentUser.id);

    console.log('CRM integration complete:', {
      organization: orgResult.id,
      contact: contactResult.id,
      lead: leadResult.leadNumber,
    });

    return {
      success: true,
      organizationId: orgResult.id,
      contactId: contactResult.id,
      leadId: leadResult.id,
    };

  } catch (error: any) {
    console.error('CRM integration failed:', error);
    return {
      success: false,
      organizationId: null,
      contactId: null,
      leadId: null,
      error: error.message,
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// Batch Integration (for existing assessments)
// ═══════════════════════════════════════════════════════════════

export async function integrateExistingAssessments(): Promise<{
  processed: number;
  successful: number;
  failed: number;
  errors: string[];
}> {
  const results = {
    processed: 0,
    successful: 0,
    failed: 0,
    errors: [] as string[],
  };

  try {
    // Get all completed assessments without leads
    const { data: assessments } = await supabase
      .from('assessments')
      .select(`
        id,
        user_id,
        lead_id,
        assessment_users!inner(
          id, name, email, phone, organization_name, designation, organization_size, industry
        ),
        assessment_results(
          overall_score, strengths, gaps, recommendations
        )
      `)
      .eq('status', 'completed')
      .is('lead_id', null);

    if (!assessments || assessments.length === 0) {
      console.log('No assessments to process');
      return results;
    }

    for (const assessment of assessments) {
      results.processed++;

      const user = assessment.assessment_users as any;
      const result = assessment.assessment_results?.[0] as any;

      if (!user || !result) {
        results.failed++;
        results.errors.push(`Assessment ${assessment.id}: Missing user or result data`);
        continue;
      }

      const integrationResult = await integrateAssessmentWithCRM(
        {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          organization_name: user.organization_name,
          designation: user.designation,
          organization_size: user.organization_size,
          industry: user.industry,
        },
        {
          overall_score: result.overall_score,
          strengths: result.strengths,
          gaps: result.gaps,
          recommendations: result.recommendations,
        }
      );

      if (integrationResult.success && integrationResult.leadId) {
        // Update assessment with lead_id
        await supabase
          .from('assessments')
          .update({ lead_id: integrationResult.leadId })
          .eq('id', assessment.id);

        results.successful++;
      } else {
        results.failed++;
        results.errors.push(`Assessment ${assessment.id}: ${integrationResult.error}`);
      }
    }

    return results;

  } catch (error: any) {
    console.error('Batch integration error:', error);
    results.errors.push(error.message);
    return results;
  }
}

export default {
  findOrCreateOrganization,
  findOrCreateContact,
  createLeadFromAssessment,
  integrateAssessmentWithCRM,
  integrateExistingAssessments,
};