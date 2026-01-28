// src/app/api/innovation/impact-assessment/route.ts
// Stage 4: Impact Assessment - Uses Claude Opus 4 for deep reasoning about impact

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

// Claude Opus 4 - Best for deep reasoning and nuanced analysis
const MODEL = 'claude-opus-4-20250514'

interface ImpactDimension {
  score: number
  assessment: string
  evidence: string[]
}

interface ImpactAssessmentResult {
  dimensions: {
    lives_impacted: ImpactDimension
    problem_severity: ImpactDimension
    exponential_potential: ImpactDimension
    underserved_reach: ImpactDimension
    strategic_alignment: ImpactDimension
    sustainability: ImpactDimension
  }
  composite_score: number
  spike_dimensions: string[]
  key_insight: string
  summary: string
  red_flags: string[]
  opportunities: string[]
  gate_passed: boolean
  recommendation: 'advance' | 'iterate' | 'pivot' | 'decline'
}

export async function POST(request: NextRequest) {
  try {
    const { ideaId } = await request.json()

    if (!ideaId) {
      return NextResponse.json({ error: 'Idea ID is required' }, { status: 400 })
    }

    // Fetch the idea with previous evaluations
    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .select('*')
      .eq('id', ideaId)
      .single()

    if (ideaError || !idea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 })
    }

    // Fetch previous evaluations for context
    const { data: previousEvals } = await supabase
      .from('ai_evaluations')
      .select('*')
      .eq('idea_id', ideaId)
      .in('stage_number', [2, 3])
      .order('stage_number')

    const stage2Eval = previousEvals?.find(e => e.stage_number === 2)
    const stage3Eval = previousEvals?.find(e => e.stage_number === 3)

    console.log(`[Stage 4] Impact assessment for: ${idea.title} with ${MODEL}`)

    // Build the impact assessment prompt
    const prompt = `You are a strategic impact analyst for AIzYantra, an AI consulting company with a mission to create meaningful positive change through technology.

## CONTEXT

AIzYantra's core values:
- Building AI solutions that genuinely improve lives
- Focusing on underserved markets and populations
- Creating sustainable, lasting impact (not just short-term gains)
- Leveraging AI Fellowship team expertise (healthcare, enterprise, automation)

## IDEA BEING EVALUATED

**Title:** ${idea.title}

**Problem Statement:**
${idea.problem_statement}

**Target Users:**
${idea.target_users}

**Proposed Solution:**
${idea.proposed_solution || 'AI-powered solution'}

**Industry:** ${idea.industry_category || 'Technology'}

## PREVIOUS EVALUATION DATA

**Stage 2 - AI Evaluation:**
${stage2Eval ? `Score: ${stage2Eval.confidence_score}/500
Summary: ${stage2Eval.result_data?.summary || 'N/A'}` : 'Not available'}

**Stage 3 - Market Sizing:**
${stage3Eval ? `TAM: $${stage3Eval.result_data?.tam?.value || 0}M
Trend: ${stage3Eval.result_data?.trend_direction || 'N/A'}
Summary: ${stage3Eval.result_data?.summary || 'N/A'}` : 'Not available'}

## IMPACT ASSESSMENT FRAMEWORK

Evaluate this idea across 6 dimensions. Score each 1-10 with detailed reasoning.

### DIMENSION WEIGHTS:
1. **Lives Directly Impacted (25%):** How many people will this materially improve the lives of?
   - Consider: direct users, indirect beneficiaries (families, communities)
   - Quality > Quantity: 1000 lives dramatically improved > 1M lives slightly improved

2. **Problem Severity (20%):** How painful/urgent is this problem?
   - Scale: 10 = life-threatening/critical, 5 = significant inconvenience, 1 = minor annoyance
   - Consider: financial cost, time cost, emotional toll, health implications

3. **Exponential Potential (20%):** Could this scale exponentially?
   - Network effects (each user adds value for others)
   - Platform potential (others can build on top)
   - Viral coefficient (users naturally bring more users)
   - Zero marginal cost at scale

4. **Underserved Population Reach (15%):** Does this help the underserved?
   - People currently lacking access to solutions
   - Those priced out of existing alternatives
   - Geographically or demographically excluded populations

5. **Strategic Alignment (10%):** How well does this fit AIzYantra?
   - Team capabilities (AI/ML, healthcare, automation expertise)
   - Existing assets (MediBridge24x7, Tripti Voice AI)
   - Long-term vision alignment

6. **Sustainability of Impact (10%):** Will the impact last?
   - Does impact persist over time?
   - Does it grow/compound?
   - Can it survive competition?

## SPIKE DETECTION
Identify any dimensions where this idea scores exceptionally high (8+). These "spikes" can compensate for weaknesses in other areas.

## RESPONSE FORMAT
Respond ONLY with valid JSON:
{
  "dimensions": {
    "lives_impacted": {
      "score": <1-10>,
      "assessment": "<2-3 sentence analysis>",
      "evidence": ["<supporting point 1>", "<supporting point 2>"]
    },
    "problem_severity": {
      "score": <1-10>,
      "assessment": "<2-3 sentence analysis>",
      "evidence": ["<supporting point 1>", "<supporting point 2>"]
    },
    "exponential_potential": {
      "score": <1-10>,
      "assessment": "<2-3 sentence analysis>",
      "evidence": ["<supporting point 1>", "<supporting point 2>"]
    },
    "underserved_reach": {
      "score": <1-10>,
      "assessment": "<2-3 sentence analysis>",
      "evidence": ["<supporting point 1>", "<supporting point 2>"]
    },
    "strategic_alignment": {
      "score": <1-10>,
      "assessment": "<2-3 sentence analysis>",
      "evidence": ["<supporting point 1>", "<supporting point 2>"]
    },
    "sustainability": {
      "score": <1-10>,
      "assessment": "<2-3 sentence analysis>",
      "evidence": ["<supporting point 1>", "<supporting point 2>"]
    }
  },
  "composite_score": <weighted average, 1-10 scale>,
  "spike_dimensions": ["<dimension names with score 8+>"],
  "key_insight": "<single most important insight about this idea's impact potential>",
  "summary": "<2-3 sentence overall impact assessment>",
  "red_flags": ["<any concerns about negative impact or ethical issues>"],
  "opportunities": ["<unique impact opportunities identified>"],
  "gate_passed": <true if composite_score >= 6.5>,
  "recommendation": "<advance|iterate|pivot|decline>"
}`

    // Call Claude Opus 4 for deep reasoning
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 3000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    // Extract text response
    const textContent = response.content.find(block => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude')
    }

    // Parse the JSON response
    let impactData: ImpactAssessmentResult
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
      impactData = JSON.parse(jsonStr.trim())
    } catch (parseError) {
      console.error('Failed to parse Claude response:', textContent.text)
      throw new Error('Failed to parse impact assessment response')
    }

    // Calculate weighted composite score
    const weights = {
      lives_impacted: 0.25,
      problem_severity: 0.20,
      exponential_potential: 0.20,
      underserved_reach: 0.15,
      strategic_alignment: 0.10,
      sustainability: 0.10
    }

    const calculatedScore = 
      (impactData.dimensions.lives_impacted.score * weights.lives_impacted) +
      (impactData.dimensions.problem_severity.score * weights.problem_severity) +
      (impactData.dimensions.exponential_potential.score * weights.exponential_potential) +
      (impactData.dimensions.underserved_reach.score * weights.underserved_reach) +
      (impactData.dimensions.strategic_alignment.score * weights.strategic_alignment) +
      (impactData.dimensions.sustainability.score * weights.sustainability)

    impactData.composite_score = Math.round(calculatedScore * 10) / 10

    // Detect spikes (scores 8+)
    impactData.spike_dimensions = Object.entries(impactData.dimensions)
      .filter(([_, dim]) => dim.score >= 8)
      .map(([name, _]) => name)

    // Gate criteria: composite >= 6.5 OR has 2+ spike dimensions
    impactData.gate_passed = impactData.composite_score >= 6.5 || impactData.spike_dimensions.length >= 2

    if (impactData.gate_passed) {
      impactData.recommendation = 'advance'
    } else if (impactData.composite_score >= 5.5) {
      impactData.recommendation = 'iterate'
    } else if (impactData.spike_dimensions.length >= 1) {
      impactData.recommendation = 'pivot'
    } else {
      impactData.recommendation = 'decline'
    }

    // Save to database
    const { data: savedAssessment, error: saveError } = await supabase
      .from('ai_evaluations')
      .insert({
        idea_id: ideaId,
        stage_number: 4,
        evaluation_type: 'impact_assessment',
        model_used: MODEL,
        confidence_score: impactData.composite_score * 10, // Scale to 100
        pass_fail: impactData.gate_passed ? 'pass' : 'fail',
        strengths: impactData.opportunities,
        concerns: impactData.red_flags,
        recommendations: [],
        pivot_suggestions: [],
        result_data: {
          dimensions: impactData.dimensions,
          composite_score: impactData.composite_score,
          spike_dimensions: impactData.spike_dimensions,
          key_insight: impactData.key_insight,
          summary: impactData.summary,
          red_flags: impactData.red_flags,
          opportunities: impactData.opportunities,
          recommendation: impactData.recommendation
        },
        raw_response: textContent.text
      })
      .select()
      .single()

    if (saveError) {
      console.error('Failed to save impact assessment:', saveError)
    }

    // Update idea stage if passed
    if (impactData.gate_passed) {
      await supabase
        .from('ideas')
        .update({ 
          current_stage: 5,
          stage_entered_at: new Date().toISOString()
        })
        .eq('id', ideaId)
    }

    console.log(`[Stage 4] Impact assessment complete: ${impactData.composite_score}/10 - ${impactData.recommendation}`)
    console.log(`[Stage 4] Spike dimensions: ${impactData.spike_dimensions.join(', ') || 'None'}`)

    return NextResponse.json({
      success: true,
      assessment: {
        id: savedAssessment?.id || 'temp',
        ...impactData,
        created_at: new Date().toISOString()
      },
      model_used: MODEL
    })

  } catch (error) {
    console.error('[Stage 4] Impact assessment error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Impact assessment failed' },
      { status: 500 }
    )
  }
}