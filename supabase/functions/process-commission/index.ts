import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COMMISSION_MAP: Record<string, number> = {
  standard: 10,
  silver: 20,
  premium: 30,
  yearly: 30,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, plan } = await req.json();
    if (!user_id || !plan) {
      return new Response(JSON.stringify({ error: "Missing user_id or plan" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // No commission for trial/free
    if (plan === "trial" || plan === "free") {
      return new Response(JSON.stringify({ skipped: true, reason: "No commission for trial/free" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if user has a referrer
    const { data: profile } = await supabase
      .from("profiles")
      .select("referred_by_affiliate_id")
      .eq("user_id", user_id)
      .single();

    if (!profile?.referred_by_affiliate_id) {
      return new Response(JSON.stringify({ skipped: true, reason: "No referrer" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const affiliateId = profile.referred_by_affiliate_id;

    // Check affiliate is approved and not the same user (self-referral block)
    const { data: affiliate } = await supabase
      .from("affiliates")
      .select("id, user_id, pending_balance, total_earnings")
      .eq("id", affiliateId)
      .eq("status", "approved")
      .single();

    if (!affiliate) {
      return new Response(JSON.stringify({ skipped: true, reason: "Affiliate not approved" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (affiliate.user_id === user_id) {
      return new Response(JSON.stringify({ skipped: true, reason: "Self-referral blocked" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const amount = COMMISSION_MAP[plan] || 10;

    // Find referral record
    const { data: referral } = await supabase
      .from("referrals")
      .select("id")
      .eq("affiliate_id", affiliateId)
      .eq("referred_user_id", user_id)
      .single();

    if (!referral) {
      return new Response(JSON.stringify({ skipped: true, reason: "No referral record" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update referral plan + active status
    await supabase
      .from("referrals")
      .update({ subscription_plan: plan, is_active: true })
      .eq("id", referral.id);

    // Create commission
    await supabase.from("commissions").insert({
      affiliate_id: affiliateId,
      referral_id: referral.id,
      plan,
      amount,
      billing_cycle: plan === "yearly" ? "yearly" : "monthly",
      status: "pending",
    });

    // Update affiliate balances
    await supabase
      .from("affiliates")
      .update({
        pending_balance: (affiliate.pending_balance || 0) + amount,
        total_earnings: (affiliate.total_earnings || 0) + amount,
      })
      .eq("id", affiliateId);

    return new Response(JSON.stringify({ success: true, amount }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
