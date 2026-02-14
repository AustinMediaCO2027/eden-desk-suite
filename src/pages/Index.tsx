import { useEffect } from "react";
import { LandingHero } from "@/components/landing/LandingHero";
import { LogoMarquee } from "@/components/landing/LogoMarquee";
import { LandingFeatures } from "@/components/landing/LandingFeatures";
import { LandingPricing } from "@/components/landing/LandingPricing";
import { LandingFAQ } from "@/components/landing/LandingFAQ";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";

const Index = () => {
  // Force dark mode on landing page
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("dark");
    root.classList.remove("light");
    return () => {
      const stored = localStorage.getItem("eden-theme") || "light";
      root.classList.remove("light", "dark");
      root.classList.add(stored);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <LandingHero />
      <LogoMarquee />
      <LandingFeatures />
      <LandingPricing />
      <LandingFAQ />
      <LandingFooter />
    </div>
  );
};

export default Index;
