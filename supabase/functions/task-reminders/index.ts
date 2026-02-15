import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const now = new Date().toISOString();
    let sent = 0;

    // Check tasks with pending reminders
    const { data: tasks } = await supabase
      .from("tasks")
      .select("id, title, due_date, due_time, user_id, reminder_time")
      .eq("reminder_enabled", true)
      .eq("reminder_sent", false)
      .lte("reminder_time", now)
      .neq("status", "completed");

    // Check meetings with pending reminders
    const { data: meetings } = await supabase
      .from("meetings")
      .select("id, title, date, time, user_id, reminder_time, client_name")
      .eq("reminder_enabled", true)
      .eq("reminder_sent", false)
      .lte("reminder_time", now);

    const items = [
      ...(tasks || []).map((t) => ({ ...t, type: "task" as const })),
      ...(meetings || []).map((m) => ({ ...m, type: "meeting" as const })),
    ];

    for (const item of items) {
      // Get user email
      const { data: userData } = await supabase.auth.admin.getUserById(item.user_id);
      const email = userData?.user?.email;
      if (!email) continue;

      const dueInfo = item.type === "task"
        ? `${item.due_date || "No date"}${item.due_time ? " at " + item.due_time.slice(0, 5) : ""}`
        : `${item.date} at ${item.time.slice(0, 5)}`;

      const typeLabel = item.type === "task" ? "Task" : "Meeting";

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Eden Desk <onboarding@resend.dev>",
          to: [email],
          subject: `Reminder: ${item.title} – Eden Desk`,
          html: `
            <div style="font-family: Inter, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px;">
              <h2 style="margin: 0 0 8px;">🔔 ${typeLabel} Reminder</h2>
              <p style="color: #666; margin: 0 0 24px;">You scheduled this item:</p>
              <div style="background: #f5f5f5; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <p style="margin: 0 0 8px; font-weight: 600;">${item.title}</p>
                <p style="margin: 0; color: #666;">Due: ${dueInfo}</p>
                ${item.type === "meeting" && item.client_name ? `<p style="margin: 4px 0 0; color: #666;">Client: ${item.client_name}</p>` : ""}
              </div>
              <p style="color: #999; font-size: 13px;">Open Eden Desk to view or update.</p>
            </div>
          `,
        }),
      });

      if (res.ok) {
        const table = item.type === "task" ? "tasks" : "meetings";
        await supabase.from(table).update({ reminder_sent: true }).eq("id", item.id);
        sent++;
      } else {
        console.error(`Failed to send reminder for ${item.type} ${item.id}:`, await res.text());
      }
    }

    return new Response(JSON.stringify({ success: true, sent, checked: items.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Reminder error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
