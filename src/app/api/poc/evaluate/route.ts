import { createAdminClient } from '@/lib/supabase/server-admin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { submissionId } = await request.json()

    if (!submissionId) {
      return NextResponse.json(
        { error: 'Submission ID required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Get POC submission with linked idea
    const { data: submission, error: submissionError } = await supabase
      .from('poc_submissions')
      .select('*, ideas(*)')
      .eq('id', submissionId)
      .single()

    if (submissionError || !submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      )
    }

    if (!submission.idea_id) {
      return NextResponse.json(
        { error: 'No linked idea found' },
        { status: 400 }
      )
    }

    // Update submission status to under_review
    await supabase
      .from('poc_submissions')
      .update({ status: 'under_review' })
      .eq('id', submissionId)

    // Update idea to Stage 2 (Problem Validation)
    await supabase
      .from('ideas')
      .update({ 
        current_stage: 2,
        status: 'active',
        stage_entered_at: new Date().toISOString()
      })
      .eq('id', submission.idea_id)

    // TODO: Trigger actual AI evaluations via n8n webhook or direct API calls
    // For now, we'll mark the stages as "pending" in i2e_evaluation_stages table
    const stagesToCreate = [
      { stage_number: 2, stage_name: 'Problem Validation', model_used: 'claude-sonnet-4' },
      { stage_number: 3, stage_name: 'Market Sizing', model_used: 'perplexity-pro' },
      { stage_number: 4, stage_name: 'Impact Assessment', model_used: 'claude-opus-4' },
      { stage_number: 5, stage_name: 'Feasibility Analysis', model_used: 'claude-sonnet-4' },
      { stage_number: 6, stage_name: 'Pitch Deck Creation', model_used: 'claude-sonnet-4' },
    ]

    for (const stage of stagesToCreate) {
      await supabase
        .from('i2e_evaluation_stages')
        .insert({
          submission_id: submissionId,
          stage_number: stage.stage_number,
          stage_name: stage.stage_name,
          status: 'pending',
          model_used: stage.model_used,
        })
    }

    return NextResponse.json({
      success: true,
      message: 'Evaluation pipeline triggered',
      idea_id: submission.idea_id,
      stages_created: stagesToCreate.length,
    })

  } catch (error) {
    console.error('Evaluation trigger error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}