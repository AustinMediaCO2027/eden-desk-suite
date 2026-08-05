import type { CreditNoteRecord, PaymentRecord } from "@/lib/accounting-types";
import type { DateRange } from "@/lib/accounting-utils";

export interface StatementInvoice {
  id: string;
  invoice_number: string;
  client_name: string;
  date: string | null;
  due_date: string | null;
  total: number | null;
  status: string | null;
}

export interface StatementLine {
  date: string;
  type: "Invoice" | "Payment" | "Credit Note";
  reference: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface StatementResult {
  openingBalance: number;
  lines: StatementLine[];
  totalInvoiced: number;
  totalPaid: number;
  totalCredited: number;
  closingBalance: number;
}

interface StatementSource {
  invoices: StatementInvoice[];
  payments: PaymentRecord[];
  creditNotes: CreditNoteRecord[];
}

const day = (value?: string | null) => (value ? value.slice(0, 10) : "");

/**
 * Builds a running-balance client statement.
 * Opening balance = every invoice raised before the period, less every payment
 * and credit note captured before the period.
 */
export const buildClientStatement = (
  source: StatementSource,
  clientName: string,
  range: DateRange
): StatementResult => {
  const name = clientName.trim().toLowerCase();
  const matchesClient = (value?: string | null) => (value || "").trim().toLowerCase() === name;

  let openingBalance = 0;

  for (const invoice of source.invoices) {
    if (!matchesClient(invoice.client_name)) continue;
    const date = day(invoice.date);
    if (date && date < range.from) openingBalance += Number(invoice.total || 0);
  }
  for (const payment of source.payments) {
    if (!matchesClient(payment.client_name)) continue;
    if (day(payment.date) < range.from) openingBalance -= Number(payment.amount || 0);
  }
  for (const credit of source.creditNotes) {
    if (!matchesClient(credit.client_name)) continue;
    if (day(credit.date) < range.from) openingBalance -= Number(credit.amount || 0);
  }

  const entries: Omit<StatementLine, "balance">[] = [];

  for (const invoice of source.invoices) {
    if (!matchesClient(invoice.client_name)) continue;
    const date = day(invoice.date);
    if (!date || date < range.from || date > range.to) continue;
    entries.push({
      date,
      type: "Invoice",
      reference: invoice.invoice_number,
      description: `Invoice ${invoice.invoice_number}`,
      debit: Number(invoice.total || 0),
      credit: 0,
    });
  }

  for (const payment of source.payments) {
    if (!matchesClient(payment.client_name)) continue;
    const date = day(payment.date);
    if (!date || date < range.from || date > range.to) continue;
    entries.push({
      date,
      type: "Payment",
      reference: payment.invoice_number || payment.method || "Payment",
      description: payment.notes || `Payment received${payment.method ? ` (${payment.method})` : ""}`,
      debit: 0,
      credit: Number(payment.amount || 0),
    });
  }

  for (const credit of source.creditNotes) {
    if (!matchesClient(credit.client_name)) continue;
    const date = day(credit.date);
    if (!date || date < range.from || date > range.to) continue;
    entries.push({
      date,
      type: "Credit Note",
      reference: credit.credit_number || "Credit",
      description: credit.reason || "Credit note",
      debit: 0,
      credit: Number(credit.amount || 0),
    });
  }

  entries.sort((a, b) => (a.date === b.date ? a.type.localeCompare(b.type) : a.date.localeCompare(b.date)));

  let balance = openingBalance;
  let totalInvoiced = 0;
  let totalPaid = 0;
  let totalCredited = 0;

  const lines: StatementLine[] = entries.map((entry) => {
    balance += entry.debit - entry.credit;
    if (entry.type === "Invoice") totalInvoiced += entry.debit;
    if (entry.type === "Payment") totalPaid += entry.credit;
    if (entry.type === "Credit Note") totalCredited += entry.credit;
    return { ...entry, balance };
  });

  return {
    openingBalance,
    lines,
    totalInvoiced,
    totalPaid,
    totalCredited,
    closingBalance: balance,
  };
};
