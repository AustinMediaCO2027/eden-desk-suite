import { useEffect } from "react";
import { useShowAds } from "@/components/ads/AdBanner";

/**
 * Adsterra Social Bar script URL (video + image creatives enabled in the
 * Adsterra dashboard for this placement). Replace only this constant if the
 * placement is ever regenerated.
 */
export const SOCIAL_BAR_SRC =
  "https://pl30698953.effectivecpmnetwork.com/95/6a/6e/956a6e997a6b68621bbe84f01a3d220f.js";

const SCRIPT_ID = "adsterra-social-bar";

let injected = false;

/**
 * Loads the Adsterra Social Bar exactly once per browser session for
 * Standard (free) users. Adsterra manages its own placement/positioning —
 * we never wrap it in a container. Failures are swallowed so the app is
 * never affected.
 */
export const SocialBar = () => {
  const showAds = useShowAds();

  useEffect(() => {
    if (!showAds) return;
    if (injected || document.getElementById(SCRIPT_ID)) return;

    try {
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.type = "text/javascript";
      script.async = true;
      script.src = SOCIAL_BAR_SRC;
      script.setAttribute("data-cfasync", "false");
      script.onerror = () => {
        // Ad failure must never surface to the user or block the app.
        injected = false;
        script.remove();
      };
      document.body.appendChild(script);
      injected = true;
    } catch {
      injected = false;
    }
  }, [showAds]);

  return null;
};

export default SocialBar;
