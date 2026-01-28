// =====================================================
// DESTINATION: src/app/api/innovation/voting/create-session/route.ts
// =====================================================
// Creates a new voting session for an idea at Stage 7

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Generate secure random token
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function POST(request: NextRequest) {
  try {
    const { ideaId, deadline } = await request.json()

    if (!ideaId) {
      return NextResponse.json({ error: 'Idea ID is required' }, { status: 400 })
    }

    // Get idea details
    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .select('id, title, current_stage, status')
      .eq('id', ideaId)
      .single()

    if (ideaError || !idea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 })
    }

    // Check if pitch deck is complete (Stage 6)
    if (idea.current_stage < 6) {
      return NextResponse.json({ 
        error: 'Idea must complete Pitch Deck (Stage 6) before voting can begin' 
      }, { status: 400 })
    }

    // Check for existing active session
    const { data: existingSession } = await supabase
      .from('voting_sessions')
      .select('id, status')
      .eq('idea_id', ideaId)
      .in('status', ['pending', 'active'])
      .single()

    if (existingSession) {
      return NextResponse.json({ 
        error: 'An active voting session already exists for this idea',
        existingSessionId: existingSession.id
      }, { status: 409 })
    }

    // Get session number
    const { data: prevSessions } = await supabase
      .from('voting_sessions')
      .select('session_number')
      .eq('idea_id', ideaId)
      .order('session_number', { ascending: false })
      .limit(1)

    const sessionNumber = (prevSessions?.[0]?.session_number || 0) + 1

    // Get all active team members with their voting points
    const { data: teamMembers, error: teamError } = await supabase
      .from('team_members')
      .select('id, name, email, role, total_voting_points')
      .eq('is_active', true)

    if (teamError || !teamMembers || teamMembers.length === 0) {
      return NextResponse.json({ error: 'No active team members found' }, { status: 500 })
    }

    console.log(`[Voting] Creating session for "${idea.title}" with ${teamMembers.length} voters`)

    // Calculate default deadline (7 days from now)
    const votingDeadline = deadline 
      ? new Date(deadline) 
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    // Create voting session
    const { data: session, error: sessionError } = await supabase
      .from('voting_sessions')
      .insert({
        idea_id: ideaId,
        session_number: sessionNumber,
        title: `Voting Round ${sessionNumber}: ${idea.title}`,
        description: `Founder voting session for "${idea.title}"`,
        status: 'active',
        start_time: new Date().toISOString(),
        deadline: votingDeadline.toISOString(),
        total_votes: 0,
        total_points: 0,
        max_possible_points: 1100,
        approval_threshold: 700
      })
      .select()
      .single()

    if (sessionError) {
      console.error('Failed to create voting session:', sessionError)
      return NextResponse.json({ error: 'Failed to create voting session' }, { status: 500 })
    }

    // Create voting tokens for each team member
    const tokensToCreate = teamMembers.map(member => ({
      session_id: session.id,
      team_member_id: member.id,
      token: generateToken(),
      voting_points: member.total_voting_points || 100,
      is_used: false,
      email_sent: false
    }))

    const { data: tokens, error: tokensError } = await supabase
      .from('voting_tokens')
      .insert(tokensToCreate)
      .select()

    if (tokensError) {
      console.error('Failed to create voting tokens:', tokensError)
      // Rollback session
      await supabase.from('voting_sessions').delete().eq('id', session.id)
      return NextResponse.json({ error: 'Failed to create voting tokens' }, { status: 500 })
    }

    // Update idea status
    await supabase
      .from('ideas')
      .update({ 
        status: 'voting',
        current_stage: 7,
        stage_entered_at: new Date().toISOString()
      })
      .eq('id', ideaId)

    // Prepare voter information with voting URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aizyantra.com'
    const voters = tokens?.map(token => {
      const member = teamMembers.find(m => m.id === token.team_member_id)
      return {
        name: member?.name || 'Unknown',
        email: member?.email || '',
        role: member?.role || '',
        votingPoints: token.voting_points,
        votingUrl: `${baseUrl}/vote/${token.token}`,
        token: token.token
      }
    })

    // Calculate total possible points
    const totalPossiblePoints = voters?.reduce((sum, v) => sum + v.votingPoints, 0) || 1100

    console.log(`[Voting] Session ${session.id} created with ${tokens?.length} tokens`)

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        ideaId: session.idea_id,
        title: session.title,
        sessionNumber: session.session_number,
        status: session.status,
        startTime: session.start_time,
        deadline: session.deadline
      },
      voters: voters,
      stats: {
        totalVoters: teamMembers.length,
        totalPossiblePoints: totalPossiblePoints,
        approvalThreshold: 700,
        thresholdPercentage: 63.6
      }
    })

  } catch (error) {
    console.error('[Voting] Create session error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create voting session' },
      { status: 500 }
    )
  }
}