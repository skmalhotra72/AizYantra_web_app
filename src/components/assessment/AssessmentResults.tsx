"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  Download,
  Share2,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
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
// Types
// ═══════════════════════════════════════════════════════════════

interface AssessmentResult {
  overall_score: number;
  readiness_level: string;
  dimension_scores: Record<string, { score: number; max: number; level: string }>;
  radar_data: Array<{ dimension: string; score: number; benchmark: number }>;
  strengths?: string[];
  gaps?: string[];
  recommendations?: string[];
}

interface Dimension {
  id: number;
  code: string;
  name: string;
  color: string;
}

interface AssessmentResultsProps {
  result: AssessmentResult;
  dimensions: Dimension[];
}

// ═══════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════

function getScoreColor(score: number): string {
  if (score >= 80) return "hsl(var(--success))";
  if (score >= 65) return "hsl(var(--accent-teal))";
  if (score >= 50) return "hsl(var(--accent-sky))";
  if (score >= 35) return "hsl(var(--warning))";
  return "hsl(var(--error))";
}

function getLevelEmoji(level: string): string {
  switch (level) {
    case "Leader": return "🏆";
    case "Advanced": return "🚀";
    case "Established": return "📈";
    case "Developing": return "🌱";
    default: return "🎯";
  }
}

// ═══════════════════════════════════════════════════════════════
// Score Circle Component
// ═══════════════════════════════════════════════════════════════

function ScoreCircle({ score, size = 200 }: { score: number; size?: number }) {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = getScoreColor(score);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--surface-0))"
          strokeWidth="12"
        />
        {/* Progress Circle */}
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
      
      {/* Score Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-5xl font-bold"
          style={{ color }}
        >
          {score}
        </motion.span>
        <span className="text-sm text-subtext-0">out of 100</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════

export function AssessmentResults({ result, dimensions }: AssessmentResultsProps) {
  // Prepare radar chart data
  const radarData = useMemo(() => {
    return result.radar_data.map((item) => ({
      ...item,
      fullMark: 100,
    }));
  }, [result.radar_data]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-mantle border border-surface-0 rounded-2xl p-6 sm:p-8 mb-6"
      >
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Score Circle */}
          <div className="flex-shrink-0">
            <ScoreCircle score={result.overall_score} />
          </div>

          {/* Summary */}
          <div className="flex-1 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
              <Trophy className="w-6 h-6 text-sky" />
              <h2 className="text-2xl font-bold text-text">
                Your AI Readiness Score
              </h2>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
              <span className="text-4xl">{getLevelEmoji(result.readiness_level)}</span>
              <div>
                <p className="text-xl font-semibold text-sky">
                  {result.readiness_level}
                </p>
                <p className="text-sm text-subtext-0">
                  AI Maturity Level
                </p>
              </div>
            </div>

            <p className="text-subtext-1 mb-4">
              {result.readiness_level === "Leader" && "Your organization is at the forefront of AI adoption. Focus on innovation and scaling."}
              {result.readiness_level === "Advanced" && "Strong AI foundation in place. Ready for strategic expansion and optimization."}
              {result.readiness_level === "Established" && "Good progress on AI journey. Key areas identified for improvement."}
              {result.readiness_level === "Developing" && "Early stages of AI adoption. Clear opportunities for quick wins."}
              {result.readiness_level === "Beginner" && "Starting your AI journey. We can help accelerate your transformation."}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky text-base font-medium hover:opacity-90 transition-opacity">
                <Download className="w-4 h-4" />
                Download Report
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-0 text-subtext-1 font-medium hover:text-text transition-colors">
                <Share2 className="w-4 h-4" />
                Share Results
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Radar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-mantle border border-surface-0 rounded-2xl p-6 mb-6"
      >
        <h3 className="text-lg font-semibold text-text mb-4 text-center">
          7-Dimension Analysis
        </h3>
        
        <div className="w-full h-[350px] sm:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
              <PolarGrid 
                stroke="hsl(var(--surface-1))" 
                strokeDasharray="3 3"
              />
              <PolarAngleAxis 
                dataKey="dimension" 
                tick={{ 
                  fill: "hsl(var(--subtext-0))", 
                  fontSize: 11,
                }}
                tickLine={false}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]}
                tick={{ fill: "hsl(var(--subtext-0))", fontSize: 10 }}
                tickCount={5}
              />
              <Radar
                name="Your Score"
                dataKey="score"
                stroke="hsl(var(--accent-sky))"
                fill="hsl(var(--accent-sky))"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Radar
                name="Benchmark"
                dataKey="benchmark"
                stroke="hsl(var(--subtext-0))"
                fill="hsl(var(--subtext-0))"
                fillOpacity={0.1}
                strokeWidth={1}
                strokeDasharray="5 5"
              />
              <Legend 
                wrapperStyle={{ 
                  paddingTop: 20,
                  fontSize: 12,
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Dimension Scores Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
      >
        {dimensions.map((dim, index) => {
          const scoreData = result.dimension_scores[dim.code];
          if (!scoreData) return null;

          return (
            <motion.div
              key={dim.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className="bg-crust border border-surface-0 rounded-xl p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: dim.color }}
                />
                <span className="text-sm font-medium text-text">{dim.name}</span>
              </div>
              
              {/* Score Bar */}
              <div className="relative h-2 bg-surface-0 rounded-full overflow-hidden mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${scoreData.score}%` }}
                  transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ backgroundColor: dim.color }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-subtext-0">{scoreData.level}</span>
                <span className="text-sm font-bold" style={{ color: dim.color }}>
                  {scoreData.score}%
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Strengths & Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Strengths */}
        {result.strengths && result.strengths.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[hsl(var(--success))]/10 border border-[hsl(var(--success))]/20 rounded-xl p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-[hsl(var(--success))]" />
              <h3 className="text-lg font-semibold text-[hsl(var(--success))]">
                Strengths
              </h3>
            </div>
            <ul className="space-y-2">
              {result.strengths.map((strength, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[hsl(var(--success))] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-text">{strength}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Gaps */}
        {result.gaps && result.gaps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[hsl(var(--warning))]/10 border border-[hsl(var(--warning))]/20 rounded-xl p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="w-5 h-5 text-[hsl(var(--warning))]" />
              <h3 className="text-lg font-semibold text-[hsl(var(--warning))]">
                Areas for Improvement
              </h3>
            </div>
            <ul className="space-y-2">
              {result.gaps.map((gap, i) => (
                <li key={i} className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-[hsl(var(--warning))] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-text">{gap}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>

      {/* Recommendations */}
      {result.recommendations && result.recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-mantle border border-surface-0 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-sky" />
            <h3 className="text-lg font-semibold text-text">
              Recommended Next Steps
            </h3>
          </div>
          
          <ul className="space-y-3">
            {result.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-3 p-3 rounded-lg bg-crust">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sky/20 text-sky text-sm font-semibold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-sm text-subtext-1">{rec}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8 text-center"
      >
        <div className="bg-gradient-to-r from-sky/20 to-teal/20 border border-sky/30 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-text mb-2">
            Ready to Accelerate Your AI Journey?
          </h3>
          <p className="text-subtext-1 mb-6 max-w-lg mx-auto">
            Our team can help you address the gaps identified and build on your strengths.
            Schedule a free consultation to discuss your AI roadmap.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-sky to-teal text-base font-semibold hover:opacity-90 transition-opacity"
          >
            Schedule Free Consultation
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </motion.div>
    </div>
  );
}

export default AssessmentResults;