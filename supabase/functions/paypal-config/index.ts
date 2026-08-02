import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { PAYPAL_CLIENT_ID, PAYPAL_PLAN_IDS } from "../_shared/paypal.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Public config endpoint: exposes the PayPal *client ID* (a public value) and
 * plan IDs so the frontend SDK always uses the same PayPal app the backend
 * verifies against. No secrets are returned.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const clientId = (Deno.env.get("PAYPAL_CLIENT_ID") || PAYPAL_CLIENT_ID).trim();
  const env = (Deno.env.get("PAYPAL_ENV") || "live").trim().toLowerCase() === "sandbox"
    ? "sandbox"
    : "live";

  return new Response(JSON.stringify({ clientId, env, planIds: PAYPAL_PLAN_IDS }), {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=300",
    },
  });
});
