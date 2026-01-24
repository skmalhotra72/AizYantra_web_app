"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

// ═══════════════════════════════════════════════════════════════
// 🎨 COLOR PRESETS - Change ACTIVE_PRESET to switch themes
// ═══════════════════════════════════════════════════════════════

const COLOR_PRESETS = {
  // Current cyan theme
  cyan: {
    particle: "#00e5ff",
    line: "#00e5ff",
    orb: "#00ffff",
    name: "Electric Cyan"
  },
  
  // Sacred gold - spiritual & premium
  gold: {
    particle: "#fbbf24",
    line: "#f59e0b",
    orb: "#fcd34d",
    name: "Sacred Gold"
  },
  
  // Brand orange - energetic & bold
  orange: {
    particle: "#f97316",
    line: "#fb923c",
    orb: "#fdba74",
    name: "AIzYantra Orange"
  },
  
  // Sunset blend - warm & inviting
  sunset: {
    particle: "#f97316",
    line: "#ec4899",
    orb: "#fbbf24",
    name: "Sunset Fusion"
  },
  
  // Royal purple - mystical & luxurious
  purple: {
    particle: "#a855f7",
    line: "#c084fc",
    orb: "#e879f9",
    name: "Royal Purple"
  },
  
  // Emerald - nature & growth
  emerald: {
    particle: "#10b981",
    line: "#34d399",
    orb: "#6ee7b7",
    name: "Emerald Growth"
  },
  
  // Rose gold - modern & elegant
  roseGold: {
    particle: "#fb7185",
    line: "#f472b6",
    orb: "#fda4af",
    name: "Rose Gold"
  },
  
  // Fire - intense & powerful
  fire: {
    particle: "#ef4444",
    line: "#f97316",
    orb: "#fbbf24",
    name: "Sacred Fire"
  },
  
  // Ocean depths - calm & deep
  ocean: {
    particle: "#0ea5e9",
    line: "#06b6d4",
    orb: "#22d3ee",
    name: "Ocean Depths"
  },
  
  // Aurora - magical northern lights
  aurora: {
    particle: "#22d3ee",
    line: "#a855f7",
    orb: "#4ade80",
    name: "Aurora Borealis"
  },
};

// ═══════════════════════════════════════════════════════════════
// 🎯 SELECT YOUR THEME HERE - Change this to switch colors!
// ═══════════════════════════════════════════════════════════════

const ACTIVE_PRESET: keyof typeof COLOR_PRESETS = "aurora"; // 👈 CHANGE THIS!
// Options: "cyan" | "gold" | "orange" | "sunset" | "purple" | "emerald" | "roseGold" | "fire" | "ocean" | "aurora"

// ═══════════════════════════════════════════════════════════════
// 🎛️ TUNING PARAMETERS
// ═══════════════════════════════════════════════════════════════

const COLORS = COLOR_PRESETS[ACTIVE_PRESET];

const CONFIG = {
  // PARTICLES
  particleCount: 4000,           // ⬆️ Even more particles for richness
  particleSize: 0.028,           // ⬆️ Slightly larger
  particleColor: COLORS.particle,
  particleOpacity: 0.9,          // ⬆️ More vibrant
  
  // ANIMATION SPEED
  rotationSpeed: 0.02,           // Slightly faster
  wobbleSpeed: 0.012,            
  wobbleAmount: 0.12,            
  
  // SCROLL BEHAVIOR
  assemblySpeed: 0.25,           // Fast assembly
  
  // CONNECTION LINES
  showLines: true,               
  lineColor: COLORS.line,          
  lineOpacity: 0.5,              // ⬆️ More visible lines
  
  // CENTRAL ORB
  showOrb: true,                 
  orbColor: COLORS.orb,           
  orbMinScale: 0.12,             
  orbMaxScale: 0.35,             // ⬆️ Larger orb
  orbOpacity: 1.0,               
  
  // YANTRA PATTERN
  yantraLayers: 10,              // ⬆️ More layers for complexity
  yantraSpread: 0.35,            
  yantraDepth: 0.12,             
  
  // SCATTER PATTERN
  scatterRadius: 6,              // ⬆️ Wider scatter
  scatterVariation: 5,           
  
  // OVERALL VISIBILITY
  containerOpacity: 0.85,        // ⬆️ More prominent
  
  // CAMERA
  cameraDistance: 5,             
  cameraFOV: 60,                 
};

// ═══════════════════════════════════════════════════════════════
// 🔧 GEOMETRY GENERATORS
// ═══════════════════════════════════════════════════════════════

function generateYantraPoints(count: number): Float32Array {
  const points = new Float32Array(count * 3);
  const { yantraLayers, yantraSpread, yantraDepth } = CONFIG;
  
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const layer = Math.floor(i / (count / yantraLayers));
    const indexInLayer = i % Math.floor(count / yantraLayers);
    const totalInLayer = Math.floor(count / yantraLayers);
    
    const angle = (indexInLayer / totalInLayer) * Math.PI * 2;
    const radius = 0.5 + layer * yantraSpread;
    
    if (layer % 2 === 0) {
      const triangleAngle = angle + (layer * Math.PI / 6);
      points[i3] = Math.cos(triangleAngle) * radius;
      points[i3 + 1] = Math.sin(triangleAngle) * radius;
      points[i3 + 2] = (layer - yantraLayers / 2) * yantraDepth;
    } else {
      points[i3] = Math.cos(angle) * radius * 0.9;
      points[i3 + 1] = Math.sin(angle) * radius * 0.9;
      points[i3 + 2] = (layer - yantraLayers / 2) * yantraDepth;
    }
  }
  
  return points;
}

function generateScatteredPoints(count: number): Float32Array {
  const points = new Float32Array(count * 3);
  const { scatterRadius, scatterVariation } = CONFIG;
  
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const radius = scatterRadius + Math.random() * scatterVariation;
    
    points[i3] = radius * Math.sin(phi) * Math.cos(theta);
    points[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    points[i3 + 2] = radius * Math.cos(phi) * 0.3;
  }
  
  return points;
}

// ═══════════════════════════════════════════════════════════════
// 🎨 COMPONENTS
// ═══════════════════════════════════════════════════════════════

interface ParticleFieldProps {
  scrollProgress: number;
}

function ParticleField({ scrollProgress }: ParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const [scattered] = useState(() => generateScatteredPoints(CONFIG.particleCount));
  const [yantra] = useState(() => generateYantraPoints(CONFIG.particleCount));

  useFrame((state) => {
    if (!pointsRef.current) return;
    
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < CONFIG.particleCount * 3; i++) {
      positions[i] = THREE.MathUtils.lerp(
        scattered[i],
        yantra[i],
        scrollProgress
      );
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    
    pointsRef.current.rotation.z = state.clock.elapsedTime * CONFIG.rotationSpeed;
    pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * CONFIG.wobbleSpeed) * CONFIG.wobbleAmount;
  });

  return (
    <Points ref={pointsRef} positions={scattered} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={CONFIG.particleColor}
        size={CONFIG.particleSize}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={CONFIG.particleOpacity}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

function ConnectionLines({ scrollProgress }: { scrollProgress: number }) {
  const linesRef = useRef<THREE.LineSegments>(null);
  
  useFrame(() => {
    if (!linesRef.current || !CONFIG.showLines) return;
    (linesRef.current.material as THREE.LineBasicMaterial).opacity = scrollProgress * CONFIG.lineOpacity;
  });

  if (!CONFIG.showLines) return null;

  const linePositions = new Float32Array([
    // Central triangle pointing up
    0, 1.5, 0, -1.3, -0.75, 0,
    -1.3, -0.75, 0, 1.3, -0.75, 0,
    1.3, -0.75, 0, 0, 1.5, 0,
    // Inverted triangle
    0, -1.5, 0, -1.3, 0.75, 0,
    -1.3, 0.75, 0, 1.3, 0.75, 0,
    1.3, 0.75, 0, 0, -1.5, 0,
    // Outer hexagon
    2, 0, 0, 1, 1.73, 0,
    1, 1.73, 0, -1, 1.73, 0,
    -1, 1.73, 0, -2, 0, 0,
    -2, 0, 0, -1, -1.73, 0,
    -1, -1.73, 0, 1, -1.73, 0,
    1, -1.73, 0, 2, 0, 0,
    // Inner star pattern
    0, 0.8, 0, 0.7, -0.4, 0,
    0.7, -0.4, 0, -0.7, -0.4, 0,
    -0.7, -0.4, 0, 0, 0.8, 0,
    0, -0.8, 0, 0.7, 0.4, 0,
    0.7, 0.4, 0, -0.7, 0.4, 0,
    -0.7, 0.4, 0, 0, -0.8, 0,
  ]);

  return (
    <lineSegments ref={linesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={linePositions.length / 3}
          array={linePositions}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color={CONFIG.lineColor}
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  );
}

function CentralOrb({ scrollProgress }: { scrollProgress: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current || !CONFIG.showOrb) return;
    const scale = CONFIG.orbMinScale + scrollProgress * (CONFIG.orbMaxScale - CONFIG.orbMinScale);
    meshRef.current.scale.setScalar(scale);
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.3;
    
    // Pulsing glow effect
    if (glowRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      glowRef.current.scale.setScalar(scale * pulse * 1.5);
    }
  });

  if (!CONFIG.showOrb) return null;

  return (
    <group>
      {/* Outer glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color={CONFIG.orbColor}
          transparent
          opacity={scrollProgress * 0.15}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Core orb */}
      <mesh ref={meshRef}>
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial
          color={CONFIG.orbColor}
          transparent
          opacity={scrollProgress * CONFIG.orbOpacity}
          wireframe
        />
      </mesh>
    </group>
  );
}

function Scene({ scrollProgress }: { scrollProgress: number }) {
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.z = CONFIG.cameraDistance;
  }, [camera]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <ParticleField scrollProgress={scrollProgress} />
      <ConnectionLines scrollProgress={scrollProgress} />
      <CentralOrb scrollProgress={scrollProgress} />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// 🚀 MAIN EXPORT
// ═══════════════════════════════════════════════════════════════

export function SacredGeometryBackground() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      const progress = Math.min(currentScroll / (scrollHeight * CONFIG.assemblySpeed), 1);
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="fixed inset-0 -z-5 pointer-events-none"
      style={{ opacity: CONFIG.containerOpacity }}
    >
      <Canvas
        camera={{ position: [0, 0, CONFIG.cameraDistance], fov: CONFIG.cameraFOV }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene scrollProgress={scrollProgress} />
      </Canvas>
    </div>
  );
}

export default SacredGeometryBackground;