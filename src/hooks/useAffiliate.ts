import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Affiliate {
  id: string;
  user_id: string | null;
  affiliate_code: string | null;
  full_name: string;
  email: string;
  country: string | null;
  website: string | null;
  promotion_method: string | null;
  audience_type: string | null;
  status: string;
  payment_method: string | null;
  paypal_email: string | null;
  bank_name: string | null;
  bank_account_holder: string | null;
  bank_account_number: string | null;
  bank_branch_code: string | null;
  bank_country: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  linkedin_url: string | null;
  audience_size: string | null;
  total_earnings: number;
  pending_balance: number;
  paid_earnings: number;
  created_at: string;
}

export const useAffiliate = () => {
  const { user } = useAuth();
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchAffiliate = useCallback(async () => {
    if (!user) {
      setAffiliate(null);
      return;
    }

    const { data } = await supabase
      .from("affiliates" as any)
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    setAffiliate((data as any) ?? null);
  }, [user]);

  const loadAccessState = useCallback(async () => {
    if (!user) {
      setAffiliate(null);
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    setLoading(true);

    const [affiliateResult, adminResult] = await Promise.all([
      supabase
        .from("affiliates" as any)
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("user_roles" as any)
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle(),
    ]);

    setAffiliate((affiliateResult.data as any) ?? null);
    setIsAdmin(!!adminResult.data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadAccessState();
  }, [loadAccessState]);

  const updatePayoutSettings = async (settings: {
    payment_method: string;
    paypal_email?: string;
    bank_name?: string;
    bank_account_holder?: string;
    bank_account_number?: string;
    bank_branch_code?: string;
    bank_country?: string;
  }) => {
    if (!affiliate) return;
    await supabase
      .from("affiliates" as any)
      .update(settings)
      .eq("id", affiliate.id);
    await fetchAffiliate();
  };

  const requestPayout = async (amount: number) => {
    if (!affiliate || amount < 500) return { error: "Minimum payout is R500" };
    if (affiliate.pending_balance < amount) return { error: "Insufficient balance" };
    const { error } = await supabase.from("payouts" as any).insert({
      affiliate_id: affiliate.id,
      amount,
      status: "pending",
    });
    return { error: error?.message || null };
  };

  return { affiliate, loading, isAdmin, fetchAffiliate, updatePayoutSettings, requestPayout };
};
