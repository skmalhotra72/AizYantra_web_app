'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Rocket,
  Zap,
  Shield,
  Target,
  TrendingUp,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Brain,
  Award,
  BarChart3,
  Clock,
  DollarSign,
  ChevronDown,
  Play
} from 'lucide-react'

export default function POCProgramPage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(var(--bg-primary))] to-[hsl(var(--bg-secondary))]">
      
      {/* HERO SECTION - The Hook */}
      <section className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[hsl(var(--accent-primary))] rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(var(--accent-primary))]/10 border border-[hsl(var(--accent-primary))]/20 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-[hsl(var(--accent-primary))]" />
              <span className="text-sm font-semibold text-[hsl(var(--accent-primary))]">World's First Risk-Free POC Program</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold text-[hsl(var(--foreground))] mb-6 leading-tight">
              Test Your Billion-Dollar Idea
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--accent-primary))] to-purple-500">
                Before You Build It
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-[hsl(var(--foreground-muted))] mb-8 max-w-3xl mx-auto">
              AI-powered validation in <span className="text-[hsl(var(--accent-primary))] font-semibold">6 weeks</span>, not 6 months. 
              <span className="text-[hsl(var(--foreground))] font-semibold"> $0 upfront.</span> Get a technical co-founder if approved.
            </p>

            {/* Value Props */}
            <div className="flex flex-wrap items-center justify-center gap-6 mb-10">
              <div className="flex items-center gap-2 text-[hsl(var(--foreground-muted))]">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Zero Financial Risk</span>
              </div>
              <div className="flex items-center gap-2 text-[hsl(var(--foreground-muted))]">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>AI + Human Expertise</span>
              </div>
              <div className="flex items-center gap-2 text-[hsl(var(--foreground-muted))]">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Investment-Ready Materials</span>
              </div>
            </div>

            {/* Primary CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/poc/submit"
                className="group relative px-8 py-4 bg-gradient-to-r from-[hsl(var(--accent-primary))] to-purple-500 text-white font-bold text-lg rounded-xl shadow-2xl hover:shadow-[hsl(var(--accent-primary))]/50 transition-all duration-300 hover:scale-105"
              >
                <span className="flex items-center gap-2">
                  Submit Your Idea
                  <Rocket className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>

              <button className="flex items-center gap-2 px-6 py-4 border-2 border-[hsl(var(--border))] hover:border-[hsl(var(--accent-primary))] rounded-xl text-[hsl(var(--foreground))] font-semibold transition-all">
                <Play className="w-5 h-5" />
                Watch How It Works
              </button>
            </div>

            {/* Trust Indicator */}
            <p className="text-sm text-[hsl(var(--foreground-muted))] mt-6">
              🔒 Your idea is protected. We sign NDAs before evaluation starts.
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

      {/* THE PROBLEM - Mirror Their Pain */}
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
              Every Founder's Nightmare
            </h2>
            <p className="text-xl text-[hsl(var(--foreground-muted))] max-w-3xl mx-auto">
              You have a brilliant idea. But these questions keep you up at night...
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: Brain,
                question: "Is this idea actually viable?",
                pain: "You don't want to waste 6 months building something nobody wants"
              },
              {
                icon: DollarSign,
                question: "How do I validate without $250K+?",
                pain: "Traditional agencies charge hundreds of thousands for market research and MVP development"
              },
              {
                icon: Users,
                question: "Where do I find a technical co-founder?",
                pain: "Great tech talent is expensive and hard to find for early-stage ideas"
              },
              {
                icon: Clock,
                question: "How long will this take?",
                pain: "Traditional validation takes months - by then, the market has moved on"
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="p-6 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-xl hover:border-[hsl(var(--accent-primary))]/50 transition-all"
              >
                <item.icon className="w-10 h-10 text-[hsl(var(--accent-primary))] mb-4" />
                <h3 className="text-xl font-bold text-[hsl(var(--foreground))] mb-2">{item.question}</h3>
                <p className="text-[hsl(var(--foreground-muted))]">{item.pain}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* THE SOLUTION - Our Program */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full mb-6">
              <Shield className="w-4 h-4 text-green-500" />
              <span className="text-sm font-semibold text-green-500">The Solution</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[hsl(var(--foreground))] mb-6">
              Validate First. Build Later.
            </h2>
            <p className="text-xl text-[hsl(var(--foreground-muted))] max-w-3xl mx-auto">
              Our Risk-Free POC Program gives you everything you need to make an informed decision
            </p>
          </motion.div>

          {/* What You Get */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              {
                icon: BarChart3,
                title: "AI-Powered Analysis",
                desc: "5-stage evaluation covering problem validation, market sizing, impact assessment, and technical feasibility",
                value: "Worth $25K+"
              },
              {
                icon: Award,
                title: "Investment-Ready Pitch Deck",
                desc: "10-slide professional deck ready to present to investors, incubators, and accelerators",
                value: "Worth $6K+"
              },
              {
                icon: Users,
                title: "Technical Co-Founder (If Approved)",
                desc: "We become your technical partner and build your MVP for equity, not cash",
                value: "Worth $300K+"
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative p-6 bg-gradient-to-br from-[hsl(var(--bg-secondary))] to-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] rounded-xl hover:shadow-2xl hover:shadow-[hsl(var(--accent-primary))]/20 transition-all group"
              >
                <div className="absolute top-4 right-4 px-3 py-1 bg-[hsl(var(--accent-primary))]/10 border border-[hsl(var(--accent-primary))]/20 rounded-full text-xs font-semibold text-[hsl(var(--accent-primary))]">
                  {item.value}
                </div>
                <item.icon className="w-12 h-12 text-[hsl(var(--accent-primary))] mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-[hsl(var(--foreground))] mb-3">{item.title}</h3>
                <p className="text-[hsl(var(--foreground-muted))]">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Total Value */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-8 bg-gradient-to-r from-[hsl(var(--accent-primary))]/10 to-purple-500/10 border-2 border-[hsl(var(--accent-primary))]/20 rounded-2xl text-center"
          >
            <p className="text-lg text-[hsl(var(--foreground-muted))] mb-2">Total Program Value</p>
            <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--accent-primary))] to-purple-500 mb-4">
              $325K+
            </p>
            <p className="text-3xl font-bold text-[hsl(var(--foreground))] mb-2">Your Investment: $0</p>
            <p className="text-[hsl(var(--foreground-muted))]">We only succeed when you do. That's our bet on you.</p>
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS - 6 Clear Steps */}
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
              From Idea to Investment-Ready in 6 Weeks
            </h2>
            <p className="text-xl text-[hsl(var(--foreground-muted))] max-w-3xl mx-auto">
              A systematic, proven process to validate and refine your idea
            </p>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                step: "01",
                title: "Submit Your Idea",
                desc: "Tell us about your problem, solution, and target market. Takes 10 minutes.",
                time: "Day 1",
                icon: Rocket
              },
              {
                step: "02",
                title: "AI Evaluation (5 Stages)",
                desc: "Our AI analyzes problem clarity, market size, impact potential, technical feasibility, and creates a pitch deck.",
                time: "Week 1-2",
                icon: Brain
              },
              {
                step: "03",
                title: "Expert Review",
                desc: "Our founding team reviews AI insights and provides strategic recommendations.",
                time: "Week 3",
                icon: Users
              },
              {
                step: "04",
                title: "Go/No-Go Decision",
                desc: "We give you a clear verdict with detailed reasoning and next steps.",
                time: "Week 4",
                icon: Target
              },
              {
                step: "05",
                title: "Refinement (If Needed)",
                desc: "If we see potential but need tweaks, we work with you to refine the idea.",
                time: "Week 5",
                icon: Zap
              },
              {
                step: "06",
                title: "Partnership or Insights",
                desc: "Approved: We build together. Not approved: You get all insights to try again later.",
                time: "Week 6",
                icon: Award
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative flex items-start gap-6 p-6 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-xl hover:border-[hsl(var(--accent-primary))]/50 transition-all group"
              >
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-[hsl(var(--accent-primary))] to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform">
                  {item.step}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-2xl font-bold text-[hsl(var(--foreground))]">{item.title}</h3>
                    <span className="px-3 py-1 bg-[hsl(var(--accent-primary))]/10 border border-[hsl(var(--accent-primary))]/20 rounded-full text-sm font-semibold text-[hsl(var(--accent-primary))]">
                      {item.time}
                    </span>
                  </div>
                  <p className="text-[hsl(var(--foreground-muted))]">{item.desc}</p>
                </div>
                <item.icon className="w-8 h-8 text-[hsl(var(--accent-primary))] opacity-50" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY RISK-FREE */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full mb-6">
              <Shield className="w-4 h-4 text-green-500" />
              <span className="text-sm font-semibold text-green-500">100% Risk-Free Guarantee</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[hsl(var(--foreground))] mb-6">
              You Have Nothing to Lose
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 bg-green-500/5 border-2 border-green-500/20 rounded-2xl"
            >
              <h3 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-4">If We Approve Your Idea</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-[hsl(var(--foreground-muted))]">We become your technical co-founder and build your MVP</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-[hsl(var(--foreground-muted))]">You pay us in equity, not cash</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-[hsl(var(--foreground-muted))]">We share the risk and the upside with you</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 bg-blue-500/5 border-2 border-blue-500/20 rounded-2xl"
            >
              <h3 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-4">If We Don't Approve (Yet)</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span className="text-[hsl(var(--foreground-muted))]">You get all evaluation insights and recommendations</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span className="text-[hsl(var(--foreground-muted))]">You keep your complete pitch deck</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span className="text-[hsl(var(--foreground-muted))]">You can refine and resubmit anytime</span>
                </li>
              </ul>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 p-8 bg-gradient-to-r from-[hsl(var(--accent-primary))]/10 to-purple-500/10 border border-[hsl(var(--accent-primary))]/20 rounded-2xl text-center"
          >
            <p className="text-2xl font-bold text-[hsl(var(--foreground))]">
              Either way, you win. That's the AIzYantra promise.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-[hsl(var(--bg-tertiary))]">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-[hsl(var(--foreground))] mb-6">
              Questions? We've Got Answers.
            </h2>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                q: "How is this really $0 for me?",
                a: "We invest our time, expertise, and AI resources upfront. If approved, we build your MVP for equity instead of cash. If not approved, we still give you all insights for free."
              },
              {
                q: "What if my idea gets stolen?",
                a: "We sign a comprehensive NDA before any evaluation begins. Your intellectual property is protected by legal agreements."
              },
              {
                q: "What's the approval rate?",
                a: "Historically ~15-20%. We're selective because we only take on ideas we believe can succeed and where we can add significant value."
              },
              {
                q: "Can I submit multiple ideas?",
                a: "Absolutely! Each idea goes through the same rigorous process. Submit as many as you have."
              },
              {
                q: "What happens after approval?",
                a: "We formalize the partnership, sign agreements, and begin MVP development. You focus on business strategy while we handle technology."
              }
            ].map((item, idx) => (
              <motion.details
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="group p-6 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-xl hover:border-[hsl(var(--accent-primary))]/50 transition-all"
              >
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <h3 className="text-lg font-bold text-[hsl(var(--foreground))] group-open:text-[hsl(var(--accent-primary))]">
                    {item.q}
                  </h3>
                  <ChevronDown className="w-5 h-5 text-[hsl(var(--foreground-muted))] group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-4 text-[hsl(var(--foreground-muted))] leading-relaxed">{item.a}</p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-[hsl(var(--foreground))] mb-6">
              Ready to Validate Your Idea?
            </h2>
            <p className="text-xl text-[hsl(var(--foreground-muted))] mb-10">
              Join hundreds of founders who trusted us with their billion-dollar ideas
            </p>

            <Link
              href="/poc/submit"
              className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-[hsl(var(--accent-primary))] to-purple-500 text-white font-bold text-xl rounded-2xl shadow-2xl hover:shadow-[hsl(var(--accent-primary))]/50 transition-all duration-300 hover:scale-105 group"
            >
              Submit Your Idea Now
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </Link>

            <p className="text-sm text-[hsl(var(--foreground-muted))] mt-6">
              ⚡ Takes 10 minutes. Get results in 6 weeks. Zero risk.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}