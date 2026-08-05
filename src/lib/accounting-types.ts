/**
 * Shared types + pure calculation helpers for the accounting modules
 * (Purchase Orders, Expenses, Payments, Credit Notes, Client Statements).
 * These are additive and do not touch existing invoice/quote logic.
 */

export interface PurchaseOrderItem {
  description: string;
  details: string;
  quantity: number;
  rate: number;
  discount: number; // percentage
  taxRate: number; // percentage
  amount: number; // net line amount after discount, excluding tax
}

export const emptyPurchaseOrderItem = (taxRate = 15): PurchaseOrderItem => ({
  description: "",
  details: "",
  quantity: 1,
  rate: 0,
  discount: 0,
  taxRate,
  amount: 0,
});

export const purchaseOrderLineNet = (item: PurchaseOrderItem) => {
  const gross = Number(item.quantity || 0) * Number(item.rate || 0);
  const discount = gross * (Number(item.discount || 0) / 100);
  return gross - discount;
};

export interface PurchaseOrderTotals {
  gross: number;
  discountAmount: number;
  subtotal: number;
  taxAmount: number;
  total: number;
}

export const calculatePurchaseOrderTotals = (items: PurchaseOrderItem[]): PurchaseOrderTotals => {
  let gross = 0;
  let discountAmount = 0;
  let subtotal = 0;
  let taxAmount = 0;

  for (const item of items) {
    const lineGross = Number(item.quantity || 0) * Number(item.rate || 0);
    const lineDiscount = lineGross * (Number(item.discount || 0) / 100);
    const lineNet = lineGross - lineDiscount;
    gross += lineGross;
    discountAmount += lineDiscount;
    subtotal += lineNet;
    taxAmount += lineNet * (Number(item.taxRate || 0) / 100);
  }

  return { gross, discountAmount, subtotal, taxAmount, total: subtotal + taxAmount };
};

export const PURCHASE_ORDER_STATUSES = ["draft", "sent", "received", "completed", "cancelled"] as const;
export type PurchaseOrderStatus = (typeof PURCHASE_ORDER_STATUSES)[number];

export interface PurchaseOrderRecord {
  id: string;
  user_id: string;
  po_number: string;
  supplier_name: string;
  supplier_contact: string | null;
  supplier_email: string | null;
  supplier_phone: string | null;
  supplier_address: string | null;
  supplier_vat_number: string | null;
  issue_date: string;
  expected_delivery_date: string | null;
  currency: string;
  payment_terms: string | null;
  notes: string | null;
  internal_notes: string | null;
  items: PurchaseOrderItem[];
  tax_rate: number;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseRecord {
  id: string;
  user_id: string;
  expense_number: string | null;
  supplier_name: string;
  category: string;
  date: string;
  description: string | null;
  subtotal: number;
  tax_amount: number;
  total: number;
  payment_method: string | null;
  reference: string | null;
  notes: string | null;
  purchase_order_id: string | null;
  created_at: string;
}

export interface PaymentRecord {
  id: string;
  user_id: string;
  client_name: string;
  invoice_id: string | null;
  invoice_number: string | null;
  date: string;
  amount: number;
  method: string | null;
  notes: string | null;
  created_at: string;
}

export interface CreditNoteRecord {
  id: string;
  user_id: string;
  client_name: string;
  credit_number: string | null;
  date: string;
  amount: number;
  reason: string | null;
  created_at: string;
}

export const EXPENSE_CATEGORIES = [
  "General",
  "Stock & Materials",
  "Subcontractors",
  "Rent",
  "Utilities",
  "Salaries & Wages",
  "Marketing",
  "Travel",
  "Software & Subscriptions",
  "Professional Fees",
  "Bank Charges",
  "Equipment",
  "Other",
];

/** Sequential document numbering: PO-000001 */
export const nextSequentialNumber = (prefix: string, existing: string[]) => {
  let highest = 0;
  for (const value of existing) {
    const match = new RegExp(`^${prefix}-(\\d+)$`).exec((value || "").trim());
    if (match) highest = Math.max(highest, Number(match[1]));
  }
  return `${prefix}-${String(highest + 1).padStart(6, "0")}`;
};
