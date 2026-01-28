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
      industry_category,
      resetForReEvaluation
    } = body

    if (!ideaId) {
      return NextResponse.json(
        { error: 'Idea ID is required' },
        { status: 400 }
      )
    }

    // If resetting for re-evaluation, delete existing evaluation first
    if (resetForReEvaluation) {
      console.log('Deleting existing evaluation for idea:', ideaId)
      
      const { error: deleteError, count } = await supabase
        .from('ai_evaluations')
        .delete()
        .eq('idea_id', ideaId)
        .eq('stage_number', 2)

      if (deleteError) {
        console.error('Error deleting evaluation:', deleteError)
        // Continue anyway - evaluation might not exist
      } else {
        console.log('Deleted evaluations count:', count)
      }
    }

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

    // Reset to stage 1 if re-evaluating
    if (resetForReEvaluation) {
      updateData.current_stage = 1
      updateData.stage_entered_at = new Date().toISOString()
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
      evaluationReset: resetForReEvaluation
    })

  } catch (error) {
    console.error('Edit idea error:', error)
    return NextResponse.json(
      { error: 'Failed to edit idea', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}