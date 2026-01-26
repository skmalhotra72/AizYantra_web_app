import Link from 'next/link'
import { ArrowRight, Check, Mic, MessageSquare, Workflow, Plug, Code, Building, Sparkles, Zap, Clock, DollarSign } from 'lucide-react'

// ═══════════════════════════════════════════════════════════════
// Currency Formatter
// ═══════════════════════════════════════════════════════════════

function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatPriceRange(min: number, max: number, suffix: string = ''): string {
  return `${formatUSD(min)} - ${formatUSD(max)}${suffix}`;
}

// ═══════════════════════════════════════════════════════════════
// Services Data with USD Pricing
// ═══════════════════════════════════════════════════════════════

export default function ServicesPage() {
  const services = [
    {
      icon: Mic,
      title: 'Voice Agents',
      tagline: 'Human-like AI that actually listens',
      description: 'Deploy multilingual AI voice agents that gather requirements, qualify leads, and handle customer interactions with zero perceptible lag.',
      features: [
        'Real-time voice with <300ms latency',
        'Support for 40+ languages and dialects',
        'Automatic requirement capture & CRM sync',
        'Sentiment analysis & call transcription',
        'WhatsApp, phone, and web integration'
      ],
      pricing: formatPriceRange(6000, 12000),
      timeline: '4-6 weeks',
      color: 'orange'
    },
    {
      icon: MessageSquare,
      title: 'AI Chatbots',
      tagline: 'Conversations that convert',
      description: 'Intelligent chat systems trained on your data, capable of answering questions, booking demos, and qualifying prospects 24/7.',
      features: [
        'RAG with your documentation & data',
        'Multi-channel deployment (web, WhatsApp, Slack)',
        'Lead qualification & routing',
        'Seamless handoff to human agents',
        'Conversation analytics dashboard'
      ],
      pricing: formatPriceRange(5000, 10000),
      timeline: '3-5 weeks',
      color: 'blue'
    },
    {
      icon: Workflow,
      title: 'Workflow Automation',
      tagline: 'AI that handles the boring stuff',
      description: 'End-to-end automation of repetitive tasks using n8n, Claude, and custom AI agents. Save 100+ hours monthly.',
      features: [
        'Email & document processing',
        'Lead enrichment & qualification',
        'Social media content generation',
        'Invoice & payment automation',
        'Custom integrations with 400+ tools'
      ],
      pricing: formatPriceRange(8000, 15000),
      timeline: '4-8 weeks',
      color: 'green'
    },
    {
      icon: Plug,
      title: 'AI Integration',
      tagline: 'Connect AI to your existing systems',
      description: 'Seamlessly integrate AI capabilities into your CRM, ERP, databases, and custom applications without disruption.',
      features: [
        'API integration with major platforms',
        'Custom middleware development',
        'Real-time data synchronization',
        'Legacy system modernization',
        'Cloud migration & optimization'
      ],
      pricing: formatPriceRange(10000, 20000),
      timeline: '6-10 weeks',
      color: 'purple'
    },
    {
      icon: Code,
      title: 'Custom AI Development',
      tagline: 'Bespoke solutions for unique challenges',
      description: 'Full-stack AI applications built from scratch. From MVP to production-grade systems with your specific requirements.',
      features: [
        'Requirements gathering via AI voice agent',
        'Custom ML model development & training',
        'Full-stack web/mobile applications',
        'Database design & optimization',
        'Deployment, monitoring & maintenance'
      ],
      pricing: formatPriceRange(15000, 35000),
      timeline: '8-16 weeks',
      color: 'red'
    },
    {
      icon: Building,
      title: 'Fractional CTO',
      tagline: 'Technical leadership on demand',
      description: 'Get a seasoned technical leader for your AI initiatives without full-time commitment. Strategy, architecture, and execution.',
      features: [
        'AI strategy & roadmap development',
        'Technology stack selection',
        'Team hiring & training',
        'Architecture review & optimization',
        'Monthly retainer with equity options'
      ],
      pricing: formatPriceRange(900, 1500, '/mo'),
      timeline: '3-12 months',
      color: 'teal'
    }
  ]

  const process = [
    {
      step: '01',
      title: 'Discovery Call',
      description: 'AI voice agent captures your requirements in your preferred language. 30 minutes, zero hassle.',
      duration: '30 min'
    },
    {
      step: '02',
      title: 'Proposal & Demo',
      description: 'We send a detailed proposal with live demos of similar solutions. Fixed pricing, clear deliverables.',
      duration: '2-3 days'
    },
    {
      step: '03',
      title: 'Development Sprint',
      description: 'Agile development with weekly demos. You see progress in real-time via your client portal.',
      duration: '4-16 weeks'
    },
    {
      step: '04',
      title: 'Deployment & Training',
      description: 'Production deployment, team training, and documentation. Plus 3 months of free support.',
      duration: '1-2 weeks'
    }
  ]

  // Color mapping for Catppuccin-compatible styling
  const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    orange: { 
      bg: 'bg-[hsl(var(--accent-primary))]/10', 
      text: 'text-[hsl(var(--accent-primary))]',
      border: 'border-[hsl(var(--accent-primary))]/20'
    },
    blue: { 
      bg: 'bg-[hsl(var(--accent-secondary))]/10', 
      text: 'text-[hsl(var(--accent-secondary))]',
      border: 'border-[hsl(var(--accent-secondary))]/20'
    },
    green: { 
      bg: 'bg-[hsl(var(--success))]/10', 
      text: 'text-[hsl(var(--success))]',
      border: 'border-[hsl(var(--success))]/20'
    },
    purple: { 
      bg: 'bg-[hsl(var(--accent-lavender))]/10', 
      text: 'text-[hsl(var(--accent-lavender))]',
      border: 'border-[hsl(var(--accent-lavender))]/20'
    },
    red: { 
      bg: 'bg-[hsl(var(--error))]/10', 
      text: 'text-[hsl(var(--error))]',
      border: 'border-[hsl(var(--error))]/20'
    },
    teal: { 
      bg: 'bg-[hsl(var(--accent-teal))]/10', 
      text: 'text-[hsl(var(--accent-teal))]',
      border: 'border-[hsl(var(--accent-teal))]/20'
    },
  }

  return (
    <main className="min-h-screen bg-base">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--accent-primary))]/5 via-transparent to-[hsl(var(--accent-secondary))]/5"></div>
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-surface-0 bg-crust mb-6">
              <Sparkles className="w-4 h-4 text-[hsl(var(--accent-primary))]" />
              <span className="text-sm font-mono font-medium text-subtext-1">
                OUR SERVICES
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text mb-6">
              AI Solutions That{' '}
              <span className="bg-gradient-to-r from-[hsl(var(--accent-primary))] to-[hsl(var(--accent-secondary))] bg-clip-text text-transparent">
                Actually Work
              </span>
            </h1>
            
            <p className="text-lg text-subtext-1 leading-relaxed max-w-3xl mx-auto mb-8">
              From voice agents to full-stack development, we build production-ready AI systems 
              with transparent pricing and guaranteed results.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/contact" 
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg 
                           bg-[hsl(var(--accent-primary))] text-base font-medium 
                           hover:opacity-90 transition-opacity"
              >
                Schedule a Call
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                href="#pricing" 
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg 
                           border-2 border-surface-1 text-text font-medium 
                           hover:border-surface-0 hover:bg-surface-0/50 transition-colors"
              >
                <DollarSign className="w-4 h-4" />
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="pricing" className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-surface-0 bg-crust mb-4">
              <span className="text-xs font-mono font-medium text-[hsl(var(--accent-primary))] uppercase">
                What We Build
              </span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-text mb-4">
              Full-Stack AI Engineering
            </h2>
            <p className="text-subtext-1">
              We don&apos;t just consult—we build, deploy, and maintain production-ready AI systems.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => {
              const Icon = service.icon
              const colors = colorClasses[service.color] || colorClasses.blue
              
              return (
                <div 
                  key={index} 
                  className="bg-crust/80 backdrop-blur-sm border border-surface-0 rounded-2xl p-6 
                             hover:shadow-lg hover:shadow-sky/5 transition-all hover:-translate-y-1
                             hover:border-surface-1"
                >
                  <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${colors.text}`} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-text mb-2">{service.title}</h3>
                  <p className={`text-sm font-medium mb-3 ${colors.text}`}>{service.tagline}</p>
                  <p className="text-subtext-1 text-sm mb-4">{service.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    {service.features.slice(0, 3).map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[hsl(var(--success))] flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-subtext-0">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-surface-0">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <div className="flex items-center gap-1 text-text">
                        <DollarSign className="w-4 h-4 text-[hsl(var(--success))]" />
                        <span className="font-semibold font-mono">{service.pricing}</span>
                      </div>
                      <div className="flex items-center gap-1 text-subtext-0">
                        <Clock className="w-4 h-4" />
                        <span>{service.timeline}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 lg:py-24 bg-mantle">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-surface-0 bg-crust mb-4">
              <span className="text-xs font-mono font-medium text-[hsl(var(--accent-primary))] uppercase">
                How We Work
              </span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-text mb-4">
              Simple, Transparent Process
            </h2>
            <p className="text-subtext-1">
              From first call to production deployment in 4-16 weeks
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              {process.map((item, index) => (
                <div key={index} className="bg-crust rounded-xl p-6 border border-surface-0">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[hsl(var(--accent-primary))]/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-[hsl(var(--accent-primary))] font-bold text-lg font-mono">{item.step}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-text">{item.title}</h3>
                        <span className="text-xs text-subtext-0 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {item.duration}
                        </span>
                      </div>
                      <p className="text-sm text-subtext-1">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-[hsl(var(--accent-primary))] to-[hsl(var(--accent-secondary))] rounded-2xl p-8 lg:p-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6">
              <Zap className="w-4 h-4 text-white" />
              <span className="text-xs font-mono font-medium uppercase text-white">
                Free Consultation
              </span>
            </div>
            
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-white">
              Ready to Build Your AI Solution?
            </h2>
            <p className="text-white/90 max-w-2xl mx-auto mb-8">
              Book a 30-minute discovery call. Our AI voice agent will capture your requirements, 
              and we&apos;ll send you a detailed proposal within 48 hours.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/contact" 
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg 
                           bg-white text-[hsl(var(--accent-primary))] font-medium 
                           hover:bg-white/90 transition-colors"
              >
                Schedule a Call
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/about" 
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg 
                           border-2 border-white text-white font-medium 
                           hover:bg-white/10 transition-colors"
              >
                Learn About Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}