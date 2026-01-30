// ============================================================
// AIzYantra AI Assessment - Curiosity-Building Question Bank
// ============================================================
// These questions are designed to:
// 1. Build curiosity and excitement about AI possibilities
// 2. NOT intimidate with technical jargon
// 3. Help identify AI opportunities naturally
// 4. Make the assessment feel like a conversation, not an audit
// ============================================================

export interface AssessmentQuestion {
    id: string
    text: string
    helpText?: string  // Provides context, makes user feel comfortable
    type: 'single_choice' | 'multiple_choice' | 'scale' | 'open_text'
    options?: {
      value: string
      label: string
      score: number  // 0-100 for scoring
      aiOpportunity?: string  // What AI opportunity this reveals
    }[]
    dimension: string
    weight: number  // Percentage weight in scoring
    tier: ('quick' | 'complete' | 'advanced')[]  // Which tiers include this question
    followUpTrigger?: {
      condition: string  // e.g., "score < 50" or "value === 'option_a'"
      prompt: string     // Prompt for AI to generate follow-up
    }
  }
  
  // ============================================================
  // DIMENSION 1: CUSTOMER EXPERIENCE (25% weight)
  // Focus: How they interact with customers, response times, support
  // AI Opportunities: Chatbots, 24/7 support, automated responses
  // ============================================================
  
  export const customerExperienceQuestions: AssessmentQuestion[] = [
    {
      id: 'ce_01',
      text: 'How do your customers typically reach out to you?',
      helpText: 'Think about your busiest communication channels',
      type: 'multiple_choice',
      options: [
        { value: 'phone_only', label: 'Mostly phone calls', score: 30, aiOpportunity: 'Voice AI, Call routing' },
        { value: 'email_only', label: 'Mostly emails', score: 40, aiOpportunity: 'Email automation, Auto-responses' },
        { value: 'whatsapp', label: 'WhatsApp / Messaging apps', score: 50, aiOpportunity: 'WhatsApp chatbot' },
        { value: 'website', label: 'Website contact forms', score: 45, aiOpportunity: 'Website chatbot' },
        { value: 'social', label: 'Social media', score: 40, aiOpportunity: 'Social media automation' },
        { value: 'mixed', label: 'Mix of all channels', score: 60, aiOpportunity: 'Omnichannel AI platform' },
      ],
      dimension: 'Customer Experience',
      weight: 25,
      tier: ['quick', 'complete', 'advanced'],
    },
    {
      id: 'ce_02',
      text: 'What happens when a customer contacts you outside business hours?',
      helpText: 'This reveals opportunities for 24/7 AI support',
      type: 'single_choice',
      options: [
        { value: 'nothing', label: 'They have to wait until we open', score: 20, aiOpportunity: '24/7 AI chatbot - HIGH PRIORITY' },
        { value: 'voicemail', label: 'They can leave a voicemail or email', score: 35, aiOpportunity: 'After-hours AI assistant' },
        { value: 'auto_reply', label: 'They get an auto-reply saying we\'ll respond later', score: 45, aiOpportunity: 'Smart auto-response with FAQ' },
        { value: 'limited', label: 'Basic FAQ or self-service options available', score: 60, aiOpportunity: 'Enhanced AI self-service' },
        { value: 'full_support', label: 'We have 24/7 support coverage', score: 85, aiOpportunity: 'AI to augment human support' },
      ],
      dimension: 'Customer Experience',
      weight: 25,
      tier: ['quick', 'complete', 'advanced'],
      followUpTrigger: {
        condition: 'score < 50',
        prompt: 'User has no after-hours support. Ask: "On average, how many customer inquiries do you miss or delay due to business hours limitations?"'
      }
    },
    {
      id: 'ce_03',
      text: 'How often do customers ask the same questions repeatedly?',
      helpText: 'Repetitive questions are perfect for AI automation',
      type: 'single_choice',
      options: [
        { value: 'very_often', label: 'Very often - same 10-20 questions all day', score: 25, aiOpportunity: 'FAQ chatbot - QUICK WIN' },
        { value: 'often', label: 'Often - many similar inquiries', score: 40, aiOpportunity: 'Knowledge base + chatbot' },
        { value: 'sometimes', label: 'Sometimes - mix of common and unique', score: 60, aiOpportunity: 'Smart routing + chatbot' },
        { value: 'rarely', label: 'Rarely - most inquiries are unique', score: 75, aiOpportunity: 'AI-assisted human support' },
        { value: 'never', label: 'Never - every inquiry is different', score: 85, aiOpportunity: 'AI for research & preparation' },
      ],
      dimension: 'Customer Experience',
      weight: 25,
      tier: ['quick', 'complete', 'advanced'],
      followUpTrigger: {
        condition: 'value === "very_often" || value === "often"',
        prompt: 'User has many repetitive questions. Ask: "What are the top 3 questions customers ask most frequently?"'
      }
    },
    {
      id: 'ce_04',
      text: 'How quickly can your team typically respond to customer inquiries?',
      helpText: 'Response time significantly impacts customer satisfaction',
      type: 'single_choice',
      options: [
        { value: 'hours', label: 'Within a few hours', score: 70, aiOpportunity: 'Instant AI first-response' },
        { value: 'same_day', label: 'Same business day', score: 55, aiOpportunity: 'AI triage and quick responses' },
        { value: 'next_day', label: 'Next business day', score: 40, aiOpportunity: 'AI to handle 50%+ instantly' },
        { value: 'few_days', label: '2-3 days', score: 25, aiOpportunity: 'AI customer service - HIGH PRIORITY' },
        { value: 'longer', label: 'It varies / can take longer', score: 15, aiOpportunity: 'Complete AI support overhaul' },
      ],
      dimension: 'Customer Experience',
      weight: 25,
      tier: ['complete', 'advanced'],
    },
    {
      id: 'ce_05',
      text: 'How do you currently collect and act on customer feedback?',
      helpText: 'Understanding customer sentiment helps improve services',
      type: 'single_choice',
      options: [
        { value: 'no_system', label: 'We don\'t have a formal system', score: 20, aiOpportunity: 'AI sentiment analysis' },
        { value: 'occasional', label: 'Occasional surveys or reviews', score: 40, aiOpportunity: 'Automated feedback collection' },
        { value: 'regular', label: 'Regular feedback collection but manual analysis', score: 55, aiOpportunity: 'AI-powered feedback analysis' },
        { value: 'automated', label: 'Automated collection with some analysis', score: 70, aiOpportunity: 'Advanced sentiment AI' },
        { value: 'advanced', label: 'Real-time feedback with actionable insights', score: 90, aiOpportunity: 'Predictive customer insights' },
      ],
      dimension: 'Customer Experience',
      weight: 25,
      tier: ['complete', 'advanced'],
    },
  ]
  
  // ============================================================
  // DIMENSION 2: OPERATIONAL EFFICIENCY (25% weight)
  // Focus: Day-to-day operations, manual tasks, bottlenecks
  // AI Opportunities: Process automation, document processing, workflows
  // ============================================================
  
  export const operationalEfficiencyQuestions: AssessmentQuestion[] = [
    {
      id: 'oe_01',
      text: 'How much time does your team spend on repetitive administrative tasks each week?',
      helpText: 'Think about data entry, scheduling, report generation, filing, etc.',
      type: 'single_choice',
      options: [
        { value: 'minimal', label: 'Less than 5 hours/week - mostly automated', score: 85, aiOpportunity: 'Advanced AI optimization' },
        { value: 'some', label: '5-10 hours/week', score: 65, aiOpportunity: 'Targeted automation' },
        { value: 'moderate', label: '10-20 hours/week', score: 45, aiOpportunity: 'Workflow automation - GOOD ROI' },
        { value: 'significant', label: '20-40 hours/week', score: 30, aiOpportunity: 'Major automation opportunity' },
        { value: 'extensive', label: '40+ hours/week', score: 15, aiOpportunity: 'Complete process transformation' },
      ],
      dimension: 'Operational Efficiency',
      weight: 25,
      tier: ['quick', 'complete', 'advanced'],
      followUpTrigger: {
        condition: 'score < 50',
        prompt: 'User spends significant time on admin tasks. Ask: "Which specific tasks take the most time? (e.g., data entry, scheduling, invoicing, reporting)"'
      }
    },
    {
      id: 'oe_02',
      text: 'How does your organization handle documents and paperwork?',
      helpText: 'Invoices, contracts, forms, reports, etc.',
      type: 'single_choice',
      options: [
        { value: 'all_paper', label: 'Mostly paper-based / manual filing', score: 15, aiOpportunity: 'Document digitization + AI' },
        { value: 'mixed', label: 'Mix of paper and digital, manual processing', score: 30, aiOpportunity: 'Document AI processing' },
        { value: 'digital_manual', label: 'Digital but manually processed', score: 45, aiOpportunity: 'Intelligent document automation' },
        { value: 'some_auto', label: 'Some automated workflows', score: 65, aiOpportunity: 'Enhanced AI document processing' },
        { value: 'fully_auto', label: 'Mostly automated document processing', score: 85, aiOpportunity: 'AI accuracy improvement' },
      ],
      dimension: 'Operational Efficiency',
      weight: 25,
      tier: ['quick', 'complete', 'advanced'],
    },
    {
      id: 'oe_03',
      text: 'Where do you experience the most bottlenecks or delays in your operations?',
      helpText: 'These are prime opportunities for AI to help',
      type: 'multiple_choice',
      options: [
        { value: 'approvals', label: 'Waiting for approvals', score: 40, aiOpportunity: 'AI-powered approval routing' },
        { value: 'data_entry', label: 'Data entry and processing', score: 35, aiOpportunity: 'Automated data extraction' },
        { value: 'communication', label: 'Internal communication delays', score: 45, aiOpportunity: 'AI communication assistant' },
        { value: 'scheduling', label: 'Scheduling and coordination', score: 40, aiOpportunity: 'AI scheduling optimization' },
        { value: 'information', label: 'Finding information / documents', score: 35, aiOpportunity: 'AI knowledge search' },
        { value: 'quality', label: 'Quality checks and reviews', score: 50, aiOpportunity: 'AI quality assurance' },
        { value: 'none', label: 'No major bottlenecks', score: 80, aiOpportunity: 'Optimization fine-tuning' },
      ],
      dimension: 'Operational Efficiency',
      weight: 25,
      tier: ['quick', 'complete', 'advanced'],
    },
    {
      id: 'oe_04',
      text: 'How do you currently handle invoicing and payment processing?',
      helpText: 'Financial processes often have significant automation potential',
      type: 'single_choice',
      options: [
        { value: 'manual', label: 'Completely manual', score: 20, aiOpportunity: 'Invoice automation - QUICK WIN' },
        { value: 'semi', label: 'Semi-automated (templates, some manual steps)', score: 45, aiOpportunity: 'Full invoice automation' },
        { value: 'mostly_auto', label: 'Mostly automated with some manual review', score: 65, aiOpportunity: 'AI anomaly detection' },
        { value: 'fully_auto', label: 'Fully automated', score: 85, aiOpportunity: 'Predictive cash flow AI' },
      ],
      dimension: 'Operational Efficiency',
      weight: 25,
      tier: ['complete', 'advanced'],
    },
    {
      id: 'oe_05',
      text: 'How much time do managers spend on creating reports and presentations?',
      helpText: 'Report generation is often highly automatable',
      type: 'single_choice',
      options: [
        { value: 'extensive', label: 'Several hours per week', score: 25, aiOpportunity: 'Automated report generation' },
        { value: 'moderate', label: 'A few hours per week', score: 45, aiOpportunity: 'AI report assistance' },
        { value: 'minimal', label: 'Less than an hour per week', score: 70, aiOpportunity: 'AI insights enhancement' },
        { value: 'automated', label: 'Reports are mostly automated', score: 85, aiOpportunity: 'Predictive analytics' },
      ],
      dimension: 'Operational Efficiency',
      weight: 25,
      tier: ['complete', 'advanced'],
    },
    {
      id: 'oe_06',
      text: 'Do you have documented processes (SOPs) for your key operations?',
      helpText: 'Documented processes are easier to automate',
      type: 'single_choice',
      options: [
        { value: 'none', label: 'No, processes are mostly in people\'s heads', score: 25, aiOpportunity: 'Process documentation + automation' },
        { value: 'some', label: 'Some key processes are documented', score: 45, aiOpportunity: 'AI process optimization' },
        { value: 'most', label: 'Most processes are documented', score: 65, aiOpportunity: 'Intelligent automation' },
        { value: 'all', label: 'All processes are documented and regularly updated', score: 85, aiOpportunity: 'AI-driven process improvement' },
      ],
      dimension: 'Operational Efficiency',
      weight: 25,
      tier: ['advanced'],
    },
  ]
  
  // ============================================================
  // DIMENSION 3: DATA & DECISION MAKING (20% weight)
  // Focus: How they use data, speed of insights, decision-making
  // AI Opportunities: Analytics, dashboards, predictive insights
  // ============================================================
  
  export const dataDecisionQuestions: AssessmentQuestion[] = [
    {
      id: 'dd_01',
      text: 'How do you typically gather insights to make business decisions?',
      helpText: 'Understanding your current approach helps identify AI opportunities',
      type: 'single_choice',
      options: [
        { value: 'gut', label: 'Mostly gut feeling and experience', score: 20, aiOpportunity: 'Data-driven AI insights' },
        { value: 'basic', label: 'Basic reports and spreadsheets', score: 35, aiOpportunity: 'Automated analytics' },
        { value: 'regular', label: 'Regular reports from our systems', score: 50, aiOpportunity: 'Real-time AI dashboards' },
        { value: 'dashboards', label: 'Dashboards with real-time data', score: 70, aiOpportunity: 'Predictive AI analytics' },
        { value: 'advanced', label: 'Advanced analytics with predictive insights', score: 90, aiOpportunity: 'AI optimization' },
      ],
      dimension: 'Data & Decisions',
      weight: 20,
      tier: ['quick', 'complete', 'advanced'],
      followUpTrigger: {
        condition: 'score < 50',
        prompt: 'User relies on gut feeling or basic reports. Ask: "What business questions do you wish you could answer faster or more accurately?"'
      }
    },
    {
      id: 'dd_02',
      text: 'How long does it typically take to get answers to important business questions?',
      helpText: 'Speed of insights impacts competitive advantage',
      type: 'single_choice',
      options: [
        { value: 'instant', label: 'Instantly - we have real-time dashboards', score: 90, aiOpportunity: 'AI-powered predictions' },
        { value: 'hours', label: 'Within hours', score: 70, aiOpportunity: 'Faster AI insights' },
        { value: 'day', label: 'Within a day', score: 50, aiOpportunity: 'Real-time AI analytics' },
        { value: 'days', label: 'A few days', score: 30, aiOpportunity: 'Automated data analysis' },
        { value: 'week', label: 'A week or more', score: 15, aiOpportunity: 'Complete analytics transformation' },
      ],
      dimension: 'Data & Decisions',
      weight: 20,
      tier: ['quick', 'complete', 'advanced'],
    },
    {
      id: 'dd_03',
      text: 'How confident are you in the accuracy of your business data?',
      helpText: 'Data quality impacts AI effectiveness',
      type: 'single_choice',
      options: [
        { value: 'very_low', label: 'Not confident - data is often outdated or incorrect', score: 20, aiOpportunity: 'Data quality AI' },
        { value: 'low', label: 'Somewhat confident - occasional issues', score: 40, aiOpportunity: 'Data validation automation' },
        { value: 'moderate', label: 'Moderately confident - mostly accurate', score: 60, aiOpportunity: 'AI data enrichment' },
        { value: 'high', label: 'Very confident - good data management', score: 80, aiOpportunity: 'Advanced AI analytics' },
        { value: 'very_high', label: 'Extremely confident - rigorous data governance', score: 95, aiOpportunity: 'AI optimization' },
      ],
      dimension: 'Data & Decisions',
      weight: 20,
      tier: ['quick', 'complete', 'advanced'],
    },
    {
      id: 'dd_04',
      text: 'Is your business data scattered across multiple systems or locations?',
      helpText: 'Unified data enables better AI insights',
      type: 'single_choice',
      options: [
        { value: 'very_scattered', label: 'Yes, data is everywhere (spreadsheets, emails, different apps)', score: 20, aiOpportunity: 'Data integration + AI' },
        { value: 'somewhat', label: 'Somewhat - a few key systems, some spreadsheets', score: 40, aiOpportunity: 'Data unification' },
        { value: 'mostly_unified', label: 'Mostly unified in 1-2 main systems', score: 65, aiOpportunity: 'AI analytics layer' },
        { value: 'unified', label: 'Fully unified and integrated', score: 85, aiOpportunity: 'Advanced AI insights' },
      ],
      dimension: 'Data & Decisions',
      weight: 20,
      tier: ['complete', 'advanced'],
    },
    {
      id: 'dd_05',
      text: 'Can you easily track key performance indicators (KPIs) for your business?',
      helpText: 'KPI visibility is essential for data-driven decisions',
      type: 'single_choice',
      options: [
        { value: 'no', label: 'No, we don\'t have defined KPIs', score: 15, aiOpportunity: 'AI KPI recommendation' },
        { value: 'manual', label: 'Yes, but it requires manual calculation', score: 35, aiOpportunity: 'Automated KPI tracking' },
        { value: 'periodic', label: 'Yes, we get periodic reports', score: 55, aiOpportunity: 'Real-time KPI dashboards' },
        { value: 'realtime', label: 'Yes, with real-time visibility', score: 80, aiOpportunity: 'Predictive KPI analysis' },
      ],
      dimension: 'Data & Decisions',
      weight: 20,
      tier: ['complete', 'advanced'],
    },
  ]
  
  // ============================================================
  // DIMENSION 4: GROWTH & BUSINESS DEVELOPMENT (20% weight)
  // Focus: Sales, marketing, lead generation, growth strategies
  // AI Opportunities: Lead scoring, personalization, sales automation
  // ============================================================
  
  export const growthBusinessQuestions: AssessmentQuestion[] = [
    {
      id: 'gb_01',
      text: 'How do you currently find and qualify new leads or customers?',
      helpText: 'Lead generation is a key area where AI excels',
      type: 'single_choice',
      options: [
        { value: 'word_of_mouth', label: 'Mostly word of mouth and referrals', score: 30, aiOpportunity: 'AI lead generation' },
        { value: 'manual', label: 'Manual outreach (calls, emails, networking)', score: 35, aiOpportunity: 'AI prospecting tools' },
        { value: 'basic_digital', label: 'Basic digital marketing (website, social)', score: 50, aiOpportunity: 'AI marketing automation' },
        { value: 'campaigns', label: 'Structured marketing campaigns', score: 65, aiOpportunity: 'AI campaign optimization' },
        { value: 'automated', label: 'Automated lead generation and scoring', score: 85, aiOpportunity: 'Advanced AI personalization' },
      ],
      dimension: 'Growth & Business Development',
      weight: 20,
      tier: ['quick', 'complete', 'advanced'],
      followUpTrigger: {
        condition: 'score < 60',
        prompt: 'User has basic lead generation. Ask: "How many potential leads do you estimate you might be missing each month due to limited outreach capacity?"'
      }
    },
    {
      id: 'gb_02',
      text: 'How personalized is your communication with prospects and customers?',
      helpText: 'Personalization dramatically improves conversion rates',
      type: 'single_choice',
      options: [
        { value: 'same', label: 'Same message to everyone', score: 20, aiOpportunity: 'AI personalization engine' },
        { value: 'segments', label: 'Different messages for broad segments', score: 40, aiOpportunity: 'Advanced segmentation AI' },
        { value: 'semi_personal', label: 'Semi-personalized (name, company, etc.)', score: 55, aiOpportunity: 'AI-driven personalization' },
        { value: 'personal', label: 'Highly personalized based on behavior/history', score: 75, aiOpportunity: 'Predictive personalization' },
        { value: 'ai_driven', label: 'AI-driven personalization at scale', score: 90, aiOpportunity: 'AI optimization' },
      ],
      dimension: 'Growth & Business Development',
      weight: 20,
      tier: ['quick', 'complete', 'advanced'],
    },
    {
      id: 'gb_03',
      text: 'How would you describe your organization\'s attitude toward adopting new technology?',
      helpText: 'This helps us understand your AI readiness',
      type: 'single_choice',
      options: [
        { value: 'resistant', label: 'Very cautious - we prefer proven methods', score: 25, aiOpportunity: 'Low-risk AI pilots' },
        { value: 'careful', label: 'Careful - we adopt after others have tested', score: 40, aiOpportunity: 'Proven AI solutions' },
        { value: 'open', label: 'Open - willing to try new things', score: 60, aiOpportunity: 'Strategic AI adoption' },
        { value: 'eager', label: 'Eager - actively looking for innovations', score: 80, aiOpportunity: 'Comprehensive AI transformation' },
        { value: 'leading', label: 'Leading edge - first to adopt new tech', score: 95, aiOpportunity: 'Cutting-edge AI' },
      ],
      dimension: 'Growth & Business Development',
      weight: 20,
      tier: ['quick', 'complete', 'advanced'],
    },
    {
      id: 'gb_04',
      text: 'How do you currently track your sales pipeline and opportunities?',
      helpText: 'Sales visibility enables AI-powered optimization',
      type: 'single_choice',
      options: [
        { value: 'no_tracking', label: 'We don\'t formally track it', score: 15, aiOpportunity: 'AI-powered CRM setup' },
        { value: 'spreadsheets', label: 'Spreadsheets or documents', score: 30, aiOpportunity: 'CRM + AI analytics' },
        { value: 'basic_crm', label: 'Basic CRM system', score: 50, aiOpportunity: 'AI sales intelligence' },
        { value: 'crm_reports', label: 'CRM with reporting capabilities', score: 70, aiOpportunity: 'Predictive sales AI' },
        { value: 'advanced', label: 'Advanced CRM with automation', score: 85, aiOpportunity: 'AI sales optimization' },
      ],
      dimension: 'Growth & Business Development',
      weight: 20,
      tier: ['complete', 'advanced'],
    },
    {
      id: 'gb_05',
      text: 'What is your biggest challenge in growing your business right now?',
      helpText: 'This helps us identify the most impactful AI solutions for you',
      type: 'multiple_choice',
      options: [
        { value: 'leads', label: 'Finding enough quality leads', score: 40, aiOpportunity: 'AI lead generation' },
        { value: 'conversion', label: 'Converting leads to customers', score: 45, aiOpportunity: 'AI sales enablement' },
        { value: 'retention', label: 'Retaining existing customers', score: 50, aiOpportunity: 'AI customer success' },
        { value: 'capacity', label: 'Scaling operations to meet demand', score: 55, aiOpportunity: 'AI automation' },
        { value: 'competition', label: 'Standing out from competitors', score: 45, aiOpportunity: 'AI differentiation' },
        { value: 'costs', label: 'Managing costs while growing', score: 50, aiOpportunity: 'AI cost optimization' },
      ],
      dimension: 'Growth & Business Development',
      weight: 20,
      tier: ['complete', 'advanced'],
    },
  ]
  
  // ============================================================
  // DIMENSION 5: TEAM PRODUCTIVITY (10% weight)
  // Focus: Employee efficiency, frustrations, time allocation
  // AI Opportunities: Task automation, meeting assistants, knowledge management
  // ============================================================
  
  export const teamProductivityQuestions: AssessmentQuestion[] = [
    {
      id: 'tp_01',
      text: 'What is your team\'s biggest daily frustration?',
      helpText: 'Identifying pain points helps us recommend the right AI solutions',
      type: 'multiple_choice',
      options: [
        { value: 'meetings', label: 'Too many meetings', score: 40, aiOpportunity: 'AI meeting assistant' },
        { value: 'email', label: 'Email overload', score: 35, aiOpportunity: 'AI email management' },
        { value: 'searching', label: 'Finding information / documents', score: 35, aiOpportunity: 'AI knowledge search' },
        { value: 'repetitive', label: 'Repetitive tasks', score: 30, aiOpportunity: 'Task automation' },
        { value: 'coordination', label: 'Coordinating with others', score: 45, aiOpportunity: 'AI collaboration tools' },
        { value: 'interruptions', label: 'Constant interruptions', score: 40, aiOpportunity: 'AI prioritization' },
        { value: 'none', label: 'No major frustrations', score: 80, aiOpportunity: 'Productivity optimization' },
      ],
      dimension: 'Team Productivity',
      weight: 10,
      tier: ['quick', 'complete', 'advanced'],
    },
    {
      id: 'tp_02',
      text: 'If AI could free up 20 hours per week for your team, what would you focus on?',
      helpText: 'This reveals your strategic priorities',
      type: 'multiple_choice',
      options: [
        { value: 'customers', label: 'More time with customers', score: 70, aiOpportunity: 'Customer-facing AI' },
        { value: 'strategy', label: 'Strategic planning and innovation', score: 75, aiOpportunity: 'AI insights for strategy' },
        { value: 'quality', label: 'Improving quality of work', score: 70, aiOpportunity: 'AI quality assurance' },
        { value: 'growth', label: 'Business development and sales', score: 70, aiOpportunity: 'AI sales tools' },
        { value: 'training', label: 'Training and development', score: 65, aiOpportunity: 'AI learning assistant' },
        { value: 'personal', label: 'Better work-life balance', score: 60, aiOpportunity: 'Workload AI optimization' },
      ],
      dimension: 'Team Productivity',
      weight: 10,
      tier: ['quick', 'complete', 'advanced'],
    },
    {
      id: 'tp_03',
      text: 'How does your team currently collaborate and share knowledge?',
      helpText: 'Knowledge management is a key AI opportunity',
      type: 'single_choice',
      options: [
        { value: 'informal', label: 'Informally - asking each other', score: 25, aiOpportunity: 'AI knowledge base' },
        { value: 'docs', label: 'Shared documents and folders', score: 40, aiOpportunity: 'AI document search' },
        { value: 'tools', label: 'Collaboration tools (Slack, Teams, etc.)', score: 55, aiOpportunity: 'AI collaboration assistant' },
        { value: 'wiki', label: 'Internal wiki or knowledge base', score: 70, aiOpportunity: 'AI-powered knowledge assistant' },
        { value: 'advanced', label: 'Advanced knowledge management system', score: 85, aiOpportunity: 'AI knowledge optimization' },
      ],
      dimension: 'Team Productivity',
      weight: 10,
      tier: ['complete', 'advanced'],
    },
    {
      id: 'tp_04',
      text: 'How much time do employees spend in meetings each week?',
      helpText: 'Meeting time is often reducible with AI assistance',
      type: 'single_choice',
      options: [
        { value: 'minimal', label: 'Less than 5 hours', score: 80, aiOpportunity: 'Meeting optimization' },
        { value: 'moderate', label: '5-10 hours', score: 60, aiOpportunity: 'AI meeting summaries' },
        { value: 'significant', label: '10-20 hours', score: 40, aiOpportunity: 'AI meeting reduction' },
        { value: 'excessive', label: '20+ hours', score: 20, aiOpportunity: 'Complete meeting transformation' },
      ],
      dimension: 'Team Productivity',
      weight: 10,
      tier: ['complete', 'advanced'],
    },
  ]
  
  // ============================================================
  // DIMENSION 6: CURRENT TECHNOLOGY & AI EXPOSURE (Bonus)
  // Focus: Current tech stack, AI experience, readiness
  // Used for: Understanding starting point, not scoring judgment
  // ============================================================
  
  export const techReadinessQuestions: AssessmentQuestion[] = [
    {
      id: 'tr_01',
      text: 'Have you or your team used any AI tools before?',
      helpText: 'No wrong answer - this helps us understand your starting point',
      type: 'single_choice',
      options: [
        { value: 'no', label: 'No, this is all new to us', score: 30, aiOpportunity: 'AI introduction program' },
        { value: 'personal', label: 'Yes, for personal use (ChatGPT, etc.)', score: 50, aiOpportunity: 'Business AI adoption' },
        { value: 'limited', label: 'Yes, limited business use', score: 65, aiOpportunity: 'Expanded AI adoption' },
        { value: 'regular', label: 'Yes, regularly in our work', score: 80, aiOpportunity: 'Advanced AI solutions' },
        { value: 'extensive', label: 'Yes, AI is core to our operations', score: 95, aiOpportunity: 'AI optimization' },
      ],
      dimension: 'Technology Readiness',
      weight: 0, // Informational, not scored
      tier: ['quick', 'complete', 'advanced'],
    },
    {
      id: 'tr_02',
      text: 'What business software do you currently use?',
      helpText: 'This helps us understand integration possibilities',
      type: 'multiple_choice',
      options: [
        { value: 'email', label: 'Email (Gmail, Outlook)', score: 50, aiOpportunity: 'Email AI integration' },
        { value: 'crm', label: 'CRM (Salesforce, HubSpot, Zoho)', score: 60, aiOpportunity: 'CRM AI enhancement' },
        { value: 'accounting', label: 'Accounting (Tally, QuickBooks, Zoho)', score: 55, aiOpportunity: 'Finance AI' },
        { value: 'erp', label: 'ERP system', score: 65, aiOpportunity: 'ERP AI integration' },
        { value: 'ecommerce', label: 'E-commerce platform', score: 60, aiOpportunity: 'E-commerce AI' },
        { value: 'project', label: 'Project management (Asana, Monday, etc.)', score: 55, aiOpportunity: 'Project AI' },
        { value: 'basic', label: 'Mostly basic tools (spreadsheets, etc.)', score: 35, aiOpportunity: 'Digital transformation + AI' },
      ],
      dimension: 'Technology Readiness',
      weight: 0,
      tier: ['complete', 'advanced'],
    },
    {
      id: 'tr_03',
      text: 'What is your biggest concern about adopting AI?',
      helpText: 'Understanding concerns helps us address them properly',
      type: 'multiple_choice',
      options: [
        { value: 'cost', label: 'Cost of implementation', score: 50, aiOpportunity: 'ROI-focused AI' },
        { value: 'complexity', label: 'Complexity and learning curve', score: 45, aiOpportunity: 'User-friendly AI' },
        { value: 'job_loss', label: 'Impact on employees / job security', score: 40, aiOpportunity: 'Augmentation-focused AI' },
        { value: 'security', label: 'Data security and privacy', score: 55, aiOpportunity: 'Secure AI solutions' },
        { value: 'reliability', label: 'Reliability and accuracy', score: 50, aiOpportunity: 'Proven AI solutions' },
        { value: 'integration', label: 'Integration with existing systems', score: 55, aiOpportunity: 'Seamless AI integration' },
        { value: 'none', label: 'No major concerns', score: 80, aiOpportunity: 'Comprehensive AI adoption' },
      ],
      dimension: 'Technology Readiness',
      weight: 0,
      tier: ['complete', 'advanced'],
    },
  ]
  
  // ============================================================
  // STRATEGIC OPEN-ENDED QUESTIONS (For Complete & Advanced tiers)
  // These capture qualitative insights for AI follow-up generation
  // ============================================================
  
  export const openEndedQuestions: AssessmentQuestion[] = [
    {
      id: 'open_01',
      text: 'What is the biggest operational challenge your organization faces right now?',
      helpText: 'Be as specific as possible - this helps us identify the best AI solutions for you',
      type: 'open_text',
      dimension: 'Strategic',
      weight: 0,
      tier: ['quick', 'complete', 'advanced'],
      followUpTrigger: {
        condition: 'always',
        prompt: 'Based on the user\'s challenge, generate 2 clarifying questions to better understand the scope, impact, and current attempts to solve it.'
      }
    },
    {
      id: 'open_02',
      text: 'If you could automate one thing in your business tomorrow, what would it be?',
      helpText: 'Think about what would have the biggest positive impact',
      type: 'open_text',
      dimension: 'Strategic',
      weight: 0,
      tier: ['complete', 'advanced'],
    },
    {
      id: 'open_03',
      text: 'What does success look like for your organization in the next 12 months?',
      helpText: 'This helps us align AI recommendations with your goals',
      type: 'open_text',
      dimension: 'Strategic',
      weight: 0,
      tier: ['advanced'],
    },
  ]
  
  // ============================================================
  // HELPER FUNCTIONS
  // ============================================================
  
  /**
   * Get questions for a specific tier
   */
  export function getQuestionsForTier(tier: 'quick' | 'complete' | 'advanced'): AssessmentQuestion[] {
    const allQuestions = [
      ...customerExperienceQuestions,
      ...operationalEfficiencyQuestions,
      ...dataDecisionQuestions,
      ...growthBusinessQuestions,
      ...teamProductivityQuestions,
      ...techReadinessQuestions,
      ...openEndedQuestions,
    ]
    
    return allQuestions.filter(q => q.tier.includes(tier))
  }
  
  /**
   * Get question counts by tier
   */
  export function getQuestionCounts() {
    return {
      quick: getQuestionsForTier('quick').length,
      complete: getQuestionsForTier('complete').length,
      advanced: getQuestionsForTier('advanced').length,
    }
  }
  
  /**
   * Get dimensions with their weights
   */
  export function getDimensions() {
    return [
      { id: 'customer_experience', name: 'Customer Experience', weight: 25, color: '#22C55E' },
      { id: 'operational_efficiency', name: 'Operational Efficiency', weight: 25, color: '#3B82F6' },
      { id: 'data_decisions', name: 'Data & Decisions', weight: 20, color: '#8B5CF6' },
      { id: 'growth_business', name: 'Growth & Business Development', weight: 20, color: '#F59E0B' },
      { id: 'team_productivity', name: 'Team Productivity', weight: 10, color: '#EC4899' },
    ]
  }
  
  // Export all for easy access
  export const allQuestions = {
    customerExperience: customerExperienceQuestions,
    operationalEfficiency: operationalEfficiencyQuestions,
    dataDecisions: dataDecisionQuestions,
    growthBusiness: growthBusinessQuestions,
    teamProductivity: teamProductivityQuestions,
    techReadiness: techReadinessQuestions,
    openEnded: openEndedQuestions,
  }
  
  // Question count summary
  console.log('Question Bank Summary:')
  console.log('- Quick Pulse:', getQuestionsForTier('quick').length, 'questions')
  console.log('- Complete:', getQuestionsForTier('complete').length, 'questions')
  console.log('- Advanced:', getQuestionsForTier('advanced').length, 'questions')