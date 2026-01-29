import { createAdminClient } from '@/lib/supabase/server-admin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      // Contact Info
      founderName,
      founderEmail,
      founderPhone,
      companyName,
      companyWebsite,
      
      // Idea Details
      ideaTitle,
      ideaDescription,
      problemStatement,
      targetMarket,
      competitors,
      uniqueValueProposition,
      businessModel,
      
      // Technical Details
      techStack,
      teamSize,
      currentStage,
      fundingRaised,
      
      // UTM
      utmSource,
      utmMedium,
      utmCampaign,
      referrerUrl,
    } = body

    // Validate required fields
    if (!founderName || !founderEmail || !ideaTitle || !ideaDescription) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Step 1: Check if email already exists in contacts
    const { data: existingContact } = await supabase
      .from('contacts')
      .select('id, organization_id')
      .eq('email', founderEmail)
      .single()

    let contactId = existingContact?.id
    let organizationId = existingContact?.organization_id

    // Step 2: Create organization if needed
    if (!organizationId && companyName) {
      const { data: newOrg, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: companyName,
          type: 'startup',
          website: companyWebsite,
          industry: 'Technology', // Can be dynamic later
        })
        .select()
        .single()

      if (orgError) {
        console.error('Error creating organization:', orgError)
      } else {
        organizationId = newOrg.id
      }
    }

// Step 3: Create contact if new
if (!contactId) {
  const { data: newContact, error: contactError } = await supabase
    .from('contacts')
    .insert({
      name: founderName,
      email: founderEmail,
      phone: founderPhone,
      organization_id: organizationId,
      role: 'Founder',
      is_primary: true,
      is_decision_maker: true,
      tags: ['poc_program', 'founder'],
    })
    .select()
    .single()

      if (contactError) {
        console.error('Error creating contact:', contactError)
        return NextResponse.json(
          { error: 'Failed to create contact' },
          { status: 500 }
        )
      }

      contactId = newContact.id
    }

    // Step 4: Create lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        contact_id: contactId,
        source: 'poc_program',
        status: 'new',
        interest_level: 'high',
        lead_type: 'poc_submission',
        notes: `POC Submission: ${ideaTitle}`,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
      })
      .select()
      .single()

    if (leadError) {
      console.error('Error creating lead:', leadError)
    }

    // Step 5: Create POC submission
    const { data: submission, error: submissionError } = await supabase
      .from('poc_submissions')
      .insert({
        founder_name: founderName,
        founder_email: founderEmail,
        founder_phone: founderPhone,
        company_name: companyName,
        company_website: companyWebsite,
        
        idea_title: ideaTitle,
        idea_description: ideaDescription,
        problem_statement: problemStatement,
        target_market: targetMarket,
        competitors: competitors,
        unique_value_proposition: uniqueValueProposition,
        business_model: businessModel,
        
        tech_stack: techStack,
        team_size: teamSize,
        current_stage: currentStage,
        funding_raised: fundingRaised,
        
        contact_id: contactId,
        organization_id: organizationId,
        lead_id: lead?.id,
        
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        referrer_url: referrerUrl,
        
        status: 'submitted',
      })
      .select()
      .single()

    if (submissionError) {
      console.error('Error creating submission:', submissionError)
      return NextResponse.json(
        { error: 'Failed to create submission', details: submissionError.message },
        { status: 500 }
      )
    }

    // Step 6: Log analytics event
    await supabase
      .from('analytics_events')
      .insert({
        event_type: 'poc_submission',
        user_id: contactId,
        event_data: {
          submission_id: submission.id,
          submission_code: submission.submission_code,
          idea_title: ideaTitle,
        },
        source: 'website',
      })

    return NextResponse.json({
      success: true,
      submissionCode: submission.submission_code,
      submissionId: submission.id,
      message: 'POC submission received successfully!',
    })

  } catch (error) {
    console.error('POC submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}