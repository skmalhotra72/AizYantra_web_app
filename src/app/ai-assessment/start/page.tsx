'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  User, Mail, Building2, Phone, Briefcase, Users, ArrowRight, 
  ArrowLeft, Loader2, Sparkles, Clock, FileText, CheckCircle2,
  Zap, BarChart3, Brain, Lock, Shield, ChevronDown
} from 'lucide-react'

// Tier question counts
const tierQuestions = {
  quick: 16,
  complete: 29,
  advanced: 31
}

// Tier configurations
const tierConfig = {
  quick: {
    name: 'Quick Pulse',
    duration: '5-7 minutes',
    questions: '10 questions + AI follow-ups',
    report: '2-page summary report',
    color: '#22C55E',
    gradient: 'from-green-500 to-emerald-500',
    icon: Zap,
    description: 'Get a fast snapshot of your AI readiness with instant insights and top recommendations.',
    features: [
      'Instant AI opportunity score',
      'Top 3 quick-win recommendations',
      'Industry benchmark comparison'
    ]
  },
  complete: {
    name: 'Complete Analysis',
    duration: '20 minutes',
    questions: '28 questions + AI follow-ups',
    report: '10-page comprehensive report',
    color: '#3B82F6',
    gradient: 'from-blue-500 to-indigo-500',
    icon: BarChart3,
    description: 'Get a thorough 7-dimension analysis with detailed recommendations and implementation roadmap.',
    features: [
      'Full 7-dimension deep analysis',
      'Priority matrix (Impact vs Effort)',
      '90-day implementation roadmap',
      'Save progress & resume anytime'
    ]
  },
  advanced: {
    name: 'Deep Dive',
    duration: '45-50 minutes',
    questions: '45 questions + AI follow-ups',
    report: '20+ page executive report',
    color: '#8B5CF6',
    gradient: 'from-purple-500 to-violet-500',
    icon: Brain,
    description: 'Get an executive-grade analysis with document upload, competitive intelligence, and strategic roadmap.',
    features: [
      'Everything in Complete Analysis',
      'Document upload & AI analysis',
      'Competitive intelligence summary',
      'Executive presentation deck',
      'Custom ROI projections'
    ]
  }
}

// Industry options
const industries = [
  'Healthcare & Life Sciences',
  'Financial Services & Banking',
  'Manufacturing & Industrial',
  'Retail & E-commerce',
  'Technology & Software',
  'Professional Services',
  'Education & Training',
  'Real Estate & Construction',
  'Hospitality & Travel',
  'Media & Entertainment',
  'Logistics & Supply Chain',
  'Energy & Utilities',
  'Government & Public Sector',
  'Non-profit & NGO',
  'Other'
]

// Company size options
const companySizes = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '501-1000 employees',
  '1001-5000 employees',
  '5000+ employees'
]

// Role options
const roles = [
  'CEO / Founder',
  'CTO / CIO / CDO',
  'VP / Director of Technology',
  'VP / Director of Operations',
  'VP / Director of Strategy',
  'Department Head / Manager',
  'Consultant / Advisor',
  'Other'
]

function StartFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tierParam = searchParams.get('tier') || 'quick'
  
  // Validate tier
  const tier = ['quick', 'complete', 'advanced'].includes(tierParam) ? tierParam : 'quick'
  const config = tierConfig[tier as keyof typeof tierConfig]
  const TierIcon = config.icon

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    industry: '',
    companySize: '',
    role: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState(1) // 2-step form

  // Calculate total questions based on tier
  const getTotalQuestions = () => {
    switch (tier) {
      case 'quick': return 10
      case 'complete': return 28
      case 'advanced': return 45
      default: return 10
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError(null)
  }

  const validateStep1 = () => {
    if (!formData.fullName.trim()) {
      setError('Please enter your full name')
      return false
    }
    if (!formData.email.trim()) {
      setError('Please enter your email address')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address')
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!formData.companyName.trim()) {
      setError('Please enter your company name')
      return false
    }
    if (!formData.industry) {
      setError('Please select your industry')
      return false
    }
    if (!formData.companySize) {
      setError('Please select your company size')
      return false
    }
    return true
  }

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep2()) return
    
    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()
      
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser()

      // Create assessment in database
      const { data: assessment, error: insertError } = await supabase
        .from('ai_assessments')
        .insert({
          tier: tier,
          total_questions: tierQuestions[tier as keyof typeof tierQuestions],
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone || null,
          role: formData.role || null,
          company_name: formData.companyName,
          industry: formData.industry,
          company_size: formData.companySize,
          status: 'in_progress',
          current_question: 0,
          completion_percentage: 0,
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Trigger company research in the background (don't wait for it)
      console.log('Triggering research for:', formData.companyName, 'Assessment ID:', assessment.id)

      fetch('/api/assessment/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: formData.companyName,
          industry: formData.industry,
          assessment_id: assessment.id
        })
      })
        .then(res => res.json())
        .then(data => console.log('Research response:', data))
        .catch(err => console.error('Research trigger failed:', err))

      // Redirect to assessment immediately (research happens in background)
      router.push(`/ai-assessment/assessment?id=${assessment.id}`)
      
    } catch (err: any) {
      console.error('Error starting assessment:', err)
      setError(err.message || 'Failed to start assessment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(var(--bg-primary))] via-[hsl(var(--bg-secondary))] to-[hsl(var(--bg-primary))]">
      {/* Header */}
      <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))]/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/ai-assessment" className="inline-flex items-center gap-2 text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--foreground))] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Assessment Options</span>
          </Link>
          <div className="flex items-center gap-2">
            <TierIcon className="w-5 h-5" style={{ color: config.color }} />
            <span className="font-semibold text-[hsl(var(--foreground))]">{config.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-5 gap-8">
          
          {/* Left Column - Form */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-2xl p-8"
            >
              {/* Progress indicator */}
              <div className="flex items-center gap-3 mb-8">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= 1 ? `bg-gradient-to-r ${config.gradient} text-white` : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--foreground-muted))]'
                }`}>
                  1
                </div>
                <div className={`flex-1 h-1 rounded-full ${step >= 2 ? `bg-gradient-to-r ${config.gradient}` : 'bg-[hsl(var(--border))]'}`} />
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= 2 ? `bg-gradient-to-r ${config.gradient} text-white` : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--foreground-muted))]'
                }`}>
                  2
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Step 1: Personal Info */}
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-2">
                      Let's get started
                    </h2>
                    <p className="text-[hsl(var(--foreground-muted))] mb-6">
                      Tell us about yourself so we can personalize your assessment.
                    </p>

                    <div className="space-y-4">
                      {/* Full Name */}
                      <div>
                        <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--foreground-muted))]" />
                          <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            placeholder="Enter your full name"
                            className="w-full pl-12 pr-4 py-3 bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] rounded-xl text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-muted))] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                          Business Email <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--foreground-muted))]" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="you@company.com"
                            className="w-full pl-12 pr-4 py-3 bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] rounded-xl text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-muted))] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                          />
                        </div>
                        <p className="mt-1.5 text-xs text-[hsl(var(--foreground-muted))]">
                          We'll use this to send your personalized report
                        </p>
                      </div>

                      {/* Phone (Optional) */}
                      <div>
                        <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                          Phone Number <span className="text-[hsl(var(--foreground-muted))]">(Optional)</span>
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--foreground-muted))]" />
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="+91 9876543210"
                            className="w-full pl-12 pr-4 py-3 bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] rounded-xl text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-muted))] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                          />
                        </div>
                      </div>

                      {/* Role (Optional) */}
                      <div>
                        <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                          Your Role <span className="text-[hsl(var(--foreground-muted))]">(Optional)</span>
                        </label>
                        <div className="relative">
                          <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--foreground-muted))]" />
                          <select
                            name="role"
                            value={formData.role}
                            onChange={handleInputChange}
                            className="w-full pl-12 pr-10 py-3 bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] rounded-xl text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                          >
                            <option value="">Select your role</option>
                            {roles.map(role => (
                              <option key={role} value={role}>{role}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--foreground-muted))] pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                      <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                        {error}
                      </div>
                    )}

                    {/* Next Button */}
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className={`w-full mt-6 py-3.5 px-6 rounded-xl font-semibold text-white bg-gradient-to-r ${config.gradient} hover:shadow-lg transition-all flex items-center justify-center gap-2`}
                    >
                      Continue
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}

                {/* Step 2: Company Info */}
                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-2">
                      About your organization
                    </h2>
                    <p className="text-[hsl(var(--foreground-muted))] mb-6">
                      This helps us research your industry and provide relevant benchmarks.
                    </p>

                    <div className="space-y-4">
                      {/* Company Name */}
                      <div>
                        <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                          Company Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--foreground-muted))]" />
                          <input
                            type="text"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleInputChange}
                            placeholder="Enter your company name"
                            className="w-full pl-12 pr-4 py-3 bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] rounded-xl text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-muted))] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                          />
                        </div>
                      </div>

                      {/* Industry */}
                      <div>
                        <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                          Industry <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--foreground-muted))]" />
                          <select
                            name="industry"
                            value={formData.industry}
                            onChange={handleInputChange}
                            className="w-full pl-12 pr-10 py-3 bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] rounded-xl text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                          >
                            <option value="">Select your industry</option>
                            {industries.map(industry => (
                              <option key={industry} value={industry}>{industry}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--foreground-muted))] pointer-events-none" />
                        </div>
                      </div>

                      {/* Company Size */}
                      <div>
                        <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                          Company Size <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--foreground-muted))]" />
                          <select
                            name="companySize"
                            value={formData.companySize}
                            onChange={handleInputChange}
                            className="w-full pl-12 pr-10 py-3 bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] rounded-xl text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                          >
                            <option value="">Select company size</option>
                            {companySizes.map(size => (
                              <option key={size} value={size}>{size}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--foreground-muted))] pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* What happens next */}
                    <div className="mt-6 p-4 bg-[hsl(var(--bg-tertiary))] rounded-xl border border-[hsl(var(--border))]">
                      <h4 className="font-semibold text-[hsl(var(--foreground))] mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-500" />
                        What happens next?
                      </h4>
                      <ul className="space-y-1.5 text-sm text-[hsl(var(--foreground-muted))]">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Our AI will research your company and industry</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Answer {getTotalQuestions()} questions with AI-powered follow-ups</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Receive your personalized {config.report}</span>
                        </li>
                      </ul>
                    </div>

                    {/* Error Message */}
                    {error && (
                      <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                        {error}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-6">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="px-6 py-3.5 border-2 border-[hsl(var(--border))] rounded-xl font-semibold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--bg-tertiary))] transition-all flex items-center gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`flex-1 py-3.5 px-6 rounded-xl font-semibold text-white bg-gradient-to-r ${config.gradient} hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2`}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Starting Assessment...
                          </>
                        ) : (
                          <>
                            Start Assessment
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </form>

              {/* Privacy note */}
              <p className="mt-6 text-xs text-center text-[hsl(var(--foreground-muted))] flex items-center justify-center gap-1.5">
                <Lock className="w-3 h-3" />
                Your data is secure and will never be shared without consent
              </p>
            </motion.div>
          </div>

          {/* Right Column - Tier Info */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-2xl p-6 sticky top-24"
            >
              {/* Tier badge */}
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r ${config.gradient} text-white text-sm font-semibold rounded-full mb-4`}>
                <TierIcon className="w-4 h-4" />
                {config.name}
              </div>

              <h3 className="text-lg font-bold text-[hsl(var(--foreground))] mb-2">
                {config.description}
              </h3>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 my-6">
                <div className="bg-[hsl(var(--bg-tertiary))] rounded-lg p-3">
                  <div className="flex items-center gap-2 text-[hsl(var(--foreground-muted))] mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">Duration</span>
                  </div>
                  <div className="font-bold text-[hsl(var(--foreground))]">{config.duration}</div>
                </div>
                <div className="bg-[hsl(var(--bg-tertiary))] rounded-lg p-3">
                  <div className="flex items-center gap-2 text-[hsl(var(--foreground-muted))] mb-1">
                    <FileText className="w-4 h-4" />
                    <span className="text-xs">Report</span>
                  </div>
                  <div className="font-bold text-[hsl(var(--foreground))]">{config.report.split(' ')[0]}</div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2.5">
                <h4 className="text-sm font-semibold text-[hsl(var(--foreground))]">What's included:</h4>
                {config.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-[hsl(var(--foreground-muted))]">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Change tier link */}
              <div className="mt-6 pt-4 border-t border-[hsl(var(--border))]">
                <Link 
                  href="/ai-assessment" 
                  className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Choose a different assessment
                </Link>
              </div>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 p-4 bg-[hsl(var(--bg-secondary))]/50 border border-[hsl(var(--border))] rounded-xl"
            >
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-green-500" />
                <span className="font-semibold text-[hsl(var(--foreground))]">Your data is safe</span>
              </div>
              <ul className="space-y-1.5 text-xs text-[hsl(var(--foreground-muted))]">
                <li>• Enterprise-grade encryption</li>
                <li>• Never sold to third parties</li>
                <li>• Delete anytime on request</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AIAssessmentStartPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    }>
      <StartFormContent />
    </Suspense>
  )
}