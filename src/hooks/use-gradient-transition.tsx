"use client";

import { useEffect, useState, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════
// Section Theme Definitions - Catppuccin Aligned
// ═══════════════════════════════════════════════════════════════

export interface SectionTheme {
  id: string;
  gradient: string;
  // Optional accent color for elements in this section
  accent?: string;
}

// Pre-defined section themes using Catppuccin colors
export const SECTION_THEMES: Record<string, SectionTheme> = {
  hero: {
    id: "hero",
    gradient: `linear-gradient(
      180deg,
      hsl(var(--bg-primary)) 0%,
      hsl(var(--bg-secondary)) 100%
    )`,
  },
  toolkit: {
    id: "toolkit",
    gradient: `linear-gradient(
      180deg,
      hsl(var(--bg-secondary)) 0%,
      hsl(240 21% 14%) 50%,
      hsl(var(--bg-primary)) 100%
    )`,
  },
  blueprints: {
    id: "blueprints",
    gradient: `linear-gradient(
      180deg,
      hsl(var(--bg-primary)) 0%,
      hsl(240 21% 10%) 50%,
      hsl(var(--bg-secondary)) 100%
    )`,
  },
  elements: {
    id: "elements",
    gradient: `linear-gradient(
      180deg,
      hsl(var(--bg-secondary)) 0%,
      hsl(var(--bg-tertiary)) 50%,
      hsl(var(--bg-primary)) 100%
    )`,
  },
  cta: {
    id: "cta",
    gradient: `linear-gradient(
      180deg,
      hsl(var(--bg-primary)) 0%,
      hsl(240 21% 8%) 100%
    )`,
  },
  // Assessment page sections
  assessment: {
    id: "assessment",
    gradient: `linear-gradient(
      180deg,
      hsl(var(--bg-primary)) 0%,
      hsl(240 21% 11%) 50%,
      hsl(var(--bg-secondary)) 100%
    )`,
  },
  // Studio page sections
  studio: {
    id: "studio",
    gradient: `linear-gradient(
      180deg,
      hsl(var(--bg-secondary)) 0%,
      hsl(var(--bg-primary)) 50%,
      hsl(240 21% 10%) 100%
    )`,
  },
};

// ═══════════════════════════════════════════════════════════════
// useGradientTransition Hook
// ═══════════════════════════════════════════════════════════════

interface UseGradientTransitionOptions {
  /** Threshold for intersection (0.0 - 1.0) */
  threshold?: number;
  /** Root margin for earlier/later triggering */
  rootMargin?: string;
  /** Default gradient if no section is active */
  defaultGradient?: string;
}

export function useGradientTransition(
  themes: SectionTheme[],
  options: UseGradientTransitionOptions = {}
) {
  const {
    threshold = 0.3,
    rootMargin = "-10% 0px -10% 0px",
    defaultGradient = themes[0]?.gradient || "hsl(var(--bg-primary))",
  } = options;

  const [activeGradient, setActiveGradient] = useState(defaultGradient);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    // Skip if no themes provided
    if (!themes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the most visible section
        let maxRatio = 0;
        let mostVisibleEntry: IntersectionObserverEntry | null = null;

        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            mostVisibleEntry = entry;
          }
        });

        if (mostVisibleEntry) {
          const theme = themes.find((t) => t.id === mostVisibleEntry!.target.id);
          if (theme) {
            setActiveGradient(theme.gradient);
            setActiveSection(theme.id);
          }
        }
      },
      {
        threshold: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6],
        rootMargin,
      }
    );

    // Observe all sections
    themes.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [themes, threshold, rootMargin]);

  return { activeGradient, activeSection };
}

// ═══════════════════════════════════════════════════════════════
// GradientBackground Component
// ═══════════════════════════════════════════════════════════════

interface GradientBackgroundProps {
  gradient: string;
  /** Transition duration in seconds */
  transitionDuration?: number;
  /** Additional CSS class */
  className?: string;
}

export function GradientBackground({
  gradient,
  transitionDuration = 0.8,
  className = "",
}: GradientBackgroundProps) {
  return (
    <div
      className={`fixed inset-0 -z-10 pointer-events-none ${className}`}
      style={{
        background: gradient,
        transition: `background ${transitionDuration}s cubic-bezier(0.4, 0, 0.2, 1)`,
      }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════
// SectionWrapper Component - Wraps sections with proper IDs
// ═══════════════════════════════════════════════════════════════

interface SectionWrapperProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  /** Optional inline gradient for this section (overrides global) */
  gradient?: string;
  /** Whether to show a subtle gradient overlay on this section */
  showOverlay?: boolean;
}

export function SectionWrapper({
  id,
  children,
  className = "",
  gradient,
  showOverlay = false,
}: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={`relative ${className}`}
      style={gradient ? { background: gradient } : undefined}
    >
      {showOverlay && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(
              180deg,
              transparent 0%,
              hsl(var(--bg-primary) / 0.3) 50%,
              transparent 100%
            )`,
          }}
        />
      )}
      {children}
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// GradientTransitionProvider - Context for gradient state
// ═══════════════════════════════════════════════════════════════

import { createContext, useContext, ReactNode } from "react";

interface GradientContextValue {
  activeGradient: string;
  activeSection: string | null;
}

const GradientContext = createContext<GradientContextValue | null>(null);

interface GradientTransitionProviderProps {
  children: ReactNode;
  themes?: SectionTheme[];
}

export function GradientTransitionProvider({
  children,
  themes = Object.values(SECTION_THEMES),
}: GradientTransitionProviderProps) {
  const { activeGradient, activeSection } = useGradientTransition(themes);

  return (
    <GradientContext.Provider value={{ activeGradient, activeSection }}>
      <GradientBackground gradient={activeGradient} />
      {children}
    </GradientContext.Provider>
  );
}

export function useGradientContext() {
  const context = useContext(GradientContext);
  if (!context) {
    // Return default values if used outside provider
    return {
      activeGradient: "hsl(var(--bg-primary))",
      activeSection: null,
    };
  }
  return context;
}

// ═══════════════════════════════════════════════════════════════
// Default Export
// ═══════════════════════════════════════════════════════════════

export default useGradientTransition;