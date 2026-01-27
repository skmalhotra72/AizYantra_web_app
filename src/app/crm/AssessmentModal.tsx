"use client";

import { useEffect, useState } from "react";
import { X, Brain, TrendingUp, AlertCircle, CheckCircle, Lightbulb } from "lucide-react";
import { supabase } from "@/lib/innovation/i2e-db";

interface AssessmentModalProps {
  leadId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface AssessmentData {
  id: string;
  status: string;
  completed_at: string;
  contact_name: string;
  organization_name: string;
  industry?: string;
  overall_score: number;
  readiness_level: string;
  dimension_scores: Record<string, { score: number; level: string }>;
  strengths: string[];
  gaps: string[];
  recommendations: any[];
  responses: any[];
}

export default function AssessmentModal({ leadId, isOpen, onClose }: AssessmentModalProps) {
  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'responses' | 'recommendations'>('overview');

  useEffect(() => {
    if (isOpen && leadId) {
      loadAssessmentDetails();
    }
  }, [isOpen, leadId]);

  const loadAssessmentDetails = async () => {
    setIsLoading(true);
    try {
      // Get lead details
      const { data: lead } = await supabase
        .from('leads')
        .select(`
          id,
          contact:contact_id (name),
          organization:organization_id (name, industry)
        `)
        .eq('id', leadId)
        .single();

      if (!lead) throw new Error('Lead not found');

      // Get assessment
      const { data: assessments } = await supabase
        .from('assessments')
        .select(`
          id,
          status,
          completed_at,
          assessment_results (
            overall_score,
            readiness_level,
            dimension_scores,
            strengths,
            gaps,
            recommendations
          ),
          assessment_responses (
            response_value,
            score
          )
        `)
        .eq('lead_id', leadId)
        .single();

      if (assessments) {
        const results = assessments.assessment_results as any;
        setAssessment({
          id: assessments.id,
          status: assessments.status,
          completed_at: assessments.completed_at,
          contact_name: (lead.contact as any)?.name || 'Unknown',
          organization_name: (lead.organization as any)?.name || 'Unknown',
          industry: (lead.organization as any)?.industry,
          overall_score: results.overall_score,
          readiness_level: results.readiness_level,
          dimension_scores: results.dimension_scores || {},
          strengths: results.strengths || [],
          gaps: results.gaps || [],
          recommendations: results.recommendations || [],
          responses: assessments.assessment_responses || [],
        });
      }
    } catch (error) {
      console.error('Error loading assessment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getReadinessColor = (level: string) => {
    const colors = {
      'Leader': 'text-green-500 bg-green-500/10 border-green-500/20',
      'Advanced': 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      'Established': 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
      'Developing': 'text-orange-500 bg-orange-500/10 border-orange-500/20',
      'Beginner': 'text-red-500 bg-red-500/10 border-red-500/20',
    };
    return colors[level as keyof typeof colors] || colors.Beginner;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl border border-slate-800 max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-blue-500 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI Readiness Assessment</h2>
              {assessment && (
                <p className="text-sm text-slate-400">
                  {assessment.organization_name} • {assessment.contact_name}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Brain className="w-12 h-12 text-teal-400 animate-pulse mx-auto mb-4" />
              <p className="text-slate-400">Loading assessment details...</p>
            </div>
          </div>
        ) : assessment ? (
          <>
            {/* Tabs */}
            <div className="px-6 border-b border-slate-800 flex gap-4">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                  activeTab === 'overview'
                    ? 'border-teal-400 text-teal-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('responses')}
                className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                  activeTab === 'responses'
                    ? 'border-teal-400 text-teal-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                Responses ({assessment.responses.length})
              </button>
              <button
                onClick={() => setActiveTab('recommendations')}
                className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                  activeTab === 'recommendations'
                    ? 'border-teal-400 text-teal-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                Recommendations ({assessment.recommendations.length})
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Score Card */}
                  <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">Overall Score</h3>
                        <p className="text-sm text-slate-400">AI Readiness Assessment</p>
                      </div>
                      <div className="text-right">
                        <div className="text-4xl font-bold text-white">{assessment.overall_score}/100</div>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border mt-2 ${getReadinessColor(assessment.readiness_level)}`}>
                          {assessment.readiness_level}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dimension Scores */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Dimension Scores</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(assessment.dimension_scores).map(([key, data]) => (
                        <div key={key} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-white">{key}</span>
                            <span className="text-sm font-bold text-teal-400">{data.score}/100</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-teal-400 to-blue-500 h-2 rounded-full transition-all"
                              style={{ width: `${data.score}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-400 mt-1">{data.level}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Strengths & Gaps */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Strengths */}
                    <div className="bg-green-500/10 rounded-xl p-6 border border-green-500/20">
                      <div className="flex items-center gap-2 mb-4">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <h3 className="text-lg font-semibold text-white">Strengths</h3>
                      </div>
                      <ul className="space-y-2">
                        {assessment.strengths.map((strength, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                            <span className="text-green-500 mt-1">•</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Gaps */}
                    <div className="bg-orange-500/10 rounded-xl p-6 border border-orange-500/20">
                      <div className="flex items-center gap-2 mb-4">
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                        <h3 className="text-lg font-semibold text-white">Areas for Improvement</h3>
                      </div>
                      <ul className="space-y-2">
                        {assessment.gaps.map((gap, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                            <span className="text-orange-500 mt-1">•</span>
                            <span>{gap}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'responses' && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-400">
                    Total responses: {assessment.responses.length}
                  </p>
                  {assessment.responses.map((response: any, idx: number) => (
                    <div key={idx} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white">Response {idx + 1}</span>
                        <span className="text-sm font-medium text-teal-400">
                          Score: {response.score}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'recommendations' && (
                <div className="space-y-4">
                  {assessment.recommendations.map((rec: any, idx: number) => (
                    <div key={idx} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-teal-400 flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-medium text-white mb-2">{rec.title}</h4>
                          <p className="text-sm text-slate-300">{rec.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-slate-400">Assessment not found</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}