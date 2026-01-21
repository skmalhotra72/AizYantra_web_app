import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone, MapPin, ArrowUpRight, Github, Linkedin, Twitter, Youtube } from 'lucide-react'

const footerLinks = {
  services: [
    { name: 'Voice Agents', href: '/services#voice' },
    { name: 'AI Chatbots', href: '/services#chatbots' },
    { name: 'Workflow Automation', href: '/services#automation' },
    { name: 'AI Integration', href: '/services#integration' },
    { name: 'Custom Development', href: '/services#custom' },
  ],
  solutions: [
    { name: 'Healthcare', href: '/solutions#healthcare' },
    { name: 'Finance & Legal', href: '/solutions#finance' },
    { name: 'E-commerce', href: '/solutions#ecommerce' },
    { name: 'Manufacturing', href: '/solutions#manufacturing' },
    { name: 'Enterprise', href: '/solutions#enterprise' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Our Team', href: '/team' },
    { name: 'Case Studies', href: '/case-studies' },
    { name: 'Blog', href: '/blog' },
    { name: 'Careers', href: '/careers' },
  ],
  resources: [
    { name: 'Documentation', href: '/docs' },
    { name: 'AI Readiness Quiz', href: '/quiz' },
    { name: 'ROI Calculator', href: '/calculator' },
    { name: 'API Reference', href: '/api' },
  ],
}

const socialLinks = [
  { name: 'LinkedIn', href: 'https://linkedin.com/company/aizyantra', icon: Linkedin },
  { name: 'Twitter', href: 'https://twitter.com/aizyantra', icon: Twitter },
  { name: 'YouTube', href: 'https://youtube.com/@aizyantra', icon: Youtube },
  { name: 'GitHub', href: 'https://github.com/aizyantra', icon: Github },
]

export function Footer() {
  return (
    <footer className="relative bg-[hsl(var(--bg-tertiary))] border-t border-[hsl(var(--border))]">
      <div className="absolute inset-0 bg-grid-dots opacity-30"></div>
      <div className="relative container mx-auto px-4">
        <div className="relative -mt-16 mb-16">
          <div className="glass-card rounded-2xl p-8 lg:p-10 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-[hsl(var(--accent-primary))] animate-pulse"></span>
                <span className="text-xs font-mono font-medium text-[hsl(var(--accent-primary))] uppercase tracking-wider">Available for Projects</span>
              </div>
              <h3 className="text-2xl lg:text-3xl font-semibold text-[hsl(var(--foreground))]">Ready to start your AI journey?</h3>
            </div>
            <Link href="/contact" className="btn-tactile btn-tactile-primary whitespace-nowrap">
              Book a Call
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="py-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12">
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link href="/" className="flex items-center space-x-3 mb-6">
              <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-[hsl(var(--border))]">
                <Image src="/images/logo.jpeg" alt="AIzYantra Logo" fill className="object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-[hsl(var(--foreground))]">AIzYantra</span>
                <span className="text-[10px] font-mono text-[hsl(var(--foreground-muted))] tracking-widest uppercase">Intelligence • Engineered</span>
              </div>
            </Link>
            <p className="text-sm text-[hsl(var(--foreground-muted))] leading-relaxed mb-6 max-w-xs">
              We engineer AI & automation systems that deliver measurable business impact. From strategy to deployment.
            </p>
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => (
                <a key={social.name} href={social.href} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] flex items-center justify-center text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--accent-primary))] hover:border-[hsl(var(--accent-primary)/.3)] transition-all" aria-label={social.name}>
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-mono font-semibold text-[hsl(var(--foreground))] uppercase tracking-wider mb-4">Services</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--accent-primary))] transition-colors">{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono font-semibold text-[hsl(var(--foreground))] uppercase tracking-wider mb-4">Solutions</h4>
            <ul className="space-y-3">
              {footerLinks.solutions.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--accent-primary))] transition-colors">{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono font-semibold text-[hsl(var(--foreground))] uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--accent-primary))] transition-colors">{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono font-semibold text-[hsl(var(--foreground))] uppercase tracking-wider mb-4">Contact</h4>
            <ul className="space-y-3">
              <li>
                <a href="mailto:hello@aizyantra.com" className="flex items-center gap-2 text-sm text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--accent-primary))] transition-colors">
                  <Mail className="w-4 h-4" />
                  hello@aizyantra.com
                </a>
              </li>
              <li>
                <a href="tel:+919958824555" className="flex items-center gap-2 text-sm text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--accent-primary))] transition-colors">
                  <Phone className="w-4 h-4" />
                  +91-9958824555
                </a>
              </li>
              <li>
                <div className="flex items-start gap-2 text-sm text-[hsl(var(--foreground-muted))]">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Gurugram, Haryana<br />India</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="py-6 border-t border-[hsl(var(--border))] flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <p className="text-xs text-[hsl(var(--foreground-subtle))] font-mono">© {new Date().getFullYear()} AIzYantra</p>
            <span className="text-[hsl(var(--border-strong))]">•</span>
            <p className="text-xs text-[hsl(var(--foreground-subtle))] font-mono">All rights reserved</p>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-xs text-[hsl(var(--foreground-subtle))] hover:text-[hsl(var(--foreground-muted))] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-xs text-[hsl(var(--foreground-subtle))] hover:text-[hsl(var(--foreground-muted))] transition-colors">Terms of Service</Link>
            <Link href="/cookies" className="text-xs text-[hsl(var(--foreground-subtle))] hover:text-[hsl(var(--foreground-muted))] transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}