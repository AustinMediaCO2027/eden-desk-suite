import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

export type FeatureType = "invoice" | "quote" | "letterhead" | "general";

/** Free plan: 4 documents per day, per document type. */
export const FREE_DAILY_LIMIT = 4;

const TABLES: Record<FeatureType, "invoices" | "quotes" | "letterheads" | null> = {
  invoice: "invoices",
  quote: "quotes",
  letterhead: "letterheads",
  general: null,
};

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

export const useGenerationLimit = (featureType: FeatureType = "general") => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [showPaywall, setShowPaywall] = useState(false);
  const [usedToday, setUsedToday] = useState(0);

  const isPaidUser = useCallback(() => {
    const plan = profile?.subscription_plan;
    return !!plan && !["trial", "free", "standard"].includes(plan);
  }, [profile]);

  const fetchUsage = useCallback(async () => {
    const table = TABLES[featureType];
    if (!user || !table || isPaidUser()) {
      setUsedToday(0);
      return 0;
    }
    const { count } = await supabase
      .from(table)
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", startOfToday());
    const value = count ?? 0;
    setUsedToday(value);
    return value;
  }, [user, featureType, isPaidUser]);

  useEffect(() => {
    void fetchUsage();
  }, [fetchUsage]);

  const canGenerate = isPaidUser() || !TABLES[featureType] ? true : usedToday < FREE_DAILY_LIMIT;

  const recordGeneration = useCallback(async () => {
    await fetchUsage();
  }, [fetchUsage]);

  const checkAndProceed = useCallback(
    async (onAllowed: () => Promise<void> | void) => {
      if (isPaidUser() || !TABLES[featureType]) {
        await onAllowed();
        return;
      }
      // Always re-check against live data so the limit can't be bypassed by stale state.
      const current = await fetchUsage();
      if (current < FREE_DAILY_LIMIT) {
        await onAllowed();
        await fetchUsage();
      } else {
        setShowPaywall(true);
      }
    },
    [isPaidUser, featureType, fetchUsage]
  );

  return {
    canGenerate,
    usedToday,
    remainingToday: Math.max(0, FREE_DAILY_LIMIT - usedToday),
    dailyLimit: FREE_DAILY_LIMIT,
    showPaywall,
    setShowPaywall,
    checkAndProceed,
    recordGeneration,
  };
};
