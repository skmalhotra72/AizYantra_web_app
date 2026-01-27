// src/app/api/assessment/generate/route.ts

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const QUESTION_GENERATION_PROMPT = `You are an AI consultant for AIzYantra, a trusted AI solutions company. Your role is to assess an organization's AI readiness in a consultative, encouraging manner.

IMPORTANT GUIDELINES:
1. Be warm, encouraging, and consultative - NOT audit-like or critical
2. Focus on understanding WHERE they are in their AI journey, not judging them
3. Questions should feel like a friendly conversation, not an interrogation
4. Tailor questions to their specific industry and organization context
5. Help identify opportunities, not expose weaknesses

AI ADOPTION STAGES (assess which stage they're in):
1. UNAWARE - Haven't thought about AI, need to plant the seed
2. CURIOUS - Exploring possibilities, need education
3. INTERESTED - Identified needs, need guidance
4. READY - Budget/team allocated, need implementation partner
5. ACTIVE - Already implementing, need optimization

ASSESSMENT DIMENSIONS:
1. Leadership & Vision - Is there executive interest/support?
2. Current Processes - What manual/repetitive work exists?
3. Data Readiness - Do they have organized data?
4. Team Sentiment - How do employees feel about AI?
5. Technology Comfort - Current tech stack familiarity
6. Budget Reality - Resources available for AI initiatives
7. Previous Experience - Any AI tools already in use?

AIzYantra's MISSION: Build trust in AI solutions and trust in AIzYantra as their AI adoption partner.

AIzYantra's SERVICES (reference these naturally):
- AI-assisted help chatbots
- Multilingual voice agents for customer calls
- Document processing automation
- CRM data entry automation
- Automated report delivery (Email/WhatsApp)
- Smart reports for customers
- AI assistants for customer queries`;

const RESULTS_GENERATION_PROMPT = `You are a trusted AI consultant for AIzYantra. Based on the assessment responses, generate personalized, ENCOURAGING recommendations.

CRITICAL TONE GUIDELINES:
1. Be a helpful friend, NOT an auditor
2. Use "You might find it helpful..." not "You must..."
3. Use "Many of our clients..." to normalize their situation
4. Focus on OPPORTUNITIES, not deficiencies
5. Every recommendation should feel achievable and safe
6. Address job security concerns explicitly and reassuringly

RECOMMENDATION CATEGORIES:
- QUICK WINS (This Week) - Low risk, immediate value, no disruption
- SHORT TERM (1-3 Months) - Build confidence, small pilots
- LONG TERM (6-12 Months) - Strategic transformation, bigger impact

EMPLOYEE REASSURANCE:
- AI assists, never replaces
- Removes boring repetitive tasks
- Lets people focus on meaningful work
- No jobs at risk - just enhanced roles`;

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set');
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'generate_questions') {
      const context = body.context;

      if (!context || !context.name || !context.industry) {
        return NextResponse.json(
          { error: 'Missing required context fields: name, industry' },
          { status: 400 }
        );
      }

      console.log('Generating personalized questions for:', context.name);

      const userPrompt = `
ORGANIZATION CONTEXT:
- Name: ${context.name}
- Industry: ${context.industry}
- Size: ${context.size || 'Not specified'}
- Person's Role: ${context.designation || 'Not specified'}
- About the Organization: ${context.description || 'Not provided'}

Based on this context, please:

1. Estimate their likely AI ADOPTION STAGE (1-5)

2. Generate 7-10 PERSONALIZED assessment questions that:
   - Are tailored to their ${context.industry} industry
   - Feel conversational and friendly
   - Help us understand WHERE they are in their AI journey
   - Cover various dimensions but feel natural
   - Each question has 5 options (scored 0-100)

3. List 3-4 INDUSTRY-SPECIFIC insights about AI opportunities in ${context.industry}

4. Identify 3-4 POTENTIAL PAIN POINTS common in ${context.industry} that AI could address

5. List 3-4 specific AI OPPORTUNITIES relevant to their organization

Respond in this exact JSON format:
{
  "adoptionStage": {
    "stage": "curious",
    "stageNumber": 2,
    "stageLabel": "Curious Explorer",
    "description": "Your organization is exploring AI possibilities..."
  },
  "questions": [
    {
      "id": "q1",
      "question": "When your team discusses new technology...",
      "context": "This helps us understand your organization's openness to innovation",
      "dimension": "Team Sentiment",
      "options": [
        {"value": 1, "label": "We prefer sticking to what works", "score": 20, "insight": "Prefers stability"},
        {"value": 2, "label": "We're cautiously open to new tools", "score": 40, "insight": "Open but careful"},
        {"value": 3, "label": "We actively look for better ways", "score": 60, "insight": "Innovation-minded"},
        {"value": 4, "label": "We're usually early adopters", "score": 80, "insight": "Tech-forward"},
        {"value": 5, "label": "We love experimenting with cutting-edge tech", "score": 100, "insight": "Innovation leaders"}
      ]
    }
  ],
  "industryInsights": ["insight1", "insight2"],
  "potentialPainPoints": ["pain1", "pain2"],
  "aiOpportunities": ["opportunity1", "opportunity2"]
}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: QUESTION_GENERATION_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 3000,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const result = JSON.parse(content);
      
      if (result.questions) {
        result.questions = result.questions.map((q: any, index: number) => ({
          ...q,
          id: q.id || `q_${index + 1}_${Date.now()}`
        }));
      }

      return NextResponse.json({
        success: true,
        data: result
      });

    } else if (action === 'generate_results') {
      const input = body.input;

      if (!input || !input.organizationContext || !input.responses) {
        return NextResponse.json(
          { error: 'Missing required input fields' },
          { status: 400 }
        );
      }

      console.log('Generating personalized results for:', input.organizationContext.name);

      const userPrompt = `
ORGANIZATION:
- Name: ${input.organizationContext.name}
- Industry: ${input.organizationContext.industry}
- Size: ${input.organizationContext.size || 'Not specified'}
- Role: ${input.organizationContext.designation || 'Not specified'}
- About: ${input.organizationContext.description || 'Not provided'}

ASSESSMENT RESPONSES:
${input.responses.map((r: any) => `Q: ${r.question}\nA: ${r.selectedOption.label} (Score: ${r.selectedOption.score})`).join('\n\n')}

SCORES:
- Overall Score: ${input.overallScore}/100
- Dimension Scores: ${JSON.stringify(input.dimensionScores)}

Based on this assessment, generate personalized, ENCOURAGING results in this exact JSON format:
{
  "summary": "Your organization is at an exciting point... (2-3 warm sentences)",
  "adoptionStage": {
    "stage": "curious",
    "stageNumber": 2,
    "stageLabel": "Curious Explorer",
    "description": "You're actively exploring how AI might help..."
  },
  "strengths": ["strength1", "strength2"],
  "opportunities": ["opportunity1", "opportunity2"],
  "recommendations": [
    {
      "category": "quick_win",
      "timeframe": "This Week",
      "title": "Automated Report Delivery",
      "description": "You might find it helpful to start with...",
      "aizyantraService": "Automated Report Delivery",
      "estimatedImpact": "Save 3-5 hours daily",
      "effort": "low",
      "employeeMessage": "Your staff won't need to manually send reports anymore..."
    }
  ],
  "employeeReassurance": "AI at your organization will help your team focus on meaningful work by handling repetitive tasks. No roles will be replaced - just enhanced.",
  "nextStepCTA": "Let's explore how automated report delivery could work for you..."
}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: RESULTS_GENERATION_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2500,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      return NextResponse.json({
        success: true,
        data: JSON.parse(content)
      });

    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "generate_questions" or "generate_results"' },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error('Assessment API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process assessment request',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  const hasApiKey = !!process.env.OPENAI_API_KEY;
  
  return NextResponse.json({
    status: hasApiKey ? 'ok' : 'missing_api_key',
    service: 'AIzYantra Assessment API',
    version: '2.0',
  });
}