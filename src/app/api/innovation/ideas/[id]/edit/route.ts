import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Create Supabase client with service role for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// PUT /api/innovation/ideas/[id]/edit
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ideaId } = await params
    const body = await request.json()
    
    const {
      title,
      problem_statement,
      proposed_solution,
      target_users,
      why_now,
      industry_category
    } = body

    if (!ideaId) {
      return NextResponse.json(
        { error: 'Idea ID is required' },
        { status: 400 }
      )
    }

    // ALWAYS try to delete existing evaluation when editing
    // This ensures the user can re-evaluate after making changes
    console.log('Checking and deleting existing evaluation for idea:', ideaId)
    
    const { data: deletedEvals, error: deleteError } = await supabase
      .from('ai_evaluations')
      .delete()
      .eq('idea_id', ideaId)
      .eq('stage_number', 2)
      .select()

    if (deleteError) {
      console.error('Error deleting evaluation:', deleteError)
      // Continue anyway - evaluation might not exist
    } else {
      console.log('Deleted evaluations:', deletedEvals?.length || 0)
    }

    const hasExistingEvaluation = deletedEvals && deletedEvals.length > 0

    // Update the idea
    const updateData: any = {
      title,
      problem_statement,
      target_users,
      updated_at: new Date().toISOString()
    }

    // Add optional fields if provided
    if (proposed_solution !== undefined) {
      updateData.proposed_solution = proposed_solution || null
    }
    if (why_now !== undefined) {
      updateData.why_now = why_now || null
    }
    if (industry_category !== undefined) {
      updateData.industry_category = industry_category || null
    }

    // Reset to stage 1 if there was an evaluation (for re-evaluation)
    if (hasExistingEvaluation) {
      updateData.current_stage = 1
      updateData.stage_entered_at = new Date().toISOString()
      console.log('Resetting idea to Stage 1 for re-evaluation')
    }

    console.log('Updating idea with:', updateData)

    const { data: updatedIdea, error: updateError } = await supabase
      .from('ideas')
      .update(updateData)
      .eq('id', ideaId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating idea:', updateError)
      return NextResponse.json(
        { error: 'Failed to update idea', details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      idea: updatedIdea,
      evaluationReset: hasExistingEvaluation
    })

  } catch (error) {
    console.error('Edit idea error:', error)
    return NextResponse.json(
      { error: 'Failed to edit idea', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}