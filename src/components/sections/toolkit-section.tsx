"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { UniformBentoGrid, BentoItem } from "@/components/ui/bento-grid";
import {
  Globe,
  Users,
  Calculator,
  Megaphone,
  BarChart3,
  Zap,
  Bot,
  Phone,
  MessageCircle,
  Send,
  Target,
  ShoppingCart,
  CreditCard,
  Database,
  Shield,
  Workflow,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════
// Services Data - 16 items for 4x4 grid
// ═══════════════════════════════════════════════════════════════

const services: BentoItem[] = [
  {
    title: "Website Building",
    description: "Modern, responsive websites built with Next.js and cutting-edge technologies.",
    example: "AI-powered landing pages with 3D animations",
    icon: Globe,
  },
  {
    title: "CRM Integration",
    description: "Seamlessly connect your customer data across all platforms.",
    example: "Salesforce + HubSpot unified pipeline",
    icon: Users,
  },
  {
    title: "Accounting Software",
    description: "Automated financial workflows with AI-powered reconciliation.",
    example: "Tally + Zoho Books auto-sync",
    icon: Calculator,
  },
  {
    title: "Voice Agents",
    description: "24/7 AI voice assistants that handle calls naturally.",
    example: "Tripti - AI SDR in 40+ languages",
    icon: Phone,
  },
  {
    title: "Marketing Comms",
    description: "Unified messaging across email, SMS, and social channels.",
    example: "Automated drip campaigns",
    icon: Megaphone,
  },
  {
    title: "Data Analysis",
    description: "Transform raw data into actionable insights with AI.",
    example: "Real-time predictive dashboards",
    icon: BarChart3,
  },
  {
    title: "Marketing Automation",
    description: "End-to-end marketing workflows that run on autopilot.",
    example: "Lead scoring + nurture sequences",
    icon: Zap,
  },
  {
    title: "Business Automation",
    description: "Eliminate repetitive tasks with intelligent automation.",
    example: "Invoice processing: 30sec vs 30min",
    icon: Bot,
  },
  {
    title: "WhatsApp Agents",
    description: "AI-powered WhatsApp bots for sales and support.",
    example: "Order tracking + appointment booking",
    icon: MessageCircle,
  },
  {
    title: "Telegram Agents",
    description: "Custom Telegram bots for community and automation.",
    example: "Crypto alerts + group moderation",
    icon: Send,
  },
  {
    title: "Lead Generation",
    description: "Multi-channel lead capture with AI qualification.",
    example: "LinkedIn + website + referral tracking",
    icon: Target,
  },
  {
    title: "Ecommerce Integration",
    description: "Connect your store with inventory and shipping.",
    example: "Shopify + WooCommerce dashboard",
    icon: ShoppingCart,
  },
  {
    title: "Payment Gateway",
    description: "Seamless payment processing with multiple gateways.",
    example: "Razorpay + Stripe + UPI integration",
    icon: CreditCard,
  },
  {
    title: "Data Infrastructure",
    description: "Scalable databases and data pipelines for growth.",
    example: "PostgreSQL + Redis + real-time sync",
    icon: Database,
  },
  {
    title: "Security & Compliance",
    description: "Enterprise-grade security and regulatory compliance.",
    example: "SOC2 + GDPR + HIPAA readiness",
    icon: Shield,
  },
  {
    title: "Workflow Orchestration",
    description: "Connect all your tools into unified workflows.",
    example: "n8n + Zapier + custom integrations",
    icon: Workflow,
  },
];

// ═══════════════════════════════════════════════════════════════
// ToolkitSection Component
// ═══════════════════════════════════════════════════════════════

export function ToolkitSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section 
      id="toolkit"
      ref={containerRef} 
      className="py-16 sm:py-20 lg:py-24 relative overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sky/5 to-transparent" />
      </div>

      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-12 lg:mb-16"
        >
          {/* Toolbox Icon */}
          <motion.div
            initial={{ scale: 0.8, rotateX: -30 }}
            animate={isInView ? { scale: 1, rotateX: 0 } : {}}
            transition={{ duration: 0.8, type: "spring" }}
            className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-6
                       bg-gradient-to-br from-sky/20 to-teal/20
                       rounded-2xl border border-sky/30"
          >
            <Bot className="w-8 h-8 sm:w-10 sm:h-10 text-sky" />
          </motion.div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            <span className="text-text">The </span>
            <span className="bg-gradient-to-r from-sky to-teal bg-clip-text text-transparent">
              Toolkit
            </span>
          </h2>
          
          <p className="text-base sm:text-lg text-subtext-1 max-w-2xl mx-auto mb-2 sm:mb-4">
            These are the <strong className="text-text">Yantras</strong> we build. 
            Each box is a problem we solve.
          </p>

          <p className="text-xs sm:text-sm text-subtext-0">
            Hover on each to see what we deliver
          </p>
        </motion.div>

        {/* Uniform 4x4 Bento Grid */}
        <UniformBentoGrid items={services} className="mb-10 sm:mb-12 lg:mb-16" />

        {/* Integration Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          {/* Connecting Line Animation */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-4 sm:mb-6">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-sky"
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : {}}
                transition={{ delay: 1 + i * 0.1 }}
              />
            ))}
            <motion.div
              className="h-0.5 bg-gradient-to-r from-sky to-teal"
              initial={{ width: 0 }}
              animate={isInView ? { width: 80 } : {}}
              transition={{ duration: 0.8, delay: 1.5 }}
            />
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={`right-${i}`}
                className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-teal"
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : {}}
                transition={{ delay: 1.8 + i * 0.1 }}
              />
            ))}
          </div>

          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 2 }}
            className="inline-block px-4 sm:px-6 py-2.5 sm:py-3 rounded-full
                       bg-gradient-to-r from-sky/10 to-teal/10
                       border border-sky/20"
          >
            <p className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold">
              <span className="text-text">Full Stack AI Engineering.</span>{" "}
              <span className="text-sky">Seamless.</span>{" "}
              <span className="text-teal">Sovereign.</span>{" "}
              <span className="text-sapphire">Scalable.</span>
            </p>
          </motion.div>

          <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-subtext-0">
            Tools that communicate freely with each other.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default ToolkitSection;