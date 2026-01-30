'use client'

import Link from 'next/link'
import { Mail, Phone, MapPin, Linkedin, Twitter, Youtube, ArrowUpRight } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { name: 'Services', href: '/services' },
    { name: 'Solutions', href: '/solutions' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ]

  const services = [
    { name: 'AI Chatbots', href: '/services#chatbots' },
    { name: 'Process Automation', href: '/services#automation' },
    { name: 'AI Analytics', href: '/services#analytics' },
    { name: 'Voice AI', href: '/services#voice' },
  ]

  const resources = [
    { name: 'AI Assessment', href: '/ai-assessment' },
    { name: 'Case Studies', href: '/case-studies' },
    { name: 'Blog', href: '/blog' },
    { name: 'POC Program', href: '/poc/submit' },
  ]

  const offices = [
    { city: 'Bengaluru', state: 'Karnataka' },
    { city: 'Gurugram', state: 'Haryana' },
    { city: 'Mumbai', state: 'Maharashtra' },
    { city: 'Sydney', state: 'Australia' },
  ]

  return (
    <footer className="bg-[#0D0D0F] border-t border-[hsl(var(--border))]">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <h3 className="text-2xl font-bold text-white">
                AIz<span className="text-[#FF6B35]">Yantra</span>
              </h3>
              <p className="text-xs text-[hsl(var(--foreground-muted))] tracking-widest mt-1">
                INTELLIGENCE • ENGINEERED
              </p>
            </Link>
            <p className="text-[hsl(var(--foreground-muted))] text-sm mb-6 max-w-sm">
              Transforming businesses with practical AI solutions. We engineer intelligence that delivers measurable ROI.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <a 
                href="mailto:support@aizyantra.com" 
                className="flex items-center gap-3 text-[hsl(var(--foreground-muted))] hover:text-white transition-colors text-sm"
              >
                <Mail className="w-4 h-4 text-[#FF6B35]" />
                support@aizyantra.com
              </a>
              <a 
                href="tel:+919958824555" 
                className="flex items-center gap-3 text-[hsl(var(--foreground-muted))] hover:text-white transition-colors text-sm"
              >
                <Phone className="w-4 h-4 text-[#FF6B35]" />
                +91-9958824555
              </a>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4 mt-6">
              <a 
                href="https://linkedin.com/company/aizyantra" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-[hsl(var(--bg-tertiary))] flex items-center justify-center text-[hsl(var(--foreground-muted))] hover:text-white hover:bg-[#FF6B35] transition-all"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a 
                href="https://twitter.com/aizyantra" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-[hsl(var(--bg-tertiary))] flex items-center justify-center text-[hsl(var(--foreground-muted))] hover:text-white hover:bg-[#FF6B35] transition-all"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="https://youtube.com/@aizyantra" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-[hsl(var(--bg-tertiary))] flex items-center justify-center text-[hsl(var(--foreground-muted))] hover:text-white hover:bg-[#FF6B35] transition-all"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-[hsl(var(--foreground-muted))] hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-white mb-4">Services</h4>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service.name}>
                  <Link 
                    href={service.href}
                    className="text-[hsl(var(--foreground-muted))] hover:text-white transition-colors text-sm"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Global Offices */}
          <div>
            <h4 className="font-semibold text-white mb-4">Global Offices</h4>
            <ul className="space-y-3">
              {offices.map((office) => (
                <li key={office.city} className="flex items-start gap-2 text-sm text-[hsl(var(--foreground-muted))]">
                  <MapPin className="w-4 h-4 text-[#FF6B35] flex-shrink-0 mt-0.5" />
                  <span>{office.city}, {office.state}</span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <Link 
              href="/ai-assessment"
              className="inline-flex items-center gap-2 mt-6 px-4 py-2 bg-[#FF6B35] text-white text-sm font-semibold rounded-lg hover:bg-[#FF6B35]/90 transition-colors"
            >
              Free AI Assessment
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[hsl(var(--border))]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[hsl(var(--foreground-muted))]">
              © {currentYear} AIzYantra. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-[hsl(var(--foreground-muted))]">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export { Footer }