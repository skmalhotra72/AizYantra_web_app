"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { useState } from "react";

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface BentoItem {
  title: string;
  description: string;
  example?: string;
  icon: LucideIcon;
}

interface UniformBentoGridProps {
  items: BentoItem[];
  className?: string;
  maxItems?: number;
}

interface BentoCardProps {
  item: BentoItem;
  index: number;
}

// ═══════════════════════════════════════════════════════════════
// BentoCard Component - Individual uniform card
// ═══════════════════════════════════════════════════════════════

function BentoCard({ item, index }: BentoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = item.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative h-full"
    >
      <div
        className={`
          relative h-full overflow-hidden
          rounded-xl p-4 sm:p-5
          bg-crust/80 backdrop-blur-sm
          border border-surface-0/50
          transition-all duration-300 ease-out
          flex flex-col
          ${isHovered 
            ? "border-sky/50 shadow-lg shadow-sky/10 scale-[1.02]" 
            : "hover:border-surface-1"
          }
        `}
      >
        {/* Background gradient on hover */}
        <div 
          className={`
            absolute inset-0 opacity-0 transition-opacity duration-300
            bg-gradient-to-br from-sky/10 via-transparent to-teal/10
            ${isHovered ? "opacity-100" : ""}
          `}
        />

        {/* Icon */}
        <div className="relative z-10 mb-3">
          <div 
            className={`
              w-10 h-10 sm:w-12 sm:h-12 rounded-lg
              flex items-center justify-center
              transition-all duration-300
              ${isHovered 
                ? "bg-sky/20 text-sky" 
                : "bg-surface-0/50 text-subtext-0"
              }
            `}
          >
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col">
          {/* Title */}
          <h3 
            className={`
              text-sm sm:text-base font-semibold mb-1.5
              transition-colors duration-300
              ${isHovered ? "text-sky" : "text-text"}
            `}
          >
            {item.title}
          </h3>

          {/* Description - shows on hover, hidden on mobile by default */}
          <p 
            className={`
              text-xs sm:text-sm text-subtext-1 leading-relaxed
              transition-all duration-300
              line-clamp-2 sm:line-clamp-3
              ${isHovered ? "text-subtext-0" : ""}
            `}
          >
            {isHovered && item.example ? item.example : item.description}
          </p>
        </div>

        {/* Bottom accent line */}
        <div 
          className={`
            absolute bottom-0 left-0 right-0 h-0.5
            bg-gradient-to-r from-sky via-teal to-sapphire
            transition-all duration-300 origin-left
            ${isHovered ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"}
          `}
        />
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// UniformBentoGrid Component - 4x4 Grid
// ═══════════════════════════════════════════════════════════════

export function UniformBentoGrid({ 
  items, 
  className = "",
  maxItems = 16 
}: UniformBentoGridProps) {
  // Limit to maxItems (default 16 for 4x4)
  const displayItems = items.slice(0, maxItems);

  return (
    <div 
      className={`
        grid 
        grid-cols-2 
        sm:grid-cols-3 
        lg:grid-cols-4
        gap-3 sm:gap-4 lg:gap-5
        auto-rows-[140px] sm:auto-rows-[160px] lg:auto-rows-[180px]
        ${className}
      `}
    >
      {displayItems.map((item, index) => (
        <BentoCard key={item.title} item={item} index={index} />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Legacy BentoGrid Exports (for backward compatibility)
// ═══════════════════════════════════════════════════════════════

interface LegacyBentoGridProps {
  children: React.ReactNode;
  className?: string;
}

export function BentoGrid({ children, className = "" }: LegacyBentoGridProps) {
  return (
    <div 
      className={`
        grid 
        grid-cols-2 
        sm:grid-cols-3 
        lg:grid-cols-4
        gap-3 sm:gap-4 lg:gap-5
        auto-rows-[140px] sm:auto-rows-[160px] lg:auto-rows-[180px]
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface LegacyBentoGridItemProps {
  title: string;
  description: string;
  example?: string;
  icon: LucideIcon;
  index?: number;
  colSpan?: 1 | 2;  // Ignored in uniform grid
  rowSpan?: 1 | 2;  // Ignored in uniform grid
}

export function BentoGridItem({ 
  title, 
  description, 
  example, 
  icon,
  index = 0,
}: LegacyBentoGridItemProps) {
  return (
    <BentoCard 
      item={{ title, description, example, icon }} 
      index={index} 
    />
  );
}

// ═══════════════════════════════════════════════════════════════
// Default Export
// ═══════════════════════════════════════════════════════════════

export default UniformBentoGrid;