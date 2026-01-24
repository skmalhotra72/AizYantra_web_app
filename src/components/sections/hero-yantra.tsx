"use client";

import { motion } from "framer-motion";
import { ExpandableTags } from "@/components/ui/expandable-tags";
import { Globe, GlobeStats } from "@/components/ui/globe";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export function HeroYantra() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        {/* Radial gradient */}
        <div className="absolute inset-0 bg-gradient-radial from-cyan-500/5 via-transparent to-transparent" />
        
        {/* Animated grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,200,200,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,200,200,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left Column - Text Content */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 mb-6
                         bg-gradient-to-r from-amber-500/10 to-orange-500/10
                         border border-amber-500/30 rounded-full"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                Building the Tools of Modern Enterprise
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
            >
              <span className="text-gray-900 dark:text-white">AIz</span>
              <span className="bg-gradient-to-r from-cyan-500 to-teal-500 bg-clip-text text-transparent">
                Yantra
              </span>
            </motion.h1>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-6 max-w-xl mx-auto lg:mx-0"
            >
              In the age of AI, the right tool is a{" "}
              <span className="text-cyan-600 dark:text-cyan-400 font-semibold">
                competitive edge
              </span>
              . We architect custom{" "}
              <span className="font-semibold text-gray-800 dark:text-gray-100">
                Yantras
              </span>{" "}
              (tools) to:
            </motion.p>

            {/* Expandable Tags */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-8"
            >
              <ExpandableTags />
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link href="/contact">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3
                           bg-gradient-to-r from-cyan-500 to-teal-500
                           text-white font-semibold rounded-xl
                           shadow-lg shadow-cyan-500/25
                           hover:shadow-xl hover:shadow-cyan-500/30
                           transition-shadow duration-300"
                >
                  Get Your Yantra
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
              
              <Link href="/solutions">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3
                           bg-white/50 dark:bg-white/10 backdrop-blur-sm
                           text-gray-700 dark:text-gray-200 font-semibold rounded-xl
                           border border-gray-200 dark:border-white/20
                           hover:bg-white/80 dark:hover:bg-white/20
                           transition-colors duration-300"
                >
                  View Our Work
                </motion.button>
              </Link>
            </motion.div>
          </div>

          {/* Right Column - Globe */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col items-center order-1 lg:order-2"
          >
            {/* Globe */}
            <div className="relative">
              <Globe size={350} className="mx-auto" />
              
              {/* Glassmorphic card overlay */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="absolute -bottom-4 left-1/2 -translate-x-1/2
                           bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl
                           border border-white/50 dark:border-white/10
                           rounded-2xl px-6 py-4 shadow-xl
                           min-w-[280px]"
              >
                <GlobeStats />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default HeroYantra;