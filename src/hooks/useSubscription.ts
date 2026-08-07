import { useCallback, useMemo } from "react";
import { useProfile } from "@/hooks/useProfile";

export type PlanName = "free" | "standard" | "silver" | "premium" | "yearly";

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
  purchaseOrders: boolean;
  clientStatements: boolean;
  accountingReports: boolean;
  advancedReports: boolean;
  exportExcel: boolean;
  maxAiPromptsPerDay: number | null; // null = unlimited
}


const PLAN_PERMISSIONS: Record<PlanName, PlanPermissions> = {
  free: {
    invoices: true,
    quotes: true,
    downloadPdf: true,
    emailSending: true,
    letterheads: true,
    tasks: false,
    goals: false,
    aiAgent: false,
    unlimitedAi: false,
    fileManager: false,
    purchaseOrders: false,
    clientStatements: false,
    accountingReports: false,
    advancedReports: false,
    exportExcel: false,
    maxAiPromptsPerDay: 0,
  },
  standard: {
    invoices: true,
    quotes: true,
    downloadPdf: true,
    emailSending: true,
    letterheads: true,
    tasks: false,
    goals: false,
    aiAgent: false,
    unlimitedAi: false,
    fileManager: false,
    purchaseOrders: false,
    clientStatements: false,
    accountingReports: false,
    advancedReports: false,
    exportExcel: false,
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
    purchaseOrders: true,
    clientStatements: true,
    accountingReports: true,
    advancedReports: false,
    exportExcel: false,
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
    purchaseOrders: true,
    clientStatements: true,
    accountingReports: true,
    advancedReports: true,
    exportExcel: true,
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
    purchaseOrders: true,
    clientStatements: true,
    accountingReports: true,
    advancedReports: true,
    exportExcel: true,
    maxAiPromptsPerDay: null,
  },
};


export const useSubscription = () => {
  const { profile, loading } = useProfile();

  const currentPlan = useMemo((): PlanName => {
    const plan = profile?.subscription_plan;
    if (!plan || plan === "free") return "free";
    // Legacy trial accounts receive the ad-supported Standard experience.
    if (plan === "trial") return "free";
    if (["standard", "silver", "premium", "yearly"].includes(plan)) {
      return plan as PlanName;
    }
    return "free";
  }, [profile]);

  const permissions = useMemo(() => PLAN_PERMISSIONS[currentPlan], [currentPlan]);

  const isPaid = useMemo(() => {
    return ["silver", "premium", "yearly"].includes(currentPlan);
  }, [currentPlan]);

  const canUseFeature = useCallback(
    (feature: keyof PlanPermissions): boolean => {
      return permissions[feature] as boolean;
    },
    [permissions]
  );

  const planDisplayName = useMemo(() => {
    if (currentPlan === "free" || currentPlan === "standard") return "Standard — Free";
    return currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1);
  }, [currentPlan]);

  return {
    currentPlan,
    permissions,
    isPaid,
    canUseFeature,
    planDisplayName,
    loading,
  };
};
