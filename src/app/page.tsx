'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { 
  ArrowUpRight, 
  Bot,
  Zap,
  Globe,
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

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] } }
}

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
    color: 'var(--accent-primary)',
  },
  {
    icon: MessageSquare,
    title: 'AI Chatbots',
    description: 'WhatsApp, Telegram & web bots that understand context.',
    tag: 'CHAT-002',
    color: 'var(--accent-secondary)',
  },
  {
    icon: Workflow,
    title: 'Workflow Automation',
    description: 'End-to-end n8n automation with 400+ integrations.',
    tag: 'AUTO-003',
    color: 'var(--accent-cyan)',
  },
  {
    icon: Database,
    title: 'AI Integration',
    description: 'Connect AI to your databases for live context.',
    tag: 'DATA-004',
    color: 'var(--accent-purple)',
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
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })
  
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.98])

  return (
    <div className="flex flex-col">
      {/* ============================================
          HERO SECTION - STRIPE INSPIRED
          ============================================ */}
      <section 
        ref={heroRef}
        className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20"
      >
        {/* Hero Content */}
        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="relative container mx-auto px-4 py-16 lg:py-24"
        >
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="max-w-5xl mx-auto"
          >
            {/* Eyebrow */}
            <motion.div variants={fadeInUp} className="flex items-center gap-3 mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[hsl(var(--accent-primary)/.1)] border border-[hsl(var(--accent-primary)/.2)]">
                <span className="w-2 h-2 rounded-full bg-[hsl(var(--accent-primary))] animate-pulse"></span>
                <span className="text-xs font-mono font-medium text-[hsl(var(--accent-primary))] uppercase tracking-wider">
                  Now Accepting Clients
                </span>
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1 
              variants={fadeInUp}
              className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight mb-6 text-[hsl(var(--foreground))]"
            >
              AI & Automation
              <br />
              <span className="gradient-text-static">Engineered</span> for Impact
            </motion.h1>

            {/* Subheadline */}
            <motion.p 
              variants={fadeInUp}
              className="text-lg md:text-xl text-[hsl(var(--foreground-muted))] mb-10 max-w-2xl leading-relaxed"
            >
              We partner with ambitious companies to design, build, and deploy 
              AI systems that deliver measurable business results.
            </motion.p>

            {/* CTA Buttons - Tactile Style */}
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 mb-16"
            >
              <Link href="/contact" className="btn-tactile btn-tactile-primary">
                Start a Project
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link href="/services" className="btn-tactile btn-tactile-outline">
                <Play className="w-4 h-4" />
                View Our Work
              </Link>
            </motion.div>

            {/* Stats Bar - Technical Style */}
            <motion.div 
              variants={fadeInUp}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
            >
              {stats.map((stat, index) => (
                <div 
                  key={stat.label}
                  className="card-bordered p-4 lg:p-6 group hover:border-[hsl(var(--accent-primary)/.3)] transition-colors"
                >
                  <div className="flex items-baseline gap-0.5 mb-1">
                    <span className="text-3xl lg:text-4xl font-semibold text-[hsl(var(--foreground))] font-mono tracking-tight">
                      {stat.value}
                    </span>
                    <span className="text-lg lg:text-xl font-medium text-[hsl(var(--accent-primary))] font-mono">
                      {stat.unit}
                    </span>
                  </div>
                  <div className="data-label">{stat.label}</div>
                  <div className="text-xs text-[hsl(var(--foreground-subtle))] mt-1">{stat.sublabel}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-[hsl(var(--border-strong))] flex items-start justify-center p-2">
            <motion.div 
              className="w-1 h-2 rounded-full bg-[hsl(var(--foreground-muted))]"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </section>

      {/* ============================================
          SERVICES SECTION - BENTO GRID
          ============================================ */}
      <section className="relative py-24 overflow-hidden">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-16"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-[2px] bg-[hsl(var(--accent-primary))]"></div>
              <span className="text-xs font-mono font-medium text-[hsl(var(--accent-primary))] uppercase tracking-wider">
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
          </motion.div>

          {/* Bento Grid */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-12 gap-4 lg:gap-6"
          >
            {/* Main Feature Card */}
            <motion.div 
              variants={scaleIn}
              className="col-span-12 lg:col-span-8 glass-card rounded-2xl p-8 lg:p-10 hover-lift group"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="p-3 rounded-xl bg-[hsl(var(--accent-primary)/.1)] border border-[hsl(var(--accent-primary)/.2)]">
                  <Cpu className="w-6 h-6 text-[hsl(var(--accent-primary))]" />
                </div>
                <span className="text-xs font-mono text-[hsl(var(--foreground-subtle))] uppercase tracking-wider">
                  CORE-001
                </span>
              </div>
              <h3 className="text-2xl lg:text-3xl font-semibold text-[hsl(var(--foreground))] mb-3">
                End-to-End AI Systems
              </h3>
              <p className="text-[hsl(var(--foreground-muted))] mb-8 max-w-xl leading-relaxed">
                We don't just consult—we engineer complete AI solutions from strategy 
                to deployment, with ongoing optimization and support.
              </p>
              
              {/* Thinking Animation Demo */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))]">
                <div className="thinking-dots">
                  <div className="thinking-dot"></div>
                  <div className="thinking-dot"></div>
                  <div className="thinking-dot"></div>
                </div>
                <span className="text-sm font-mono text-[hsl(var(--foreground-muted))]">
                  AI Processing Request...
                </span>
              </div>
            </motion.div>

            {/* Side Stats Card */}
            <motion.div 
              variants={scaleIn}
              className="col-span-12 lg:col-span-4 glass-card rounded-2xl p-6 lg:p-8 hover-lift"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="p-3 rounded-xl bg-[hsl(var(--accent-secondary)/.1)] border border-[hsl(var(--accent-secondary)/.2)]">
                  <Radio className="w-6 h-6 text-[hsl(var(--accent-secondary))]" />
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
                  <span className="font-mono font-semibold text-[hsl(var(--accent-cyan))]">99.9%</span>
                </div>
              </div>
            </motion.div>

            {/* Service Cards */}
            {services.map((service, index) => (
              <motion.div 
                key={service.title}
                variants={scaleIn}
                className="col-span-12 sm:col-span-6 lg:col-span-3 card-interactive rounded-2xl p-6 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div 
                    className="p-3 rounded-xl transition-colors"
                    style={{ 
                      backgroundColor: `hsl(${service.color} / 0.1)`,
                      border: `1px solid hsl(${service.color} / 0.2)`
                    }}
                  >
                    <service.icon 
                      className="w-5 h-5 transition-colors" 
                      style={{ color: `hsl(${service.color})` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-[hsl(var(--foreground-subtle))] uppercase tracking-wider">
                    {service.tag}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-2 group-hover:text-[hsl(var(--accent-primary))] transition-colors">
                  {service.title}
                </h3>
                <p className="text-sm text-[hsl(var(--foreground-muted))] leading-relaxed">
                  {service.description}
                </p>
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-[hsl(var(--accent-primary))] opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ChevronRight className="w-4 h-4" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================================
          INTEGRATIONS SECTION
          ============================================ */}
      <section className="relative py-24 overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-[2px] bg-[hsl(var(--accent-secondary))]"></div>
              <span className="text-xs font-mono font-medium text-[hsl(var(--accent-secondary))] uppercase tracking-wider">
                Integrations
              </span>
              <div className="w-8 h-[2px] bg-[hsl(var(--accent-secondary))]"></div>
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold text-[hsl(var(--foreground))] mb-4">
              Connect Everything
            </h2>
            <p className="text-lg text-[hsl(var(--foreground-muted))] max-w-2xl mx-auto">
              Seamlessly integrate with 400+ tools and platforms your team already uses.
            </p>
          </motion.div>

          {/* Integration Icons Grid */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto"
          >
            {integrations.map((integration, index) => (
              <motion.div
                key={integration.name}
                variants={fadeInUp}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] hover:border-[hsl(var(--accent-primary)/.3)] transition-all hover-lift"
                style={{ minWidth: '100px' }}
              >
                <span className="text-3xl">{integration.icon}</span>
                <span className="text-xs font-medium text-[hsl(var(--foreground-muted))]">
                  {integration.name}
                </span>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-8"
          >
            <span className="text-sm text-[hsl(var(--foreground-subtle))]">
              + 400 more integrations via n8n & custom APIs
            </span>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          CTA SECTION
          ============================================ */}
      <section className="relative py-24 overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-card rounded-3xl p-10 lg:p-16 text-center max-w-4xl mx-auto relative overflow-hidden"
          >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[hsl(var(--accent-primary)/.1)] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[hsl(var(--accent-secondary)/.1)] rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] mb-6">
                <Layers className="w-4 h-4 text-[hsl(var(--accent-primary))]" />
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
                <Link href="/contact" className="btn-tactile btn-tactile-primary">
                  Schedule a Call
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
                <Link href="/about" className="btn-tactile btn-tactile-outline">
                  <GitBranch className="w-4 h-4" />
                  View Case Studies
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}