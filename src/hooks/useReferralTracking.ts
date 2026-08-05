import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const REF_KEY = "eden_ref";
const REF_TS_KEY = "eden_ref_ts";
const TTL_MS = 60 * 24 * 60 * 60 * 1000; // 60 days

export const useReferralTracking = () => {
  const { user } = useAuth();

  // On mount: capture ?ref= param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      localStorage.setItem(REF_KEY, ref);
      localStorage.setItem(REF_TS_KEY, Date.now().toString());

      // Track click (fire and forget)
      supabase.functions.invoke("track-referral-click", {
        body: { affiliate_code: ref, visitor_id: getVisitorId() },
      });

      // Clean URL
      params.delete("ref");
      const newUrl = params.toString()
        ? `${window.location.pathname}?${params}`
        : window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, []);

  // On login: link referral via server-side function (bypasses RLS)
  useEffect(() => {
    if (!user) return;
    const ref = getStoredRef();
    if (!ref) return;

    const linkReferral = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("link-referral", {
          body: { affiliate_code: ref },
        });


        if (error) {
          console.error("Referral link error:", error);
          return;
        }

        const result = data as any;
        if (result?.success || result?.skipped) {
          // Clear storage on success or if already linked
          localStorage.removeItem(REF_KEY);
          localStorage.removeItem(REF_TS_KEY);
        }

        if (result?.success) {
          console.log("Referral linked successfully");
        }
      } catch (err) {
        console.error("Referral link failed:", err);
      }
    };

    linkReferral();
  }, [user]);
};

function getStoredRef(): string | null {
  const ref = localStorage.getItem(REF_KEY);
  const ts = localStorage.getItem(REF_TS_KEY);
  if (!ref || !ts) return null;
  if (Date.now() - parseInt(ts) > TTL_MS) {
    localStorage.removeItem(REF_KEY);
    localStorage.removeItem(REF_TS_KEY);
    return null;
  }
  return ref;
}

function getVisitorId(): string {
  let id = localStorage.getItem("eden_visitor_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("eden_visitor_id", id);
  }
  return id;
}
