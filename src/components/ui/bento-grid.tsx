"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { LucideIcon } from "lucide-react";

interface BentoGridProps {
  className?: string;
  children?: React.ReactNode;
}

export function BentoGrid({ className, children }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
}

interface BentoGridItemProps {
  className?: string;
  title: string;
  description: string;
  example: string;
  icon: LucideIcon;
  index?: number;
  colSpan?: 1 | 2;
  rowSpan?: 1 | 2;
}

export function BentoGridItem({
  className,
  title,
  description,
  example,
  icon: Icon,
  index = 0,
  colSpan = 1,
  rowSpan = 1,
}: BentoGridItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group relative rounded-2xl overflow-hidden",
        "bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm",
        "border border-gray-200/50 dark:border-white/10",
        "hover:border-cyan-500/50 dark:hover:border-cyan-500/50",
        "hover:shadow-xl hover:shadow-cyan-500/10",
        "transition-all duration-300 cursor-pointer",
        "p-6 flex flex-col justify-between",
        colSpan === 2 && "md:col-span-2",
        rowSpan === 2 && "md:row-span-2",
        rowSpan === 1 ? "min-h-[180px]" : "min-h-[380px]",
        className
      )}
    >
      {/* Background gradient on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        initial={false}
        animate={{ opacity: isHovered ? 1 : 0 }}
      />

      {/* Animated border glow */}
      <motion.div
        className="absolute inset-0 rounded-2xl"
        initial={false}
        animate={{
          boxShadow: isHovered
            ? "inset 0 0 30px rgba(0, 200, 200, 0.1)"
            : "inset 0 0 0px rgba(0, 200, 200, 0)",
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Icon */}
        <motion.div
          className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 
                     flex items-center justify-center mb-4
                     group-hover:from-cyan-500/30 group-hover:to-teal-500/30
                     transition-colors duration-300"
          animate={{ rotate: isHovered ? 5 : 0 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Icon className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
        </motion.div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>

        {/* Description - shows on hover */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ 
            opacity: isHovered ? 1 : 0, 
            height: isHovered ? "auto" : 0 
          }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {description}
          </p>
          
          {/* Example */}
          <div className="flex items-start gap-2 text-xs">
            <span className="text-cyan-500 font-medium shrink-0">e.g.</span>
            <span className="text-gray-500 dark:text-gray-500 italic">
              {example}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Bottom decoration line */}
      <motion.div
        className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-cyan-500 to-teal-500"
        initial={{ width: "0%" }}
        animate={{ width: isHovered ? "100%" : "0%" }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}

export default BentoGrid;