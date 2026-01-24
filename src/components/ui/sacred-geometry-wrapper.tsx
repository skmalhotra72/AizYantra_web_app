"use client";

import dynamic from "next/dynamic";

// Dynamically import Sacred Geometry to avoid SSR issues with Three.js
const SacredGeometryBackground = dynamic(
  () => import("@/components/ui/sacred-geometry-background"),
  { ssr: false }
);

export function SacredGeometryWrapper() {
  return <SacredGeometryBackground />;
}

export default SacredGeometryWrapper;