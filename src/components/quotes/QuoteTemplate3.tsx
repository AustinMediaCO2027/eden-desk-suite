import { forwardRef, type CSSProperties } from "react";
import type { Profile } from "@/hooks/useProfile";
import type { LineItem } from "@/lib/document-utils";
import { calculateTotals } from "@/lib/document-utils";
import type { QuoteTemplateProps } from "./QuoteTemplate1";

const safeText = (v: string | null | undefined, max: number) => (v || "").trim().slice(0, max);
const fmt = (v: number) => `R${Number(v || 0).toFixed(2)}`;

const PAGE: CSSProperties = {
  width: "210mm", height: "297mm", padding: "18mm 20mm 20mm",
  boxSizing: "border-box", overflow: "hidden", position: "relative",
  backgroundColor: "white", color: "#1a1a1a",
  fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
  pageBreakInside: "avoid",
};

const T: CSSProperties = { width: "100%", borderCollapse: "collapse", tableLayout: "fixed" };
const R: CSSProperties = { textAlign: "right", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" };

/**
 * Quote Template 3 – Classic with sidebar metadata
 * Mirrors InvoiceTemplate3: "QUOTE" bold top-left, logo top-right,
 * billed-to left / company right, card with sidebar metadata + bordered items table.
 */
const QuoteTemplate3 = forwardRef<HTMLDivElement, QuoteTemplateProps>(
  ({ profile, documentNumber, date, clientName, clientEmail, clientAddress, items, taxRate, notes, colorOverride }, ref) => {
    const accent = colorOverride || profile?.brand_color || "#3b82f6";
    const limitedItems = items.slice(0, 9);
    const norm = limitedItems.map(i => ({ ...i, amount: Number(i.amount || Number(i.quantity || 0) * Number(i.rate || 0)) }));
    const { subtotal, taxAmount, total } = calculateTotals(norm, taxRate);

    return (
      <div ref={ref} style={PAGE} data-print-template="quote" data-template-style="template3">
        {/* Top header bar */}
        <div style={{ backgroundColor: "#f8f9fb", borderRadius: "3mm", padding: "5mm 6mm", marginBottom: "5mm" }}>
          <table style={T}>
            <tbody>
              <tr>
                <td style={{ width: "50%", verticalAlign: "middle" }}>
                  <p style={{ margin: 0, fontSize: "7mm", fontWeight: 800, color: "#1a1a1a", letterSpacing: "0.3mm" }}>QUOTE</p>
                </td>
                <td style={{ width: "50%", verticalAlign: "middle", textAlign: "right" }}>
                  {profile?.logo_url && (
                    <img src={profile.logo_url} alt="Logo" style={{ height: "12mm", maxWidth: "30mm", objectFit: "contain" }} />
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Prepared for / Company info */}
        <table style={{ ...T, marginBottom: "5mm" }}>
          <tbody>
            <tr>
              <td style={{ width: "50%", verticalAlign: "top" }}>
                <p style={{ margin: 0, fontSize: "2.6mm", color: "#888", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.2mm" }}>Prepared for</p>
                <p style={{ margin: "1mm 0 0", fontSize: "3.4mm", fontWeight: 600 }}>{safeText(clientName, 80)}</p>
                {clientAddress && <p style={{ margin: "0.6mm 0 0", fontSize: "2.9mm", color: "#555", whiteSpace: "pre-wrap" }}>{safeText(clientAddress, 120)}</p>}
                {clientEmail && <p style={{ margin: "0.5mm 0 0", fontSize: "2.8mm", color: "#555" }}>{safeText(clientEmail, 60)}</p>}
              </td>
              <td style={{ width: "50%", verticalAlign: "top", textAlign: "right" }}>
                <p style={{ margin: 0, fontSize: "3.4mm", fontWeight: 700, color: accent }}>{safeText(profile?.company_name, 60) || "Your Company"}</p>
                {profile?.company_address && <p style={{ margin: "0.8mm 0 0", fontSize: "2.9mm", color: "#555", whiteSpace: "pre-wrap" }}>{safeText(profile.company_address, 120)}</p>}
                {profile?.vat_number && <p style={{ margin: "0.5mm 0 0", fontSize: "2.8mm", color: "#888" }}>TAX ID {safeText(profile.vat_number, 40)}</p>}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Metadata + Items card */}
        <div style={{ border: "0.3mm solid #e5e7eb", borderRadius: "3mm", overflow: "hidden", marginBottom: "5mm" }}>
          <table style={T}>
            <tbody>
              <tr>
                {/* Sidebar metadata */}
                <td style={{ width: "25%", verticalAlign: "top", padding: "5mm", borderRight: "0.3mm solid #e5e7eb" }}>
                  <div style={{ marginBottom: "4mm" }}>
                    <p style={{ margin: 0, fontSize: "2.5mm", color: "#888", fontWeight: 600 }}>Quote #</p>
                    <p style={{ margin: "0.8mm 0 0", fontSize: "3mm", fontWeight: 600 }}>{safeText(documentNumber, 30)}</p>
                  </div>
                  <div style={{ marginBottom: "4mm" }}>
                    <p style={{ margin: 0, fontSize: "2.5mm", color: "#888", fontWeight: 600 }}>Date</p>
                    <p style={{ margin: "0.8mm 0 0", fontSize: "3mm" }}>{safeText(date, 30)}</p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: "2.5mm", color: "#888", fontWeight: 600 }}>Valid for</p>
                    <p style={{ margin: "0.8mm 0 0", fontSize: "3mm", fontWeight: 600 }}>30 days</p>
                  </div>
                </td>

                {/* Items table */}
                <td style={{ width: "75%", verticalAlign: "top", padding: "0" }}>
                  <table style={{ ...T }}>
                    <thead>
                      <tr style={{ backgroundColor: "#f8f9fb" }}>
                        <th style={{ width: "48%", textAlign: "left", fontSize: "2.7mm", color: "#555", fontWeight: 600, padding: "3mm 4mm", borderBottom: "0.3mm solid #e5e7eb" }}>Services</th>
                        <th style={{ width: "13%", textAlign: "center", fontSize: "2.7mm", color: "#555", fontWeight: 600, padding: "3mm 2mm", borderBottom: "0.3mm solid #e5e7eb" }}>Qty</th>
                        <th style={{ width: "19%", textAlign: "right", fontSize: "2.7mm", color: "#555", fontWeight: 600, padding: "3mm 2mm", borderBottom: "0.3mm solid #e5e7eb" }}>Rate</th>
                        <th style={{ width: "20%", textAlign: "right", fontSize: "2.7mm", color: "#555", fontWeight: 600, padding: "3mm 4mm", borderBottom: "0.3mm solid #e5e7eb" }}>Line total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {norm.map((item, i) => (
                        <tr key={i} style={{ pageBreakInside: "avoid" }}>
                          <td style={{ padding: "3mm 4mm", borderBottom: "0.2mm solid #f0f0f0", verticalAlign: "top" }}>
                            <p style={{ margin: 0, fontSize: "3.1mm", fontWeight: 600 }}>{safeText(item.description, 60)}</p>
                            {item.details && <p style={{ margin: "0.5mm 0 0", fontSize: "2.6mm", color: "#888" }}>{safeText(item.details, 70)}</p>}
                          </td>
                          <td style={{ ...R, textAlign: "center", padding: "3mm 2mm", borderBottom: "0.2mm solid #f0f0f0", fontSize: "3mm", color: "#555" }}>{Number(item.quantity || 0)}</td>
                          <td style={{ ...R, padding: "3mm 2mm", borderBottom: "0.2mm solid #f0f0f0", fontSize: "3mm", color: "#555" }}>{fmt(Number(item.rate || 0))}</td>
                          <td style={{ ...R, padding: "3mm 4mm", borderBottom: "0.2mm solid #f0f0f0", fontSize: "3mm", fontWeight: 600 }}>{fmt(item.amount)}</td>
                        </tr>
                      ))}
                      {/* Subtotal rows */}
                      <tr>
                        <td colSpan={3} style={{ textAlign: "right", padding: "2mm 2mm 1mm 0", fontSize: "3mm", color: "#888" }}>Subtotal</td>
                        <td style={{ ...R, padding: "2mm 4mm 1mm", fontSize: "3mm" }}>{fmt(subtotal)}</td>
                      </tr>
                      <tr>
                        <td colSpan={3} style={{ textAlign: "right", padding: "1mm 2mm 1mm 0", fontSize: "3mm", color: "#888" }}>Tax ({taxRate}%)</td>
                        <td style={{ ...R, padding: "1mm 4mm", fontSize: "3mm" }}>{fmt(taxAmount)}</td>
                      </tr>
                      <tr>
                        <td colSpan={4} style={{ padding: "2mm 4mm 2mm 0" }}>
                          <div style={{ backgroundColor: accent, borderRadius: "2mm", padding: "2.5mm 4mm", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "3.2mm", fontWeight: 700, color: "white" }}>Estimated total</span>
                            <span style={{ fontSize: "3.2mm", fontWeight: 700, color: "white" }}>{fmt(total)}</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Notes */}
        {notes && (
          <p style={{ margin: "0 0 4mm", fontSize: "2.8mm", color: "#888" }}>{safeText(notes, 200)}</p>
        )}

        {/* Footer */}
        <div style={{ position: "absolute", left: "20mm", right: "20mm", bottom: "20mm", borderTop: "0.3mm solid #e5e7eb", paddingTop: "3mm" }}>
          <table style={T}>
            <tbody>
              <tr>
                <td style={{ fontSize: "2.8mm", color: "#888", fontStyle: "italic" }}>{safeText(profile?.company_website, 60)}</td>
                <td style={{ fontSize: "2.8mm", color: "#888", textAlign: "center" }}>{safeText(profile?.company_phone, 40)}</td>
                <td style={{ fontSize: "2.8mm", color: "#888", textAlign: "right", fontStyle: "italic" }}>{safeText(profile?.company_email, 60)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
);

QuoteTemplate3.displayName = "QuoteTemplate3";
export default QuoteTemplate3;
