// =====================================================
// DESTINATION: src/app/api/innovation/voting/by-idea/[ideaId]/route.ts
// =====================================================
// Get voting session status for a specific idea

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ideaId: string }> }
) {
  try {
    const { ideaId } = await params

    if (!ideaId) {
      return NextResponse.json({ error: 'Idea ID is required' }, { status: 400 })
    }

    // Get the most recent voting session for this idea
    const { data: session, error: sessionError } = await supabase
      .from('voting_sessions')
      .select('*')
      .eq('idea_id', ideaId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (sessionError || !session) {
      // No session exists yet - that's OK
      return NextResponse.json({ 
        success: true,
        session: null,
        message: 'No voting session exists for this idea'
      })
    }

    // Get voting progress
    const { data: tokens } = await supabase
      .from('voting_tokens')
      .select(`
        id, 
        is_used, 
        voting_points,
        team_members (
          name,
          role,
          total_voting_points
        )
      `)
      .eq('session_id', session.id)

    const totalVoters = tokens?.length || 0
    const votesSubmitted = tokens?.filter(t => t.is_used).length || 0
    const totalPossiblePoints = tokens?.reduce((sum, t) => sum + t.voting_points, 0) || 1100

    // Get pending voters
    const pendingVoters = tokens?.filter(t => !t.is_used).map(t => ({
      name: (t.team_members as any)?.name || 'Unknown',
      role: (t.team_members as any)?.role || '',
      points: t.voting_points
    })) || []

    // Get vote breakdown if session is closed/tallied
    let voteBreakdown = null
    let anonymousFeedback = null

    if (session.status === 'tallied' || session.status === 'closed') {
      const { data: votes } = await supabase
        .from('founder_votes')
        .select('vote, points_awarded, feedback, concerns, suggestions, confidence_level')
        .eq('session_id', session.id)

      voteBreakdown = {
        approve: votes?.filter(v => v.vote === 'approve').length || 0,
        reject: votes?.filter(v => v.vote === 'reject').length || 0,
        abstain: votes?.filter(v => v.vote === 'abstain').length || 0,
        totalPoints: votes?.reduce((sum, v) => sum + v.points_awarded, 0) || 0
      }

      anonymousFeedback = votes?.filter(v => v.feedback || v.concerns?.length || v.suggestions?.length)
        .map(v => ({
          feedback: v.feedback,
          concerns: v.concerns,
          suggestions: v.suggestions,
          confidence: v.confidence_level
        })) || []
    }

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        title: session.title,
        description: session.description,
        sessionNumber: session.session_number,
        status: session.status,
        startTime: session.start_time,
        endTime: session.end_time,
        deadline: session.deadline
      },
      progress: {
        totalVoters: totalVoters,
        votesSubmitted: votesSubmitted,
        votesRemaining: totalVoters - votesSubmitted,
        progressPercent: Math.round((votesSubmitted / totalVoters) * 100),
        pendingVoters: session.status === 'active' ? pendingVoters : []
      },
      points: {
        currentPoints: session.total_points || 0,
        maxPossiblePoints: totalPossiblePoints,
        approvalThreshold: session.approval_threshold || 700,
        pointsPercent: Math.round(((session.total_points || 0) / totalPossiblePoints) * 100),
        isApproved: (session.total_points || 0) >= 700
      },
      results: session.status === 'tallied' ? {
        finalDecision: session.final_decision,
        decisionNotes: session.decision_notes,
        voteBreakdown: voteBreakdown,
        anonymousFeedback: anonymousFeedback
      } : null
    })

  } catch (error) {
    console.error('[Voting] Get by idea error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get voting status' },
      { status: 500 }
    )
  }
}