import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ideaId = searchParams.get('ideaId')
    const format = searchParams.get('format') || 'full' // 'full' or 'elevator'

    if (!ideaId) {
      return NextResponse.json({ error: 'ideaId is required' }, { status: 400 })
    }

    // Fetch idea
    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .select('*')
      .eq('id', ideaId)
      .single()

    if (ideaError || !idea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 })
    }

    // Fetch pitch deck evaluation
    const { data: pitchDeckEval, error: evalError } = await supabase
      .from('ai_evaluations')
      .select('*')
      .eq('idea_id', ideaId)
      .eq('stage_number', 6)
      .single()

    if (evalError || !pitchDeckEval) {
      return NextResponse.json({ error: 'Pitch deck not found' }, { status: 404 })
    }

    const pitchDeck = pitchDeckEval.result_data

    // Generate HTML content
    const htmlContent = format === 'elevator' 
      ? generateElevatorPitchHTML(idea, pitchDeck)
      : generateFullPitchDeckHTML(idea, pitchDeck)

    // Return HTML that can be printed to PDF
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="${idea.title.replace(/[^a-zA-Z0-9]/g, '_')}_${format === 'elevator' ? 'Elevator_Pitch' : 'Pitch_Deck'}.html"`
      }
    })

  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'PDF generation failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

function generateFullPitchDeckHTML(idea: any, pitchDeck: any): string {
  const slides = pitchDeck.slides || []
  const keyMetrics = pitchDeck.keyMetrics || []

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${idea.title} - Pitch Deck</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', sans-serif;
      background: #0a0a0a;
      color: #ffffff;
      line-height: 1.6;
    }
    
    .page {
      width: 100%;
      min-height: 100vh;
      padding: 40px;
      page-break-after: always;
      background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
    }
    
    .page:last-child {
      page-break-after: avoid;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #FF6B35;
    }
    
    .logo {
      font-size: 24px;
      font-weight: 700;
      color: #FF6B35;
    }
    
    .stage-badge {
      background: #FF6B35;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }
    
    .title-page {
      text-align: center;
      padding-top: 100px;
    }
    
    .title-page h1 {
      font-size: 48px;
      font-weight: 700;
      margin-bottom: 20px;
      color: #ffffff;
    }
    
    .one-liner {
      font-size: 24px;
      color: #FF6B35;
      font-style: italic;
      margin-bottom: 40px;
      padding: 20px;
      border-left: 4px solid #FF6B35;
      background: rgba(255, 107, 53, 0.1);
      text-align: left;
      max-width: 800px;
      margin-left: auto;
      margin-right: auto;
    }
    
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-top: 40px;
    }
    
    .metric-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 24px;
      text-align: center;
    }
    
    .metric-value {
      font-size: 32px;
      font-weight: 700;
      color: #FF6B35;
    }
    
    .metric-label {
      font-size: 14px;
      color: #888;
      margin-top: 8px;
    }
    
    .slide {
      margin-bottom: 40px;
    }
    
    .slide-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }
    
    .slide-number {
      width: 40px;
      height: 40px;
      background: #FF6B35;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 18px;
    }
    
    .slide-title {
      font-size: 14px;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .slide h2 {
      font-size: 36px;
      font-weight: 700;
      margin-bottom: 24px;
      color: #ffffff;
    }
    
    .key-points {
      list-style: none;
      margin-bottom: 24px;
    }
    
    .key-points li {
      padding: 12px 0;
      padding-left: 30px;
      position: relative;
      font-size: 18px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .key-points li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #FF6B35;
      font-weight: bold;
    }
    
    .slide-footer {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .slide-meta {
      background: rgba(255, 255, 255, 0.03);
      padding: 16px;
      border-radius: 8px;
    }
    
    .slide-meta-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    
    .slide-meta-value {
      font-size: 14px;
      color: #aaa;
    }
    
    .speaker-notes {
      background: rgba(255, 107, 53, 0.1);
      border-left: 4px solid #FF6B35;
      padding: 16px;
      margin-top: 24px;
      border-radius: 0 8px 8px 0;
    }
    
    .speaker-notes-label {
      font-size: 12px;
      color: #FF6B35;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    
    .speaker-notes-text {
      font-size: 14px;
      color: #ccc;
      font-style: italic;
    }
    
    .executive-summary {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 32px;
      margin-top: 40px;
    }
    
    .executive-summary h3 {
      font-size: 24px;
      margin-bottom: 16px;
      color: #FF6B35;
    }
    
    .executive-summary p {
      font-size: 16px;
      color: #ccc;
      line-height: 1.8;
    }
    
    .footer {
      text-align: center;
      padding: 20px;
      color: #666;
      font-size: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      margin-top: 40px;
    }
    
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .page {
        page-break-after: always;
      }
    }
  </style>
</head>
<body>
  <!-- Title Page -->
  <div class="page title-page">
    <div class="header">
      <div class="logo">AIzYantra</div>
      <div class="stage-badge">I2E Innovation Pipeline</div>
    </div>
    
    <h1>${idea.title}</h1>
    
    <div class="one-liner">"${pitchDeck.oneLinePitch}"</div>
    
    <div class="metrics-grid">
      ${keyMetrics.map((m: any) => `
        <div class="metric-card">
          <div class="metric-value">${m.value}</div>
          <div class="metric-label">${m.label}</div>
        </div>
      `).join('')}
    </div>
    
    <div class="executive-summary">
      <h3>Executive Summary</h3>
      <p>${pitchDeck.executiveSummary}</p>
    </div>
  </div>
  
  <!-- Slides -->
  ${slides.map((slide: any, index: number) => `
    <div class="page">
      <div class="header">
        <div class="logo">AIzYantra</div>
        <div class="stage-badge">Slide ${index + 1} of ${slides.length}</div>
      </div>
      
      <div class="slide">
        <div class="slide-header">
          <div class="slide-number">${slide.slideNumber}</div>
          <div class="slide-title">${slide.title}</div>
        </div>
        
        <h2>${slide.headline}</h2>
        
        <ul class="key-points">
          ${slide.keyPoints.map((point: string) => `<li>${point}</li>`).join('')}
        </ul>
        
        <div class="slide-footer">
          <div class="slide-meta">
            <div class="slide-meta-label">Visual Suggestion</div>
            <div class="slide-meta-value">${slide.visualSuggestion}</div>
          </div>
          <div class="slide-meta">
            <div class="slide-meta-label">Data Source</div>
            <div class="slide-meta-value">${slide.dataSource}</div>
          </div>
        </div>
        
        <div class="speaker-notes">
          <div class="speaker-notes-label">Speaker Notes</div>
          <div class="speaker-notes-text">${slide.speakerNotes}</div>
        </div>
      </div>
    </div>
  `).join('')}
  
  <div class="footer">
    Generated by AIzYantra I2E Innovation Pipeline | ${new Date().toLocaleDateString()}
  </div>
</body>
</html>
`
}

function generateElevatorPitchHTML(idea: any, pitchDeck: any): string {
  const keyMetrics = pitchDeck.keyMetrics || []

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${idea.title} - Elevator Pitch</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', sans-serif;
      background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
      color: #ffffff;
      min-height: 100vh;
      padding: 60px;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #FF6B35;
    }
    
    .logo {
      font-size: 28px;
      font-weight: 700;
      color: #FF6B35;
    }
    
    .badge {
      background: #FF6B35;
      color: white;
      padding: 10px 20px;
      border-radius: 25px;
      font-size: 14px;
      font-weight: 600;
    }
    
    h1 {
      font-size: 42px;
      font-weight: 700;
      margin-bottom: 16px;
      color: #ffffff;
    }
    
    .one-liner {
      font-size: 20px;
      color: #FF6B35;
      font-style: italic;
      margin-bottom: 40px;
      padding: 20px;
      border-left: 4px solid #FF6B35;
      background: rgba(255, 107, 53, 0.1);
    }
    
    .metrics {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 40px;
    }
    
    .metric {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 20px;
      text-align: center;
    }
    
    .metric-value {
      font-size: 28px;
      font-weight: 700;
      color: #FF6B35;
    }
    
    .metric-label {
      font-size: 12px;
      color: #888;
      margin-top: 8px;
    }
    
    .elevator-pitch {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 16px;
      padding: 40px;
      margin-bottom: 40px;
    }
    
    .elevator-pitch h2 {
      font-size: 24px;
      color: #FF6B35;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .elevator-pitch h2:before {
      content: "⏱️";
    }
    
    .elevator-pitch p {
      font-size: 18px;
      line-height: 1.8;
      color: #ddd;
      font-style: italic;
    }
    
    .summary {
      background: rgba(255, 107, 53, 0.1);
      border-left: 4px solid #FF6B35;
      padding: 30px;
      border-radius: 0 12px 12px 0;
    }
    
    .summary h3 {
      font-size: 20px;
      color: #FF6B35;
      margin-bottom: 16px;
    }
    
    .summary p {
      font-size: 16px;
      line-height: 1.8;
      color: #ccc;
    }
    
    .footer {
      text-align: center;
      padding-top: 40px;
      color: #666;
      font-size: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      margin-top: 40px;
    }
    
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">AIzYantra</div>
      <div class="badge">60-Second Elevator Pitch</div>
    </div>
    
    <h1>${idea.title}</h1>
    
    <div class="one-liner">"${pitchDeck.oneLinePitch}"</div>
    
    <div class="metrics">
      ${keyMetrics.map((m: any) => `
        <div class="metric">
          <div class="metric-value">${m.value}</div>
          <div class="metric-label">${m.label}</div>
        </div>
      `).join('')}
    </div>
    
    <div class="elevator-pitch">
      <h2>60-Second Elevator Pitch</h2>
      <p>${pitchDeck.elevatorPitch}</p>
    </div>
    
    <div class="summary">
      <h3>Executive Summary</h3>
      <p>${pitchDeck.executiveSummary}</p>
    </div>
    
    <div class="footer">
      Generated by AIzYantra I2E Innovation Pipeline | ${new Date().toLocaleDateString()}
    </div>
  </div>
</body>
</html>
`
}