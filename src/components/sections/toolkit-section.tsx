"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
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
} from "lucide-react";

const services = [
  {
    title: "Website Building",
    description: "Modern, responsive websites built with Next.js and cutting-edge technologies.",
    example: "AI-powered landing pages with 3D animations",
    icon: Globe,
    colSpan: 2 as const,
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
    description: "24/7 AI voice assistants that handle calls naturally in multiple languages.",
    example: "Tripti - our AI SDR handling 40+ languages",
    icon: Phone,
    colSpan: 2 as const,
    rowSpan: 2 as const,
  },
  {
    title: "Marketing Communication",
    description: "Unified messaging across email, SMS, and social channels.",
    example: "Automated drip campaigns with personalization",
    icon: Megaphone,
  },
  {
    title: "Data Analysis",
    description: "Transform raw data into actionable insights with AI analytics.",
    example: "Real-time dashboards with predictive analytics",
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
    description: "Eliminate repetitive tasks with intelligent process automation.",
    example: "Invoice processing in 30 seconds vs 30 minutes",
    icon: Bot,
  },
  {
    title: "WhatsApp Agents",
    description: "AI-powered WhatsApp bots for sales, support, and engagement.",
    example: "Order tracking + appointment booking",
    icon: MessageCircle,
  },
  {
    title: "Telegram Agents",
    description: "Custom Telegram bots for community management and automation.",
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
    description: "Connect your store with inventory, shipping, and analytics.",
    example: "Shopify + WooCommerce unified dashboard",
    icon: ShoppingCart,
  },
  {
    title: "Payment Gateway",
    description: "Seamless payment processing with multiple gateway support.",
    example: "Razorpay + Stripe + UPI integration",
    icon: CreditCard,
  },
];

export function ToolkitSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section ref={containerRef} className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent" />
      </div>

      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          {/* Toolbox Icon */}
          <motion.div
            initial={{ scale: 0.8, rotateX: -30 }}
            animate={isInView ? { scale: 1, rotateX: 0 } : {}}
            transition={{ duration: 0.8, type: "spring" }}
            className="inline-flex items-center justify-center w-20 h-20 mb-6
                       bg-gradient-to-br from-cyan-500/20 to-teal-500/20
                       rounded-2xl border border-cyan-500/30"
          >
            <Bot className="w-10 h-10 text-cyan-500" />
          </motion.div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-gray-900 dark:text-white">The </span>
            <span className="bg-gradient-to-r from-cyan-500 to-teal-500 bg-clip-text text-transparent">
              Toolkit
            </span>
          </h2>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-4">
            These are the <strong className="text-gray-900 dark:text-white">Yantras</strong> we build. 
            Each box is a problem we solve.
          </p>

          <p className="text-sm text-gray-500 dark:text-gray-500">
            Hover on each to see what we deliver
          </p>
        </motion.div>

        {/* Bento Grid */}
        <BentoGrid className="mb-16">
          {services.map((service, index) => (
            <BentoGridItem
              key={service.title}
              index={index}
              title={service.title}
              description={service.description}
              example={service.example}
              icon={service.icon}
              colSpan={service.colSpan}
              rowSpan={service.rowSpan}
            />
          ))}
        </BentoGrid>

        {/* Integration Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          {/* Connecting Line Animation */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-cyan-500"
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : {}}
                transition={{ delay: 1 + i * 0.1 }}
              />
            ))}
            <motion.div
              className="h-0.5 bg-gradient-to-r from-cyan-500 to-teal-500"
              initial={{ width: 0 }}
              animate={isInView ? { width: 100 } : {}}
              transition={{ duration: 0.8, delay: 1.5 }}
            />
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={`right-${i}`}
                className="w-2 h-2 rounded-full bg-teal-500"
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
            className="inline-block px-6 py-3 rounded-full
                       bg-gradient-to-r from-cyan-500/10 to-teal-500/10
                       border border-cyan-500/20"
          >
            <p className="text-lg md:text-xl font-semibold">
              <span className="text-gray-900 dark:text-white">Full Stack AI Engineering.</span>{" "}
              <span className="text-cyan-600 dark:text-cyan-400">Seamless.</span>{" "}
              <span className="text-teal-600 dark:text-teal-400">Sovereign.</span>{" "}
              <span className="text-cyan-600 dark:text-cyan-400">Scalable.</span>
            </p>
          </motion.div>

          <p className="mt-4 text-sm text-gray-500 dark:text-gray-500">
            Tools that communicate freely with each other.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default ToolkitSection;