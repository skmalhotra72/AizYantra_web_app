import { HeroYantra } from "@/components/sections/hero-yantra";
import { ToolkitSection } from "@/components/sections/toolkit-section";
import { BlueprintsSection } from "@/components/sections/blueprints-section";
import { ElementsSection } from "@/components/sections/elements-section";
import { FinalCTASection } from "@/components/sections/final-cta-section";
import POCBanner from "@/components/home/POCBanner";
import AIAssessmentBanner from "@/components/home/AIAssessmentBanner";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section - Globe + Expandable Tags */}
      <HeroYantra />
      
      {/* AI Assessment Banner - NEW! */}
      <AIAssessmentBanner />
      
      {/* Toolkit Bento Grid Section */}
      <ToolkitSection />
      
      {/* Blueprint Case Studies */}
      <BlueprintsSection />
      
      {/* Circuit Board Tech Stack */}
      <ElementsSection />
      
      {/* Final CTA */}
      <FinalCTASection />
      
      {/* POC Program Banner - MOVED HERE! */}
      <POCBanner />
    </main>
  );
}