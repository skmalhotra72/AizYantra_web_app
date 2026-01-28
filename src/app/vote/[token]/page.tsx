'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import {
  Vote,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Lightbulb,
  FileText,
  AlertTriangle,
  Lock,
  ArrowRight,
  Plus,
  X
} from 'lucide-react'

interface VotingData {
  valid: boolean
  canVote?: boolean
  alreadyVoted?: boolean
  sessionClosed?: boolean
  deadlinePassed?: boolean
  votedAt?: string
  session?: {
    id: string
    title: string
    description: string
    status: string
    deadline: string | null
    decision?: string
  }
  idea?: {
    id: string
    title: string
    problemStatement: string
    targetUsers: string
    proposedSolution: string
    industry: string
    submittedBy: string
  }
  voter?: {
    name: string
    role: string
    votingPoints: number
  }
  evaluations?: Array<{
    stage: number
    type: string
    passed: boolean
    summary: string | null
    score: number | null
  }>
  progress?: {
    votesSubmitted: number
    totalVoters: number
    remaining: number
  }
  votingInfo?: {
    yourPoints: number
    totalPossiblePoints: number
    approvalThreshold: number
  }
}

export default function VotePage() {
  const params = useParams()
  const token = params.token as string

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [votingData, setVotingData] = useState<VotingData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  // Vote form state
  const [vote, setVote] = useState<'approve' | 'reject' | 'abstain' | null>(null)
  const [confidence, setConfidence] = useState<number>(3)
  const [feedback, setFeedback] = useState('')
  const [concerns, setConcerns] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [newConcern, setNewConcern] = useState('')
  const [newSuggestion, setNewSuggestion] = useState('')

  useEffect(() => {
    if (token) {
      loadVotingData()
    }
  }, [token])

  const loadVotingData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/innovation/voting/token/${token}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load voting session')
      }

      setVotingData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load voting session')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitVote = async () => {
    if (!vote) {
      setError('Please select your vote')
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const response = await fetch('/api/innovation/voting/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          vote,
          confidence,
          feedback: feedback || null,
          concerns: concerns.length > 0 ? concerns : null,
          suggestions: suggestions.length > 0 ? suggestions : null
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit vote')
      }

      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit vote')
    } finally {
      setSubmitting(false)
    }
  }

  const addConcern = () => {
    if (newConcern.trim()) {
      setConcerns([...concerns, newConcern.trim()])
      setNewConcern('')
    }
  }

  const addSuggestion = () => {
    if (newSuggestion.trim()) {
      setSuggestions([...suggestions, newSuggestion.trim()])
      setNewSuggestion('')
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#FF6B35] animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading voting session...</p>
        </div>
      </div>
    )
  }

  // Error state - invalid token
  if (error && !votingData) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="bg-[#141414] rounded-2xl border border-red-500/30 p-8 max-w-md text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Invalid Voting Link</h1>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    )
  }

  // Already voted
  if (votingData?.alreadyVoted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="bg-[#141414] rounded-2xl border border-green-500/30 p-8 max-w-md text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Already Voted</h1>
          <p className="text-gray-400 mb-4">
            You have already submitted your vote for this session.
          </p>
          <p className="text-sm text-gray-500">
            Voted on: {new Date(votingData.votedAt!).toLocaleString()}
          </p>
        </div>
      </div>
    )
  }

  // Session closed
  if (votingData?.sessionClosed) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="bg-[#141414] rounded-2xl border border-yellow-500/30 p-8 max-w-md text-center">
          <Lock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Voting Closed</h1>
          <p className="text-gray-400 mb-4">This voting session has ended.</p>
          {votingData.session?.decision && (
            <div className="bg-[#0a0a0a] rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Final Decision</p>
              <p className="text-xl font-bold text-[#FF6B35] capitalize">
                {votingData.session.decision}
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Deadline passed
  if (votingData?.deadlinePassed) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="bg-[#141414] rounded-2xl border border-red-500/30 p-8 max-w-md text-center">
          <Clock className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Deadline Passed</h1>
          <p className="text-gray-400">The voting deadline has passed.</p>
        </div>
      </div>
    )
  }

  // Vote submitted successfully
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="bg-[#141414] rounded-2xl border border-green-500/30 p-8 max-w-md text-center">
          <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Vote Submitted!</h1>
          <p className="text-gray-400 mb-6">
            Thank you for participating in the founder voting process.
          </p>
          <div className="bg-[#0a0a0a] rounded-xl p-4 mb-6">
            <p className="text-gray-400 text-sm">Your vote</p>
            <p className="text-2xl font-bold text-white capitalize">{vote}</p>
            <p className="text-sm text-[#FF6B35]">
              {vote === 'approve' ? `+${votingData?.voter?.votingPoints} points` : '0 points'}
            </p>
          </div>
          <p className="text-sm text-gray-500">
            You will be notified when voting concludes.
          </p>
        </div>
      </div>
    )
  }

  // Main voting interface
  return (
    <div className="min-h-screen bg-[#0a0a0a] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-[#FF6B35] to-[#ff8555] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#FF6B35]/20">
            <Vote className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Founder Voting</h1>
          <p className="text-gray-400">{votingData?.session?.title}</p>
        </div>

        {/* Voter Info Card */}
        <div className="bg-gradient-to-br from-[#141414] to-[#1a1a1a] rounded-2xl border border-[#252525] p-5 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Voting as</p>
              <p className="text-white font-semibold text-lg">{votingData?.voter?.name}</p>
              <p className="text-gray-400 text-sm">{votingData?.voter?.role}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500 text-sm">Your Voting Power</p>
              <p className="text-3xl font-bold text-[#FF6B35]">
                {votingData?.voter?.votingPoints}
                <span className="text-base text-gray-500 ml-1">pts</span>
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-[#141414] rounded-2xl border border-[#252525] p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-sm">Voting Progress</span>
            <span className="text-white font-medium">
              {votingData?.progress?.votesSubmitted}/{votingData?.progress?.totalVoters} votes
            </span>
          </div>
          <div className="w-full bg-[#252525] rounded-full h-3">
            <div
              className="bg-gradient-to-r from-[#FF6B35] to-[#ff8555] h-3 rounded-full transition-all duration-500"
              style={{
                width: `${((votingData?.progress?.votesSubmitted || 0) / (votingData?.progress?.totalVoters || 8)) * 100}%`
              }}
            />
          </div>
          {votingData?.session?.deadline && (
            <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Deadline: {new Date(votingData.session.deadline).toLocaleString()}
            </p>
          )}
        </div>

        {/* Idea Summary */}
        <div className="bg-[#141414] rounded-2xl border border-[#252525] p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-[#FF6B35]" />
            {votingData?.idea?.title}
          </h2>

          <div className="space-y-4">
            <div className="bg-[#0a0a0a] rounded-xl p-4">
              <h3 className="text-sm font-medium text-[#FF6B35] mb-2">Problem Statement</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {votingData?.idea?.problemStatement}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0a0a0a] rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Target Users</h3>
                <p className="text-gray-300 text-sm">{votingData?.idea?.targetUsers}</p>
              </div>
              <div className="bg-[#0a0a0a] rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Industry</h3>
                <p className="text-gray-300 text-sm">{votingData?.idea?.industry}</p>
              </div>
            </div>

            {votingData?.idea?.proposedSolution && (
              <div className="bg-[#0a0a0a] rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Proposed Solution</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {votingData?.idea?.proposedSolution?.substring(0, 300)}...
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Evaluation Summary */}
        {votingData?.evaluations && votingData.evaluations.length > 0 && (
          <div className="bg-[#141414] rounded-2xl border border-[#252525] p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#FF6B35]" />
              AI Evaluation Summary
            </h3>
            <div className="space-y-3">
              {votingData.evaluations.map((ev) => (
                <div
                  key={ev.stage}
                  className="flex items-center justify-between bg-[#0a0a0a] rounded-xl p-4"
                >
                  <div className="flex items-center gap-3">
                    {ev.passed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    )}
                    <div>
                      <span className="text-gray-300 text-sm">
                        Stage {ev.stage}: {ev.type.replace(/_/g, ' ')}
                      </span>
                      {ev.summary && (
                        <p className="text-gray-500 text-xs mt-1 line-clamp-1">{ev.summary}</p>
                      )}
                    </div>
                  </div>
                  {ev.score && (
                    <span className="text-white font-medium bg-[#252525] px-3 py-1 rounded-lg text-sm">
                      {typeof ev.score === 'number' && ev.score > 10 ? ev.score : `${ev.score}/10`}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Voting Section */}
        <div className="bg-[#141414] rounded-2xl border border-[#252525] p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-6">Cast Your Vote</h3>

          {/* Vote Options */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <button
              onClick={() => setVote('approve')}
              className={`p-6 rounded-2xl border-2 transition-all duration-200 ${
                vote === 'approve'
                  ? 'border-green-500 bg-green-500/10 scale-105'
                  : 'border-[#252525] hover:border-green-500/50 hover:bg-green-500/5'
              }`}
            >
              <ThumbsUp className={`w-10 h-10 mx-auto mb-3 ${vote === 'approve' ? 'text-green-500' : 'text-gray-500'}`} />
              <p className={`font-semibold text-lg ${vote === 'approve' ? 'text-green-500' : 'text-white'}`}>
                APPROVE
              </p>
              <p className="text-xs text-gray-500 mt-1">+{votingData?.voter?.votingPoints} pts</p>
            </button>

            <button
              onClick={() => setVote('reject')}
              className={`p-6 rounded-2xl border-2 transition-all duration-200 ${
                vote === 'reject'
                  ? 'border-red-500 bg-red-500/10 scale-105'
                  : 'border-[#252525] hover:border-red-500/50 hover:bg-red-500/5'
              }`}
            >
              <ThumbsDown className={`w-10 h-10 mx-auto mb-3 ${vote === 'reject' ? 'text-red-500' : 'text-gray-500'}`} />
              <p className={`font-semibold text-lg ${vote === 'reject' ? 'text-red-500' : 'text-white'}`}>
                REJECT
              </p>
              <p className="text-xs text-gray-500 mt-1">0 pts</p>
            </button>

            <button
              onClick={() => setVote('abstain')}
              className={`p-6 rounded-2xl border-2 transition-all duration-200 ${
                vote === 'abstain'
                  ? 'border-yellow-500 bg-yellow-500/10 scale-105'
                  : 'border-[#252525] hover:border-yellow-500/50 hover:bg-yellow-500/5'
              }`}
            >
              <MinusCircle className={`w-10 h-10 mx-auto mb-3 ${vote === 'abstain' ? 'text-yellow-500' : 'text-gray-500'}`} />
              <p className={`font-semibold text-lg ${vote === 'abstain' ? 'text-yellow-500' : 'text-white'}`}>
                ABSTAIN
              </p>
              <p className="text-xs text-gray-500 mt-1">0 pts</p>
            </button>
          </div>

          {/* Confidence Level */}
          <div className="mb-6">
            <label className="block text-gray-400 text-sm mb-3">Confidence Level</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => setConfidence(level)}
                  className={`flex-1 py-3 rounded-xl border-2 transition-all ${
                    confidence === level
                      ? 'border-[#FF6B35] bg-[#FF6B35]/10 text-[#FF6B35]'
                      : 'border-[#252525] text-gray-400 hover:border-[#FF6B35]/50'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              1 = Very uncertain • 5 = Highly confident
            </p>
          </div>

          {/* Feedback */}
          <div className="mb-6">
            <label className="block text-gray-400 text-sm mb-2">
              Feedback <span className="text-gray-600">(optional, anonymous)</span>
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your thoughts, concerns, or suggestions..."
              rows={3}
              className="w-full bg-[#0a0a0a] border border-[#252525] rounded-xl p-4 text-white placeholder-gray-600 focus:border-[#FF6B35] focus:outline-none focus:ring-1 focus:ring-[#FF6B35]/50 resize-none"
            />
          </div>

          {/* Concerns */}
          <div className="mb-6">
            <label className="block text-gray-400 text-sm mb-2">Add Concerns</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newConcern}
                onChange={(e) => setNewConcern(e.target.value)}
                placeholder="Type a concern..."
                className="flex-1 bg-[#0a0a0a] border border-[#252525] rounded-xl px-4 py-2 text-white placeholder-gray-600 focus:border-[#FF6B35] focus:outline-none"
                onKeyPress={(e) => e.key === 'Enter' && addConcern()}
              />
              <button
                onClick={addConcern}
                className="px-4 py-2 bg-[#252525] text-white rounded-xl hover:bg-[#303030] transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {concerns.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {concerns.map((c, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full text-sm flex items-center gap-2"
                  >
                    {c}
                    <button onClick={() => setConcerns(concerns.filter((_, idx) => idx !== i))}>
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Suggestions */}
          <div className="mb-8">
            <label className="block text-gray-400 text-sm mb-2">Add Suggestions</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newSuggestion}
                onChange={(e) => setNewSuggestion(e.target.value)}
                placeholder="Type a suggestion..."
                className="flex-1 bg-[#0a0a0a] border border-[#252525] rounded-xl px-4 py-2 text-white placeholder-gray-600 focus:border-[#FF6B35] focus:outline-none"
                onKeyPress={(e) => e.key === 'Enter' && addSuggestion()}
              />
              <button
                onClick={addSuggestion}
                className="px-4 py-2 bg-[#252525] text-white rounded-xl hover:bg-[#303030] transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-full text-sm flex items-center gap-2"
                  >
                    {s}
                    <button onClick={() => setSuggestions(suggestions.filter((_, idx) => idx !== i))}>
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmitVote}
            disabled={!vote || submitting}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
              vote && !submitting
                ? 'bg-gradient-to-r from-[#FF6B35] to-[#ff8555] hover:shadow-lg hover:shadow-[#FF6B35]/25 text-white'
                : 'bg-[#252525] text-gray-500 cursor-not-allowed'
            }`}
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting Vote...
              </>
            ) : (
              <>
                Submit Vote
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          {/* Threshold Info */}
          <div className="mt-6 p-4 bg-[#0a0a0a] rounded-xl border border-[#252525]">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Approval Threshold</span>
              <span className="text-white font-medium">
                <span className="text-[#FF6B35]">700</span> / 1100 points (63.6%)
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-sm">
          Your vote is anonymous. Only the vote outcome is visible to others.
        </p>
      </div>
    </div>
  )
}