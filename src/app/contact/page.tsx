'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin, Send, Linkedin, Twitter, Clock, CheckCircle2, ArrowRight } from 'lucide-react'

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    service: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setSubmitStatus('success')
    setIsSubmitting(false)
    setFormState({
      name: '',
      email: '',
      company: '',
      phone: '',
      service: '',
      message: ''
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormState(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const services = [
    'AI Strategy & Consulting',
    'Voice Agents',
    'AI Chatbots',
    'Workflow Automation',
    'Custom AI Development',
    'Fractional CTO',
    'Other'
  ]

  return (
    <main className="min-h-screen bg-[hsl(var(--background))]">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[hsl(var(--surface-raised))] border border-[hsl(var(--border))] rounded-full mb-6">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-xs font-mono text-[hsl(var(--foreground-muted))]">Response time: ~2 hours</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[hsl(var(--foreground))] mb-6">
              {"Let's Build Something "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))]">Intelligent</span>
            </h1>
            <p className="text-lg text-[hsl(var(--foreground-muted))] leading-relaxed">
              Ready to transform your business with AI? Share your challenge, and we will show you what is possible. No fluff, just practical solutions.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-8">
            
            {/* Contact Form */}
            <div className="lg:col-span-3">
              <div className="bg-[hsl(var(--surface-raised))] border border-[hsl(var(--border))] rounded-2xl p-8">
                <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))] mb-6">Send us a message</h2>

                {submitStatus === 'success' ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-2">Message Sent!</h3>
                    <p className="text-[hsl(var(--foreground-muted))] mb-6">We will get back to you within 2 hours during business hours.</p>
                    <button onClick={() => setSubmitStatus('idle')} className="inline-flex items-center gap-2 text-[hsl(var(--primary))] hover:underline">
                      Send another message
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                          Full Name <span className="text-[hsl(var(--primary))]">*</span>
                        </label>
                        <input type="text" id="name" name="name" required value={formState.name} onChange={handleChange} className="w-full px-4 py-3 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-xl text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-subtle))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent transition-all" placeholder="John Doe" />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                          Email Address <span className="text-[hsl(var(--primary))]">*</span>
                        </label>
                        <input type="email" id="email" name="email" required value={formState.email} onChange={handleChange} className="w-full px-4 py-3 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-xl text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-subtle))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent transition-all" placeholder="john@company.com" />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="company" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">Company Name</label>
                        <input type="text" id="company" name="company" value={formState.company} onChange={handleChange} className="w-full px-4 py-3 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-xl text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-subtle))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent transition-all" placeholder="Acme Inc." />
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">Phone Number</label>
                        <input type="tel" id="phone" name="phone" value={formState.phone} onChange={handleChange} className="w-full px-4 py-3 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-xl text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-subtle))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent transition-all" placeholder="+91 98765 43210" />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="service" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">What are you interested in?</label>
                      <select id="service" name="service" value={formState.service} onChange={handleChange} className="w-full px-4 py-3 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-xl text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent transition-all appearance-none cursor-pointer">
                        <option value="">Select a service...</option>
                        {services.map((service) => (
                          <option key={service} value={service}>{service}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                        Your Message <span className="text-[hsl(var(--primary))]">*</span>
                      </label>
                      <textarea id="message" name="message" required rows={5} value={formState.message} onChange={handleChange} className="w-full px-4 py-3 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-xl text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-subtle))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent transition-all resize-none" placeholder="Tell us about your project or challenge..." />
                    </div>

                    <button type="submit" disabled={isSubmitting} className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Contact Info Sidebar */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Quick Contact Card */}
              <div className="bg-[hsl(var(--surface-raised))] border border-[hsl(var(--border))] rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-6">Quick Contact</h3>
                <div className="space-y-4">
                  <a href="mailto:sanjeev@aizyantra.com" className="flex items-center gap-4 p-3 bg-[hsl(var(--background))] rounded-xl hover:bg-[hsl(var(--surface))] transition-colors group">
                    <div className="w-10 h-10 bg-[hsl(var(--primary))]/10 rounded-lg flex items-center justify-center group-hover:bg-[hsl(var(--primary))]/20 transition-colors">
                      <Mail className="w-5 h-5 text-[hsl(var(--primary))]" />
                    </div>
                    <div>
                      <p className="text-sm text-[hsl(var(--foreground-muted))]">Email</p>
                      <p className="text-[hsl(var(--foreground))] font-medium">sanjeev@aizyantra.com</p>
                    </div>
                  </a>

                  <a href="tel:+919958824555" className="flex items-center gap-4 p-3 bg-[hsl(var(--background))] rounded-xl hover:bg-[hsl(var(--surface))] transition-colors group">
                    <div className="w-10 h-10 bg-[hsl(var(--accent))]/10 rounded-lg flex items-center justify-center group-hover:bg-[hsl(var(--accent))]/20 transition-colors">
                      <Phone className="w-5 h-5 text-[hsl(var(--accent))]" />
                    </div>
                    <div>
                      <p className="text-sm text-[hsl(var(--foreground-muted))]">Phone</p>
                      <p className="text-[hsl(var(--foreground))] font-medium">+91-9958824555</p>
                    </div>
                  </a>

                  <div className="flex items-center gap-4 p-3 bg-[hsl(var(--background))] rounded-xl">
                    <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-[hsl(var(--foreground-muted))]">Location</p>
                      <p className="text-[hsl(var(--foreground))] font-medium">Gurugram, Haryana, India</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Hours Card */}
              <div className="bg-[hsl(var(--surface-raised))] border border-[hsl(var(--border))] rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-5 h-5 text-[hsl(var(--foreground-muted))]" />
                  <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">Business Hours</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[hsl(var(--foreground-muted))]">Monday - Friday</span>
                    <span className="text-[hsl(var(--foreground))] font-medium">9:00 AM - 6:00 PM IST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[hsl(var(--foreground-muted))]">Saturday</span>
                    <span className="text-[hsl(var(--foreground))] font-medium">10:00 AM - 2:00 PM IST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[hsl(var(--foreground-muted))]">Sunday</span>
                    <span className="text-[hsl(var(--foreground))] font-medium">Closed</span>
                  </div>
                </div>
              </div>

              {/* Social Links Card */}
              <div className="bg-[hsl(var(--surface-raised))] border border-[hsl(var(--border))] rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">Connect With Us</h3>
                <div className="flex gap-3">
                  <a href="https://www.linkedin.com/company/aizyantra" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-xl flex items-center justify-center hover:bg-[hsl(var(--primary))] hover:border-[hsl(var(--primary))] hover:text-white text-[hsl(var(--foreground-muted))] transition-all">
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a href="https://twitter.com/aizyantra" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-xl flex items-center justify-center hover:bg-[hsl(var(--primary))] hover:border-[hsl(var(--primary))] hover:text-white text-[hsl(var(--foreground-muted))] transition-all">
                    <Twitter className="w-5 h-5" />
                  </a>
                </div>
              </div>

              {/* CTA Card */}
              <div className="bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] rounded-2xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">Prefer a quick call?</h3>
                <p className="text-white/80 text-sm mb-4">Book a free 30-minute discovery call to discuss your AI needs.</p>
                <a href="https://calendly.com/sanjeev-aizyantra/discovery" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[hsl(var(--primary))] font-semibold rounded-lg hover:bg-white/90 transition-colors">
                  Book a Call
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[hsl(var(--surface-raised))] border border-[hsl(var(--border))] rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))] mb-8 text-center">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 bg-[hsl(var(--background))] rounded-xl">
                <h4 className="font-semibold text-[hsl(var(--foreground))] mb-2">What is your typical response time?</h4>
                <p className="text-sm text-[hsl(var(--foreground-muted))]">We respond to all inquiries within 2 hours during business hours. For urgent matters, call us directly.</p>
              </div>
              <div className="p-4 bg-[hsl(var(--background))] rounded-xl">
                <h4 className="font-semibold text-[hsl(var(--foreground))] mb-2">Do you offer free consultations?</h4>
                <p className="text-sm text-[hsl(var(--foreground-muted))]">Yes! We offer a free 30-minute discovery call to understand your needs and explain how we can help.</p>
              </div>
              <div className="p-4 bg-[hsl(var(--background))] rounded-xl">
                <h4 className="font-semibold text-[hsl(var(--foreground))] mb-2">What industries do you work with?</h4>
                <p className="text-sm text-[hsl(var(--foreground-muted))]">We specialize in healthcare and professional services, but our AI solutions work across all industries.</p>
              </div>
              <div className="p-4 bg-[hsl(var(--background))] rounded-xl">
                <h4 className="font-semibold text-[hsl(var(--foreground))] mb-2">How long does a typical project take?</h4>
                <p className="text-sm text-[hsl(var(--foreground-muted))]">Projects range from 2-12 weeks depending on complexity. We will provide a detailed timeline during our consultation.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}