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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Resolve current sender
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const rawFromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "";
    const bracketMatch = rawFromEmail.match(/<\s*([^<>]+)\s*>/);
    const candidate = (bracketMatch?.[1] || rawFromEmail).trim().toLowerCase();
    const isValidEmail = emailRegex.test(candidate);

    const resolvedSender = isValidEmail ? candidate : "hello@eden-desk.com";
    const senderSource = isValidEmail ? "RESEND_FROM_EMAIL secret" : "hardcoded fallback";
    const senderDomain = resolvedSender.split("@")[1];

    // Check API key
    const apiKey = Deno.env.get("RESEND_API_KEY") || "";
    const hasApiKey = apiKey.length > 10;

    // Try to verify domain via Resend API
    let domainStatus = "unknown";
    let domainMessage = "Could not check domain status.";
    let lastSendError: string | null = null;

    if (hasApiKey) {
      try {
        const domainsRes = await fetch("https://api.resend.com/domains", {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        if (domainsRes.ok) {
          const domainsData = await domainsRes.json();
          const domains = domainsData.data || domainsData || [];
          const match = domains.find((d: any) => d.name === senderDomain);
          if (match) {
            domainStatus = match.status || "unknown";
            domainMessage = match.status === "verified"
              ? `✅ Domain "${senderDomain}" is verified and ready to send.`
              : `⚠️ Domain "${senderDomain}" status: ${match.status}. You may need to complete DNS verification.`;
          } else {
            domainStatus = "not_found";
            domainMessage = `❌ Domain "${senderDomain}" is not registered in your email service. Add it and verify DNS records.`;
          }
        } else {
          domainMessage = "Could not fetch domains from email service.";
        }
      } catch {
        domainMessage = "Error connecting to email service API.";
      }

      // Try a dry-run send to detect sandbox issues
      try {
        const testRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            from: resolvedSender,
            to: ["diagnostics-test@example.com"],
            subject: "Eden Desk Email Diagnostics Test",
            html: "<p>Test</p>",
          }),
        });
        const testData = await testRes.json();
        if (!testRes.ok) {
          const msg = testData?.message || testData?.error?.message || testData?.error || "Unknown error";
          if (typeof msg === "string" && msg.includes("only send testing emails to your own email")) {
            lastSendError = "Sandbox mode active — emails can only be sent to your account email. Verify your sender domain to send to anyone.";
          } else if (typeof msg === "string" && msg.toLowerCase().includes("not verified")) {
            lastSendError = `Domain "${senderDomain}" is not verified. Complete DNS setup in your email provider.`;
          } else {
            lastSendError = msg;
          }
        }
      } catch {
        lastSendError = "Could not perform test send.";
      }
    } else {
      domainMessage = "❌ No email API key configured. Email sending is disabled.";
    }

    // Check if RESEND_FROM_EMAIL looks like an API key (common misconfiguration)
    const secretMisconfigured = rawFromEmail.startsWith("re_");

    return new Response(JSON.stringify({
      sender: resolvedSender,
      sender_source: senderSource,
      sender_domain: senderDomain,
      api_key_configured: hasApiKey,
      secret_misconfigured: secretMisconfigured,
      secret_misconfigured_hint: secretMisconfigured
        ? "The RESEND_FROM_EMAIL secret contains an API key instead of an email address. Update it to a plain email like hello@eden-desk.com."
        : null,
      domain_status: domainStatus,
      domain_message: domainMessage,
      last_send_error: lastSendError,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
