// ═══════════════════════════════════════════════════════════════
// AIzYantra AI Assessment - OpenAI Service
// Path: src/lib/openai-assessment.ts
// Purpose: Generate personalized questions and recommendations
// ═══════════════════════════════════════════════════════════════

import OpenAI from 'openai';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface OrganizationContext {
  name: string;
  industry: string;
  size: string;
  designation: string;
  description: string; // 100-word org description
}

export interface AIAdoptionStage {
  stage: 'unaware' | 'curious' | 'interested' | 'ready' | 'active';
  stageNumber: number; // 1-5
  stageLabel: string;
  description: string;
}

export interface GeneratedQuestion {
  id: string;
  question: string;
  context: string; // Why this question matters for them
  options: {
    value: number;
    label: string;
    score: number;
    insight: string; // What this answer tells us
  }[];
  dimension: string;
  followUp?: string; // Personalized follow-up based on their context
}

export interface PersonalizedRecommendation {
  category: 'quick_win' | 'short_term' | 'long_term';
  timeframe: string;
  title: string;
  description: string;
  aizyantraService?: string;
  estimatedImpact: string;
  effort: 'low' | 'medium' | 'high';
  employeeMessage?: string; // Job security messaging
}

export interface AIAnalysisResult {
  adoptionStage: AIAdoptionStage;
  questions: GeneratedQuestion[];
  industryInsights: string[];
  potentialPainPoints: string[];
  aiOpportunities: string[];
}

export interface AssessmentResultsInput {
  organizationContext: OrganizationContext;
  responses: {
    questionId: string;
    question: string;
    selectedOption: {
      label: string;
      score: number;
    };
  }[];
  overallScore: number;
  dimensionScores: Record<string, number>;
}

export interface PersonalizedResults {
  summary: string;
  adoptionStage: AIAdoptionStage;
  strengths: string[];
  opportunities: string[];
  recommendations: PersonalizedRecommendation[];
  employeeReassurance: string;
  nextStepCTA: string;
}

// ═══════════════════════════════════════════════════════════════
// OpenAI Client
// ═══════════════════════════════════════════════════════════════

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ═══════════════════════════════════════════════════════════════
// System Prompts
// ═══════════════════════════════════════════════════════════════

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
🌱 QUICK WINS (This Week) - Low risk, immediate value, no disruption
📈 SHORT TERM (1-3 Months) - Build confidence, small pilots
🚀 LONG TERM (6-12 Months) - Strategic transformation, bigger impact

EMPLOYEE REASSURANCE:
- AI assists, never replaces
- Removes boring repetitive tasks
- Lets people focus on meaningful work
- No jobs at risk - just enhanced roles

EXAMPLE GOOD TONE:
✅ "You might find it helpful to start with automating your daily report delivery - many of our clients in healthcare began here and saved 5+ hours weekly without changing how anyone works."
✅ "As a pathology company serving customers across India speaking different languages, our multilingual voice agent could be a great assistant for your team."

EXAMPLE BAD TONE (AVOID):
❌ "Priority: Build foundational data infrastructure capabilities"
❌ "Your organization lacks proper AI governance"
❌ "You need to immediately address your data quality issues"`;

// ═══════════════════════════════════════════════════════════════
// Main Functions
// ═══════════════════════════════════════════════════════════════

/**
 * Analyze organization and generate personalized assessment questions
 */
export async function generatePersonalizedQuestions(
  context: OrganizationContext
): Promise<AIAnalysisResult> {
  try {
    const userPrompt = `
ORGANIZATION CONTEXT:
- Name: ${context.name}
- Industry: ${context.industry}
- Size: ${context.size}
- Person's Role: ${context.designation}
- About the Organization: ${context.description}

Based on this context, please:

1. Estimate their likely AI ADOPTION STAGE (1-5)

2. Generate 7-10 PERSONALIZED assessment questions that:
   - Are tailored to their ${context.industry} industry
   - Feel conversational and friendly
   - Help us understand WHERE they are in their AI journey
   - Cover all 7 dimensions but feel natural
   - Each question has 5 options (scored 0-100)

3. List 3-4 INDUSTRY-SPECIFIC insights about AI opportunities in ${context.industry}

4. Identify 3-4 POTENTIAL PAIN POINTS common in ${context.industry} that AI could address

5. List 3-4 specific AI OPPORTUNITIES relevant to their organization

Respond in this JSON format:
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
  "industryInsights": [
    "In ${context.industry}, AI is transforming...",
  ],
  "potentialPainPoints": [
    "Manual report processing taking hours...",
  ],
  "aiOpportunities": [
    "Automated customer communication in multiple languages...",
  ]
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

    const result = JSON.parse(content) as AIAnalysisResult;
    
    // Ensure all questions have unique IDs
    result.questions = result.questions.map((q, index) => ({
      ...q,
      id: q.id || `q_${index + 1}_${Date.now()}`
    }));

    return result;

  } catch (error) {
    console.error('Error generating personalized questions:', error);
    // Return fallback questions if AI fails
    return getFallbackQuestions(context);
  }
}

/**
 * Generate personalized results and recommendations
 */
export async function generatePersonalizedResults(
  input: AssessmentResultsInput
): Promise<PersonalizedResults> {
  try {
    const userPrompt = `
ORGANIZATION:
- Name: ${input.organizationContext.name}
- Industry: ${input.organizationContext.industry}
- Size: ${input.organizationContext.size}
- Role: ${input.organizationContext.designation}
- About: ${input.organizationContext.description}

ASSESSMENT RESPONSES:
${input.responses.map(r => `Q: ${r.question}\nA: ${r.selectedOption.label} (Score: ${r.selectedOption.score})`).join('\n\n')}

SCORES:
- Overall Score: ${input.overallScore}/100
- Dimension Scores: ${JSON.stringify(input.dimensionScores)}

Based on this assessment, generate personalized, ENCOURAGING results:

1. A warm SUMMARY paragraph (2-3 sentences) that:
   - Acknowledges where they are positively
   - Shows you understand their industry
   - Hints at exciting possibilities ahead

2. Their AI ADOPTION STAGE with encouraging description

3. 2-3 STRENGTHS to celebrate (things they're already doing well)

4. 2-3 OPPORTUNITIES framed positively (not weaknesses)

5. 5-7 PERSONALIZED RECOMMENDATIONS:
   - Mix of quick wins, short-term, and long-term
   - Specific to their ${input.organizationContext.industry} industry
   - Reference AIzYantra services where relevant
   - Each should feel achievable and safe
   - Include estimated impact and effort level

6. EMPLOYEE REASSURANCE message (2-3 sentences) addressing job security

7. A compelling NEXT STEP CTA

Respond in JSON format:
{
  "summary": "Your organization is at an exciting point...",
  "adoptionStage": {
    "stage": "curious",
    "stageNumber": 2,
    "stageLabel": "Curious Explorer",
    "description": "You're actively exploring how AI might help..."
  },
  "strengths": [
    "Your team shows great openness to new technology...",
  ],
  "opportunities": [
    "There's exciting potential to streamline your report delivery...",
  ],
  "recommendations": [
    {
      "category": "quick_win",
      "timeframe": "This Week",
      "title": "Automated Report Delivery",
      "description": "You might find it helpful to start with automated report delivery via WhatsApp. Many pathology labs we work with began here - it takes just a day to set up and patients love the instant access.",
      "aizyantraService": "Automated Report Delivery",
      "estimatedImpact": "Save 3-5 hours daily on manual report sending",
      "effort": "low",
      "employeeMessage": "Your staff won't need to manually send reports anymore - they can focus on patient care instead."
    }
  ],
  "employeeReassurance": "AI at ${input.organizationContext.name} will help your team focus on meaningful work by handling repetitive tasks like report delivery and routine queries. No roles will be replaced - your team members will have more time for the work that truly matters, like patient care and complex problem-solving.",
  "nextStepCTA": "Let's explore how automated report delivery could work for your lab - it's a great first step that your team and patients will appreciate."
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

    return JSON.parse(content) as PersonalizedResults;

  } catch (error) {
    console.error('Error generating personalized results:', error);
    return getFallbackResults(input);
  }
}

// ═══════════════════════════════════════════════════════════════
// Fallback Functions (if AI fails)
// ═══════════════════════════════════════════════════════════════

function getFallbackQuestions(context: OrganizationContext): AIAnalysisResult {
  return {
    adoptionStage: {
      stage: 'curious',
      stageNumber: 2,
      stageLabel: 'Curious Explorer',
      description: 'Your organization is exploring AI possibilities - an exciting phase!'
    },
    questions: [
      {
        id: 'fallback_1',
        question: `In your ${context.industry} organization, how do you currently handle repetitive daily tasks?`,
        context: 'Understanding your current processes helps us identify quick wins',
        dimension: 'Current Processes',
        options: [
          { value: 1, label: 'Everything is done manually by team members', score: 20, insight: 'High automation potential' },
          { value: 2, label: 'We use basic tools like Excel/spreadsheets', score: 40, insight: 'Some digitization in place' },
          { value: 3, label: 'We have some software but still lots of manual work', score: 60, insight: 'Ready for automation' },
          { value: 4, label: 'Most processes are digitized with some automation', score: 80, insight: 'Good foundation' },
          { value: 5, label: 'We have automated most repetitive tasks already', score: 100, insight: 'Advanced automation' }
        ]
      },
      {
        id: 'fallback_2',
        question: 'How does your leadership team view AI and automation?',
        context: 'Leadership support is key to successful AI adoption',
        dimension: 'Leadership & Vision',
        options: [
          { value: 1, label: "It hasn't really come up in discussions", score: 20, insight: 'Opportunity to introduce AI benefits' },
          { value: 2, label: "There's some curiosity but no concrete plans", score: 40, insight: 'Interest exists' },
          { value: 3, label: "We've discussed it and see potential value", score: 60, insight: 'Positive outlook' },
          { value: 4, label: 'Leadership is actively exploring AI solutions', score: 80, insight: 'Strong interest' },
          { value: 5, label: 'AI is part of our strategic roadmap', score: 100, insight: 'Strategic priority' }
        ]
      },
      {
        id: 'fallback_3',
        question: 'How would your team members likely react to AI tools being introduced?',
        context: 'Team sentiment helps us suggest the right approach',
        dimension: 'Team Sentiment',
        options: [
          { value: 1, label: 'Probably concerned about job security', score: 20, insight: 'Need careful change management' },
          { value: 2, label: 'Skeptical but might try if leadership asks', score: 40, insight: 'Open to guidance' },
          { value: 3, label: 'Generally open if it makes their job easier', score: 60, insight: 'Positive if value is clear' },
          { value: 4, label: 'Enthusiastic about tools that save time', score: 80, insight: 'Ready adopters' },
          { value: 5, label: 'Already asking for more tech tools', score: 100, insight: 'Tech-forward team' }
        ]
      },
      {
        id: 'fallback_4',
        question: 'How organized is your business data (customer info, reports, etc.)?',
        context: 'Data readiness affects what AI solutions work best',
        dimension: 'Data Readiness',
        options: [
          { value: 1, label: 'Mostly in papers, files, or scattered systems', score: 20, insight: 'Data organization needed first' },
          { value: 2, label: 'In spreadsheets but not well organized', score: 40, insight: 'Some structure exists' },
          { value: 3, label: 'In a database or software but needs cleanup', score: 60, insight: 'Good starting point' },
          { value: 4, label: 'Well organized in proper systems', score: 80, insight: 'AI-ready data' },
          { value: 5, label: 'Centralized, clean, and easily accessible', score: 100, insight: 'Excellent foundation' }
        ]
      },
      {
        id: 'fallback_5',
        question: 'What best describes your budget situation for new technology?',
        context: 'Helps us suggest appropriately sized solutions',
        dimension: 'Budget Reality',
        options: [
          { value: 1, label: 'Very limited - need to see ROI quickly', score: 20, insight: 'Focus on quick wins' },
          { value: 2, label: 'Small budget for tools that prove their value', score: 40, insight: 'Start small' },
          { value: 3, label: 'Moderate budget for the right solutions', score: 60, insight: 'Room for pilots' },
          { value: 4, label: 'Good budget allocated for technology', score: 80, insight: 'Ready to invest' },
          { value: 5, label: 'Strong investment in innovation', score: 100, insight: 'Strategic investor' }
        ]
      },
      {
        id: 'fallback_6',
        question: 'Have you used any AI or automation tools before?',
        context: 'Understanding your experience helps us recommend the right starting point',
        dimension: 'Previous Experience',
        options: [
          { value: 1, label: 'No, this would be completely new for us', score: 20, insight: 'Fresh start opportunity' },
          { value: 2, label: 'Heard about them but never tried', score: 40, insight: 'Ready to explore' },
          { value: 3, label: 'Used basic tools like chatbots or voice assistants personally', score: 60, insight: 'Some familiarity' },
          { value: 4, label: 'Have tried some business automation tools', score: 80, insight: 'Experienced with basics' },
          { value: 5, label: 'Already using AI tools in our business', score: 100, insight: 'AI-experienced' }
        ]
      },
      {
        id: 'fallback_7',
        question: 'What would be your biggest hope from AI adoption?',
        context: 'Understanding your goals helps us personalize recommendations',
        dimension: 'Goals & Vision',
        options: [
          { value: 1, label: 'Just curious to understand what AI can do', score: 20, insight: 'Education focus' },
          { value: 2, label: 'Save time on boring repetitive tasks', score: 40, insight: 'Efficiency focus' },
          { value: 3, label: 'Improve customer experience', score: 60, insight: 'Customer focus' },
          { value: 4, label: 'Reduce errors and improve quality', score: 80, insight: 'Quality focus' },
          { value: 5, label: 'Transform how we operate and compete', score: 100, insight: 'Transformation focus' }
        ]
      }
    ],
    industryInsights: [
      `AI is transforming ${context.industry} with automation of routine tasks`,
      'Customer communication can be enhanced with multilingual AI assistants',
      'Document processing and report generation are common starting points'
    ],
    potentialPainPoints: [
      'Manual data entry and report generation',
      'Customer query handling taking too much time',
      'Difficulty managing operations across locations'
    ],
    aiOpportunities: [
      'Automated report delivery via WhatsApp/Email',
      'AI chatbot for common customer queries',
      'Voice agents for multilingual customer support'
    ]
  };
}

function getFallbackResults(input: AssessmentResultsInput): PersonalizedResults {
  const score = input.overallScore;
  let stage: AIAdoptionStage;

  if (score < 30) {
    stage = { stage: 'unaware', stageNumber: 1, stageLabel: 'Just Starting', description: 'You\'re at the beginning of an exciting journey!' };
  } else if (score < 50) {
    stage = { stage: 'curious', stageNumber: 2, stageLabel: 'Curious Explorer', description: 'You\'re exploring possibilities - great timing!' };
  } else if (score < 70) {
    stage = { stage: 'interested', stageNumber: 3, stageLabel: 'Interested & Ready', description: 'You\'ve identified opportunities and are ready to move forward!' };
  } else if (score < 85) {
    stage = { stage: 'ready', stageNumber: 4, stageLabel: 'Ready to Go', description: 'You have a solid foundation - time to accelerate!' };
  } else {
    stage = { stage: 'active', stageNumber: 5, stageLabel: 'AI Champion', description: 'You\'re already on the AI journey - let\'s optimize!' };
  }

  return {
    summary: `Your ${input.organizationContext.industry} organization is at an exciting point in its AI journey. Based on your responses, there are some wonderful opportunities to explore that could make your team's work easier and your customers happier.`,
    adoptionStage: stage,
    strengths: [
      'Your openness to exploring new technology',
      'Understanding of your business processes',
      'Interest in improving efficiency'
    ],
    opportunities: [
      'Automating routine communications could free up significant time',
      'Customer query handling could be streamlined with AI assistance',
      'Report generation and delivery has good automation potential'
    ],
    recommendations: [
      {
        category: 'quick_win',
        timeframe: 'This Week',
        title: 'Automated Report/Document Delivery',
        description: 'You might find it helpful to start with automated delivery of reports or documents via WhatsApp or Email. Many organizations in your industry began here - it takes minimal setup and customers appreciate the instant access.',
        aizyantraService: 'Automated Report Delivery',
        estimatedImpact: 'Save 2-4 hours daily on manual sending',
        effort: 'low',
        employeeMessage: 'Your team won\'t need to manually send documents anymore - they can focus on more meaningful work.'
      },
      {
        category: 'short_term',
        timeframe: '1-2 Months',
        title: 'AI-Powered Help Chatbot',
        description: 'A friendly AI chatbot on your website could handle common questions 24/7, so your team can focus on complex queries that really need human attention.',
        aizyantraService: 'AI-Assisted Help Chatbot',
        estimatedImpact: 'Handle 60-70% of routine queries automatically',
        effort: 'medium',
        employeeMessage: 'The chatbot handles FAQs while your team becomes the expert problem-solvers.'
      },
      {
        category: 'long_term',
        timeframe: '3-6 Months',
        title: 'Multilingual Voice Agent',
        description: 'As you serve customers speaking different languages, a multilingual voice agent could be a wonderful addition - ensuring every caller gets help in their preferred language.',
        aizyantraService: 'Multilingual Voice Agent',
        estimatedImpact: 'Never miss a call, serve customers in 10+ languages',
        effort: 'medium',
        employeeMessage: 'Your reception team gets support for calls they couldn\'t handle before - expanding what\'s possible.'
      }
    ],
    employeeReassurance: `AI at ${input.organizationContext.name} will help your team focus on meaningful work by handling repetitive tasks like sending reports and answering routine questions. No roles will be replaced - your team members will have more time for the work that truly matters and requires human judgment and care.`,
    nextStepCTA: 'Let\'s have a friendly chat about which of these opportunities excites you most - no pressure, just exploring possibilities together.'
  };
}

// ═══════════════════════════════════════════════════════════════
// Export
// ═══════════════════════════════════════════════════════════════

export default {
  generatePersonalizedQuestions,
  generatePersonalizedResults
};