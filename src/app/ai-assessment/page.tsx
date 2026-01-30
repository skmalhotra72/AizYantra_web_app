'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Zap, Clock, FileText, Brain, Building2, CheckCircle2, 
  ArrowRight, Sparkles, BarChart3, Target, Users, Shield,
  TrendingUp, Award, Rocket, Star, Lock, Play, ChevronRight,
  BrainCircuit, Search, FileSearch, MessageSquare, Download
} from 'lucide-react'

// Tier configuration
const assessmentTiers = [
  {
    id: 'quick',
    name: 'Quick Pulse',
    tagline: 'Get instant AI insights',
    duration: '5-7 minutes',
    questions: '10 questions',
    aiFollowUps: '+ 2-3 AI follow-ups',
    report: '2-page summary',
    color: '#22C55E',
    gradient: 'from-green-500 to-emerald-500',
    bgGradient: 'from-green-500/10 to-emerald-500/10',
    borderColor: 'border-green-500/30',
    icon: Zap,
    popular: false,
    features: [
      { text: 'Instant AI opportunity score', included: true },
      { text: 'Top 3 quick-win recommendations', included: true },
      { text: 'Industry benchmark comparison', included: true },
      { text: 'Real-time company research', included: true },
      { text: '7-dimension deep analysis', included: false },
      { text: 'Save & resume later', included: false },
      { text: 'Document upload & analysis', included: false },
      { text: 'Executive presentation deck', included: false },
    ],
    cta: 'Start Quick Assessment',
    idealFor: 'Curious leaders wanting a fast snapshot'
  },
  {
    id: 'complete',
    name: 'Complete Analysis',
    tagline: 'Comprehensive AI readiness report',
    duration: '20 minutes',
    questions: '28 questions',
    aiFollowUps: '+ 5-8 AI follow-ups',
    report: '10-page report',
    color: '#3B82F6',
    gradient: 'from-blue-500 to-indigo-500',
    bgGradient: 'from-blue-500/10 to-indigo-500/10',
    borderColor: 'border-blue-500/30',
    icon: BarChart3,
    popular: true,
    features: [
      { text: 'Instant AI opportunity score', included: true },
      { text: 'Top 3 quick-win recommendations', included: true },
      { text: 'Industry benchmark comparison', included: true },
      { text: 'Real-time company research', included: true },
      { text: '7-dimension deep analysis', included: true },
      { text: 'Save & resume later', included: true },
      { text: 'Document upload & analysis', included: false },
      { text: 'Executive presentation deck', included: false },
    ],
    cta: 'Start Complete Assessment',
    idealFor: 'Decision makers exploring AI transformation'
  },
  {
    id: 'advanced',
    name: 'Deep Dive',
    tagline: 'Executive-grade AI strategy report',
    duration: '45-50 minutes',
    questions: '45 questions',
    aiFollowUps: '+ 10-15 AI follow-ups',
    report: '20+ page executive report',
    color: '#8B5CF6',
    gradient: 'from-purple-500 to-violet-500',
    bgGradient: 'from-purple-500/10 to-violet-500/10',
    borderColor: 'border-purple-500/30',
    icon: Brain,
    popular: false,
    features: [
      { text: 'Instant AI opportunity score', included: true },
      { text: 'Top 3 quick-win recommendations', included: true },
      { text: 'Industry benchmark comparison', included: true },
      { text: 'Real-time company research', included: true },
      { text: '7-dimension deep analysis', included: true },
      { text: 'Save & resume later', included: true },
      { text: 'Document upload & analysis', included: true },
      { text: 'Executive presentation deck', included: true },
    ],
    cta: 'Start Deep Dive Assessment',
    idealFor: 'C-suite planning major AI investments'
  }
]

// What makes our assessment different
const differentiators = [
  {
    icon: BrainCircuit,
    title: 'AI-Powered Follow-ups',
    description: 'Our AI analyzes your responses in real-time and asks intelligent follow-up questions tailored to your business.'
  },
  {
    icon: Search,
    title: 'Real-Time Company Research',
    description: 'We research your company, industry, and competitors while you answer - delivering personalized insights.'
  },
  {
    icon: FileSearch,
    title: 'Document Analysis',
    description: 'Upload strategic documents and our AI extracts insights to provide deeper, contextual recommendations.'
  },
  {
    icon: MessageSquare,
    title: 'Consulting-Grade Reports',
    description: 'Receive executive-quality reports with actionable recommendations, ROI projections, and roadmaps.'
  }
]

// Stats
const stats = [
  { value: '40%+', label: 'Higher conversion than forms' },
  { value: '30-40%', label: 'Faster sales cycles' },
  { value: '85%', label: 'Completion rate' },
  { value: '₹5-10L', label: 'Worth of consulting value' }
]

export default function AIAssessmentLandingPage() {
  const router = useRouter()
  const [selectedTier, setSelectedTier] = useState<string | null>(null)
  const [isHovering, setIsHovering] = useState<string | null>(null)

  const handleStartAssessment = (tierId: string) => {
    router.push(`/ai-assessment/start?tier=${tierId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(var(--bg-primary))] via-[hsl(var(--bg-secondary))] to-[hsl(var(--bg-primary))]">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute top-40 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-green-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-16 pb-12 relative">
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-semibold text-blue-600">AI-Powered Assessment Platform</span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-center text-[hsl(var(--foreground))] mb-6"
          >
            Discover Your{' '}
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              AI Transformation
            </span>{' '}
            Potential
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-[hsl(var(--foreground-muted))] text-center max-w-3xl mx-auto mb-8"
          >
            Get a <span className="font-semibold text-[hsl(var(--foreground))]">personalized AI readiness report</span> with 
            actionable recommendations. Our AI researches your company in real-time and asks intelligent follow-up questions.
          </motion.p>

          {/* Trust indicators */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-6 mb-12 text-sm text-[hsl(var(--foreground-muted))]"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>100% Free</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Instant AI-powered results</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Company-specific insights</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tier Selection Section */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-[hsl(var(--foreground))] mb-3">
            Choose Your Assessment Depth
          </h2>
          <p className="text-[hsl(var(--foreground-muted))]">
            Select the level of analysis that fits your needs
          </p>
        </motion.div>

        {/* Tier Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {assessmentTiers.map((tier, index) => {
            const TierIcon = tier.icon
            const isHovered = isHovering === tier.id
            
            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                onMouseEnter={() => setIsHovering(tier.id)}
                onMouseLeave={() => setIsHovering(null)}
                className={`relative bg-[hsl(var(--bg-secondary))] rounded-2xl border-2 transition-all duration-300 ${
                  isHovered 
                    ? `${tier.borderColor} shadow-xl scale-[1.02]` 
                    : 'border-[hsl(var(--border))] shadow-lg'
                } ${tier.popular ? 'md:-mt-4 md:mb-4' : ''}`}
              >
                {/* Popular badge */}
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className={`px-4 py-1.5 bg-gradient-to-r ${tier.gradient} text-white text-sm font-bold rounded-full shadow-lg`}>
                      <div className="flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        Most Popular
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-6 lg:p-8">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.bgGradient} flex items-center justify-center`}>
                      <TierIcon className="w-6 h-6" style={{ color: tier.color }} />
                    </div>
                    <div className="flex items-center gap-1.5 text-[hsl(var(--foreground-muted))]">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">{tier.duration}</span>
                    </div>
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="text-xl font-bold text-[hsl(var(--foreground))] mb-1">{tier.name}</h3>
                  <p className="text-[hsl(var(--foreground-muted))] text-sm mb-4">{tier.tagline}</p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-[hsl(var(--bg-tertiary))] rounded-lg p-3">
                      <div className="text-lg font-bold text-[hsl(var(--foreground))]">{tier.questions}</div>
                      <div className="text-xs text-[hsl(var(--foreground-muted))]">{tier.aiFollowUps}</div>
                    </div>
                    <div className="bg-[hsl(var(--bg-tertiary))] rounded-lg p-3">
                      <div className="text-lg font-bold text-[hsl(var(--foreground))]">{tier.report}</div>
                      <div className="text-xs text-[hsl(var(--foreground-muted))]">AI-generated</div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2.5 mb-6">
                    {tier.features.map((feature, fIndex) => (
                      <div key={fIndex} className="flex items-center gap-2.5">
                        {feature.included ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-[hsl(var(--border))] flex-shrink-0" />
                        )}
                        <span className={`text-sm ${feature.included ? 'text-[hsl(var(--foreground))]' : 'text-[hsl(var(--foreground-muted))]'}`}>
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Ideal for */}
                  <div className="bg-[hsl(var(--bg-tertiary))] rounded-lg p-3 mb-6">
                    <div className="text-xs text-[hsl(var(--foreground-muted))] mb-1">Ideal for:</div>
                    <div className="text-sm font-medium text-[hsl(var(--foreground))]">{tier.idealFor}</div>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleStartAssessment(tier.id)}
                    className={`w-full py-3.5 px-6 rounded-xl font-semibold text-white bg-gradient-to-r ${tier.gradient} hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group`}
                  >
                    {tier.cta}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* What Makes Us Different Section */}
      <section className="bg-[hsl(var(--bg-secondary))] py-16 border-y border-[hsl(var(--border))]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-[hsl(var(--foreground))] mb-3">
              Not Your Typical Assessment
            </h2>
            <p className="text-[hsl(var(--foreground-muted))] max-w-2xl mx-auto">
              Our AI-powered platform delivers consulting-grade insights that typically cost ₹5-10 lakhs — completely free.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {differentiators.map((item, index) => {
              const ItemIcon = item.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[hsl(var(--bg-primary))] rounded-xl p-6 border border-[hsl(var(--border))]"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center mb-4">
                    <ItemIcon className="w-6 h-6 text-blue-500" />
                  </div>
                  <h3 className="font-bold text-[hsl(var(--foreground))] mb-2">{item.title}</h3>
                  <p className="text-sm text-[hsl(var(--foreground-muted))]">{item.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-[hsl(var(--foreground))] mb-3">
              How It Works
            </h2>
            <p className="text-[hsl(var(--foreground-muted))]">
              A simple process that delivers powerful insights
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: 1, title: 'Start Assessment', description: 'Enter your details and begin answering questions about your organization.', icon: Play },
              { step: 2, title: 'AI Researches You', description: 'Our AI researches your company, industry, and competitors in real-time.', icon: Search },
              { step: 3, title: 'Smart Follow-ups', description: 'Based on your answers, AI generates personalized follow-up questions.', icon: MessageSquare },
              { step: 4, title: 'Get Your Report', description: 'Receive a detailed report with scores, benchmarks, and recommendations.', icon: Download },
            ].map((item, index) => {
              const StepIcon = item.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  {/* Connector line */}
                  {index < 3 && (
                    <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-blue-500/50 to-purple-500/50" />
                  )}
                  
                  <div className="relative z-10 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <StepIcon className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-sm font-bold text-blue-500 mb-1">Step {item.step}</div>
                    <h3 className="font-bold text-[hsl(var(--foreground))] mb-2">{item.title}</h3>
                    <p className="text-sm text-[hsl(var(--foreground-muted))]">{item.description}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-blue-500 to-purple-500 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-white/80">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[hsl(var(--foreground))] mb-4">
              Ready to Discover Your AI Potential?
            </h2>
            <p className="text-xl text-[hsl(var(--foreground-muted))] mb-8">
              Join hundreds of organizations who have unlocked their AI transformation roadmap.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => handleStartAssessment('quick')}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center gap-2"
              >
                <Zap className="w-5 h-5" />
                Start Quick Assessment (5 min)
              </button>
              <button
                onClick={() => handleStartAssessment('complete')}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center gap-2"
              >
                <BarChart3 className="w-5 h-5" />
                Start Complete Assessment (20 min)
              </button>
            </div>

            <p className="mt-6 text-sm text-[hsl(var(--foreground-muted))]">
              <Lock className="w-4 h-4 inline mr-1" />
              Your data is secure and will never be shared without your consent.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Framework Logos Section */}
      <section className="border-t border-[hsl(var(--border))] py-8 bg-[hsl(var(--bg-secondary))]">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm text-[hsl(var(--foreground-muted))] mb-4">
            Assessment methodology based on frameworks from
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
            <span className="text-lg font-bold text-[hsl(var(--foreground))]">McKinsey</span>
            <span className="text-lg font-bold text-[hsl(var(--foreground))]">Gartner</span>
            <span className="text-lg font-bold text-[hsl(var(--foreground))]">Deloitte</span>
            <span className="text-lg font-bold text-[hsl(var(--foreground))]">BCG</span>
          </div>
        </div>
      </section>
    </div>
  )
}