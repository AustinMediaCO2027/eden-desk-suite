import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuthGate } from "@/components/SignInPromptDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import UpgradeDialog from "@/components/UpgradeDialog";
import ReportPrint from "@/components/print/ReportPrint";
import { createPrintNode, downloadExcelWorkbook, downloadReportPdf } from "@/lib/report-pdf";
import {
  REPORT_DEFINITIONS,
  buildReport,
  reportToSheetRows,
  type ReportDataset,
  type ReportInvoice,
  type ReportKey,
} from "@/lib/reports";
import type { CreditNoteRecord, ExpenseRecord, PaymentRecord, PurchaseOrderRecord } from "@/lib/accounting-types";
import {
  DATE_RANGE_PRESETS,
  formatDisplayDate,
  resolveDateRange,
  toISODate,
  type DateRangePreset,
} from "@/lib/accounting-utils";
import { BarChart3, Crown, Download, FileSpreadsheet } from "lucide-react";

const emptyDataset: ReportDataset = {
  invoices: [],
  expenses: [],
  payments: [],
  creditNotes: [],
  purchaseOrders: [],
};

const ReportsPage = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const { canUseFeature, loading: planLoading } = useSubscription();
  const { requireAuth, gateDialog, isGuest } = useAuthGate("run accounting reports");

  const allowed = canUseFeature("accountingReports");
  const proAllowed = canUseFeature("advancedReports");
  const excelAllowed = canUseFeature("exportExcel");

  const [dataset, setDataset] = useState<ReportDataset>(emptyDataset);
  const [loading, setLoading] = useState(true);
  const [reportKey, setReportKey] = useState<ReportKey>("income");
  const [preset, setPreset] = useState<DateRangePreset>("this_month");
  const [customFrom, setCustomFrom] = useState(toISODate(new Date()));
  const [customTo, setCustomTo] = useState(toISODate(new Date()));
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState("Accounting Reports");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user || !allowed) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const [invoicesRes, expensesRes, paymentsRes, creditsRes, poRes] = await Promise.all([
        supabase
          .from("invoices")
          .select("id, invoice_number, client_name, date, due_date, subtotal, tax_amount, total, status, items")
          .eq("user_id", user.id),
        supabase.from("expenses").select("*").eq("user_id", user.id),
        supabase.from("payments").select("*").eq("user_id", user.id),
        supabase.from("credit_notes").select("*").eq("user_id", user.id),
        supabase.from("purchase_orders").select("*").eq("user_id", user.id),
      ]);

      setDataset({
        invoices: (invoicesRes.data as unknown as ReportInvoice[]) || [],
        expenses: (expensesRes.data as unknown as ExpenseRecord[]) || [],
        payments: (paymentsRes.data as unknown as PaymentRecord[]) || [],
        creditNotes: (creditsRes.data as unknown as CreditNoteRecord[]) || [],
        purchaseOrders: (poRes.data as unknown as PurchaseOrderRecord[]) || [],
      });
      setLoading(false);
    };
    load();
  }, [user, allowed]);

  const range = useMemo(
    () => resolveDateRange(preset, { from: customFrom, to: customTo }),
    [preset, customFrom, customTo]
  );

  const availableReports = useMemo(
    () => REPORT_DEFINITIONS.filter((definition) => definition.tier === "silver" || proAllowed),
    [proAllowed]
  );

  const report = useMemo(() => buildReport(reportKey, dataset, range), [reportKey, dataset, range]);

  const printNode = () =>
    createPrintNode(ReportPrint, {
      profile,
      title: report.title,
      subtitle: `${formatDisplayDate(range.from)} — ${formatDisplayDate(range.to)}`,
      summary: report.summary,
      sections: report.sections,
      generatedBy: profile?.company_name || user?.email || undefined,
    });

  const handlePdf = async () => {
    if (isGuest) {
      requireAuth(() => {});
      return;
    }
    setExporting(true);
    const ok = await downloadReportPdf(printNode(), `${report.title}-${range.from}-${range.to}`, {
      footerLabel: `${profile?.company_name || "Eden Desk"} · ${report.title}`,
    });
    setExporting(false);
    if (!ok) toast({ title: "Download failed", description: "Please try again.", variant: "destructive" });
  };

  const handleExcel = () => {
    if (isGuest) {
      requireAuth(() => {});
      return;
    }
    if (!excelAllowed) {
      setUpgradeFeature("Excel export");
      setShowUpgrade(true);
      return;
    }
    downloadExcelWorkbook(
      [{ name: report.title, rows: reportToSheetRows(report, range) }],
      `${report.title}-${range.from}-${range.to}`
    );
  };

  if (!planLoading && !allowed) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Accounting Reports</h1>
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <BarChart3 className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Accounting Reports are a Silver feature</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Income, expense, profit &amp; loss and outstanding invoice reporting — with branded PDF exports. Premium adds
            balance sheet, cash flow, VAT and Excel exports.
          </p>
          <Button className="mt-5" onClick={() => setShowUpgrade(true)}>
            Upgrade to unlock
          </Button>
        </div>
        <UpgradeDialog open={showUpgrade} onOpenChange={setShowUpgrade} feature="Accounting Reports" requiredPlan="Silver" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {gateDialog}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Accounting Reports</h1>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-card p-5 md:grid-cols-4">
        <div className="space-y-1">
          <Label className="text-xs">Report</Label>
          <Select value={reportKey} onValueChange={(value) => setReportKey(value as ReportKey)}>
            <SelectTrigger className="bg-secondary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableReports.map((definition) => (
                <SelectItem key={definition.key} value={definition.key}>
                  {definition.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Date range</Label>
          <Select value={preset} onValueChange={(value) => setPreset(value as DateRangePreset)}>
            <SelectTrigger className="bg-secondary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_RANGE_PRESETS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">From</Label>
          <Input
            type="date"
            className="bg-secondary"
            value={preset === "custom" ? customFrom : range.from}
            disabled={preset !== "custom"}
            onChange={(e) => setCustomFrom(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">To</Label>
          <Input
            type="date"
            className="bg-secondary"
            value={preset === "custom" ? customTo : range.to}
            disabled={preset !== "custom"}
            onChange={(e) => setCustomTo(e.target.value)}
          />
        </div>
      </div>

      {!proAllowed && (
        <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
          <Crown className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <div className="text-sm">
            <p className="font-medium">Unlock 8 more reports with Premium</p>
            <p className="text-xs text-muted-foreground">
              Balance sheet, cash flow, VAT summary, sales by client and product, purchase orders, expense categories,
              monthly comparison, plus Excel export.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="ml-auto"
            onClick={() => {
              setUpgradeFeature("Advanced reports");
              setShowUpgrade(true);
            }}
          >
            Upgrade
          </Button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button onClick={handlePdf} disabled={exporting}>
          <Download className="mr-1 h-4 w-4" /> {exporting ? "Preparing..." : "Export PDF"}
        </Button>
        <Button variant="outline" onClick={handleExcel}>
          <FileSpreadsheet className="mr-1 h-4 w-4" /> Export Excel
          {!excelAllowed && <Crown className="ml-1.5 h-3.5 w-3.5 text-amber-500" />}
        </Button>
      </div>

      {loading ? (
        <p className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">Loading report data...</p>
      ) : (
        <div className="space-y-5">
          {report.summary.length > 0 && (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {report.summary.map((card) => (
                <div key={card.label} className="rounded-xl border border-border bg-card p-4">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{card.label}</p>
                  <p className="mt-1 text-lg font-bold tabular-nums">{card.value}</p>
                </div>
              ))}
            </div>
          )}

          {report.sections.map((section, sectionIndex) => (
            <div key={section.heading || `section-${sectionIndex}`} className="rounded-xl border border-border bg-card">
              {section.heading && (
                <p className="border-b border-border px-4 py-3 text-sm font-semibold">{section.heading}</p>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                      {section.columns.map((column) => (
                        <th
                          key={column.key}
                          className={`p-3 ${column.align === "right" ? "text-right" : "text-left"}`}
                        >
                          {column.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.rows.map((row, rowIndex) => (
                      <tr key={`row-${rowIndex}`} className="border-b border-border/60 last:border-0">
                        {section.columns.map((column) => (
                          <td
                            key={column.key}
                            className={`p-3 ${column.align === "right" ? "text-right tabular-nums" : "text-left"}`}
                          >
                            {row[column.key] ?? "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {section.rows.length === 0 && (
                      <tr>
                        <td className="p-6 text-center text-muted-foreground" colSpan={section.columns.length}>
                          No data for this period.
                        </td>
                      </tr>
                    )}
                    {section.totals && (
                      <tr className="bg-muted/60">
                        {section.columns.map((column) => (
                          <td
                            key={column.key}
                            className={`p-3 font-semibold ${column.align === "right" ? "text-right tabular-nums" : "text-left"}`}
                          >
                            {section.totals?.[column.key] ?? ""}
                          </td>
                        ))}
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      <UpgradeDialog open={showUpgrade} onOpenChange={setShowUpgrade} feature={upgradeFeature} requiredPlan="Premium" />
    </div>
  );
};

export default ReportsPage;
