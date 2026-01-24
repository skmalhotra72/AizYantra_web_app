import { HeroYantra } from "@/components/sections/hero-yantra";
import { ToolkitSection } from "@/components/sections/toolkit-section";
import { BlueprintsSection } from "@/components/sections/blueprints-section";
import { ElementsSection } from "@/components/sections/elements-section";
import { FinalCTASection } from "@/components/sections/final-cta-section";

export const metadata = {
  title: "Preview | AIzYantra New Design",
  description: "Preview of the new AIzYantra website design",
};

export default function PreviewPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section - Globe + Expandable Tags */}
      <HeroYantra />
      
      {/* Toolkit Bento Grid Section */}
      <ToolkitSection />
      
      {/* Blueprint Case Studies */}
      <BlueprintsSection />
      
      {/* Circuit Board Tech Stack */}
      <ElementsSection />
      
      {/* Final CTA */}
      <FinalCTASection />
    </main>
  );
}