import { useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LandingHero } from "@/components/landing/LandingHero";

import { LandingPricing } from "@/components/landing/LandingPricing";
import { LandingTestimonials } from "@/components/landing/LandingTestimonials";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { AdBanner } from "@/components/ads/AdBanner";
import { SocialBar } from "@/components/ads/SocialBar";
import { useTheme } from "@/hooks/useTheme";

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const prevThemeRef = useRef(theme);

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

  // Redirect logged-in users to dashboard (after all hooks)
  if (!authLoading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <SocialBar publicPlacement />

      <LandingHero />
      <LandingPricing />
      <aside aria-label="Advertisement" className="bg-background py-6">
        <AdBanner slot="300x250" publicPlacement />
      </aside>
      <LandingTestimonials />
      <LandingFooter />
    </div>
  );
};

export default Index;
