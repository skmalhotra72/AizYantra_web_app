"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  Search,
  Filter,
  Download,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Building2,
  Mail,
  Phone,
  Calendar,
  Target,
  ArrowUpRight,
  Loader2,
  AlertCircle,
  X,
  FileText,
  MessageSquare,
  Lightbulb,
  Shield,
  Database,
  Server,
  Heart,
  Rocket,
  ExternalLink,
  Copy,
  CheckCheck,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// ═══════════════════════════════════════════════════════════════
// Supabase Client
// ═══════════════════════════════════════════════════════════════

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

interface AssessmentUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  organization_name: string;
  designation: string;
  industry: string;
  organization_size: string;
  marketing_consent: boolean;
  created_at: string;
}

interface AssessmentResult {
  overall_score: number;
  readiness_level: string;
  dimension_scores: Record<string, { score: number; max: number; level: string }>;
  radar_data: Array<{ dimension: string; score: number; benchmark: number }>;
  strengths: string[];
  gaps: string[];
  recommendations: string[];
}

interface AssessmentResponse {
  id: string;
  question_id: string;
  dimension_id: number;
  response_value: { value: number };
  score: number;
  answered_at: string;
}

interface AssessmentQuestion {
  id: string;
  question_text: string;
  dimension_id: number;
  options: Array<{ value: number; label: string; score: number }>;
}

interface AssessmentDimension {
  id: number;
  code: string;
  name: string;
  description: string;
  color: string;
  icon: string;
}

interface AssessmentSubmission {
  id: string;
  user_id: string;
  tier: string;
  status: string;
  time_spent_seconds: number;
  created_at: string;
  completed_at: string | null;
  assessment_users: AssessmentUser;
  assessment_results: AssessmentResult | null;
}

interface DashboardStats {
  totalAssessments: number;
  completedAssessments: number;
  averageScore: number;
  completionRate: number;
  thisWeekAssessments: number;
  highPriorityLeads: number;
}

// ═══════════════════════════════════════════════════════════════
// Dimension Icon Mapping
// ═══════════════════════════════════════════════════════════════

const dimensionIcons: Record<string, any> = {
  Target: Target,
  Database: Database,
  Server: Server,
  Users: Users,
  Heart: Heart,
  Shield: Shield,
  Rocket: Rocket,
};

// ═══════════════════════════════════════════════════════════════
// Stats Card Component
// ═══════════════════════════════════════════════════════════════

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  change,
}: {
  title: string;
  value: string | number;
  icon: any;
  color: string;
  change?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-mantle border border-surface-0 rounded-xl p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-subtext-0 mb-1">{title}</p>
          <p className="text-2xl font-bold text-text">{value}</p>
          {change && (
            <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              {change}
            </p>
          )}
        </div>
        <div
          className="p-3 rounded-lg"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Status Badge Component
// ═══════════════════════════════════════════════════════════════

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    completed: { bg: "bg-green-500/20", text: "text-green-400", label: "Completed" },
    in_progress: { bg: "bg-sky/20", text: "text-sky", label: "In Progress" },
    not_started: { bg: "bg-yellow-500/20", text: "text-yellow-400", label: "Not Started" },
    abandoned: { bg: "bg-red-500/20", text: "text-red-400", label: "Abandoned" },
  };

  const { bg, text, label } = config[status] || config.not_started;

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
      {label}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════
// Score Badge Component
// ═══════════════════════════════════════════════════════════════

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null || score === undefined) return <span className="text-subtext-0">-</span>;

  let color = "text-red-400 bg-red-500/20";
  if (score >= 65) color = "text-green-400 bg-green-500/20";
  else if (score >= 50) color = "text-sky bg-sky/20";
  else if (score >= 35) color = "text-yellow-400 bg-yellow-500/20";

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-bold ${color}`}>
      {score}/100
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════
// Score Circle Component
// ═══════════════════════════════════════════════════════════════

function ScoreCircle({ score, size = 120 }: { score: number; size?: number }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  let color = "#F38BA8"; // red
  if (score >= 65) color = "#A6E3A1"; // green
  else if (score >= 50) color = "#89B4FA"; // blue
  else if (score >= 35) color = "#F9E2AF"; // yellow

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--surface-0))"
          strokeWidth="8"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold" style={{ color }}>
          {score}
        </span>
        <span className="text-xs text-subtext-0">/100</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Full Detail Modal Component
// ═══════════════════════════════════════════════════════════════

function FullDetailModal({
  submission,
  onClose,
}: {
  submission: AssessmentSubmission;
  onClose: () => void;
}) {
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [questions, setQuestions] = useState<Record<string, AssessmentQuestion>>({});
  const [dimensions, setDimensions] = useState<AssessmentDimension[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "responses" | "recommendations">("overview");
  const [copied, setCopied] = useState(false);

  const result = submission.assessment_results;
  const user = submission.assessment_users;

  // Fetch responses, questions, and dimensions
  useEffect(() => {
    async function fetchDetails() {
      setIsLoading(true);
      try {
        // Fetch responses
        const { data: responseData } = await supabase
          .from("assessment_responses")
          .select("*")
          .eq("assessment_id", submission.id)
          .order("answered_at");

        if (responseData) {
          setResponses(responseData);

          // Fetch questions for these responses
          const questionIds = responseData.map((r) => r.question_id);
          const { data: questionData } = await supabase
            .from("assessment_questions")
            .select("id, question_text, dimension_id, options")
            .in("id", questionIds);

          if (questionData) {
            const questionMap: Record<string, AssessmentQuestion> = {};
            questionData.forEach((q) => {
              questionMap[q.id] = q;
            });
            setQuestions(questionMap);
          }
        }

        // Fetch dimensions
        const { data: dimensionData } = await supabase
          .from("assessment_dimensions")
          .select("*")
          .order("display_order");

        if (dimensionData) {
          setDimensions(dimensionData);
        }
      } catch (error) {
        console.error("Error fetching details:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDetails();
  }, [submission.id]);

  // Get dimension by ID
  const getDimension = (dimId: number) => dimensions.find((d) => d.id === dimId);

  // Get selected answer label
  const getSelectedAnswer = (response: AssessmentResponse) => {
    const question = questions[response.question_id];
    if (!question) return "Unknown";
    const option = question.options.find((o) => o.value === response.response_value.value);
    return option?.label || "Unknown";
  };

  // Copy summary to clipboard
  const copySummary = () => {
    const summary = `
AI READINESS ASSESSMENT SUMMARY
================================
Contact: ${user.name}
Organization: ${user.organization_name}
Industry: ${user.industry || "Not specified"}
Designation: ${user.designation}
Email: ${user.email}
Phone: ${user.phone}

OVERALL SCORE: ${result?.overall_score || 0}/100
READINESS LEVEL: ${result?.readiness_level || "N/A"}

DIMENSION SCORES:
${result?.radar_data?.map((d) => `- ${d.dimension}: ${d.score}/100`).join("\n") || "N/A"}

STRENGTHS:
${result?.strengths?.map((s) => `✓ ${s}`).join("\n") || "None identified"}

GAPS:
${result?.gaps?.map((g) => `⚠ ${g}`).join("\n") || "None identified"}

RECOMMENDATIONS:
${result?.recommendations?.map((r, i) => `${i + 1}. ${r}`).join("\n") || "None"}

DETAILED RESPONSES:
${responses.map((r) => {
  const question = questions[r.question_id];
  const dimension = getDimension(r.dimension_id);
  return `
[${dimension?.name || "Unknown"}] Score: ${r.score}/100
Q: ${question?.question_text || "Unknown"}
A: ${getSelectedAnswer(r)}`;
}).join("\n")}

Assessment Date: ${new Date(submission.created_at).toLocaleString()}
    `.trim();

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-base border border-surface-0 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-0 bg-mantle">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-sky" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text">{user.name}</h2>
              <p className="text-sm text-subtext-0">{user.organization_name} • {user.designation}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copySummary}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-0 text-subtext-1 hover:text-text hover:bg-surface-1 transition-colors"
              title="Copy summary to clipboard"
            >
              {copied ? <CheckCheck className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              <span className="text-sm">{copied ? "Copied!" : "Copy"}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-surface-0 transition-colors"
            >
              <X className="w-5 h-5 text-subtext-0" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-surface-0 bg-mantle px-6">
          {[
            { key: "overview", label: "Overview", icon: BarChart3 },
            { key: "responses", label: "Responses", icon: MessageSquare },
            { key: "recommendations", label: "Recommendations", icon: Lightbulb },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-sky text-sky"
                  : "border-transparent text-subtext-0 hover:text-text"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-sky animate-spin" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* Contact Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-0/30">
                      <Mail className="w-4 h-4 text-subtext-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-subtext-0">Email</p>
                        <p className="text-sm text-text truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-0/30">
                      <Phone className="w-4 h-4 text-subtext-0" />
                      <div>
                        <p className="text-xs text-subtext-0">Phone</p>
                        <p className="text-sm text-text">{user.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-0/30">
                      <Building2 className="w-4 h-4 text-subtext-0" />
                      <div>
                        <p className="text-xs text-subtext-0">Industry</p>
                        <p className="text-sm text-text">{user.industry || "Not specified"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-0/30">
                      <Users className="w-4 h-4 text-subtext-0" />
                      <div>
                        <p className="text-xs text-subtext-0">Size</p>
                        <p className="text-sm text-text">{user.organization_size || "Not specified"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Score Section */}
                  {result && (
                    <div className="flex flex-col md:flex-row gap-6 p-6 rounded-xl bg-mantle border border-surface-0">
                      {/* Score Circle */}
                      <div className="flex flex-col items-center">
                        <ScoreCircle score={result.overall_score} size={140} />
                        <p className="mt-2 text-lg font-semibold text-text">{result.readiness_level}</p>
                        <p className="text-xs text-subtext-0">AI Readiness Level</p>
                      </div>

                      {/* Dimension Scores */}
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-text mb-3">Dimension Scores</h4>
                        <div className="space-y-2">
                          {result.radar_data?.map((dim) => {
                            const dimension = dimensions.find((d) => d.name === dim.dimension);
                            const color = dimension?.color || "#89B4FA";
                            return (
                              <div key={dim.dimension} className="flex items-center gap-3">
                                <div className="w-32 text-xs text-subtext-0 truncate">{dim.dimension}</div>
                                <div className="flex-1 h-2 bg-surface-0 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${dim.score}%` }}
                                    transition={{ duration: 0.5 }}
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: color }}
                                  />
                                </div>
                                <div className="w-12 text-right text-sm font-medium" style={{ color }}>
                                  {dim.score}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Strengths & Gaps */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                      <h4 className="flex items-center gap-2 text-sm font-semibold text-green-400 mb-3">
                        <TrendingUp className="w-4 h-4" />
                        Strengths
                      </h4>
                      <ul className="space-y-2">
                        {result?.strengths?.length ? (
                          result.strengths.map((s, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-text">
                              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                              {s}
                            </li>
                          ))
                        ) : (
                          <li className="text-sm text-subtext-0">No strengths identified yet</li>
                        )}
                      </ul>
                    </div>
                    <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                      <h4 className="flex items-center gap-2 text-sm font-semibold text-yellow-400 mb-3">
                        <AlertCircle className="w-4 h-4" />
                        Areas for Improvement
                      </h4>
                      <ul className="space-y-2">
                        {result?.gaps?.length ? (
                          result.gaps.map((g, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-text">
                              <Target className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                              {g}
                            </li>
                          ))
                        ) : (
                          <li className="text-sm text-subtext-0">No gaps identified</li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Assessment Meta */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-subtext-0 pt-4 border-t border-surface-0">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Started: {new Date(submission.created_at).toLocaleString()}
                    </span>
                    {submission.completed_at && (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Completed: {new Date(submission.completed_at).toLocaleString()}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Time: {Math.round(submission.time_spent_seconds / 60)} minutes
                    </span>
                    <span className="capitalize">Tier: {submission.tier}</span>
                  </div>
                </motion.div>
              )}

              {/* Responses Tab */}
              {activeTab === "responses" && (
                <motion.div
                  key="responses"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <p className="text-sm text-subtext-0 mb-4">
                    Showing all {responses.length} responses from the assessment
                  </p>
                  {responses.map((response, index) => {
                    const question = questions[response.question_id];
                    const dimension = getDimension(response.dimension_id);
                    const selectedAnswer = getSelectedAnswer(response);
                    const DimIcon = dimensionIcons[dimension?.icon || "Target"] || Target;

                    return (
                      <div
                        key={response.id}
                        className="p-4 rounded-xl bg-mantle border border-surface-0"
                      >
                        {/* Dimension Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: `${dimension?.color}20` }}
                            >
                              <DimIcon className="w-4 h-4" style={{ color: dimension?.color }} />
                            </div>
                            <div>
                              <p className="text-xs text-subtext-0">Question {index + 1}</p>
                              <p className="text-sm font-medium" style={{ color: dimension?.color }}>
                                {dimension?.name || "Unknown Dimension"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <ScoreBadge score={response.score} />
                          </div>
                        </div>

                        {/* Question */}
                        <p className="text-text font-medium mb-3">
                          {question?.question_text || "Question not found"}
                        </p>

                        {/* Selected Answer */}
                        <div className="p-3 rounded-lg bg-sky/10 border border-sky/20">
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-sky flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm text-sky font-medium">Selected Answer:</p>
                              <p className="text-sm text-text">{selectedAnswer}</p>
                            </div>
                          </div>
                        </div>

                        {/* All Options (collapsed) */}
                        <details className="mt-3">
                          <summary className="text-xs text-subtext-0 cursor-pointer hover:text-text">
                            View all options
                          </summary>
                          <div className="mt-2 space-y-1">
                            {question?.options.map((opt) => (
                              <div
                                key={opt.value}
                                className={`text-xs p-2 rounded ${
                                  opt.value === response.response_value.value
                                    ? "bg-sky/10 text-sky"
                                    : "text-subtext-0"
                                }`}
                              >
                                <span className="font-medium">{opt.score}pts:</span> {opt.label}
                              </div>
                            ))}
                          </div>
                        </details>
                      </div>
                    );
                  })}
                </motion.div>
              )}

              {/* Recommendations Tab */}
              {activeTab === "recommendations" && (
                <motion.div
                  key="recommendations"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="p-4 rounded-xl bg-sky/10 border border-sky/20 mb-6">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-sky flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-text mb-1">Sales Context</h4>
                        <p className="text-sm text-subtext-1">
                          Based on their score of <strong>{result?.overall_score || 0}/100</strong> ({result?.readiness_level || "N/A"}), 
                          {user.organization_name} is at an early stage of AI adoption. 
                          Focus on education and quick wins to build trust.
                        </p>
                      </div>
                    </div>
                  </div>

                  <h4 className="text-lg font-semibold text-text">AI-Generated Recommendations</h4>
                  
                  {result?.recommendations?.length ? (
                    <div className="space-y-3">
                      {result.recommendations.map((rec, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-xl bg-mantle border border-surface-0 flex items-start gap-3"
                        >
                          <div className="w-8 h-8 rounded-full bg-sky/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-sky">{i + 1}</span>
                          </div>
                          <p className="text-sm text-text">{rec}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-subtext-0">No recommendations available</p>
                  )}

                  {/* Suggested Actions for Sales */}
                  <div className="mt-8">
                    <h4 className="text-lg font-semibold text-text mb-4">Suggested Sales Actions</h4>
                    <div className="space-y-3">
                      <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-text">Schedule Discovery Call</p>
                            <p className="text-sm text-subtext-0">
                              Discuss their {result?.gaps?.[0] || "AI journey"} challenges and how AIzYantra can help
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                        <div className="flex items-start gap-3">
                          <FileText className="w-5 h-5 text-purple-400 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-text">Share Relevant Case Study</p>
                            <p className="text-sm text-subtext-0">
                              Send {user.industry || "industry"}-specific success stories from similar organizations
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-sky/10 border border-sky/20">
                        <div className="flex items-start gap-3">
                          <Rocket className="w-5 h-5 text-sky flex-shrink-0" />
                          <div>
                            <p className="font-medium text-text">Propose Quick Win Pilot</p>
                            <p className="text-sm text-subtext-0">
                              Start with a low-risk automation project to demonstrate value quickly
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Main Dashboard Component
// ═══════════════════════════════════════════════════════════════

export default function AssessmentDashboard() {
  const [submissions, setSubmissions] = useState<AssessmentSubmission[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalAssessments: 0,
    completedAssessments: 0,
    averageScore: 0,
    completionRate: 0,
    thisWeekAssessments: 0,
    highPriorityLeads: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [industryFilter, setIndustryFilter] = useState<string>("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Selected submission for modal
  const [selectedSubmission, setSelectedSubmission] = useState<AssessmentSubmission | null>(null);

  // ─────────────────────────────────────────────────────────────
  // Fetch Data
  // ─────────────────────────────────────────────────────────────

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch assessments with user and results
      // ✅ FIXED: Using correct column names from actual database schema
      const { data: assessments, error: assessmentError } = await supabase
        .from("assessments")
        .select(`
          id,
          user_id,
          tier,
          status,
          time_spent_seconds,
          created_at,
          completed_at,
          assessment_users!inner(
            id, 
            name, 
            email, 
            phone, 
            organization_name, 
            designation, 
            industry, 
            organization_size, 
            marketing_consent, 
            created_at
          ),
          assessment_results(
            overall_score, 
            readiness_level, 
            dimension_scores, 
            radar_data, 
            strengths, 
            gaps, 
            recommendations
          )
        `)
        .order("created_at", { ascending: false });

      if (assessmentError) throw assessmentError;

      setSubmissions(assessments || []);

      // Calculate stats
      const total = assessments?.length || 0;
      const completed = assessments?.filter((a) => a.status === "completed").length || 0;
      const scores = assessments
        ?.filter((a) => a.assessment_results?.overall_score !== undefined)
        .map((a) => a.assessment_results!.overall_score) || [];
      const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const thisWeek = assessments?.filter((a) => new Date(a.created_at) >= oneWeekAgo).length || 0;

      const highPriority = assessments?.filter(
        (a) => a.assessment_results?.overall_score && a.assessment_results.overall_score >= 50
      ).length || 0;

      setStats({
        totalAssessments: total,
        completedAssessments: completed,
        averageScore: avgScore,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        thisWeekAssessments: thisWeek,
        highPriorityLeads: highPriority,
      });

    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ─────────────────────────────────────────────────────────────
  // Filtered & Paginated Data
  // ─────────────────────────────────────────────────────────────

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((s) => {
      const matchesSearch =
        searchQuery === "" ||
        s.assessment_users.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.assessment_users.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.assessment_users.organization_name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || s.status === statusFilter;

      const matchesIndustry =
        industryFilter === "all" ||
        s.assessment_users.industry?.toLowerCase() === industryFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesIndustry;
    });
  }, [submissions, searchQuery, statusFilter, industryFilter]);

  const paginatedSubmissions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSubmissions.slice(start, start + itemsPerPage);
  }, [filteredSubmissions, currentPage]);

  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);

  // Get unique industries for filter
  const industries = useMemo(() => {
    const uniqueIndustries = new Set(
      submissions
        .map((s) => s.assessment_users.industry)
        .filter(Boolean)
    );
    return Array.from(uniqueIndustries).sort();
  }, [submissions]);

  // ─────────────────────────────────────────────────────────────
  // Export to CSV
  // ─────────────────────────────────────────────────────────────

  const exportToCSV = () => {
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Organization",
      "Industry",
      "Size",
      "Designation",
      "Status",
      "Score",
      "Level",
      "Strengths",
      "Gaps",
      "Date",
    ];

    const rows = filteredSubmissions.map((s) => [
      s.assessment_users.name,
      s.assessment_users.email,
      s.assessment_users.phone,
      s.assessment_users.organization_name,
      s.assessment_users.industry || "",
      s.assessment_users.organization_size || "",
      s.assessment_users.designation,
      s.status,
      s.assessment_results?.overall_score || "",
      s.assessment_results?.readiness_level || "",
      s.assessment_results?.strengths?.join("; ") || "",
      s.assessment_results?.gaps?.join("; ") || "",
      new Date(s.created_at).toLocaleDateString(),
    ]);

    const csv = [headers, ...rows].map((row) => row.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `assessments-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-sky animate-spin mx-auto mb-4" />
          <p className="text-subtext-0">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-sky text-base rounded-lg hover:opacity-90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-base">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text">
              Assessment Dashboard
            </h1>
            <p className="text-subtext-0">
              Monitor AI readiness assessments and leads
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 bg-surface-0 text-subtext-1 rounded-lg hover:bg-surface-1 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-sky text-base rounded-lg hover:opacity-90 transition-opacity"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard
            title="Total Assessments"
            value={stats.totalAssessments}
            icon={BarChart3}
            color="#89B4FA"
          />
          <StatCard
            title="Completed"
            value={stats.completedAssessments}
            icon={CheckCircle2}
            color="#A6E3A1"
          />
          <StatCard
            title="Avg Score"
            value={`${stats.averageScore}/100`}
            icon={Target}
            color="#F9E2AF"
          />
          <StatCard
            title="Completion Rate"
            value={`${stats.completionRate}%`}
            icon={TrendingUp}
            color="#94E2D5"
          />
          <StatCard
            title="This Week"
            value={stats.thisWeekAssessments}
            icon={Calendar}
            color="#CBA6F7"
          />
          <StatCard
            title="High Priority"
            value={stats.highPriorityLeads}
            icon={Users}
            color="#F38BA8"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtext-0" />
            <input
              type="text"
              placeholder="Search by name, email, or organization..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-mantle border border-surface-0 rounded-lg
                         text-text placeholder:text-subtext-0 focus:outline-none focus:ring-2 focus:ring-sky/20"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtext-0" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-8 py-2.5 bg-mantle border border-surface-0 rounded-lg
                         text-text appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky/20"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
              <option value="not_started">Not Started</option>
              <option value="abandoned">Abandoned</option>
            </select>
          </div>

          {/* Industry Filter */}
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtext-0" />
            <select
              value={industryFilter}
              onChange={(e) => {
                setIndustryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-8 py-2.5 bg-mantle border border-surface-0 rounded-lg
                         text-text appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky/20"
            >
              <option value="all">All Industries</option>
              {industries.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <p className="text-sm text-subtext-0 mb-4">
          Showing {paginatedSubmissions.length} of {filteredSubmissions.length} assessments
        </p>

        {/* Data Table */}
        <div className="bg-mantle border border-surface-0 rounded-xl overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-crust border-b border-surface-0">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-subtext-0 uppercase">
                    Contact
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-subtext-0 uppercase">
                    Organization
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-subtext-0 uppercase">
                    Industry
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-subtext-0 uppercase">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-subtext-0 uppercase">
                    Score
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-subtext-0 uppercase">
                    Level
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-subtext-0 uppercase">
                    Date
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-subtext-0 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedSubmissions.map((submission) => (
                  <tr
                    key={submission.id}
                    className="border-b border-surface-0 hover:bg-surface-0/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedSubmission(submission)}
                  >
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-text">
                          {submission.assessment_users.name}
                        </p>
                        <p className="text-xs text-subtext-0">
                          {submission.assessment_users.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-text">
                        {submission.assessment_users.organization_name}
                      </p>
                      <p className="text-xs text-subtext-0">
                        {submission.assessment_users.designation}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-text">
                        {submission.assessment_users.industry || "-"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={submission.status} />
                    </td>
                    <td className="px-4 py-4">
                      <ScoreBadge
                        score={submission.assessment_results?.overall_score ?? null}
                      />
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-text">
                        {submission.assessment_results?.readiness_level || "-"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-subtext-0">
                        {new Date(submission.created_at).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSubmission(submission);
                        }}
                        className="p-2 rounded-lg hover:bg-surface-0 transition-colors"
                        title="View Full Details"
                      >
                        <Eye className="w-4 h-4 text-subtext-0 hover:text-sky" />
                      </button>
                    </td>
                  </tr>
                ))}

                {paginatedSubmissions.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center">
                      <p className="text-subtext-0">No assessments found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-subtext-0">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-surface-0 text-subtext-0 disabled:opacity-50 hover:bg-surface-1 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-surface-0 text-subtext-0 disabled:opacity-50 hover:bg-surface-1 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Full Detail Modal */}
        <AnimatePresence>
          {selectedSubmission && (
            <FullDetailModal
              submission={selectedSubmission}
              onClose={() => setSelectedSubmission(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}