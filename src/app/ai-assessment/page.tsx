'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  BarChart3,
  Zap,
  Shield,
  Target,
  TrendingUp,
  Brain,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Award,
  Clock,
  Users,
  ChevronDown,
  Play,
  Database,
  Gauge,
  Lightbulb,
  AlertCircle
} from 'lucide-react'

export default function AIAssessmentPage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(var(--bg-primary))] to-[hsl(var(--bg-secondary))]">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-[hsl(var(--accent-primary))] rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-semibold text-blue-500">Fortune 500 Framework • Free Assessment</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold text-[hsl(var(--foreground))] mb-6 leading-tight">
              Discover Your AI Readiness
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-[hsl(var(--accent-primary))]">
                in 45 Minutes
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-[hsl(var(--foreground-muted))] mb-8 max-w-3xl mx-auto">
              Get a <span className="text-[hsl(var(--foreground))] font-semibold">personalized AI roadmap worth $25K+</span> absolutely free. 
              7-dimension analysis used by leading consulting firms.
            </p>

            {/* Stats Row */}
            <div className="flex flex-wrap items-center justify-center gap-6 mb-10">
              <div className="flex items-center gap-2 text-[hsl(var(--foreground-muted))]">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>45-minute assessment</span>
              </div>
              <div className="flex items-center gap-2 text-[hsl(var(--foreground-muted))]">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Instant benchmarking</span>
              </div>
              <div className="flex items-center gap-2 text-[hsl(var(--foreground-muted))]">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Actionable roadmap</span>
              </div>
            </div>

            {/* Primary CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/ai-assessment/start"
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-[hsl(var(--accent-primary))] text-white font-bold text-lg rounded-xl shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
              >
                <span className="flex items-center gap-2">
                  Start Free Assessment
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>

              <button className="flex items-center gap-2 px-6 py-4 border-2 border-[hsl(var(--border))] hover:border-blue-500 rounded-xl text-[hsl(var(--foreground))] font-semibold transition-all">
                <Play className="w-5 h-5" />
                See Sample Report
              </button>
            </div>

            {/* Trust Indicator */}
            <p className="text-sm text-[hsl(var(--foreground-muted))] mt-6">
              ⚡ Join 500+ organizations who have discovered their AI opportunities
            </p>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <ChevronDown className="w-8 h-8 text-[hsl(var(--foreground-muted))] animate-bounce" />
          </motion.div>
        </div>
      </section>

      {/* THE REALITY - Industry Stats */}
      <section className="py-20 bg-[hsl(var(--bg-tertiary))]">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full mb-6">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm font-semibold text-red-500">Industry Reality Check</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[hsl(var(--foreground))] mb-6">
              The AI Readiness Gap
            </h2>
            <p className="text-xl text-[hsl(var(--foreground-muted))] max-w-3xl mx-auto">
              Research from McKinsey and Gartner reveals a shocking truth about AI adoption
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                stat: "6%",
                label: "of organizations have reached transformational AI maturity",
                source: "Gartner Research",
                color: "from-red-500 to-orange-500"
              },
              {
                stat: "1%",
                label: "believe they're truly AI-mature",
                source: "McKinsey 2025 State of AI",
                color: "from-orange-500 to-yellow-500"
              },
              {
                stat: "94%",
                label: "are leaving massive value on the table",
                source: "Combined Analysis",
                color: "from-yellow-500 to-green-500"
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="p-8 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-2xl text-center hover:shadow-xl transition-all"
              >
                <div className={`text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${item.color} mb-4`}>
                  {item.stat}
                </div>
                <p className="text-[hsl(var(--foreground))] font-semibold mb-2">{item.label}</p>
                <p className="text-sm text-[hsl(var(--foreground-muted))]">{item.source}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 p-8 bg-blue-500/5 border-2 border-blue-500/20 rounded-2xl text-center"
          >
            <p className="text-2xl font-bold text-[hsl(var(--foreground))] mb-2">
              Where does YOUR organization stand?
            </p>
            <p className="text-[hsl(var(--foreground-muted))]">Find out in 45 minutes with our comprehensive assessment</p>
          </motion.div>
        </div>
      </section>

      {/* 7 DIMENSIONS OF AI READINESS */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-[hsl(var(--foreground))] mb-6">
              We Analyze 7 Critical Dimensions
            </h2>
            <p className="text-xl text-[hsl(var(--foreground-muted))] max-w-3xl mx-auto">
              Based on frameworks from McKinsey, Gartner, Deloitte, and leading tech companies
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: Target,
                title: "Strategy & Leadership",
                desc: "AI vision alignment with business objectives, executive sponsorship, and investment commitment",
                color: "blue"
              },
              {
                icon: Database,
                title: "Data Foundation",
                desc: "Quality, accessibility, and governance of your data assets—the fuel for AI",
                color: "purple"
              },
              {
                icon: Zap,
                title: "Technology Infrastructure",
                desc: "Technical readiness for AI workloads including cloud capability and MLOps maturity",
                color: "cyan"
              },
              {
                icon: Users,
                title: "Talent & Skills",
                desc: "Organizational capability to build, deploy, and maintain AI systems",
                color: "green"
              },
              {
                icon: TrendingUp,
                title: "Culture & Change Readiness",
                desc: "Organizational appetite for AI transformation and experimentation tolerance",
                color: "orange"
              },
              {
                icon: Shield,
                title: "Governance & Ethics",
                desc: "Controls for responsible AI deployment including bias detection and explainability",
                color: "red"
              },
              {
                icon: Award,
                title: "Use Case Maturity",
                desc: "Track record of AI implementation with production deployments and value attribution",
                color: "indigo"
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="p-6 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-xl hover:border-blue-500/50 hover:shadow-xl transition-all group"
              >
                <div className={`w-12 h-12 bg-${item.color}-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <item.icon className={`w-6 h-6 text-${item.color}-500`} />
                </div>
                <h3 className="text-xl font-bold text-[hsl(var(--foreground))] mb-2">{item.title}</h3>
                <p className="text-[hsl(var(--foreground-muted))]">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="py-20 bg-[hsl(var(--bg-tertiary))]">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full mb-6">
              <Award className="w-4 h-4 text-green-500" />
              <span className="text-sm font-semibold text-green-500">Your Personalized Deliverables</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[hsl(var(--foreground))] mb-6">
              What You'll Receive
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Gauge,
                title: "AI Readiness Score",
                desc: "Overall maturity rating with industry benchmark positioning—see exactly where you stand",
                value: "Worth $5K"
              },
              {
                icon: BarChart3,
                title: "7-Dimension Analysis",
                desc: "Detailed scoring across all dimensions with radar chart visualization and gap analysis",
                value: "Worth $8K"
              },
              {
                icon: Lightbulb,
                title: "Opportunity Matrix",
                desc: "Prioritized AI use cases mapped by impact vs. effort—your quick wins and strategic initiatives",
                value: "Worth $10K"
              },
              {
                icon: Target,
                title: "90-Day Roadmap",
                desc: "Phased implementation plan with specific actions, resource requirements, and value milestones",
                value: "Worth $7K"
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative p-8 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-2xl hover:shadow-2xl transition-all"
              >
                <div className="absolute top-4 right-4 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-xs font-semibold text-green-500">
                  {item.value}
                </div>
                <item.icon className="w-12 h-12 text-blue-500 mb-4" />
                <h3 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-3">{item.title}</h3>
                <p className="text-[hsl(var(--foreground-muted))]">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mt-12 p-8 bg-gradient-to-r from-blue-500/10 to-[hsl(var(--accent-primary))]/10 border-2 border-blue-500/20 rounded-2xl text-center"
          >
            <p className="text-lg text-[hsl(var(--foreground-muted))] mb-2">Total Assessment Value</p>
            <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-[hsl(var(--accent-primary))] mb-4">
              $30K+
            </p>
            <p className="text-3xl font-bold text-[hsl(var(--foreground))] mb-2">Your Investment: $0</p>
            <p className="text-[hsl(var(--foreground-muted))]">We invest in your success to build a long-term partnership</p>
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS - 5 Stages */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-[hsl(var(--foreground))] mb-6">
              5-Stage Progressive Assessment
            </h2>
            <p className="text-xl text-[hsl(var(--foreground-muted))] max-w-3xl mx-auto">
              Designed for maximum completion with save-and-resume functionality
            </p>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                stage: "01",
                title: "Strategic Snapshot",
                time: "5-7 minutes",
                desc: "Quick organizational profile and AI vision assessment. We'll understand your priorities and current AI relationship.",
                icon: Target
              },
              {
                stage: "02",
                title: "Functional Deep-Dive",
                time: "10-15 minutes",
                desc: "Department-by-department analysis. Select your key functions and we'll assess automation potential in each.",
                icon: Users
              },
              {
                stage: "03",
                title: "Data & Technology Audit",
                time: "10-12 minutes",
                desc: "Technical infrastructure assessment. Upload documents and we'll use AI to analyze your tech stack and data maturity.",
                icon: Database
              },
              {
                stage: "04",
                title: "Opportunity Identification",
                time: "8-10 minutes",
                desc: "AI-guided use case exploration. Based on your answers, we'll surface relevant opportunities and gauge feasibility.",
                icon: Lightbulb
              },
              {
                stage: "05",
                title: "Roadmap Generation",
                time: "5 minutes",
                desc: "Final inputs for personalized recommendations. Set your preferences and we'll generate your custom roadmap.",
                icon: BarChart3
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="flex items-start gap-6 p-6 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-xl hover:border-blue-500/50 transition-all group"
              >
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-[hsl(var(--accent-primary))] rounded-xl flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform">
                  {item.stage}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-2xl font-bold text-[hsl(var(--foreground))]">{item.title}</h3>
                    <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-sm font-semibold text-blue-500">
                      {item.time}
                    </span>
                  </div>
                  <p className="text-[hsl(var(--foreground-muted))]">{item.desc}</p>
                </div>
                <item.icon className="w-8 h-8 text-blue-500 opacity-50" />
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 p-6 bg-blue-500/5 border border-blue-500/20 rounded-xl"
          >
            <div className="flex items-start gap-3">
              <Clock className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-[hsl(var(--foreground))] mb-2">Save & Resume Anytime</h3>
                <p className="text-[hsl(var(--foreground-muted))]">
                  Auto-save after each question. Come back whenever you're ready. We'll email you reminders at 24, 72, and 168 hours if needed.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* THREE TIERS OF OPPORTUNITIES */}
      <section className="py-20 bg-[hsl(var(--bg-tertiary))]">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-[hsl(var(--foreground))] mb-6">
              We'll Identify Your AI Opportunities
            </h2>
            <p className="text-xl text-[hsl(var(--foreground-muted))] max-w-3xl mx-auto">
              Three distinct tiers with different risk-reward profiles and timelines
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                tier: "Tier 1",
                title: "Low-Hanging Fruit",
                subtitle: "Quick Wins",
                timeline: "Weeks, not months",
                roi: "30-50% cost reduction",
                icon: Zap,
                color: "green",
                examples: [
                  "Invoice processing automation",
                  "Email personalization",
                  "Document classification",
                  "Tier 0 chatbot support"
                ]
              },
              {
                tier: "Tier 2",
                title: "Strategic Initiatives",
                subtitle: "High-ROI Projects",
                timeline: "3-6 months",
                roi: "20-40% productivity gain",
                icon: TrendingUp,
                color: "blue",
                examples: [
                  "Predictive analytics",
                  "Customer churn prediction",
                  "Demand forecasting",
                  "Quality control automation"
                ]
              },
              {
                tier: "Tier 3",
                title: "Transformational",
                subtitle: "Game Changers",
                timeline: "6-12+ months",
                roi: "10-30% improvement",
                icon: Award,
                color: "purple",
                examples: [
                  "Predictive maintenance",
                  "Custom ML models",
                  "AI-native products",
                  "Enterprise automation platforms"
                ]
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="p-8 bg-[hsl(var(--bg-secondary))] border-2 border-[hsl(var(--border))] rounded-2xl hover:shadow-2xl hover:border-blue-500/50 transition-all"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-14 h-14 bg-${item.color}-500/10 rounded-xl flex items-center justify-center`}>
                    <item.icon className={`w-7 h-7 text-${item.color}-500`} />
                  </div>
                  <span className="text-sm font-semibold text-[hsl(var(--foreground-muted))]">{item.tier}</span>
                </div>
                
                <h3 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-1">{item.title}</h3>
                <p className="text-sm text-[hsl(var(--foreground-muted))] mb-4">{item.subtitle}</p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[hsl(var(--foreground-muted))]" />
                    <span className="text-sm text-[hsl(var(--foreground-muted))]">{item.timeline}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[hsl(var(--foreground-muted))]" />
                    <span className="text-sm text-[hsl(var(--foreground-muted))]">{item.roi}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-[hsl(var(--foreground-muted))] uppercase">Examples:</p>
                  <ul className="space-y-1">
                    {item.examples.map((ex, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-[hsl(var(--foreground-muted))]">
                        <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
                        {ex}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-[hsl(var(--foreground))] mb-12">
              Trusted by Leading Organizations
            </h2>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {[
                { stat: "500+", label: "Assessments Completed" },
                { stat: "40%+", label: "Average Completion Rate" },
                { stat: "30-40%", label: "Faster Sales Cycles" }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-6 bg-[hsl(var(--bg-secondary))] rounded-xl"
                >
                  <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-[hsl(var(--accent-primary))] mb-2">
                    {item.stat}
                  </div>
                  <p className="text-[hsl(var(--foreground-muted))]">{item.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 bg-[hsl(var(--bg-tertiary))]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-[hsl(var(--foreground))] mb-6">
              Ready to Discover Your AI Opportunities?
            </h2>
            <p className="text-xl text-[hsl(var(--foreground-muted))] mb-10">
              Join 500+ organizations who have mapped their AI readiness and unlocked transformation
            </p>

            <Link
              href="/ai-assessment/start"
              className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-blue-500 to-[hsl(var(--accent-primary))] text-white font-bold text-xl rounded-2xl shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 group"
            >
              Start Your Free Assessment
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </Link>

            <p className="text-sm text-[hsl(var(--foreground-muted))] mt-6">
              ⚡ 45 minutes • Instant results • $30K+ value • Completely free
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}