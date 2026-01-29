import { createAdminClient } from '@/lib/supabase/server-admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      userId,
      name,
      email,
      phone,
      company,
      intent,
      utmSource,
      utmMedium,
      utmCampaign,
      referrerUrl
    } = body

    console.log('API: Received signup request for:', email)

    if (!userId || !name || !email || !phone) {
      console.error('API: Missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    console.log('API: Creating user profile...')

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        email: email,
        full_name: name,
        phone: phone,
        role: 'client',
        is_active: true,
        preferences: {
          notifications: true,
          email_updates: true
        }
      })
      .select()
      .single()

    if (profileError) {
      console.error('API: Profile creation error:', profileError)
      return NextResponse.json(
        { error: 'Failed to create user profile', details: profileError.message },
        { status: 500 }
      )
    }

    console.log('API: Profile created successfully')

    let organizationId = null
    if (company && company.trim()) {
      console.log('API: Creating organization...')
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: company,
          tags: ['prospect'],
          notes: `Created via portal signup - ${intent || 'general'}`
        })
        .select()
        .single()

      if (!orgError && org) {
        organizationId = org.id
        console.log('API: Organization created:', organizationId)
      }
    }

    console.log('API: Creating contact...')
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .insert({
        user_id: userId,
        organization_id: organizationId,
        name: name,
        email: email,
        phone: phone,
        is_primary: true,
        tags: intent === 'i2e-evaluation' ? ['i2e_prospect', 'self_signup'] : ['portal_client', 'self_signup'],
        notes: `Self-registered via portal signup${intent ? ` - Intent: ${intent}` : ''}`
      })
      .select()
      .single()

    if (contactError) {
      console.error('API: Contact creation error:', contactError)
    } else {
      console.log('API: Contact created successfully')
    }

    console.log('API: Creating lead...')
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        organization_id: organizationId,
        contact_id: contact?.id,
        source: 'website',
        source_detail: intent === 'i2e-evaluation' ? 'i2e_evaluation_signup' : 'portal_signup',
        utm_source: utmSource || null,
        utm_medium: utmMedium || null,
        utm_campaign: utmCampaign || null,
        title: intent === 'i2e-evaluation' 
          ? `I2E Evaluation - ${name}` 
          : `Portal Access - ${name}`,
        description: intent === 'i2e-evaluation'
          ? 'Prospect signed up for free startup idea evaluation'
          : 'Client signed up for portal access',
        status: 'new',
        score: intent === 'i2e-evaluation' ? 60 : 40,
        score_breakdown: {
          source: 20,
          intent: intent === 'i2e-evaluation' ? 30 : 10,
          engagement: 10
        },
        service_interest: intent === 'i2e-evaluation' 
          ? ['poc_program', 'mvp_development', 'idea_validation']
          : ['general_inquiry'],
        expected_value: intent === 'i2e-evaluation' ? 300000 : null,
        probability: intent === 'i2e-evaluation' ? 25 : 10,
        ai_insights: {
          signup_intent: intent || 'general',
          signup_source: 'self_service',
          has_company: !!company,
          initial_engagement: 'high'
        },
        ai_recommended_actions: intent === 'i2e-evaluation'
          ? [
              'Send I2E welcome email with next steps',
              'Assign to I2E team for evaluation prep',
              'Schedule automated follow-up in 3 days if no submission'
            ]
          : [
              'Send welcome email with portal guide',
              'Assign to sales team for qualification call',
              'Add to nurture campaign'
            ]
      })
      .select()
      .single()

    if (leadError) {
      console.error('API: Lead creation error:', leadError)
    } else {
      console.log('API: Lead created successfully')
    }

    const { error: activityError } = await supabase
      .from('analytics_events')
      .insert({
        event_name: 'portal_signup_completed',
        event_category: 'authentication',
        user_id: userId,
        properties: {
          intent: intent || 'general',
          has_company: !!company,
          utm_source: utmSource,
          utm_medium: utmMedium,
          utm_campaign: utmCampaign,
          referrer: referrerUrl
        }
      })

    console.log('API: Signup completed successfully')

    return NextResponse.json({
      success: true,
      data: {
        userId: userId,
        profileId: profile.id,
        contactId: contact?.id,
        leadId: lead?.id,
        organizationId: organizationId,
        intent: intent
      }
    })

  } catch (error) {
    console.error('API: Unexpected error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}