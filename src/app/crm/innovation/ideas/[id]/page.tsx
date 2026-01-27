'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Lightbulb, 
  Users, 
  Target, 
  Clock,
  User,
  Calendar,
  Loader2,
  CheckCircle2
} from 'lucide-react'
import { getIdeaById, getStageByNumber } from '@/lib/innovation/i2e-db'
import type { Idea, WorkflowStage } from '@/lib/innovation/i2e-db'

export default function IdeaDetailPage() {
  const router = useRouter()
  const params = useParams()
  const ideaId = params.id as string

  const [idea, setIdea] = useState<Idea | null>(null)
  const [stage, setStage] = useState<WorkflowStage | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadIdea()
  }, [ideaId])

  const loadIdea = async () => {
    setIsLoading(true)
    const ideaData = await getIdeaById(ideaId)
    
    if (ideaData) {
      setIdea(ideaData)
      const stageData = await getStageByNumber(ideaData.current_stage)
      setStage(stageData)
    }
    
    setIsLoading(false)
  }

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
      approved: 'bg-green-500/10 text-green-500 border-green-500/20',
      declined: 'bg-red-500/10 text-red-500 border-red-500/20',
      on_hold: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      completed: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    }
    return colors[status as keyof typeof colors] || colors.active
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--bg-primary))] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[hsl(var(--accent-primary))] animate-spin mx-auto mb-4" />
          <p className="text-[hsl(var(--foreground-muted))]">Loading idea...</p>
        </div>
      </div>
    )
  }

  if (!idea) {
    return (
      <div className="min-h-screen bg-[hsl(var(--bg-primary))] flex items-center justify-center">
        <div className="text-center">
          <Lightbulb className="w-16 h-16 text-[hsl(var(--foreground-muted))] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-2">
            Idea Not Found
          </h2>
          <p className="text-[hsl(var(--foreground-muted))] mb-6">
            The idea you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => router.push('/crm/innovation')}
            className="btn-tactile btn-tactile-primary"
          >
            Back to Innovation Dashboard
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
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push('/crm/innovation')}
              className="p-2 hover:bg-[hsl(var(--bg-secondary))] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[hsl(var(--foreground-muted))]" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">
                  {idea.title}
                </h1>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(idea.status)}`}>
                  {idea.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              {stage && (
                <p className="text-sm text-[hsl(var(--foreground-muted))]">
                  Stage {stage.stage_number}: {stage.name}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Metadata */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-bordered p-4 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-[hsl(var(--foreground-muted))]" />
              <div>
                <p className="text-xs text-[hsl(var(--foreground-muted))]">Submitted</p>
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                  {new Date(idea.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-[hsl(var(--foreground-muted))]" />
              <div>
                <p className="text-xs text-[hsl(var(--foreground-muted))]">Submitter</p>
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                  {idea.is_anonymous ? 'Anonymous' : 'Team Member'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[hsl(var(--foreground-muted))]" />
              <div>
                <p className="text-xs text-[hsl(var(--foreground-muted))]">Current Stage</p>
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                  {idea.current_stage} of 10
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-[hsl(var(--foreground-muted))]" />
              <div>
                <p className="text-xs text-[hsl(var(--foreground-muted))]">Last Updated</p>
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                  {new Date(idea.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Problem Statement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-bordered p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-[hsl(var(--accent-primary))]" />
              <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">
                Problem Statement
              </h2>
            </div>
            <p className="text-[hsl(var(--foreground-muted))] leading-relaxed">
              {idea.problem_statement}
            </p>
          </motion.div>

          {/* Target Users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-bordered p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-[hsl(var(--accent-primary))]" />
              <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">
                Target Users
              </h2>
            </div>
            <p className="text-[hsl(var(--foreground-muted))]">
              {idea.target_users}
            </p>
          </motion.div>

          {/* Proposed Solution */}
          {idea.proposed_solution && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card-bordered p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-[hsl(var(--accent-primary))]" />
                <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">
                  Proposed Solution
                </h2>
              </div>
              <p className="text-[hsl(var(--foreground-muted))] leading-relaxed">
                {idea.proposed_solution}
              </p>
            </motion.div>
          )}

          {/* Industry Category */}
          {idea.industry_category && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card-bordered p-4"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm text-[hsl(var(--foreground-muted))]">
                  Industry:
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-[hsl(var(--bg-secondary))] text-[hsl(var(--foreground))]">
                  {idea.industry_category}
                </span>
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-3 pt-4"
          >
            <button
              onClick={() => router.push('/crm/innovation')}
              className="btn-tactile btn-tactile-outline"
            >
              Back to Dashboard
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}