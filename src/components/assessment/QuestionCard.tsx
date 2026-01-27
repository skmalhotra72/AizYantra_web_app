"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  HelpCircle,
  ChevronRight,
  ChevronLeft
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface QuestionOption {
  value: number;
  label: string;
  score: number;
}

export interface Question {
  id: string;
  dimension_id: number;
  question_text: string;
  question_type: string;
  help_text?: string;
  options: QuestionOption[];
  max_score: number;
  display_order: number;
}

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  dimensionName: string;
  dimensionColor: string;
  selectedValue: number | null;
  onAnswer: (value: number, score: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
  isSubmitting?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  dimensionName,
  dimensionColor,
  selectedValue,
  onAnswer,
  onNext,
  onPrevious,
  isFirst,
  isLast,
  isSubmitting = false,
}: QuestionCardProps) {
  const [showHelp, setShowHelp] = useState(false);
  const [animateIn, setAnimateIn] = useState(true);

  // Reset animation on question change
  useEffect(() => {
    setAnimateIn(true);
    setShowHelp(false);
  }, [question.id]);

  // ─────────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────────

  const handleOptionClick = (option: QuestionOption) => {
    onAnswer(option.value, option.score);
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
          style={{ backgroundColor: `${dimensionColor}10` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: dimensionColor }}
              />
              <span className="text-sm font-medium text-text">
                {dimensionName}
              </span>
            </div>
            <span className="text-sm text-subtext-0">
              Question {questionNumber} of {totalQuestions}
            </span>
          </div>
        </div>

        {/* Question Content */}
        <div className="p-6 sm:p-8">
          {/* Question Text */}
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-lg sm:text-xl font-semibold text-text leading-relaxed">
                {question.question_text}
              </h2>
              {question.help_text && (
                <button
                  onClick={() => setShowHelp(!showHelp)}
                  className="flex-shrink-0 p-1.5 rounded-lg hover:bg-surface-0 transition-colors"
                  title="Show help"
                >
                  <HelpCircle className="w-5 h-5 text-subtext-0" />
                </button>
              )}
            </div>

            {/* Help Text */}
            {showHelp && question.help_text && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 p-3 rounded-lg bg-sky/10 border border-sky/20"
              >
                <p className="text-sm text-subtext-1">{question.help_text}</p>
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
                    w-full flex items-center gap-4 p-4 rounded-xl
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
                      w-6 h-6 rounded-full border-2 flex-shrink-0
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

                  {/* Option Label */}
                  <span
                    className={`
                      text-sm sm:text-base flex-1 transition-colors
                      ${isSelected ? "text-text font-medium" : "text-subtext-1 group-hover:text-text"}
                    `}
                  >
                    {option.label}
                  </span>

                  {/* Score Indicator (subtle) */}
                  <div
                    className={`
                      px-2 py-0.5 rounded text-xs font-mono
                      ${isSelected ? "bg-sky/20 text-sky" : "bg-surface-0 text-subtext-0"}
                    `}
                  >
                    {option.score}%
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

            {/* Progress Dots */}
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: Math.min(totalQuestions, 10) }).map((_, i) => {
                const dotIndex = totalQuestions <= 10 
                  ? i 
                  : Math.floor((i / 10) * totalQuestions);
                const isCurrent = questionNumber - 1 === dotIndex;
                const isPast = questionNumber - 1 > dotIndex;

                return (
                  <div
                    key={i}
                    className={`
                      w-2 h-2 rounded-full transition-all
                      ${isCurrent 
                        ? "w-4 bg-sky" 
                        : isPast 
                          ? "bg-[hsl(var(--success))]" 
                          : "bg-surface-1"
                      }
                    `}
                  />
                );
              })}
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
                    ? "bg-[hsl(var(--success))] text-white hover:opacity-90"
                    : "bg-sky text-base hover:opacity-90"
                  : "bg-surface-0 text-subtext-0 cursor-not-allowed"
                }
              `}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-pulse">Calculating...</span>
                </>
              ) : isLast ? (
                <>
                  Complete
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

      {/* Keyboard Hint */}
      <p className="mt-4 text-center text-xs text-subtext-0">
        Press <kbd className="px-1.5 py-0.5 rounded bg-surface-0 text-subtext-1 font-mono">1</kbd>-
        <kbd className="px-1.5 py-0.5 rounded bg-surface-0 text-subtext-1 font-mono">5</kbd> to select, 
        <kbd className="px-1.5 py-0.5 rounded bg-surface-0 text-subtext-1 font-mono mx-1">Enter</kbd> to continue
      </p>
    </motion.div>
  );
}

export default QuestionCard;