import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Target, Lightbulb, Users, Award, Sparkles, TrendingUp } from 'lucide-react'

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--accent-primary)/.05)] via-transparent to-[hsl(var(--accent-secondary)/.05)]"></div>
        <div className="absolute inset-0 bg-grid-dots opacity-30"></div>
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] mb-6">
              <Sparkles className="w-4 h-4 text-[hsl(var(--accent-primary))]" />
              <span className="text-sm font-mono font-medium text-[hsl(var(--foreground-muted))]">
                ABOUT AIZYANTRA
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[hsl(var(--foreground))] mb-6">
              Intelligence{' '}
              <span className="text-gradient">by Design</span>
            </h1>
            
            <p className="text-lg text-[hsl(var(--foreground-muted))] leading-relaxed max-w-3xl mx-auto">
              We're not consultants who talk about AI. We're engineers who build it. 
              From award-winning healthcare platforms to enterprise automation systems, 
              we turn AI ambitions into production reality.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] mb-4">
                <span className="text-xs font-mono font-medium text-[hsl(var(--accent-primary))] uppercase">
                  Our Story
                </span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-[hsl(var(--foreground))] mb-6">
                Born from Real-World Success
              </h2>
              <div className="space-y-4 text-[hsl(var(--foreground-muted))]">
                <p>
                  AIzYantra emerged from a proven track record of delivering AI solutions that work. 
                  Our founding team came together through the Outskill AI Generalist Fellowship, where 
                  we built MediBridge24x7—an AI healthcare platform that achieved:
                </p>
                <ul className="space-y-2 pl-5">
                  <li className="flex items-start gap-2">
                    <Award className="w-5 h-5 text-[hsl(var(--accent-primary))] flex-shrink-0 mt-0.5" />
                    <span><strong>3rd place globally</strong> among 200+ teams</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Award className="w-5 h-5 text-[hsl(var(--accent-primary))] flex-shrink-0 mt-0.5" />
                    <span><strong>$25,000 Google Cloud Award</strong> for technical excellence</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Award className="w-5 h-5 text-[hsl(var(--accent-primary))] flex-shrink-0 mt-0.5" />
                    <span><strong>90%+ accuracy</strong> on handwritten prescription OCR</span>
                  </li>
                </ul>
                <p>
                  That success proved something important: <strong>AI works when it's engineered right.</strong> So we 
                  decided to make it our mission—helping businesses achieve similar breakthroughs.
                </p>
              </div>
            </div>
            
            <div className="relative">
              <div className="glass-card p-8 rounded-2xl">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[hsl(var(--accent-primary)/.1)] flex items-center justify-center flex-shrink-0">
                      <Target className="w-6 h-6 text-[hsl(var(--accent-primary))]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[hsl(var(--foreground))] mb-2">Our Mission</h3>
                      <p className="text-sm text-[hsl(var(--foreground-muted))]">
                        Make enterprise-grade AI accessible to businesses of all sizes through practical, 
                        production-ready solutions.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[hsl(var(--accent-secondary)/.1)] flex items-center justify-center flex-shrink-0">
                      <Lightbulb className="w-6 h-6 text-[hsl(var(--accent-secondary))]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[hsl(var(--foreground))] mb-2">Our Vision</h3>
                      <p className="text-sm text-[hsl(var(--foreground-muted))]">
                        A world where every business leverages AI not as a buzzword, but as a 
                        competitive advantage built on measurable results.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[hsl(var(--accent-tertiary)/.1)] flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-6 h-6 text-[hsl(var(--accent-tertiary))]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[hsl(var(--foreground))] mb-2">Our Approach</h3>
                      <p className="text-sm text-[hsl(var(--foreground-muted))]">
                        We don't just consult—we engineer. Every solution is built, tested, and 
                        deployed with the same rigor that won us global recognition.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-16 lg:py-24 bg-[hsl(var(--bg-secondary))]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--bg-primary))] mb-4">
              <span className="text-xs font-mono font-medium text-[hsl(var(--accent-primary))] uppercase">
                Our Difference
              </span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-[hsl(var(--foreground))] mb-4">
              Why Choose AIzYantra?
            </h2>
            <p className="text-[hsl(var(--foreground-muted))]">
              We're not another consulting firm with slide decks. We're builders with code.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '🏆',
                title: 'Proven Track Record',
                description: 'Award-winning solutions deployed in production, not just proof-of-concepts.'
              },
              {
                icon: '💻',
                title: 'Full-Stack Capability',
                description: 'From AI strategy to production deployment—we handle the complete journey.'
              },
              {
                icon: '🎯',
                title: 'Business-First Thinking',
                description: 'We measure success in ROI, not just accuracy metrics or technical novelty.'
              },
              {
                icon: '⚡',
                title: 'Rapid Execution',
                description: 'MVPs in weeks, not months. We move at startup speed with enterprise quality.'
              },
              {
                icon: '🔒',
                title: 'Transparent Process',
                description: 'Real-time project visibility. No black boxes, no surprises, no vendor lock-in.'
              },
              {
                icon: '🤝',
                title: 'Partnership Approach',
                description: 'We succeed when you succeed. Fixed pricing, clear deliverables, shared goals.'
              }
            ].map((item, index) => (
              <div key={index} className="glass-card p-6 rounded-xl hover:scale-[1.02] transition-transform">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-[hsl(var(--foreground-muted))]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="glass-card rounded-2xl p-8 lg:p-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] mb-6">
              <span className="w-2 h-2 rounded-full bg-[hsl(var(--accent-primary))] animate-pulse"></span>
              <span className="text-xs font-mono font-medium text-[hsl(var(--accent-primary))] uppercase">
                Let's Talk
              </span>
            </div>
            
            <h2 className="text-3xl lg:text-4xl font-bold text-[hsl(var(--foreground))] mb-4">
              Ready to Build Something Remarkable?
            </h2>
            <p className="text-[hsl(var(--foreground-muted))] max-w-2xl mx-auto mb-8">
              Book a 30-minute discovery call. No sales pitch—just an honest conversation 
              about whether AI can solve your specific challenges.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/contact" 
                className="btn-tactile btn-tactile-primary"
              >
                Schedule a Call
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/team" 
                className="btn-tactile btn-tactile-secondary"
              >
                <Users className="w-4 h-4" />
                Meet the Team
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}