"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Zap, 
  Target, 
  Microscope, 
  Clock, 
  CheckCircle,
  ArrowRight 
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export type AssessmentTier = "quick" | "standard" | "deep";

interface TierOption {
  id: AssessmentTier;
  name: string;
  duration: string;
  questions: number;
  description: string;
  icon: React.ElementType;
  features: string[];
  recommended?: boolean;
}

interface TierSelectorProps {
  selectedTier: AssessmentTier | null;
  onSelect: (tier: AssessmentTier) => void;
  onContinue: () => void;
}

// ═══════════════════════════════════════════════════════════════
// Tier Options Data
// ═══════════════════════════════════════════════════════════════

const tierOptions: TierOption[] = [
  {
    id: "quick",
    name: "Quick Scan",
    duration: "5 minutes",
    questions: 7,
    description: "Get a rapid overview of your AI readiness across all dimensions",
    icon: Zap,
    features: [
      "7 key questions",
      "Instant results",
      "High-level radar chart",
      "Basic recommendations",
    ],
  },
  {
    id: "standard",
    name: "Standard Assessment",
    duration: "15 minutes",
    questions: 21,
    description: "Comprehensive evaluation with detailed insights and actionable recommendations",
    icon: Target,
    features: [
      "21 in-depth questions",
      "Detailed scoring",
      "Full radar visualization",
      "Prioritized action plan",
      "Industry benchmarking",
    ],
    recommended: true,
  },
  {
    id: "deep",
    name: "Deep Dive",
    duration: "30 minutes",
    questions: 42,
    description: "Executive-level assessment with granular analysis and strategic roadmap",
    icon: Microscope,
    features: [
      "42 comprehensive questions",
      "Granular dimension analysis",
      "Executive summary report",
      "Custom recommendations",
      "Maturity roadmap",
      "PDF report download",
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════

export function TierSelector({ selectedTier, onSelect, onContinue }: TierSelectorProps) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.h2 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-3xl font-bold text-text mb-3"
        >
          Choose Your Assessment Depth
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-subtext-1 max-w-xl mx-auto"
        >
          Select the level of detail that fits your needs. You can always upgrade to a deeper assessment later.
        </motion.p>
      </div>

      {/* Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
        {tierOptions.map((tier, index) => {
          const Icon = tier.icon;
          const isSelected = selectedTier === tier.id;

          return (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onSelect(tier.id)}
              className={`
                relative cursor-pointer rounded-2xl p-5 sm:p-6
                border-2 transition-all duration-300
                ${isSelected 
                  ? "border-sky bg-sky/10 shadow-lg shadow-sky/10" 
                  : "border-surface-0 bg-crust hover:border-surface-1 hover:bg-mantle"
                }
                ${tier.recommended ? "md:-translate-y-2" : ""}
              `}
            >
              {/* Recommended Badge */}
              {tier.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full bg-sky text-xs font-semibold text-base">
                    Recommended
                  </span>
                </div>
              )}

              {/* Selection Indicator */}
              <div className={`
                absolute top-4 right-4 w-5 h-5 rounded-full border-2
                flex items-center justify-center transition-all
                ${isSelected 
                  ? "border-sky bg-sky" 
                  : "border-surface-1 bg-transparent"
                }
              `}>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 rounded-full bg-base"
                  />
                )}
              </div>

              {/* Icon */}
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center mb-4
                ${isSelected ? "bg-sky/20" : "bg-surface-0"}
              `}>
                <Icon className={`w-6 h-6 ${isSelected ? "text-sky" : "text-subtext-0"}`} />
              </div>

              {/* Title & Duration */}
              <h3 className="text-lg font-bold text-text mb-1">{tier.name}</h3>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-subtext-0" />
                <span className="text-sm text-subtext-0">{tier.duration}</span>
                <span className="text-subtext-0">•</span>
                <span className="text-sm text-subtext-0">{tier.questions} questions</span>
              </div>

              {/* Description */}
              <p className="text-sm text-subtext-1 mb-4">{tier.description}</p>

              {/* Features */}
              <ul className="space-y-2">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isSelected ? "text-sky" : "text-[hsl(var(--success))]"}`} />
                    <span className="text-xs text-subtext-0">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          );
        })}
      </div>

      {/* Continue Button */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex justify-center"
      >
        <button
          onClick={onContinue}
          disabled={!selectedTier}
          className={`
            flex items-center gap-2 px-8 py-3 rounded-xl
            font-semibold transition-all duration-300
            ${selectedTier
              ? "bg-gradient-to-r from-sky to-teal text-base hover:opacity-90 shadow-lg shadow-sky/20"
              : "bg-surface-0 text-subtext-0 cursor-not-allowed"
            }
          `}
        >
          Continue to Registration
          <ArrowRight className="w-5 h-5" />
        </button>
      </motion.div>

      {/* Info Text */}
      <p className="mt-4 text-center text-xs text-subtext-0">
        All assessments are self-paced. You can save progress and return anytime.
      </p>
    </div>
  );
}

export default TierSelector;