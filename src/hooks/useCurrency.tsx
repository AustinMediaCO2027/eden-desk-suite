import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export interface CurrencyInfo {
  code: string;
  symbol: string;
  flag: string;
}

export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  { code: "ZAR", symbol: "R", flag: "🇿🇦" },
  { code: "USD", symbol: "$", flag: "🇺🇸" },
  { code: "GBP", symbol: "£", flag: "🇬🇧" },
  { code: "EUR", symbol: "€", flag: "🇪🇺" },
  { code: "AUD", symbol: "A$", flag: "🇦🇺" },
  { code: "INR", symbol: "₹", flag: "🇮🇳" },
];

interface CurrencyContextType {
  currency: CurrencyInfo;
  setCurrencyCode: (code: string) => void;
  convert: (zarAmount: number) => string;
  rates: Record<string, number>;
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

const RATES_CACHE_KEY = "eden_currency_rates";
const RATES_CACHE_TTL = 12 * 60 * 60 * 1000; // 12 hours
const CURRENCY_PREF_KEY = "eden_currency_pref";

// Fallback rates (ZAR base) — approximate
const FALLBACK_RATES: Record<string, number> = {
  ZAR: 1,
  USD: 0.054,
  GBP: 0.043,
  EUR: 0.050,
  AUD: 0.085,
  INR: 4.55,
};

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState<CurrencyInfo>(SUPPORTED_CURRENCIES[0]);
  const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES);
  const [loading, setLoading] = useState(false);

  // Load cached rates + preference on mount
  useEffect(() => {
    const savedPref = localStorage.getItem(CURRENCY_PREF_KEY);
    if (savedPref) {
      const found = SUPPORTED_CURRENCIES.find((c) => c.code === savedPref);
      if (found) setCurrency(found);
    } else {
      // Auto-detect via timezone heuristic
      detectCurrency();
    }
    loadRates();
  }, []);

  const detectCurrency = () => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      if (tz.startsWith("America/")) setCurrencyByCode("USD");
      else if (tz.startsWith("Europe/London") || tz.includes("Belfast")) setCurrencyByCode("GBP");
      else if (tz.startsWith("Europe/")) setCurrencyByCode("EUR");
      else if (tz.startsWith("Australia/")) setCurrencyByCode("AUD");
      else if (tz.startsWith("Asia/Kolkata") || tz.startsWith("Asia/Calcutta")) setCurrencyByCode("INR");
      // Default stays ZAR
    } catch {
      // ignore
    }
  };

  const setCurrencyByCode = (code: string) => {
    const found = SUPPORTED_CURRENCIES.find((c) => c.code === code);
    if (found) setCurrency(found);
  };

  const loadRates = async () => {
    // Check cache
    try {
      const cached = localStorage.getItem(RATES_CACHE_KEY);
      if (cached) {
        const { rates: cachedRates, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < RATES_CACHE_TTL) {
          setRates(cachedRates);
          return;
        }
      }
    } catch { /* ignore */ }

    // Fetch fresh rates
    setLoading(true);
    try {
      const res = await fetch("https://api.exchangerate-api.com/v4/latest/ZAR");
      if (res.ok) {
        const data = await res.json();
        const newRates: Record<string, number> = { ZAR: 1 };
        for (const c of SUPPORTED_CURRENCIES) {
          if (c.code !== "ZAR" && data.rates[c.code]) {
            newRates[c.code] = data.rates[c.code];
          }
        }
        setRates(newRates);
        localStorage.setItem(RATES_CACHE_KEY, JSON.stringify({ rates: newRates, timestamp: Date.now() }));
      }
    } catch {
      // fallback rates already set
    } finally {
      setLoading(false);
    }
  };

  const setCurrencyCode = useCallback((code: string) => {
    const found = SUPPORTED_CURRENCIES.find((c) => c.code === code);
    if (found) {
      setCurrency(found);
      localStorage.setItem(CURRENCY_PREF_KEY, code);
    }
  }, []);

  const convert = useCallback(
    (zarAmount: number): string => {
      if (currency.code === "ZAR") return `R${zarAmount.toFixed(2)}`;
      const rate = rates[currency.code] || FALLBACK_RATES[currency.code] || 1;
      const converted = zarAmount * rate;
      return `${currency.symbol}${converted.toFixed(2)}`;
    },
    [currency, rates]
  );

  return (
    <CurrencyContext.Provider value={{ currency, setCurrencyCode, convert, rates, loading }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
};
