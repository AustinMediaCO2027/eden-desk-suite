import type { CSSProperties } from "react";
import type { Profile } from "@/hooks/useProfile";
import type { LineItem } from "@/lib/document-utils";
import { calculateTotals } from "@/lib/document-utils";

interface QuotePrintProps {
  profile: Profile | null;
  documentNumber: string;
  date: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  items: LineItem[];
  taxRate: number;
  notes: string;
  status: string;
  colorOverride?: string;
}

const PAGE_STYLE: CSSProperties = {
  width: "210mm",
  height: "297mm",
  padding: "20mm",
  boxSizing: "border-box",
  overflow: "hidden",
  position: "relative",
  backgroundColor: "white",
  fontFamily: "Inter, Arial, sans-serif",
  color: "hsl(222 47% 11%)",
  pageBreakBefore: "avoid",
  pageBreakAfter: "avoid",
  pageBreakInside: "avoid",
};

const CONTENT_STYLE: CSSProperties = {
  height: "257mm",
  position: "relative",
  paddingBottom: "24mm",
  boxSizing: "border-box",
  overflow: "hidden",
};

const FOOTER_STYLE: CSSProperties = {
  position: "absolute",
  left: "20mm",
  right: "20mm",
  bottom: "20mm",
  borderTop: "0.3mm solid hsl(220 13% 87%)",
  paddingTop: "3mm",
};

const TABLE_RESET: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  tableLayout: "fixed",
};

const NUMERIC_RIGHT: CSSProperties = {
  textAlign: "right",
  whiteSpace: "nowrap",
  fontVariantNumeric: "tabular-nums",
  fontFeatureSettings: '"tnum" 1, "lnum" 1',
};

const NUMERIC_CENTER: CSSProperties = {
  textAlign: "center",
  whiteSpace: "nowrap",
  fontVariantNumeric: "tabular-nums",
  fontFeatureSettings: '"tnum" 1, "lnum" 1',
};

const safeText = (value: string | null | undefined, max: number) => (value || "").trim().slice(0, max);
const formatMoney = (value: number) => `R${Number(value || 0).toFixed(2)}`;

const QuotePrint = ({
  profile,
  documentNumber,
  date,
  clientName,
  clientEmail,
  clientAddress,
  items,
  taxRate,
  notes,
  colorOverride,
}: QuotePrintProps) => {
  const brandColor = colorOverride || profile?.brand_color || "hsl(206 66% 30%)";
  const limitedItems = items.slice(0, 9);
  const omittedRows = Math.max(0, items.length - limitedItems.length);
  const normalizedItems = limitedItems.map((item) => ({
    ...item,
    amount: Number(item.amount || Number(item.quantity || 0) * Number(item.rate || 0)),
  }));
  const { subtotal, taxAmount, total } = calculateTotals(normalizedItems, taxRate);

  return (
    <div style={PAGE_STYLE} data-print-template="quote">
      <div style={CONTENT_STYLE}>
        <table style={{ ...TABLE_RESET, marginBottom: "6mm" }}>
          <tbody>
            <tr>
              <td style={{ width: "62%", verticalAlign: "top" }}>
                {profile?.logo_url ? (
                  <img src={profile.logo_url} alt="Company logo" style={{ maxHeight: "12mm", maxWidth: "100%", objectFit: "contain", marginBottom: "3mm" }} />
                ) : null}
                <p style={{ margin: 0, fontSize: "5.4mm", fontWeight: 700 }}>{safeText(profile?.company_name, 90) || "Your Company"}</p>
                {profile?.company_address ? (
                  <p style={{ margin: "1.5mm 0 0", fontSize: "3.2mm", color: "hsl(215 16% 47%)", whiteSpace: "pre-wrap", maxHeight: "13mm", overflow: "hidden" }}>
                    {safeText(profile.company_address, 140)}
                  </p>
                ) : null}
              </td>
              <td style={{ width: "38%", textAlign: "right", verticalAlign: "top" }}>
                <p style={{ margin: 0, fontSize: "7.2mm", fontWeight: 700, color: brandColor, letterSpacing: "0.3mm" }}>QUOTE</p>
                <p style={{ ...NUMERIC_RIGHT, margin: "2mm 0 0", fontSize: "3.1mm", color: "hsl(215 16% 47%)" }}>No: {safeText(documentNumber, 40)}</p>
                <p style={{ ...NUMERIC_RIGHT, margin: "1mm 0 0", fontSize: "3.1mm", color: "hsl(215 16% 47%)" }}>Date: {safeText(date, 40)}</p>
              </td>
            </tr>
          </tbody>
        </table>

        <table style={{ ...TABLE_RESET, marginBottom: "5mm" }}>
          <tbody>
            <tr>
              <td style={{ width: "58%", verticalAlign: "top" }}>
                <p style={{ margin: 0, fontSize: "2.8mm", letterSpacing: "0.25mm", textTransform: "uppercase", color: "hsl(215 16% 47%)", fontWeight: 700 }}>Prepared For</p>
                <p style={{ margin: "1.2mm 0 0", fontSize: "3.5mm", fontWeight: 600 }}>{safeText(clientName, 80)}</p>
                {clientEmail ? <p style={{ margin: "0.8mm 0 0", fontSize: "3.1mm", color: "hsl(215 16% 47%)" }}>{safeText(clientEmail, 90)}</p> : null}
                {clientAddress ? (
                  <p style={{ margin: "0.8mm 0 0", fontSize: "3.1mm", color: "hsl(215 16% 47%)", whiteSpace: "pre-wrap", maxHeight: "12mm", overflow: "hidden" }}>
                    {safeText(clientAddress, 120)}
                  </p>
                ) : null}
              </td>
              <td style={{ width: "42%", verticalAlign: "top" }}>
                {(profile?.registration_number || profile?.vat_number) ? (
                  <table style={TABLE_RESET}>
                    <tbody>
                      {profile?.registration_number ? (
                        <tr>
                          <td style={{ fontSize: "3mm", color: "hsl(215 16% 47%)", paddingBottom: "1mm" }}>Reg</td>
                          <td style={{ ...NUMERIC_RIGHT, fontSize: "3mm", color: "hsl(215 25% 25%)", paddingBottom: "1mm" }}>{safeText(profile.registration_number, 40)}</td>
                        </tr>
                      ) : null}
                      {profile?.vat_number ? (
                        <tr>
                          <td style={{ fontSize: "3mm", color: "hsl(215 16% 47%)" }}>VAT</td>
                          <td style={{ ...NUMERIC_RIGHT, fontSize: "3mm", color: "hsl(215 25% 25%)" }}>{safeText(profile.vat_number, 40)}</td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                ) : null}
              </td>
            </tr>
          </tbody>
        </table>

        <table style={{ ...TABLE_RESET, marginBottom: "4mm" }}>
          <thead>
            <tr style={{ backgroundColor: "hsl(220 14% 96%)" }}>
              <th style={{ width: "54%", textAlign: "left", fontSize: "2.9mm", textTransform: "uppercase", letterSpacing: "0.2mm", padding: "2.3mm", borderBottom: "0.3mm solid hsl(220 13% 87%)" }}>Description</th>
              <th style={{ width: "12%", textAlign: "center", fontSize: "2.9mm", textTransform: "uppercase", letterSpacing: "0.2mm", padding: "2.3mm", borderBottom: "0.3mm solid hsl(220 13% 87%)" }}>Qty</th>
              <th style={{ width: "17%", textAlign: "right", fontSize: "2.9mm", textTransform: "uppercase", letterSpacing: "0.2mm", padding: "2.3mm", borderBottom: "0.3mm solid hsl(220 13% 87%)" }}>Rate</th>
              <th style={{ width: "17%", textAlign: "right", fontSize: "2.9mm", textTransform: "uppercase", letterSpacing: "0.2mm", padding: "2.3mm", borderBottom: "0.3mm solid hsl(220 13% 87%)" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {normalizedItems.map((item, index) => (
              <tr key={`${item.description}-${index}`} style={{ pageBreakInside: "avoid" }}>
                <td style={{ padding: "2.2mm", borderBottom: "0.25mm solid hsl(220 14% 92%)", verticalAlign: "top" }}>
                  <p style={{ margin: 0, fontSize: "3.2mm", color: "hsl(215 25% 25%)" }}>{safeText(item.description, 70)}</p>
                  {item.details ? <p style={{ margin: "0.7mm 0 0", fontSize: "2.7mm", color: "hsl(215 16% 47%)" }}>{safeText(item.details, 80)}</p> : null}
                </td>
                <td style={{ ...NUMERIC_CENTER, padding: "2.2mm", borderBottom: "0.25mm solid hsl(220 14% 92%)", fontSize: "3.1mm", color: "hsl(215 16% 47%)", verticalAlign: "top" }}>{Number(item.quantity || 0)}</td>
                <td style={{ ...NUMERIC_RIGHT, padding: "2.2mm", borderBottom: "0.25mm solid hsl(220 14% 92%)", fontSize: "3.1mm", color: "hsl(215 16% 47%)", verticalAlign: "top" }}>{formatMoney(Number(item.rate || 0))}</td>
                <td style={{ ...NUMERIC_RIGHT, padding: "2.2mm", borderBottom: "0.25mm solid hsl(220 14% 92%)", fontSize: "3.1mm", fontWeight: 600, color: "hsl(215 25% 25%)", verticalAlign: "top" }}>{formatMoney(item.amount)}</td>
              </tr>
            ))}
            {omittedRows > 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: "2mm", fontSize: "2.8mm", color: "hsl(0 64% 44%)", borderBottom: "0.25mm solid hsl(220 14% 92%)" }}>
                  {omittedRows} additional line item(s) hidden to preserve single-page layout.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>

        <table style={{ ...TABLE_RESET, marginTop: "2mm" }}>
          <tbody>
            <tr>
              <td style={{ width: "58%", verticalAlign: "top", paddingRight: "4mm" }}>
                {notes ? (
                  <>
                    <p style={{ margin: 0, fontSize: "2.8mm", letterSpacing: "0.2mm", textTransform: "uppercase", color: "hsl(215 16% 47%)", fontWeight: 700 }}>Notes</p>
                    <p style={{ margin: "1mm 0 0", fontSize: "3mm", lineHeight: 1.45, color: "hsl(215 25% 25%)", whiteSpace: "pre-wrap", maxHeight: "20mm", overflow: "hidden" }}>{safeText(notes, 260)}</p>
                  </>
                ) : null}
              </td>
              <td style={{ width: "42%", verticalAlign: "top" }}>
                <table style={TABLE_RESET}>
                  <tbody>
                    <tr>
                      <td style={{ fontSize: "3.1mm", color: "hsl(215 16% 47%)", padding: "1mm 0" }}>Subtotal</td>
                      <td style={{ ...NUMERIC_RIGHT, fontSize: "3.1mm", color: "hsl(215 25% 25%)", padding: "1mm 0" }}>{formatMoney(subtotal)}</td>
                    </tr>
                    <tr>
                      <td style={{ fontSize: "3.1mm", color: "hsl(215 16% 47%)", padding: "1mm 0" }}>Tax ({taxRate}%)</td>
                      <td style={{ ...NUMERIC_RIGHT, fontSize: "3.1mm", color: "hsl(215 25% 25%)", padding: "1mm 0" }}>{formatMoney(taxAmount)}</td>
                    </tr>
                    <tr>
                      <td style={{ fontSize: "3.5mm", fontWeight: 700, padding: "2mm 0", borderTop: `0.4mm solid ${brandColor}` }}>Total</td>
                      <td style={{ ...NUMERIC_RIGHT, fontSize: "3.5mm", fontWeight: 700, padding: "2mm 0", borderTop: `0.4mm solid ${brandColor}`, color: brandColor }}>{formatMoney(total)}</td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={FOOTER_STYLE}>
        <table style={TABLE_RESET}>
          <tbody>
            <tr>
              <td style={{ width: "33.33%", fontSize: "2.8mm", color: "hsl(215 16% 47%)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{safeText(profile?.company_website, 60)}</td>
              <td style={{ width: "33.33%", fontSize: "2.8mm", color: "hsl(215 16% 47%)", textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{safeText(profile?.company_phone, 40)}</td>
              <td style={{ width: "33.33%", fontSize: "2.8mm", color: "hsl(215 16% 47%)", textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{safeText(profile?.company_email, 60)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuotePrint;

