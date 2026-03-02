import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sanitizeHeaderValue = (value?: string | null) => (value || "").replace(/[\r\n]/g, "").trim();

const extractConfiguredEmail = (value?: string | null) => {
  const sanitized = sanitizeHeaderValue(value);
  if (!sanitized) return null;

  const bracketMatch = sanitized.match(/<\s*([^<>]+)\s*>/);
  const candidate = sanitizeHeaderValue(bracketMatch?.[1] || sanitized).toLowerCase();

  return emailRegex.test(candidate) ? candidate : null;
};

const extractDomain = (email?: string | null) => {
  const value = extractConfiguredEmail(email);
  if (!value) return null;
  return value.split("@")[1] || null;
};

const resolveFromAddress = (requestedFromEmail?: string | null) => {
  const configuredFromEmail = extractConfiguredEmail(Deno.env.get("RESEND_FROM_EMAIL")) || "hello@eden-desk.com";
  const requestedEmail = extractConfiguredEmail(requestedFromEmail);

  // Only allow request-level sender when it matches the configured sender domain.
  // This prevents profile company emails on unrelated domains from breaking delivery.
  if (requestedEmail) {
    const configuredDomain = extractDomain(configuredFromEmail);
    const requestedDomain = extractDomain(requestedEmail);
    if (configuredDomain && requestedDomain && configuredDomain === requestedDomain) {
      return requestedEmail;
    }
  }

  return configuredFromEmail;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth validation
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

    const { to, subject, html, from_email, attachments } = await req.json();

    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, subject, html" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ 
          error: "Email service not configured", 
          message: "Please add your RESEND_API_KEY in project secrets to enable email sending." 
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const resolvedFrom = resolveFromAddress(from_email);
    const baseEmailPayload: Record<string, unknown> = {
      to: [to],
      subject,
      html,
    };

    // Keep reply-to aligned with company email when provided
    const replyToEmail = sanitizeHeaderValue(from_email);
    if (replyToEmail && emailRegex.test(replyToEmail)) {
      baseEmailPayload.reply_to = replyToEmail;
    }

    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      baseEmailPayload.attachments = attachments.map((att: { filename: string; content: string; content_type?: string }) => {
        const mapped: Record<string, string> = {
          filename: att.filename,
          content: att.content,
        };
        if (att.content_type) mapped.type = att.content_type;
        return mapped;
      });
    }

    const sendWithFrom = async (fromValue: string) => {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({ ...baseEmailPayload, from: fromValue }),
      });

      const data = await res.json();
      return { res, data };
    };

    let activeFrom = resolvedFrom;
    let { res, data } = await sendWithFrom(activeFrom);

    const resendMessage =
      data?.message ||
      data?.error?.message ||
      data?.error ||
      "Failed to send email";

    const lowerResendMessage = typeof resendMessage === "string" ? resendMessage.toLowerCase() : "";
    const isUnverifiedDomainError =
      !res.ok &&
      (lowerResendMessage.includes("domain") &&
        (lowerResendMessage.includes("not verified") || lowerResendMessage.includes("verify a domain")));

    if (isUnverifiedDomainError) {
      const recipientEmail = sanitizeHeaderValue(to).toLowerCase();
      const accountOwnerEmail = sanitizeHeaderValue(user.email ?? "").toLowerCase();
      const isSendingToAccountOwner = !!recipientEmail && recipientEmail === accountOwnerEmail;

      // Keep sandbox fallback only for account-owner testing.
      if (isSendingToAccountOwner) {
        activeFrom = "onboarding@resend.dev";
        ({ res, data } = await sendWithFrom(activeFrom));
      } else {
        return new Response(
          JSON.stringify({
            error: "Failed to send email",
            code: "RESEND_DOMAIN_NOT_VERIFIED",
            message: `Your sender domain is not verified yet. Please verify the domain for ${resolvedFrom} before sending to external recipients.`,
            from: activeFrom,
            hint: "Your app is currently sending from the configured sender domain only. Verify that domain's DNS (SPF, DKIM, MX) and keep RESEND_FROM_EMAIL on that same domain.",
            details: data,
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (!res.ok) {
      const finalMessage =
        data?.message ||
        data?.error?.message ||
        data?.error ||
        "Failed to send email";

      const isSandboxRestriction =
        typeof finalMessage === "string" &&
        finalMessage.includes("You can only send testing emails to your own email address");

      const sandboxHint = isSandboxRestriction
        ? "Resend sandbox mode is active for this sender. Verify your sender domain DNS and keep RESEND_FROM_EMAIL as a plain address like hello@eden-desk.com."
        : undefined;

      return new Response(
        JSON.stringify({
          error: "Failed to send email",
          code: isSandboxRestriction ? "RESEND_SANDBOX_RESTRICTION" : "RESEND_SEND_FAILED",
          message: finalMessage,
          from: activeFrom,
          hint: sandboxHint,
          details: data,
        }),
        { status: res.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
