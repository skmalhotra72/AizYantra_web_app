'use client'

import { useState, useEffect } from 'react'
import {
  Vote,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  PlayCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Award,
  AlertTriangle,
  Send,
  ExternalLink
} from 'lucide-react'

interface VotingSession {
  id: string
  title: string
  status: 'pending' | 'active' | 'closed' | 'tallied'
  startTime: string
  endTime?: string
  deadline?: string
  sessionNumber: number
}

interface VotingProgress {
  totalVoters: number
  votesSubmitted: number
  votesRemaining: number
  progressPercent: number
  pendingVoters: Array<{ name: string; role: string; points: number }>
}

interface VotingPoints {
  currentPoints: number
  maxPossiblePoints: number
  approvalThreshold: number
  pointsPercent: number
  isApproved: boolean
}

interface VotingResults {
  finalDecision: 'approved' | 'conditional' | 'hold' | 'declined'
  decisionNotes: string
  voteBreakdown: {
    approve: number
    reject: number
    abstain: number
    totalPoints: number
  }
  anonymousFeedback: Array<{
    feedback: string | null
    concerns: string[] | null
    suggestions: string[] | null
    confidence: number | null
  }>
}

interface VotingPanelProps {
  ideaId: string
  currentStage: number
  onVotingComplete?: (decision: string) => void
}

export default function VotingPanel({ ideaId, currentStage, onVotingComplete }: VotingPanelProps) {
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [expanded, setExpanded] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [session, setSession] = useState<VotingSession | null>(null)
  const [progress, setProgress] = useState<VotingProgress | null>(null)
  const [points, setPoints] = useState<VotingPoints | null>(null)
  const [results, setResults] = useState<VotingResults | null>(null)
  const [voters, setVoters] = useState<Array<{ name: string; email: string; votingUrl: string }>>([])

  useEffect(() => {
    if (ideaId && currentStage >= 6) {
      loadVotingStatus()
    }
  }, [ideaId, currentStage])

  const loadVotingStatus = async () => {
    try {
      setLoading(true)
      setError(null)

      // First check if there's an existing voting session
      const response = await fetch(`/api/innovation/voting/by-idea/${ideaId}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.session) {
          setSession(data.session)
          setProgress(data.progress)
          setPoints(data.points)
          setResults(data.results)
        }
      }
    } catch (err) {
      console.error('Error loading voting status:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSession = async () => {
    try {
      setCreating(true)
      setError(null)

      const response = await fetch('/api/innovation/voting/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create voting session')
      }

      setSession(data.session)
      setVoters(data.voters)
      
      // Refresh status
      await loadVotingStatus()

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session')
    } finally {
      setCreating(false)
    }
  }

  const handleTallyVotes = async () => {
    if (!session?.id) return

    try {
      setLoading(true)
      const response = await fetch(`/api/innovation/voting/session/${session.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'tally' })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to tally votes')
      }

      // Refresh status
      await loadVotingStatus()

      if (onVotingComplete) {
        onVotingComplete(data.result?.decision)
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to tally votes')
    } finally {
      setLoading(false)
    }
  }

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'approved': return 'text-green-500 bg-green-500/10 border-green-500/30'
      case 'conditional': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30'
      case 'hold': return 'text-orange-500 bg-orange-500/10 border-orange-500/30'
      case 'declined': return 'text-red-500 bg-red-500/10 border-red-500/30'
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/30'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <span className="w-2 h-2 bg-blue-400 rounded-full inline-block mr-1.5 animate-pulse" />
            Voting Active
          </span>
        )
      case 'tallied':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
            <CheckCircle2 className="w-3 h-3 inline mr-1" />
            Complete
          </span>
        )
      case 'closed':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30">
            Closed
          </span>
        )
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30">
            Pending
          </span>
        )
    }
  }

  // Not ready for voting yet
  if (currentStage < 6) {
    return (
      <div className="bg-[#141414] rounded-2xl border border-[#252525] p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gray-500/10 flex items-center justify-center">
            <Vote className="w-5 h-5 text-gray-500" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Founder Voting</h3>
            <p className="text-gray-500 text-sm">Stage 7</p>
          </div>
          <span className="ml-auto px-3 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30">
            Locked
          </span>
        </div>
        <p className="text-gray-500 text-sm">
          Complete Pitch Deck (Stage 6) to unlock founder voting.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-[#141414] rounded-2xl border border-[#252525] overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 flex items-center gap-3 hover:bg-[#1a1a1a] transition-colors"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B35]/20 to-[#FF6B35]/5 flex items-center justify-center">
          <Vote className="w-5 h-5 text-[#FF6B35]" />
        </div>
        <div className="text-left">
          <h3 className="text-white font-semibold">Founder Voting</h3>
          <p className="text-gray-500 text-sm">Stage 7 - Democratic Decision</p>
        </div>
        {session && getStatusBadge(session.status)}
        <div className="ml-auto">
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </div>
      </button>

      {/* Content */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-[#252525]">
          {loading ? (
            <div className="py-8 text-center">
              <Loader2 className="w-8 h-8 text-[#FF6B35] animate-spin mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Loading voting status...</p>
            </div>
          ) : !session ? (
            // No session yet - show create button
            <div className="py-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#252525] flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-500" />
              </div>
              <h4 className="text-white font-medium mb-2">Ready for Founder Voting</h4>
              <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
                Start a voting session to let all 8 founders vote on this idea. 
                Each founder receives an anonymous voting link.
              </p>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4 text-left">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={handleCreateSession}
                disabled={creating}
                className="px-6 py-3 bg-gradient-to-r from-[#FF6B35] to-[#ff8555] text-white font-medium rounded-xl hover:shadow-lg hover:shadow-[#FF6B35]/25 transition-all flex items-center gap-2 mx-auto disabled:opacity-50"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Session...
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-5 h-5" />
                    Start Voting Session
                  </>
                )}
              </button>

              <div className="mt-6 p-4 bg-[#0a0a0a] rounded-xl border border-[#252525]">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Approval Threshold</span>
                  <span className="text-white">
                    <span className="text-[#FF6B35] font-medium">700</span> / 1100 points (63.6%)
                  </span>
                </div>
              </div>
            </div>
          ) : session.status === 'active' ? (
            // Active voting session
            <div className="py-4">
              {/* Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Voting Progress</span>
                  <span className="text-white font-medium">
                    {progress?.votesSubmitted || 0} / {progress?.totalVoters || 8} votes
                  </span>
                </div>
                <div className="w-full bg-[#252525] rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-[#FF6B35] to-[#ff8555] h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progress?.progressPercent || 0}%` }}
                  />
                </div>
              </div>

              {/* Points Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Current Points</span>
                  <span className="text-white font-medium">
                    {points?.currentPoints || 0} / {points?.maxPossiblePoints || 1100}
                  </span>
                </div>
                <div className="w-full bg-[#252525] rounded-full h-3 relative">
                  {/* Threshold marker */}
                  <div 
                    className="absolute top-0 bottom-0 w-0.5 bg-yellow-500 z-10"
                    style={{ left: '63.6%' }}
                  />
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      (points?.currentPoints || 0) >= 700 
                        ? 'bg-green-500' 
                        : 'bg-blue-500'
                    }`}
                    style={{ width: `${points?.pointsPercent || 0}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  700 points needed for approval (yellow line)
                </p>
              </div>

              {/* Pending Voters */}
              {progress?.pendingVoters && progress.pendingVoters.length > 0 && (
                <div className="mb-6">
                  <p className="text-gray-400 text-sm mb-2">Waiting for votes from:</p>
                  <div className="flex flex-wrap gap-2">
                    {progress.pendingVoters.map((voter, i) => (
                      <span 
                        key={i}
                        className="px-3 py-1 bg-[#252525] rounded-full text-sm text-gray-300"
                      >
                        {voter.name} ({voter.points}pts)
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Deadline */}
              {session.deadline && (
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-6">
                  <Clock className="w-4 h-4" />
                  Deadline: {new Date(session.deadline).toLocaleString()}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleTallyVotes}
                  disabled={loading || (progress?.votesSubmitted || 0) === 0}
                  className="flex-1 px-4 py-3 bg-[#252525] text-white font-medium rounded-xl hover:bg-[#303030] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <BarChart3 className="w-5 h-5" />
                  Tally Votes Now
                </button>
              </div>

              {error && (
                <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Voter Links */}
              {voters.length > 0 && (
                <div className="mt-6 p-4 bg-[#0a0a0a] rounded-xl border border-[#252525]">
                  <p className="text-gray-400 text-sm mb-3">Voting links sent to founders:</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {voters.map((voter, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">{voter.name}</span>
                        <a 
                          href={voter.votingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#FF6B35] hover:underline flex items-center gap-1"
                        >
                          Open <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : session.status === 'tallied' && results ? (
            // Voting complete - show results
            <div className="py-4">
              {/* Decision Banner */}
              <div className={`p-4 rounded-xl border mb-6 ${getDecisionColor(results.finalDecision)}`}>
                <div className="flex items-center gap-3">
                  {results.finalDecision === 'approved' ? (
                    <Award className="w-8 h-8" />
                  ) : results.finalDecision === 'declined' ? (
                    <XCircle className="w-8 h-8" />
                  ) : (
                    <AlertTriangle className="w-8 h-8" />
                  )}
                  <div>
                    <p className="font-semibold text-lg capitalize">{results.finalDecision}</p>
                    <p className="text-sm opacity-80">{results.decisionNotes}</p>
                  </div>
                </div>
              </div>

              {/* Vote Breakdown */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-green-500">{results.voteBreakdown?.approve || 0}</p>
                  <p className="text-sm text-gray-400">Approve</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-red-500">{results.voteBreakdown?.reject || 0}</p>
                  <p className="text-sm text-gray-400">Reject</p>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-yellow-500">{results.voteBreakdown?.abstain || 0}</p>
                  <p className="text-sm text-gray-400">Abstain</p>
                </div>
              </div>

              {/* Points Summary */}
              <div className="bg-[#0a0a0a] rounded-xl p-4 mb-6 border border-[#252525]">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Total Points</span>
                  <span className="text-2xl font-bold text-white">
                    {results.voteBreakdown?.totalPoints || 0}
                    <span className="text-gray-500 text-base font-normal"> / 1100</span>
                  </span>
                </div>
                <div className="w-full bg-[#252525] rounded-full h-3 mt-3 relative">
                  <div 
                    className="absolute top-0 bottom-0 w-0.5 bg-yellow-500 z-10"
                    style={{ left: '63.6%' }}
                  />
                  <div
                    className={`h-3 rounded-full ${
                      (results.voteBreakdown?.totalPoints || 0) >= 700 
                        ? 'bg-green-500' 
                        : 'bg-red-500'
                    }`}
                    style={{ 
                      width: `${((results.voteBreakdown?.totalPoints || 0) / 1100) * 100}%` 
                    }}
                  />
                </div>
              </div>

              {/* Anonymous Feedback */}
              {results.anonymousFeedback && results.anonymousFeedback.length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-3">Anonymous Feedback</h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {results.anonymousFeedback.map((item, i) => (
                      <div key={i} className="bg-[#0a0a0a] rounded-xl p-4 border border-[#252525]">
                        {item.feedback && (
                          <p className="text-gray-300 text-sm mb-2">{item.feedback}</p>
                        )}
                        {item.concerns && item.concerns.length > 0 && (
                          <div className="mb-2">
                            <p className="text-xs text-gray-500 mb-1">Concerns:</p>
                            <div className="flex flex-wrap gap-1">
                              {item.concerns.map((c, j) => (
                                <span key={j} className="px-2 py-0.5 bg-red-500/10 text-red-400 rounded text-xs">
                                  {c}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {item.suggestions && item.suggestions.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Suggestions:</p>
                            <div className="flex flex-wrap gap-1">
                              {item.suggestions.map((s, j) => (
                                <span key={j} className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-xs">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              No voting data available
            </div>
          )}
        </div>
      )}
    </div>
  )
}