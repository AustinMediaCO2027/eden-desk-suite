import { PAYPAL_CLIENT_ID } from "@/config/plans";

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

  sdkPromise = new Promise((resolve, reject) => {
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
    document.head.appendChild(script);
  });

  return sdkPromise;
};
