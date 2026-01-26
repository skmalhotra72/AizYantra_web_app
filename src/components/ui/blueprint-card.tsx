"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown, Cpu, TrendingUp } from "lucide-react";

interface Metric {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

interface BlueprintCardProps {
  serialNumber: string;
  company: string;
  industry: string;
  problem: string;
  solution: string;
  metrics: Metric[];
  techStack: string[];
  index?: number;
}

export function BlueprintCard({
  serialNumber,
  company,
  industry,
  problem,
  solution,
  metrics,
  techStack,
  index = 0,
}: BlueprintCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="w-full"
    >
      <motion.div
        layout
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          relative overflow-hidden cursor-pointer
          rounded-xl border-2 border-dashed
          transition-colors duration-300
          ${isExpanded 
            ? "border-sky/50 bg-mantle" 
            : "border-sky/20 bg-crust hover:border-sky/40"
          }
        `}
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--accent-sky) / 0.03) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--accent-sky) / 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
        }}
      >
        {/* Blueprint Header - Always Visible */}
        <div className="p-4 sm:p-6">
          {/* Top Bar with Serial Number */}
          <div className="flex items-center justify-between mb-4 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Rolled Blueprint Icon */}
              <div className="w-10 h-10 rounded-lg bg-sky/20 flex items-center justify-center flex-shrink-0">
                <Cpu className="w-5 h-5 text-sky" />
              </div>
              <div className="min-w-0">
                <p className="font-mono text-xs text-sky/70 truncate">{serialNumber}</p>
                <h3 className="text-base sm:text-lg font-bold text-text truncate">{company}</h3>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-sky/10 text-sky text-xs font-medium">
                {industry}
              </span>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="w-8 h-8 rounded-full bg-sky/20 flex items-center justify-center"
              >
                <ChevronDown className="w-4 h-4 text-sky" />
              </motion.div>
            </div>
          </div>

          {/* Mobile Industry Tag */}
          <div className="sm:hidden mb-3">
            <span className="px-3 py-1 rounded-full bg-sky/10 text-sky text-xs font-medium">
              {industry}
            </span>
          </div>

          {/* Preview Metrics - Always Visible */}
          <div className="flex flex-wrap gap-3 sm:gap-4">
            {metrics.slice(0, 3).map((metric, i) => (
              <div key={i} className="flex items-center gap-1.5 sm:gap-2">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky" />
                <span className="text-xs sm:text-sm font-bold text-sky">{metric.value}</span>
                <span className="text-xs text-subtext-0 hidden sm:inline">{metric.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Expanded Content - Blueprint Unfolded */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                {/* Divider Line */}
                <div className="h-px bg-gradient-to-r from-transparent via-sky/50 to-transparent mb-6" />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                  {/* Left Column - Problem & Solution */}
                  <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                    {/* Challenge Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-4 bg-[hsl(var(--error))] rounded-full" />
                        <h4 className="text-xs sm:text-sm font-semibold text-[hsl(var(--error))] uppercase tracking-wider">
                          Challenge
                        </h4>
                      </div>
                      <p className="text-subtext-1 text-sm leading-relaxed pl-3 border-l border-[hsl(var(--error))]/30">
                        {problem}
                      </p>
                    </div>

                    {/* Solution Section - FIXED CODE BLOCK */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-4 bg-[hsl(var(--success))] rounded-full" />
                        <h4 className="text-xs sm:text-sm font-semibold text-[hsl(var(--success))] uppercase tracking-wider">
                          Solution Architecture
                        </h4>
                      </div>
                      {/* Code Block Container - Proper alignment */}
                      <div className="w-full overflow-hidden rounded-lg bg-base border border-sky/20">
                        <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-surface-0/50 border-b border-sky/10">
                          <span className="text-xs text-subtext-0 font-mono">solution.yaml</span>
                          <button 
                            className="text-xs text-sky hover:text-teal transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(solution);
                            }}
                          >
                            Copy
                          </button>
                        </div>
                        <div className="p-3 sm:p-4 overflow-x-auto">
                          <pre className="font-mono text-xs sm:text-sm text-sky leading-relaxed whitespace-pre overflow-x-auto">
                            <code>{solution}</code>
                          </pre>
                        </div>
                      </div>
                    </div>

                    {/* Metrics Grid */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-4 bg-sky rounded-full" />
                        <h4 className="text-xs sm:text-sm font-semibold text-sky uppercase tracking-wider">
                          Results
                        </h4>
                      </div>
                      {/* Responsive grid: 1 col on mobile, 2 on sm, 3 on md+ */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
                        {metrics.map((metric, i) => (
                          <div
                            key={i}
                            className="bg-sky/10 rounded-lg p-3 text-center border border-sky/20"
                          >
                            <div className="text-lg sm:text-xl font-bold text-sky font-mono">{metric.value}</div>
                            <div className="text-xs text-subtext-0">{metric.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Tech Stack */}
                  <div className="lg:col-span-1">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-4 bg-[hsl(var(--warning))] rounded-full" />
                      <h4 className="text-xs sm:text-sm font-semibold text-[hsl(var(--warning))] uppercase tracking-wider">
                        Materials Used
                      </h4>
                    </div>
                    <div className="bg-base rounded-lg p-3 sm:p-4 border border-[hsl(var(--warning))]/20">
                      <div className="flex flex-wrap gap-2">
                        {techStack.map((tech, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-[hsl(var(--warning))]/10 rounded text-xs text-[hsl(var(--warning))] font-mono"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Blueprint Edge */}
        <div className="h-1 bg-gradient-to-r from-sky/0 via-sky/30 to-sky/0" />
      </motion.div>
    </motion.div>
  );
}

export default BlueprintCard;