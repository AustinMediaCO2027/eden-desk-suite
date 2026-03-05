import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // PayFast sends ITN as application/x-www-form-urlencoded
    const body = await req.text();
    const params = new URLSearchParams(body);

    const paymentStatus = params.get("payment_status");
    const userId = params.get("custom_str1");
    const planId = params.get("custom_str2");

    console.log("PayFast ITN received:", { paymentStatus, userId, planId });

    if (!userId || !planId) {
      console.error("Missing userId or planId in ITN");
      return new Response("OK", { status: 200 });
    }

    // Only process completed payments
    if (paymentStatus !== "COMPLETE") {
      console.log("Payment not complete, status:", paymentStatus);
      return new Response("OK", { status: 200 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Determine what to update based on planId
    if (planId.startsWith("storage-")) {
      // Storage add-on
      const storageMap: Record<string, number> = {
        "storage-5gb": 5 * 1024 * 1024 * 1024,
        "storage-10gb": 10 * 1024 * 1024 * 1024,
        "storage-30gb": 30 * 1024 * 1024 * 1024,
      };
      const addOnBytes = storageMap[planId] || 0;
      if (addOnBytes > 0) {
        // Get current add_on_storage and stack it
        const { data: profile } = await supabase
          .from("profiles")
          .select("add_on_storage")
          .eq("user_id", userId)
          .single();

        const currentStorage = profile?.add_on_storage || 0;
        const { error } = await supabase
          .from("profiles")
          .update({ add_on_storage: currentStorage + addOnBytes })
          .eq("user_id", userId);

        if (error) {
          console.error("Error updating storage add-on:", error);
        } else {
          console.log(`Storage add-on ${planId} activated for user ${userId}. Total: ${currentStorage + addOnBytes}`);
        }
      }
    } else {
      // Subscription plan update
      if (planId === "trial") {
        // Trial activation via PayFast
        const trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        const { error } = await supabase
          .from("profiles")
          .update({
            subscription_plan: "trial",
            trial_ends_at: trialEnd,
            trial_start_date: new Date().toISOString(),
            trial_end_date: trialEnd,
            trial_used: true,
          })
          .eq("user_id", userId);

        if (error) {
          console.error("Error activating trial:", error);
        } else {
          console.log(`Trial activated for user ${userId}, expires ${trialEnd}`);
        }
      } else {
        const validPlans = ["standard", "silver", "premium", "yearly"];
        if (validPlans.includes(planId)) {
          const { error } = await supabase
            .from("profiles")
            .update({ subscription_plan: planId })
            .eq("user_id", userId);

          if (error) {
            console.error("Error updating subscription:", error);
          } else {
            console.log(`Subscription ${planId} activated for user ${userId}`);
          }
        }
      }
    }

    // Process affiliate commission if applicable
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("referred_by_affiliate_id")
        .eq("user_id", userId)
        .single();

      if (profile?.referred_by_affiliate_id) {
        await supabase.functions.invoke("process-commission", {
          body: {
            affiliateId: profile.referred_by_affiliate_id,
            userId,
            planId,
          },
        });
      }
    } catch (commErr) {
      console.error("Commission processing error (non-fatal):", commErr);
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("ITN processing error:", error);
    return new Response("OK", { status: 200 });
  }
});
