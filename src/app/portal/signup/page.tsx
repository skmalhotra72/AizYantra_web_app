'use client'

export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/ui/logo'
import { 
  Mail, 
  Lock, 
  Eye,
  EyeOff,
  User,
  Phone,
  Building,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react'

// Inner component with all functionality
function SignupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const intent = searchParams.get('intent') // 'i2e-evaluation' or null
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    password: '',
    confirmPassword: ''
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(0)

  // Calculate password strength
  useEffect(() => {
    const password = formData.password
    let strength = 0
    if (password.length >= 8) strength++
    if (password.length >= 12) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^a-zA-Z0-9]/.test(password)) strength++
    setPasswordStrength(strength)
  }, [formData.password])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Please enter your full name')
      return false
    }
    if (!formData.email.trim()) {
      setError('Please enter your email address')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address')
      return false
    }
    if (!formData.phone.trim()) {
      setError('Please enter your phone number')
      return false
    }
    if (!formData.password) {
      setError('Please enter a password')
      return false
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    return true
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    const supabase = createClient()

    try {
      console.log('Starting signup with email:', formData.email)
      
      // Step 1: Create Supabase Auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            phone: formData.phone,
            company: formData.company
          }
        }
      })

      console.log('Signup response:', { authData, signUpError })

      if (signUpError) {
        console.error('Signup error details:', signUpError)
        setError(`Signup failed: ${signUpError.message}`)
        setIsLoading(false)
        return
      }

      if (!authData.user) {
        setError('Failed to create account. Please try again.')
        setIsLoading(false)
        return
      }

      console.log('User created successfully:', authData.user.id)

      // Step 2: Create related records (user_profile, contact, lead)
      console.log('Creating profile records...')
      
      const response = await fetch('/api/portal/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: authData.user.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          intent: intent || 'portal_access',
          utmSource: searchParams.get('utm_source'),
          utmMedium: searchParams.get('utm_medium'),
          utmCampaign: searchParams.get('utm_campaign'),
          referrerUrl: typeof window !== 'undefined' ? document.referrer : null
        })
      })

      const profileData = await response.json()
      console.log('Profile creation response:', profileData)

      if (profileData.error || !profileData.success) {
        console.error('Profile creation error:', profileData)
        setError(
          profileData?.error || 
          'Account partially created. Please contact support@aizyantra.com'
        )
        setIsLoading(false)
        return
      }

      // Step 3: Auto sign in
      console.log('Signing in...')
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (signInError) {
        console.error('Sign in error:', signInError)
        setError('Account created but failed to sign in. Please try logging in manually.')
        setIsLoading(false)
        return
      }

      console.log('Sign in successful, redirecting...')

      // Step 4: Redirect based on intent
      if (intent === 'i2e-evaluation') {
        router.push('/portal/i2e-evaluation/new')
      } else {
        router.push('/portal/dashboard')
      }
      
      router.refresh()

    } catch (err) {
      console.error('Unexpected signup error:', err)
      setError(`An unexpected error occurred: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setIsLoading(false)
    }
  }

  const features = [
    intent === 'i2e-evaluation' 
      ? 'Free AI-powered idea evaluation'
      : 'Real-time project tracking',
    intent === 'i2e-evaluation'
      ? '7-10 day comprehensive analysis'
      : 'Secure document sharing',
    intent === 'i2e-evaluation'
      ? 'Score-based MVP pricing'
      : 'Direct team communication',
    'Transparent milestone updates'
  ]

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-950">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden">
                <Logo width={48} height={48} />
              </div>
              <span className="text-xl font-bold text-white">
                AIzYantra
              </span>
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            {intent === 'i2e-evaluation' && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/10 border border-teal-500/30 rounded-full mb-4">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span className="text-sm text-teal-400 font-medium">
                  Free Idea Evaluation
                </span>
              </div>
            )}
            <h1 className="text-3xl font-bold text-white mb-2">
              Create Your Account
            </h1>
            <p className="text-slate-400">
              {intent === 'i2e-evaluation' 
                ? 'Get started with your free startup idea evaluation'
                : 'Join AIzYantra to access your project portal'
              }
            </p>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSignup} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@company.com"
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Company (Optional) */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Company Name (Optional)
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Your Company"
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className="w-full pl-11 pr-12 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i < passwordStrength
                            ? passwordStrength <= 2
                              ? 'bg-red-500'
                              : passwordStrength <= 3
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                            : 'bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {passwordStrength <= 2 && 'Weak password'}
                    {passwordStrength === 3 && 'Moderate password'}
                    {passwordStrength === 4 && 'Strong password'}
                    {passwordStrength === 5 && 'Very strong password'}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className="w-full pl-11 pr-12 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 mt-1 rounded border-slate-600 bg-slate-900 text-teal-500 focus:ring-teal-500"
                  required
                />
                <span className="text-sm text-slate-400">
                  I agree to AIzYantra's{' '}
                  <Link href="/terms" className="text-teal-400 hover:text-teal-300">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-teal-400 hover:text-teal-300">
                    Privacy Policy
                  </Link>
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/25"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Create Account
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
            <p className="text-sm text-slate-400">
              Already have an account?{' '}
              <Link
                href="/portal/login"
                className="text-teal-400 hover:text-teal-300 font-medium transition-colors"
              >
                Sign in →
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-4 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors"
            >
              ← Back to homepage
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side - Feature Showcase */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-teal-500 to-blue-600 p-12 items-center justify-center relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

        {/* Content */}
        <div className="relative z-10 max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-6">
            {intent === 'i2e-evaluation' ? (
              <Sparkles className="w-8 h-8 text-white" />
            ) : (
              <CheckCircle2 className="w-8 h-8 text-white" />
            )}
          </div>

          <h2 className="text-3xl font-bold text-white mb-4">
            {intent === 'i2e-evaluation' 
              ? 'Turn your idea into reality'
              : 'Everything you need in one place'
            }
          </h2>

          <p className="text-white/80 text-lg mb-8">
            {intent === 'i2e-evaluation'
              ? 'Get a comprehensive AI-powered evaluation of your startup idea with actionable insights and score-based MVP pricing.'
              : 'Manage projects, track milestones, access documents, and communicate with your team—all in one secure portal.'
            }
          </p>

          <div className="space-y-4">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/90">{feature}</span>
              </div>
            ))}
          </div>

          {intent === 'i2e-evaluation' && (
            <div className="mt-12 p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <p className="text-white/80 text-sm mb-2">
                "The AI evaluation gave us insights we never would have discovered on our own. Worth every penny—and it's free!"
              </p>
              <div className="flex items-center gap-3 mt-4">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-white font-medium text-sm">PS</span>
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Priya Sharma</p>
                  <p className="text-white/60 text-xs">Founder, HealthTech Startup</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Wrapper with Suspense
export default function PortalSignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-teal-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading signup form...</p>
        </div>
      </div>
    }>
      <SignupContent />
    </Suspense>
  )
}