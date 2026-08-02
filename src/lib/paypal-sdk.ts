import { PAYPAL_CLIENT_ID } from "@/config/plans";
import { supabase } from "@/integrations/supabase/client";

let clientIdPromise: Promise<string> | null = null;

/**
 * Resolves the PayPal client ID from the backend so the SDK always uses the
 * same PayPal app the server verifies subscriptions against. Falls back to the
 * bundled client ID if the config endpoint is unreachable.
 */
const resolveClientId = (): Promise<string> => {
  if (clientIdPromise) return clientIdPromise;

  clientIdPromise = (async () => {
    try {
      const { data, error } = await supabase.functions.invoke("paypal-config", { method: "GET" });
      if (error) throw error;
      const id = typeof data?.clientId === "string" ? data.clientId.trim() : "";
      return id || PAYPAL_CLIENT_ID;
    } catch {
      return PAYPAL_CLIENT_ID;
    }
  })();

  return clientIdPromise;
};

const SDK_SCRIPT_ID = "paypal-sdk-script";

let sdkPromise: Promise<any> | null = null;

/**
 * Loads the PayPal JS SDK exactly once for the whole app.
 * Resolves with the global `window.paypal` namespace.
 */
export const loadPayPalSdk = (): Promise<any> => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("PayPal SDK can only load in the browser"));
  }

  if ((window as any).paypal) {
    return Promise.resolve((window as any).paypal);
  }

  if (sdkPromise) return sdkPromise;

  sdkPromise = resolveClientId().then((clientId) => new Promise((resolve, reject) => {
    const existing = document.getElementById(SDK_SCRIPT_ID) as HTMLScriptElement | null;

    const handleLoad = () => {
      if ((window as any).paypal) resolve((window as any).paypal);
      else reject(new Error("PayPal SDK has not loaded"));
    };

    const handleError = () => {
      sdkPromise = null;
      reject(new Error("PayPal SDK has not loaded"));
    };

    if (existing) {
      existing.addEventListener("load", handleLoad);
      existing.addEventListener("error", handleError);
      return;
    }

    const script = document.createElement("script");
    script.id = SDK_SCRIPT_ID;
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&vault=true&intent=subscription`;
    script.setAttribute("data-sdk-integration-source", "button-factory");
    script.async = true;
    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription`;
    document.head.appendChild(script);
  }));

  return sdkPromise;
};
