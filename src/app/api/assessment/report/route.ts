import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

// Extend jsPDF type for autoTable
interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable: { finalY: number }
}

// Color palette
const colors = {
  primary: [255, 107, 53] as [number, number, number],      // International Orange
  secondary: [59, 130, 246] as [number, number, number],    // Blue
  dark: [30, 30, 35] as [number, number, number],           // Dark grey
  muted: [100, 100, 110] as [number, number, number],       // Muted grey
  light: [245, 245, 250] as [number, number, number],       // Light background
  success: [34, 197, 94] as [number, number, number],       // Green
  warning: [245, 158, 11] as [number, number, number],      // Amber
}

// Maturity level colors
const maturityColors: Record<string, [number, number, number]> = {
  'AI Newcomer': [239, 68, 68],
  'AI Aware': [245, 158, 11],
  'AI Curious': [59, 130, 246],
  'AI Ready': [34, 197, 94],
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const assessmentId = searchParams.get('id')

    if (!assessmentId) {
      return NextResponse.json({ error: 'Assessment ID required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Fetch assessment data
    const { data: assessment, error: assessmentError } = await supabase
      .from('ai_assessments')
      .select('*')
      .eq('id', assessmentId)
      .single()

    if (assessmentError || !assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    // Fetch responses
    const { data: responses } = await supabase
      .from('assessment_responses')
      .select('*')
      .eq('assessment_id', assessmentId)

    // Generate PDF
    const pdfBytes = await generatePDF(assessment, responses || [])

    // Return PDF
    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="AI-Readiness-Report-${assessment.company_name.replace(/[^a-z0-9]/gi, '-')}.pdf"`,
      },
    })

  } catch (error: any) {
    console.error('PDF generation error:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}

async function generatePDF(assessment: any, responses: any[]): Promise<Uint8Array> {
  const doc = new jsPDF('p', 'mm', 'a4') as jsPDFWithAutoTable
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - (margin * 2)
  
  let yPos = margin

  // Helper function to add new page if needed
  const checkNewPage = (requiredSpace: number) => {
    if (yPos + requiredSpace > pageHeight - margin) {
      doc.addPage()
      yPos = margin
      return true
    }
    return false
  }

  // ============================================
  // COVER PAGE
  // ============================================
  
  // Header gradient bar
  doc.setFillColor(...colors.primary)
  doc.rect(0, 0, pageWidth, 45, 'F')
  
  // AIzYantra Logo/Brand
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(28)
  doc.setFont('helvetica', 'bold')
  doc.text('AIzYantra', margin, 28)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('INTELLIGENCE • ENGINEERED', margin, 36)

  // Report title
  yPos = 70
  doc.setTextColor(...colors.dark)
  doc.setFontSize(32)
  doc.setFont('helvetica', 'bold')
  doc.text('AI Readiness', margin, yPos)
  yPos += 14
  doc.text('Assessment Report', margin, yPos)
  
  // Company name
  yPos += 20
  doc.setFontSize(18)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...colors.muted)
  doc.text('Prepared for', margin, yPos)
  
  yPos += 12
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...colors.dark)
  doc.text(assessment.company_name || 'Your Company', margin, yPos)
  
  // Assessment info box
  yPos += 25
  doc.setFillColor(...colors.light)
  doc.roundedRect(margin, yPos, contentWidth, 40, 3, 3, 'F')
  
  doc.setFontSize(10)
  doc.setTextColor(...colors.muted)
  doc.text('Assessment Type', margin + 10, yPos + 12)
  doc.text('Industry', margin + 60, yPos + 12)
  doc.text('Completed', margin + 120, yPos + 12)
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...colors.dark)
  const tierName = assessment.tier === 'quick' ? 'Quick Pulse' : assessment.tier === 'complete' ? 'Complete Analysis' : 'Deep Dive'
  doc.text(tierName, margin + 10, yPos + 24)
  doc.text(assessment.industry || 'General', margin + 60, yPos + 24)
  const completedDate = assessment.completed_at ? new Date(assessment.completed_at).toLocaleDateString() : 'In Progress'
  doc.text(completedDate, margin + 120, yPos + 24)

  // Overall Score Circle
  yPos += 60
  const scoreBoxY = yPos
  const scoreBoxHeight = 80
  
  // Score display
  doc.setFillColor(...colors.light)
  doc.roundedRect(margin, yPos, contentWidth, scoreBoxHeight, 3, 3, 'F')
  
  // Score circle
  const circleX = margin + 45
  const circleY = yPos + scoreBoxHeight / 2
  const circleR = 28
  
  // Background circle
  doc.setDrawColor(220, 220, 225)
  doc.setLineWidth(6)
  doc.circle(circleX, circleY, circleR, 'S')
  
  // Score arc (simplified - just show the score number prominently)
  const maturityLevel = assessment.maturity_level || 'AI Newcomer'
  const maturityColor = maturityColors[maturityLevel] || colors.warning
  doc.setDrawColor(...maturityColor)
  doc.setLineWidth(6)
  // Draw partial circle based on score
  const score = assessment.overall_score || 0
  
  // Score number
  doc.setFontSize(36)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...colors.dark)
  doc.text(String(score), circleX, circleY + 4, { align: 'center' })
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...colors.muted)
  doc.text('out of 100', circleX, circleY + 14, { align: 'center' })
  
  // Maturity level
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...maturityColor)
  doc.text(maturityLevel, margin + 100, circleY - 5)
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...colors.muted)
  const maturityDesc = getMaturityDescription(maturityLevel)
  doc.text(maturityDesc, margin + 100, circleY + 8)
  
  doc.setFontSize(10)
  doc.text(`Based on ${responses.length} responses`, margin + 100, circleY + 20)

  // ============================================
  // PAGE 2: EXECUTIVE SUMMARY & COMPANY RESEARCH
  // ============================================
  doc.addPage()
  yPos = margin
  
  // Page header
  addPageHeader(doc, 'Executive Summary', pageWidth, margin)
  yPos = 45
  
  // Company Research Section
  const companyResearch = assessment.company_research_data
  if (companyResearch) {
    doc.setFillColor(...colors.light)
    doc.roundedRect(margin, yPos, contentWidth, 60, 3, 3, 'F')
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...colors.dark)
    doc.text(`About ${assessment.company_name}`, margin + 5, yPos + 12)
    
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...colors.muted)
    
    // Split overview text to fit
    const overview = companyResearch.company_overview || ''
    const overviewLines = doc.splitTextToSize(overview, contentWidth - 10)
    doc.text(overviewLines.slice(0, 4), margin + 5, yPos + 24)
    
    if (companyResearch.industry_position) {
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...colors.secondary)
      doc.text(`Market Position: ${companyResearch.industry_position}`, margin + 5, yPos + 52)
    }
    
    yPos += 70
  }

  // Key Findings Box
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...colors.dark)
  doc.text('Key Findings', margin, yPos)
  yPos += 8
  
  const dimensionScores = assessment.dimension_scores || {}
  const sortedDimensions = Object.entries(dimensionScores)
    .sort(([, a], [, b]) => (b as number) - (a as number))
  
  // Highest scoring dimension
  if (sortedDimensions.length > 0) {
    const [topDim, topScore] = sortedDimensions[0]
    const [lowDim, lowScore] = sortedDimensions[sortedDimensions.length - 1]
    
    // Strength
    doc.setFillColor(34, 197, 94, 0.1)
    doc.roundedRect(margin, yPos, contentWidth / 2 - 5, 35, 2, 2, 'F')
    doc.setFontSize(9)
    doc.setTextColor(...colors.success)
    doc.setFont('helvetica', 'bold')
    doc.text('TOP STRENGTH', margin + 5, yPos + 10)
    doc.setFontSize(11)
    doc.setTextColor(...colors.dark)
    doc.text(topDim, margin + 5, yPos + 22)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(`${topScore}`, margin + 5, yPos + 32)
    
    // Opportunity
    doc.setFillColor(245, 158, 11, 0.1)
    doc.roundedRect(margin + contentWidth / 2 + 5, yPos, contentWidth / 2 - 5, 35, 2, 2, 'F')
    doc.setFontSize(9)
    doc.setTextColor(...colors.warning)
    doc.setFont('helvetica', 'bold')
    doc.text('TOP OPPORTUNITY', margin + contentWidth / 2 + 10, yPos + 10)
    doc.setFontSize(11)
    doc.setTextColor(...colors.dark)
    doc.text(lowDim, margin + contentWidth / 2 + 10, yPos + 22)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(`${lowScore}`, margin + contentWidth / 2 + 10, yPos + 32)
  }
  
  yPos += 45

  // ============================================
  // DIMENSION SCORES TABLE
  // ============================================
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...colors.dark)
  doc.text('Dimension Breakdown', margin, yPos)
  yPos += 5

  // Industry benchmarks
  const benchmarks: Record<string, number> = getBenchmarks(assessment.industry)
  
  const dimensionData = Object.entries(dimensionScores).map(([dimension, score]) => {
    const benchmark = benchmarks[dimension] || 45
    const diff = (score as number) - benchmark
    const diffText = diff > 0 ? `+${diff}` : String(diff)
    return [
      dimension,
      String(score),
      String(benchmark),
      diffText,
      getScoreLevel(score as number)
    ]
  })

  autoTable(doc, {
    startY: yPos,
    head: [['Dimension', 'Score', 'Industry Avg', 'vs Benchmark', 'Level']],
    body: dimensionData,
    theme: 'striped',
    headStyles: {
      fillColor: colors.primary,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: colors.dark,
    },
    columnStyles: {
      0: { cellWidth: 55 },
      1: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
      2: { cellWidth: 25, halign: 'center' },
      3: { cellWidth: 30, halign: 'center' },
      4: { cellWidth: 30, halign: 'center' },
    },
    margin: { left: margin, right: margin },
  })

  yPos = doc.lastAutoTable.finalY + 15

  // ============================================
  // PAGE 3: STRENGTHS & AI OPPORTUNITIES
  // ============================================
  checkNewPage(100)
  if (yPos === margin) {
    addPageHeader(doc, 'Strengths & Opportunities', pageWidth, margin)
    yPos = 45
  } else {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...colors.dark)
    doc.text('Identified Strengths', margin, yPos)
    yPos += 8
  }

  // Strengths from research
  if (companyResearch?.strengths) {
    companyResearch.strengths.slice(0, 4).forEach((strength: string, index: number) => {
      checkNewPage(15)
      doc.setFillColor(...colors.light)
      doc.roundedRect(margin, yPos, contentWidth, 12, 2, 2, 'F')
      
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...colors.dark)
      
      // Checkmark
      doc.setTextColor(...colors.success)
      doc.text('✓', margin + 4, yPos + 8)
      
      doc.setTextColor(...colors.dark)
      const strengthText = doc.splitTextToSize(strength, contentWidth - 15)
      doc.text(strengthText[0], margin + 12, yPos + 8)
      
      yPos += 15
    })
  }

  yPos += 10
  checkNewPage(80)

  // AI Opportunities
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...colors.dark)
  doc.text('AI Transformation Opportunities', margin, yPos)
  yPos += 10

  const opportunities = getAIOpportunities(dimensionScores, assessment.industry)
  opportunities.forEach((opp, index) => {
    checkNewPage(25)
    
    doc.setFillColor(...colors.light)
    doc.roundedRect(margin, yPos, contentWidth, 22, 2, 2, 'F')
    
    // Number badge
    doc.setFillColor(...colors.primary)
    doc.circle(margin + 8, yPos + 11, 5, 'F')
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text(String(index + 1), margin + 8, yPos + 13, { align: 'center' })
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...colors.dark)
    doc.text(opp.title, margin + 18, yPos + 9)
    
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...colors.muted)
    doc.text(opp.impact, margin + 18, yPos + 18)
    
    yPos += 26
  })

  // ============================================
  // PAGE 4: RECOMMENDATIONS
  // ============================================
  doc.addPage()
  yPos = margin
  addPageHeader(doc, 'AIzYantra Recommendations', pageWidth, margin)
  yPos = 45

  const recommendations = getRecommendations(assessment.overall_score, dimensionScores, assessment.company_name)
  
  recommendations.forEach((rec, index) => {
    checkNewPage(45)
    
    // Recommendation box
    const boxColor = rec.tier === 'Quick Win' ? colors.success : rec.tier === 'Strategic' ? colors.secondary : colors.primary
    
    doc.setFillColor(...colors.light)
    doc.roundedRect(margin, yPos, contentWidth, 40, 3, 3, 'F')
    
    // Tier badge
    doc.setFillColor(...boxColor)
    doc.roundedRect(margin + 5, yPos + 5, 25, 8, 2, 2, 'F')
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text(rec.tier, margin + 17.5, yPos + 10.5, { align: 'center' })
    
    // Title
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...colors.dark)
    doc.text(rec.title, margin + 35, yPos + 11)
    
    // Description
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...colors.muted)
    const descLines = doc.splitTextToSize(rec.description, contentWidth - 15)
    doc.text(descLines.slice(0, 2), margin + 5, yPos + 22)
    
    // Timeline & Investment
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...colors.secondary)
    doc.text(`Timeline: ${rec.timeline}  |  Investment: ${rec.investment}`, margin + 5, yPos + 36)
    
    yPos += 45
  })

  // ============================================
  // LAST PAGE: NEXT STEPS & CTA
  // ============================================
  doc.addPage()
  yPos = margin
  addPageHeader(doc, 'Next Steps', pageWidth, margin)
  yPos = 50

  // CTA Box
  doc.setFillColor(...colors.primary)
  doc.roundedRect(margin, yPos, contentWidth, 50, 5, 5, 'F')
  
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text('Ready to Transform Your Business with AI?', margin + 10, yPos + 18)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Schedule a free consultation with our AI experts to discuss', margin + 10, yPos + 32)
  doc.text('your personalized roadmap and quick-win opportunities.', margin + 10, yPos + 42)
  
  yPos += 65

  // Contact Info
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...colors.dark)
  doc.text('Get in Touch', margin, yPos)
  yPos += 10
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...colors.muted)
  doc.text('🌐  www.aizyantra.com', margin, yPos)
  yPos += 8
  doc.text('📧  hello@aizyantra.com', margin, yPos)
  yPos += 8
  doc.text('📞  +91 99999 99999', margin, yPos)
  yPos += 20

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(...colors.muted)
  doc.text(`Report generated on ${new Date().toLocaleDateString()} by AIzYantra AI Assessment Platform`, margin, pageHeight - 15)
  doc.text(`Assessment ID: ${assessment.id}`, margin, pageHeight - 10)

  // Return PDF as bytes
  return doc.output('arraybuffer') as unknown as Uint8Array
}

// Helper Functions
function addPageHeader(doc: jsPDF, title: string, pageWidth: number, margin: number) {
  doc.setFillColor(...colors.primary)
  doc.rect(0, 0, pageWidth, 30, 'F')
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text('AIzYantra', margin, 12)
  
  doc.setFontSize(14)
  doc.text(title, margin, 24)
}

function getMaturityDescription(level: string): string {
  const descriptions: Record<string, string> = {
    'AI Newcomer': 'Just starting your AI journey - huge potential ahead!',
    'AI Aware': 'Building awareness - ready for quick wins!',
    'AI Curious': 'Actively exploring - time to accelerate!',
    'AI Ready': 'Well-prepared for AI transformation!',
  }
  return descriptions[level] || 'Ready for transformation'
}

function getBenchmarks(industry: string): Record<string, number> {
  const benchmarks: Record<string, Record<string, number>> = {
    'Healthcare & Life Sciences': {
      'Customer Experience': 42,
      'Operational Efficiency': 38,
      'Data & Decisions': 45,
      'Growth & Business Development': 40,
      'Team Productivity': 44
    },
    'Technology & Software': {
      'Customer Experience': 62,
      'Operational Efficiency': 58,
      'Data & Decisions': 68,
      'Growth & Business Development': 60,
      'Team Productivity': 55
    },
    // Add more industries...
  }
  return benchmarks[industry] || {
    'Customer Experience': 45,
    'Operational Efficiency': 45,
    'Data & Decisions': 48,
    'Growth & Business Development': 45,
    'Team Productivity': 45
  }
}

function getScoreLevel(score: number): string {
  if (score >= 70) return 'Strong'
  if (score >= 50) return 'Developing'
  if (score >= 30) return 'Emerging'
  return 'Beginning'
}

function getAIOpportunities(dimensionScores: Record<string, number>, industry: string) {
  const opportunities = []
  
  if ((dimensionScores['Customer Experience'] || 0) < 60) {
    opportunities.push({
      title: 'AI-Powered Customer Support',
      impact: 'Reduce response time by 80%, enable 24/7 availability'
    })
  }
  
  if ((dimensionScores['Operational Efficiency'] || 0) < 60) {
    opportunities.push({
      title: 'Intelligent Process Automation',
      impact: 'Automate 40-60% of repetitive tasks, reduce errors by 90%'
    })
  }
  
  if ((dimensionScores['Data & Decisions'] || 0) < 70) {
    opportunities.push({
      title: 'AI Analytics & Insights',
      impact: 'Real-time dashboards, predictive analytics, data-driven decisions'
    })
  }
  
  if ((dimensionScores['Growth & Business Development'] || 0) < 70) {
    opportunities.push({
      title: 'AI Sales Intelligence',
      impact: 'Improve lead conversion by 40%, automate outreach'
    })
  }
  
  if ((dimensionScores['Team Productivity'] || 0) < 60) {
    opportunities.push({
      title: 'AI Productivity Suite',
      impact: 'Save 10+ hours/week per employee with AI assistants'
    })
  }
  
  return opportunities.slice(0, 5)
}

function getRecommendations(overallScore: number, dimensionScores: Record<string, number>, companyName: string) {
  const recommendations = []
  
  // Quick Wins
  recommendations.push({
    tier: 'Quick Win',
    title: 'AI Customer Support Chatbot',
    description: `Deploy a 24/7 AI chatbot for ${companyName} to handle common inquiries instantly, reducing response time and improving customer satisfaction.`,
    timeline: '2-4 weeks',
    investment: '₹2-5 Lakhs'
  })
  
  recommendations.push({
    tier: 'Quick Win',
    title: 'Document Processing Automation',
    description: 'Automate invoice processing, form extraction, and document classification to reduce manual data entry by 60%.',
    timeline: '3-4 weeks',
    investment: '₹3-6 Lakhs'
  })
  
  // Strategic
  recommendations.push({
    tier: 'Strategic',
    title: 'AI Analytics Platform',
    description: 'Custom analytics dashboard with real-time KPIs, predictive insights, and automated reporting tailored to your industry.',
    timeline: '6-8 weeks',
    investment: '₹8-15 Lakhs'
  })
  
  recommendations.push({
    tier: 'Strategic',
    title: 'Process Automation Suite',
    description: 'End-to-end workflow automation for your most time-consuming processes, custom-built for your operations.',
    timeline: '6-8 weeks',
    investment: '₹6-12 Lakhs'
  })
  
  // Transformational
  recommendations.push({
    tier: 'Transform',
    title: 'AI Transformation Partnership',
    description: `Comprehensive AI strategy, implementation, and ongoing optimization with AIzYantra as ${companyName}'s Technical Co-Founder.`,
    timeline: '3-6 months',
    investment: '₹25-50 Lakhs'
  })
  
  return recommendations
}