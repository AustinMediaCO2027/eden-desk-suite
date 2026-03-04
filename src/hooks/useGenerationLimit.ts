import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

export type FeatureType = "invoice" | "quote" | "letterhead" | "general";

const FREE_LIMITS: Record<FeatureType, number> = {
  invoice: 1,
  quote: 1,
  letterhead: 1,
  general: 1, // fallback for old behavior
};

export const useGenerationLimit = (featureType: FeatureType = "general") => {
  const { user } = useAuth();
  const { profile, refetch } = useProfile();
  const [showPaywall, setShowPaywall] = useState(false);

  const getUsedCount = useCallback((type: FeatureType): number => {
    if (!profile) return 0;
    const p = profile as any;
    switch (type) {
      case "invoice": return p.free_invoices_used || 0;
      case "quote": return p.free_quotes_used || 0;
      case "letterhead": return p.free_letterheads_used || 0;
      default: return p.free_generations_used || 0;
    }
  }, [profile]);

  const canGenerate = useCallback(() => {
    if (!profile) return false;
    const plan = profile.subscription_plan;
    // Paid users can always generate
    if (plan && !["trial", "free"].includes(plan)) return true;
    // Active trial users can generate
    if (plan === "trial" && profile.trial_ends_at) {
      if (new Date(profile.trial_ends_at) > new Date()) return true;
    }
    // Free/expired trial: check per-feature limit
    return getUsedCount(featureType) < FREE_LIMITS[featureType];
  }, [profile, featureType, getUsedCount]);

  const recordGeneration = useCallback(async () => {
    if (!user || !profile) return;
    const plan = profile.subscription_plan;
    // Only count for free/expired trial users
    if (plan && !["trial", "free"].includes(plan)) return;
    if (plan === "trial" && profile.trial_ends_at && new Date(profile.trial_ends_at) > new Date()) return;

    const updateField: Record<FeatureType, string> = {
      invoice: "free_invoices_used",
      quote: "free_quotes_used",
      letterhead: "free_letterheads_used",
      general: "free_generations_used",
    };

    await supabase
      .from("profiles")
      .update({ [updateField[featureType]]: getUsedCount(featureType) + 1 } as any)
      .eq("user_id", user.id);
    refetch?.();
  }, [user, profile, refetch, featureType, getUsedCount]);

  const checkAndProceed = useCallback(async (onAllowed: () => Promise<void> | void) => {
    if (canGenerate()) {
      await onAllowed();
      await recordGeneration();
    } else {
      setShowPaywall(true);
    }
  }, [canGenerate, recordGeneration]);

  return { canGenerate: canGenerate(), showPaywall, setShowPaywall, checkAndProceed, recordGeneration };
};
