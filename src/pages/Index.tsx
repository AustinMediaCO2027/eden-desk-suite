import { useEffect, useLayoutEffect, useState } from "react";
import { LandingHero } from "@/components/landing/LandingHero";
import { LogoMarquee } from "@/components/landing/LogoMarquee";
import { LandingFeatures } from "@/components/landing/LandingFeatures";
import { LandingHowItWorks } from "@/components/landing/LandingHowItWorks";
import { LandingPricing } from "@/components/landing/LandingPricing";
import { LandingTestimonials } from "@/components/landing/LandingTestimonials";
import { LandingCTA } from "@/components/landing/LandingCTA";
import { LandingFAQ } from "@/components/landing/LandingFAQ";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import edenDarkIcon from "@/assets/eden_dark_icon.png";

const Index = () => {
  const [showSplash, setShowSplash] = useState(() => {
    document.documentElement.classList.add("dark");
    document.documentElement.classList.remove("light");
    return true;
  });

  useLayoutEffect(() => {
    const root = document.documentElement;
    const previousTheme = localStorage.getItem("eden-theme") || "light";
    root.classList.add("dark");
    root.classList.remove("light");
    localStorage.setItem("eden-theme", "dark");
    return () => {
      localStorage.setItem("eden-theme", previousTheme);
      root.classList.remove("light", "dark");
      root.classList.add(previousTheme);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center z-[100]">
        <img
          src={edenDarkIcon}
          alt="Eden Desk"
          className="h-24 w-24 animate-fade-in"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <LandingHero />
      <LogoMarquee />
      <LandingFeatures />
      <LandingHowItWorks />
      <LandingPricing />
      <LandingTestimonials />
      <LandingCTA />
      <LandingFAQ />
      <LandingFooter />
    </div>
  );
};

export default Index;
