'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Mail,
  Phone,
  Building2,
  Globe,
  Lightbulb,
  Target,
  Users,
  TrendingUp,
  Code,
  DollarSign,
  Rocket,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Zap,
  Award
} from 'lucide-react'
import confetti from 'canvas-confetti'

interface FormData {
  // Step 1: Contact
  founderName: string
  founderEmail: string
  founderPhone: string
  companyName: string
  companyWebsite: string
  
  // Step 2: Idea
  ideaTitle: string
  ideaDescription: string
  problemStatement: string
  uniqueValueProposition: string
  businessModel: string
  
  // Step 3: Technical
  targetMarket: string
  competitors: string
  currentStage: string
  teamSize: string
  fundingRaised: string
  techStack: string
}

const STEP_TITLES = [
  { title: 'About You', subtitle: 'Let\'s start with your details', icon: User },
  { title: 'Your Idea', subtitle: 'Tell us about your billion-dollar idea', icon: Lightbulb },
  { title: 'The Details', subtitle: 'Help us understand the market', icon: TrendingUp }
]

export default function POCSubmitPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const [formData, setFormData] = useState<FormData>({
    founderName: '',
    founderEmail: '',
    founderPhone: '',
    companyName: '',
    companyWebsite: '',
    ideaTitle: '',
    ideaDescription: '',
    problemStatement: '',
    uniqueValueProposition: '',
    businessModel: '',
    targetMarket: '',
    competitors: '',
    currentStage: 'idea',
    teamSize: '1',
    fundingRaised: '0',
    techStack: ''
  })

  // Check authentication
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      setIsAuthenticated(true)
      // Pre-fill email if authenticated
      setFormData(prev => ({ ...prev, founderEmail: user.email || '' }))
    }
    
    setIsCheckingAuth(false)
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.founderName.trim()) newErrors.founderName = 'Name is required'
      if (!formData.founderEmail.trim()) newErrors.founderEmail = 'Email is required'
      if (formData.founderEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.founderEmail)) {
        newErrors.founderEmail = 'Invalid email format'
      }
    }

    if (step === 2) {
      if (!formData.ideaTitle.trim()) newErrors.ideaTitle = 'Idea title is required'
      if (!formData.ideaDescription.trim()) newErrors.ideaDescription = 'Description is required'
      if (formData.ideaDescription.length < 50) {
        newErrors.ideaDescription = 'Please provide at least 50 characters'
      }
      if (!formData.problemStatement.trim()) newErrors.problemStatement = 'Problem statement is required'
    }

    if (step === 3) {
      if (!formData.targetMarket.trim()) newErrors.targetMarket = 'Target market is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 1 && !isAuthenticated) {
        // Redirect to signup with return URL
        router.push(`/signup?returnTo=/poc/submit&email=${encodeURIComponent(formData.founderEmail)}`)
        return
      }
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => prev - 1)
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) return

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/poc/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          founderName: formData.founderName,
          founderEmail: formData.founderEmail,
          founderPhone: formData.founderPhone || null,
          companyName: formData.companyName || null,
          companyWebsite: formData.companyWebsite || null,
          ideaTitle: formData.ideaTitle,
          ideaDescription: formData.ideaDescription,
          problemStatement: formData.problemStatement,
          targetMarket: formData.targetMarket,
          competitors: formData.competitors || null,
          uniqueValueProposition: formData.uniqueValueProposition || null,
          businessModel: formData.businessModel || null,
          techStack: formData.techStack ? formData.techStack.split(',').map(s => s.trim()) : [],
          teamSize: parseInt(formData.teamSize) || 1,
          currentStage: formData.currentStage,
          fundingRaised: parseInt(formData.fundingRaised) || 0,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Fire confetti!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })
        
        // Show success step
        setCurrentStep(4)
      } else {
        throw new Error(data.error || 'Submission failed')
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[hsl(var(--bg-primary))] to-[hsl(var(--bg-secondary))] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Sparkles className="w-12 h-12 text-[hsl(var(--accent-primary))] mx-auto mb-4 animate-pulse" />
          <p className="text-[hsl(var(--foreground-muted))]">Loading...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(var(--bg-primary))] via-[hsl(var(--bg-secondary))] to-[hsl(var(--bg-primary))]">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[hsl(var(--accent-primary))] rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(var(--accent-primary))]/10 border border-[hsl(var(--accent-primary))]/20 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-[hsl(var(--accent-primary))]" />
            <span className="text-sm font-semibold text-[hsl(var(--accent-primary))]">Risk-Free POC Program</span>
          </div>
          
          {currentStep <= 3 && (
            <>
              <h1 className="text-4xl md:text-5xl font-bold text-[hsl(var(--foreground))] mb-4">
                {STEP_TITLES[currentStep - 1].title}
              </h1>
              <p className="text-xl text-[hsl(var(--foreground-muted))]">
                {STEP_TITLES[currentStep - 1].subtitle}
              </p>
            </>
          )}
        </motion.div>

        {/* Progress Bar */}
        {currentStep <= 3 && (
          <div className="mb-12">
            <div className="flex justify-between mb-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center flex-1">
                  <div className={`relative flex flex-col items-center flex-1 ${step < 3 ? 'after:content-[""] after:absolute after:top-6 after:left-[60%] after:w-full after:h-1 after:rounded-full' : ''} ${currentStep > step ? 'after:bg-[hsl(var(--accent-primary))]' : 'after:bg-[hsl(var(--border))]/30'}`}>
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: currentStep >= step ? 1 : 0.8 }}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        currentStep > step
                          ? 'bg-[hsl(var(--accent-primary))] text-white'
                          : currentStep === step
                          ? 'bg-gradient-to-r from-[hsl(var(--accent-primary))] to-purple-500 text-white shadow-lg'
                          : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--foreground-muted))] border-2 border-[hsl(var(--border))]'
                      }`}
                    >
                      {currentStep > step ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (
                        React.createElement(STEP_TITLES[step - 1].icon, { className: 'w-6 h-6' })
                      )}
                    </motion.div>
                    <span className={`text-xs mt-2 font-medium ${currentStep >= step ? 'text-[hsl(var(--foreground))]' : 'text-[hsl(var(--foreground-muted))]'}`}>
                      Step {step}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form Container */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="card-bordered p-8 bg-[hsl(var(--bg-secondary))]/50 backdrop-blur-sm"
          >
            {/* STEP 1: Contact Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <InputField
                  icon={User}
                  label="Your Full Name"
                  placeholder="John Doe"
                  value={formData.founderName}
                  onChange={(val) => handleInputChange('founderName', val)}
                  error={errors.founderName}
                  required
                />

                <InputField
                  icon={Mail}
                  label="Email Address"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.founderEmail}
                  onChange={(val) => handleInputChange('founderEmail', val)}
                  error={errors.founderEmail}
                  required
                />

                <InputField
                  icon={Phone}
                  label="Phone Number"
                  placeholder="+1 (555) 123-4567"
                  value={formData.founderPhone}
                  onChange={(val) => handleInputChange('founderPhone', val)}
                />

                <InputField
                  icon={Building2}
                  label="Company Name (Optional)"
                  placeholder="Acme Inc."
                  value={formData.companyName}
                  onChange={(val) => handleInputChange('companyName', val)}
                />

                <InputField
                  icon={Globe}
                  label="Company Website (Optional)"
                  placeholder="https://acme.com"
                  value={formData.companyWebsite}
                  onChange={(val) => handleInputChange('companyWebsite', val)}
                />
              </div>
            )}

            {/* STEP 2: Idea Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <InputField
                  icon={Lightbulb}
                  label="Idea Title"
                  placeholder="AI-Powered Customer Support Platform"
                  value={formData.ideaTitle}
                  onChange={(val) => handleInputChange('ideaTitle', val)}
                  error={errors.ideaTitle}
                  required
                />

                <TextAreaField
                  icon={Zap}
                  label="Idea Description"
                  placeholder="Describe your idea in detail. What problem does it solve? How does it work?"
                  value={formData.ideaDescription}
                  onChange={(val) => handleInputChange('ideaDescription', val)}
                  error={errors.ideaDescription}
                  minLength={50}
                  required
                />

                <TextAreaField
                  icon={Target}
                  label="Problem Statement"
                  placeholder="What specific problem are you solving? Who faces this problem?"
                  value={formData.problemStatement}
                  onChange={(val) => handleInputChange('problemStatement', val)}
                  error={errors.problemStatement}
                  required
                />

                <TextAreaField
                  icon={Award}
                  label="Unique Value Proposition (Optional)"
                  placeholder="What makes your solution different from existing solutions?"
                  value={formData.uniqueValueProposition}
                  onChange={(val) => handleInputChange('uniqueValueProposition', val)}
                />

                <TextAreaField
                  icon={DollarSign}
                  label="Business Model (Optional)"
                  placeholder="How will you make money? (e.g., subscription, marketplace, ads)"
                  value={formData.businessModel}
                  onChange={(val) => handleInputChange('businessModel', val)}
                />
              </div>
            )}

            {/* STEP 3: Technical Details */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <TextAreaField
                  icon={Users}
                  label="Target Market"
                  placeholder="Who are your target customers? Be specific."
                  value={formData.targetMarket}
                  onChange={(val) => handleInputChange('targetMarket', val)}
                  error={errors.targetMarket}
                  required
                />

                <TextAreaField
                  icon={TrendingUp}
                  label="Known Competitors (Optional)"
                  placeholder="List any competitors or similar solutions"
                  value={formData.competitors}
                  onChange={(val) => handleInputChange('competitors', val)}
                />

                <SelectField
                  label="Current Stage"
                  value={formData.currentStage}
                  onChange={(val) => handleInputChange('currentStage', val)}
                  options={[
                    { value: 'idea', label: 'Just an Idea' },
                    { value: 'prototype', label: 'Working Prototype' },
                    { value: 'mvp', label: 'MVP Built' },
                    { value: 'launched', label: 'Already Launched' }
                  ]}
                />

                <InputField
                  icon={Users}
                  label="Team Size"
                  type="number"
                  placeholder="1"
                  value={formData.teamSize}
                  onChange={(val) => handleInputChange('teamSize', val)}
                />

                <InputField
                  icon={DollarSign}
                  label="Funding Raised (USD)"
                  type="number"
                  placeholder="0"
                  value={formData.fundingRaised}
                  onChange={(val) => handleInputChange('fundingRaised', val)}
                />

                <InputField
                  icon={Code}
                  label="Tech Stack (Optional)"
                  placeholder="React, Python, AWS (comma-separated)"
                  value={formData.techStack}
                  onChange={(val) => handleInputChange('techStack', val)}
                />
              </div>
            )}

            {/* STEP 4: Success */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </motion.div>

                <h2 className="text-4xl font-bold text-[hsl(var(--foreground))] mb-4">
                  🎉 Submission Received!
                </h2>
                <p className="text-xl text-[hsl(var(--foreground-muted))] mb-8 max-w-2xl mx-auto">
                  Your idea is now in our evaluation pipeline. We'll analyze it through 5 stages and get back to you within 6 weeks.
                </p>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  {[
                    { icon: Zap, text: 'AI Evaluation Starting' },
                    { icon: Award, text: 'Pitch Deck Being Created' },
                    { icon: Rocket, text: 'Results in 6 Weeks' }
                  ].map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + idx * 0.1 }}
                      className="p-6 bg-[hsl(var(--bg-tertiary))] rounded-xl"
                    >
                      <item.icon className="w-8 h-8 text-[hsl(var(--accent-primary))] mx-auto mb-3" />
                      <p className="text-sm text-[hsl(var(--foreground-muted))]">{item.text}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => router.push('/portal/poc-submissions')}
                    className="px-8 py-4 bg-gradient-to-r from-[hsl(var(--accent-primary))] to-purple-500 text-white font-bold rounded-xl hover:shadow-xl transition-all"
                  >
                    Track Your Submission
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-8 py-4 border-2 border-[hsl(var(--border))] hover:border-[hsl(var(--accent-primary))] rounded-xl font-semibold transition-all"
                  >
                    Submit Another Idea
                  </button>
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            {currentStep <= 3 && (
              <div className="flex justify-between mt-8 pt-6 border-t border-[hsl(var(--border))]">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2 px-6 py-3 border-2 border-[hsl(var(--border))] rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:border-[hsl(var(--accent-primary))] transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>

                {currentStep < 3 ? (
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[hsl(var(--accent-primary))] to-purple-500 text-white font-bold rounded-xl hover:shadow-xl transition-all"
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:shadow-xl transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Idea'}
                    <Rocket className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// Helper Components
interface InputFieldProps {
  icon: any
  label: string
  placeholder: string
  value: string
  onChange: (val: string) => void
  error?: string
  required?: boolean
  type?: string
}

function InputField({ icon: Icon, label, placeholder, value, onChange, error, required, type = 'text' }: InputFieldProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[hsl(var(--foreground))] mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--foreground-muted))]" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full pl-12 pr-4 py-3 bg-[hsl(var(--bg-tertiary))] border-2 ${
            error ? 'border-red-500' : 'border-[hsl(var(--border))]'
          } rounded-xl focus:border-[hsl(var(--accent-primary))] focus:outline-none transition-all text-[hsl(var(--foreground))]`}
        />
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}

interface TextAreaFieldProps {
  icon: any
  label: string
  placeholder: string
  value: string
  onChange: (val: string) => void
  error?: string
  required?: boolean
  minLength?: number
}

function TextAreaField({ icon: Icon, label, placeholder, value, onChange, error, required, minLength }: TextAreaFieldProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[hsl(var(--foreground))] mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <Icon className="absolute left-4 top-4 w-5 h-5 text-[hsl(var(--foreground-muted))]" />
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className={`w-full pl-12 pr-4 py-3 bg-[hsl(var(--bg-tertiary))] border-2 ${
            error ? 'border-red-500' : 'border-[hsl(var(--border))]'
          } rounded-xl focus:border-[hsl(var(--accent-primary))] focus:outline-none transition-all text-[hsl(var(--foreground))] resize-none`}
        />
      </div>
      <div className="flex justify-between items-center mt-1">
        {error ? (
          <p className="text-red-500 text-sm">{error}</p>
        ) : minLength ? (
          <p className="text-[hsl(var(--foreground-muted))] text-sm">
            {value.length}/{minLength} characters minimum
          </p>
        ) : <span />}
      </div>
    </div>
  )
}

interface SelectFieldProps {
  label: string
  value: string
  onChange: (val: string) => void
  options: { value: string; label: string }[]
}

function SelectField({ label, value, onChange, options }: SelectFieldProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[hsl(var(--foreground))] mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-[hsl(var(--bg-tertiary))] border-2 border-[hsl(var(--border))] rounded-xl focus:border-[hsl(var(--accent-primary))] focus:outline-none transition-all text-[hsl(var(--foreground))]"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}