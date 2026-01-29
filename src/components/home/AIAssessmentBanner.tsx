'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { BarChart3, Sparkles, ArrowRight, Brain, Gauge, CheckCircle2 } from 'lucide-react'

export default function AIAssessmentBanner() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="relative overflow-hidden my-20"
    >
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-[hsl(var(--accent-primary))]/10 to-purple-500/10"></div>
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[hsl(var(--accent-primary))] rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6"
            >
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-bold text-blue-500">
                FREE: AI Readiness Assessment
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-4xl md:text-5xl font-bold text-[hsl(var(--foreground))] mb-4 leading-tight"
            >
              Only{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-[hsl(var(--accent-primary))]">
                6% of Organizations
              </span>{' '}
              Are AI-Ready
            </motion.h2>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="text-xl text-[hsl(var(--foreground-muted))] mb-6"
            >
              Discover your AI maturity across{' '}
              <span className="font-bold text-[hsl(var(--foreground))]">7 critical dimensions</span> in just 45 minutes.
              <span className="font-bold text-blue-500"> Get a $30K+ roadmap—free.</span>
            </motion.p>

            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="flex flex-col gap-3 mb-8"
            >
              {[
                '📊 7-dimension analysis (McKinsey + Gartner framework)',
                '🎯 Personalized AI opportunity matrix',
                '🚀 90-day implementation roadmap'
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-[hsl(var(--foreground-muted))]">{benefit}</span>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/ai-assessment"
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-[hsl(var(--accent-primary))] text-white font-bold text-lg rounded-xl shadow-xl hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 text-center"
              >
                <span className="flex items-center justify-center gap-2">
                  Learn More
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>

              <Link
                href="/ai-assessment/start"
                className="group px-8 py-4 bg-[hsl(var(--bg-secondary))] border-2 border-blue-500 text-blue-500 font-bold text-lg rounded-xl hover:bg-blue-500 hover:text-white transition-all text-center"
              >
                <span className="flex items-center justify-center gap-2">
                  Start Assessment
                  <Brain className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </span>
              </Link>
            </motion.div>
          </div>

          {/* Right: Visual Stats */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="grid grid-cols-2 gap-6"
          >
            {[
              {
                icon: Gauge,
                stat: '7 Dimensions',
                label: 'Comprehensive Analysis',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: BarChart3,
                stat: '$30K+',
                label: 'Assessment Value',
                color: 'from-[hsl(var(--accent-primary))] to-purple-500'
              },
              {
                icon: Brain,
                stat: '45 Minutes',
                label: 'Total Assessment Time',
                color: 'from-purple-500 to-pink-500'
              },
              {
                icon: Sparkles,
                stat: '6%',
                label: 'Are AI-Mature (Gartner)',
                color: 'from-green-500 to-emerald-500'
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1 + idx * 0.1 }}
                className="relative p-6 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-2xl hover:shadow-xl hover:scale-105 transition-all"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mb-4`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-[hsl(var(--foreground))] to-[hsl(var(--foreground-muted))] mb-1">
                  {item.stat}
                </div>
                <div className="text-sm text-[hsl(var(--foreground-muted))]">{item.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}