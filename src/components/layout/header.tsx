'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Logo } from '@/components/ui/logo'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Services', href: '/services' },
  { name: 'Solutions', href: '/solutions' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/80 dark:bg-[hsl(220,15%,10%)]/80 backdrop-blur-xl border-b border-[hsl(var(--border))]' 
          : 'bg-transparent'
      }`}
    >
      <nav className="container mx-auto flex h-20 items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className={`relative overflow-hidden rounded-xl border border-[hsl(var(--border))] group-hover:border-[hsl(var(--accent-primary))] transition-all duration-300 ${
            scrolled ? 'h-16 w-16' : 'h-20 w-20'
          }`}>
            <Logo
              width={scrolled ? 64 : 80}
              height={scrolled ? 64 : 80}
              className="object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className={`font-semibold text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--accent-primary))] transition-colors ${
              scrolled ? 'text-lg' : 'text-xl'
            }`}>
              AIzYantra
            </span>
            <span className="text-[10px] font-mono text-[hsl(var(--foreground-muted))] tracking-widest uppercase">
              Intelligence • Engineered
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:items-center lg:space-x-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="relative px-4 py-2 text-sm font-medium text-[hsl(var(--foreground-muted))] transition-all duration-200 hover:text-[hsl(var(--foreground))] group"
            >
              <span className="relative z-10">{item.name}</span>
              <span className="absolute inset-0 rounded-lg bg-[hsl(var(--bg-secondary))] opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-0"></span>
            </Link>
          ))}
        </div>

        {/* Right Side - Theme Toggle & CTA */}
        <div className="hidden lg:flex lg:items-center lg:space-x-4">
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* CTA Button - Tactile Style */}
          <Link 
            href="/contact" 
            className="btn-tactile btn-tactile-primary"
          >
            Book a Demo
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Mobile Menu */}
        <div className="flex items-center gap-3 lg:hidden">
          <ThemeToggle />
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-[hsl(var(--foreground))] hover:bg-[hsl(var(--bg-secondary))]"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="right" 
              className="w-[300px] sm:w-[400px] bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border))]"
            >
              {/* Mobile Logo */}
              <div className="flex items-center space-x-3 mb-8 mt-4 pb-6 border-b border-[hsl(var(--border))]">
                <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-[hsl(var(--border))]">
                  <Logo
                    width={80}
                    height={80}
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-semibold text-[hsl(var(--foreground))]">AIzYantra</span>
                  <span className="text-[10px] font-mono text-[hsl(var(--foreground-muted))] tracking-widest uppercase">
                    Intelligence • Engineered
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 text-base font-medium text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--bg-secondary))] rounded-lg transition-all"
                  >
                    {item.name}
                  </Link>
                ))}
                
                <div className="pt-6 mt-4 border-t border-[hsl(var(--border))]">
                  <Link 
                    href="/contact" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-tactile btn-tactile-primary w-full justify-center"
                  >
                    Book a Demo
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}