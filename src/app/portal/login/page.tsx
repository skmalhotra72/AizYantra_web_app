'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/ui/logo'
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn,
  Shield,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

export default function ClientLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const supabase = createClient()

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
        setIsLoading(false)
        return
      }

      if (data.user) {
        // Check if user has a profile
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('role, is_active')
          .eq('id', data.user.id)
          .single()

        if (profileError || !profile) {
          setError('User profile not found. Please contact administrator.')
          await supabase.auth.signOut()
          setIsLoading(false)
          return
        }

        if (!profile.is_active) {
          setError('Your account has been deactivated. Please contact administrator.')
          await supabase.auth.signOut()
          setIsLoading(false)
          return
        }

        // Check if user is a client
        if (profile.role !== 'client') {
          // If team member, redirect to CRM instead
          if (['super_admin', 'admin', 'team_member'].includes(profile.role)) {
            router.push('/crm')
            router.refresh()
            return
          }
          setError('Access denied. Invalid user role.')
          await supabase.auth.signOut()
          setIsLoading(false)
          return
        }

        // Redirect to client portal dashboard
        router.push('/portal/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  const features = [
    'Real-time project updates',
    'Secure document access',
    'Invoice management',
    'Direct communication',
  ]

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
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
            <h1 className="text-3xl font-bold text-white mb-2">
              Client Portal
            </h1>
            <p className="text-slate-400">
              Sign in to access your project dashboard
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-12 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-teal-500 focus:ring-teal-500"
                />
                <span className="text-sm text-slate-400">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                className="text-sm text-teal-400 hover:text-teal-300 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/25"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Team Member Link */}
          <div className="mt-6 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
            <p className="text-sm text-slate-400">
              Are you a team member?{' '}
              <Link
                href="/login"
                className="text-teal-400 hover:text-teal-300 font-medium transition-colors"
              >
                Access Team Login →
              </Link>
            </p>
          </div>

          {/* Help */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Need help?{' '}
              <Link
                href="/contact"
                className="text-teal-400 hover:text-teal-300 transition-colors"
              >
                Contact support
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
            <Shield className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-3xl font-bold text-white mb-4">
            Your project command center
          </h2>

          <p className="text-white/80 text-lg mb-8">
            Stay connected with real-time updates, secure access to all project materials, and transparent progress tracking.
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

          <div className="mt-12 p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <p className="text-white/80 text-sm mb-2">
              "The transparency is incredible. I can see exactly where we are on every milestone."
            </p>
            <div className="flex items-center gap-3 mt-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-white font-medium text-sm">RK</span>
              </div>
              <div>
                <p className="text-white font-medium text-sm">Rajesh Kumar</p>
                <p className="text-white/60 text-xs">CTO, Apollo Hospitals</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}