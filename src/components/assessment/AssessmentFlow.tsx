"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Save, AlertCircle } from "lucide-react";
import QuestionCard from "./QuestionCard";
import AssessmentProgress from "./AssessmentProgress";
import {
  saveResponse,
  updateAssessmentProgress,
  completeAssessment,
  calculateAndSaveResults,
  startAssessment,
  logActivity,
  AssessmentQuestion,
  AssessmentDimension,
  AssessmentResult,
} from "@/lib/assessment-db";

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

interface AssessmentFlowProps {
  assessmentId: string;
  userId: string;
  questions: AssessmentQuestion[];
  dimensions: AssessmentDimension[];
  initialStep?: number;
  onComplete: (result: AssessmentResult) => void;
}

interface Answer {
  questionId: string;
  dimensionId: number;
  value: number;
  score: number;
}

// ═══════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════

export function AssessmentFlow({
  assessmentId,
  userId,
  questions,
  dimensions,
  initialStep = 0,
  onComplete,
}: AssessmentFlowProps) {
  // State
  const [currentIndex, setCurrentIndex] = useState(initialStep);
  const [answers, setAnswers] = useState<Map<string, Answer>>(new Map());
  const [timeSpent, setTimeSpent] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"saved" | "saving" | "error" | null>(null);

  // Current question
  const currentQuestion = questions[currentIndex];
  const currentDimension = dimensions.find(d => d.id === currentQuestion?.dimension_id);

  // ─────────────────────────────────────────────────────────────
  // Timer Effect
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // ─────────────────────────────────────────────────────────────
  // Start Assessment on Mount
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (initialStep === 0) {
      startAssessment(assessmentId);
    }
  }, [assessmentId, initialStep]);

  // ─────────────────────────────────────────────────────────────
  // Keyboard Navigation
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Number keys 1-5 for selecting options
      if (e.key >= "1" && e.key <= "5") {
        const optionIndex = parseInt(e.key) - 1;
        if (currentQuestion?.options[optionIndex]) {
          const option = currentQuestion.options[optionIndex];
          handleAnswer(option.value, option.score);
        }
      }
      
      // Enter to continue
      if (e.key === "Enter" && answers.has(currentQuestion?.id)) {
        handleNext();
      }

      // Left arrow for previous
      if (e.key === "ArrowLeft" && currentIndex > 0) {
        handlePrevious();
      }

      // Right arrow for next (if answered)
      if (e.key === "ArrowRight" && answers.has(currentQuestion?.id)) {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentQuestion, currentIndex, answers]);

  // ─────────────────────────────────────────────────────────────
  // Auto-save Progress
  // ─────────────────────────────────────────────────────────────

  const autoSave = useCallback(async () => {
    if (answers.size === 0) return;

    setAutoSaveStatus("saving");
    
    try {
      await updateAssessmentProgress(
        assessmentId,
        currentIndex + 1,
        currentQuestion?.dimension_id || 1,
        timeSpent
      );
      setAutoSaveStatus("saved");
      
      // Clear status after 2 seconds
      setTimeout(() => setAutoSaveStatus(null), 2000);
    } catch (err) {
      setAutoSaveStatus("error");
    }
  }, [assessmentId, currentIndex, currentQuestion, timeSpent, answers.size]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(autoSave, 30000);
    return () => clearInterval(interval);
  }, [autoSave]);

  // ─────────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────────

  const handleAnswer = async (value: number, score: number) => {
    if (!currentQuestion) return;

    const questionTime = Math.round((Date.now() - questionStartTime) / 1000);
    
    const answer: Answer = {
      questionId: currentQuestion.id,
      dimensionId: currentQuestion.dimension_id,
      value,
      score,
    };

    // Update local state
    setAnswers((prev) => new Map(prev).set(currentQuestion.id, answer));
    setError(null);

    // Save to database
    setIsSaving(true);
    try {
      const { success, error } = await saveResponse({
        assessment_id: assessmentId,
        question_id: currentQuestion.id,
        dimension_id: currentQuestion.dimension_id,
        response_value: { value },
        score,
        time_spent_seconds: questionTime,
      });

      if (!success) {
        console.error("Failed to save response:", error);
        // Don't block the user, just log the error
      }
    } catch (err) {
      console.error("Error saving response:", err);
    }
    setIsSaving(false);
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      // Move to next question
      setCurrentIndex((prev) => prev + 1);
      setQuestionStartTime(Date.now());
      
      // Update progress
      await updateAssessmentProgress(
        assessmentId,
        currentIndex + 2,
        questions[currentIndex + 1]?.dimension_id || 1,
        timeSpent
      );
    } else {
      // Complete assessment
      await handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setQuestionStartTime(Date.now());
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Mark assessment as completed
      await completeAssessment(assessmentId, timeSpent);

      // 2. Calculate and save results
      const { result, error: resultError } = await calculateAndSaveResults(assessmentId);

      if (resultError || !result) {
        throw new Error(resultError || "Failed to calculate results");
      }

      // 3. Log completion
      await logActivity(assessmentId, userId, "completed", {
        timeSpent,
        answersCount: answers.size,
      });

      // 4. Notify parent
      onComplete(result);

    } catch (err: any) {
      console.error("Error completing assessment:", err);
      setError(err.message || "Failed to complete assessment. Please try again.");
      setIsSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────

  if (!currentQuestion || !currentDimension) {
    return (
      <div className="text-center py-12">
        <p className="text-subtext-1">Loading questions...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Auto-save Status */}
      {autoSaveStatus && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed top-4 right-4 z-50"
        >
          <div className={`
            flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium
            ${autoSaveStatus === "saved" 
              ? "bg-[hsl(var(--success))]/20 text-[hsl(var(--success))]"
              : autoSaveStatus === "saving"
                ? "bg-sky/20 text-sky"
                : "bg-[hsl(var(--error))]/20 text-[hsl(var(--error))]"
            }
          `}>
            <Save className="w-3 h-3" />
            {autoSaveStatus === "saved" && "Progress saved"}
            {autoSaveStatus === "saving" && "Saving..."}
            {autoSaveStatus === "error" && "Save failed"}
          </div>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 max-w-2xl mx-auto"
        >
          <div className="flex items-center gap-3 p-4 rounded-xl bg-[hsl(var(--error))]/10 border border-[hsl(var(--error))]/20">
            <AlertCircle className="w-5 h-5 text-[hsl(var(--error))] flex-shrink-0" />
            <p className="text-sm text-[hsl(var(--error))]">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Progress */}
      <AssessmentProgress
        currentQuestion={currentIndex + 1}
        totalQuestions={questions.length}
        currentDimension={currentDimension.id}
        dimensions={dimensions}
        timeSpentSeconds={timeSpent}
        answeredQuestions={new Set(answers.keys())}
      />

      {/* Question Card */}
      <QuestionCard
        question={currentQuestion}
        questionNumber={currentIndex + 1}
        totalQuestions={questions.length}
        dimensionName={currentDimension.name}
        dimensionColor={currentDimension.color}
        selectedValue={answers.get(currentQuestion.id)?.value ?? null}
        onAnswer={handleAnswer}
        onNext={handleNext}
        onPrevious={handlePrevious}
        isFirst={currentIndex === 0}
        isLast={currentIndex === questions.length - 1}
        isSubmitting={isSubmitting}
      />

      {/* Save & Exit Button */}
      <div className="mt-6 text-center">
        <button
          onClick={autoSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm text-subtext-0 hover:text-text transition-colors"
        >
          <Save className="w-4 h-4" />
          Save & Exit
        </button>
        <p className="mt-1 text-xs text-subtext-0">
          Your progress is automatically saved. You can return anytime to continue.
        </p>
      </div>
    </div>
  );
}

export default AssessmentFlow;