import { forwardRef, type CSSProperties } from "react";
import type { Profile } from "@/hooks/useProfile";
import type { LineItem } from "@/lib/document-utils";
import { calculateTotals } from "@/lib/document-utils";
import type { InvoiceTemplateProps } from "./InvoiceTemplate1";

const safeText = (v: string | null | undefined, max: number) => (v || "").trim().slice(0, max);
const fmt = (v: number) => `R${Number(v || 0).toFixed(2)}`;

const PAGE: CSSProperties = {
  width: "210mm", height: "297mm", padding: "14mm 16mm 16mm",
  boxSizing: "border-box", overflow: "hidden", position: "relative",
  backgroundColor: "#f5f5f7", color: "#1a1a1a",
  fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
  pageBreakInside: "avoid",
};

const T: CSSProperties = { width: "100%", borderCollapse: "collapse", tableLayout: "fixed" };
const R: CSSProperties = { textAlign: "right", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" };

const CARD: CSSProperties = {
  backgroundColor: "white", borderRadius: "3mm", padding: "5mm 6mm",
  marginBottom: "3mm",
};

/**
 * Template 6 – Digital Card-Based
 * Based on reference: gray bg, card-based sections, top bar with date + invoice#,
 * two-column To/From card, bold total with due date, items card, bank details card, footer bar.
 */
const InvoiceTemplate6 = forwardRef<HTMLDivElement, InvoiceTemplateProps>(
  ({ profile, documentNumber, date, dueDate, clientName, clientEmail, clientAddress, items, taxRate, notes, colorOverride }, ref) => {
    const accent = colorOverride || profile?.brand_color || "#e11d48";
    const limitedItems = items.slice(0, 9);
    const norm = limitedItems.map(i => ({ ...i, amount: Number(i.amount || Number(i.quantity || 0) * Number(i.rate || 0)) }));
    const { subtotal, taxAmount, total } = calculateTotals(norm, taxRate);

    return (
      <div ref={ref} style={PAGE} data-print-template="invoice" data-template-style="template6">
        {/* Top bar: Date left, Invoice # right */}
        <div style={{ ...CARD, padding: "4mm 6mm", marginBottom: "3mm" }}>
          <table style={T}>
            <tbody>
              <tr>
                <td style={{ width: "50%", verticalAlign: "middle" }}>
                  <p style={{ margin: 0, fontSize: "3mm" }}><span style={{ fontWeight: 700 }}>Date</span> {safeText(date, 30)}</p>
                </td>
                <td style={{ width: "50%", verticalAlign: "middle", textAlign: "right" }}>
                  <p style={{ margin: 0, fontSize: "3mm" }}><span style={{ fontWeight: 700 }}>Invoice</span> #{safeText(documentNumber, 30)}</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* To / From card */}
        <div style={CARD}>
          <table style={T}>
            <tbody>
              <tr>
                <td style={{ width: "50%", verticalAlign: "top", borderRight: "0.3mm solid #f0f0f0", paddingRight: "4mm" }}>
                  <p style={{ margin: 0, fontSize: "2.6mm", color: "#888", fontWeight: 600 }}>To</p>
                  <p style={{ margin: "1.5mm 0 0", fontSize: "3.2mm", fontWeight: 600 }}>{safeText(clientName, 60)}</p>
                  {clientAddress && <p style={{ margin: "0.8mm 0 0", fontSize: "2.8mm", color: "#666", whiteSpace: "pre-wrap" }}>{safeText(clientAddress, 100)}</p>}
                  {clientEmail && <p style={{ margin: "0.5mm 0 0", fontSize: "2.8mm", color: "#666" }}>{safeText(clientEmail, 50)}</p>}
                </td>
                <td style={{ width: "50%", verticalAlign: "top", paddingLeft: "4mm" }}>
                  <p style={{ margin: 0, fontSize: "2.6mm", color: "#888", fontWeight: 600 }}>From</p>
                  <p style={{ margin: "1.5mm 0 0", fontSize: "3.2mm", fontWeight: 600 }}>{safeText(profile?.company_name, 50) || "Your Company"}</p>
                  {profile?.company_address && <p style={{ margin: "0.8mm 0 0", fontSize: "2.8mm", color: "#666", whiteSpace: "pre-wrap" }}>{safeText(profile.company_address, 100)}</p>}
                  {profile?.vat_number && <p style={{ margin: "0.5mm 0 0", fontSize: "2.8mm", color: "#666" }}>TAX ID {safeText(profile.vat_number, 40)}</p>}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Total due highlight */}
        <div style={{ ...CARD, padding: "3.5mm 6mm", backgroundColor: "#fef2f2" }}>
          <p style={{ margin: 0, fontSize: "3.5mm" }}>
            <span style={{ fontSize: "4.5mm", fontWeight: 700, color: accent }}>{fmt(total)}</span>
            <span style={{ color: "#555", marginLeft: "2mm" }}>dues on {safeText(dueDate, 30)}</span>
          </p>
        </div>

        {/* Items card */}
        <div style={CARD}>
          <table style={T}>
            <thead>
              <tr style={{ borderBottom: "0.3mm solid #e5e7eb" }}>
                <th style={{ width: "50%", textAlign: "left", fontSize: "2.7mm", color: "#555", fontWeight: 600, padding: "2.5mm 0" }}>Service</th>
                <th style={{ width: "14%", textAlign: "center", fontSize: "2.7mm", color: "#555", fontWeight: 600, padding: "2.5mm 0" }}>Qty</th>
                <th style={{ width: "18%", textAlign: "right", fontSize: "2.7mm", color: "#555", fontWeight: 600, padding: "2.5mm 0" }}>Rate</th>
                <th style={{ width: "18%", textAlign: "right", fontSize: "2.7mm", color: "#555", fontWeight: 600, padding: "2.5mm 0" }}>Line total</th>
              </tr>
            </thead>
            <tbody>
              {norm.map((item, i) => (
                <tr key={i} style={{ pageBreakInside: "avoid" }}>
                  <td style={{ padding: "3mm 0", borderBottom: "0.2mm solid #f3f4f6", verticalAlign: "top" }}>
                    <p style={{ margin: 0, fontSize: "3.1mm", fontWeight: 600 }}>{safeText(item.description, 60)}</p>
                    {item.details && <p style={{ margin: "0.5mm 0 0", fontSize: "2.6mm", color: "#888" }}>{safeText(item.details, 70)}</p>}
                  </td>
                  <td style={{ ...R, textAlign: "center", padding: "3mm 0", borderBottom: "0.2mm solid #f3f4f6", fontSize: "3mm", color: "#555" }}>{Number(item.quantity || 0)}</td>
                  <td style={{ ...R, padding: "3mm 0", borderBottom: "0.2mm solid #f3f4f6", fontSize: "3mm", color: "#555" }}>{fmt(Number(item.rate || 0))}</td>
                  <td style={{ ...R, padding: "3mm 0", borderBottom: "0.2mm solid #f3f4f6", fontSize: "3mm", fontWeight: 600 }}>{fmt(item.amount)}</td>
                </tr>
              ))}
              {/* Totals inside table */}
              <tr><td colSpan={2} /><td style={{ ...R, padding: "2.5mm 0 1mm", fontSize: "3mm", color: "#888", fontWeight: 600 }}>Subtotal</td><td style={{ ...R, padding: "2.5mm 0 1mm", fontSize: "3mm" }}>{fmt(subtotal)}</td></tr>
              <tr><td colSpan={2} /><td style={{ ...R, padding: "1mm 0", fontSize: "3mm", color: "#888" }}>Tax ({taxRate}%)</td><td style={{ ...R, padding: "1mm 0", fontSize: "3mm" }}>{fmt(taxAmount)}</td></tr>
              <tr><td colSpan={2} /><td style={{ ...R, padding: "1mm 0", fontSize: "3mm", color: "#888", borderTop: "0.3mm solid #e5e7eb" }}>Total</td><td style={{ ...R, padding: "1mm 0", fontSize: "3mm", fontWeight: 600, borderTop: "0.3mm solid #e5e7eb" }}>{fmt(total)}</td></tr>
              <tr><td colSpan={2} /><td style={{ ...R, padding: "2mm 0 1mm", fontSize: "3.2mm", fontWeight: 700 }}>Amount due</td><td style={{ ...R, padding: "2mm 0 1mm", fontSize: "3.2mm", fontWeight: 700, borderTop: "0.4mm solid #1a1a1a" }}>{fmt(total)}</td></tr>
            </tbody>
          </table>
        </div>

        {/* Footer: Thank you + Bank details + Company bar */}
        <div style={{ position: "absolute", left: "16mm", right: "16mm", bottom: "16mm" }}>
          {/* Thank you + Bank details card */}
          <div style={{ ...CARD, marginBottom: "3mm" }}>
            <table style={T}>
              <tbody>
                <tr>
                  <td style={{ width: "45%", verticalAlign: "top" }}>
                    <p style={{ margin: 0, fontSize: "3mm", fontWeight: 700 }}>Thank you for the business!</p>
                    {notes && <p style={{ margin: "1mm 0 0", fontSize: "2.7mm", color: "#888", whiteSpace: "pre-wrap", maxHeight: "10mm", overflow: "hidden" }}>{safeText(notes, 140)}</p>}
                  </td>
                  <td style={{ width: "55%", verticalAlign: "top" }}>
                    {profile?.bank_name ? (
                      <table style={T}>
                        <tbody>
                          <tr><td style={{ fontSize: "2.8mm", fontWeight: 600, padding: "0.5mm 0", width: "30%" }}>Bank details</td><td style={{ fontSize: "2.8mm", color: "#555", padding: "0.5mm 0" }}>{safeText(profile.bank_name, 40)}</td></tr>
                          {profile?.bank_branch_code && <tr><td style={{ fontSize: "2.8mm", fontWeight: 600, padding: "0.5mm 0" }}>Branch code</td><td style={{ fontSize: "2.8mm", color: "#555", padding: "0.5mm 0" }}>{safeText(profile.bank_branch_code, 30)}</td></tr>}
                          {profile?.bank_account_number && <tr><td style={{ fontSize: "2.8mm", fontWeight: 600, padding: "0.5mm 0" }}>Account #</td><td style={{ fontSize: "2.8mm", color: "#555", padding: "0.5mm 0" }}>{safeText(profile.bank_account_number, 30)}</td></tr>}
                        </tbody>
                      </table>
                    ) : null}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Company footer bar */}
          <div style={{ backgroundColor: "#f8f9fb", borderRadius: "3mm", padding: "3mm 6mm" }}>
            <table style={T}>
              <tbody>
                <tr>
                  <td style={{ width: "40%", verticalAlign: "middle" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "2mm" }}>
                      {profile?.logo_url && <img src={profile.logo_url} alt="Logo" style={{ height: "5mm", maxWidth: "15mm", objectFit: "contain" }} />}
                      <span style={{ fontSize: "3mm", fontWeight: 700, color: accent }}>{safeText(profile?.company_name, 40)}</span>
                    </div>
                  </td>
                  <td style={{ width: "60%", verticalAlign: "middle", textAlign: "right" }}>
                    <span style={{ fontSize: "2.7mm", color: "#888" }}>
                      {[safeText(profile?.company_phone, 30), safeText(profile?.company_email, 50)].filter(Boolean).join(" | ")}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
);

InvoiceTemplate6.displayName = "InvoiceTemplate6";
export default InvoiceTemplate6;
