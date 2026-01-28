// src/app/api/innovation/evaluate/route.ts
// Stage 2: AI Evaluation - Uses Claude Sonnet 4 for nuanced problem validation

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

// Claude Sonnet 4 - Best for nuanced analysis and structured evaluation
const MODEL = 'claude-sonnet-4-20250514'

interface EvaluationScores {
  problem_clarity: number
  market_need: number
  target_audience: number
  urgency_timing: number
  differentiation: number
}

interface EvaluationResult {
  scores: EvaluationScores
  composite_score: number
  summary: string
  strengths: string[]
  concerns: string[]
  recommendations: string[]
  pivot_suggestions: string[]
  advance_recommendation: 'advance' | 'iterate' | 'pivot' | 'decline'
  gate_passed: boolean
}

export async function POST(request: NextRequest) {
  try {
    const { ideaId } = await request.json()

    if (!ideaId) {
      return NextResponse.json({ error: 'Idea ID is required' }, { status: 400 })
    }

    // Fetch the idea
    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .select('*')
      .eq('id', ideaId)
      .single()

    if (ideaError || !idea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 })
    }

    console.log(`[Stage 2] Evaluating idea: ${idea.title} with ${MODEL}`)

    // Build the evaluation prompt
    const prompt = `You are an expert startup evaluator for AIzYantra, an AI consulting company. 
Evaluate this idea submission rigorously but fairly.

## IDEA SUBMISSION

**Title:** ${idea.title}

**Problem Statement:**
${idea.problem_statement}

**Target Users:**
${idea.target_users}

**Proposed Solution:**
${idea.proposed_solution || 'Not provided'}

**Industry Category:**
${idea.industry_category || 'Not specified'}

## EVALUATION CRITERIA

Score each criterion from 0-100:

1. **Problem Clarity (0-100):** Is the problem well-defined, specific, and clearly articulated? Does it identify WHO has the problem, WHAT the problem is, and WHY it matters?

2. **Market Need (0-100):** Is this a real pain point that people actively seek solutions for? Is there evidence of demand? Would people pay to solve this?

3. **Target Audience (0-100):** Is the target audience specific and reachable? Can we identify and access these users? Is the segment large enough to matter but focused enough to serve well?

4. **Urgency/Timing (0-100):** Is the timing right for this solution? Are there market trends, regulatory changes, or technological shifts that make NOW the right time?

5. **Differentiation (0-100):** What makes this unique? How is it different from existing solutions? Does it have a defensible advantage?

## PASS THRESHOLD
- **350/500 points** = Pass (advance to Stage 3)
- **280-349 points** = Iterate (improve and resubmit)
- **Below 280 points** = Consider pivoting or declining

## RESPONSE FORMAT
Respond ONLY with valid JSON in this exact format:
{
  "scores": {
    "problem_clarity": <0-100>,
    "market_need": <0-100>,
    "target_audience": <0-100>,
    "urgency_timing": <0-100>,
    "differentiation": <0-100>
  },
  "composite_score": <sum of all scores>,
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "concerns": ["<concern 1>", "<concern 2>"],
  "recommendations": ["<actionable recommendation 1>", "<actionable recommendation 2>"],
  "pivot_suggestions": ["<pivot idea if score is low>"],
  "advance_recommendation": "<advance|iterate|pivot|decline>",
  "gate_passed": <true if composite_score >= 350, false otherwise>
}

Be rigorous but constructive. If declining, provide specific pivot suggestions that could make this idea viable.`

    // Call Claude Sonnet 4
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2000,
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
    let evaluation: EvaluationResult
    try {
      // Clean the response - remove markdown code blocks if present
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
      evaluation = JSON.parse(jsonStr.trim())
    } catch (parseError) {
      console.error('Failed to parse Claude response:', textContent.text)
      throw new Error('Failed to parse evaluation response')
    }

    // Validate and fix composite score
    const calculatedScore = 
      evaluation.scores.problem_clarity +
      evaluation.scores.market_need +
      evaluation.scores.target_audience +
      evaluation.scores.urgency_timing +
      evaluation.scores.differentiation

    evaluation.composite_score = calculatedScore
    evaluation.gate_passed = calculatedScore >= 350

    // Determine recommendation based on score
    if (calculatedScore >= 350) {
      evaluation.advance_recommendation = 'advance'
    } else if (calculatedScore >= 280) {
      evaluation.advance_recommendation = 'iterate'
    } else if (calculatedScore >= 200) {
      evaluation.advance_recommendation = 'pivot'
    } else {
      evaluation.advance_recommendation = 'decline'
    }

    // Save to database
    const { data: savedEval, error: saveError } = await supabase
      .from('ai_evaluations')
      .insert({
        idea_id: ideaId,
        stage_number: 2,
        evaluation_type: 'ai_evaluation',
        model_used: MODEL,
        confidence_score: calculatedScore,
        pass_fail: evaluation.gate_passed ? 'pass' : 'fail',
        strengths: evaluation.strengths,
        concerns: evaluation.concerns,
        recommendations: evaluation.recommendations,
        pivot_suggestions: evaluation.pivot_suggestions,
        result_data: {
          scores: evaluation.scores,
          composite_score: evaluation.composite_score,
          summary: evaluation.summary,
          advance_recommendation: evaluation.advance_recommendation
        },
        raw_response: textContent.text
      })
      .select()
      .single()

    if (saveError) {
      console.error('Failed to save evaluation:', saveError)
      // Continue anyway - return the evaluation
    }

    // Update idea stage if passed
    if (evaluation.gate_passed) {
      await supabase
        .from('ideas')
        .update({ 
          current_stage: 3,
          stage_entered_at: new Date().toISOString()
        })
        .eq('id', ideaId)
    }

    console.log(`[Stage 2] Evaluation complete: ${calculatedScore}/500 - ${evaluation.advance_recommendation}`)

    return NextResponse.json({
      success: true,
      evaluation: {
        id: savedEval?.id || 'temp',
        ...evaluation,
        created_at: new Date().toISOString()
      },
      model_used: MODEL
    })

  } catch (error) {
    console.error('[Stage 2] Evaluation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Evaluation failed' },
      { status: 500 }
    )
  }
}