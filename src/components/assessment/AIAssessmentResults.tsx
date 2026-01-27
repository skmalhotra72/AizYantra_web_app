"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  TrendingUp,
  Lightbulb,
  Download,
  Share2,
  ArrowRight,
  CheckCircle2,
  Clock,
  Zap,
  Calendar,
  Rocket,
  Heart,
  Shield,
  MessageCircle,
  Sparkles
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";

// ═══════════════════════════════════════════════════════════════
// Types (from OpenAI service)
// ═══════════════════════════════════════════════════════════════

interface AIAdoptionStage {
  stage: 'unaware' | 'curious' | 'interested' | 'ready' | 'active';
  stageNumber: number;
  stageLabel: string;
  description: string;
}

interface PersonalizedRecommendation {
  category: 'quick_win' | 'short_term' | 'long_term';
  timeframe: string;
  title: string;
  description: string;
  aizyantraService?: string;
  estimatedImpact: string;
  effort: 'low' | 'medium' | 'high';
  employeeMessage?: string;
}

interface PersonalizedResults {
  summary: string;
  adoptionStage: AIAdoptionStage;
  strengths: string[];
  opportunities: string[];
  recommendations: PersonalizedRecommendation[];
  employeeReassurance: string;
  nextStepCTA: string;
}

interface Dimension {
  id: number;
  code: string;
  name: string;
  color: string;
}

interface AIAssessmentResultsProps {
  results: PersonalizedResults;
  overallScore: number;
  dimensionScores: Record<string, number>;
  organizationName: string;
}

// ═══════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════

function getStageEmoji(stage: string): string {
  switch (stage) {
    case "unaware": return "🌱";
    case "curious": return "🔍";
    case "interested": return "💡";
    case "ready": return "🚀";
    case "active": return "🏆";
    default: return "✨";
  }
}

function getStageColor(stage: string): string {
  switch (stage) {
    case "unaware": return "#94E2D5";
    case "curious": return "#89DCEB";
    case "interested": return "#89B4FA";
    case "ready": return "#CBA6F7";
    case "active": return "#A6E3A1";
    default: return "#89B4FA";
  }
}

function getCategoryIcon(category: string) {
  switch (category) {
    case "quick_win": return Zap;
    case "short_term": return Calendar;
    case "long_term": return Rocket;
    default: return Lightbulb;
  }
}

function getCategoryColor(category: string): string {
  switch (category) {
    case "quick_win": return "#A6E3A1";
    case "short_term": return "#89B4FA";
    case "long_term": return "#CBA6F7";
    default: return "#89B4FA";
  }
}

function getEffortBadge(effort: string) {
  switch (effort) {
    case "low": return { label: "Easy to Start", color: "bg-green-500/20 text-green-400" };
    case "medium": return { label: "Some Setup", color: "bg-sky/20 text-sky" };
    case "high": return { label: "Strategic Project", color: "bg-purple-500/20 text-purple-400" };
    default: return { label: "Flexible", color: "bg-surface-0 text-subtext-0" };
  }
}

// ═══════════════════════════════════════════════════════════════
// Score Circle Component
// ═══════════════════════════════════════════════════════════════

function ScoreCircle({ score, stage }: { score: number; stage: string }) {
  const size = 180;
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = getStageColor(stage);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--surface-0))"
          strokeWidth="12"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-4xl font-bold"
          style={{ color }}
        >
          {score}
        </motion.span>
        <span className="text-sm text-subtext-0">AI Readiness</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════

export function AIAssessmentResults({ 
  results, 
  overallScore, 
  dimensionScores,
  organizationName 
}: AIAssessmentResultsProps) {
  
  // Prepare radar data
  const radarData = useMemo(() => {
    return Object.entries(dimensionScores).map(([dimension, score]) => ({
      dimension: dimension.split(' ')[0], // Shorten for display
      score,
      fullMark: 100,
    }));
  }, [dimensionScores]);

  // Group recommendations by category
  const groupedRecommendations = useMemo(() => {
    const groups: Record<string, PersonalizedRecommendation[]> = {
      quick_win: [],
      short_term: [],
      long_term: []
    };
    
    results.recommendations.forEach(rec => {
      if (groups[rec.category]) {
        groups[rec.category].push(rec);
      }
    });
    
    return groups;
  }, [results.recommendations]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Congratulations Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky/20 border border-sky/30 mb-4">
          <Sparkles className="w-4 h-4 text-sky" />
          <span className="text-sm font-medium text-sky">Assessment Complete!</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">
          Great job, {organizationName}! 🎉
        </h1>
        <p className="text-subtext-1 max-w-xl mx-auto">
          Here's your personalized AI readiness report with actionable recommendations.
        </p>
      </motion.div>

      {/* Score & Stage Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-mantle border border-surface-0 rounded-2xl p-6 sm:p-8 mb-6"
      >
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Score Circle */}
          <div className="flex-shrink-0">
            <ScoreCircle score={overallScore} stage={results.adoptionStage.stage} />
          </div>

          {/* Summary */}
          <div className="flex-1 text-center lg:text-left">
            {/* Stage Badge */}
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
              <span className="text-4xl">{getStageEmoji(results.adoptionStage.stage)}</span>
              <div>
                <p 
                  className="text-xl font-bold"
                  style={{ color: getStageColor(results.adoptionStage.stage) }}
                >
                  {results.adoptionStage.stageLabel}
                </p>
                <p className="text-sm text-subtext-0">Your AI Journey Stage</p>
              </div>
            </div>

            {/* Stage Description */}
            <p className="text-subtext-1 mb-4">
              {results.adoptionStage.description}
            </p>

            {/* Summary */}
            <div className="p-4 rounded-xl bg-surface-0/30 border border-surface-0">
              <p className="text-sm text-text leading-relaxed">
                {results.summary}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Strengths & Opportunities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Strengths */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-green-500/10 border border-green-500/20 rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold text-green-400">
              What You're Doing Well
            </h3>
          </div>
          <ul className="space-y-3">
            {results.strengths.map((strength, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-text">{strength}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Opportunities */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-sky/10 border border-sky/20 rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-sky" />
            <h3 className="text-lg font-semibold text-sky">
              Exciting Opportunities
            </h3>
          </div>
          <ul className="space-y-3">
            {results.opportunities.map((opportunity, i) => (
              <li key={i} className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-sky flex-shrink-0 mt-0.5" />
                <span className="text-sm text-text">{opportunity}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Recommendations Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-6"
      >
        <h2 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-sky" />
          Your Personalized Roadmap
        </h2>
        <p className="text-subtext-1 mb-6">
          Here are some ideas that might work well for your organization. No pressure - just possibilities to explore!
        </p>

        {/* Quick Wins */}
        {groupedRecommendations.quick_win.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold text-text">
                🌱 Quick Wins <span className="text-sm font-normal text-subtext-0">(This Week)</span>
              </h3>
            </div>
            <div className="space-y-3">
              {groupedRecommendations.quick_win.map((rec, i) => (
                <RecommendationCard key={i} recommendation={rec} />
              ))}
            </div>
          </div>
        )}

        {/* Short Term */}
        {groupedRecommendations.short_term.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-sky" />
              <h3 className="text-lg font-semibold text-text">
                📈 Short Term <span className="text-sm font-normal text-subtext-0">(1-3 Months)</span>
              </h3>
            </div>
            <div className="space-y-3">
              {groupedRecommendations.short_term.map((rec, i) => (
                <RecommendationCard key={i} recommendation={rec} />
              ))}
            </div>
          </div>
        )}

        {/* Long Term */}
        {groupedRecommendations.long_term.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Rocket className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-text">
                🚀 Long Term <span className="text-sm font-normal text-subtext-0">(3-6 Months)</span>
              </h3>
            </div>
            <div className="space-y-3">
              {groupedRecommendations.long_term.map((rec, i) => (
                <RecommendationCard key={i} recommendation={rec} />
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Employee Reassurance Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6 mb-6"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-purple-500/20">
            <Heart className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-400" />
              A Note About Your Team
            </h3>
            <p className="text-sm text-subtext-1 leading-relaxed">
              {results.employeeReassurance}
            </p>
          </div>
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-sky/20 to-teal/20 border border-sky/30 rounded-2xl p-8 text-center"
      >
        <MessageCircle className="w-12 h-12 text-sky mx-auto mb-4" />
        <h3 className="text-xl font-bold text-text mb-2">
          Let's Chat About Your Possibilities
        </h3>
        <p className="text-subtext-1 mb-6 max-w-lg mx-auto">
          {results.nextStepCTA}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-sky to-teal text-base font-semibold hover:opacity-90 transition-opacity"
          >
            Schedule a Friendly Chat
            <ArrowRight className="w-5 h-5" />
          </a>
          <button
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-0 text-subtext-1 font-medium hover:text-text transition-colors"
          >
            <Download className="w-4 h-4" />
            Download Report
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Recommendation Card Component
// ═══════════════════════════════════════════════════════════════

function RecommendationCard({ recommendation }: { recommendation: PersonalizedRecommendation }) {
  const Icon = getCategoryIcon(recommendation.category);
  const color = getCategoryColor(recommendation.category);
  const effort = getEffortBadge(recommendation.effort);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-crust border border-surface-0 rounded-xl p-5 hover:border-surface-1 transition-colors"
    >
      <div className="flex items-start gap-4">
        <div 
          className="p-2 rounded-lg flex-shrink-0"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-semibold text-text">{recommendation.title}</h4>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${effort.color}`}>
              {effort.label}
            </span>
          </div>
          
          <p className="text-sm text-subtext-1 mb-3 leading-relaxed">
            {recommendation.description}
          </p>
          
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {recommendation.aizyantraService && (
              <span className="px-2 py-1 rounded-full bg-sky/20 text-sky">
                {recommendation.aizyantraService}
              </span>
            )}
            <span className="text-subtext-0 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {recommendation.timeframe}
            </span>
            <span className="text-green-400">
              ✓ {recommendation.estimatedImpact}
            </span>
          </div>
          
          {recommendation.employeeMessage && (
            <div className="mt-3 p-2 rounded-lg bg-surface-0/50">
              <p className="text-xs text-subtext-0 flex items-start gap-1">
                <Heart className="w-3 h-3 flex-shrink-0 mt-0.5 text-pink-400" />
                {recommendation.employeeMessage}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default AIAssessmentResults;