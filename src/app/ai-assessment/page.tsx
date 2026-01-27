"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, 
  ArrowLeft, 
  CheckCircle2,
  Sparkles,
  RotateCcw,
  Loader2,
  AlertCircle
} from "lucide-react";
import TierSelector, { AssessmentTier } from "@/components/assessment/TierSelector";
import LeadCaptureForm, { LeadFormData } from "@/components/assessment/LeadCaptureForm";
import AIQuestionCard, { GeneratedQuestion } from "@/components/assessment/AIQuestionCard";
import AIAssessmentResults from "@/components/assessment/AIAssessmentResults";
import {
  createAssessmentUser,
  createLead,
  createAssessment,
  saveResponse,
  updateAssessmentProgress,
  completeAssessment,
  logActivity,
} from "@/lib/assessment-db";

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

type Step = "tier" | "register" | "loading" | "assessment" | "results";

interface AIAnalysisResult {
  adoptionStage: {
    stage: string;
    stageNumber: number;
    stageLabel: string;
    description: string;
  };
  questions: GeneratedQuestion[];
  industryInsights: string[];
  potentialPainPoints: string[];
  aiOpportunities: string[];
}

interface PersonalizedResults {
  summary: string;
  adoptionStage: any;
  strengths: string[];
  opportunities: string[];
  recommendations: any[];
  employeeReassurance: string;
  nextStepCTA: string;
}

interface AssessmentAnswer {
  questionId: string;
  question: string;
  value: number;
  score: number;
  insight: string;
  dimension: string;
}

interface PageState {
  step: Step;
  selectedTier: AssessmentTier | null;
  userId: string | null;
  leadId: string | null;
  assessmentId: string | null;
  formData: LeadFormData | null;
  aiAnalysis: AIAnalysisResult | null;
  answers: Map<string, AssessmentAnswer>;
  currentQuestionIndex: number;
  personalizedResults: PersonalizedResults | null;
  overallScore: number;
  dimensionScores: Record<string, number>;
  isLoading: boolean;
  error: string | null;
  timeSpent: number;
}

// ═══════════════════════════════════════════════════════════════
// Progress Indicator Component
// ═══════════════════════════════════════════════════════════════

function ProgressIndicator({ currentStep }: { currentStep: Step }) {
  const steps = [
    { key: "tier", label: "Choose Depth" },
    { key: "register", label: "About You" },
    { key: "assessment", label: "Questions" },
    { key: "results", label: "Your Roadmap" },
  ];

  const currentIndex = steps.findIndex((s) => 
    s.key === currentStep || (currentStep === "loading" && s.key === "assessment")
  );

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8">
      {steps.map((step, index) => {
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center
                  transition-all duration-300 text-sm font-semibold
                  ${isCompleted 
                    ? "bg-green-500 text-white" 
                    : isActive 
                      ? "bg-sky text-base" 
                      : "bg-surface-0 text-subtext-0"
                  }
                `}
              >
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
              </div>
              <span className={`
                mt-1 text-xs hidden sm:block
                ${isActive ? "text-sky font-medium" : "text-subtext-0"}
              `}>
                {step.label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div className={`
                w-8 sm:w-16 h-0.5 mx-1 sm:mx-2
                ${index < currentIndex ? "bg-green-500" : "bg-surface-0"}
              `} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Loading Screen Component
// ═══════════════════════════════════════════════════════════════

function AILoadingScreen({ organizationName }: { organizationName: string }) {
  const [messageIndex, setMessageIndex] = useState(0);
  const messages = [
    `Analyzing ${organizationName}'s industry...`,
    "Understanding your unique context...",
    "Generating personalized questions...",
    "Tailoring assessment to your needs...",
    "Almost ready!",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-16"
    >
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-sky/10 mb-6">
        <Brain className="w-10 h-10 text-sky animate-pulse" />
      </div>
      
      <h2 className="text-2xl font-bold text-text mb-4">
        Our AI is Preparing Your Assessment
      </h2>
      
      <div className="flex items-center justify-center gap-2 mb-6">
        <Loader2 className="w-5 h-5 text-sky animate-spin" />
        <motion.p
          key={messageIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-subtext-1"
        >
          {messages[messageIndex]}
        </motion.p>
      </div>

      <div className="w-64 h-2 bg-surface-0 rounded-full mx-auto overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-sky to-teal rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 10, ease: "linear" }}
        />
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Main Page Component
// ═══════════════════════════════════════════════════════════════

export default function AIAssessmentPage() {
  const [state, setState] = useState<PageState>({
    step: "tier",
    selectedTier: null,
    userId: null,
    leadId: null,
    assessmentId: null,
    formData: null,
    aiAnalysis: null,
    answers: new Map(),
    currentQuestionIndex: 0,
    personalizedResults: null,
    overallScore: 0,
    dimensionScores: {},
    isLoading: false,
    error: null,
    timeSpent: 0,
  });

  // Timer for time spent
  useEffect(() => {
    if (state.step === "assessment") {
      const timer = setInterval(() => {
        setState((prev) => ({ ...prev, timeSpent: prev.timeSpent + 1 }));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [state.step]);

  // ─────────────────────────────────────────────────────────────
  // API Calls
  // ─────────────────────────────────────────────────────────────

  const generateQuestions = async (formData: LeadFormData): Promise<AIAnalysisResult> => {
    const response = await fetch('/api/assessment/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generate_questions',
        context: {
          name: formData.organization_name,
          industry: formData.industry,
          size: formData.organization_size,
          designation: formData.designation,
          description: formData.organization_description,
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate questions');
    }

    const result = await response.json();
    return result.data;
  };

  const generateResults = async (): Promise<PersonalizedResults> => {
    const responses = Array.from(state.answers.values()).map(answer => ({
      questionId: answer.questionId,
      question: answer.question,
      selectedOption: {
        label: answer.insight,
        score: answer.score,
      }
    }));

    const response = await fetch('/api/assessment/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generate_results',
        input: {
          organizationContext: {
            name: state.formData?.organization_name,
            industry: state.formData?.industry,
            size: state.formData?.organization_size,
            designation: state.formData?.designation,
            description: state.formData?.organization_description,
          },
          responses,
          overallScore: state.overallScore,
          dimensionScores: state.dimensionScores,
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate results');
    }

    const result = await response.json();
    return result.data;
  };

  // ─────────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────────

  const handleTierSelect = (tier: AssessmentTier) => {
    setState((prev) => ({ ...prev, selectedTier: tier, error: null }));
  };

  const handleTierContinue = () => {
    if (state.selectedTier) {
      setState((prev) => ({ ...prev, step: "register" }));
    }
  };

  const handleBack = () => {
    if (state.step === "register") {
      setState((prev) => ({ ...prev, step: "tier" }));
    }
  };

  const handleLeadSubmit = async (formData: LeadFormData) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null, formData, step: "loading" }));

    try {
      // 1. Create assessment user
      const { user, error: userError } = await createAssessmentUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        organization_name: formData.organization_name,
        designation: formData.designation,
        organization_size: formData.organization_size,
        industry: formData.industry,
        marketing_consent: formData.marketing_consent,
      });

      if (userError || !user) {
        throw new Error(userError || "Failed to create user");
      }

      // 2. Create lead
      const { lead } = await createLead(user.id!, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        organization_name: formData.organization_name,
        designation: formData.designation,
      });

      // 3. Generate personalized questions via AI
      const aiAnalysis = await generateQuestions(formData);

      // 4. Create assessment in database
      const { assessment, error: assessmentError } = await createAssessment(
        user.id!,
        lead?.id || null,
        state.selectedTier!
      );

      if (assessmentError || !assessment) {
        throw new Error(assessmentError || "Failed to create assessment");
      }

      // 5. Update state and move to assessment
      setState((prev) => ({
        ...prev,
        userId: user.id!,
        leadId: lead?.id || null,
        assessmentId: assessment.id!,
        aiAnalysis,
        step: "assessment",
        isLoading: false,
      }));

      // Log activity
      await logActivity(assessment.id!, user.id!, "started", {
        tier: state.selectedTier,
        questionsCount: aiAnalysis.questions.length,
      });

    } catch (error: any) {
      console.error("Error in lead submission:", error);
      setState((prev) => ({
        ...prev,
        step: "register",
        isLoading: false,
        error: error.message || "Something went wrong. Please try again.",
      }));
    }
  };

  const handleAnswer = async (value: number, score: number, insight: string) => {
    if (!state.aiAnalysis) return;

    const currentQuestion = state.aiAnalysis.questions[state.currentQuestionIndex];
    
    const answer: AssessmentAnswer = {
      questionId: currentQuestion.id,
      question: currentQuestion.question,
      value,
      score,
      insight,
      dimension: currentQuestion.dimension,
    };

    // Update answers map
    const newAnswers = new Map(state.answers);
    newAnswers.set(currentQuestion.id, answer);

    // Calculate scores
    const allAnswers = Array.from(newAnswers.values());
    const totalScore = allAnswers.reduce((sum, a) => sum + a.score, 0);
    const avgScore = Math.round(totalScore / allAnswers.length);

    // Calculate dimension scores
    const dimensionScores: Record<string, number> = {};
    const dimensionCounts: Record<string, number> = {};
    
    allAnswers.forEach(a => {
      if (!dimensionScores[a.dimension]) {
        dimensionScores[a.dimension] = 0;
        dimensionCounts[a.dimension] = 0;
      }
      dimensionScores[a.dimension] += a.score;
      dimensionCounts[a.dimension]++;
    });

    Object.keys(dimensionScores).forEach(dim => {
      dimensionScores[dim] = Math.round(dimensionScores[dim] / dimensionCounts[dim]);
    });

    setState((prev) => ({
      ...prev,
      answers: newAnswers,
      overallScore: avgScore,
      dimensionScores,
    }));

    // Save to database
    if (state.assessmentId) {
      await saveResponse({
        assessment_id: state.assessmentId,
        question_id: currentQuestion.id,
        dimension_id: 1, // We'll use dimension name instead
        response_value: { value, insight },
        score,
      });
    }
  };

  const handleNext = async () => {
    if (!state.aiAnalysis) return;

    if (state.currentQuestionIndex < state.aiAnalysis.questions.length - 1) {
      // Move to next question
      setState((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
      }));

      // Update progress
      if (state.assessmentId) {
        await updateAssessmentProgress(
          state.assessmentId,
          state.currentQuestionIndex + 2,
          1,
          state.timeSpent
        );
      }
    } else {
      // Complete assessment
      await handleComplete();
    }
  };

  const handlePrevious = () => {
    if (state.currentQuestionIndex > 0) {
      setState((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1,
      }));
    }
  };

  const handleComplete = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Mark assessment as completed
      if (state.assessmentId) {
        await completeAssessment(state.assessmentId, state.timeSpent);
      }

      // Generate personalized results via AI
      const results = await generateResults();

      setState((prev) => ({
        ...prev,
        personalizedResults: results,
        step: "results",
        isLoading: false,
      }));

      // Log completion
      if (state.assessmentId && state.userId) {
        await logActivity(state.assessmentId, state.userId, "completed", {
          score: state.overallScore,
          timeSpent: state.timeSpent,
        });
      }

    } catch (error: any) {
      console.error("Error completing assessment:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || "Failed to generate results. Please try again.",
      }));
    }
  };

  const handleRetake = () => {
    setState({
      step: "tier",
      selectedTier: null,
      userId: null,
      leadId: null,
      assessmentId: null,
      formData: null,
      aiAnalysis: null,
      answers: new Map(),
      currentQuestionIndex: 0,
      personalizedResults: null,
      overallScore: 0,
      dimensionScores: {},
      isLoading: false,
      error: null,
      timeSpent: 0,
    });
  };

  // ─────────────────────────────────────────────────────────────
  // Render Steps
  // ─────────────────────────────────────────────────────────────

  const renderStep = () => {
    switch (state.step) {
      case "tier":
        return (
          <TierSelector
            selectedTier={state.selectedTier}
            onSelect={handleTierSelect}
            onContinue={handleTierContinue}
          />
        );

      case "register":
        return (
          <div className="relative">
            <button
              onClick={handleBack}
              className="absolute -top-12 left-0 flex items-center gap-2 text-sm text-subtext-1 hover:text-sky transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <LeadCaptureForm
              onSubmit={handleLeadSubmit}
              isLoading={state.isLoading}
              error={state.error}
            />
          </div>
        );

      case "loading":
        return (
          <AILoadingScreen 
            organizationName={state.formData?.organization_name || "your organization"} 
          />
        );

      case "assessment":
        if (!state.aiAnalysis) return null;

        const currentQuestion = state.aiAnalysis.questions[state.currentQuestionIndex];
        const currentAnswer = state.answers.get(currentQuestion.id);

        return (
          <div>
            {/* Error Message */}
            {state.error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 max-w-2xl mx-auto"
              >
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-500">{state.error}</p>
                </div>
              </motion.div>
            )}

            <AIQuestionCard
              question={currentQuestion}
              questionNumber={state.currentQuestionIndex + 1}
              totalQuestions={state.aiAnalysis.questions.length}
              selectedValue={currentAnswer?.value ?? null}
              onAnswer={handleAnswer}
              onNext={handleNext}
              onPrevious={handlePrevious}
              isFirst={state.currentQuestionIndex === 0}
              isLast={state.currentQuestionIndex === state.aiAnalysis.questions.length - 1}
              isSubmitting={state.isLoading}
            />
          </div>
        );

      case "results":
        if (!state.personalizedResults) return null;

        return (
          <div>
            <AIAssessmentResults
              results={state.personalizedResults}
              overallScore={state.overallScore}
              dimensionScores={state.dimensionScores}
              organizationName={state.formData?.organization_name || "Your Organization"}
            />

            {/* Retake Button */}
            <div className="mt-8 text-center">
              <button
                onClick={handleRetake}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
                           bg-surface-0 text-subtext-1 hover:text-text hover:bg-surface-1
                           transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Take Another Assessment
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Main Render
  // ─────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-base">
      <section className="relative py-12 sm:py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-sky/5 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 relative">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-sky/30 bg-sky/10 mb-4"
            >
              <Sparkles className="w-4 h-4 text-sky" />
              <span className="text-sm font-medium text-sky">AI-Powered Assessment</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text mb-4"
            >
              AI Readiness{" "}
              <span className="bg-gradient-to-r from-sky to-teal bg-clip-text text-transparent">
                Assessment
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-subtext-1 max-w-2xl mx-auto"
            >
              {state.step === "tier" && "Get a personalized assessment tailored to your organization's unique context."}
              {state.step === "register" && "Tell us about your organization so we can personalize your assessment."}
              {state.step === "loading" && "Preparing your personalized questions..."}
              {state.step === "assessment" && "Answer honestly - there are no wrong answers, just your current reality."}
              {state.step === "results" && "Here's your personalized AI readiness roadmap!"}
            </motion.p>
          </div>

          {/* Progress Indicator */}
          {state.step !== "loading" && <ProgressIndicator currentStep={state.step} />}

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={state.step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}