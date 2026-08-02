import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { PAYPAL_CLIENT_ID } from "../_shared/paypal.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const clientId = (Deno.env.get("PAYPAL_CLIENT_ID") || PAYPAL_CLIENT_ID).trim();
  const secret = (Deno.env.get("PAYPAL_CLIENT_SECRET") || "").trim();

  const results: Record<string, unknown> = {
    clientIdSource: Deno.env.get("PAYPAL_CLIENT_ID") ? "env" : "hardcoded",
    clientIdPrefix: clientId.slice(0, 6),
    clientIdLength: clientId.length,
    secretPresent: Boolean(secret),
    secretLength: secret.length,
    paypalEnv: Deno.env.get("PAYPAL_ENV") || "(unset)",
  };

  for (const base of ["https://api-m.paypal.com", "https://api-m.sandbox.paypal.com"]) {
    try {
      const res = await fetch(`${base}/v1/oauth2/token`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(`${clientId}:${secret}`)}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
      });
      results[base] = res.status;
    } catch (e) {
      results[base] = `error: ${e instanceof Error ? e.message : "unknown"}`;
    }
  }

  return new Response(JSON.stringify(results), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
