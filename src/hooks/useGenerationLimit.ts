import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

export const useGenerationLimit = () => {
  const { user } = useAuth();
  const { profile, refetch } = useProfile();
  const [showPaywall, setShowPaywall] = useState(false);

  const canGenerate = useCallback(() => {
    if (!profile) return false;
    // Paid users can always generate
    const plan = profile.subscription_plan;
    if (plan && plan !== "trial" && plan !== "free") return true;
    // Trial users within trial period can generate
    if (plan === "trial" && profile.trial_ends_at) {
      if (new Date(profile.trial_ends_at) > new Date()) return true;
    }
    // Free/expired trial: only 1 free generation
    return (profile.free_generations_used || 0) < 1;
  }, [profile]);

  const recordGeneration = useCallback(async () => {
    if (!user || !profile) return;
    const plan = profile.subscription_plan;
    // Only count for free/expired trial users
    if (plan && plan !== "trial" && plan !== "free") return;
    if (plan === "trial" && profile.trial_ends_at && new Date(profile.trial_ends_at) > new Date()) return;
    
    await supabase
      .from("profiles")
      .update({ free_generations_used: (profile.free_generations_used || 0) + 1 })
      .eq("user_id", user.id);
    refetch?.();
  }, [user, profile, refetch]);

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
