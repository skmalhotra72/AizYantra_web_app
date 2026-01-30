'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Mail, Phone, MapPin, Clock, Send, Loader2, CheckCircle,
  Building2, Globe, MessageSquare, Calendar, ArrowRight
} from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
    interest: 'general'
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      // Simulate form submission - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSubmitted(true)
    } catch (err) {
      setError('Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const offices = [
    { 
      city: 'Bengaluru', 
      state: 'Karnataka',
      country: 'India',
      type: 'Tech Hub'
    },
    { 
      city: 'Gurugram', 
      state: 'Haryana',
      country: 'India',
      type: 'North India HQ'
    },
    { 
      city: 'Mumbai', 
      state: 'Maharashtra',
      country: 'India',
      type: 'West India'
    },
    { 
      city: 'Sydney', 
      state: 'NSW',
      country: 'Australia',
      type: 'APAC Office'
    },
  ]

  const interests = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'chatbot', label: 'AI Chatbot Solutions' },
    { value: 'automation', label: 'Process Automation' },
    { value: 'analytics', label: 'AI Analytics' },
    { value: 'voice', label: 'Voice AI' },
    { value: 'partnership', label: 'Partnership' },
  ]

  if (submitted) {
    return (
      <div className="min-h-screen bg-[hsl(var(--bg-primary))] flex items-center justify-center px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-4">
            Message Sent!
          </h1>
          <p className="text-[hsl(var(--foreground-muted))] mb-8">
            Thank you for reaching out. Our team will get back to you within 24 hours.
          </p>
          <a 
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6B35] text-white rounded-xl font-semibold hover:bg-[#FF6B35]/90 transition-colors"
          >
            Back to Home
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-primary))]">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6B35]/10 text-[#FF6B35] rounded-full text-sm font-medium mb-6">
              <MessageSquare className="w-4 h-4" />
              Get in Touch
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-[hsl(var(--foreground))] mb-6">
              Let's Build Something
              <span className="text-[#FF6B35]"> Amazing Together</span>
            </h1>
            <p className="text-xl text-[hsl(var(--foreground-muted))] max-w-2xl mx-auto">
              Ready to transform your business with AI? Our team of experts is here to help you every step of the way.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="pb-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Email Card */}
            <motion.a
              href="mailto:support@aizyantra.com"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="group p-6 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-2xl hover:border-[#FF6B35]/50 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-[#FF6B35]/10 flex items-center justify-center mb-4 group-hover:bg-[#FF6B35]/20 transition-colors">
                <Mail className="w-6 h-6 text-[#FF6B35]" />
              </div>
              <h3 className="font-semibold text-[hsl(var(--foreground))] mb-1">Email Us</h3>
              <p className="text-[#FF6B35] font-medium">support@aizyantra.com</p>
              <p className="text-sm text-[hsl(var(--foreground-muted))] mt-2">
                We respond within 24 hours
              </p>
            </motion.a>

            {/* Phone Card */}
            <motion.a
              href="tel:+919958824555"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="group p-6 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-2xl hover:border-[#FF6B35]/50 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                <Phone className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="font-semibold text-[hsl(var(--foreground))] mb-1">Call Us</h3>
              <p className="text-blue-500 font-medium">+91-9958824555</p>
              <p className="text-sm text-[hsl(var(--foreground-muted))] mt-2">
                Mon-Fri, 9am-6pm IST
              </p>
            </motion.a>

            {/* Schedule Card */}
            <motion.a
              href="/ai-assessment"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="group p-6 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-2xl hover:border-[#FF6B35]/50 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                <Calendar className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="font-semibold text-[hsl(var(--foreground))] mb-1">Free Assessment</h3>
              <p className="text-purple-500 font-medium">AI Readiness Check</p>
              <p className="text-sm text-[hsl(var(--foreground-muted))] mt-2">
                5-minute assessment
              </p>
            </motion.a>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-6">
                Send us a Message
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] text-[hsl(var(--foreground))] focus:outline-none focus:border-[#FF6B35] transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] text-[hsl(var(--foreground))] focus:outline-none focus:border-[#FF6B35] transition-colors"
                      placeholder="john@company.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] text-[hsl(var(--foreground))] focus:outline-none focus:border-[#FF6B35] transition-colors"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] text-[hsl(var(--foreground))] focus:outline-none focus:border-[#FF6B35] transition-colors"
                      placeholder="Your Company"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                    I'm interested in
                  </label>
                  <select
                    value={formData.interest}
                    onChange={(e) => setFormData({...formData, interest: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] text-[hsl(var(--foreground))] focus:outline-none focus:border-[#FF6B35] transition-colors"
                  >
                    {interests.map((interest) => (
                      <option key={interest.value} value={interest.value}>
                        {interest.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] text-[hsl(var(--foreground))] focus:outline-none focus:border-[#FF6B35] transition-colors resize-none"
                    placeholder="Tell us about your project or inquiry..."
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#FF6B35] text-white rounded-xl font-semibold hover:bg-[#FF6B35]/90 disabled:opacity-50 transition-all"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
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
            </motion.div>

            {/* Info Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-8"
            >
              {/* Global Offices */}
              <div>
                <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-6 flex items-center gap-2">
                  <Globe className="w-6 h-6 text-[#FF6B35]" />
                  Global Offices
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {offices.map((office) => (
                    <div 
                      key={office.city}
                      className="p-4 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-xl"
                    >
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-[#FF6B35] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-[hsl(var(--foreground))]">{office.city}</p>
                          <p className="text-sm text-[hsl(var(--foreground-muted))]">{office.state}</p>
                          <span className="inline-block mt-2 px-2 py-0.5 bg-[#FF6B35]/10 text-[#FF6B35] text-xs rounded-full">
                            {office.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Business Hours */}
              <div className="p-6 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-2xl">
                <h3 className="font-semibold text-[hsl(var(--foreground))] mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#FF6B35]" />
                  Business Hours
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[hsl(var(--foreground-muted))]">Monday - Friday</span>
                    <span className="text-[hsl(var(--foreground))]">9:00 AM - 6:00 PM IST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[hsl(var(--foreground-muted))]">Saturday</span>
                    <span className="text-[hsl(var(--foreground))]">10:00 AM - 4:00 PM IST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[hsl(var(--foreground-muted))]">Sunday</span>
                    <span className="text-[hsl(var(--foreground))]">Closed</span>
                  </div>
                </div>
              </div>

              {/* Quick Contact */}
              <div className="p-6 bg-gradient-to-r from-[#FF6B35]/10 to-blue-500/10 border border-[#FF6B35]/20 rounded-2xl">
                <h3 className="font-semibold text-[hsl(var(--foreground))] mb-4">
                  Need Immediate Assistance?
                </h3>
                <p className="text-sm text-[hsl(var(--foreground-muted))] mb-4">
                  Talk to Tripti, our AI assistant, for instant answers to common questions.
                </p>
                <p className="text-sm text-[hsl(var(--foreground-muted))]">
                  Or call us directly at{' '}
                  <a href="tel:+919958824555" className="text-[#FF6B35] font-semibold hover:underline">
                    +91-9958824555
                  </a>
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}