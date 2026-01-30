import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Perplexity API endpoint
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions'

interface CompanyResearchResult {
  company_overview: string
  industry_position: string
  strengths: string[]
  recent_news: string[]
  technology_stack: string[]
  employee_count_estimate: string
  key_products_services: string[]
  competitors: string[]
  growth_indicators: string[]
  ai_readiness_signals: string[]
  detailed_analysis: string // NEW: Extended analysis paragraph
  key_metrics: {
    label: string
    value: string
  }[]
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { company_name, industry, assessment_id } = body

    if (!company_name || !assessment_id) {
      return NextResponse.json(
        { error: 'Company name and assessment ID are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // Check if we have cached research (less than 7 days old)
    const { data: cachedResearch } = await supabase
      .from('company_research')
      .select('*')
      .ilike('company_name', company_name)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .maybeSingle()

    if (cachedResearch && cachedResearch.research_data) {
      console.log('Using cached company research for:', company_name)
      
      // Link cached research to this assessment
      await supabase
        .from('ai_assessments')
        .update({ 
          company_research_data: cachedResearch.research_data,
          company_research_id: cachedResearch.id 
        })
        .eq('id', assessment_id)

      return NextResponse.json({
        success: true,
        source: 'cache',
        data: cachedResearch.research_data
      })
    }

    // No cache - check for Perplexity API key
    const perplexityApiKey = process.env.PERPLEXITY_API_KEY

    if (!perplexityApiKey) {
      console.warn('Perplexity API key not configured, using fallback')
      const fallbackData = generateFallbackResearch(company_name, industry)
      
      // Save fallback and link to assessment
      await saveResearch(supabase, company_name, industry, assessment_id, fallbackData, 'fallback', null)
      
      return NextResponse.json({
        success: true,
        source: 'fallback',
        data: fallbackData
      })
    }

    // Build the research prompt
    const researchPrompt = buildResearchPrompt(company_name, industry)

    // Call Perplexity API
    try {
      const perplexityResponse = await fetch(PERPLEXITY_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${perplexityApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-large-128k-online',
          messages: [
            {
              role: 'system',
              content: 'You are a business research assistant specializing in company intelligence and AI readiness assessment. Provide accurate, detailed, and insightful information about companies. Always respond in valid JSON format with rich, actionable insights.'
            },
            {
              role: 'user',
              content: researchPrompt
            }
          ],
          max_tokens: 3000,
          temperature: 0.2
        })
      })

      if (!perplexityResponse.ok) {
        throw new Error(`Perplexity API error: ${perplexityResponse.status}`)
      }

      const perplexityData = await perplexityResponse.json()
      const content = perplexityData.choices?.[0]?.message?.content

      if (!content) {
        throw new Error('No content in Perplexity response')
      }

      // Parse the JSON response
      let researchData: CompanyResearchResult
      try {
        // Extract JSON from markdown code blocks if present
        const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/```\n?([\s\S]*?)\n?```/)
        const jsonString = jsonMatch ? jsonMatch[1] : content
        researchData = JSON.parse(jsonString.trim())
      } catch (parseError) {
        console.error('Failed to parse Perplexity response:', parseError)
        // Use fallback if parsing fails
        researchData = generateFallbackResearch(company_name, industry)
      }

      // Save research and link to assessment
      await saveResearch(supabase, company_name, industry, assessment_id, researchData, 'perplexity', perplexityData)

      return NextResponse.json({
        success: true,
        source: 'perplexity',
        data: researchData
      })

    } catch (apiError: any) {
      console.error('Perplexity API call failed:', apiError)
      
      // Fallback on API error
      const fallbackData = generateFallbackResearch(company_name, industry)
      await saveResearch(supabase, company_name, industry, assessment_id, fallbackData, 'fallback', null)
      
      return NextResponse.json({
        success: true,
        source: 'fallback',
        data: fallbackData
      })
    }

  } catch (error: any) {
    console.error('Company research error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to research company' },
      { status: 500 }
    )
  }
}

function buildResearchPrompt(companyName: string, industry: string): string {
  return `Research the company "${companyName}" in the ${industry || 'general business'} sector thoroughly.

Return a JSON object with these exact fields:
{
  "company_overview": "2-3 sentence description of the company, what they do, and their value proposition",
  "industry_position": "Their market position (market leader, strong challenger, emerging innovator, established regional player, etc.)",
  "strengths": ["specific strength 1 with context", "specific strength 2", "specific strength 3", "specific strength 4"],
  "recent_news": ["recent development or achievement 1", "recent development 2"],
  "technology_stack": ["known technology or system 1", "known technology 2", "digital capabilities"],
  "employee_count_estimate": "estimated employee count or range with source context",
  "key_products_services": ["main product/service 1", "main product/service 2", "main product/service 3"],
  "competitors": ["main competitor 1", "competitor 2", "competitor 3"],
  "growth_indicators": ["growth indicator 1 with data if available", "growth indicator 2"],
  "ai_readiness_signals": ["AI/digital readiness signal 1", "readiness signal 2"],
  "detailed_analysis": "A comprehensive 150-200 word analysis covering: the company's market position and competitive landscape, their digital maturity based on available signals, specific AI/automation opportunities relevant to their business model, key challenges they likely face in their industry, and how AI transformation could address these challenges. Include specific data points, percentages, or metrics where possible.",
  "key_metrics": [
    {"label": "Founded", "value": "year or approximate era"},
    {"label": "Headquarters", "value": "city, country"},
    {"label": "Industry Focus", "value": "primary sector"},
    {"label": "Market Presence", "value": "geographic reach or market type"}
  ]
}

Provide rich, detailed insights that demonstrate deep research. If specific information isn't available, make intelligent inferences based on industry patterns and company characteristics. Always return valid JSON.`
}

function generateFallbackResearch(companyName: string, industry: string): CompanyResearchResult {
  // Industry-specific detailed fallback data
  const industryData: Record<string, {
    strengths: string[],
    challenges: string[],
    aiOpportunities: string[],
    metrics: { label: string, value: string }[],
    competitors: string[],
    techStack: string[]
  }> = {
    'Healthcare & Life Sciences': {
      strengths: [
        'Operating in India\'s rapidly growing healthcare diagnostics market, projected to reach $32 billion by 2025',
        'Established trust and credibility in patient-centric diagnostic services',
        'Strong quality control processes essential for accurate medical diagnostics',
        'Network effects from healthcare provider partnerships and referral relationships'
      ],
      challenges: [
        'Managing high volumes of patient data and test results efficiently',
        'Ensuring quick turnaround times while maintaining accuracy',
        'Competition from national chains and digital-first diagnostics startups'
      ],
      aiOpportunities: [
        'AI-powered diagnostic assistance for faster, more accurate results',
        'Automated report generation reducing manual processing time by 60-70%',
        'Predictive analytics for patient health insights and preventive care recommendations'
      ],
      metrics: [
        { label: 'Industry', value: 'Healthcare Diagnostics' },
        { label: 'Market', value: 'India Healthcare' },
        { label: 'Sector Growth', value: '15-20% annually' },
        { label: 'Digital Adoption', value: 'Accelerating post-2020' }
      ],
      competitors: [
        'Dr. Lal PathLabs', 'Metropolis Healthcare', 'Thyrocare Technologies', 'SRL Diagnostics'
      ],
      techStack: [
        'Laboratory Information Management System (LIMS)',
        'Electronic Health Records integration',
        'Digital reporting platforms'
      ]
    },
    'Technology & Software': {
      strengths: [
        'Strong technical talent pool and engineering capabilities',
        'Agile development practices enabling rapid iteration',
        'Digital-native operations with cloud infrastructure',
        'Data-driven decision making culture'
      ],
      challenges: [
        'Talent retention in competitive tech market',
        'Scaling development velocity while maintaining code quality',
        'Managing technical debt across growing product portfolio'
      ],
      aiOpportunities: [
        'AI-powered code review and quality assurance automation',
        'Intelligent customer support with conversational AI',
        'Predictive analytics for product usage and churn prevention'
      ],
      metrics: [
        { label: 'Industry', value: 'Technology Services' },
        { label: 'Market', value: 'Global Tech' },
        { label: 'Sector Growth', value: '12-18% annually' },
        { label: 'Digital Maturity', value: 'High' }
      ],
      competitors: [
        'Regional tech companies', 'Global IT services firms', 'Specialized SaaS providers'
      ],
      techStack: [
        'Cloud platforms (AWS/Azure/GCP)',
        'Modern development frameworks',
        'CI/CD pipelines and DevOps tools'
      ]
    },
    'Financial Services & Banking': {
      strengths: [
        'Regulated environment expertise ensuring compliance and trust',
        'Rich customer data enabling personalized financial services',
        'Established customer relationships and brand recognition',
        'Strong risk management frameworks and processes'
      ],
      challenges: [
        'Legacy system modernization and digital transformation',
        'Regulatory compliance across multiple jurisdictions',
        'Competition from fintech startups and digital banks'
      ],
      aiOpportunities: [
        'AI-powered fraud detection reducing losses by up to 50%',
        'Intelligent document processing for loan applications',
        'Personalized financial advice through robo-advisory'
      ],
      metrics: [
        { label: 'Industry', value: 'Financial Services' },
        { label: 'Market', value: 'BFSI Sector' },
        { label: 'Digital Banking Growth', value: '25% annually' },
        { label: 'Fintech Adoption', value: 'Rapidly increasing' }
      ],
      competitors: [
        'Traditional banks', 'Digital-first neobanks', 'Fintech platforms'
      ],
      techStack: [
        'Core banking systems',
        'Payment processing platforms',
        'Customer relationship management'
      ]
    },
    'Manufacturing & Industrial': {
      strengths: [
        'Established production processes and operational expertise',
        'Physical infrastructure and manufacturing capabilities',
        'Supply chain relationships and vendor networks',
        'Quality control systems and certifications'
      ],
      challenges: [
        'Production efficiency and reducing operational costs',
        'Supply chain visibility and demand forecasting',
        'Workforce productivity and skills development'
      ],
      aiOpportunities: [
        'Predictive maintenance reducing downtime by 30-50%',
        'AI-powered quality inspection with computer vision',
        'Demand forecasting improving inventory management by 20-35%'
      ],
      metrics: [
        { label: 'Industry', value: 'Manufacturing' },
        { label: 'Focus', value: 'Industrial Production' },
        { label: 'Industry 4.0 Adoption', value: 'Growing' },
        { label: 'Automation Potential', value: 'High' }
      ],
      competitors: [
        'Regional manufacturers', 'National industrial companies', 'Global manufacturing firms'
      ],
      techStack: [
        'ERP systems',
        'Manufacturing Execution Systems (MES)',
        'Supply chain management tools'
      ]
    },
    'Retail & E-commerce': {
      strengths: [
        'Direct customer relationships and purchase behavior data',
        'Multi-channel presence across online and offline touchpoints',
        'Brand recognition and customer loyalty programs',
        'Inventory and supply chain management capabilities'
      ],
      challenges: [
        'Omnichannel experience consistency',
        'Inventory optimization across channels',
        'Customer acquisition costs and retention'
      ],
      aiOpportunities: [
        'Personalized product recommendations increasing conversion by 15-30%',
        'AI-powered demand forecasting reducing stockouts by 20-40%',
        'Chatbot customer service handling 60-80% of routine queries'
      ],
      metrics: [
        { label: 'Industry', value: 'Retail & E-commerce' },
        { label: 'Market', value: 'Consumer Retail' },
        { label: 'E-commerce Growth', value: '20-30% annually' },
        { label: 'Digital Adoption', value: 'Accelerating' }
      ],
      competitors: [
        'E-commerce marketplaces', 'Direct-to-consumer brands', 'Traditional retail chains'
      ],
      techStack: [
        'E-commerce platforms',
        'Point of Sale systems',
        'Customer Data Platforms'
      ]
    },
    'Professional Services': {
      strengths: [
        'Deep domain expertise and specialized knowledge',
        'Strong client relationships and trust-based partnerships',
        'Experienced professional talent and thought leadership',
        'Project management and delivery capabilities'
      ],
      challenges: [
        'Scaling expertise without proportional headcount growth',
        'Knowledge management and institutional learning',
        'Billable utilization and resource optimization'
      ],
      aiOpportunities: [
        'AI-assisted research and analysis reducing project time by 30-40%',
        'Automated document review and contract analysis',
        'Intelligent scheduling and resource allocation'
      ],
      metrics: [
        { label: 'Industry', value: 'Professional Services' },
        { label: 'Focus', value: 'B2B Services' },
        { label: 'Knowledge Economy', value: 'High value' },
        { label: 'AI Adoption Potential', value: 'Significant' }
      ],
      competitors: [
        'Big 4 consulting firms', 'Boutique consultancies', 'Specialized service providers'
      ],
      techStack: [
        'Project management tools',
        'CRM systems',
        'Collaboration platforms'
      ]
    }
  }

  // Default fallback for unknown industries
  const defaultData = {
    strengths: [
      'Established market presence and operational experience',
      'Domain expertise and industry knowledge built over years',
      'Customer relationships and brand recognition in their market',
      'Demonstrated growth mindset by investing in AI readiness assessment'
    ],
    challenges: [
      'Operational efficiency and process optimization',
      'Digital transformation and technology adoption',
      'Competitive differentiation in evolving market'
    ],
    aiOpportunities: [
      'Process automation reducing manual work by 40-60%',
      'Data-driven decision making with AI analytics',
      'Enhanced customer experience through AI-powered services'
    ],
    metrics: [
      { label: 'Industry', value: industry || 'Business Services' },
      { label: 'Market', value: 'Regional/National' },
      { label: 'Digital Readiness', value: 'Developing' },
      { label: 'AI Potential', value: 'Significant' }
    ],
    competitors: [
      'Regional market players', 'National competitors', 'Digital-first disruptors'
    ],
    techStack: [
      'Business management software',
      'Communication and collaboration tools',
      'Industry-specific applications'
    ]
  }

  const data = industryData[industry] || defaultData

  // Generate detailed analysis paragraph
  const detailedAnalysis = generateDetailedAnalysis(companyName, industry, data)

  return {
    company_overview: `${companyName} is an established organization operating in the ${industry || 'business services'} sector. The company focuses on delivering quality products and services to their customers while building long-term relationships in their market segment.`,
    industry_position: 'Established player with significant growth potential in an evolving market',
    strengths: data.strengths,
    recent_news: [
      'Actively exploring digital transformation and AI adoption opportunities',
      'Investing in business process improvements and operational efficiency',
      'Evaluating technology solutions to enhance competitive positioning'
    ],
    technology_stack: data.techStack,
    employee_count_estimate: 'Small to medium enterprise with growth trajectory',
    key_products_services: [
      `Core ${industry || 'business'} services and solutions`,
      'Customer-focused service delivery',
      'Specialized expertise in their domain'
    ],
    competitors: data.competitors,
    growth_indicators: [
      'Proactive investment in AI readiness assessment demonstrates forward-thinking leadership',
      'Focus on operational excellence and continuous improvement'
    ],
    ai_readiness_signals: [
      'Leadership commitment to exploring AI opportunities evidenced by this assessment',
      'Recognition of digital transformation as a strategic priority'
    ],
    detailed_analysis: detailedAnalysis,
    key_metrics: data.metrics
  }
}

function generateDetailedAnalysis(companyName: string, industry: string, data: any): string {
  const industryAnalyses: Record<string, string> = {
    'Healthcare & Life Sciences': `${companyName} operates in India's dynamic healthcare diagnostics sector, a market experiencing 15-20% annual growth driven by increasing health awareness, rising chronic disease prevalence, and expanding insurance coverage. The company's positioning in this essential services sector provides inherent stability and growth potential. Based on industry patterns, organizations in this space typically face challenges around managing high-volume diagnostic workflows, ensuring rapid turnaround times, and competing with both established national chains and emerging digital-first players. AI presents transformative opportunities for ${companyName}: intelligent report generation could reduce processing time by 60-70%, AI-assisted diagnostics can improve accuracy and speed, while predictive analytics could enable preventive care recommendations that differentiate the service offering. The healthcare sector's digital transformation, accelerated post-2020, creates a favorable environment for AI adoption, with early movers gaining significant competitive advantages in patient experience and operational efficiency.`,
    
    'Technology & Software': `${companyName} operates in the technology sector, positioning it well for AI adoption given the inherent digital maturity of the industry. Technology companies typically maintain strong engineering capabilities and data-driven cultures that facilitate AI implementation. The key opportunities for ${companyName} lie in leveraging AI to enhance development velocity through intelligent code review and automated testing, improving customer success through predictive analytics and AI-powered support, and optimizing internal operations. With the global tech services market growing 12-18% annually, companies that successfully integrate AI into their offerings and operations gain measurable competitive advantages. The challenge lies in prioritizing AI initiatives that deliver maximum business impact while managing the rapid pace of technological change. For technology firms, AI transformation isn't optional—it's essential for maintaining market relevance and meeting evolving customer expectations.`,
    
    'Financial Services & Banking': `${companyName} operates in the financial services sector, an industry undergoing significant digital disruption. Traditional financial institutions face pressure from fintech startups and digital-first competitors while managing complex regulatory requirements. AI presents substantial opportunities: fraud detection systems can reduce losses by up to 50%, intelligent document processing can accelerate loan approvals by 40-60%, and AI-powered advisory services can enhance customer engagement while reducing service costs. The Indian BFSI sector's digital banking adoption is growing at 25% annually, creating urgency for AI transformation. For ${companyName}, the path forward involves identifying high-impact AI use cases that balance innovation with regulatory compliance, customer trust, and operational stability. Organizations that successfully navigate this transformation can achieve significant competitive differentiation in an increasingly commoditized market.`,
    
    'Manufacturing & Industrial': `${companyName} operates in the manufacturing sector, where Industry 4.0 technologies are reshaping competitive dynamics. Manufacturing companies traditionally maintain strong operational processes but often lag in digital transformation compared to service industries. The AI opportunity is substantial: predictive maintenance can reduce equipment downtime by 30-50%, computer vision-powered quality inspection can improve defect detection while reducing manual inspection costs, and demand forecasting AI can optimize inventory levels by 20-35%. For ${companyName}, the manufacturing context offers clear, measurable AI use cases with strong ROI potential. The key success factors involve starting with focused pilot projects, building internal AI capabilities, and scaling successful implementations across operations. Manufacturing's physical operations create unique opportunities for AI-driven optimization that can translate directly to bottom-line improvements.`,
    
    'Retail & E-commerce': `${companyName} operates in the retail sector, where AI is rapidly becoming a competitive necessity rather than a differentiator. Retail companies possess valuable customer data and direct relationships that can fuel AI applications. The opportunities are significant: personalized recommendations can increase conversion rates by 15-30%, AI-powered demand forecasting can reduce stockouts by 20-40% while optimizing inventory costs, and conversational AI can handle 60-80% of routine customer service inquiries. With e-commerce growing 20-30% annually in India, retailers must accelerate AI adoption to meet evolving consumer expectations. For ${companyName}, success requires an integrated approach: leveraging customer data for personalization, optimizing operations through intelligent automation, and creating seamless omnichannel experiences. The retailers who master AI-driven personalization and operational efficiency will capture disproportionate market share in this highly competitive landscape.`
  }

  // Default analysis for other industries
  const defaultAnalysis = `${companyName} operates in the ${industry || 'business services'} sector, a market experiencing digital transformation across all players. Based on industry analysis, organizations in this space typically maintain strong domain expertise and customer relationships, but face increasing pressure to digitize operations and enhance service delivery through technology. AI presents significant opportunities across multiple dimensions: process automation can reduce manual work by 40-60%, data analytics can improve decision-making speed and accuracy, and AI-powered customer interactions can enhance service quality while reducing costs. The company's proactive investment in this AI readiness assessment demonstrates forward-thinking leadership—a critical success factor for digital transformation. For ${companyName}, the key to successful AI adoption lies in identifying high-impact use cases that align with business priorities, building internal capabilities, and creating a culture of continuous improvement. Organizations that move decisively on AI transformation typically see measurable improvements in operational efficiency, customer satisfaction, and competitive positioning within 12-18 months of implementation.`

  return industryAnalyses[industry] || defaultAnalysis
}

async function saveResearch(
  supabase: any, 
  companyName: string, 
  industry: string, 
  assessmentId: string,
  researchData: CompanyResearchResult,
  source: string,
  apiResponse: any
) {
  try {
    // Extract domain from company name (simple approach)
    const domain = companyName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com'
    
    // Insert into company_research table
    const { data: savedResearch, error: insertError } = await supabase
      .from('company_research')
      .insert({
        company_name: companyName,
        domain: domain,
        industry: industry,
        research_data: researchData,
        source: source,
        api_response: apiResponse,
        perplexity_company: researchData,
        perplexity_fetched_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error saving company research:', insertError)
    }

    // Update assessment with research data
    const { error: updateError } = await supabase
      .from('ai_assessments')
      .update({ 
        company_research_data: researchData,
        company_research_id: savedResearch?.id || null
      })
      .eq('id', assessmentId)

    if (updateError) {
      console.error('Error linking research to assessment:', updateError)
    }

    console.log('Research saved successfully for:', companyName, 'Source:', source)

  } catch (err) {
    console.error('Error in saveResearch:', err)
    
    // Fallback: at minimum, update the assessment with the research data
    try {
      await supabase
        .from('ai_assessments')
        .update({ company_research_data: researchData })
        .eq('id', assessmentId)
    } catch (e) {
      console.error('Even fallback assessment update failed:', e)
    }
  }
}