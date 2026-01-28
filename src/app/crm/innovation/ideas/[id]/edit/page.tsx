'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Save,
  Loader2,
  Lightbulb,
  AlertCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface IdeaFormData {
  title: string
  problem_statement: string
  proposed_solution: string
  target_users: string
  why_now: string
  industry_category: string
}

export default function EditIdeaPage() {
  const router = useRouter()
  const params = useParams()
  const ideaId = params.id as string

  const [formData, setFormData] = useState<IdeaFormData>({
    title: '',
    problem_statement: '',
    proposed_solution: '',
    target_users: '',
    why_now: '',
    industry_category: ''
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasExistingEvaluation, setHasExistingEvaluation] = useState(false)

  useEffect(() => {
    loadIdea()
  }, [ideaId])

  const loadIdea = async () => {
    setIsLoading(true)
    const supabase = createClient()
    
    // Load idea
    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .select('*')
      .eq('id', ideaId)
      .single()

    if (ideaError || !idea) {
      setError('Idea not found')
      setIsLoading(false)
      return
    }

    setFormData({
      title: idea.title || '',
      problem_statement: idea.problem_statement || '',
      proposed_solution: idea.proposed_solution || '',
      target_users: idea.target_users || '',
      why_now: idea.why_now || '',
      industry_category: idea.industry_category || ''
    })

    // Check if there's an existing evaluation
    const { data: evaluation } = await supabase
      .from('ai_evaluations')
      .select('id')
      .eq('idea_id', ideaId)
      .eq('stage_number', 2)
      .maybeSingle()

    setHasExistingEvaluation(!!evaluation)
    setIsLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/innovation/ideas/${ideaId}/edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          problem_statement: formData.problem_statement,
          proposed_solution: formData.proposed_solution || null,
          target_users: formData.target_users,
          why_now: formData.why_now || null,
          industry_category: formData.industry_category || null,
          resetForReEvaluation: hasExistingEvaluation
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save changes')
      }

      // Redirect back to idea detail page
      router.push(`/crm/innovation/ideas/${ideaId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--bg-primary))] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#FF6B35] animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading idea...</p>
        </div>
      </div>
    )
  }

  if (error && !formData.title) {
    return (
      <div className="min-h-screen bg-[hsl(var(--bg-primary))] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => router.push('/crm/innovation')}
            className="px-6 py-3 bg-[#FF6B35] text-white rounded-lg hover:bg-[#ff8555] transition-colors"
          >
            Back to Dashboard
          </button>
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
              onClick={() => router.push(`/crm/innovation/ideas/${ideaId}`)}
              className="p-2 hover:bg-[hsl(var(--bg-secondary))] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Edit Idea</h1>
              <p className="text-sm text-gray-400">
                Update your idea and resubmit for AI evaluation
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {hasExistingEvaluation && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-orange-500/20 border border-orange-500/50 rounded-lg"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-orange-400 font-medium">Previous Evaluation Will Be Cleared</p>
                  <p className="text-orange-300/80 text-sm mt-1">
                    Saving changes will reset this idea to Stage 1 and delete the previous AI evaluation. 
                    You'll be able to request a new evaluation after saving.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-6"
            >
              <label className="block text-white font-medium mb-2">
                Idea Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35] transition-colors"
                placeholder="A concise title for your idea"
              />
            </motion.div>

            {/* Problem Statement */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-6"
            >
              <label className="block text-white font-medium mb-2">
                Problem Statement <span className="text-red-400">*</span>
              </label>
              <p className="text-gray-400 text-sm mb-3">
                Describe the problem you're solving. Be specific about who experiences this problem and how severe it is.
              </p>
              <textarea
                name="problem_statement"
                value={formData.problem_statement}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-4 py-3 bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35] transition-colors resize-none"
                placeholder="What problem are you solving? Who has this problem? How painful is it?"
              />
            </motion.div>

            {/* Target Users */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-6"
            >
              <label className="block text-white font-medium mb-2">
                Target Users <span className="text-red-400">*</span>
              </label>
              <p className="text-gray-400 text-sm mb-3">
                Who are your ideal users? Be as specific as possible about demographics, roles, and characteristics.
              </p>
              <textarea
                name="target_users"
                value={formData.target_users}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-4 py-3 bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35] transition-colors resize-none"
                placeholder="e.g., Small business owners in retail, aged 30-50, who struggle with inventory management"
              />
            </motion.div>

            {/* Proposed Solution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-6"
            >
              <label className="block text-white font-medium mb-2">
                Proposed Solution
              </label>
              <p className="text-gray-400 text-sm mb-3">
                How do you plan to solve this problem? What's your approach?
              </p>
              <textarea
                name="proposed_solution"
                value={formData.proposed_solution}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35] transition-colors resize-none"
                placeholder="Describe your solution approach..."
              />
            </motion.div>

            {/* Why Now */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-6"
            >
              <label className="block text-white font-medium mb-2">
                Why Now? (Timing)
              </label>
              <p className="text-gray-400 text-sm mb-3">
                What makes this the right time to solve this problem? Any market trends or technological shifts?
              </p>
              <textarea
                name="why_now"
                value={formData.why_now}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35] transition-colors resize-none"
                placeholder="Why is now the right time for this solution?"
              />
            </motion.div>

            {/* Industry Category */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-6"
            >
              <label className="block text-white font-medium mb-2">
                Industry Category
              </label>
              <select
                name="industry_category"
                value={formData.industry_category}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-[#FF6B35] transition-colors"
              >
                <option value="">Select an industry</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Finance">Finance</option>
                <option value="Retail">Retail</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Technology">Technology</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Logistics">Logistics</option>
                <option value="Agriculture">Agriculture</option>
                <option value="Other">Other</option>
              </select>
            </motion.div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-4 pt-4"
            >
              <button
                type="button"
                onClick={() => router.push(`/crm/innovation/ideas/${ideaId}`)}
                className="px-6 py-3 bg-[#2a2a2a] text-white rounded-lg hover:bg-[#3a3a3a] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#FF6B35] text-white rounded-lg hover:bg-[#ff8555] disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {hasExistingEvaluation ? 'Save & Reset for Re-evaluation' : 'Save Changes'}
                  </>
                )}
              </button>
            </motion.div>
          </form>
        </div>
      </div>
    </div>
  )
}