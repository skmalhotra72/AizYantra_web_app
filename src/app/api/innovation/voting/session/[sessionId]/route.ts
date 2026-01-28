// =====================================================
// DESTINATION: src/app/api/innovation/voting/session/[sessionId]/route.ts
// =====================================================
// Get voting session status, progress, and results

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    // Get voting session with idea details
    const { data: session, error: sessionError } = await supabase
      .from('voting_sessions')
      .select(`
        *,
        ideas (
          id,
          title,
          problem_statement,
          submitter_name,
          current_stage,
          status
        )
      `)
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Voting session not found' }, { status: 404 })
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
      .eq('session_id', sessionId)

    const totalVoters = tokens?.length || 0
    const votesSubmitted = tokens?.filter(t => t.is_used).length || 0
    const totalPossiblePoints = tokens?.reduce((sum, t) => sum + t.voting_points, 0) || 1100

    // Get pending voters (for admins)
    const pendingVoters = tokens?.filter(t => !t.is_used).map(t => ({
      name: (t.team_members as any)?.name || 'Unknown',
      role: (t.team_members as any)?.role || '',
      points: t.voting_points
    })) || []

    // Get vote breakdown (only if session is closed or tallied)
    let voteBreakdown = null
    let anonymousFeedback = null

    if (session.status === 'tallied' || session.status === 'closed') {
      const { data: votes } = await supabase
        .from('founder_votes')
        .select('vote, points_awarded, feedback, concerns, suggestions, confidence_level')
        .eq('session_id', sessionId)

      voteBreakdown = {
        approve: votes?.filter(v => v.vote === 'approve').length || 0,
        reject: votes?.filter(v => v.vote === 'reject').length || 0,
        abstain: votes?.filter(v => v.vote === 'abstain').length || 0,
        totalPoints: votes?.reduce((sum, v) => sum + v.points_awarded, 0) || 0
      }

      // Collect anonymous feedback
      anonymousFeedback = votes?.filter(v => v.feedback || v.concerns?.length || v.suggestions?.length)
        .map(v => ({
          feedback: v.feedback,
          concerns: v.concerns,
          suggestions: v.suggestions,
          confidence: v.confidence_level
        })) || []
    }

    // Calculate progress percentage
    const progressPercent = Math.round((votesSubmitted / totalVoters) * 100)
    const pointsPercent = Math.round(((session.total_points || 0) / totalPossiblePoints) * 100)

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
      idea: session.ideas,
      progress: {
        totalVoters: totalVoters,
        votesSubmitted: votesSubmitted,
        votesRemaining: totalVoters - votesSubmitted,
        progressPercent: progressPercent,
        pendingVoters: session.status === 'active' ? pendingVoters : []
      },
      points: {
        currentPoints: session.total_points || 0,
        maxPossiblePoints: totalPossiblePoints,
        approvalThreshold: session.approval_threshold || 700,
        pointsPercent: pointsPercent,
        isApproved: (session.total_points || 0) >= 700
      },
      results: session.status === 'tallied' ? {
        finalDecision: session.final_decision,
        decisionNotes: session.decision_notes,
        voteBreakdown: voteBreakdown,
        anonymousFeedback: anonymousFeedback
      } : null,
      thresholds: {
        approved: { min: 700, description: 'Approved - Advance to Stage 8' },
        conditional: { min: 600, max: 699, description: 'Conditional - Improvements required' },
        hold: { min: 400, max: 599, description: 'Hold - Not ready yet' },
        declined: { max: 399, description: 'Declined - Not a fit' }
      }
    })

  } catch (error) {
    console.error('[Voting] Get session error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get voting session' },
      { status: 500 }
    )
  }
}

// POST: Manually tally or close a session
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params
    const { action } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    if (action === 'tally' || action === 'close') {
      // Get session
      const { data: session } = await supabase
        .from('voting_sessions')
        .select('id, idea_id, status, total_points')
        .eq('id', sessionId)
        .single()

      if (!session) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 })
      }

      if (session.status === 'tallied') {
        return NextResponse.json({ error: 'Session already tallied' }, { status: 400 })
      }

      // Get votes for final tally
      const { data: votes } = await supabase
        .from('founder_votes')
        .select('vote, points_awarded')
        .eq('session_id', sessionId)

      const totalVotes = votes?.length || 0
      const totalPoints = votes?.reduce((sum, v) => sum + v.points_awarded, 0) || 0
      const approveVotes = votes?.filter(v => v.vote === 'approve').length || 0
      const rejectVotes = votes?.filter(v => v.vote === 'reject').length || 0
      const abstainVotes = votes?.filter(v => v.vote === 'abstain').length || 0

      // Determine decision
      let decision: string
      if (totalPoints >= 700) {
        decision = 'approved'
      } else if (totalPoints >= 600) {
        decision = 'conditional'
      } else if (totalPoints >= 400) {
        decision = 'hold'
      } else {
        decision = 'declined'
      }

      // Update session
      await supabase
        .from('voting_sessions')
        .update({
          status: 'tallied',
          end_time: new Date().toISOString(),
          total_votes: totalVotes,
          total_points: totalPoints,
          final_decision: decision,
          decision_notes: `Approve: ${approveVotes}, Reject: ${rejectVotes}, Abstain: ${abstainVotes}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)

      // Update idea
      let ideaStatus = 'voting'
      let nextStage = 7

      if (decision === 'approved') {
        ideaStatus = 'approved'
        nextStage = 8
      } else if (decision === 'conditional') {
        ideaStatus = 'conditional'
      } else if (decision === 'hold') {
        ideaStatus = 'on_hold'
      } else {
        ideaStatus = 'declined'
      }

      await supabase
        .from('ideas')
        .update({
          status: ideaStatus,
          current_stage: nextStage,
          stage_entered_at: new Date().toISOString()
        })
        .eq('id', session.idea_id)

      return NextResponse.json({
        success: true,
        message: 'Voting session tallied successfully',
        result: {
          totalVotes: totalVotes,
          totalPoints: totalPoints,
          maxPoints: 1100,
          threshold: 700,
          decision: decision,
          voteBreakdown: {
            approve: approveVotes,
            reject: rejectVotes,
            abstain: abstainVotes
          }
        }
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('[Voting] Session action error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process action' },
      { status: 500 }
    )
  }
}