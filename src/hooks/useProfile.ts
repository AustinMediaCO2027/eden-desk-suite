import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Profile {
  id: string;
  user_id: string;
  company_name: string;
  company_email: string;
  company_phone: string;
  company_address: string;
  company_website: string;
  logo_url: string;
  subscription_plan: string;
  trial_ends_at: string;
  ai_prompts_used_today: number;
  ai_prompts_reset_date: string;
  registration_number: string;
  vat_number: string;
  brand_color: string;
  template_style: string;
  bank_name: string;
  bank_account_holder: string;
  bank_account_number: string;
  bank_branch_code: string;
  bank_account_type: string;
  free_generations_used: number;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();
    if (data) setProfile(data as unknown as Profile);
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", user.id);
    if (!error) await fetchProfile();
    return error;
  };

  return { profile, loading, updateProfile, refetch: fetchProfile };
};
