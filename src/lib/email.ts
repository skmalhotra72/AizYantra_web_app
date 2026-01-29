import { createClient } from '@/lib/supabase/server'

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string
  subject: string
  html: string
  text?: string
}) {
  // For now, we'll use Supabase's email service
  // Later, you can integrate SendGrid, Resend, etc.
  
  const supabase = createClient()
  
  // Store email in database for tracking
  const { error } = await supabase
    .from('email_log')
    .insert({
      to_email: to,
      subject: subject,
      html_content: html,
      text_content: text,
      status: 'sent',
      sent_at: new Date().toISOString()
    })

  if (error) {
    console.error('Error logging email:', error)
  }

  // TODO: Integrate with SendGrid or Resend for transactional emails
  return { success: true }
}

// Email templates
export const emailTemplates = {
  i2eWelcome: (name: string, applicationNumber: string) => ({
    subject: `Welcome to AIzYantra I2E Evaluation - ${applicationNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #14b8a6;">Welcome to AIzYantra I2E Evaluation!</h2>
        <p>Hi ${name},</p>
        <p>Thank you for submitting your startup idea for evaluation. Your application number is: <strong>${applicationNumber}</strong></p>
        <p>What happens next:</p>
        <ol>
          <li><strong>Stage 2-5 AI Evaluation</strong> (3-5 days): Our AI will analyze your idea across multiple dimensions</li>
          <li><strong>Stage 6 Panel Review</strong> (2-3 days): Our 8 co-founders will review and vote</li>
          <li><strong>Final Score & MVP Offer</strong> (1-2 days): You'll receive your score (0-100) and personalized MVP pricing</li>
        </ol>
        <p>You can track your evaluation progress at: <a href="http://localhost:3000/portal/dashboard">Your Dashboard</a></p>
        <p>Have questions? Reply to this email or call us at +91 98765 43210.</p>
        <br>
        <p>Best regards,<br><strong>Sanjeev Malhotra</strong><br>CEO, AIzYantra<br>support@aizyantra.com</p>
      </div>
    `,
    text: `Hi ${name}, Thank you for submitting your startup idea for evaluation...`
  }),

  i2eStageComplete: (name: string, stageName: string, score: number) => ({
    subject: `I2E Update: ${stageName} Complete - Score: ${score}/100`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #14b8a6;">Evaluation Update</h2>
        <p>Hi ${name},</p>
        <p>Great news! We've completed <strong>${stageName}</strong> for your idea.</p>
        <p><strong>Score: ${score}/100</strong></p>
        <p>View detailed feedback: <a href="http://localhost:3000/portal/i2e-evaluation">View Results</a></p>
        <p>Next stage will begin shortly.</p>
        <br>
        <p>Best regards,<br>The AIzYantra Team</p>
      </div>
    `
  }),

  i2eFinalResults: (name: string, finalScore: number, mvpPrice: number, equity: number) => ({
    subject: `Your I2E Results Are Ready! Score: ${finalScore}/100`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #14b8a6;">🎉 Your I2E Evaluation is Complete!</h2>
        <p>Hi ${name},</p>
        <p>We've completed our comprehensive evaluation of your startup idea.</p>
        <div style="background: #f0fdfa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Final Score: ${finalScore}/100</h3>
          <p><strong>MVP Offer:</strong></p>
          <ul>
            <li>Pay: $${mvpPrice.toLocaleString()}</li>
            <li>Equity: ${equity}%</li>
            <li>Includes: Production-ready MVP + 12-month Virtual CTO + Board Seat</li>
          </ul>
        </div>
        <p><a href="http://localhost:3000/portal/i2e-evaluation/results" style="display: inline-block; background: #14b8a6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Full Results & Accept Offer</a></p>
        <p>Want to discuss? Book a call: <a href="https://calendly.com/aizyantra">Schedule Call</a></p>
        <br>
        <p>Best regards,<br><strong>Sanjeev Malhotra</strong><br>CEO, AIzYantra</p>
      </div>
    `
  })
}