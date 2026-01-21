import Link from 'next/link'
import { ArrowRight, Check, Mic, MessageSquare, Workflow, Plug, Code, Building, Sparkles, Zap, Clock, DollarSign } from 'lucide-react'

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
      pricing: '₹6-12 Lakhs',
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
      pricing: '₹5-10 Lakhs',
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
      pricing: '₹8-15 Lakhs',
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
      pricing: '₹10-20 Lakhs',
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
      pricing: '₹15-35 Lakhs',
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
      pricing: '₹6-10 Lakhs/month',
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

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-transparent to-blue-50"></div>
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white mb-6">
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-mono font-medium text-gray-600">
                OUR SERVICES
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              AI Solutions That{' '}
              <span className="bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent">
                Actually Work
              </span>
            </h1>
            
            <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8">
              From voice agents to full-stack development, we build production-ready AI systems 
              with transparent pricing and guaranteed results.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors">
                Schedule a Call
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="#pricing" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-medium hover:border-gray-400 transition-colors">
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-gray-50 mb-4">
              <span className="text-xs font-mono font-medium text-orange-500 uppercase">
                What We Build
              </span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Full-Stack AI Engineering
            </h2>
            <p className="text-gray-600">
              We don&apos;t just consult—we build, deploy, and maintain production-ready AI systems.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => {
              const Icon = service.icon
              return (
                <div key={index} className="bg-white/50 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className={`w-12 h-12 rounded-xl bg-${service.color}-100 flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 text-${service.color}-500`} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-sm text-orange-500 font-medium mb-3">{service.tagline}</p>
                  <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    {service.features.slice(0, 3).map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <div className="flex items-center gap-1 text-gray-600">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-semibold">{service.pricing}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
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
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-white mb-4">
              <span className="text-xs font-mono font-medium text-orange-500 uppercase">
                How We Work
              </span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Process
            </h2>
            <p className="text-gray-600">
              From first call to production deployment in 4-16 weeks
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              {process.map((item, index) => (
                <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-orange-500 font-bold text-lg">{item.step}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{item.title}</h3>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {item.duration}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{item.description}</p>
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
          <div className="bg-gradient-to-br from-orange-500 to-blue-600 rounded-2xl p-8 lg:p-12 text-center text-white">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-mono font-medium uppercase">
                Free Consultation
              </span>
            </div>
            
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Ready to Build Your AI Solution?
            </h2>
            <p className="text-white/90 max-w-2xl mx-auto mb-8">
              Book a 30-minute discovery call. Our AI voice agent will capture your requirements, 
              and we&apos;ll send you a detailed proposal within 48 hours.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white text-orange-600 font-medium hover:bg-gray-100 transition-colors">
                Schedule a Call
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/about" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 border-white text-white font-medium hover:bg-white/10 transition-colors">
                Learn About Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}