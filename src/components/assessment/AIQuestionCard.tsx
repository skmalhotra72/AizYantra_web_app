"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Lightbulb
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════
// Types (from OpenAI service)
// ═══════════════════════════════════════════════════════════════

export interface QuestionOption {
  value: number;
  label: string;
  score: number;
  insight: string;
}

export interface GeneratedQuestion {
  id: string;
  question: string;
  context: string;
  options: QuestionOption[];
  dimension: string;
  followUp?: string;
}

interface AIQuestionCardProps {
  question: GeneratedQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedValue: number | null;
  onAnswer: (value: number, score: number, insight: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
  isSubmitting?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// Dimension Colors
// ═══════════════════════════════════════════════════════════════

const dimensionColors: Record<string, string> = {
  'Leadership & Vision': '#89DCEB',
  'Current Processes': '#94E2D5',
  'Data Readiness': '#74C7EC',
  'Team Sentiment': '#89B4FA',
  'Technology Comfort': '#CBA6F7',
  'Budget Reality': '#F5C2E7',
  'Previous Experience': '#FAB387',
  'Goals & Vision': '#A6E3A1',
  // Fallback
  'default': '#89B4FA'
};

// ═══════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════

export function AIQuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedValue,
  onAnswer,
  onNext,
  onPrevious,
  isFirst,
  isLast,
  isSubmitting = false,
}: AIQuestionCardProps) {
  const [showContext, setShowContext] = useState(false);
  const [animateIn, setAnimateIn] = useState(true);

  const dimensionColor = dimensionColors[question.dimension] || dimensionColors['default'];

  // Reset animation on question change
  useEffect(() => {
    setAnimateIn(true);
    setShowContext(false);
  }, [question.id]);

  // ─────────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────────

  const handleOptionClick = (option: QuestionOption) => {
    onAnswer(option.value, option.score, option.insight);
  };

  const handleNext = () => {
    if (selectedValue !== null) {
      setAnimateIn(false);
      setTimeout(() => {
        onNext();
      }, 150);
    }
  };

  const handlePrevious = () => {
    setAnimateIn(false);
    setTimeout(() => {
      onPrevious();
    }, 150);
  };

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: animateIn ? 1 : 0, y: animateIn ? 0 : -20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="bg-mantle border border-surface-0 rounded-2xl overflow-hidden shadow-xl shadow-black/10">
        {/* Header */}
        <div 
          className="px-6 py-4 border-b border-surface-0"
          style={{ backgroundColor: `${dimensionColor}15` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: dimensionColor }}
              />
              <span className="text-sm font-medium text-text">
                {question.dimension}
              </span>
            </div>
            <span className="text-sm text-subtext-0">
              {questionNumber} of {totalQuestions}
            </span>
          </div>
        </div>

        {/* Question Content */}
        <div className="p-6 sm:p-8">
          {/* Question Text */}
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-lg sm:text-xl font-semibold text-text leading-relaxed">
                {question.question}
              </h2>
              {question.context && (
                <button
                  onClick={() => setShowContext(!showContext)}
                  className="flex-shrink-0 p-1.5 rounded-lg hover:bg-surface-0 transition-colors"
                  title="Why this question?"
                >
                  <Lightbulb className={`w-5 h-5 ${showContext ? 'text-sky' : 'text-subtext-0'}`} />
                </button>
              )}
            </div>

            {/* Context (Why this question matters) */}
            {showContext && question.context && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 p-3 rounded-lg bg-sky/10 border border-sky/20"
              >
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-sky flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-subtext-1">{question.context}</p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {question.options.map((option, index) => {
              const isSelected = selectedValue === option.value;

              return (
                <motion.button
                  key={option.value}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleOptionClick(option)}
                  className={`
                    w-full flex items-start gap-4 p-4 rounded-xl
                    text-left transition-all duration-200
                    border-2 group
                    ${isSelected
                      ? "border-sky bg-sky/10"
                      : "border-surface-0 bg-crust hover:border-surface-1 hover:bg-surface-0/50"
                    }
                  `}
                >
                  {/* Selection Circle */}
                  <div
                    className={`
                      w-6 h-6 rounded-full border-2 flex-shrink-0 mt-0.5
                      flex items-center justify-center transition-all
                      ${isSelected
                        ? "border-sky bg-sky"
                        : "border-surface-1 bg-transparent group-hover:border-subtext-0"
                      }
                    `}
                  >
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-base" />
                    )}
                  </div>

                  {/* Option Content */}
                  <div className="flex-1 min-w-0">
                    <span
                      className={`
                        text-sm sm:text-base block transition-colors
                        ${isSelected ? "text-text font-medium" : "text-subtext-1 group-hover:text-text"}
                      `}
                    >
                      {option.label}
                    </span>
                    
                    {/* Show insight when selected */}
                    {isSelected && option.insight && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-sky mt-1 block"
                      >
                        ✓ {option.insight}
                      </motion.span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="px-6 sm:px-8 py-4 bg-crust border-t border-surface-0">
          <div className="flex items-center justify-between">
            {/* Previous Button */}
            <button
              onClick={handlePrevious}
              disabled={isFirst}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg
                text-sm font-medium transition-all
                ${isFirst
                  ? "text-subtext-0 cursor-not-allowed"
                  : "text-subtext-1 hover:text-text hover:bg-surface-0"
                }
              `}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            {/* Progress Bar */}
            <div className="hidden sm:flex items-center gap-2 flex-1 mx-4">
              <div className="flex-1 h-2 bg-surface-0 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: dimensionColor }}
                />
              </div>
              <span className="text-xs text-subtext-0 whitespace-nowrap">
                {Math.round((questionNumber / totalQuestions) * 100)}%
              </span>
            </div>

            {/* Next / Complete Button */}
            <button
              onClick={handleNext}
              disabled={selectedValue === null || isSubmitting}
              className={`
                flex items-center gap-2 px-6 py-2 rounded-lg
                text-sm font-semibold transition-all
                ${selectedValue !== null
                  ? isLast
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-sky text-base hover:opacity-90"
                  : "bg-surface-0 text-subtext-0 cursor-not-allowed"
                }
              `}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-pulse">Analyzing...</span>
                </>
              ) : isLast ? (
                <>
                  See My Results
                  <CheckCircle2 className="w-4 h-4" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Encouragement Message */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-4 text-center text-sm text-subtext-0"
      >
        {questionNumber <= 2 && "Great start! Take your time with each question."}
        {questionNumber > 2 && questionNumber < totalQuestions - 1 && "You're doing great! Every answer helps us understand your needs better."}
        {questionNumber >= totalQuestions - 1 && "Almost there! Just a few more questions."}
      </motion.p>
    </motion.div>
  );
}

export default AIQuestionCard;