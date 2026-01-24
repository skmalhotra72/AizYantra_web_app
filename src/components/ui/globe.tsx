"use client";

import { useEffect, useRef, useState } from 'react';
import createGlobe from 'cobe';

interface GlobeProps {
  className?: string;
  size?: number;
}

export function Globe({ className = "", size = 400 }: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let phi = 0;
    let globe: ReturnType<typeof createGlobe> | null = null;

    if (canvasRef.current) {
      globe = createGlobe(canvasRef.current, {
        devicePixelRatio: 2,
        width: size * 2,
        height: size * 2,
        phi: 0,
        theta: 0.25,
        dark: 1,
        diffuse: 1.2,
        mapSamples: 16000,
        mapBrightness: 6,
        baseColor: [0.1, 0.1, 0.12],
        markerColor: [0, 0.8, 0.8], // Cyan markers
        glowColor: [0, 0.6, 0.6],
        markers: [
          // Major cities - representing 100+ countries
          { location: [28.6139, 77.209], size: 0.08 },    // Delhi (HQ)
          { location: [19.076, 72.8777], size: 0.06 },    // Mumbai
          { location: [12.9716, 77.5946], size: 0.05 },   // Bangalore
          { location: [40.7128, -74.006], size: 0.06 },   // New York
          { location: [51.5074, -0.1278], size: 0.06 },   // London
          { location: [35.6762, 139.6503], size: 0.05 },  // Tokyo
          { location: [-33.8688, 151.2093], size: 0.05 }, // Sydney
          { location: [1.3521, 103.8198], size: 0.05 },   // Singapore
          { location: [25.2048, 55.2708], size: 0.05 },   // Dubai
          { location: [55.7558, 37.6173], size: 0.04 },   // Moscow
          { location: [-23.5505, -46.6333], size: 0.04 }, // São Paulo
          { location: [49.2827, -123.1207], size: 0.04 }, // Vancouver
          { location: [48.8566, 2.3522], size: 0.05 },    // Paris
          { location: [52.52, 13.405], size: 0.04 },      // Berlin
          { location: [22.3193, 114.1694], size: 0.05 },  // Hong Kong
          { location: [37.5665, 126.978], size: 0.04 },   // Seoul
        ],
        onRender: (state) => {
          // Auto-rotate
          state.phi = phi;
          phi += 0.003;
          
          if (!isLoaded) {
            setIsLoaded(true);
          }
        }
      });
    }

    return () => {
      if (globe) {
        globe.destroy();
      }
    };
  }, [size, isLoaded]);

  return (
    <div className={`relative ${className}`}>
      {/* Globe Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          width: size,
          height: size,
          contain: 'layout paint size',
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 1s ease',
        }}
        width={size * 2}
        height={size * 2}
      />
      
      {/* Loading state */}
      {!isLoaded && (
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ width: size, height: size }}
        >
          <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
        </div>
      )}
      
      {/* Glow effect behind globe */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10
                   bg-gradient-radial from-cyan-500/20 via-transparent to-transparent
                   rounded-full blur-2xl"
        style={{ width: size * 1.2, height: size * 1.2 }}
      />
    </div>
  );
}

// Stats component to show below/beside the globe
export function GlobeStats() {
  const stats = [
    { value: "100+", label: "Countries" },
    { value: "40+", label: "Languages" },
    { value: "99.9%", label: "Uptime" },
  ];

  return (
    <div className="flex gap-8 justify-center">
      {stats.map((stat, index) => (
        <div key={stat.label} className="text-center">
          <div className="text-2xl md:text-3xl font-bold text-cyan-500 dark:text-cyan-400">
            {stat.value}
          </div>
          <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Globe;