'use client'

import Link from 'next/link'
import { ArrowRight, Building2, Heart, Scale, ShoppingCart, Factory, Briefcase, CheckCircle2, Zap, Shield, TrendingUp } from 'lucide-react'

const industries = [
  {
    id: 'healthcare',
    name: 'Healthcare',
    icon: Heart,
    color: 'rose',
    description: 'AI solutions for hospitals, clinics, diagnostic labs, and healthtech startups.',
    challenges: [
      'Manual prescription processing',
      'Patient data scattered across systems',
      'Long wait times for appointments',
      'Staff burnout from repetitive tasks'
    ],
    solutions: [
      'AI-powered prescription OCR with 90%+ accuracy',
      'Unified patient data platforms',
      'Intelligent appointment scheduling',
      'Automated documentation and reporting'
    ],
    stats: { metric: '90%+', label: 'Accuracy on handwritten prescriptions' },
    caseStudy: 'MediBridge24x7 - 3rd Prize Global, $25K Google Cloud Award'
  },
  {
    id: 'finance',
    name: 'Finance & Legal',
    icon: Scale,
    color: 'blue',
    description: 'Streamline compliance, automate document processing, and enhance client service.',
    challenges: [
      'Document-heavy workflows',
      'Compliance and regulatory burden',
      'Manual contract review',
      'Client communication delays'
    ],
    solutions: [
      'Intelligent document extraction and classification',
      'Automated compliance monitoring',
      'AI contract analysis and review',
      'Client portal with AI chat support'
    ],
    stats: { metric: '70%', label: 'Reduction in document processing time' },
    caseStudy: null
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    icon: ShoppingCart,
    color: 'emerald',
    description: 'Boost sales, improve customer experience, and automate operations.',
    challenges: [
      'Cart abandonment',
      'Customer support overload',
      'Inventory management',
      'Personalization at scale'
    ],
    solutions: [
      'AI-powered product recommendations',
      '24/7 customer support chatbots',
      'Demand forecasting and inventory optimization',
      'Personalized marketing automation'
    ],
    stats: { metric: '35%', label: 'Increase in customer engagement' },
    caseStudy: null
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    icon: Factory,
    color: 'amber',
    description: 'Optimize production, predict maintenance, and improve quality control.',
    challenges: [
      'Unplanned equipment downtime',
      'Quality control inconsistencies',
      'Supply chain disruptions',
      'Manual reporting processes'
    ],
    solutions: [
      'Predictive maintenance systems',
      'AI-powered visual inspection',
      'Supply chain optimization',
      'Automated reporting dashboards'
    ],
    stats: { metric: '40%', label: 'Reduction in unplanned downtime' },
    caseStudy: null
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    icon: Building2,
    color: 'violet',
    description: 'Transform operations across departments with integrated AI solutions.',
    challenges: [
      'Siloed data and systems',
      'Inefficient cross-department workflows',
      'Slow decision making',
      'High operational costs'
    ],
    solutions: [
      'Enterprise AI integration platform',
      'Cross-functional workflow automation',
      'Real-time analytics and insights',
      'Custom AI agents for specific needs'
    ],
    stats: { metric: '100+', label: 'Hours saved per month per team' },
    caseStudy: null
  }
]

const benefits = [
  {
    icon: Zap,
    title: 'Rapid Implementation',
    description: 'Go from concept to production in weeks, not months. Our proven frameworks accelerate delivery.'
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-grade security and compliance. Your data stays protected and private.'
  },
  {
    icon: TrendingUp,
    title: 'Measurable ROI',
    description: 'Clear metrics and KPIs from day one. Track the impact of every AI initiative.'
  }
]

const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
  rose: { bg: 'bg-rose-500/10', text: 'text-rose-500', border: 'border-rose-500/20' },
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' },
  violet: { bg: 'bg-violet-500/10', text: 'text-violet-500', border: 'border-violet-500/20' }
}

export default function SolutionsPage() {
  return (
    <main className="min-h-screen bg-[hsl(var(--background))]">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[hsl(var(--surface-raised))] border border-[hsl(var(--border))] rounded-full mb-6">
              <Briefcase className="w-3 h-3 text-[hsl(var(--primary))]" />
              <span className="text-xs font-mono text-[hsl(var(--foreground-muted))]">Industry Solutions</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[hsl(var(--foreground))] mb-6">
              AI Solutions for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))]">Every Industry</span>
            </h1>
            <p className="text-lg text-[hsl(var(--foreground-muted))] leading-relaxed">
              We understand that every industry has unique challenges. Our solutions are tailored to address your specific pain points with proven AI implementations.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Bar */}
      <section className="pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-4 p-6 bg-[hsl(var(--surface-raised))] border border-[hsl(var(--border))] rounded-xl">
                <div className="w-10 h-10 bg-[hsl(var(--primary))]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="w-5 h-5 text-[hsl(var(--primary))]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[hsl(var(--foreground))] mb-1">{benefit.title}</h3>
                  <p className="text-sm text-[hsl(var(--foreground-muted))]">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Solutions */}
      <section className="pb-24 px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {industries.map((industry, index) => {
            const colors = colorClasses[industry.color]
            const IconComponent = industry.icon
            
            return (
              <div key={industry.id} className="bg-[hsl(var(--surface-raised))] border border-[hsl(var(--border))] rounded-2xl overflow-hidden">
                <div className="grid lg:grid-cols-2 gap-0">
                  {/* Left: Industry Info */}
                  <div className="p-8 lg:p-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center`}>
                        <IconComponent className={`w-6 h-6 ${colors.text}`} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">{industry.name}</h2>
                        <p className="text-sm text-[hsl(var(--foreground-muted))]">{industry.description}</p>
                      </div>
                    </div>

                    {/* Stats Badge */}
                    <div className={`inline-flex items-center gap-3 px-4 py-2 ${colors.bg} border ${colors.border} rounded-lg mb-6`}>
                      <span className={`text-2xl font-bold ${colors.text}`}>{industry.stats.metric}</span>
                      <span className="text-sm text-[hsl(var(--foreground-muted))]">{industry.stats.label}</span>
                    </div>

                    {/* Case Study Badge */}
                    {industry.caseStudy && (
                      <div className="p-4 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-xl mb-6">
                        <p className="text-xs font-mono text-[hsl(var(--foreground-muted))] mb-1">PROVEN SUCCESS</p>
                        <p className="text-sm font-medium text-[hsl(var(--foreground))]">{industry.caseStudy}</p>
                      </div>
                    )}

                    <Link href="/contact" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] text-white font-semibold rounded-lg transition-colors">
                      Discuss Your Needs
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>

                  {/* Right: Challenges & Solutions */}
                  <div className="bg-[hsl(var(--background))] p-8 lg:p-10 border-t lg:border-t-0 lg:border-l border-[hsl(var(--border))]">
                    <div className="grid sm:grid-cols-2 gap-8">
                      {/* Challenges */}
                      <div>
                        <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] uppercase tracking-wider mb-4">Common Challenges</h3>
                        <ul className="space-y-3">
                          {industry.challenges.map((challenge, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-[hsl(var(--foreground-muted))]">
                              <span className="w-1.5 h-1.5 bg-[hsl(var(--foreground-subtle))] rounded-full mt-2 flex-shrink-0"></span>
                              {challenge}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Solutions */}
                      <div>
                        <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] uppercase tracking-wider mb-4">Our Solutions</h3>
                        <ul className="space-y-3">
                          {industry.solutions.map((solution, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-[hsl(var(--foreground-muted))]">
                              <CheckCircle2 className={`w-4 h-4 ${colors.text} mt-0.5 flex-shrink-0`} />
                              {solution}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] rounded-2xl p-8 md:p-12 text-white text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Not Sure Where to Start?</h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Take our free AI Readiness Assessment and get a personalized roadmap for your organization.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-[hsl(var(--primary))] font-semibold rounded-xl hover:bg-white/90 transition-colors">
                Get Free Assessment
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/services" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-colors">
                View All Services
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}