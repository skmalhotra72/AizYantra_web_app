// src/app/api/innovation/market-sizing/route.ts
// Stage 3: Market Sizing - Uses Perplexity Pro for real-time market research with citations

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Perplexity Pro - Best for real-time market research with citations
const PERPLEXITY_MODEL = 'sonar-pro' // Perplexity's best model for research

interface MarketSizingResult {
  tam: {
    value: number
    currency: string
    year: number
    description: string
    sources: string[]
    confidence: 'high' | 'medium' | 'low'
  }
  sam: {
    value: number
    currency: string
    description: string
    methodology: string
    confidence: 'high' | 'medium' | 'low'
  }
  som: {
    value: number
    currency: string
    description: string
    assumptions: string[]
    confidence: 'high' | 'medium' | 'low'
  }
  cagr: number
  trend_direction: 'growing' | 'stable' | 'declining'
  competitors: {
    name: string
    description: string
    market_share?: string
    funding?: string
  }[]
  market_drivers: string[]
  market_barriers: string[]
  summary: string
  sources: string[]
  gate_passed: boolean
  recommendation: 'advance' | 'iterate' | 'pivot' | 'decline'
}

async function callPerplexity(prompt: string): Promise<any> {
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: PERPLEXITY_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a market research analyst. Provide accurate, well-sourced market data. 
Always cite your sources. Use recent data (2023-2025 preferred).
Respond in valid JSON format only.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1, // Low temperature for factual accuracy
      return_citations: true,
      return_related_questions: false
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Perplexity API error: ${response.status} - ${errorText}`)
  }

  return response.json()
}

export async function POST(request: NextRequest) {
  try {
    const { ideaId } = await request.json()

    if (!ideaId) {
      return NextResponse.json({ error: 'Idea ID is required' }, { status: 400 })
    }

    // Check for Perplexity API key
    if (!process.env.PERPLEXITY_API_KEY) {
      return NextResponse.json({ 
        error: 'Perplexity API key not configured. Please add PERPLEXITY_API_KEY to environment variables.' 
      }, { status: 500 })
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

    console.log(`[Stage 3] Market sizing for: ${idea.title} with Perplexity ${PERPLEXITY_MODEL}`)

    // Build the market research prompt
    const researchPrompt = `Research the market size for this business idea:

**Problem Being Solved:** ${idea.problem_statement}

**Target Users:** ${idea.target_users}

**Proposed Solution:** ${idea.proposed_solution || 'AI-powered solution'}

**Industry:** ${idea.industry_category || 'Technology'}

Provide comprehensive market analysis including:

1. **TAM (Total Addressable Market):** The total global market for this type of solution. Include market size in USD millions, the year of data, and cite your sources.

2. **SAM (Serviceable Addressable Market):** The segment AIzYantra (an India-based AI consulting company) can realistically serve. Consider geographic focus (India, SEA, US) and service delivery capabilities.

3. **SOM (Serviceable Obtainable Market):** What AIzYantra could realistically capture in 3 years as a new entrant. Be conservative but realistic.

4. **CAGR:** Compound Annual Growth Rate for this market.

5. **Trend Direction:** Is this market growing, stable, or declining?

6. **Key Competitors:** List 3-5 competitors with brief descriptions, funding status, and estimated market share if available.

7. **Market Drivers:** 3-4 factors driving market growth.

8. **Market Barriers:** 2-3 barriers to entry or challenges.

Respond ONLY with valid JSON in this exact format:
{
  "tam": {
    "value": <number in millions USD>,
    "currency": "USD",
    "year": <2023 or 2024>,
    "description": "<what this represents>",
    "sources": ["<source 1>", "<source 2>"],
    "confidence": "<high|medium|low>"
  },
  "sam": {
    "value": <number in millions USD>,
    "currency": "USD",
    "description": "<geographic/segment focus>",
    "methodology": "<how you calculated this>",
    "confidence": "<high|medium|low>"
  },
  "som": {
    "value": <number in millions USD>,
    "currency": "USD",
    "description": "<realistic 3-year target>",
    "assumptions": ["<assumption 1>", "<assumption 2>"],
    "confidence": "<high|medium|low>"
  },
  "cagr": <percentage as number, e.g. 15.5>,
  "trend_direction": "<growing|stable|declining>",
  "competitors": [
    {
      "name": "<company name>",
      "description": "<brief description>",
      "market_share": "<X%>" or null,
      "funding": "<$XM raised>" or null
    }
  ],
  "market_drivers": ["<driver 1>", "<driver 2>", "<driver 3>"],
  "market_barriers": ["<barrier 1>", "<barrier 2>"],
  "summary": "<2-3 sentence market opportunity summary>"
}`

    // Call Perplexity for market research
    const perplexityResponse = await callPerplexity(researchPrompt)
    
    // Extract the response content
    const responseContent = perplexityResponse.choices?.[0]?.message?.content
    if (!responseContent) {
      throw new Error('No response content from Perplexity')
    }

    // Extract citations if available
    const citations = perplexityResponse.citations || []

    // Parse the JSON response
    let marketData: MarketSizingResult
    try {
      // Clean the response
      let jsonStr = responseContent.trim()
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.slice(7)
      }
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.slice(3)
      }
      if (jsonStr.endsWith('```')) {
        jsonStr = jsonStr.slice(0, -3)
      }
      marketData = JSON.parse(jsonStr.trim())
    } catch (parseError) {
      console.error('Failed to parse Perplexity response:', responseContent)
      throw new Error('Failed to parse market sizing response')
    }

    // Add citations to sources
    marketData.sources = citations.length > 0 ? citations : marketData.tam?.sources || []

    // Determine gate pass criteria
    // TAM >= $100M AND growing/stable trend AND at least 3 competitors identified
    const tamValue = marketData.tam?.value || 0
    const isGrowing = marketData.trend_direction !== 'declining'
    const hasCompetitors = (marketData.competitors?.length || 0) >= 3

    marketData.gate_passed = tamValue >= 100 && isGrowing && hasCompetitors

    if (marketData.gate_passed) {
      marketData.recommendation = 'advance'
    } else if (tamValue >= 50 && isGrowing) {
      marketData.recommendation = 'iterate'
    } else if (tamValue >= 20) {
      marketData.recommendation = 'pivot'
    } else {
      marketData.recommendation = 'decline'
    }

// Save to database
    // For market sizing, use a confidence score based on gate pass (TAM is stored in result_data)
    const marketConfidenceScore = marketData.gate_passed ? 75 : 40

    const { data: savedAnalysis, error: saveError } = await supabase
      .from('ai_evaluations')
      .insert({
        idea_id: ideaId,
        stage_number: 3,
        evaluation_type: 'market_sizing',
        model_used: `perplexity-${PERPLEXITY_MODEL}`,
        confidence_score: marketConfidenceScore,
        pass_fail: marketData.gate_passed ? 'pass' : 'fail',
        strengths: marketData.market_drivers,
        concerns: marketData.market_barriers,
        recommendations: [],
        pivot_suggestions: [],
        result_data: {
          tam: marketData.tam,
          sam: marketData.sam,
          som: marketData.som,
          cagr: marketData.cagr,
          trend_direction: marketData.trend_direction,
          competitors: marketData.competitors,
          market_drivers: marketData.market_drivers,
          market_barriers: marketData.market_barriers,
          summary: marketData.summary,
          sources: marketData.sources,
          recommendation: marketData.recommendation
        },
        raw_response: responseContent
      })
      .select()
      .single()

    if (saveError) {
      console.error('Failed to save market sizing:', saveError)
    }

    // Update idea stage if passed
    if (marketData.gate_passed) {
      await supabase
        .from('ideas')
        .update({ 
          current_stage: 4,
          stage_entered_at: new Date().toISOString()
        })
        .eq('id', ideaId)
    }

    console.log(`[Stage 3] Market sizing complete: TAM $${tamValue}M - ${marketData.recommendation}`)

    return NextResponse.json({
      success: true,
      marketSizing: {
        id: savedAnalysis?.id || 'temp',
        ...marketData,
        created_at: new Date().toISOString()
      },
      model_used: `perplexity-${PERPLEXITY_MODEL}`,
      citations: citations
    })

  } catch (error) {
    console.error('[Stage 3] Market sizing error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Market sizing failed' },
      { status: 500 }
    )
  }
}