'use client'

import Link from 'next/link'
import { 
  ArrowUpRight, 
  Bot,
  Zap,
  Workflow,
  MessageSquare,
  Database,
  ChevronRight,
  Play,
  Cpu,
  Radio,
  Layers,
  GitBranch
} from 'lucide-react'

// Stats data
const stats = [
  { value: '90.2', unit: '%', label: 'ACCURACY', sublabel: 'MediBridge OCR' },
  { value: '3', unit: 'rd', label: 'GLOBAL RANK', sublabel: 'Google AI Hackathon' },
  { value: '25', unit: 'K', label: 'CLOUD CREDITS', sublabel: 'Google Award' },
  { value: '200', unit: '+', label: 'TEAMS', sublabel: 'Defeated Worldwide' },
]

// Services data
const services = [
  {
    icon: Bot,
    title: 'Voice Agents',
    description: 'Human-like AI voice agents with real-time context awareness.',
    tag: 'VOICE-001',
    colorClass: 'bg-orange-500/10 border-orange-500/20 text-orange-500',
  },
  {
    icon: MessageSquare,
    title: 'AI Chatbots',
    description: 'WhatsApp, Telegram & web bots that understand context.',
    tag: 'CHAT-002',
    colorClass: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
  },
  {
    icon: Workflow,
    title: 'Workflow Automation',
    description: 'End-to-end n8n automation with 400+ integrations.',
    tag: 'AUTO-003',
    colorClass: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-500',
  },
  {
    icon: Database,
    title: 'AI Integration',
    description: 'Connect AI to your databases for live context.',
    tag: 'DATA-004',
    colorClass: 'bg-purple-500/10 border-purple-500/20 text-purple-500',
  },
]

// Integration logos/icons
const integrations = [
  { name: 'Gmail', icon: '📧' },
  { name: 'Slack', icon: '💬' },
  { name: 'WhatsApp', icon: '📱' },
  { name: 'Drive', icon: '📁' },
  { name: 'Calendar', icon: '📅' },
  { name: 'Notion', icon: '📝' },
  { name: 'Sheets', icon: '📊' },
  { name: 'Zapier', icon: '⚡' },
]

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* ============================================
          HERO SECTION
          ============================================ */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
        <div className="relative container mx-auto px-4 py-16 lg:py-24">
          <div className="max-w-5xl mx-auto">
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/20">
                <span className="w-2 h-2 rounded-full bg-[hsl(var(--primary))] animate-pulse"></span>
                <span className="text-xs font-mono font-medium text-[hsl(var(--primary))] uppercase tracking-wider">
                  Now Accepting Clients
                </span>
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight mb-6 text-[hsl(var(--foreground))]">
              AI & Automation
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))]">
                Engineered
              </span> for Impact
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-[hsl(var(--foreground-muted))] mb-10 max-w-2xl leading-relaxed">
              We partner with ambitious companies to design, build, and deploy 
              AI systems that deliver measurable business results.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              <Link 
                href="/contact" 
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white font-semibold rounded-xl transition-all"
              >
                Start a Project
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/services" 
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[hsl(var(--surface-raised))] hover:bg-[hsl(var(--surface))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] font-semibold rounded-xl transition-all"
              >
                <Play className="w-4 h-4" />
                View Our Work
              </Link>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {stats.map((stat) => (
                <div 
                  key={stat.label}
                  className="bg-[hsl(var(--surface-raised))] border border-[hsl(var(--border))] rounded-xl p-4 lg:p-6 hover:border-[hsl(var(--primary))]/30 transition-colors"
                >
                  <div className="flex items-baseline gap-0.5 mb-1">
                    <span className="text-3xl lg:text-4xl font-semibold text-[hsl(var(--foreground))] font-mono tracking-tight">
                      {stat.value}
                    </span>
                    <span className="text-lg lg:text-xl font-medium text-[hsl(var(--primary))] font-mono">
                      {stat.unit}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-[hsl(var(--foreground-muted))] uppercase tracking-wider">{stat.label}</div>
                  <div className="text-xs text-[hsl(var(--foreground-subtle))] mt-1">{stat.sublabel}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-6 h-10 rounded-full border-2 border-[hsl(var(--border))] flex items-start justify-center p-2">
            <div className="w-1 h-2 rounded-full bg-[hsl(var(--foreground-muted))] animate-bounce" />
          </div>
        </div>
      </section>

      {/* ============================================
          SERVICES SECTION - BENTO GRID
          ============================================ */}
      <section className="relative py-24 overflow-hidden">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-[2px] bg-[hsl(var(--primary))]"></div>
              <span className="text-xs font-mono font-medium text-[hsl(var(--primary))] uppercase tracking-wider">
                Capabilities
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-[hsl(var(--foreground))] mb-4">
              Full-Stack AI Engineering
            </h2>
            <p className="text-lg text-[hsl(var(--foreground-muted))] max-w-2xl">
              From voice agents to workflow automation, we build production-ready 
              AI systems that integrate with your existing infrastructure.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-12 gap-4 lg:gap-6">
            {/* Main Feature Card */}
            <div className="col-span-12 lg:col-span-8 bg-[hsl(var(--surface-raised))] border border-[hsl(var(--border))] rounded-2xl p-8 lg:p-10 hover:border-[hsl(var(--primary))]/30 transition-all">
              <div className="flex items-start justify-between mb-6">
                <div className="p-3 rounded-xl bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/20">
                  <Cpu className="w-6 h-6 text-[hsl(var(--primary))]" />
                </div>
                <span className="text-xs font-mono text-[hsl(var(--foreground-subtle))] uppercase tracking-wider">
                  CORE-001
                </span>
              </div>
              <h3 className="text-2xl lg:text-3xl font-semibold text-[hsl(var(--foreground))] mb-3">
                End-to-End AI Systems
              </h3>
              <p className="text-[hsl(var(--foreground-muted))] mb-8 max-w-xl leading-relaxed">
                We don&apos;t just consult—we engineer complete AI solutions from strategy 
                to deployment, with ongoing optimization and support.
              </p>
              
              {/* Thinking Animation Demo */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-[hsl(var(--background))] border border-[hsl(var(--border))]">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-[hsl(var(--primary))] animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-[hsl(var(--primary))] animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-[hsl(var(--primary))] animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-sm font-mono text-[hsl(var(--foreground-muted))]">
                  AI Processing Request...
                </span>
              </div>
            </div>

            {/* Side Stats Card */}
            <div className="col-span-12 lg:col-span-4 bg-[hsl(var(--surface-raised))] border border-[hsl(var(--border))] rounded-2xl p-6 lg:p-8 hover:border-[hsl(var(--primary))]/30 transition-all">
              <div className="flex items-start justify-between mb-6">
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <Radio className="w-6 h-6 text-blue-500" />
                </div>
                <span className="text-xs font-mono text-[hsl(var(--foreground-subtle))] uppercase tracking-wider">
                  LIVE
                </span>
              </div>
              <h3 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-6">
                Global Infrastructure
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-[hsl(var(--border))]">
                  <span className="text-sm text-[hsl(var(--foreground-muted))]">Countries</span>
                  <span className="font-mono font-semibold text-[hsl(var(--foreground))]">100+</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-[hsl(var(--border))]">
                  <span className="text-sm text-[hsl(var(--foreground-muted))]">Languages</span>
                  <span className="font-mono font-semibold text-[hsl(var(--foreground))]">40+</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm text-[hsl(var(--foreground-muted))]">Uptime</span>
                  <span className="font-mono font-semibold text-cyan-500">99.9%</span>
                </div>
              </div>
            </div>

            {/* Service Cards */}
            {services.map((service) => (
              <div 
                key={service.title}
                className="col-span-12 sm:col-span-6 lg:col-span-3 bg-[hsl(var(--surface-raised))] border border-[hsl(var(--border))] rounded-2xl p-6 hover:border-[hsl(var(--primary))]/30 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl border ${service.colorClass}`}>
                    <service.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono text-[hsl(var(--foreground-subtle))] uppercase tracking-wider">
                    {service.tag}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-2 group-hover:text-[hsl(var(--primary))] transition-colors">
                  {service.title}
                </h3>
                <p className="text-sm text-[hsl(var(--foreground-muted))] leading-relaxed">
                  {service.description}
                </p>
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-[hsl(var(--primary))] opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          INTEGRATIONS SECTION
          ============================================ */}
      <section className="relative py-24 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-[2px] bg-[hsl(var(--accent))]"></div>
              <span className="text-xs font-mono font-medium text-[hsl(var(--accent))] uppercase tracking-wider">
                Integrations
              </span>
              <div className="w-8 h-[2px] bg-[hsl(var(--accent))]"></div>
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold text-[hsl(var(--foreground))] mb-4">
              Connect Everything
            </h2>
            <p className="text-lg text-[hsl(var(--foreground-muted))] max-w-2xl mx-auto">
              Seamlessly integrate with 400+ tools and platforms your team already uses.
            </p>
          </div>

          {/* Integration Icons Grid */}
          <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
            {integrations.map((integration) => (
              <div
                key={integration.name}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-[hsl(var(--surface-raised))] border border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/30 transition-all"
                style={{ minWidth: '100px' }}
              >
                <span className="text-3xl">{integration.icon}</span>
                <span className="text-xs font-medium text-[hsl(var(--foreground-muted))]">
                  {integration.name}
                </span>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <span className="text-sm text-[hsl(var(--foreground-subtle))]">
              + 400 more integrations via n8n & custom APIs
            </span>
          </div>
        </div>
      </section>

      {/* ============================================
          CTA SECTION
          ============================================ */}
      <section className="relative py-24 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="bg-[hsl(var(--surface-raised))] border border-[hsl(var(--border))] rounded-3xl p-10 lg:p-16 text-center max-w-4xl mx-auto relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[hsl(var(--primary))]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[hsl(var(--accent))]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[hsl(var(--background))] border border-[hsl(var(--border))] mb-6">
                <Layers className="w-4 h-4 text-[hsl(var(--primary))]" />
                <span className="text-xs font-mono font-medium text-[hsl(var(--foreground-muted))] uppercase tracking-wider">
                  Free Consultation
                </span>
              </div>
              
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-[hsl(var(--foreground))] mb-6">
                Ready to Build?
              </h2>
              <p className="text-lg text-[hsl(var(--foreground-muted))] mb-10 max-w-xl mx-auto">
                Book a 30-minute call to discuss your AI automation needs. 
                No sales pitch—just solutions.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/contact" 
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white font-semibold rounded-xl transition-all"
                >
                  Schedule a Call
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
                <Link 
                  href="/about" 
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[hsl(var(--background))] hover:bg-[hsl(var(--surface))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] font-semibold rounded-xl transition-all"
                >
                  <GitBranch className="w-4 h-4" />
                  View Case Studies
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}