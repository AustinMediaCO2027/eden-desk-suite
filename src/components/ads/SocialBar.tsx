import { useEffect, useRef, useState } from "react";
import { useShowAds } from "@/components/ads/AdBanner";
import { X } from "lucide-react";

/**
 * Adsterra Social Bar script URL (video + image creatives enabled in the
 * Adsterra dashboard for this placement). Replace only this constant if the
 * placement is ever regenerated.
 */
export const SOCIAL_BAR_SRC =
  "https://pl30698953.effectivecpmnetwork.com/95/6a/6e/956a6e997a6b68621bbe84f01a3d220f.js";

const SCRIPT_ID = "adsterra-social-bar";
const DISMISS_KEY = "eden-social-bar-dismissed";

let injected = false;

const isDismissed = () => {
  try {
    return localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
};

interface SocialBarProps {
  /** Render for everyone (e.g. the public landing page), not just free users. */
  publicPlacement?: boolean;
}

/**
 * Loads the Adsterra Social Bar exactly once per browser session.
 * Adsterra manages its own placement/positioning — we never wrap it in a
 * container. A small "hide ad" control removes it permanently for that
 * browser. Failures are swallowed so the app is never affected.
 */
export const SocialBar = ({ publicPlacement = false }: SocialBarProps) => {
  const showAds = useShowAds();
  const enabled = publicPlacement || showAds;
  const [dismissed, setDismissed] = useState(isDismissed);
  const addedNodes = useRef<Node[]>([]);

  useEffect(() => {
    if (!enabled || dismissed) return;
    if (injected || document.getElementById(SCRIPT_ID)) return;

    let observer: MutationObserver | undefined;

    try {
      observer = new MutationObserver((mutations) => {
        mutations.forEach((m) => m.addedNodes.forEach((n) => addedNodes.current.push(n)));
      });
      observer.observe(document.body, { childList: true });

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

    return () => observer?.disconnect();
  }, [enabled, dismissed]);

  const hide = () => {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    try {
      document.getElementById(SCRIPT_ID)?.remove();
      addedNodes.current.forEach((n) => {
        if (n instanceof HTMLElement && n.id !== SCRIPT_ID) n.remove();
      });
      addedNodes.current = [];
      injected = false;
    } catch {
      /* ignore */
    }
    setDismissed(true);
  };

  if (!enabled || dismissed) return null;

  return (
    <button
      type="button"
      onClick={hide}
      aria-label="Hide ad"
      className="fixed bottom-2 right-2 z-[2147483647] flex items-center gap-1 rounded-full bg-background/80 backdrop-blur px-3 py-1.5 text-[11px] font-medium text-muted-foreground border border-border shadow-sm hover:text-foreground"
    >
      <X className="h-3 w-3" />
      Hide ad
    </button>
  );
};

export default SocialBar;
