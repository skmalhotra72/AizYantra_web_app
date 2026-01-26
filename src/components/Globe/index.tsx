// src/components/Globe/index.tsx
// Dynamic import wrapper for SSR compatibility

"use client";

import dynamic from "next/dynamic";

// Loading placeholder with subtle animation
const GlobeLoading = () => (
  <div className="w-full h-[500px] md:h-[600px] flex items-center justify-center">
    <div className="relative">
      {/* Outer ring */}
      <div className="w-32 h-32 rounded-full border-2 border-sky/30 animate-spin" 
           style={{ animationDuration: "3s" }} />
      {/* Inner ring */}
      <div className="absolute inset-2 rounded-full border-2 border-teal/20 animate-spin" 
           style={{ animationDuration: "2s", animationDirection: "reverse" }} />
      {/* Center dot */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-4 h-4 rounded-full bg-sky/50 animate-pulse" />
      </div>
    </div>
  </div>
);

// Dynamic import with SSR disabled (Three.js requires browser APIs)
const NetworkGlobe = dynamic(() => import("./NetworkGlobe"), {
  ssr: false,
  loading: () => <GlobeLoading />,
});

export default NetworkGlobe;