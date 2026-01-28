import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const ideaId = searchParams.get('ideaId')
  
  if (!ideaId) {
    return NextResponse.json({ error: 'ideaId is required' }, { status: 400 })
  }
  
  try {
    const supabase = await createClient()
    
    // Fetch all evaluations for this idea
    const { data: evaluations, error } = await supabase
      .from('ai_evaluations')
      .select('*')
      .eq('idea_id', ideaId)
      .order('stage_number', { ascending: true })
    
    if (error) {
      console.error('[get-evaluations] Error fetching evaluations:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        evaluations: {},
        count: 0
      })
    }
    
    console.log(`[get-evaluations] Found ${evaluations?.length || 0} evaluations for idea ${ideaId}`)
    
    // Process and return evaluations by stage
    const result: Record<number, any> = {}
    
    for (const evalRecord of (evaluations || [])) {
      const stageNum = evalRecord.stage_number
      const resultData = evalRecord.result_data || {}
      
      console.log(`[get-evaluations] Processing stage ${stageNum}:`, {
        id: evalRecord.id,
        pass_fail: evalRecord.pass_fail,
        has_result_data: !!evalRecord.result_data
      })
      
      result[stageNum] = {
        id: evalRecord.id,
        idea_id: evalRecord.idea_id,
        stage_number: stageNum,
        evaluation_type: evalRecord.evaluation_type,
        pass_fail: evalRecord.pass_fail,
        confidence_score: evalRecord.confidence_score,
        result_data: resultData,
        strengths: evalRecord.strengths || resultData.strengths || [],
        concerns: evalRecord.concerns || resultData.concerns || [],
        recommendations: evalRecord.recommendations || resultData.recommendations || [],
        pivot_suggestions: evalRecord.pivot_suggestions || resultData.pivot_suggestions || [],
        model_used: evalRecord.model_used,
        tokens_used: evalRecord.tokens_used,
        cost_usd: evalRecord.cost_usd,
        duration_seconds: evalRecord.duration_seconds,
        created_at: evalRecord.created_at,
        created_by: evalRecord.created_by
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      evaluations: result,
      count: evaluations?.length || 0
    })
    
  } catch (error) {
    console.error('[get-evaluations] Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      evaluations: {},
      count: 0
    }, { status: 500 })
  }
}