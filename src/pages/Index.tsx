import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { WhyItMattersSection } from "@/components/landing/WhyItMattersSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { WhatMakesDifferentSection } from "@/components/landing/WhatMakesDifferentSection";
import { ConfidenceSystemSection } from "@/components/landing/ConfidenceSystemSection";
import { ScholarlyAlignmentSection } from "@/components/landing/ScholarlyAlignmentSection";
import { FounderStorySection } from "@/components/landing/FounderStorySection";
import { CTASection } from "@/components/landing/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        <HeroSection />
        <WhyItMattersSection />
        <HowItWorksSection />
        <WhatMakesDifferentSection />
        <ConfidenceSystemSection />
        <ScholarlyAlignmentSection />
        <FounderStorySection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
