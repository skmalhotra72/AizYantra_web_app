// =====================================================
// DESTINATION: src/app/api/innovation/voting/token/[token]/route.ts
// =====================================================
// Get voting session details using anonymous voting token

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    if (!token) {
      return NextResponse.json({ error: 'Voting token is required' }, { status: 400 })
    }

    // Get token with all related data
    const { data: tokenData, error: tokenError } = await supabase
      .from('voting_tokens')
      .select(`
        id,
        session_id,
        team_member_id,
        voting_points,
        is_used,
        used_at
      `)
      .eq('token', token)
      .single()

    if (tokenError || !tokenData) {
      return NextResponse.json({ 
        valid: false,
        error: 'Invalid or expired voting token'
      }, { status: 404 })
    }

    // Get team member info
    const { data: teamMember } = await supabase
      .from('team_members')
      .select('id, name, role, total_voting_points')
      .eq('id', tokenData.team_member_id)
      .single()

    // Get session info
    const { data: session } = await supabase
      .from('voting_sessions')
      .select(`
        id,
        title,
        description,
        status,
        start_time,
        deadline,
        total_votes,
        total_points,
        final_decision,
        idea_id
      `)
      .eq('id', tokenData.session_id)
      .single()

    if (!session) {
      return NextResponse.json({ 
        valid: false,
        error: 'Voting session not found'
      }, { status: 404 })
    }

    // Get idea details
    const { data: idea } = await supabase
      .from('ideas')
      .select(`
        id,
        title,
        problem_statement,
        target_users,
        proposed_solution,
        industry_category,
        submitter_name
      `)
      .eq('id', session.idea_id)
      .single()

    // Check if already voted
    if (tokenData.is_used) {
      return NextResponse.json({
        valid: true,
        alreadyVoted: true,
        votedAt: tokenData.used_at,
        session: {
          id: session.id,
          title: session.title,
          status: session.status,
          decision: session.final_decision
        },
        voter: {
          name: teamMember?.name || 'Unknown',
          role: teamMember?.role || '',
          points: tokenData.voting_points
        }
      })
    }

    // Check if session is still active
    if (session.status !== 'active') {
      return NextResponse.json({
        valid: true,
        sessionClosed: true,
        sessionStatus: session.status,
        session: {
          id: session.id,
          title: session.title,
          status: session.status,
          decision: session.final_decision
        }
      })
    }

    // Check deadline
    if (session.deadline && new Date(session.deadline) < new Date()) {
      return NextResponse.json({
        valid: true,
        deadlinePassed: true,
        deadline: session.deadline,
        session: {
          id: session.id,
          title: session.title,
          status: session.status
        }
      })
    }

    // Get evaluation summaries for this idea
    const { data: evaluations } = await supabase
      .from('ai_evaluations')
      .select('stage_number, evaluation_type, pass_fail, result_data')
      .eq('idea_id', session.idea_id)
      .order('stage_number')

    const evaluationSummary = evaluations?.map(e => ({
      stage: e.stage_number,
      type: e.evaluation_type,
      passed: e.pass_fail === 'pass',
      summary: e.result_data?.summary || null,
      score: e.result_data?.composite_score || e.result_data?.technical_score || null
    }))

    // Get voting progress
    const { count: totalTokens } = await supabase
      .from('voting_tokens')
      .select('id', { count: 'exact', head: true })
      .eq('session_id', session.id)

    const { count: usedTokens } = await supabase
      .from('voting_tokens')
      .select('id', { count: 'exact', head: true })
      .eq('session_id', session.id)
      .eq('is_used', true)

    return NextResponse.json({
      valid: true,
      canVote: true,
      session: {
        id: session.id,
        title: session.title,
        description: session.description,
        status: session.status,
        startTime: session.start_time,
        deadline: session.deadline
      },
      idea: {
        id: idea?.id,
        title: idea?.title,
        problemStatement: idea?.problem_statement,
        targetUsers: idea?.target_users,
        proposedSolution: idea?.proposed_solution,
        industry: idea?.industry_category,
        submittedBy: idea?.submitter_name
      },
      voter: {
        name: teamMember?.name || 'Unknown',
        role: teamMember?.role || '',
        votingPoints: tokenData.voting_points
      },
      evaluations: evaluationSummary || [],
      progress: {
        votesSubmitted: usedTokens || 0,
        totalVoters: totalTokens || 8,
        remaining: (totalTokens || 8) - (usedTokens || 0)
      },
      votingInfo: {
        yourPoints: tokenData.voting_points,
        totalPossiblePoints: 1100,
        approvalThreshold: 700,
        thresholdPercentage: 63.6
      }
    })

  } catch (error) {
    console.error('[Voting] Token lookup error:', error)
    return NextResponse.json(
      { 
        valid: false,
        error: error instanceof Error ? error.message : 'Failed to validate token' 
      },
      { status: 500 }
    )
  }
}