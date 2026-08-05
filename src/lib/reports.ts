import type { ReportSection } from "@/components/print/ReportPrint";
import type { CreditNoteRecord, ExpenseRecord, PaymentRecord, PurchaseOrderRecord } from "@/lib/accounting-types";
import { formatDisplayDate, formatMoney, type DateRange } from "@/lib/accounting-utils";

export interface ReportInvoice {
  id: string;
  invoice_number: string;
  client_name: string;
  date: string | null;
  due_date: string | null;
  subtotal: number | null;
  tax_amount: number | null;
  total: number | null;
  status: string | null;
  items: unknown;
}

export interface ReportDataset {
  invoices: ReportInvoice[];
  expenses: ExpenseRecord[];
  payments: PaymentRecord[];
  creditNotes: CreditNoteRecord[];
  purchaseOrders: PurchaseOrderRecord[];
}

export type ReportKey =
  | "income"
  | "expenses"
  | "profit_loss"
  | "outstanding_invoices"
  | "client_statements"
  | "balance_sheet"
  | "cash_flow"
  | "vat_summary"
  | "sales_by_client"
  | "sales_by_item"
  | "purchase_orders"
  | "expense_categories"
  | "monthly_comparison";

export interface ReportDefinition {
  key: ReportKey;
  label: string;
  tier: "silver" | "pro";
  description: string;
}

export const REPORT_DEFINITIONS: ReportDefinition[] = [
  { key: "income", label: "Income Report", tier: "silver", description: "Invoiced revenue for the period" },
  { key: "expenses", label: "Expense Report", tier: "silver", description: "Recorded business expenses" },
  { key: "profit_loss", label: "Profit & Loss Summary", tier: "silver", description: "Income less expenses" },
  { key: "outstanding_invoices", label: "Outstanding Invoices Report", tier: "silver", description: "Unpaid invoice balances" },
  { key: "client_statements", label: "Client Statements Report", tier: "silver", description: "Balance owing per client" },
  { key: "balance_sheet", label: "Balance Sheet", tier: "pro", description: "Assets, liabilities and equity" },
  { key: "cash_flow", label: "Cash Flow Report", tier: "pro", description: "Cash in versus cash out" },
  { key: "vat_summary", label: "VAT Summary", tier: "pro", description: "Output VAT less input VAT" },
  { key: "sales_by_client", label: "Sales by Client", tier: "pro", description: "Revenue split by client" },
  { key: "sales_by_item", label: "Sales by Product / Service", tier: "pro", description: "Revenue split by line item" },
  { key: "purchase_orders", label: "Purchase Order Report", tier: "pro", description: "Purchase orders raised" },
  { key: "expense_categories", label: "Expense Category Report", tier: "pro", description: "Spend grouped by category" },
  { key: "monthly_comparison", label: "Monthly Financial Comparison", tier: "pro", description: "Month-by-month performance" },
];

export interface BuiltReport {
  title: string;
  summary: { label: string; value: string; emphasis?: boolean }[];
  sections: ReportSection[];
}

const day = (value?: string | null) => (value ? value.slice(0, 10) : "");
const inRange = (value: string | null | undefined, range: DateRange) => {
  const date = day(value);
  return !!date && date >= range.from && date <= range.to;
};
const monthKey = (value?: string | null) => day(value).slice(0, 7);
const money = (value: number) => formatMoney(value);
const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

const groupTotals = <T,>(rows: T[], keyOf: (row: T) => string, valueOf: (row: T) => number) => {
  const map = new Map<string, { total: number; count: number }>();
  for (const row of rows) {
    const key = keyOf(row) || "Unspecified";
    const entry = map.get(key) || { total: 0, count: 0 };
    entry.total += valueOf(row);
    entry.count += 1;
    map.set(key, entry);
  }
  return Array.from(map.entries())
    .map(([key, value]) => ({ key, ...value }))
    .sort((a, b) => b.total - a.total);
};

interface InvoiceLine {
  description?: string;
  amount?: number;
}

const invoiceLines = (invoice: ReportInvoice): InvoiceLine[] =>
  Array.isArray(invoice.items) ? (invoice.items as InvoiceLine[]) : [];

export const buildReport = (key: ReportKey, data: ReportDataset, range: DateRange): BuiltReport => {
  const invoices = data.invoices.filter((invoice) => inRange(invoice.date, range));
  const expenses = data.expenses.filter((expense) => inRange(expense.date, range));
  const payments = data.payments.filter((payment) => inRange(payment.date, range));
  const creditNotes = data.creditNotes.filter((credit) => inRange(credit.date, range));
  const purchaseOrders = data.purchaseOrders.filter((order) => inRange(order.issue_date, range));

  const totalIncome = sum(invoices.map((invoice) => Number(invoice.total || 0)));
  const totalIncomeExVat = sum(invoices.map((invoice) => Number(invoice.subtotal ?? invoice.total ?? 0)));
  const totalExpenses = sum(expenses.map((expense) => Number(expense.total || 0)));
  const totalExpensesExVat = sum(expenses.map((expense) => Number(expense.subtotal ?? expense.total ?? 0)));

  switch (key) {
    case "income":
      return {
        title: "Income Report",
        summary: [
          { label: "Invoices issued", value: String(invoices.length) },
          { label: "Excl. VAT", value: money(totalIncomeExVat) },
          { label: "Total invoiced", value: money(totalIncome), emphasis: true },
        ],
        sections: [
          {
            columns: [
              { key: "date", label: "Date", width: "14%" },
              { key: "number", label: "Invoice", width: "16%" },
              { key: "client", label: "Client", width: "30%" },
              { key: "status", label: "Status", width: "14%" },
              { key: "vat", label: "VAT", align: "right", width: "12%" },
              { key: "total", label: "Total", align: "right", width: "14%" },
            ],
            rows: invoices.map((invoice) => ({
              date: formatDisplayDate(invoice.date),
              number: invoice.invoice_number,
              client: invoice.client_name,
              status: invoice.status || "—",
              vat: money(Number(invoice.tax_amount || 0)),
              total: money(Number(invoice.total || 0)),
            })),
            totals: { date: "Total", total: money(totalIncome) },
          },
        ],
      };

    case "expenses":
      return {
        title: "Expense Report",
        summary: [
          { label: "Expenses recorded", value: String(expenses.length) },
          { label: "Excl. VAT", value: money(totalExpensesExVat) },
          { label: "Total spend", value: money(totalExpenses), emphasis: true },
        ],
        sections: [
          {
            columns: [
              { key: "date", label: "Date", width: "14%" },
              { key: "supplier", label: "Supplier", width: "24%" },
              { key: "category", label: "Category", width: "20%" },
              { key: "reference", label: "Reference", width: "16%" },
              { key: "vat", label: "VAT", align: "right", width: "12%" },
              { key: "total", label: "Total", align: "right", width: "14%" },
            ],
            rows: expenses.map((expense) => ({
              date: formatDisplayDate(expense.date),
              supplier: expense.supplier_name,
              category: expense.category,
              reference: expense.reference || "—",
              vat: money(Number(expense.tax_amount || 0)),
              total: money(Number(expense.total || 0)),
            })),
            totals: { date: "Total", total: money(totalExpenses) },
          },
        ],
      };

    case "profit_loss": {
      const netProfit = totalIncome - totalExpenses;
      const margin = totalIncome ? (netProfit / totalIncome) * 100 : 0;
      return {
        title: "Profit & Loss Summary",
        summary: [
          { label: "Income", value: money(totalIncome) },
          { label: "Expenses", value: money(totalExpenses) },
          { label: "Net profit", value: money(netProfit), emphasis: true },
          { label: "Margin", value: `${margin.toFixed(1)}%` },
        ],
        sections: [
          {
            heading: "Summary",
            columns: [
              { key: "line", label: "Line", width: "60%" },
              { key: "amount", label: "Amount", align: "right", width: "40%" },
            ],
            rows: [
              { line: "Total income (incl. VAT)", amount: money(totalIncome) },
              { line: "Total income (excl. VAT)", amount: money(totalIncomeExVat) },
              { line: "Total expenses (incl. VAT)", amount: money(totalExpenses) },
              { line: "Total expenses (excl. VAT)", amount: money(totalExpensesExVat) },
              { line: "Credit notes issued", amount: money(sum(creditNotes.map((credit) => Number(credit.amount || 0)))) },
            ],
            totals: { line: "Net profit", amount: money(netProfit) },
          },
          {
            heading: "Expenses by category",
            columns: [
              { key: "category", label: "Category", width: "60%" },
              { key: "amount", label: "Amount", align: "right", width: "40%" },
            ],
            rows: groupTotals(expenses, (expense) => expense.category, (expense) => Number(expense.total || 0)).map(
              (row) => ({ category: row.key, amount: money(row.total) })
            ),
            totals: { category: "Total", amount: money(totalExpenses) },
          },
        ],
      };
    }

    case "outstanding_invoices": {
      const paidByNumber = new Map<string, number>();
      for (const payment of data.payments) {
        const reference = (payment.invoice_number || "").trim();
        if (!reference) continue;
        paidByNumber.set(reference, (paidByNumber.get(reference) || 0) + Number(payment.amount || 0));
      }
      const outstanding = data.invoices
        .filter((invoice) => (invoice.status || "").toLowerCase() !== "paid")
        .map((invoice) => {
          const paid = paidByNumber.get(invoice.invoice_number) || 0;
          return { invoice, paid, balance: Number(invoice.total || 0) - paid };
        })
        .filter((row) => row.balance > 0.005)
        .sort((a, b) => day(a.invoice.due_date).localeCompare(day(b.invoice.due_date)));

      const today = new Date().toISOString().slice(0, 10);
      const totalOutstanding = sum(outstanding.map((row) => row.balance));
      const overdue = outstanding.filter((row) => day(row.invoice.due_date) && day(row.invoice.due_date) < today);

      return {
        title: "Outstanding Invoices Report",
        summary: [
          { label: "Open invoices", value: String(outstanding.length) },
          { label: "Overdue", value: money(sum(overdue.map((row) => row.balance))) },
          { label: "Total outstanding", value: money(totalOutstanding), emphasis: true },
        ],
        sections: [
          {
            columns: [
              { key: "number", label: "Invoice", width: "16%" },
              { key: "client", label: "Client", width: "26%" },
              { key: "date", label: "Issued", width: "14%" },
              { key: "due", label: "Due", width: "14%" },
              { key: "paid", label: "Paid", align: "right", width: "15%" },
              { key: "balance", label: "Balance", align: "right", width: "15%" },
            ],
            rows: outstanding.map((row) => ({
              number: row.invoice.invoice_number,
              client: row.invoice.client_name,
              date: formatDisplayDate(row.invoice.date),
              due: formatDisplayDate(row.invoice.due_date),
              paid: money(row.paid),
              balance: money(row.balance),
            })),
            totals: { number: "Total", balance: money(totalOutstanding) },
          },
        ],
      };
    }

    case "client_statements": {
      const names = new Set<string>();
      data.invoices.forEach((invoice) => invoice.client_name && names.add(invoice.client_name));
      data.payments.forEach((payment) => payment.client_name && names.add(payment.client_name));
      const rows = Array.from(names).map((name) => {
        const invoiced = sum(
          data.invoices.filter((invoice) => invoice.client_name === name && inRange(invoice.date, range)).map((invoice) => Number(invoice.total || 0))
        );
        const paid = sum(
          data.payments.filter((payment) => payment.client_name === name && inRange(payment.date, range)).map((payment) => Number(payment.amount || 0))
        );
        const credited = sum(
          data.creditNotes.filter((credit) => credit.client_name === name && inRange(credit.date, range)).map((credit) => Number(credit.amount || 0))
        );
        return { name, invoiced, paid, credited, balance: invoiced - paid - credited };
      });
      rows.sort((a, b) => b.balance - a.balance);

      return {
        title: "Client Statements Report",
        summary: [
          { label: "Clients", value: String(rows.length) },
          { label: "Invoiced", value: money(sum(rows.map((row) => row.invoiced))) },
          { label: "Balance owing", value: money(sum(rows.map((row) => row.balance))), emphasis: true },
        ],
        sections: [
          {
            columns: [
              { key: "client", label: "Client", width: "34%" },
              { key: "invoiced", label: "Invoiced", align: "right", width: "17%" },
              { key: "paid", label: "Payments", align: "right", width: "17%" },
              { key: "credited", label: "Credits", align: "right", width: "16%" },
              { key: "balance", label: "Balance", align: "right", width: "16%" },
            ],
            rows: rows.map((row) => ({
              client: row.name,
              invoiced: money(row.invoiced),
              paid: money(row.paid),
              credited: money(row.credited),
              balance: money(row.balance),
            })),
            totals: { client: "Total", balance: money(sum(rows.map((row) => row.balance))) },
          },
        ],
      };
    }

    case "balance_sheet": {
      const allInvoiced = sum(
        data.invoices.filter((invoice) => day(invoice.date) <= range.to).map((invoice) => Number(invoice.total || 0))
      );
      const allPaid = sum(
        data.payments.filter((payment) => day(payment.date) <= range.to).map((payment) => Number(payment.amount || 0))
      );
      const allCredited = sum(
        data.creditNotes.filter((credit) => day(credit.date) <= range.to).map((credit) => Number(credit.amount || 0))
      );
      const allExpenses = sum(
        data.expenses.filter((expense) => day(expense.date) <= range.to).map((expense) => Number(expense.total || 0))
      );
      const receivables = allInvoiced - allPaid - allCredited;
      const cash = allPaid - allExpenses;
      const openPurchaseOrders = sum(
        data.purchaseOrders
          .filter((order) => day(order.issue_date) <= range.to && !["completed", "cancelled"].includes(order.status))
          .map((order) => Number(order.total || 0))
        );
      const assets = receivables + cash;
      const equity = assets - openPurchaseOrders;

      return {
        title: "Balance Sheet",
        summary: [
          { label: "Total assets", value: money(assets) },
          { label: "Total liabilities", value: money(openPurchaseOrders) },
          { label: "Net equity", value: money(equity), emphasis: true },
        ],
        sections: [
          {
            heading: "Assets",
            columns: [
              { key: "line", label: "Line", width: "60%" },
              { key: "amount", label: "Amount", align: "right", width: "40%" },
            ],
            rows: [
              { line: "Cash from collections (payments less expenses)", amount: money(cash) },
              { line: "Accounts receivable (unpaid invoices)", amount: money(receivables) },
            ],
            totals: { line: "Total assets", amount: money(assets) },
          },
          {
            heading: "Liabilities",
            columns: [
              { key: "line", label: "Line", width: "60%" },
              { key: "amount", label: "Amount", align: "right", width: "40%" },
            ],
            rows: [{ line: "Open purchase order commitments", amount: money(openPurchaseOrders) }],
            totals: { line: "Total liabilities", amount: money(openPurchaseOrders) },
          },
          {
            heading: "Equity",
            columns: [
              { key: "line", label: "Line", width: "60%" },
              { key: "amount", label: "Amount", align: "right", width: "40%" },
            ],
            rows: [{ line: "Owner's equity (assets less liabilities)", amount: money(equity) }],
          },
        ],
      };
    }

    case "cash_flow": {
      const months = new Set<string>();
      payments.forEach((payment) => months.add(monthKey(payment.date)));
      expenses.forEach((expense) => months.add(monthKey(expense.date)));
      const rows = Array.from(months)
        .filter(Boolean)
        .sort()
        .map((month) => {
          const cashIn = sum(payments.filter((payment) => monthKey(payment.date) === month).map((p) => Number(p.amount || 0)));
          const cashOut = sum(expenses.filter((expense) => monthKey(expense.date) === month).map((e) => Number(e.total || 0)));
          return { month, cashIn, cashOut, net: cashIn - cashOut };
        });
      const totalIn = sum(rows.map((row) => row.cashIn));
      const totalOut = sum(rows.map((row) => row.cashOut));

      return {
        title: "Cash Flow Report",
        summary: [
          { label: "Cash in", value: money(totalIn) },
          { label: "Cash out", value: money(totalOut) },
          { label: "Net cash flow", value: money(totalIn - totalOut), emphasis: true },
        ],
        sections: [
          {
            columns: [
              { key: "month", label: "Month", width: "34%" },
              { key: "cashIn", label: "Cash in", align: "right", width: "22%" },
              { key: "cashOut", label: "Cash out", align: "right", width: "22%" },
              { key: "net", label: "Net", align: "right", width: "22%" },
            ],
            rows: rows.map((row) => ({
              month: row.month,
              cashIn: money(row.cashIn),
              cashOut: money(row.cashOut),
              net: money(row.net),
            })),
            totals: { month: "Total", cashIn: money(totalIn), cashOut: money(totalOut), net: money(totalIn - totalOut) },
          },
        ],
      };
    }

    case "vat_summary": {
      const outputVat = sum(invoices.map((invoice) => Number(invoice.tax_amount || 0)));
      const inputVat = sum(expenses.map((expense) => Number(expense.tax_amount || 0)));
      return {
        title: "VAT Summary",
        summary: [
          { label: "Output VAT (sales)", value: money(outputVat) },
          { label: "Input VAT (purchases)", value: money(inputVat) },
          { label: "Net VAT payable", value: money(outputVat - inputVat), emphasis: true },
        ],
        sections: [
          {
            columns: [
              { key: "line", label: "Line", width: "40%" },
              { key: "exVat", label: "Excl. VAT", align: "right", width: "20%" },
              { key: "vat", label: "VAT", align: "right", width: "20%" },
              { key: "total", label: "Incl. VAT", align: "right", width: "20%" },
            ],
            rows: [
              { line: "Sales (invoices)", exVat: money(totalIncomeExVat), vat: money(outputVat), total: money(totalIncome) },
              { line: "Purchases (expenses)", exVat: money(totalExpensesExVat), vat: money(inputVat), total: money(totalExpenses) },
            ],
            totals: { line: "Net VAT payable", vat: money(outputVat - inputVat) },
          },
        ],
      };
    }

    case "sales_by_client": {
      const rows = groupTotals(invoices, (invoice) => invoice.client_name, (invoice) => Number(invoice.total || 0));
      return {
        title: "Sales by Client",
        summary: [
          { label: "Clients invoiced", value: String(rows.length) },
          { label: "Total sales", value: money(totalIncome), emphasis: true },
        ],
        sections: [
          {
            columns: [
              { key: "client", label: "Client", width: "46%" },
              { key: "count", label: "Invoices", align: "right", width: "18%" },
              { key: "share", label: "Share", align: "right", width: "18%" },
              { key: "total", label: "Total", align: "right", width: "18%" },
            ],
            rows: rows.map((row) => ({
              client: row.key,
              count: row.count,
              share: totalIncome ? `${((row.total / totalIncome) * 100).toFixed(1)}%` : "0.0%",
              total: money(row.total),
            })),
            totals: { client: "Total", total: money(totalIncome) },
          },
        ],
      };
    }

    case "sales_by_item": {
      const lines: { description: string; amount: number }[] = [];
      for (const invoice of invoices) {
        for (const line of invoiceLines(invoice)) {
          lines.push({ description: (line.description || "Unspecified").trim() || "Unspecified", amount: Number(line.amount || 0) });
        }
      }
      const rows = groupTotals(lines, (line) => line.description, (line) => line.amount);
      const linesTotal = sum(rows.map((row) => row.total));
      return {
        title: "Sales by Product / Service",
        summary: [
          { label: "Distinct items", value: String(rows.length) },
          { label: "Line item revenue", value: money(linesTotal), emphasis: true },
        ],
        sections: [
          {
            columns: [
              { key: "item", label: "Product / Service", width: "52%" },
              { key: "count", label: "Times sold", align: "right", width: "24%" },
              { key: "total", label: "Revenue", align: "right", width: "24%" },
            ],
            rows: rows.map((row) => ({ item: row.key, count: row.count, total: money(row.total) })),
            totals: { item: "Total", total: money(linesTotal) },
          },
        ],
      };
    }

    case "purchase_orders": {
      const totalPo = sum(purchaseOrders.map((order) => Number(order.total || 0)));
      return {
        title: "Purchase Order Report",
        summary: [
          { label: "Purchase orders", value: String(purchaseOrders.length) },
          { label: "Total committed", value: money(totalPo), emphasis: true },
        ],
        sections: [
          {
            columns: [
              { key: "number", label: "PO Number", width: "18%" },
              { key: "supplier", label: "Supplier", width: "30%" },
              { key: "date", label: "Issued", width: "16%" },
              { key: "status", label: "Status", width: "18%" },
              { key: "total", label: "Total", align: "right", width: "18%" },
            ],
            rows: purchaseOrders.map((order) => ({
              number: order.po_number,
              supplier: order.supplier_name,
              date: formatDisplayDate(order.issue_date),
              status: order.status,
              total: money(Number(order.total || 0)),
            })),
            totals: { number: "Total", total: money(totalPo) },
          },
        ],
      };
    }

    case "expense_categories": {
      const rows = groupTotals(expenses, (expense) => expense.category, (expense) => Number(expense.total || 0));
      return {
        title: "Expense Category Report",
        summary: [
          { label: "Categories", value: String(rows.length) },
          { label: "Total spend", value: money(totalExpenses), emphasis: true },
        ],
        sections: [
          {
            columns: [
              { key: "category", label: "Category", width: "46%" },
              { key: "count", label: "Entries", align: "right", width: "18%" },
              { key: "share", label: "Share", align: "right", width: "18%" },
              { key: "total", label: "Total", align: "right", width: "18%" },
            ],
            rows: rows.map((row) => ({
              category: row.key,
              count: row.count,
              share: totalExpenses ? `${((row.total / totalExpenses) * 100).toFixed(1)}%` : "0.0%",
              total: money(row.total),
            })),
            totals: { category: "Total", total: money(totalExpenses) },
          },
        ],
      };
    }

    case "monthly_comparison": {
      const months = new Set<string>();
      invoices.forEach((invoice) => months.add(monthKey(invoice.date)));
      expenses.forEach((expense) => months.add(monthKey(expense.date)));
      const rows = Array.from(months)
        .filter(Boolean)
        .sort()
        .map((month) => {
          const income = sum(invoices.filter((invoice) => monthKey(invoice.date) === month).map((i) => Number(i.total || 0)));
          const spend = sum(expenses.filter((expense) => monthKey(expense.date) === month).map((e) => Number(e.total || 0)));
          return { month, income, spend, profit: income - spend };
        });
      return {
        title: "Monthly Financial Comparison",
        summary: [
          { label: "Months", value: String(rows.length) },
          { label: "Income", value: money(totalIncome) },
          { label: "Expenses", value: money(totalExpenses) },
          { label: "Net profit", value: money(totalIncome - totalExpenses), emphasis: true },
        ],
        sections: [
          {
            columns: [
              { key: "month", label: "Month", width: "25%" },
              { key: "income", label: "Income", align: "right", width: "25%" },
              { key: "spend", label: "Expenses", align: "right", width: "25%" },
              { key: "profit", label: "Net profit", align: "right", width: "25%" },
            ],
            rows: rows.map((row) => ({
              month: row.month,
              income: money(row.income),
              spend: money(row.spend),
              profit: money(row.profit),
            })),
            totals: {
              month: "Total",
              income: money(totalIncome),
              spend: money(totalExpenses),
              profit: money(totalIncome - totalExpenses),
            },
          },
        ],
      };
    }

    default:
      return { title: "Report", summary: [], sections: [] };
  }
};

/** Flattens a built report into worksheet rows for Excel export. */
export const reportToSheetRows = (report: BuiltReport, range: DateRange) => {
  const rows: (string | number)[][] = [[report.title], [`Period: ${range.from} to ${range.to}`], []];
  report.summary.forEach((card) => rows.push([card.label, card.value]));
  report.sections.forEach((section) => {
    rows.push([]);
    if (section.heading) rows.push([section.heading]);
    rows.push(section.columns.map((column) => column.label));
    section.rows.forEach((row) => rows.push(section.columns.map((column) => row[column.key] ?? "")));
    if (section.totals) rows.push(section.columns.map((column) => section.totals?.[column.key] ?? ""));
  });
  return rows;
};
