"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { BlueprintCard } from "@/components/ui/blueprint-card";
import { FileText } from "lucide-react";

const caseStudies = [
  {
    serialNumber: "BLUEPRINT-2024-001",
    company: "City General Hospital",
    industry: "Healthcare",
    problem: "Manual prescription processing taking 15+ minutes per patient. Doctors' handwritten prescriptions causing 23% error rate in pharmacy dispensing. No integration between OPD, pharmacy, and billing systems.",
    solution: `┌─────────────────────────────────────────────┐
│  Patient Check-in                           │
│       ↓                                     │
│  [AI] Handwritten Rx OCR (90.2% accuracy)   │
│       ↓                                     │
│  [AI] Drug Interaction Checker              │
│       ↓                                     │
│  Auto-sync → Pharmacy + Billing + EMR       │
│       ↓                                     │
│  WhatsApp notification to patient           │
└─────────────────────────────────────────────┘`,
    metrics: [
      { label: "Time Saved", value: "73%" },
      { label: "Error Reduction", value: "89%" },
      { label: "ROI", value: "4.2x" },
    ],
    techStack: ["OpenAI GPT-4", "Google Cloud Vision", "n8n", "Supabase", "WhatsApp API", "Next.js"],
  },
  {
    serialNumber: "BLUEPRINT-2024-002",
    company: "Sunrise Manufacturing",
    industry: "Manufacturing",
    problem: "Production line data scattered across 12 Excel sheets. No real-time visibility into machine efficiency. Maintenance reactive instead of predictive, causing 18% downtime.",
    solution: `┌─────────────────────────────────────────────┐
│  IoT Sensors on 50+ Machines                │
│       ↓                                     │
│  [AI] Anomaly Detection Model               │
│       ↓                                     │
│  Real-time Dashboard (Power BI + Custom)    │
│       ↓                                     │
│  [AI] Predictive Maintenance Alerts         │
│       ↓                                     │
│  Auto-generated Work Orders → ERP           │
└─────────────────────────────────────────────┘`,
    metrics: [
      { label: "Downtime Cut", value: "62%" },
      { label: "OEE Increase", value: "28%" },
      { label: "Annual Savings", value: "₹45L" },
    ],
    techStack: ["Python", "TensorFlow", "Azure IoT", "Power BI", "SAP Integration", "n8n"],
  },
  {
    serialNumber: "BLUEPRINT-2024-003",
    company: "LegalEase Partners",
    industry: "Legal Services",
    problem: "Contract review taking 4-6 hours per document. Associates spending 60% time on repetitive clause analysis. No standardized risk assessment across 500+ contract templates.",
    solution: `┌─────────────────────────────────────────────┐
│  Contract Upload (PDF/DOCX)                 │
│       ↓                                     │
│  [AI] Claude Document Analysis              │
│       ↓                                     │
│  [AI] Risk Clause Detection & Scoring       │
│       ↓                                     │
│  Auto-generated Summary + Red Flags         │
│       ↓                                     │
│  Human Review Dashboard + Approval Flow     │
└─────────────────────────────────────────────┘`,
    metrics: [
      { label: "Review Time", value: "-78%" },
      { label: "Accuracy", value: "94%" },
      { label: "Contracts/Day", value: "3x" },
    ],
    techStack: ["Anthropic Claude", "LangChain", "Pinecone", "React", "Supabase", "DocuSign API"],
  },
  {
    serialNumber: "BLUEPRINT-2024-004",
    company: "QuickServe Foods",
    industry: "F&B / QSR",
    problem: "Customer complaints via 5 different channels with no unified tracking. Average response time 48+ hours. No insights into recurring issues affecting 12 outlet locations.",
    solution: `┌─────────────────────────────────────────────┐
│  Multi-channel Inbox (WhatsApp, Email,      │
│  Instagram, Google Reviews, Call Center)    │
│       ↓                                     │
│  [AI] Sentiment Analysis + Categorization   │
│       ↓                                     │
│  [AI] Auto-response for common queries      │
│       ↓                                     │
│  Priority Routing → Location Manager        │
│       ↓                                     │
│  Analytics Dashboard + Weekly Insights      │
└─────────────────────────────────────────────┘`,
    metrics: [
      { label: "Response Time", value: "<2hrs" },
      { label: "CSAT Score", value: "+41%" },
      { label: "Auto-resolved", value: "67%" },
    ],
    techStack: ["OpenAI GPT-4", "Twilio", "Meta APIs", "n8n", "Metabase", "PostgreSQL"],
  },
];

export function BlueprintsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section ref={containerRef} className="py-24 relative overflow-hidden">
      {/* Dark Background for Blueprint aesthetic */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-gray-100 via-slate-900 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900" />

      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          {/* Blueprint Icon */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ duration: 0.5, type: "spring" }}
            className="inline-flex items-center justify-center w-20 h-20 mb-6
                       bg-gradient-to-br from-cyan-500/20 to-blue-500/20
                       rounded-2xl border border-cyan-500/30"
          >
            <FileText className="w-10 h-10 text-cyan-400" />
          </motion.div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-white">The </span>
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Blueprints
            </span>
          </h2>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-2">
            Real problems. Real solutions. Real results.
          </p>

          <p className="text-sm text-gray-500">
            Click on any blueprint to unfold the full architecture
          </p>
        </motion.div>

        {/* Blueprint Cards */}
        <div className="max-w-4xl mx-auto space-y-6">
          {caseStudies.map((study, index) => (
            <BlueprintCard
              key={study.serialNumber}
              index={index}
              serialNumber={study.serialNumber}
              company={study.company}
              industry={study.industry}
              problem={study.problem}
              solution={study.solution}
              metrics={study.metrics}
              techStack={study.techStack}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-gray-400 mb-4">
            Want to see your business transformed?
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 
                       text-white font-semibold rounded-xl
                       shadow-lg shadow-cyan-500/25
                       hover:shadow-xl hover:shadow-cyan-500/30
                       transition-shadow duration-300"
          >
            Get Your Blueprint
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

export default BlueprintsSection;