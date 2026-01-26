"use client";

import { useEffect, useRef, useState } from "react";
import createGlobe from "cobe";

// City markers for the network
const CITY_MARKERS: { location: [number, number]; size: number }[] = [
  { location: [40.71, -74.01], size: 0.08 },   // New York
  { location: [37.77, -122.41], size: 0.07 },  // San Francisco
  { location: [51.51, -0.13], size: 0.08 },    // London
  { location: [48.86, 2.35], size: 0.06 },     // Paris
  { location: [52.52, 13.41], size: 0.06 },    // Berlin
  { location: [55.75, 37.62], size: 0.07 },    // Moscow
  { location: [35.68, 139.69], size: 0.08 },   // Tokyo
  { location: [31.23, 121.47], size: 0.08 },   // Shanghai
  { location: [22.32, 114.17], size: 0.07 },   // Hong Kong
  { location: [1.35, 103.82], size: 0.07 },    // Singapore
  { location: [28.61, 77.21], size: 0.08 },    // Delhi
  { location: [19.08, 72.88], size: 0.07 },    // Mumbai
  { location: [25.20, 55.27], size: 0.06 },    // Dubai
  { location: [-33.87, 151.21], size: 0.07 },  // Sydney
  { location: [-23.55, -46.63], size: 0.07 },  // Sao Paulo
  { location: [30.04, 31.24], size: 0.06 },    // Cairo
  { location: [19.43, -99.13], size: 0.06 },   // Mexico City
  { location: [34.05, -118.24], size: 0.06 },  // Los Angeles
];

interface NetworkGlobeProps {
  className?: string;
}

export default function NetworkGlobe({ className = "" }: NetworkGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const phiRef = useRef(0);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const checkDarkMode = () => {
      const dark =
        document.documentElement.classList.contains("dark") ||
        document.documentElement.getAttribute("data-theme") === "dark";
      setIsDark(dark);
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    let width = 0;
    const onResize = () => {
      if (containerRef.current) {
        width = containerRef.current.offsetWidth;
      }
    };
    onResize();
    window.addEventListener("resize", onResize);

    // Color scheme based on reference image - golden/cream continents
    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.25,
      dark: isDark ? 1 : 0,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: isDark ? 8 : 2,
      baseColor: isDark ? [0.05, 0.08, 0.15] : [0.9, 0.95, 1],
      markerColor: isDark ? [1, 0.8, 0.3] : [0.9, 0.5, 0.1],
      glowColor: isDark ? [0.95, 0.7, 0.3] : [0.9, 0.5, 0.2],
      markers: CITY_MARKERS,
      opacity: 0.92,
      onRender: (state) => {
        // Auto rotation when not interacting
        if (!pointerInteracting.current) {
          phiRef.current += 0.003;
        }
        state.phi = phiRef.current + pointerInteractionMovement.current;
        state.width = width * 2;
        state.height = width * 2;
      },
    });

    // Pointer events for interaction
    const onPointerDown = (e: PointerEvent) => {
      pointerInteracting.current = e.clientX - pointerInteractionMovement.current;
      if (canvasRef.current) {
        canvasRef.current.style.cursor = "grabbing";
      }
    };

    const onPointerUp = () => {
      pointerInteracting.current = null;
      if (canvasRef.current) {
        canvasRef.current.style.cursor = "grab";
      }
    };

    const onPointerOut = () => {
      pointerInteracting.current = null;
      if (canvasRef.current) {
        canvasRef.current.style.cursor = "grab";
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (pointerInteracting.current !== null) {
        const delta = e.clientX - pointerInteracting.current;
        pointerInteractionMovement.current = delta / 100;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (pointerInteracting.current !== null && e.touches[0]) {
        const delta = e.touches[0].clientX - pointerInteracting.current;
        pointerInteractionMovement.current = delta / 100;
      }
    };

    const canvas = canvasRef.current;
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointerout", onPointerOut);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("touchmove", onTouchMove);

    return () => {
      globe.destroy();
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointerout", onPointerOut);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("touchmove", onTouchMove);
    };
  }, [isDark]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-square max-w-[500px] mx-auto ${className}`}
    >
      {/* Outer glow effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDark
            ? "radial-gradient(circle at 50% 50%, rgba(251, 191, 36, 0.12) 0%, rgba(251, 191, 36, 0.04) 30%, transparent 55%)"
            : "radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.03) 30%, transparent 55%)",
        }}
      />

      {/* Orbital rings */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 400 400"
        style={{ transform: "rotateX(70deg)" }}
      >
        {/* Inner ring */}
        <ellipse
          cx="200"
          cy="200"
          rx="160"
          ry="160"
          fill="none"
          stroke={isDark ? "rgba(251, 191, 36, 0.25)" : "rgba(245, 158, 11, 0.2)"}
          strokeWidth="1"
          strokeDasharray="8 4"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 200 200"
            to="360 200 200"
            dur="40s"
            repeatCount="indefinite"
          />
        </ellipse>

        {/* Middle ring */}
        <ellipse
          cx="200"
          cy="200"
          rx="185"
          ry="185"
          fill="none"
          stroke={isDark ? "rgba(251, 191, 36, 0.18)" : "rgba(245, 158, 11, 0.15)"}
          strokeWidth="1"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="360 200 200"
            to="0 200 200"
            dur="55s"
            repeatCount="indefinite"
          />
        </ellipse>

        {/* Outer ring */}
        <ellipse
          cx="200"
          cy="200"
          rx="210"
          ry="210"
          fill="none"
          stroke={isDark ? "rgba(251, 191, 36, 0.12)" : "rgba(245, 158, 11, 0.1)"}
          strokeWidth="1"
          strokeDasharray="12 6"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 200 200"
            to="360 200 200"
            dur="70s"
            repeatCount="indefinite"
          />
        </ellipse>
      </svg>

      {/* Network nodes around the globe */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Outer connection points */}
        {[
          { top: "5%", left: "50%", delay: "0s" },
          { top: "12%", left: "78%", delay: "0.5s" },
          { top: "25%", left: "92%", delay: "1s" },
          { top: "45%", left: "98%", delay: "1.5s" },
          { top: "70%", left: "90%", delay: "2s" },
          { top: "85%", left: "72%", delay: "2.5s" },
          { top: "92%", left: "50%", delay: "3s" },
          { top: "85%", left: "28%", delay: "3.5s" },
          { top: "70%", left: "10%", delay: "4s" },
          { top: "45%", left: "2%", delay: "4.5s" },
          { top: "25%", left: "8%", delay: "5s" },
          { top: "12%", left: "22%", delay: "5.5s" },
        ].map((pos, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full animate-pulse"
            style={{
              top: pos.top,
              left: pos.left,
              transform: "translate(-50%, -50%)",
              backgroundColor: isDark ? "rgba(251, 191, 36, 0.7)" : "rgba(245, 158, 11, 0.6)",
              boxShadow: isDark
                ? "0 0 8px rgba(251, 191, 36, 0.5)"
                : "0 0 8px rgba(245, 158, 11, 0.4)",
              animationDelay: pos.delay,
            }}
          />
        ))}

        {/* Connection lines from outer points */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          {[
            { x1: 50, y1: 5, x2: 50, y2: 25 },
            { x1: 78, y1: 12, x2: 62, y2: 28 },
            { x1: 92, y1: 25, x2: 72, y2: 35 },
            { x1: 98, y1: 45, x2: 75, y2: 48 },
            { x1: 90, y1: 70, x2: 70, y2: 62 },
            { x1: 72, y1: 85, x2: 60, y2: 70 },
            { x1: 50, y1: 92, x2: 50, y2: 75 },
            { x1: 28, y1: 85, x2: 40, y2: 70 },
            { x1: 10, y1: 70, x2: 30, y2: 62 },
            { x1: 2, y1: 45, x2: 25, y2: 48 },
            { x1: 8, y1: 25, x2: 28, y2: 35 },
            { x1: 22, y1: 12, x2: 38, y2: 28 },
          ].map((line, i) => (
            <line
              key={i}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke={isDark ? "rgba(251, 191, 36, 0.2)" : "rgba(245, 158, 11, 0.15)"}
              strokeWidth="0.3"
            />
          ))}
        </svg>
      </div>

      {/* The actual COBE globe canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab"
        style={{
          contain: "layout paint size",
          opacity: 1,
        }}
      />
    </div>
  );
}