export const PAYPAL_PLAN_IDS: Record<string, string> = {
  standard: "P-13F072832F235230MNJHK6ZA",
  silver: "P-9RY5236559897803ANJHK74Q",
  premium: "P-2GA9032980464934ENJHK3IQ",
};

export const PAYPAL_PLAN_PRICES: Record<string, number> = {
  standard: 1.99,
  silver: 2.99,
  premium: 5.99,
};

export const PAYPAL_CLIENT_ID =
  "ARtTFcSUiBpZV_-Fj1efemZInfAdfmKrYVebS25S2W0SLmiQwFuqQymwlY_hzBgiJlM2j4Fx1aiiW831";

export const paypalApiBase = () =>
  (Deno.env.get("PAYPAL_ENV") || "live").trim().toLowerCase() === "sandbox"
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com";

export class PayPalAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PayPalAuthError";
  }
}

export const getPayPalAccessToken = async (): Promise<string> => {
  const clientId = (Deno.env.get("PAYPAL_CLIENT_ID") || PAYPAL_CLIENT_ID).trim();
  const secret = (Deno.env.get("PAYPAL_CLIENT_SECRET") || "").trim();

  if (!secret) {
    throw new PayPalAuthError("PayPal credentials are not configured");
  }

  const res = await fetch(`${paypalApiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${clientId}:${secret}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    console.error("PayPal token request failed", { status: res.status });
    throw new PayPalAuthError("PayPal credentials were rejected by PayPal");
  }

  const data = await res.json();
  if (!data?.access_token) throw new PayPalAuthError("PayPal did not return an access token");
  return data.access_token as string;
};

export const addMonths = (date: Date, months: number) => {
  const d = new Date(date.getTime());
  const day = d.getUTCDate();
  d.setUTCMonth(d.getUTCMonth() + months);
  // Handle month-length overflow (e.g. 31 Jan + 1 month)
  if (d.getUTCDate() < day) d.setUTCDate(0);
  return d;
};
