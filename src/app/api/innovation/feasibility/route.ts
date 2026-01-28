// src/app/api/innovation/feasibility/route.ts
// Stage 5: Feasibility Analysis - Uses Apollo.io for competitor research + Claude Sonnet for synthesis

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

// Claude Sonnet 4 for synthesis (Apollo provides data, Claude analyzes)
const CLAUDE_MODEL = 'claude-sonnet-4-20250514'

interface ApolloCompany {
  name: string
  domain: string
  employee_count: number
  industry: string
  technologies: string[]
  funding_total: number
  founded_year: number
}

interface FeasibilityResult {
  dimensions: {
    technical_complexity: { score: number; assessment: string }
    resource_availability: { score: number; assessment: string }
    time_to_market: { score: number; assessment: string }
    competitive_landscape: { score: number; assessment: string }
    team_capability_fit: { score: number; assessment: string }
    funding_viability: { score: number; assessment: string }
    integration_complexity: { score: number; assessment: string }
  }
  technical_score: number
  mvp_timeline: {
    weeks: number
    description: string
    phases: { name: string; weeks: number; deliverables: string[] }[]
  }
  tech_stack: {
    frontend: string[]
    backend: string[]
    ai_ml: string[]
    infrastructure: string[]
    third_party: string[]
  }
  risks: {
    technical: string[]
    market: string[]
    execution: string[]
  }
  resource_requirements: {
    team: { role: string; count: number; skills: string[] }[]
    budget_estimate: { item: string; cost: string }[]
    total_budget: string
  }
  funding_options: string[]
  critical_dependencies: string[]
  summary: string
  gate_passed: boolean
  recommendation: 'advance' | 'iterate' | 'pivot' | 'decline'
}

// Apollo.io API call for competitor research
async function searchApolloCompanies(keywords: string[], industry: string): Promise<ApolloCompany[]> {
  if (!process.env.APOLLO_API_KEY) {
    console.log('[Apollo.io] API key not configured, using AI-generated data')
    return []
  }

  try {
    const response = await fetch('https://api.apollo.io/v1/mixed_companies/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': process.env.APOLLO_API_KEY
      },
      body: JSON.stringify({
        q_keywords: keywords.join(' '),
        per_page: 10,
        page: 1,
        organization_industry_tag_ids: [], // You can add specific industry IDs
        organization_num_employees_ranges: ['1,50', '51,200', '201,500'],
        sort_by_field: 'organization_estimated_num_employees',
        sort_ascending: false
      })
    })

    if (!response.ok) {
      console.error('[Apollo.io] API error:', response.status)
      return []
    }

    const data = await response.json()
    
    return (data.organizations || []).map((org: any) => ({
      name: org.name,
      domain: org.primary_domain,
      employee_count: org.estimated_num_employees || 0,
      industry: org.industry || industry,
      technologies: org.technologies?.map((t: any) => t.name) || [],
      funding_total: org.total_funding || 0,
      founded_year: org.founded_year || 0
    }))
  } catch (error) {
    console.error('[Apollo.io] Error:', error)
    return []
  }
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
      .in('stage_number', [2, 3, 4])
      .order('stage_number')

    console.log(`[Stage 5] Feasibility analysis for: ${idea.title}`)

    // Extract keywords for Apollo search
    const keywords = [
      idea.industry_category,
      ...idea.problem_statement.split(' ').filter((w: string) => w.length > 5).slice(0, 5)
    ].filter(Boolean)

    // Call Apollo.io for competitor tech stack research
    const apolloCompanies = await searchApolloCompanies(keywords, idea.industry_category || 'Technology')
    
    const competitorTechStacks = apolloCompanies.length > 0 
      ? apolloCompanies.map(c => `${c.name}: ${c.technologies.slice(0, 5).join(', ')} (${c.employee_count} employees, $${(c.funding_total/1000000).toFixed(1)}M funding)`)
      : ['No Apollo.io data available - using AI estimates']

    console.log(`[Stage 5] Found ${apolloCompanies.length} competitors via Apollo.io`)

    // Build the feasibility prompt
    const prompt = `You are a technical feasibility analyst for AIzYantra, an AI consulting company.

## AIZYANTRA CAPABILITIES

**Team Strengths:**
- 8 AI Fellowship graduates with Fortune 500 backgrounds
- Healthcare AI expertise (MediBridge24x7 - 90%+ accuracy on prescription OCR)
- Voice AI expertise (Tripti AI Voice SDR in production)
- Full-stack development (Next.js, TypeScript, Supabase, Python)
- AI/ML (OpenAI, Claude, custom models)

**Existing Infrastructure:**
- Vercel for hosting
- Supabase for database/auth
- n8n for automation
- Google Cloud services

## IDEA TO ANALYZE

**Title:** ${idea.title}

**Problem Statement:**
${idea.problem_statement}

**Target Users:**
${idea.target_users}

**Proposed Solution:**
${idea.proposed_solution || 'AI-powered solution'}

**Industry:** ${idea.industry_category || 'Technology'}

## COMPETITOR TECH STACK DATA (from Apollo.io)
${competitorTechStacks.join('\n')}

## PREVIOUS EVALUATIONS

${previousEvals?.map(e => `Stage ${e.stage_number}: ${e.pass_fail === 'pass' ? '✅ Passed' : '⚠️ Needs Work'} - ${e.result_data?.summary || 'N/A'}`).join('\n') || 'No previous data'}

## FEASIBILITY ASSESSMENT

Analyze technical and operational feasibility across 7 dimensions (score 1-10):

1. **Technical Complexity:** How hard is this to build?
2. **Resource Availability:** Can we get the talent/tools needed?
3. **Time to Market:** How long to MVP?
4. **Competitive Landscape:** How crowded is this space?
5. **Team Capability Fit:** Does this match AIzYantra's strengths?
6. **Funding Viability:** Can this be bootstrapped or does it need VC?
7. **Integration Complexity:** How many third-party integrations needed?

Also provide:
- Detailed MVP timeline with phases
- Recommended tech stack
- Risk assessment
- Resource requirements and budget
- Funding options

## RESPONSE FORMAT
Respond ONLY with valid JSON:
{
  "dimensions": {
    "technical_complexity": { "score": <1-10>, "assessment": "<analysis>" },
    "resource_availability": { "score": <1-10>, "assessment": "<analysis>" },
    "time_to_market": { "score": <1-10>, "assessment": "<analysis>" },
    "competitive_landscape": { "score": <1-10>, "assessment": "<analysis>" },
    "team_capability_fit": { "score": <1-10>, "assessment": "<analysis>" },
    "funding_viability": { "score": <1-10>, "assessment": "<analysis>" },
    "integration_complexity": { "score": <1-10>, "assessment": "<analysis>" }
  },
  "technical_score": <weighted average 1-10>,
  "mvp_timeline": {
    "weeks": <total weeks>,
    "description": "<brief timeline summary>",
    "phases": [
      { "name": "Phase 1: Foundation", "weeks": <X>, "deliverables": ["<item>"] },
      { "name": "Phase 2: Core Features", "weeks": <X>, "deliverables": ["<item>"] },
      { "name": "Phase 3: MVP Launch", "weeks": <X>, "deliverables": ["<item>"] }
    ]
  },
  "tech_stack": {
    "frontend": ["Next.js", "TypeScript", "Tailwind CSS"],
    "backend": ["Supabase", "Node.js"],
    "ai_ml": ["OpenAI API", "Claude API"],
    "infrastructure": ["Vercel", "Supabase"],
    "third_party": ["<required integrations>"]
  },
  "risks": {
    "technical": ["<risk 1>", "<risk 2>"],
    "market": ["<risk 1>"],
    "execution": ["<risk 1>"]
  },
  "resource_requirements": {
    "team": [
      { "role": "Full-stack Developer", "count": 2, "skills": ["Next.js", "TypeScript"] }
    ],
    "budget_estimate": [
      { "item": "Development (3 months)", "cost": "₹6-8 Lakhs" },
      { "item": "Infrastructure", "cost": "₹10-15K/month" },
      { "item": "AI API Costs", "cost": "₹20-30K/month" }
    ],
    "total_budget": "₹10-12 Lakhs"
  },
  "funding_options": ["Bootstrap", "Angel Investment", "Revenue-funded"],
  "critical_dependencies": ["<dependency 1>", "<dependency 2>"],
  "summary": "<2-3 sentence feasibility summary>",
  "gate_passed": <true if technical_score >= 6>,
  "recommendation": "<advance|iterate|pivot|decline>"
}`

    // Call Claude Sonnet for analysis
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 3000,
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
    let feasibilityData: FeasibilityResult
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
      feasibilityData = JSON.parse(jsonStr.trim())
    } catch (parseError) {
      console.error('Failed to parse Claude response:', textContent.text)
      throw new Error('Failed to parse feasibility response')
    }

    // Calculate technical score
    const scores = Object.values(feasibilityData.dimensions).map(d => d.score)
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length
    feasibilityData.technical_score = Math.round(avgScore * 10) / 10

    // Gate criteria: technical_score >= 6 AND mvp_weeks <= 16
    const mvpWeeks = feasibilityData.mvp_timeline?.weeks || 0
    feasibilityData.gate_passed = feasibilityData.technical_score >= 6 && mvpWeeks <= 16

    if (feasibilityData.gate_passed) {
      feasibilityData.recommendation = 'advance'
    } else if (feasibilityData.technical_score >= 5) {
      feasibilityData.recommendation = 'iterate'
    } else if (mvpWeeks > 24) {
      feasibilityData.recommendation = 'pivot'
    } else {
      feasibilityData.recommendation = 'decline'
    }

    // Save to database
    const { data: savedAnalysis, error: saveError } = await supabase
      .from('ai_evaluations')
      .insert({
        idea_id: ideaId,
        stage_number: 5,
        evaluation_type: 'feasibility',
        model_used: `${CLAUDE_MODEL} + apollo.io`,
        confidence_score: feasibilityData.technical_score * 10,
        pass_fail: feasibilityData.gate_passed ? 'pass' : 'fail',
        strengths: feasibilityData.funding_options,
        concerns: [...feasibilityData.risks.technical, ...feasibilityData.risks.market],
        recommendations: feasibilityData.critical_dependencies,
        pivot_suggestions: [],
        result_data: {
          dimensions: feasibilityData.dimensions,
          technical_score: feasibilityData.technical_score,
          mvp_timeline: feasibilityData.mvp_timeline,
          tech_stack: feasibilityData.tech_stack,
          risks: feasibilityData.risks,
          resource_requirements: feasibilityData.resource_requirements,
          funding_options: feasibilityData.funding_options,
          critical_dependencies: feasibilityData.critical_dependencies,
          summary: feasibilityData.summary,
          recommendation: feasibilityData.recommendation,
          apollo_data: apolloCompanies.length > 0 ? { company_count: apolloCompanies.length } : null
        },
        raw_response: textContent.text
      })
      .select()
      .single()

    if (saveError) {
      console.error('Failed to save feasibility analysis:', saveError)
    }

    // Update idea stage if passed
    if (feasibilityData.gate_passed) {
      await supabase
        .from('ideas')
        .update({ 
          current_stage: 6,
          stage_entered_at: new Date().toISOString()
        })
        .eq('id', ideaId)
    }

    console.log(`[Stage 5] Feasibility analysis complete: ${feasibilityData.technical_score}/10 - ${feasibilityData.recommendation}`)
    console.log(`[Stage 5] MVP Timeline: ${feasibilityData.mvp_timeline.weeks} weeks`)

    return NextResponse.json({
      success: true,
      analysis: {
        id: savedAnalysis?.id || 'temp',
        ...feasibilityData,
        created_at: new Date().toISOString()
      },
      model_used: CLAUDE_MODEL,
      apollo_data_used: apolloCompanies.length > 0
    })

  } catch (error) {
    console.error('[Stage 5] Feasibility analysis error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Feasibility analysis failed' },
      { status: 500 }
    )
  }
}