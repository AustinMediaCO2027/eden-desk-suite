import { useCallback, useMemo } from "react";
import { useProfile } from "@/hooks/useProfile";

export type PlanName = "free" | "trial" | "standard" | "silver" | "premium" | "yearly";

export interface PlanPermissions {
  invoices: boolean;
  quotes: boolean;
  downloadPdf: boolean;
  emailSending: boolean;
  letterheads: boolean;
  tasks: boolean;
  goals: boolean;
  aiAgent: boolean;
  unlimitedAi: boolean;
  fileManager: boolean;
  maxAiPromptsPerDay: number | null; // null = unlimited
}

const PLAN_PERMISSIONS: Record<PlanName, PlanPermissions> = {
  free: {
    invoices: true,
    quotes: true,
    downloadPdf: true,
    emailSending: true,
    letterheads: false,
    tasks: false,
    goals: false,
    aiAgent: false,
    unlimitedAi: false,
    fileManager: false,
    maxAiPromptsPerDay: 0,
  },
  trial: {
    invoices: true,
    quotes: true,
    downloadPdf: true,
    emailSending: true,
    letterheads: true,
    tasks: true,
    goals: true,
    aiAgent: true,
    unlimitedAi: false,
    fileManager: false,
    maxAiPromptsPerDay: 5,
  },
  standard: {
    invoices: true,
    quotes: true,
    downloadPdf: true,
    emailSending: true,
    letterheads: false,
    tasks: false,
    goals: false,
    aiAgent: false,
    unlimitedAi: false,
    fileManager: false,
    maxAiPromptsPerDay: 0,
  },
  silver: {
    invoices: true,
    quotes: true,
    downloadPdf: true,
    emailSending: true,
    letterheads: true,
    tasks: false,
    goals: false,
    aiAgent: true,
    unlimitedAi: false,
    fileManager: true,
    maxAiPromptsPerDay: 5,
  },
  premium: {
    invoices: true,
    quotes: true,
    downloadPdf: true,
    emailSending: true,
    letterheads: true,
    tasks: true,
    goals: true,
    aiAgent: true,
    unlimitedAi: true,
    fileManager: true,
    maxAiPromptsPerDay: null,
  },
  yearly: {
    invoices: true,
    quotes: true,
    downloadPdf: true,
    emailSending: true,
    letterheads: true,
    tasks: true,
    goals: true,
    aiAgent: true,
    unlimitedAi: true,
    fileManager: true,
    maxAiPromptsPerDay: null,
  },
};

export const useSubscription = () => {
  const { profile, loading } = useProfile();

  const currentPlan = useMemo((): PlanName => {
    const plan = profile?.subscription_plan;
    if (!plan || plan === "free") return "free";
    if (plan === "trial") {
      // Check if trial expired
      if (profile?.trial_ends_at && new Date(profile.trial_ends_at) < new Date()) {
        return "free";
      }
      return "trial";
    }
    if (["standard", "silver", "premium", "yearly"].includes(plan)) {
      return plan as PlanName;
    }
    return "free";
  }, [profile]);

  const permissions = useMemo(() => PLAN_PERMISSIONS[currentPlan], [currentPlan]);

  const isTrialActive = useMemo(() => {
    if (profile?.subscription_plan !== "trial") return false;
    if (!profile?.trial_ends_at) return false;
    return new Date(profile.trial_ends_at) > new Date();
  }, [profile]);

  const trialDaysRemaining = useMemo(() => {
    if (!isTrialActive || !profile?.trial_ends_at) return 0;
    const diff = new Date(profile.trial_ends_at).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [isTrialActive, profile]);

  const isTrialExpired = useMemo(() => {
    if (profile?.subscription_plan !== "trial") return false;
    if (!profile?.trial_ends_at) return false;
    return new Date(profile.trial_ends_at) < new Date();
  }, [profile]);

  const isPaid = useMemo(() => {
    return ["standard", "silver", "premium", "yearly"].includes(currentPlan);
  }, [currentPlan]);

  const canUseFeature = useCallback(
    (feature: keyof PlanPermissions): boolean => {
      return permissions[feature] as boolean;
    },
    [permissions]
  );

  const planDisplayName = useMemo(() => {
    if (currentPlan === "free") return "Free";
    if (currentPlan === "trial") return "Silver Trial";
    return currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1);
  }, [currentPlan]);

  return {
    currentPlan,
    permissions,
    isTrialActive,
    trialDaysRemaining,
    isTrialExpired,
    isPaid,
    canUseFeature,
    planDisplayName,
    loading,
  };
};
