// ═══════════════════════════════════════════════════════════════
// AIzYantra Idea-to-Execution System - Database Helpers
// Path: src/lib/innovation/i2e-db.ts
// ═══════════════════════════════════════════════════════════════

import { createClient } from '@/lib/supabase/client';

export const supabase = createClient();

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface Idea {
  id: string;
  title: string;
  problem_statement: string;
  proposed_solution?: string;
  target_users: string;
  why_now?: string;
  industry_category?: string;
  created_by: string;
  is_anonymous: boolean;
  current_stage: number;
  status: 'active' | 'approved' | 'declined' | 'on_hold' | 'completed';
  created_at: string;
  updated_at: string;
  stage_entered_at: string;
  metadata?: any;
}

export interface WorkflowStage {
  id: number;
  stage_number: number;
  name: string;
  description?: string;
  requires_ai_evaluation: boolean;
  requires_voting: boolean;
  max_days_in_stage: number;
  pass_threshold?: number;
  is_active: boolean;
}

export interface TeamMember {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
  title?: string;
  base_voting_points: number;
  executive_multiplier: number;
  total_voting_points: number;
  can_submit_ideas: boolean;
  can_vote: boolean;
  can_approve_final: boolean;
  is_active: boolean;
}

export interface VotingSession {
  id: string;
  idea_id: string;
  title: string;
  description?: string;
  voting_parameters: any;
  status: 'active' | 'completed' | 'cancelled';
  start_time: string;
  end_time?: string;
  final_score?: number;
  decision?: 'approved' | 'conditional' | 'hold' | 'declined';
  total_voters: number;
  votes_received: number;
  created_at: string;
}

export interface Vote {
  id: string;
  session_id: string;
  voter_id: string;
  scores: any;
  comments?: string;
  vote_token: string;
  created_at: string;
}

export interface VotingParameter {
  id: number;
  name: string;
  description: string;
  guidance?: string;
  weight: number;
  display_order: number;
  is_active: boolean;
}

export interface AIEvaluation {
  id: string;
  idea_id: string;
  stage_number: number;
  evaluation_type: string;
  result_data: any;
  confidence_score?: number;
  pass_fail?: 'pass' | 'fail' | 'conditional';
  strengths?: string[];
  concerns?: string[];
  recommendations?: string[];
  pivot_suggestions?: string[];
  created_at: string;
}

// ═══════════════════════════════════════════════════════════════
// Idea Functions
// ═══════════════════════════════════════════════════════════════

/**
 * Create a new idea
 */
export async function createIdea(idea: Partial<Idea>): Promise<{ idea: Idea | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('ideas')
      .insert([{
        ...idea,
        current_stage: 1,
        status: 'active',
        is_anonymous: true,
      }])
      .select()
      .single();

    if (error) throw error;
    return { idea: data, error: null };
  } catch (error: any) {
    console.error('Error creating idea:', error);
    return { idea: null, error: error.message };
  }
}

/**
 * Get all ideas
 */
export async function getIdeas(): Promise<Idea[]> {
  const { data, error } = await supabase
    .from('ideas')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching ideas:', error);
    return [];
  }

  return data || [];
}

/**
 * Get idea by ID
 */
export async function getIdeaById(id: string): Promise<Idea | null> {
  const { data, error } = await supabase
    .from('ideas')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching idea:', error);
    return null;
  }

  return data;
}

/**
 * Update idea
 */
export async function updateIdea(id: string, updates: Partial<Idea>): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('ideas')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error updating idea:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Advance idea to next stage
 */
export async function advanceIdeaStage(ideaId: string, reason?: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { data, error } = await supabase.rpc('advance_idea_stage', {
      p_idea_id: ideaId,
      p_reason: reason || null,
    });

    if (error) throw error;
    return { success: data.success, error: data.error || null };
  } catch (error: any) {
    console.error('Error advancing stage:', error);
    return { success: false, error: error.message };
  }
}

// ═══════════════════════════════════════════════════════════════
// Workflow Functions
// ═══════════════════════════════════════════════════════════════

/**
 * Get all workflow stages
 */
export async function getWorkflowStages(): Promise<WorkflowStage[]> {
  const { data, error } = await supabase
    .from('workflow_stages')
    .select('*')
    .eq('is_active', true)
    .order('stage_number');

  if (error) {
    console.error('Error fetching stages:', error);
    return [];
  }

  return data || [];
}

/**
 * Get stage by number
 */
export async function getStageByNumber(stageNumber: number): Promise<WorkflowStage | null> {
  const { data, error } = await supabase
    .from('workflow_stages')
    .select('*')
    .eq('stage_number', stageNumber)
    .single();

  if (error) {
    console.error('Error fetching stage:', error);
    return null;
  }

  return data;
}

// ═══════════════════════════════════════════════════════════════
// Team Functions
// ═══════════════════════════════════════════════════════════════

/**
 * Get all team members
 */
export async function getTeamMembers(): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('is_active', true)
    .order('total_voting_points', { ascending: false });

  if (error) {
    console.error('Error fetching team members:', error);
    return [];
  }

  return data || [];
}

/**
 * Get team member by user ID
 */
export async function getTeamMemberByUserId(userId: string): Promise<TeamMember | null> {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching team member:', error);
    return null;
  }

  return data;
}

// ═══════════════════════════════════════════════════════════════
// Voting Functions
// ═══════════════════════════════════════════════════════════════

/**
 * Get voting parameters
 */
export async function getVotingParameters(): Promise<VotingParameter[]> {
  const { data, error } = await supabase
    .from('voting_parameters')
    .select('*')
    .eq('is_active', true)
    .order('display_order');

  if (error) {
    console.error('Error fetching voting parameters:', error);
    return [];
  }

  return data || [];
}

/**
 * Create voting session
 */
export async function createVotingSession(
  ideaId: string,
  title: string,
  description?: string
): Promise<{ session: VotingSession | null; error: string | null }> {
  try {
    // Get voting parameters
    const parameters = await getVotingParameters();
    
    // Count active team members who can vote
    const { count } = await supabase
      .from('team_members')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('can_vote', true);

    const { data, error } = await supabase
      .from('voting_sessions')
      .insert([{
        idea_id: ideaId,
        title,
        description,
        voting_parameters: parameters,
        status: 'active',
        total_voters: count || 0,
      }])
      .select()
      .single();

    if (error) throw error;
    return { session: data, error: null };
  } catch (error: any) {
    console.error('Error creating voting session:', error);
    return { session: null, error: error.message };
  }
}

/**
 * Submit vote
 */
export async function submitVote(
  sessionId: string,
  voterId: string,
  scores: Record<string, number>,
  comments?: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    // Generate anonymous vote token
    const voteToken = `vote_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    const { error } = await supabase
      .from('votes')
      .insert([{
        session_id: sessionId,
        voter_id: voterId,
        scores,
        comments,
        vote_token: voteToken,
      }]);

    if (error) throw error;

    // Update votes_received count
    await supabase.rpc('increment_votes_received', { p_session_id: sessionId });

    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error submitting vote:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Check if user has voted
 */
export async function hasUserVoted(sessionId: string, userId: string): Promise<boolean> {
  const { count } = await supabase
    .from('votes')
    .select('*', { count: 'exact', head: true })
    .eq('session_id', sessionId)
    .eq('voter_id', userId);

  return (count || 0) > 0;
}

/**
 * Tally votes
 */
export async function tallyVotes(sessionId: string): Promise<{ success: boolean; result: any; error: string | null }> {
  try {
    const { data, error } = await supabase.rpc('tally_votes', {
      p_session_id: sessionId,
    });

    if (error) throw error;
    return { success: data.success, result: data, error: null };
  } catch (error: any) {
    console.error('Error tallying votes:', error);
    return { success: false, result: null, error: error.message };
  }
}

// ═══════════════════════════════════════════════════════════════
// AI Evaluation Functions
// ═══════════════════════════════════════════════════════════════

/**
 * Save AI evaluation
 */
export async function saveAIEvaluation(evaluation: Partial<AIEvaluation>): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('ai_evaluations')
      .insert([evaluation]);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error saving AI evaluation:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get AI evaluations for idea
 */
export async function getAIEvaluations(ideaId: string): Promise<AIEvaluation[]> {
  const { data, error } = await supabase
    .from('ai_evaluations')
    .select('*')
    .eq('idea_id', ideaId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching AI evaluations:', error);
    return [];
  }

  return data || [];
}

// ═══════════════════════════════════════════════════════════════
// Activity Logging
// ═══════════════════════════════════════════════════════════════

/**
 * Log activity
 */
export async function logActivity(
  ideaId: string | null,
  userId: string | null,
  action: string,
  description?: string,
  changes?: any
): Promise<void> {
  try {
    await supabase
      .from('i2e_activity_log')
      .insert([{
        idea_id: ideaId,
        user_id: userId,
        action,
        description,
        changes,
      }]);
  } catch (error) {
    console.warn('Activity log failed:', error);
  }
}

/**
 * Get activity log for idea
 */
export async function getActivityLog(ideaId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('i2e_activity_log')
    .select('*')
    .eq('idea_id', ideaId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching activity log:', error);
    return [];
  }

  return data || [];
}

export default supabase;