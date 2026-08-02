import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LandingHero } from "@/components/landing/LandingHero";
import { LogoMarquee } from "@/components/landing/LogoMarquee";
import { LandingPricing } from "@/components/landing/LandingPricing";
import { LandingTestimonials } from "@/components/landing/LandingTestimonials";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { useTheme } from "@/hooks/useTheme";
import edenDarkIcon from "@/assets/eden_dark_icon.png";

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const prevThemeRef = useRef(theme);
  const [showSplash, setShowSplash] = useState(true);

  // Force dark theme on landing page
  useEffect(() => {
    prevThemeRef.current = theme;
    if (theme !== "dark") {
      toggleTheme();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Restore previous theme on unmount
  useEffect(() => {
    return () => {
      if (prevThemeRef.current === "light") {
        const root = document.documentElement;
        root.classList.remove("dark");
        root.classList.add("light");
        localStorage.setItem("eden-theme", "light");
      }
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  // Redirect logged-in users to dashboard (after all hooks)
  if (!authLoading && user) {
    return <Navigate to="/dashboard" replace />;
  }

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
      <LandingPricing />
      <LandingTestimonials />
      <LandingFooter />
    </div>
  );
};

export default Index;
