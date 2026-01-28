// src/app/api/innovation/pitch-deck/route.ts
// Stage 6: Pitch Deck Generation - Uses Claude Opus 4 for high-quality content

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
})

// Claude Opus 4 - Best for high-quality content generation
const MODEL = 'claude-opus-4-20250514'

interface PitchDeckSlide {
  slide_number: number
  title: string
  subtitle?: string
  content: string[]
  speaker_notes: string
  visual_suggestion: string
}

interface PitchDeckResult {
  slides: PitchDeckSlide[]
  executive_summary: string
  one_line_pitch: string
  elevator_pitch: string
  key_metrics: { label: string; value: string }[]
  call_to_action: string
  appendix_suggestions: string[]
  gate_passed: boolean
  recommendation: 'advance' | 'iterate'
}

export async function POST(request: NextRequest) {
  try {
    const { ideaId } = await request.json()

    if (!ideaId) {
      return NextResponse.json({ error: 'Idea ID is required' }, { status: 400 })
    }

    // Fetch the idea with all previous evaluations
    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .select('*')
      .eq('id', ideaId)
      .single()

    if (ideaError || !idea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 })
    }

    // Fetch all previous evaluations for comprehensive context
    const { data: allEvals } = await supabase
      .from('ai_evaluations')
      .select('*')
      .eq('idea_id', ideaId)
      .order('stage_number')

    const stage2 = allEvals?.find(e => e.stage_number === 2)
    const stage3 = allEvals?.find(e => e.stage_number === 3)
    const stage4 = allEvals?.find(e => e.stage_number === 4)
    const stage5 = allEvals?.find(e => e.stage_number === 5)

    console.log(`[Stage 6] Generating pitch deck for: ${idea.title} with ${MODEL}`)

    // Build comprehensive prompt with all evaluation data
    const prompt = `You are an expert pitch deck creator for AIzYantra, creating a compelling investor/founder pitch deck.

## AIZYANTRA CONTEXT
AIzYantra is an AI consulting company founded by 8 AI Fellowship graduates with Fortune 500 backgrounds. They specialize in healthcare AI and enterprise automation. Their flagship products include MediBridge24x7 (prescription OCR with 90%+ accuracy) and Tripti AI Voice SDR.

## IDEA DETAILS

**Title:** ${idea.title}

**Problem Statement:**
${idea.problem_statement}

**Target Users:**
${idea.target_users}

**Proposed Solution:**
${idea.proposed_solution || 'AI-powered solution'}

**Industry:** ${idea.industry_category || 'Technology'}

## EVALUATION DATA FROM PREVIOUS STAGES

### Stage 2 - AI Evaluation (${stage2?.pass_fail || 'N/A'})
${stage2?.result_data ? `
- Composite Score: ${stage2.result_data.composite_score}/500
- Summary: ${stage2.result_data.summary}
- Strengths: ${stage2.strengths?.join(', ')}
` : 'Not available'}

### Stage 3 - Market Sizing (${stage3?.pass_fail || 'N/A'})
${stage3?.result_data ? `
- TAM: $${stage3.result_data.tam?.value || 0}M
- SAM: $${stage3.result_data.sam?.value || 0}M
- SOM: $${stage3.result_data.som?.value || 0}M
- CAGR: ${stage3.result_data.cagr}%
- Trend: ${stage3.result_data.trend_direction}
- Key Competitors: ${stage3.result_data.competitors?.map((c: any) => c.name).join(', ')}
` : 'Not available'}

### Stage 4 - Impact Assessment (${stage4?.pass_fail || 'N/A'})
${stage4?.result_data ? `
- Impact Score: ${stage4.result_data.composite_score}/10
- Spike Dimensions: ${stage4.result_data.spike_dimensions?.join(', ') || 'None'}
- Key Insight: ${stage4.result_data.key_insight}
` : 'Not available'}

### Stage 5 - Feasibility (${stage5?.pass_fail || 'N/A'})
${stage5?.result_data ? `
- Technical Score: ${stage5.result_data.technical_score}/10
- MVP Timeline: ${stage5.result_data.mvp_timeline?.weeks} weeks
- Total Budget: ${stage5.result_data.resource_requirements?.total_budget}
- Tech Stack: ${Object.values(stage5.result_data.tech_stack || {}).flat().slice(0, 6).join(', ')}
` : 'Not available'}

## PITCH DECK REQUIREMENTS

Create a 10-slide pitch deck following this structure:

1. **Title Slide** - Company name, tagline, one-liner
2. **Problem** - The pain point being solved
3. **Solution** - How we solve it
4. **Market Opportunity** - TAM/SAM/SOM with trend
5. **Product** - Key features and demo highlights
6. **Business Model** - How we make money
7. **Traction/Roadmap** - What we've done, what's next
8. **Team** - Why AIzYantra can execute this
9. **Financials** - Budget, runway, projections
10. **Ask/Call to Action** - What we need, next steps

## RESPONSE FORMAT
Respond ONLY with valid JSON:
{
  "slides": [
    {
      "slide_number": 1,
      "title": "<slide title>",
      "subtitle": "<optional subtitle>",
      "content": ["<bullet point 1>", "<bullet point 2>", "<bullet point 3>"],
      "speaker_notes": "<what to say when presenting this slide>",
      "visual_suggestion": "<suggested visual element: chart, image, icon>"
    }
  ],
  "executive_summary": "<200 word executive summary>",
  "one_line_pitch": "<single sentence that captures the essence>",
  "elevator_pitch": "<60 second pitch, ~150 words>",
  "key_metrics": [
    { "label": "TAM", "value": "$XB" },
    { "label": "MVP Timeline", "value": "X weeks" },
    { "label": "Initial Investment", "value": "₹X Lakhs" }
  ],
  "call_to_action": "<specific ask for the audience>",
  "appendix_suggestions": ["<additional slides that could be useful>"],
  "gate_passed": true,
  "recommendation": "advance"
}

Make the content compelling, data-driven, and professionally written. Use specific numbers from the evaluation data where available.`

    // Call Claude Opus 4 for high-quality content
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 5000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    const textContent = response.content.find(block => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude')
    }

    // Parse the JSON response
    let pitchDeckData: PitchDeckResult
    try {
      let jsonStr = textContent.text.trim()
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.slice(7)
      }
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.slice(3)
      }
      if (jsonStr.endsWith('```')) {
        jsonStr = jsonStr.slice(0, -3)
      }
      pitchDeckData = JSON.parse(jsonStr.trim())
    } catch (parseError) {
      console.error('Failed to parse Claude response:', textContent.text)
      throw new Error('Failed to parse pitch deck response')
    }

    // Validate slides count
    if (!pitchDeckData.slides || pitchDeckData.slides.length < 8) {
      throw new Error('Incomplete pitch deck generated')
    }

    // Stage 6 always passes if we get here (pitch deck is ready for voting)
    pitchDeckData.gate_passed = true
    pitchDeckData.recommendation = 'advance'

    // Save to database
    const { data: savedPitchDeck, error: saveError } = await supabase
      .from('ai_evaluations')
      .insert({
        idea_id: ideaId,
        stage_number: 6,
        evaluation_type: 'pitch_deck',
        model_used: MODEL,
        confidence_score: 100, // Pitch deck generated successfully
        pass_fail: 'pass',
        strengths: pitchDeckData.key_metrics.map(m => `${m.label}: ${m.value}`),
        concerns: [],
        recommendations: pitchDeckData.appendix_suggestions,
        pivot_suggestions: [],
        result_data: {
          slides: pitchDeckData.slides,
          executiveSummary: pitchDeckData.executive_summary,
          oneLinePitch: pitchDeckData.one_line_pitch,
          elevatorPitch: pitchDeckData.elevator_pitch,
          keyMetrics: pitchDeckData.key_metrics,
          callToAction: pitchDeckData.call_to_action,
          appendixSuggestions: pitchDeckData.appendix_suggestions,
          recommendation: pitchDeckData.recommendation
        },
        raw_response: textContent.text
      })
      .select()
      .single()

    if (saveError) {
      console.error('Failed to save pitch deck:', saveError)
    }

    // Update idea stage - ready for voting (Stage 7)
    await supabase
      .from('ideas')
      .update({ 
        current_stage: 7,
        stage_entered_at: new Date().toISOString(),
        status: 'voting' // Ready for founder voting
      })
      .eq('id', ideaId)

    console.log(`[Stage 6] Pitch deck generated: ${pitchDeckData.slides.length} slides`)
    console.log(`[Stage 6] One-liner: ${pitchDeckData.one_line_pitch}`)

    return NextResponse.json({
      success: true,
      pitchDeck: {
        id: savedPitchDeck?.id || 'temp',
        slides: pitchDeckData.slides,
        executiveSummary: pitchDeckData.executive_summary,
        oneLinePitch: pitchDeckData.one_line_pitch,
        elevatorPitch: pitchDeckData.elevator_pitch,
        keyMetrics: pitchDeckData.key_metrics,
        callToAction: pitchDeckData.call_to_action,
        appendixSuggestions: pitchDeckData.appendix_suggestions,
        gate_passed: pitchDeckData.gate_passed,
        recommendation: pitchDeckData.recommendation,
        created_at: new Date().toISOString()
      },
      model_used: MODEL
    })

  } catch (error) {
    console.error('[Stage 6] Pitch deck generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Pitch deck generation failed' },
      { status: 500 }
    )
  }
}