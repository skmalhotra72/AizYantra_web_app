import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Follow-up question templates based on dimension and answer type
const followUpTemplates: Record<string, Record<string, string[]>> = {
  'Customer Experience': {
    low: [
      "What's the biggest challenge you face in responding to customers quickly?",
      "If you could automate one customer interaction, what would it be?",
      "How do customers typically express frustration with your current response times?"
    ],
    medium: [
      "What tools are you currently using for customer communication?",
      "Which customer segment requires the most attention from your team?",
      "What would 'excellent' customer experience look like for your business?"
    ],
    high: [
      "What's working well in your customer experience that you'd want to enhance with AI?",
      "Are there any repetitive customer queries that still require human intervention?",
      "How do you currently measure customer satisfaction?"
    ]
  },
  'Operational Efficiency': {
    low: [
      "Which manual process takes up the most time for your team each week?",
      "What task do your employees complain about most?",
      "If you had a magic wand, which process would you automate first?"
    ],
    medium: [
      "What software tools does your team use daily that don't talk to each other?",
      "Where do you see the most errors or rework in your operations?",
      "How much time per week is spent on data entry or moving information between systems?"
    ],
    high: [
      "What operational improvements have you made recently that worked well?",
      "Are there any bottlenecks in your current automated processes?",
      "What's preventing you from scaling your operations further?"
    ]
  },
  'Data & Decisions': {
    low: [
      "How do you currently track key business metrics?",
      "What decisions do you wish you had better data for?",
      "How long does it typically take to get answers to business questions?"
    ],
    medium: [
      "What data sources do you have that aren't being fully utilized?",
      "Who in your organization is responsible for data analysis?",
      "What business predictions would be most valuable to you?"
    ],
    high: [
      "What analytics tools are you currently using?",
      "How do you ensure data quality across your organization?",
      "What advanced analytics capabilities would give you a competitive edge?"
    ]
  },
  'Growth & Business Development': {
    low: [
      "How do you currently find new customers or clients?",
      "What's your biggest challenge in growing revenue?",
      "How much time does your team spend on lead generation activities?"
    ],
    medium: [
      "What marketing channels have worked best for you?",
      "How do you currently qualify and prioritize leads?",
      "What would help your sales team close deals faster?"
    ],
    high: [
      "What growth strategies have been most successful for you?",
      "How do you identify upsell or cross-sell opportunities?",
      "What market insights would help you make better strategic decisions?"
    ]
  },
  'Team Productivity': {
    low: [
      "What tasks do your team members spend time on that feel like a waste?",
      "How do you currently manage and assign work across your team?",
      "What communication challenges does your team face?"
    ],
    medium: [
      "What collaboration tools does your team use?",
      "How do you track project progress and deadlines?",
      "What skills gaps exist in your team that technology could help fill?"
    ],
    high: [
      "What productivity improvements have you implemented recently?",
      "How do you measure individual and team performance?",
      "What would help your high performers be even more effective?"
    ]
  }
}

// Determine score level
function getScoreLevel(score: number): 'low' | 'medium' | 'high' {
  if (score < 40) return 'low'
  if (score < 70) return 'medium'
  return 'high'
}

// Get a random follow-up from templates
function getTemplateFollowUp(dimension: string, score: number): string | null {
  const level = getScoreLevel(score)
  const templates = followUpTemplates[dimension]?.[level]
  
  if (!templates || templates.length === 0) return null
  
  const randomIndex = Math.floor(Math.random() * templates.length)
  return templates[randomIndex]
}

// Generate contextual follow-up based on specific answer
function generateContextualFollowUp(
  questionText: string,
  answerText: string,
  dimension: string,
  score: number
): string {
  // For specific answer patterns, generate contextual follow-ups
  const lowerAnswer = answerText.toLowerCase()
  
  // Customer Experience specific
  if (dimension === 'Customer Experience') {
    if (lowerAnswer.includes('wait') || lowerAnswer.includes('voicemail')) {
      return "How many customer inquiries do you estimate go unanswered outside business hours each week?"
    }
    if (lowerAnswer.includes('email only') || lowerAnswer.includes('phone only')) {
      return "Have customers ever requested additional ways to reach you? What channels have they asked for?"
    }
    if (lowerAnswer.includes('manual') || lowerAnswer.includes('spreadsheet')) {
      return "How much time per day does your team spend updating customer information manually?"
    }
  }
  
  // Operational Efficiency specific
  if (dimension === 'Operational Efficiency') {
    if (lowerAnswer.includes('manual') || lowerAnswer.includes('paper')) {
      return "What's the average time spent on this manual process per transaction or task?"
    }
    if (lowerAnswer.includes('no system') || lowerAnswer.includes('basic')) {
      return "What would be the impact on your business if this process was automated?"
    }
  }
  
  // Data & Decisions specific
  if (dimension === 'Data & Decisions') {
    if (lowerAnswer.includes('gut') || lowerAnswer.includes('intuition') || lowerAnswer.includes('experience')) {
      return "Can you recall a recent decision where having better data would have changed the outcome?"
    }
    if (lowerAnswer.includes('spreadsheet') || lowerAnswer.includes('excel')) {
      return "How often do you encounter data inconsistencies or version control issues with spreadsheets?"
    }
  }
  
  // Growth specific
  if (dimension === 'Growth & Business Development') {
    if (lowerAnswer.includes('referral') || lowerAnswer.includes('word of mouth')) {
      return "What would it take to systematically increase your referral rate by 50%?"
    }
    if (lowerAnswer.includes('cold') || lowerAnswer.includes('outbound')) {
      return "What's your current conversion rate from initial contact to qualified opportunity?"
    }
  }
  
  // Fallback to template-based follow-up
  return getTemplateFollowUp(dimension, score) || 
    "What would success look like for your organization in this area over the next 12 months?"
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      assessment_id, 
      question_id, 
      question_text, 
      answer_value, 
      answer_text, 
      dimension, 
      score 
    } = body

    if (!assessment_id || !question_id) {
      return NextResponse.json(
        { error: 'Assessment ID and Question ID are required' },
        { status: 400 }
      )
    }

    // Determine if we should generate a follow-up (not for every question)
    // Follow-up probability based on score - lower scores get more follow-ups
    const followUpProbability = score < 40 ? 0.7 : score < 60 ? 0.5 : 0.3
    const shouldGenerateFollowUp = Math.random() < followUpProbability

    if (!shouldGenerateFollowUp) {
      return NextResponse.json({
        success: true,
        has_followup: false,
        message: 'No follow-up generated for this question'
      })
    }

    // Generate the follow-up question
    const followUpQuestion = generateContextualFollowUp(
      question_text || '',
      answer_text || String(answer_value),
      dimension || 'General',
      score || 50
    )

    // Save follow-up to database (using existing schema columns)
    const supabase = await createClient()
    
    const { data: savedFollowUp, error: saveError } = await supabase
      .from('ai_follow_ups')
      .insert({
        assessment_id,
        // Use existing columns
        triggered_by_question: question_id,
        question_text: followUpQuestion,
        question_type: 'open_text',
        insight_category: dimension,
        answered: false,
        generated_at: new Date().toISOString(),
        // Also populate new columns for compatibility
        parent_question_id: question_id,
        follow_up_question: followUpQuestion,
        dimension: dimension,
        trigger_answer: answer_text || String(answer_value),
        trigger_score: score,
        status: 'pending'
      })
      .select()
      .single()

    if (saveError) {
      console.error('Error saving follow-up:', saveError)
      // Don't fail the whole request, just return without follow-up
      return NextResponse.json({
        success: true,
        has_followup: false,
        message: 'Could not save follow-up question'
      })
    }

    return NextResponse.json({
      success: true,
      has_followup: true,
      followup: {
        id: savedFollowUp.id,
        question: followUpQuestion,
        dimension: dimension,
        type: 'open_text' // Follow-ups are always open text for qualitative insights
      }
    })

  } catch (error: any) {
    console.error('Follow-up generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate follow-up' },
      { status: 500 }
    )
  }
}

// Save follow-up response
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { followup_id, response_text } = body

    if (!followup_id) {
      return NextResponse.json(
        { error: 'Follow-up ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { error: updateError } = await supabase
      .from('ai_follow_ups')
      .update({
        // Use existing columns
        response_text: response_text,
        answered: true,
        answered_at: new Date().toISOString(),
        // Also update new column for compatibility
        status: 'answered',
        updated_at: new Date().toISOString()
      })
      .eq('id', followup_id)

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      message: 'Follow-up response saved'
    })

  } catch (error: any) {
    console.error('Error saving follow-up response:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to save follow-up response' },
      { status: 500 }
    )
  }
}