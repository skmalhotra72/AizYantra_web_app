"use client";

import { motion } from "framer-motion";
import { Clock, CheckCircle2 } from "lucide-react";

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

interface Dimension {
  id: number;
  code: string;
  name: string;
  color: string;
}

interface AssessmentProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  currentDimension: number;
  dimensions: Dimension[];
  timeSpentSeconds: number;
  answeredQuestions: Set<string>;
}

// ═══════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// ═══════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════

export function AssessmentProgress({
  currentQuestion,
  totalQuestions,
  currentDimension,
  dimensions,
  timeSpentSeconds,
  answeredQuestions,
}: AssessmentProgressProps) {
  const progressPercent = Math.round((currentQuestion / totalQuestions) * 100);
  const questionsPerDimension = Math.ceil(totalQuestions / dimensions.length);

  return (
    <div className="w-full max-w-2xl mx-auto mb-6">
      {/* Main Progress Bar */}
      <div className="bg-mantle border border-surface-0 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-text">
              Progress
            </span>
            <span className="text-sm text-subtext-0">
              {answeredQuestions.size} of {totalQuestions} answered
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-subtext-0">
            <Clock className="w-4 h-4" />
            <span className="font-mono">{formatTime(timeSpentSeconds)}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-3 bg-surface-0 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-sky to-teal rounded-full"
          />
          
          {/* Dimension Markers */}
          {dimensions.map((dim, index) => {
            const position = ((index + 1) / dimensions.length) * 100;
            if (index === dimensions.length - 1) return null;
            
            return (
              <div
                key={dim.id}
                className="absolute top-0 bottom-0 w-0.5 bg-surface-1"
                style={{ left: `${position}%` }}
              />
            );
          })}
        </div>

        {/* Percentage */}
        <div className="flex justify-end mt-2">
          <span className="text-xs font-semibold text-sky">
            {progressPercent}% complete
          </span>
        </div>
      </div>

      {/* Dimension Pills */}
      <div className="flex flex-wrap justify-center gap-2">
        {dimensions.map((dim, index) => {
          const dimStartQuestion = index * questionsPerDimension + 1;
          const dimEndQuestion = Math.min((index + 1) * questionsPerDimension, totalQuestions);
          const isActive = currentDimension === dim.id;
          const isCompleted = currentQuestion > dimEndQuestion;
          const dimProgress = isCompleted 
            ? 100 
            : isActive 
              ? Math.round(((currentQuestion - dimStartQuestion) / (dimEndQuestion - dimStartQuestion + 1)) * 100)
              : 0;

          return (
            <motion.div
              key={dim.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`
                relative flex items-center gap-2 px-3 py-1.5 rounded-full
                text-xs font-medium transition-all overflow-hidden
                ${isActive 
                  ? "bg-sky/20 text-sky border border-sky/30" 
                  : isCompleted
                    ? "bg-[hsl(var(--success))]/20 text-[hsl(var(--success))] border border-[hsl(var(--success))]/30"
                    : "bg-surface-0 text-subtext-0 border border-transparent"
                }
              `}
            >
              {/* Background Progress */}
              {isActive && (
                <div 
                  className="absolute inset-y-0 left-0 bg-sky/10"
                  style={{ width: `${dimProgress}%` }}
                />
              )}

              {/* Content */}
              <div 
                className="relative w-2 h-2 rounded-full"
                style={{ backgroundColor: dim.color }}
              />
              <span className="relative hidden sm:inline">{dim.name.split(" ")[0]}</span>
              
              {/* Completed Check */}
              {isCompleted && (
                <CheckCircle2 className="w-3 h-3 relative" />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default AssessmentProgress;