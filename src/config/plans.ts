export type PlanKey = "standard" | "silver" | "premium";

export const PAYPAL_CLIENT_ID =
  "ARtTFcSUiBpZV_-Fj1efemZInfAdfmKrYVebS25S2W0SLmiQwFuqQymwlY_hzBgiJlM2j4Fx1aiiW831";

export const PAYPAL_PLAN_IDS: Record<PlanKey, string> = {
  standard: "P-13F072832F235230MNJHK6ZA",
  silver: "P-9RY5236559897803ANJHK74Q",
  premium: "P-2GA9032980464934ENJHK3IQ",
};

export const PAYPAL_PLAN_PRICES: Record<
  PlanKey,
  {
    planName: string;
    productName: string;
    trialPrice: number;
    trialLengthMonths: number;
    trialCycles: number;
    recurringPrice: number;
    currency: string;
    interval: string;
  }
> = {
  standard: {
    planName: "Eden Desk Standard Plan",
    productName: "Eden Desk Standard",
    trialPrice: 0,
    trialLengthMonths: 3,
    trialCycles: 1,
    recurringPrice: 0,
    currency: "USD",
    interval: "month",
  },
  silver: {
    planName: "Eden Desk Silver Plan",
    productName: "Eden Desk Silver Plan",
    trialPrice: 0,
    trialLengthMonths: 3,
    trialCycles: 1,
    recurringPrice: 2.99,
    currency: "USD",
    interval: "month",
  },
  premium: {
    planName: "Eden Desk Premium",
    productName: "Eden Desk Premium",
    trialPrice: 0,
    trialLengthMonths: 3,
    trialCycles: 1,
    recurringPrice: 5.99,
    currency: "USD",
    interval: "month",
  },
};

/** PayFast (South Africa) monthly price in ZAR after the 3-month free trial. */
export const PAYFAST_PLAN_PRICES: Record<PlanKey, number> = {
  standard: 0,
  silver: 49.99,
  premium: 99.99,
};

export const PAYPAL_CONTAINER_IDS: Record<PlanKey, string> = {
  standard: "paypal-button-container-standard",
  silver: "paypal-button-container-silver",
  premium: "paypal-button-container-premium",
};

export interface PlanCard {
  key: PlanKey;
  name: string;
  description: string;
  zarPrice: number;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  /** Completely free plan (ad-supported). */
  free?: boolean;
}

export const PLAN_CARDS: PlanCard[] = [
  {
    key: "standard",
    name: "Standard",
    description: "Perfect for freelancers",
    zarPrice: PAYFAST_PLAN_PRICES.standard,
    free: true,
    features: ["Create invoices", "Create quotes", "Create letterheads", "Download PDF", "Email sending", "Ad-supported"],
  },
  {
    key: "silver",
    name: "Silver",
    description: "For growing businesses",
    zarPrice: PAYFAST_PLAN_PRICES.silver,
    features: [
      "Send Invoice / Quotes",
      "Create & send letterheads",
      "Gemini AI drafting",
      "5 AI prompts per day",
    ],
    highlighted: true,
    badge: "Most Popular",
  },
  {
    key: "premium",
    name: "Premium",
    description: "For power users",
    zarPrice: PAYFAST_PLAN_PRICES.premium,
    features: ["Everything in Silver", "Task manager", "Unlimited AI prompts", "Priority support"],
  },
];

export const PRICING_DISCLAIMER =
  "Billing begins automatically after the 3-month free trial unless the subscription is cancelled before renewal. PayFast uses a R5.00 card verification payment today; PayPal does not charge today.";

export const PAYPAL_CHECKOUT_COPY =
  "You are starting a 3-month free trial. PayPal will collect your payment details now, but you will not be charged today. Billing begins automatically after the 3-month free trial unless you cancel before renewal.";

export const PAYFAST_CHECKOUT_COPY =
  "You are starting a 3-month free trial. PayFast uses a R5.00 card verification payment today. Plan billing begins automatically after the trial unless you cancel before renewal.";

export const isPlanKey = (value: unknown): value is PlanKey =>
  value === "standard" || value === "silver" || value === "premium";

export const isSouthAfrica = (country?: string | null) => {
  if (!country) return false;
  const c = country.trim().toUpperCase();
  return c === "ZA" || c === "SOUTH AFRICA";
};

/** Small, alphabetical country list used by the billing country selector. */
export const BILLING_COUNTRIES: { code: string; name: string }[] = [
  { code: "ZA", name: "South Africa" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "AR", name: "Argentina" },
  { code: "AU", name: "Australia" },
  { code: "AT", name: "Austria" },
  { code: "BE", name: "Belgium" },
  { code: "BR", name: "Brazil" },
  { code: "BW", name: "Botswana" },
  { code: "CA", name: "Canada" },
  { code: "CH", name: "Switzerland" },
  { code: "CN", name: "China" },
  { code: "DE", name: "Germany" },
  { code: "DK", name: "Denmark" },
  { code: "EG", name: "Egypt" },
  { code: "ES", name: "Spain" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "GH", name: "Ghana" },
  { code: "GR", name: "Greece" },
  { code: "IE", name: "Ireland" },
  { code: "IN", name: "India" },
  { code: "IT", name: "Italy" },
  { code: "JP", name: "Japan" },
  { code: "KE", name: "Kenya" },
  { code: "MX", name: "Mexico" },
  { code: "MY", name: "Malaysia" },
  { code: "NA", name: "Namibia" },
  { code: "NG", name: "Nigeria" },
  { code: "NL", name: "Netherlands" },
  { code: "NO", name: "Norway" },
  { code: "NZ", name: "New Zealand" },
  { code: "PH", name: "Philippines" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "SE", name: "Sweden" },
  { code: "SG", name: "Singapore" },
  { code: "TZ", name: "Tanzania" },
  { code: "UG", name: "Uganda" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "ZM", name: "Zambia" },
  { code: "ZW", name: "Zimbabwe" },
];
