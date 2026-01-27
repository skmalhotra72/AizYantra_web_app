// ═══════════════════════════════════════════════════════════════
// AIzYantra CRM Integration API Route
// Path: src/app/api/assessment/integrate-crm/route.ts
// Purpose: Trigger CRM integration for assessments
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ═══════════════════════════════════════════════════════════════
// Helper Functions (inline to avoid import issues)
// ═══════════════════════════════════════════════════════════════

async function generateLeadNumber(): Promise<string> {
  const year = new Date().getFullYear();
  
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

async function findOrCreateOrganization(
  orgName: string,
  industry?: string,
  employeeCount?: string
) {
  // Try to find existing organization
  const { data: existing } = await supabase
    .from('organizations')
    .select('id, name')
    .ilike('name', orgName)
    .limit(1);

  if (existing && existing.length > 0) {
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

  return { id: newOrg.id, isNew: true };
}

async function findOrCreateContact(
  name: string,
  email: string,
  phone: string,
  role: string,
  organizationId: string | null
) {
  // Try to find existing contact
  const { data: existing } = await supabase
    .from('contacts')
    .select('id, name, email')
    .eq('email', email)
    .limit(1);

  if (existing && existing.length > 0) {
    // Update organization_id if not set
    if (organizationId) {
      await supabase
        .from('contacts')
        .update({ organization_id: organizationId })
        .eq('id', existing[0].id);
    }
    return { id: existing[0].id, isNew: false };
  }

  // Create new contact
  const isDecisionMaker = ['CEO', 'CTO', 'COO', 'CFO', 'Director', 'VP', 'Head', 'Owner', 'Founder'].some(
    title => role?.toLowerCase().includes(title.toLowerCase())
  );

  const { data: newContact, error } = await supabase
    .from('contacts')
    .insert([{
      name,
      email,
      phone,
      role,
      organization_id: organizationId,
      is_primary: true,
      is_decision_maker: isDecisionMaker,
      tags: ['ai_assessment'],
      notes: `Created from AI Assessment on ${new Date().toLocaleDateString()}`,
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating contact:', error);
    return { id: null, isNew: false, error: error.message };
  }

  return { id: newContact.id, isNew: true };
}

async function createLeadFromAssessment(
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
) {
  const leadNumber = await generateLeadNumber();
  
  let priority = 'medium';
  if (aiReadinessScore >= 60) priority = 'high';
  else if (aiReadinessScore < 30) priority = 'low';

  const aiInsights = {
    source: 'ai_assessment',
    assessed_at: new Date().toISOString(),
    readiness_score: aiReadinessScore,
    strengths: assessmentData.strengths || [],
    gaps: assessmentData.gaps || [],
    summary: `${assessmentData.userName} from ${assessmentData.organizationName} completed AI Readiness Assessment with score ${aiReadinessScore}/100.`,
  };

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
      score: Math.round(aiReadinessScore * 0.8),
      ai_readiness_score: aiReadinessScore,
      lead_score: Math.round(aiReadinessScore * 0.8),
      priority,
      service_interest: ['AI Consulting', 'AI Assessment'],
      ai_insights: aiInsights,
      ai_recommended_actions: recommendedActions,
      probability: aiReadinessScore >= 50 ? 30 : 15,
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating lead:', error);
    return { id: null, leadNumber: null, error: error.message };
  }

  return { id: newLead.id, leadNumber: newLead.lead_number };
}

// ═══════════════════════════════════════════════════════════════
// POST Handler - Integrate single assessment or batch
// ═══════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, assessmentId } = body;

    if (action === 'integrate_single' && assessmentId) {
      // ─────────────────────────────────────────────────────────
      // Integrate single assessment
      // ─────────────────────────────────────────────────────────
      
      // Get assessment with user and results
      const { data: assessment, error: assessmentError } = await supabase
        .from('assessments')
        .select(`
          id,
          lead_id,
          assessment_users!inner(
            id, name, email, phone, organization_name, designation, organization_size, industry
          ),
          assessment_results(
            overall_score, strengths, gaps, recommendations
          )
        `)
        .eq('id', assessmentId)
        .single();

      if (assessmentError || !assessment) {
        return NextResponse.json(
          { error: 'Assessment not found' },
          { status: 404 }
        );
      }

      if (assessment.lead_id) {
        return NextResponse.json(
          { error: 'Assessment already has a lead', leadId: assessment.lead_id },
          { status: 400 }
        );
      }

      const user = assessment.assessment_users as any;
      const result = assessment.assessment_results as any;

      if (!result) {
        return NextResponse.json(
          { error: 'Assessment has no results' },
          { status: 400 }
        );
      }

      // Create organization
      const orgResult = await findOrCreateOrganization(
        user.organization_name,
        user.industry,
        user.organization_size
      );

      // Create contact
      const contactResult = await findOrCreateContact(
        user.name,
        user.email,
        user.phone,
        user.designation,
        orgResult.id
      );

      // Create lead
      const leadResult = await createLeadFromAssessment(
        user.id,
        contactResult.id,
        orgResult.id,
        result.overall_score,
        {
          userName: user.name,
          industry: user.industry,
          organizationName: user.organization_name,
          strengths: result.strengths,
          gaps: result.gaps,
          recommendations: result.recommendations,
        }
      );

      if (leadResult.error) {
        return NextResponse.json(
          { error: leadResult.error },
          { status: 500 }
        );
      }

      // Update assessment with lead_id
      await supabase
        .from('assessments')
        .update({ lead_id: leadResult.id })
        .eq('id', assessmentId);

      return NextResponse.json({
        success: true,
        data: {
          organizationId: orgResult.id,
          organizationIsNew: orgResult.isNew,
          contactId: contactResult.id,
          contactIsNew: contactResult.isNew,
          leadId: leadResult.id,
          leadNumber: leadResult.leadNumber,
        }
      });

    } else if (action === 'integrate_all') {
      // ─────────────────────────────────────────────────────────
      // Integrate all assessments without leads
      // ─────────────────────────────────────────────────────────
      
      const { data: assessments } = await supabase
        .from('assessments')
        .select(`
          id,
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
        return NextResponse.json({
          success: true,
          message: 'No assessments to process',
          processed: 0,
        });
      }

      const results = {
        processed: 0,
        successful: 0,
        failed: 0,
        errors: [] as string[],
      };

      for (const assessment of assessments) {
        results.processed++;

        const user = assessment.assessment_users as any;
        const result = assessment.assessment_results as any;

        if (!result) {
          results.failed++;
          results.errors.push(`Assessment ${assessment.id}: No results`);
          continue;
        }

        try {
          const orgResult = await findOrCreateOrganization(
            user.organization_name,
            user.industry,
            user.organization_size
          );

          const contactResult = await findOrCreateContact(
            user.name,
            user.email,
            user.phone,
            user.designation,
            orgResult.id
          );

          const leadResult = await createLeadFromAssessment(
            user.id,
            contactResult.id,
            orgResult.id,
            result.overall_score,
            {
              userName: user.name,
              industry: user.industry,
              organizationName: user.organization_name,
              strengths: result.strengths,
              gaps: result.gaps,
              recommendations: result.recommendations,
            }
          );

          if (leadResult.id) {
            await supabase
              .from('assessments')
              .update({ lead_id: leadResult.id })
              .eq('id', assessment.id);

            results.successful++;
          } else {
            results.failed++;
            results.errors.push(`Assessment ${assessment.id}: ${leadResult.error}`);
          }
        } catch (err: any) {
          results.failed++;
          results.errors.push(`Assessment ${assessment.id}: ${err.message}`);
        }
      }

      return NextResponse.json({
        success: true,
        data: results,
      });

    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "integrate_single" with assessmentId or "integrate_all"' },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error('CRM Integration API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error.message },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// GET Handler - Check integration status
// ═══════════════════════════════════════════════════════════════

export async function GET() {
  try {
    // Count assessments needing integration
    const { count: pendingCount } = await supabase
      .from('assessments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
      .is('lead_id', null);

    const { count: totalCompleted } = await supabase
      .from('assessments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');

    const { count: integrated } = await supabase
      .from('assessments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
      .not('lead_id', 'is', null);

    return NextResponse.json({
      status: 'ok',
      service: 'AIzYantra CRM Integration API',
      stats: {
        totalCompleted: totalCompleted || 0,
        integrated: integrated || 0,
        pendingIntegration: pendingCount || 0,
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}