/**
 * Date range presets + formatting helpers shared by the accounting reports
 * and client statement modules.
 */

export type DateRangePreset =
  | "today"
  | "yesterday"
  | "this_week"
  | "this_month"
  | "last_month"
  | "this_quarter"
  | "this_year"
  | "custom";

export const DATE_RANGE_PRESETS: { value: DateRangePreset; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "this_week", label: "This Week" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "this_quarter", label: "This Quarter" },
  { value: "this_year", label: "This Year" },
  { value: "custom", label: "Custom Range" },
];

export const toISODate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export interface DateRange {
  from: string;
  to: string;
}

export const resolveDateRange = (preset: DateRangePreset, custom?: DateRange): DateRange => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (preset) {
    case "today":
      return { from: toISODate(startOfDay), to: toISODate(startOfDay) };
    case "yesterday": {
      const yesterday = new Date(startOfDay);
      yesterday.setDate(yesterday.getDate() - 1);
      return { from: toISODate(yesterday), to: toISODate(yesterday) };
    }
    case "this_week": {
      const day = startOfDay.getDay();
      const diffToMonday = day === 0 ? 6 : day - 1;
      const monday = new Date(startOfDay);
      monday.setDate(monday.getDate() - diffToMonday);
      return { from: toISODate(monday), to: toISODate(startOfDay) };
    }
    case "this_month": {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { from: toISODate(first), to: toISODate(last) };
    }
    case "last_month": {
      const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const last = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from: toISODate(first), to: toISODate(last) };
    }
    case "this_quarter": {
      const quarter = Math.floor(now.getMonth() / 3);
      const first = new Date(now.getFullYear(), quarter * 3, 1);
      const last = new Date(now.getFullYear(), quarter * 3 + 3, 0);
      return { from: toISODate(first), to: toISODate(last) };
    }
    case "this_year": {
      const first = new Date(now.getFullYear(), 0, 1);
      const last = new Date(now.getFullYear(), 11, 31);
      return { from: toISODate(first), to: toISODate(last) };
    }
    case "custom":
    default:
      return {
        from: custom?.from || toISODate(new Date(now.getFullYear(), now.getMonth(), 1)),
        to: custom?.to || toISODate(startOfDay),
      };
  }
};

export const isWithinRange = (value: string | null | undefined, range: DateRange) => {
  if (!value) return false;
  const day = value.slice(0, 10);
  return day >= range.from && day <= range.to;
};

export const formatMoney = (value: number, symbol = "R") =>
  `${symbol}${Number(value || 0).toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const formatDisplayDate = (value?: string | null) => {
  if (!value) return "—";
  const parsed = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });
};

/** Month key helper (YYYY-MM) used by monthly comparison reports. */
export const monthKey = (value?: string | null) => (value ? value.slice(0, 7) : "");

export const monthLabel = (key: string) => {
  const [year, month] = key.split("-");
  if (!year || !month) return key;
  const parsed = new Date(Number(year), Number(month) - 1, 1);
  return parsed.toLocaleDateString("en-ZA", { month: "short", year: "numeric" });
};
