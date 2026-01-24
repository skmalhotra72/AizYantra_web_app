"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Cpu } from "lucide-react";

const techStack = [
  { name: "OpenAI", category: "LLM" },
  { name: "Anthropic", category: "LLM" },
  { name: "Google Cloud", category: "Infrastructure" },
  { name: "n8n", category: "Automation" },
  { name: "Make", category: "Automation" },
  { name: "Supabase", category: "Database" },
  { name: "Vercel", category: "Deployment" },
  { name: "Next.js", category: "Framework" },
  { name: "LangChain", category: "AI Framework" },
  { name: "Pinecone", category: "Vector DB" },
  { name: "Twilio", category: "Communication" },
  { name: "WhatsApp API", category: "Messaging" },
  { name: "Razorpay", category: "Payments" },
  { name: "AWS", category: "Infrastructure" },
  { name: "Python", category: "Language" },
  { name: "TensorFlow", category: "ML" },
];

export function ElementsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section ref={containerRef} className="py-24 relative overflow-hidden bg-slate-950">
      {/* Circuit Board Background Pattern */}
      <div className="absolute inset-0 -z-10">
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 100, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 100, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
        
        {/* Radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-cyan-500/10 via-transparent to-transparent" />
      </div>

      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          {/* CPU Icon */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ duration: 0.5, type: "spring" }}
            className="inline-flex items-center justify-center w-20 h-20 mb-6
                       bg-gradient-to-br from-green-500/20 to-cyan-500/20
                       rounded-2xl border border-green-500/30 relative"
          >
            <Cpu className="w-10 h-10 text-green-400" />
            
            {/* Animated pulse ring */}
            <motion.div
              className="absolute inset-0 rounded-2xl border border-green-500/50"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            <span className="text-white">The </span>
            <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
              Elements
            </span>
          </h2>

          <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
            A Yantra is only as powerful as the{" "}
            <span className="text-green-400 font-semibold">elements</span> within it. 
            We draw from a curated matrix of{" "}
            <span className="text-cyan-400 font-bold">400+ industrial-grade components</span>, 
            from foundational LLMs to enterprise-scale synapses, to forge an instrument that is{" "}
            <span className="text-white font-semibold">uniquely yours</span>.
          </p>
        </motion.div>

        {/* Circuit Board Visualization */}
        <div className="relative max-w-5xl mx-auto">
          {/* Central Processing Unit */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-cyan-500 rounded-2xl 
                            flex items-center justify-center shadow-lg shadow-green-500/30">
              <span className="text-white font-bold text-sm text-center">
                AIz<br/>Yantra
              </span>
            </div>
          </motion.div>

          {/* Tech Stack Grid */}
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4 p-8">
            {techStack.map((tech, index) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
                whileHover={{ scale: 1.1, y: -5 }}
                className="group relative"
              >
                {/* Connection line to center */}
                <motion.div
                  className="absolute top-1/2 left-1/2 h-px bg-gradient-to-r from-green-500/50 to-transparent origin-left -z-10"
                  initial={{ width: 0 }}
                  animate={isInView ? { width: "100px" } : {}}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.05 }}
                  style={{
                    transform: `rotate(${(index * 22.5) - 90}deg)`,
                  }}
                />

                {/* Tech Node */}
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl 
                                bg-slate-900/80 backdrop-blur-sm
                                border border-slate-700 hover:border-green-500/50
                                flex flex-col items-center justify-center
                                transition-all duration-300 cursor-pointer
                                hover:shadow-lg hover:shadow-green-500/20"
                >
                  {/* Monochromatic icon placeholder */}
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 
                                  flex items-center justify-center mb-1
                                  group-hover:from-green-500/20 group-hover:to-cyan-500/20
                                  transition-all duration-300">
                    <span className="text-xs font-bold text-slate-400 group-hover:text-green-400">
                      {tech.name.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 group-hover:text-slate-300 text-center px-1 truncate w-full">
                    {tech.name}
                  </span>
                </div>

                {/* Tooltip */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 
                                px-2 py-1 bg-slate-800 rounded text-xs text-white
                                opacity-0 group-hover:opacity-100 transition-opacity
                                whitespace-nowrap pointer-events-none z-20">
                  {tech.category}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Animated Data Pulses */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
            {/* Horizontal circuit lines */}
            {[...Array(3)].map((_, i) => (
              <motion.line
                key={`h-${i}`}
                x1="10%"
                y1={`${30 + i * 20}%`}
                x2="90%"
                y2={`${30 + i * 20}%`}
                stroke="rgba(0, 255, 100, 0.2)"
                strokeWidth="1"
                initial={{ pathLength: 0 }}
                animate={isInView ? { pathLength: 1 } : {}}
                transition={{ duration: 1.5, delay: 0.5 + i * 0.2 }}
              />
            ))}
            
            {/* Vertical circuit lines */}
            {[...Array(3)].map((_, i) => (
              <motion.line
                key={`v-${i}`}
                x1={`${30 + i * 20}%`}
                y1="10%"
                x2={`${30 + i * 20}%`}
                y2="90%"
                stroke="rgba(0, 255, 100, 0.2)"
                strokeWidth="1"
                initial={{ pathLength: 0 }}
                animate={isInView ? { pathLength: 1 } : {}}
                transition={{ duration: 1.5, delay: 0.7 + i * 0.2 }}
              />
            ))}

            {/* Data pulse circles */}
            {[...Array(5)].map((_, i) => (
              <motion.circle
                key={`pulse-${i}`}
                r="4"
                fill="#00ff64"
                initial={{ opacity: 0 }}
                animate={isInView ? {
                  opacity: [0, 1, 0],
                  cx: ["10%", "90%"],
                  cy: [`${30 + (i % 3) * 20}%`, `${30 + (i % 3) * 20}%`],
                } : {}}
                transition={{
                  duration: 3,
                  delay: 1 + i * 0.5,
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
              />
            ))}
          </svg>
        </div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1 }}
          className="flex flex-wrap justify-center gap-8 mt-16"
        >
          {[
            { value: "400+", label: "Components" },
            { value: "50+", label: "Integrations" },
            { value: "15+", label: "AI Models" },
            { value: "∞", label: "Possibilities" },
          ].map((stat, i) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-green-400">{stat.value}</div>
              <div className="text-sm text-gray-500 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default ElementsSection;