"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

// ═══════════════════════════════════════════════════════════════
// 🎨 COLOR PRESETS - Catppuccin Aligned Soft Pastels
// ═══════════════════════════════════════════════════════════════

const COLOR_PRESETS = {
  // ✨ PRIMARY THEME - Soft Cyan/Teal/Sky (Catppuccin Mocha aligned)
  sacred: {
    particle: "#89DCEB",      // Mocha Sky - soft cyan
    line: "#94E2D5",          // Mocha Teal - soft mint
    orb: "#74C7EC",           // Mocha Sapphire - sky blue
    glow: "#89DCEB",          // Sky glow
    name: "Sacred Geometry"
  },
  
  // Soft sky - lighter variation
  sky: {
    particle: "#89DCEB",      // Mocha Sky
    line: "#89B4FA",          // Mocha Blue
    orb: "#B4BEFE",           // Mocha Lavender
    glow: "#74C7EC",
    name: "Celestial Sky"
  },
  
  // Soft teal - nature variation
  teal: {
    particle: "#94E2D5",      // Mocha Teal
    line: "#89DCEB",          // Mocha Sky
    orb: "#A6E3A1",           // Mocha Green
    glow: "#94E2D5",
    name: "Serene Teal"
  },
  
  // Ocean depths - calm & professional
  ocean: {
    particle: "#74C7EC",      // Mocha Sapphire
    line: "#89DCEB",          // Mocha Sky
    orb: "#89B4FA",           // Mocha Blue
    glow: "#74C7EC",
    name: "Ocean Depths"
  },
  
  // Lavender mist - subtle & elegant
  lavender: {
    particle: "#B4BEFE",      // Mocha Lavender
    line: "#89B4FA",          // Mocha Blue
    orb: "#CBA6F7",           // Mocha Mauve
    glow: "#B4BEFE",
    name: "Lavender Mist"
  },
  
  // Brand orange - for accent sections
  brand: {
    particle: "#FAB387",      // Mocha Peach
    line: "#F9E2AF",          // Mocha Yellow
    orb: "#FAB387",           // Mocha Peach
    glow: "#FAB387",
    name: "AIzYantra Brand"
  },
  
  // Mint fresh - clean & modern
  mint: {
    particle: "#A6E3A1",      // Mocha Green
    line: "#94E2D5",          // Mocha Teal
    orb: "#89DCEB",           // Mocha Sky
    glow: "#94E2D5",
    name: "Fresh Mint"
  },

  // Legacy presets (keeping for compatibility)
  cyan: {
    particle: "#89DCEB",
    line: "#94E2D5",
    orb: "#74C7EC",
    glow: "#89DCEB",
    name: "Electric Cyan"
  },
  
  aurora: {
    particle: "#89DCEB",      // Changed from purple to sky
    line: "#94E2D5",          // Changed from purple to teal
    orb: "#74C7EC",           // Changed from green to sapphire
    glow: "#89DCEB",
    name: "Aurora Borealis"
  },
};

// ═══════════════════════════════════════════════════════════════
// 🎯 SELECT YOUR THEME HERE - Using soft cyan/teal sacred theme
// ═══════════════════════════════════════════════════════════════

const ACTIVE_PRESET: keyof typeof COLOR_PRESETS = "sacred"; // 👈 Soft cyan/teal theme

// ═══════════════════════════════════════════════════════════════
// 🎛️ TUNING PARAMETERS
// ═══════════════════════════════════════════════════════════════

const COLORS = COLOR_PRESETS[ACTIVE_PRESET];

const CONFIG = {
  // PARTICLES
  particleCount: 4000,
  particleSize: 0.026,
  particleColor: COLORS.particle,
  particleOpacity: 0.85,          // Slightly reduced for softer look
  
  // ANIMATION SPEED
  rotationSpeed: 0.015,           // Slower, more meditative
  wobbleSpeed: 0.01,            
  wobbleAmount: 0.1,            
  
  // SCROLL BEHAVIOR
  assemblySpeed: 0.25,
  
  // CONNECTION LINES
  showLines: true,               
  lineColor: COLORS.line,          
  lineOpacity: 0.4,               // Softer lines
  
  // CENTRAL ORB
  showOrb: true,                 
  orbColor: COLORS.orb,           
  orbMinScale: 0.1,             
  orbMaxScale: 0.3,
  orbOpacity: 0.9,               
  
  // GLOW EFFECT
  glowColor: COLORS.glow,
  glowOpacity: 0.12,              // Subtle glow
  
  // YANTRA PATTERN - Sri Yantra inspired
  yantraLayers: 9,               // 9 interlocking triangles
  yantraSpread: 0.32,            
  yantraDepth: 0.1,
  
  // LOTUS PETALS
  showLotus: true,
  outerPetals: 16,               // 16-petal outer lotus
  innerPetals: 8,                // 8-petal inner lotus
  
  // SCATTER PATTERN
  scatterRadius: 5.5,
  scatterVariation: 4.5,           
  
  // OVERALL VISIBILITY
  containerOpacity: 0.7,         // Softer background presence
  
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
    
    // Sri Yantra-inspired pattern with alternating triangles
    if (layer % 2 === 0) {
      // Upward triangles (Shiva)
      const triangleAngle = angle + (layer * Math.PI / 9);
      points[i3] = Math.cos(triangleAngle) * radius;
      points[i3 + 1] = Math.sin(triangleAngle) * radius;
      points[i3 + 2] = (layer - yantraLayers / 2) * yantraDepth;
    } else {
      // Downward triangles (Shakti)
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

  // Sri Yantra-inspired sacred geometry lines
  const linePositions = new Float32Array([
    // Central upward triangle (Shiva)
    0, 1.5, 0, -1.3, -0.75, 0,
    -1.3, -0.75, 0, 1.3, -0.75, 0,
    1.3, -0.75, 0, 0, 1.5, 0,
    
    // Inverted triangle (Shakti)
    0, -1.5, 0, -1.3, 0.75, 0,
    -1.3, 0.75, 0, 1.3, 0.75, 0,
    1.3, 0.75, 0, 0, -1.5, 0,
    
    // Outer circle approximation (Bhupura)
    2, 0, 0, 1.41, 1.41, 0,
    1.41, 1.41, 0, 0, 2, 0,
    0, 2, 0, -1.41, 1.41, 0,
    -1.41, 1.41, 0, -2, 0, 0,
    -2, 0, 0, -1.41, -1.41, 0,
    -1.41, -1.41, 0, 0, -2, 0,
    0, -2, 0, 1.41, -1.41, 0,
    1.41, -1.41, 0, 2, 0, 0,
    
    // Inner star pattern (bindu region)
    0, 0.8, 0, 0.7, -0.4, 0,
    0.7, -0.4, 0, -0.7, -0.4, 0,
    -0.7, -0.4, 0, 0, 0.8, 0,
    0, -0.8, 0, 0.7, 0.4, 0,
    0.7, 0.4, 0, -0.7, 0.4, 0,
    -0.7, 0.4, 0, 0, -0.8, 0,
    
    // Additional interlocking triangles
    0, 1.2, 0, -1.04, -0.6, 0,
    -1.04, -0.6, 0, 1.04, -0.6, 0,
    1.04, -0.6, 0, 0, 1.2, 0,
    0, -1.2, 0, -1.04, 0.6, 0,
    -1.04, 0.6, 0, 1.04, 0.6, 0,
    1.04, 0.6, 0, 0, -1.2, 0,
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

// Lotus petals component
function LotusPetals({ scrollProgress }: { scrollProgress: number }) {
  const outerRef = useRef<THREE.LineSegments>(null);
  const innerRef = useRef<THREE.LineSegments>(null);
  
  useFrame(() => {
    if (outerRef.current) {
      (outerRef.current.material as THREE.LineBasicMaterial).opacity = scrollProgress * 0.3;
    }
    if (innerRef.current) {
      (innerRef.current.material as THREE.LineBasicMaterial).opacity = scrollProgress * 0.4;
    }
  });

  if (!CONFIG.showLotus) return null;

  // Generate outer lotus petals (16 petals)
  const outerPetalPositions: number[] = [];
  for (let i = 0; i < CONFIG.outerPetals; i++) {
    const angle = (i / CONFIG.outerPetals) * Math.PI * 2;
    const nextAngle = ((i + 1) / CONFIG.outerPetals) * Math.PI * 2;
    const radius = 2.5;
    const petalLength = 0.4;
    
    // Petal shape (ellipse approximation)
    const cx = Math.cos(angle) * radius;
    const cy = Math.sin(angle) * radius;
    const tipX = Math.cos(angle) * (radius + petalLength);
    const tipY = Math.sin(angle) * (radius + petalLength);
    
    outerPetalPositions.push(cx, cy, 0, tipX, tipY, 0);
  }

  // Generate inner lotus petals (8 petals)
  const innerPetalPositions: number[] = [];
  for (let i = 0; i < CONFIG.innerPetals; i++) {
    const angle = (i / CONFIG.innerPetals) * Math.PI * 2;
    const radius = 1.8;
    const petalLength = 0.35;
    
    const cx = Math.cos(angle) * radius;
    const cy = Math.sin(angle) * radius;
    const tipX = Math.cos(angle) * (radius + petalLength);
    const tipY = Math.sin(angle) * (radius + petalLength);
    
    innerPetalPositions.push(cx, cy, 0, tipX, tipY, 0);
  }

  return (
    <group>
      {/* Outer lotus (16 petals) */}
      <lineSegments ref={outerRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={outerPetalPositions.length / 3}
            array={new Float32Array(outerPetalPositions)}
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
      
      {/* Inner lotus (8 petals) */}
      <lineSegments ref={innerRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={innerPetalPositions.length / 3}
            array={new Float32Array(innerPetalPositions)}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={CONFIG.particleColor}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}

function CentralOrb({ scrollProgress }: { scrollProgress: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const binduRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current || !CONFIG.showOrb) return;
    const scale = CONFIG.orbMinScale + scrollProgress * (CONFIG.orbMaxScale - CONFIG.orbMinScale);
    meshRef.current.scale.setScalar(scale);
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.4;
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.25;
    
    // Subtle pulsing glow
    if (glowRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.08;
      glowRef.current.scale.setScalar(scale * pulse * 1.8);
    }
    
    // Bindu (central point) - stays still
    if (binduRef.current) {
      binduRef.current.scale.setScalar(scale * 0.3);
    }
  });

  if (!CONFIG.showOrb) return null;

  return (
    <group>
      {/* Outer glow - soft and subtle */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial
          color={CONFIG.glowColor}
          transparent
          opacity={scrollProgress * CONFIG.glowOpacity}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Geometric orb - octahedron wireframe */}
      <mesh ref={meshRef}>
        <octahedronGeometry args={[1, 1]} />
        <meshBasicMaterial
          color={CONFIG.orbColor}
          transparent
          opacity={scrollProgress * CONFIG.orbOpacity}
          wireframe
        />
      </mesh>
      
      {/* Bindu - central point */}
      <mesh ref={binduRef}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color={CONFIG.particleColor}
          transparent
          opacity={scrollProgress * 0.9}
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
      <ambientLight intensity={0.4} />
      <ParticleField scrollProgress={scrollProgress} />
      <ConnectionLines scrollProgress={scrollProgress} />
      <LotusPetals scrollProgress={scrollProgress} />
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