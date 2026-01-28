// =====================================================
// DESTINATION: src/app/api/innovation/voting/submit/route.ts
// =====================================================
// Submit a vote using an anonymous voting token

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { 
      token, 
      vote, 
      feedback,
      concerns,
      suggestions,
      confidence
    } = await request.json()

    // Validate required fields
    if (!token) {
      return NextResponse.json({ error: 'Voting token is required' }, { status: 400 })
    }

    if (!vote || !['approve', 'reject', 'abstain'].includes(vote)) {
      return NextResponse.json({ 
        error: 'Invalid vote. Must be "approve", "reject", or "abstain"' 
      }, { status: 400 })
    }

    // Get the voting token with related data
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
      console.error('Token lookup error:', tokenError)
      return NextResponse.json({ error: 'Invalid voting token' }, { status: 403 })
    }

    // Check if token already used
    if (tokenData.is_used) {
      return NextResponse.json({ 
        error: 'You have already voted in this session',
        votedAt: tokenData.used_at
      }, { status: 403 })
    }

    // Get session info
    const { data: session, error: sessionError } = await supabase
      .from('voting_sessions')
      .select('id, status, deadline, idea_id')
      .eq('id', tokenData.session_id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Voting session not found' }, { status: 404 })
    }

    // Check session status
    if (session.status !== 'active') {
      return NextResponse.json({ 
        error: 'This voting session is no longer active',
        sessionStatus: session.status
      }, { status: 403 })
    }

    // Check deadline
    if (session.deadline && new Date(session.deadline) < new Date()) {
      return NextResponse.json({ 
        error: 'The voting deadline has passed',
        deadline: session.deadline
      }, { status: 403 })
    }

    // Calculate points awarded
    let pointsAwarded = 0
    if (vote === 'approve') {
      pointsAwarded = tokenData.voting_points
    }
    // reject and abstain get 0 points

    // Insert the vote
    const { data: voteData, error: voteError } = await supabase
      .from('founder_votes')
      .insert({
        session_id: tokenData.session_id,
        token_id: tokenData.id,
        vote: vote,
        points_awarded: pointsAwarded,
        feedback: feedback || null,
        concerns: concerns || null,
        suggestions: suggestions || null,
        confidence_level: confidence || 3
      })
      .select()
      .single()

    if (voteError) {
      console.error('Failed to insert vote:', voteError)
      
      // Check for duplicate vote
      if (voteError.code === '23505') {
        return NextResponse.json({ 
          error: 'You have already voted in this session' 
        }, { status: 403 })
      }
      
      return NextResponse.json({ error: 'Failed to submit vote' }, { status: 500 })
    }

    // Mark token as used
    await supabase
      .from('voting_tokens')
      .update({ 
        is_used: true, 
        used_at: new Date().toISOString() 
      })
      .eq('id', tokenData.id)

    // Update session totals
    const { data: currentSession } = await supabase
      .from('voting_sessions')
      .select('total_votes, total_points')
      .eq('id', tokenData.session_id)
      .single()

    await supabase
      .from('voting_sessions')
      .update({
        total_votes: (currentSession?.total_votes || 0) + 1,
        total_points: (currentSession?.total_points || 0) + pointsAwarded,
        updated_at: new Date().toISOString()
      })
      .eq('id', tokenData.session_id)

    // Check if all votes are in
    const { count: totalTokens } = await supabase
      .from('voting_tokens')
      .select('id', { count: 'exact', head: true })
      .eq('session_id', tokenData.session_id)

    const { count: usedTokens } = await supabase
      .from('voting_tokens')
      .select('id', { count: 'exact', head: true })
      .eq('session_id', tokenData.session_id)
      .eq('is_used', true)

    const allVotesIn = usedTokens === totalTokens

    // Auto-tally if all votes are in
    if (allVotesIn) {
      console.log(`[Voting] All ${totalTokens} votes received. Auto-tallying...`)
      await tallyVotes(tokenData.session_id)
    }

    console.log(`[Voting] Vote submitted: ${vote} (+${pointsAwarded} pts) - ${usedTokens}/${totalTokens} complete`)

    return NextResponse.json({
      success: true,
      message: 'Your vote has been recorded. Thank you!',
      vote: {
        id: voteData.id,
        vote: vote,
        pointsAwarded: pointsAwarded
      },
      progress: {
        votesSubmitted: usedTokens || 0,
        totalVoters: totalTokens || 8,
        allVotesIn: allVotesIn,
        percentComplete: Math.round(((usedTokens || 0) / (totalTokens || 8)) * 100)
      }
    })

  } catch (error) {
    console.error('[Voting] Submit vote error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit vote' },
      { status: 500 }
    )
  }
}

// Helper function to tally votes
async function tallyVotes(sessionId: string) {
  try {
    // Get all votes for this session
    const { data: votes, error: votesError } = await supabase
      .from('founder_votes')
      .select('vote, points_awarded')
      .eq('session_id', sessionId)

    if (votesError) {
      console.error('Error fetching votes for tally:', votesError)
      return
    }

    // Calculate totals
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

    // Get idea_id from session
    const { data: session } = await supabase
      .from('voting_sessions')
      .select('idea_id')
      .eq('id', sessionId)
      .single()

    // Update session with final results
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

    // Update idea based on decision
    if (session?.idea_id) {
      let ideaStatus: string
      let nextStage = 7

      if (decision === 'approved') {
        ideaStatus = 'approved'
        nextStage = 8 // Advance to PRD Generation
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
    }

    console.log(`[Voting] Session tallied: ${totalPoints}/1100 pts = ${decision}`)

  } catch (error) {
    console.error('[Voting] Tally error:', error)
  }
}