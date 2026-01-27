// ═══════════════════════════════════════════════════════════════
// AIzYantra AI Assessment - Supabase Client Helpers
// Path: src/lib/assessment-db.ts
// WITH CRM INTEGRATION ENABLED
// ═══════════════════════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js';
import { integrateAssessmentWithCRM } from './crm-integration';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export type AssessmentTier = 'quick' | 'standard' | 'deep';
export type AssessmentStatus = 'not_started' | 'in_progress' | 'completed' | 'abandoned';

export interface AssessmentUser {
  id?: string;
  name: string;
  email: string;
  phone: string;
  organization_name: string;
  designation: string;
  organization_size?: string;
  industry?: string;
  marketing_consent?: boolean;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

export interface AssessmentDimension {
  id: number;
  code: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  display_order: number;
}

export interface AssessmentQuestion {
  id: string;
  dimension_id: number;
  tier: AssessmentTier;
  question_text: string;
  question_type: string;
  help_text?: string;
  options: QuestionOption[];
  max_score: number;
  display_order: number;
}

export interface QuestionOption {
  value: number;
  label: string;
  score: number;
}

export interface Assessment {
  id?: string;
  user_id: string;
  lead_id?: string;
  tier: AssessmentTier;
  status: AssessmentStatus;
  current_step: number;
  total_steps: number;
  current_dimension: number;
  started_at?: string;
  completed_at?: string;
  time_spent_seconds: number;
  session_token?: string;
}

export interface AssessmentResponse {
  id?: string;
  assessment_id: string;
  question_id: string;
  dimension_id: number;
  response_value: any;
  score: number;
  time_spent_seconds?: number;
}

export interface AssessmentResult {
  id?: string;
  assessment_id: string;
  overall_score: number;
  readiness_level: string;
  dimension_scores: Record<string, { score: number; max: number; level: string }>;
  radar_data: Array<{ dimension: string; score: number; benchmark: number }>;
  strengths?: string[];
  gaps?: string[];
  recommendations?: string[];
}

export interface Lead {
  id?: string;
  assessment_user_id?: string;
  source?: string;
  status?: string;
  ai_readiness_score?: number;
  lead_score?: number;
  priority?: string;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
}

// ═══════════════════════════════════════════════════════════════
// Supabase Client
// ═══════════════════════════════════════════════════════════════

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ═══════════════════════════════════════════════════════════════
// User Functions
// ═══════════════════════════════════════════════════════════════

/**
 * Create a new assessment user (lead capture)
 */
export async function createAssessmentUser(userData: AssessmentUser): Promise<{ user: AssessmentUser | null; error: string | null }> {
  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('assessment_users')
      .select('*')
      .eq('email', userData.email)
      .single();

    if (existingUser) {
      // Update last login and return existing user
      await supabase
        .from('assessment_users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', existingUser.id);
      
      return { user: existingUser, error: null };
    }

    // Create new user
    const { data, error } = await supabase
      .from('assessment_users')
      .insert([{
        ...userData,
        terms_accepted_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;

    return { user: data, error: null };
  } catch (error: any) {
    console.error('Error creating assessment user:', error);
    return { user: null, error: error.message };
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<AssessmentUser | null> {
  const { data, error } = await supabase
    .from('assessment_users')
    .select('*')
    .eq('email', email)
    .single();

  if (error) return null;
  return data;
}

/**
 * Get user by session token (for resuming without login)
 */
export async function getUserBySessionToken(token: string): Promise<{ user: AssessmentUser | null; assessment: Assessment | null }> {
  const { data: assessment } = await supabase
    .from('assessments')
    .select('*, assessment_users(*)')
    .eq('session_token', token)
    .single();

  if (!assessment) return { user: null, assessment: null };

  return {
    user: assessment.assessment_users,
    assessment: assessment,
  };
}

// ═══════════════════════════════════════════════════════════════
// Lead Functions - WITH CRM INTEGRATION
// ═══════════════════════════════════════════════════════════════

/**
 * Create a lead from assessment user using CRM integration
 */
export async function createLead(userId: string, userData: AssessmentUser): Promise<{ lead: Lead | null; error: string | null }> {
  // Lead will be created via CRM integration when assessment is completed
  // This is now a placeholder that returns null
  console.log('Lead will be created via CRM integration upon assessment completion');
  return { lead: null, error: null };
}

/**
 * Create lead via CRM integration (called after assessment completion)
 */
export async function createLeadWithCRM(
  assessmentUser: AssessmentUser,
  assessmentResult: {
    overall_score: number;
    strengths?: string[];
    gaps?: string[];
    recommendations?: string[];
  }
): Promise<{ leadId: string | null; error: string | null }> {
  try {
    if (!assessmentUser.id) {
      throw new Error('Assessment user ID is required');
    }

    const result = await integrateAssessmentWithCRM(
      {
        id: assessmentUser.id,
        name: assessmentUser.name,
        email: assessmentUser.email,
        phone: assessmentUser.phone,
        organization_name: assessmentUser.organization_name,
        designation: assessmentUser.designation,
        organization_size: assessmentUser.organization_size,
        industry: assessmentUser.industry,
      },
      assessmentResult
    );

    if (result.success) {
      return { leadId: result.leadId, error: null };
    } else {
      return { leadId: null, error: result.error || 'CRM integration failed' };
    }
  } catch (error: any) {
    console.error('Error creating lead with CRM:', error);
    return { leadId: null, error: error.message };
  }
}

/**
 * Update lead with assessment score
 */
export async function updateLeadScore(leadId: string, score: number): Promise<void> {
  try {
    const priority = score >= 65 ? 'high' : score >= 40 ? 'medium' : 'low';
    
    await supabase
      .from('leads')
      .update({
        ai_readiness_score: score,
        lead_score: Math.round(score * 0.8),
        priority,
        updated_at: new Date().toISOString(),
      })
      .eq('id', leadId);
  } catch (error) {
    console.warn('Could not update lead score:', error);
  }
}

// ═══════════════════════════════════════════════════════════════
// Dimension & Question Functions
// ═══════════════════════════════════════════════════════════════

/**
 * Get all assessment dimensions
 */
export async function getDimensions(): Promise<AssessmentDimension[]> {
  const { data, error } = await supabase
    .from('assessment_dimensions')
    .select('*')
    .eq('is_active', true)
    .order('display_order');

  if (error) {
    console.error('Error fetching dimensions:', error);
    return [];
  }

  return data || [];
}

/**
 * Get questions by tier
 */
export async function getQuestionsByTier(tier: AssessmentTier): Promise<AssessmentQuestion[]> {
  const { data, error } = await supabase
    .from('assessment_questions')
    .select('*')
    .eq('tier', tier)
    .eq('is_active', true)
    .order('display_order');

  if (error) {
    console.error('Error fetching questions:', error);
    return [];
  }

  return data || [];
}

/**
 * Get question count by tier
 */
export async function getQuestionCount(tier: AssessmentTier): Promise<number> {
  const { count, error } = await supabase
    .from('assessment_questions')
    .select('*', { count: 'exact', head: true })
    .eq('tier', tier)
    .eq('is_active', true);

  if (error) return 0;
  return count || 0;
}

// ═══════════════════════════════════════════════════════════════
// Assessment Functions
// ═══════════════════════════════════════════════════════════════

/**
 * Create a new assessment
 */
export async function createAssessment(
  userId: string,
  leadId: string | null,
  tier: AssessmentTier
): Promise<{ assessment: Assessment | null; error: string | null }> {
  try {
    const totalSteps = await getQuestionCount(tier);
    const sessionToken = generateSessionToken();

    const { data, error } = await supabase
      .from('assessments')
      .insert([{
        user_id: userId,
        lead_id: leadId,
        tier,
        status: 'not_started',
        current_step: 0,
        total_steps: totalSteps || 7,
        current_dimension: 1,
        time_spent_seconds: 0,
        session_token: sessionToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;

    logActivity(data.id, userId, 'created', { tier }).catch(() => {});

    return { assessment: data, error: null };
  } catch (error: any) {
    console.error('Error creating assessment:', error);
    return { assessment: null, error: error.message };
  }
}

/**
 * Get assessment by ID
 */
export async function getAssessment(assessmentId: string): Promise<Assessment | null> {
  const { data, error } = await supabase
    .from('assessments')
    .select('*')
    .eq('id', assessmentId)
    .single();

  if (error) return null;
  return data;
}

/**
 * Get user's assessments
 */
export async function getUserAssessments(userId: string): Promise<Assessment[]> {
  const { data, error } = await supabase
    .from('assessments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data || [];
}

/**
 * Start assessment
 */
export async function startAssessment(assessmentId: string): Promise<void> {
  await supabase
    .from('assessments')
    .update({
      status: 'in_progress',
      started_at: new Date().toISOString(),
      current_step: 1,
    })
    .eq('id', assessmentId);

  const assessment = await getAssessment(assessmentId);
  if (assessment) {
    logActivity(assessmentId, assessment.user_id, 'started', {}).catch(() => {});
  }
}

/**
 * Update assessment progress
 */
export async function updateAssessmentProgress(
  assessmentId: string,
  currentStep: number,
  currentDimension: number,
  timeSpent: number
): Promise<void> {
  await supabase
    .from('assessments')
    .update({
      current_step: currentStep,
      current_dimension: currentDimension,
      time_spent_seconds: timeSpent,
      last_activity_at: new Date().toISOString(),
    })
    .eq('id', assessmentId);
}

/**
 * Complete assessment and trigger CRM integration
 */
export async function completeAssessment(assessmentId: string, timeSpent: number): Promise<void> {
  await supabase
    .from('assessments')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      time_spent_seconds: timeSpent,
    })
    .eq('id', assessmentId);

  const assessment = await getAssessment(assessmentId);
  if (assessment) {
    logActivity(assessmentId, assessment.user_id, 'completed', { timeSpent }).catch(() => {});
  }
}

/**
 * Complete assessment with CRM integration
 */
export async function completeAssessmentWithCRM(
  assessmentId: string,
  timeSpent: number,
  assessmentUser: AssessmentUser,
  assessmentResult: {
    overall_score: number;
    strengths?: string[];
    gaps?: string[];
    recommendations?: string[];
  }
): Promise<{ leadId: string | null }> {
  // Mark assessment as completed
  await completeAssessment(assessmentId, timeSpent);

  // Create lead via CRM integration
  const { leadId } = await createLeadWithCRM(assessmentUser, assessmentResult);

  // Update assessment with lead_id
  if (leadId) {
    await supabase
      .from('assessments')
      .update({ lead_id: leadId })
      .eq('id', assessmentId);
  }

  return { leadId };
}

// ═══════════════════════════════════════════════════════════════
// Response Functions
// ═══════════════════════════════════════════════════════════════

/**
 * Save a response (upsert - insert or update)
 */
export async function saveResponse(response: AssessmentResponse): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('assessment_responses')
      .upsert([{
        assessment_id: response.assessment_id,
        question_id: response.question_id,
        dimension_id: response.dimension_id,
        response_value: response.response_value,
        score: response.score,
        time_spent_seconds: response.time_spent_seconds,
        answered_at: new Date().toISOString(),
      }], {
        onConflict: 'assessment_id,question_id',
      });

    if (error) throw error;

    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error saving response:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all responses for an assessment
 */
export async function getAssessmentResponses(assessmentId: string): Promise<AssessmentResponse[]> {
  const { data, error } = await supabase
    .from('assessment_responses')
    .select('*')
    .eq('assessment_id', assessmentId)
    .order('answered_at');

  if (error) return [];
  return data || [];
}

// ═══════════════════════════════════════════════════════════════
// Results Functions
// ═══════════════════════════════════════════════════════════════

/**
 * Calculate and save assessment results
 */
export async function calculateAndSaveResults(assessmentId: string): Promise<{ result: AssessmentResult | null; error: string | null }> {
  try {
    const responses = await getAssessmentResponses(assessmentId);
    const dimensions = await getDimensions();

    if (responses.length === 0) {
      throw new Error('No responses found');
    }

    const dimensionScores: Record<string, { score: number; max: number; count: number }> = {};
    
    responses.forEach((response) => {
      const dimId = response.dimension_id.toString();
      if (!dimensionScores[dimId]) {
        dimensionScores[dimId] = { score: 0, max: 0, count: 0 };
      }
      dimensionScores[dimId].score += response.score;
      dimensionScores[dimId].max += 100;
      dimensionScores[dimId].count += 1;
    });

    let totalScore = 0;
    let totalMax = 0;
    const radarData: Array<{ dimension: string; score: number; benchmark: number }> = [];
    const formattedDimensionScores: Record<string, { score: number; max: number; level: string }> = {};

    dimensions.forEach((dim) => {
      const dimData = dimensionScores[dim.id.toString()];
      if (dimData) {
        const percentage = Math.round((dimData.score / dimData.max) * 100);
        totalScore += dimData.score;
        totalMax += dimData.max;

        formattedDimensionScores[dim.code] = {
          score: percentage,
          max: 100,
          level: getReadinessLevel(percentage),
        };

        radarData.push({
          dimension: dim.name,
          score: percentage,
          benchmark: 50,
        });
      }
    });

    const overallScore = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;
    const readinessLevel = getReadinessLevel(overallScore);

    const sortedDimensions = Object.entries(formattedDimensionScores)
      .sort((a, b) => b[1].score - a[1].score);

    const strengths = sortedDimensions
      .filter(([, data]) => data.score >= 60)
      .slice(0, 3)
      .map(([code]) => dimensions.find((d) => d.code === code)?.name || code);

    const gaps = sortedDimensions
      .filter(([, data]) => data.score < 50)
      .slice(-3)
      .map(([code]) => dimensions.find((d) => d.code === code)?.name || code);

    const recommendations = generateRecommendations(formattedDimensionScores, dimensions);

    const { data, error } = await supabase
      .from('assessment_results')
      .insert([{
        assessment_id: assessmentId,
        overall_score: overallScore,
        readiness_level: readinessLevel,
        dimension_scores: formattedDimensionScores,
        radar_data: radarData,
        strengths,
        gaps,
        recommendations,
        calculated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;

    return { result: data, error: null };
  } catch (error: any) {
    console.error('Error calculating results:', error);
    return { result: null, error: error.message };
  }
}

/**
 * Save AI-generated assessment results (for AI-powered assessments)
 */
export async function saveAssessmentResults(
  assessmentId: string,
  results: {
    overall_score: number;
    readiness_level: string;
    dimension_scores: Record<string, number>;
    strengths: string[];
    gaps: string[];
    recommendations: any[];
  }
): Promise<{ success: boolean; error: string | null }> {
  try {
    // Convert dimension_scores format
    const formattedDimensionScores: Record<string, { score: number; max: number; level: string }> = {};
    Object.entries(results.dimension_scores).forEach(([dimension, score]) => {
      formattedDimensionScores[dimension] = {
        score: score,
        max: 100,
        level: getReadinessLevel(score),
      };
    });

    // Create radar_data
    const radarData = Object.entries(results.dimension_scores).map(([dimension, score]) => ({
      dimension,
      score,
      benchmark: 50,
    }));

    const { error } = await supabase
      .from('assessment_results')
      .insert([{
        assessment_id: assessmentId,
        overall_score: results.overall_score,
        readiness_level: results.readiness_level,
        dimension_scores: formattedDimensionScores,
        radar_data: radarData,
        strengths: results.strengths,
        gaps: results.gaps,
        recommendations: results.recommendations,
        calculated_at: new Date().toISOString(),
      }]);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error saving assessment results:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get assessment results
 */
export async function getAssessmentResults(assessmentId: string): Promise<AssessmentResult | null> {
  const { data, error } = await supabase
    .from('assessment_results')
    .select('*')
    .eq('assessment_id', assessmentId)
    .single();

  if (error) return null;
  return data;
}

// ═══════════════════════════════════════════════════════════════
// Activity Logging
// ═══════════════════════════════════════════════════════════════

/**
 * Log assessment activity
 */
export async function logActivity(
  assessmentId: string | null,
  userId: string | null,
  action: string,
  details: Record<string, any>
): Promise<void> {
  try {
    await supabase
      .from('assessment_activity_log')
      .insert([{
        assessment_id: assessmentId,
        user_id: userId,
        action,
        details,
      }]);
  } catch (error) {
    console.warn('Activity log failed:', error);
  }
}

// ═══════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════

function generateSessionToken(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

function getReadinessLevel(score: number): string {
  if (score >= 80) return 'Leader';
  if (score >= 65) return 'Advanced';
  if (score >= 50) return 'Established';
  if (score >= 35) return 'Developing';
  return 'Beginner';
}

function generateRecommendations(
  scores: Record<string, { score: number; max: number; level: string }>,
  dimensions: AssessmentDimension[]
): string[] {
  const recommendations: string[] = [];

  Object.entries(scores).forEach(([code, data]) => {
    const dim = dimensions.find((d) => d.code === code);
    if (!dim) return;

    if (data.score < 35) {
      recommendations.push(`Priority: Build foundational ${dim.name.toLowerCase()} capabilities`);
    } else if (data.score < 50) {
      recommendations.push(`Focus on strengthening ${dim.name.toLowerCase()} practices`);
    } else if (data.score < 65) {
      recommendations.push(`Optimize and scale ${dim.name.toLowerCase()} initiatives`);
    }
  });

  return recommendations.slice(0, 5);
}

export default supabase;