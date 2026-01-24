"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown, ChevronUp, Cpu, Zap, TrendingUp } from "lucide-react";

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
            ? "border-cyan-500/50 bg-[#0a1628]" 
            : "border-cyan-700/30 bg-[#0d1f35] hover:border-cyan-600/40"
          }
        `}
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 150, 180, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 150, 180, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
        }}
      >
        {/* Blueprint Header - Always Visible */}
        <div className="p-6">
          {/* Top Bar with Serial Number */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {/* Rolled Blueprint Icon */}
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="font-mono text-xs text-cyan-500/70">{serialNumber}</p>
                <h3 className="text-lg font-bold text-white">{company}</h3>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-medium">
                {industry}
              </span>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center"
              >
                <ChevronDown className="w-4 h-4 text-cyan-400" />
              </motion.div>
            </div>
          </div>

          {/* Preview Metrics - Always Visible */}
          <div className="flex gap-4">
            {metrics.slice(0, 3).map((metric, i) => (
              <div key={i} className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-500" />
                <span className="text-sm font-bold text-cyan-400">{metric.value}</span>
                <span className="text-xs text-gray-500">{metric.label}</span>
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
              <div className="px-6 pb-6">
                {/* Divider Line */}
                <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent mb-6" />

                <div className="grid md:grid-cols-3 gap-6">
                  {/* Left Column - Problem & Solution */}
                  <div className="md:col-span-2 space-y-6">
                    {/* Challenge Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-4 bg-red-500 rounded-full" />
                        <h4 className="text-sm font-semibold text-red-400 uppercase tracking-wider">
                          Challenge
                        </h4>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed pl-3 border-l border-red-500/30">
                        {problem}
                      </p>
                    </div>

                    {/* Solution Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-4 bg-green-500 rounded-full" />
                        <h4 className="text-sm font-semibold text-green-400 uppercase tracking-wider">
                          Solution Architecture
                        </h4>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-4 border border-cyan-500/20">
                        <pre className="text-xs text-cyan-300 font-mono whitespace-pre-wrap">
                          {solution}
                        </pre>
                      </div>
                    </div>

                    {/* Metrics Grid */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-4 bg-cyan-500 rounded-full" />
                        <h4 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">
                          Results
                        </h4>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {metrics.map((metric, i) => (
                          <div
                            key={i}
                            className="bg-cyan-500/10 rounded-lg p-3 text-center border border-cyan-500/20"
                          >
                            <div className="text-xl font-bold text-cyan-400">{metric.value}</div>
                            <div className="text-xs text-gray-400">{metric.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Tech Stack */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-4 bg-amber-500 rounded-full" />
                      <h4 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">
                        Materials Used
                      </h4>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-4 border border-amber-500/20">
                      <div className="flex flex-wrap gap-2">
                        {techStack.map((tech, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-amber-500/10 rounded text-xs text-amber-300 font-mono"
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
        <div className="h-1 bg-gradient-to-r from-cyan-500/0 via-cyan-500/30 to-cyan-500/0" />
      </motion.div>
    </motion.div>
  );
}

export default BlueprintCard;