import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, fullName, phone, companyName, role, companySize, industry, revenue } = body

    // Validate required fields
    if (!email || !fullName || !companyName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Create assessment record
    const assessmentData = {
      user_id: user.id,
      email: email,
      full_name: fullName,
      phone: phone || null,
      company_name: companyName,
      role: role || null,
      company_size: companySize,
      industry: industry,
      annual_revenue: revenue || null,
      status: 'in_progress',
      current_stage: 1,
      started_at: new Date().toISOString(),
    }

    // Insert into assessments table
    const { data: assessment, error: insertError } = await supabase
      .from('ai_assessments')
      .insert(assessmentData)
      .select()
      .single()

    if (insertError) {
      console.error('Assessment insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to create assessment' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      assessmentId: assessment.id,
      message: 'Assessment started successfully'
    })

  } catch (error: any) {
    console.error('Assessment start error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}