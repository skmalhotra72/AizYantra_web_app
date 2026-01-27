'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  ArrowLeft, 
  Lightbulb, 
  Users, 
  Target, 
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react'

export default function NewIdeaPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    problem: '',
    target_audience: '',
    proposed_solution: '',
    expected_impact: '',
    notes: ''
  })

  // Check authentication on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const supabase = createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      

      
      if (!user) {
        console.error('❌ No user found, redirecting to login')
        router.push('/login')
        return
      }

      // Get user's name from team_members
      const { data: teamMember, error: teamError } = await supabase
        .from('team_members')
        .select('name')
        .eq('user_id', user.id)
        .single()

    

      setUserId(user.id)
      setUserName(teamMember?.name || user.email || 'Unknown')
      setIsCheckingAuth(false)
    } catch (err) {
      console.error('❌ Auth check error:', err)
      router.push('/login')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // 🔍 DEBUG: Check auth state at submission time
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    console.log('🔐 AUTH DEBUG AT SUBMIT:', {
      user: user,
      userId: user?.id,
      email: user?.email,
      authError: authError,
      userIdFromState: userId
    })

    if (!user) {
      console.error('❌ User not authenticated at submit time!')
      setError('Not authenticated! Please login again.')
      setTimeout(() => router.push('/login'), 2000)
      setIsLoading(false)
      return
    }

    if (!userId) {
      console.error('❌ userId from state is null!')
      setError('You must be logged in to submit an idea')
      setIsLoading(false)
      return
    }

    try {
   
      
      // Insert the new idea - BULLETPROOF VERSION
      const insertData: any = {
        title: formData.title,
        problem_statement: formData.problem,
        target_users: formData.target_audience,
        created_by: userId,
        current_stage: 1,
        status: 'active',
        is_anonymous: false
      }
    
      // Only add optional fields if they have values
      if (formData.proposed_solution && formData.proposed_solution.trim()) {
        insertData.proposed_solution = formData.proposed_solution
      }
    
      const { data, error: insertError } = await supabase
        .from('ideas')
        .insert(insertData)
        .select()
        .single()



      if (insertError) {
        console.error('❌ Insert Error:', insertError)
        throw insertError
      }

  
      
      // Show success message
      setSuccess(true)
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/crm/innovation')
      }, 2000)

    } catch (err: any) {
      console.error('❌ Error submitting idea:', err)
      setError(err.message || 'Failed to submit idea. Please try again.')
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[hsl(var(--bg-primary))] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[hsl(var(--accent-primary))] animate-spin mx-auto mb-4" />
          <p className="text-[hsl(var(--foreground-muted))]">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[hsl(var(--bg-primary))] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-2">
            Idea Submitted Successfully!
          </h2>
          <p className="text-[hsl(var(--foreground-muted))] mb-6">
            Your idea has been submitted for review. Redirecting to dashboard...
          </p>
          <Loader2 className="w-6 h-6 text-[hsl(var(--accent-primary))] animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-primary))]">
      {/* Header */}
      <div className="border-b border-[hsl(var(--border))]">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/crm/innovation')}
              className="p-2 hover:bg-[hsl(var(--bg-secondary))] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[hsl(var(--foreground-muted))]" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">
                Submit New Idea
              </h1>
              <p className="text-sm text-[hsl(var(--foreground-muted))] mt-1">
                Share your innovative concept with the team
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* User Info */}
          <div className="card-bordered p-4 mb-6 bg-[hsl(var(--accent-primary)/.05)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white">
                  {userName?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                  Submitting as
                </p>
                <p className="text-xs text-[hsl(var(--foreground-muted))]">
                  {userName}
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="card-bordered p-4 mb-6 bg-red-500/10 border-red-500/20">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-red-500 font-medium">Error</p>
                  <p className="text-red-400 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form Card */}
          <form onSubmit={handleSubmit} className="card-bordered p-6 space-y-6">
            {/* Idea Title */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                <Lightbulb className="w-4 h-4" />
                Idea Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Give your idea a catchy title"
                required
                className="w-full px-4 py-3 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-subtle))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-primary))] transition-all"
              />
            </div>

            {/* Problem Statement */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                <AlertCircle className="w-4 h-4" />
                What problem does this solve? *
              </label>
              <textarea
                name="problem"
                value={formData.problem}
                onChange={handleChange}
                placeholder="Describe the problem or pain point this idea addresses"
                required
                rows={4}
                className="w-full px-4 py-3 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-subtle))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-primary))] transition-all resize-none"
              />
            </div>

            {/* Target Audience */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                <Users className="w-4 h-4" />
                Who is this for? *
              </label>
              <input
                type="text"
                name="target_audience"
                value={formData.target_audience}
                onChange={handleChange}
                placeholder="e.g., Healthcare providers, SMBs in retail, etc."
                required
                className="w-full px-4 py-3 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-subtle))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-primary))] transition-all"
              />
            </div>

            {/* Proposed Solution */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                <Target className="w-4 h-4" />
                Proposed Solution (Optional)
              </label>
              <textarea
                name="proposed_solution"
                value={formData.proposed_solution}
                onChange={handleChange}
                placeholder="How do you envision solving this problem?"
                rows={4}
                className="w-full px-4 py-3 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-subtle))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-primary))] transition-all resize-none"
              />
            </div>

            {/* Expected Impact */}
            <div>
              <label className="text-sm font-medium text-[hsl(var(--foreground))] mb-2 block">
                Expected Impact (Optional)
              </label>
              <textarea
                name="expected_impact"
                value={formData.expected_impact}
                onChange={handleChange}
                placeholder="What impact could this have on our business or clients?"
                rows={3}
                className="w-full px-4 py-3 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-subtle))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-primary))] transition-all resize-none"
              />
            </div>

            {/* Additional Notes */}
            <div>
              <label className="text-sm font-medium text-[hsl(var(--foreground))] mb-2 block">
                Additional Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any other details, references, or context"
                rows={3}
                className="w-full px-4 py-3 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-subtle))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-primary))] transition-all resize-none"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center gap-3 pt-4 border-t border-[hsl(var(--border))]">
              <button
                type="button"
                onClick={() => router.push('/crm/innovation')}
                disabled={isLoading}
                className="btn-tactile btn-tactile-outline flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-tactile btn-tactile-primary flex-1 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Lightbulb className="w-4 h-4" />
                    Submit Idea
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-[hsl(var(--accent-primary)/.05)] border border-[hsl(var(--accent-primary)/.2)] rounded-lg">
            <p className="text-sm text-[hsl(var(--foreground-muted))]">
              <strong className="text-[hsl(var(--foreground))]">Note:</strong> Your idea will be reviewed by the team through our 10-stage evaluation process. 
              You'll be notified as it progresses through each stage.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}