import { useSubscription } from "@/hooks/useSubscription";

export type AdSlot = "728x90" | "300x250" | "320x50" | "160x600" | "160x300";

const AD_KEYS: Record<AdSlot, { key: string; width: number; height: number }> = {
  "728x90": { key: "52a717d25d8fbd392e5d8b4a1ef759f9", width: 728, height: 90 },
  "300x250": { key: "44b97797164d80ec3b81c4fa26000370", width: 300, height: 250 },
  "320x50": { key: "9b696410fd0074d3e691c00609ddfbdb", width: 320, height: 50 },
  "160x600": { key: "1ded4ea0a0bf35c2314f77b21be3793b", width: 160, height: 600 },
  "160x300": { key: "03908fb8273fe82495d01261efc1f00a", width: 160, height: 300 },
};

/** True when the signed-in user is on the free (Standard) plan and should see ads. */
export const useShowAds = () => {
  const { currentPlan } = useSubscription();
  return currentPlan === "free" || currentPlan === "standard";
};

interface AdBannerProps {
  slot: AdSlot;
  className?: string;
}

/**
 * Renders a Highperformanceformat ad unit inside its own iframe document.
 * Each unit needs its own `atOptions` global, so an isolated document is the
 * only reliable way to run several units on one page.
 */
export const AdBanner = ({ slot, className = "" }: AdBannerProps) => {
  const showAds = useShowAds();
  const cfg = AD_KEYS[slot];
  const adDocument = `<!DOCTYPE html><html><head><meta charset="utf-8" />
<style>html,body{margin:0;padding:0;overflow:hidden;background:transparent;}</style>
</head><body>
<script type="text/javascript">
  atOptions = {
    'key' : '${cfg.key}',
    'format' : 'iframe',
    'height' : ${cfg.height},
    'width' : ${cfg.width},
    'params' : {}
  };
<\/script>
<script type="text/javascript" src="https://www.highperformanceformat.com/${cfg.key}/invoke.js"><\/script>
</body></html>`;

  if (!showAds) return null;

  return (
    <div
      className={`overflow-hidden mx-auto ${className}`}
      style={{ width: cfg.width, height: cfg.height, maxWidth: "100%" }}
    >
      <iframe
        title={`ad-${slot}`}
        srcDoc={adDocument}
        width={cfg.width}
        height={cfg.height}
        scrolling="no"
        frameBorder={0}
        style={{ border: 0, display: "block", maxWidth: "100%" }}
      />
    </div>
  );
};

/** Ad column used on Invoice / Quote / Letterhead pages. */
export const DocumentPageAds = () => {
  const showAds = useShowAds();
  if (!showAds) return null;
  return (
    <aside className="w-full lg:w-[320px] shrink-0 space-y-4">
      <AdBanner slot="300x250" />
      <AdBanner slot="160x600" />
    </aside>
  );
};
