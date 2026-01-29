'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Mail,
  Building2,
  Users,
  DollarSign,
  Target,
  Sparkles,
  CheckCircle2,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

export default function AIAssessmentStartPage() {
  const router = useRouter()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    company: '',
    role: '',
    companySize: '1-50',
    industry: 'technology',
    revenue: 'under-1m'
  })

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      setIsAuthenticated(true)
      setFormData(prev => ({ ...prev, email: user.email || '' }))
    }
    
    setIsCheckingAuth(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) newErrors.fullName = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }
    if (!formData.company.trim()) newErrors.company = 'Company name is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleStart = async () => {
    if (!validateForm()) return

    if (!isAuthenticated) {
      // Redirect to signup with return URL
      router.push(`/signup?returnTo=/ai-assessment/start&email=${encodeURIComponent(formData.email)}`)
      return
    }

    setIsSubmitting(true)

    try {
      // Save assessment start data
      const response = await fetch('/api/ai-assessment/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        // Redirect to actual assessment (you'll build this next)
        router.push(`/ai-assessment/assessment?id=${data.assessmentId}`)
      } else {
        throw new Error('Failed to start assessment')
      }
    } catch (err: any) {
      alert(err.message || 'Failed to start assessment. Please try again.')
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
          <Sparkles className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-pulse" />
          <p className="text-[hsl(var(--foreground-muted))]">Loading...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(var(--bg-primary))] via-[hsl(var(--bg-secondary))] to-[hsl(var(--bg-primary))]">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-[hsl(var(--accent-primary))] rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-6 py-12">
        {/* Back Link */}
        <Link 
          href="/ai-assessment"
          className="inline-flex items-center gap-2 text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--foreground))] mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Overview
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left: Why This Assessment */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-semibold text-blue-500">Before We Begin</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-[hsl(var(--foreground))] mb-6">
              Start Your AI Readiness Assessment
            </h1>

            <p className="text-xl text-[hsl(var(--foreground-muted))] mb-8">
              In 45 minutes, you'll discover exactly where you stand and what opportunities await.
            </p>

            <div className="space-y-6 mb-8">
              <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">What You'll Get:</h3>
              
              {[
                {
                  icon: Target,
                  title: "AI Readiness Score",
                  desc: "See exactly where you stand vs. industry benchmarks"
                },
                {
                  icon: CheckCircle2,
                  title: "7-Dimension Analysis",
                  desc: "Detailed breakdown across all critical areas"
                },
                {
                  icon: Sparkles,
                  title: "Opportunity Matrix",
                  desc: "Prioritized AI use cases for your organization"
                },
                {
                  icon: Target,
                  title: "90-Day Roadmap",
                  desc: "Actionable plan with specific next steps"
                }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  className="flex items-start gap-4 p-4 bg-[hsl(var(--bg-secondary))] rounded-xl"
                >
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[hsl(var(--foreground))] mb-1">{item.title}</h4>
                    <p className="text-sm text-[hsl(var(--foreground-muted))]">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
              <p className="text-sm text-[hsl(var(--foreground-muted))]">
                <strong className="text-green-500">Worth $30K+</strong> in consulting value. 
                Absolutely free. No credit card required.
              </p>
            </div>
          </motion.div>

          {/* Right: Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="card-bordered p-8 bg-[hsl(var(--bg-secondary))]/50 backdrop-blur-sm"
          >
            <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-6">
              Let's Get Started
            </h2>

            <div className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-[hsl(var(--foreground))] mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="John Doe"
                  className={`w-full px-4 py-3 bg-[hsl(var(--bg-tertiary))] border-2 ${
                    errors.fullName ? 'border-red-500' : 'border-[hsl(var(--border))]'
                  } rounded-xl focus:border-blue-500 focus:outline-none transition-all text-[hsl(var(--foreground))]`}
                />
                {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-[hsl(var(--foreground))] mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="john@company.com"
                  className={`w-full px-4 py-3 bg-[hsl(var(--bg-tertiary))] border-2 ${
                    errors.email ? 'border-red-500' : 'border-[hsl(var(--border))]'
                  } rounded-xl focus:border-blue-500 focus:outline-none transition-all text-[hsl(var(--foreground))]`}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Company */}
              <div>
                <label className="block text-sm font-semibold text-[hsl(var(--foreground))] mb-2">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  placeholder="Acme Corporation"
                  className={`w-full px-4 py-3 bg-[hsl(var(--bg-tertiary))] border-2 ${
                    errors.company ? 'border-red-500' : 'border-[hsl(var(--border))]'
                  } rounded-xl focus:border-blue-500 focus:outline-none transition-all text-[hsl(var(--foreground))]`}
                />
                {errors.company && <p className="text-red-500 text-sm mt-1">{errors.company}</p>}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-semibold text-[hsl(var(--foreground))] mb-2">
                  Your Role
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  placeholder="CTO, VP of Operations, etc."
                  className="w-full px-4 py-3 bg-[hsl(var(--bg-tertiary))] border-2 border-[hsl(var(--border))] rounded-xl focus:border-blue-500 focus:outline-none transition-all text-[hsl(var(--foreground))]"
                />
              </div>

              {/* Company Size */}
              <div>
                <label className="block text-sm font-semibold text-[hsl(var(--foreground))] mb-2">
                  Company Size
                </label>
                <select
                  value={formData.companySize}
                  onChange={(e) => handleInputChange('companySize', e.target.value)}
                  className="w-full px-4 py-3 bg-[hsl(var(--bg-tertiary))] border-2 border-[hsl(var(--border))] rounded-xl focus:border-blue-500 focus:outline-none transition-all text-[hsl(var(--foreground))]"
                >
                  <option value="1-50">1-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-1000">201-1,000 employees</option>
                  <option value="1001-5000">1,001-5,000 employees</option>
                  <option value="5000+">5,000+ employees</option>
                </select>
              </div>

              {/* Industry */}
              <div>
                <label className="block text-sm font-semibold text-[hsl(var(--foreground))] mb-2">
                  Industry
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  className="w-full px-4 py-3 bg-[hsl(var(--bg-tertiary))] border-2 border-[hsl(var(--border))] rounded-xl focus:border-blue-500 focus:outline-none transition-all text-[hsl(var(--foreground))]"
                >
                  <option value="technology">Technology</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="financial-services">Financial Services</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="retail">Retail</option>
                  <option value="professional-services">Professional Services</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Start Button */}
              <button
                onClick={handleStart}
                disabled={isSubmitting}
                className="w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-[hsl(var(--accent-primary))] text-white font-bold text-lg rounded-xl hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Starting...
                  </span>
                ) : (
                  'Begin Assessment →'
                )}
              </button>

              <p className="text-xs text-center text-[hsl(var(--foreground-muted))]">
                By starting, you agree to receive your assessment results via email. 
                We respect your privacy and never share your data.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}