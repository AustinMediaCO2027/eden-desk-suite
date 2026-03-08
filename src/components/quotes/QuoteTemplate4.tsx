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
  fontFamily: "Georgia, 'Times New Roman', serif",
  pageBreakInside: "avoid",
};

const T: CSSProperties = { width: "100%", borderCollapse: "collapse", tableLayout: "fixed" };
const R: CSSProperties = { textAlign: "right", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums lining-nums", fontFeatureSettings: '"tnum" 1, "lnum" 1' };

/**
 * Quote Template 4 – Creative / Editorial
 * Mirrors InvoiceTemplate4: Large serif "Quote" title, Nº top-right,
 * 3-column metadata, accent border, items table, footer.
 */
const QuoteTemplate4 = forwardRef<HTMLDivElement, QuoteTemplateProps>(
  ({ profile, documentNumber, date, clientName, clientEmail, clientAddress, items, taxRate, notes, colorOverride }, ref) => {
    const accent = colorOverride || profile?.brand_color || "#e11d63";
    const limitedItems = items.slice(0, 9);
    const norm = limitedItems.map(i => ({ ...i, amount: Number(i.amount || Number(i.quantity || 0) * Number(i.rate || 0)) }));
    const { subtotal, taxAmount, total } = calculateTotals(norm, taxRate);

    return (
      <div ref={ref} style={PAGE} data-print-template="quote" data-template-style="template4">
        {/* Title row */}
        <table style={{ ...T, marginBottom: "7mm" }}>
          <tbody>
            <tr>
              <td style={{ width: "60%", verticalAlign: "bottom" }}>
                <p style={{ margin: 0, fontSize: "11mm", fontWeight: 400, lineHeight: 1.1 }}>Quote</p>
              </td>
              <td style={{ width: "40%", verticalAlign: "bottom", textAlign: "right" }}>
                <p style={{ margin: 0, fontSize: "5.5mm", fontWeight: 400, color: "#555" }}>N<sup style={{ fontSize: "3mm" }}>o</sup> {safeText(documentNumber, 20)}</p>
              </td>
            </tr>
          </tbody>
        </table>

        {/* 3-column metadata */}
        <table style={{ ...T, marginBottom: "6mm" }}>
          <tbody>
            <tr>
              <td style={{ width: "28%", verticalAlign: "top" }}>
                <p style={{ margin: 0, fontSize: "3.2mm", fontWeight: 700 }}>Estimated {fmt(total)}</p>
                <p style={{ margin: "1.5mm 0 0", fontSize: "2.8mm", fontWeight: 600 }}>Issued {safeText(date, 30)}</p>
                <p style={{ margin: "0.5mm 0 0", fontSize: "2.8mm", color: "#888" }}>Valid 30 days</p>
                <p style={{ margin: "0.5mm 0 0", fontSize: "2.8mm", color: "#888" }}>Ref. #{safeText(documentNumber, 20)}</p>
              </td>
              <td style={{ width: "36%", verticalAlign: "top" }}>
                <p style={{ margin: 0, fontSize: "2.6mm", color: "#888", fontWeight: 600 }}>Prepared for</p>
                <p style={{ margin: "1mm 0 0", fontSize: "3.2mm", fontWeight: 600 }}>{safeText(clientName, 60)}</p>
                {clientAddress && <p style={{ margin: "0.6mm 0 0", fontSize: "2.8mm", color: "#555", whiteSpace: "pre-wrap" }}>{safeText(clientAddress, 100)}</p>}
                {clientEmail && <p style={{ margin: "0.5mm 0 0", fontSize: "2.8mm", color: "#555" }}>{safeText(clientEmail, 50)}</p>}
              </td>
              <td style={{ width: "36%", verticalAlign: "top", textAlign: "right" }}>
                <p style={{ margin: 0, fontSize: "2.6mm", color: "#888", fontWeight: 600 }}>From</p>
                <p style={{ margin: "1mm 0 0", fontSize: "3.2mm", fontWeight: 600 }}>{safeText(profile?.company_name, 50) || "Your Company"}</p>
                {profile?.company_address && <p style={{ margin: "0.6mm 0 0", fontSize: "2.8mm", color: "#555", whiteSpace: "pre-wrap" }}>{safeText(profile.company_address, 100)}</p>}
                {profile?.vat_number && <p style={{ margin: "0.5mm 0 0", fontSize: "2.8mm", color: "#888" }}>TAX ID {safeText(profile.vat_number, 40)}</p>}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Section title with accent border */}
        <div style={{ borderLeft: `1mm solid ${accent}`, paddingLeft: "4mm", marginBottom: "4mm" }}>
          <p style={{ margin: 0, fontSize: "3.4mm", fontWeight: 700 }}>Proposed Services</p>
        </div>

        {/* Items table */}
        <table style={{ ...T, marginBottom: "4mm" }}>
          <thead>
            <tr>
              <th style={{ width: "50%", textAlign: "left", fontSize: "2.7mm", textTransform: "uppercase", letterSpacing: "0.2mm", color: "#888", padding: "2mm 0", borderBottom: "0.3mm solid #e5e7eb" }}>Item Description</th>
              <th style={{ width: "14%", textAlign: "center", fontSize: "2.7mm", textTransform: "uppercase", letterSpacing: "0.2mm", color: "#888", padding: "2mm 0", borderBottom: "0.3mm solid #e5e7eb" }}>Qty</th>
              <th style={{ width: "18%", textAlign: "right", fontSize: "2.7mm", textTransform: "uppercase", letterSpacing: "0.2mm", color: "#888", padding: "2mm 0", borderBottom: "0.3mm solid #e5e7eb" }}>Rate</th>
              <th style={{ width: "18%", textAlign: "right", fontSize: "2.7mm", textTransform: "uppercase", letterSpacing: "0.2mm", color: "#888", padding: "2mm 0", borderBottom: "0.3mm solid #e5e7eb" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {norm.map((item, i) => (
              <tr key={i} style={{ pageBreakInside: "avoid" }}>
                <td style={{ padding: "2.5mm 0", borderBottom: "0.2mm solid #f0f0f0", verticalAlign: "top" }}>
                  <p style={{ margin: 0, fontSize: "3.1mm", fontWeight: 600 }}>{safeText(item.description, 70)}</p>
                  {item.details && <p style={{ margin: "0.5mm 0 0", fontSize: "2.6mm", color: "#888" }}>{safeText(item.details, 80)}</p>}
                </td>
                <td style={{ ...R, textAlign: "center", padding: "2.5mm 0", borderBottom: "0.2mm solid #f0f0f0", fontSize: "3mm", color: "#555" }}>{Number(item.quantity || 0)}</td>
                <td style={{ ...R, padding: "2.5mm 0", borderBottom: "0.2mm solid #f0f0f0", fontSize: "3mm", color: "#555" }}>{fmt(Number(item.rate || 0))}</td>
                <td style={{ ...R, padding: "2.5mm 0", borderBottom: "0.2mm solid #f0f0f0", fontSize: "3mm", fontWeight: 600 }}>{fmt(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <table style={{ ...T, marginBottom: "6mm" }}>
          <tbody>
            <tr><td style={{ width: "60%" }} />
              <td style={{ width: "40%" }}>
                <table style={T}>
                  <tbody>
                    <tr>
                      <td style={{ fontSize: "3mm", color: "#888", padding: "1.5mm 0" }}>Subtotal</td>
                      <td style={{ ...R, fontSize: "3mm", padding: "1.5mm 0" }}>{fmt(subtotal)}</td>
                    </tr>
                    <tr>
                      <td style={{ fontSize: "3mm", color: "#888", padding: "1.5mm 0" }}>Tax ({taxRate}%)</td>
                      <td style={{ ...R, fontSize: "3mm", padding: "1.5mm 0" }}>{fmt(taxAmount)}</td>
                    </tr>
                    <tr>
                      <td colSpan={2} style={{ padding: "2.5mm 0 0" }}>
                        <div style={{ backgroundColor: accent, borderRadius: "2mm", padding: "2.5mm 4mm" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <tbody><tr>
                              <td style={{ fontSize: "3.5mm", fontWeight: 700, color: "white", textAlign: "left" }}>Estimated Total (ZAR)</td>
                              <td style={{ fontSize: "3.5mm", fontWeight: 700, color: "white", textAlign: "right", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{fmt(total)}</td>
                            </tr></tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Footer */}
        <div style={{ position: "absolute", left: "20mm", right: "20mm", bottom: "20mm" }}>
          {notes && (
            <div style={{ borderLeft: `1mm solid ${accent}`, paddingLeft: "4mm", marginBottom: "3mm" }}>
              <p style={{ margin: 0, fontSize: "3mm", fontWeight: 700 }}>Terms & Notes</p>
              <p style={{ margin: "1mm 0 0", fontSize: "2.7mm", color: "#888", whiteSpace: "pre-wrap", maxHeight: "10mm", overflow: "hidden" }}>{safeText(notes, 160)}</p>
            </div>
          )}
          <div style={{ borderTop: "0.3mm solid #e5e7eb", paddingTop: "3mm" }}>
            <table style={T}>
              <tbody>
                <tr>
                  <td style={{ fontSize: "2.8mm", fontWeight: 600 }}>Thank you for your consideration.</td>
                  <td style={{ fontSize: "2.8mm", color: "#888", textAlign: "center" }}>{safeText(profile?.company_email, 60)}</td>
                  <td style={{ fontSize: "2.8mm", color: "#888", textAlign: "right" }}>{safeText(profile?.company_phone, 40)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
);

QuoteTemplate4.displayName = "QuoteTemplate4";
export default QuoteTemplate4;
