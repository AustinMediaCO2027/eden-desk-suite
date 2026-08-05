import type { CSSProperties } from "react";
import type { Profile } from "@/hooks/useProfile";
import PrintShell from "@/components/print/PrintShell";
import {
  calculatePurchaseOrderTotals,
  purchaseOrderLineNet,
  type PurchaseOrderItem,
} from "@/lib/accounting-types";
import { formatDisplayDate, formatMoney } from "@/lib/accounting-utils";

export interface PurchaseOrderPrintProps {
  profile: Profile | null;
  poNumber: string;
  issueDate: string;
  expectedDeliveryDate?: string | null;
  currencySymbol?: string;
  status: string;
  supplierName: string;
  supplierContact?: string | null;
  supplierEmail?: string | null;
  supplierPhone?: string | null;
  supplierAddress?: string | null;
  supplierVatNumber?: string | null;
  paymentTerms?: string | null;
  notes?: string | null;
  items: PurchaseOrderItem[];
  accent?: string;
  generatedBy?: string;
}

const th: CSSProperties = {
  padding: "8px 10px",
  fontSize: "10px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.4px",
  color: "#ffffff",
  textAlign: "left",
};

const td: CSSProperties = {
  padding: "8px 10px",
  fontSize: "11px",
  borderBottom: "1px solid #EDEDED",
  verticalAlign: "top",
};

const PurchaseOrderPrint = ({
  profile,
  poNumber,
  issueDate,
  expectedDeliveryDate,
  currencySymbol = "R",
  status,
  supplierName,
  supplierContact,
  supplierEmail,
  supplierPhone,
  supplierAddress,
  supplierVatNumber,
  paymentTerms,
  notes,
  items,
  accent,
  generatedBy,
}: PurchaseOrderPrintProps) => {
  const color = accent || profile?.brand_color || "#1A1A1A";
  const totals = calculatePurchaseOrderTotals(items);

  return (
    <PrintShell
      profile={profile}
      title="PURCHASE ORDER"
      accent={color}
      generatedBy={generatedBy}
      meta={[
        { label: "PO Number", value: poNumber },
        { label: "Issue Date", value: formatDisplayDate(issueDate) },
        { label: "Expected Delivery", value: formatDisplayDate(expectedDeliveryDate) },
        { label: "Status", value: status.charAt(0).toUpperCase() + status.slice(1) },
      ]}
    >
      <div style={{ display: "flex", gap: "20px", marginBottom: "18px" }}>
        <div style={{ flex: 1, backgroundColor: "#F7F7F7", padding: "12px 14px", borderRadius: "6px" }}>
          <p style={{ margin: 0, fontSize: "9px", letterSpacing: "0.6px", color: "#777777", fontWeight: 700 }}>SUPPLIER</p>
          <p style={{ margin: "6px 0 0", fontSize: "13px", fontWeight: 700 }}>{supplierName || "—"}</p>
          {supplierContact ? <p style={{ margin: "3px 0 0", fontSize: "10px", color: "#555555" }}>Attn: {supplierContact}</p> : null}
          {supplierAddress ? (
            <p style={{ margin: "3px 0 0", fontSize: "10px", color: "#555555", whiteSpace: "pre-line", lineHeight: 1.4 }}>
              {supplierAddress}
            </p>
          ) : null}
          {supplierEmail ? <p style={{ margin: "3px 0 0", fontSize: "10px", color: "#555555" }}>{supplierEmail}</p> : null}
          {supplierPhone ? <p style={{ margin: "2px 0 0", fontSize: "10px", color: "#555555" }}>{supplierPhone}</p> : null}
          {supplierVatNumber ? (
            <p style={{ margin: "2px 0 0", fontSize: "10px", color: "#555555" }}>VAT No: {supplierVatNumber}</p>
          ) : null}
        </div>
        <div style={{ flex: 1, backgroundColor: "#F7F7F7", padding: "12px 14px", borderRadius: "6px" }}>
          <p style={{ margin: 0, fontSize: "9px", letterSpacing: "0.6px", color: "#777777", fontWeight: 700 }}>DELIVER TO</p>
          <p style={{ margin: "6px 0 0", fontSize: "13px", fontWeight: 700 }}>{profile?.company_name || "Your Company"}</p>
          {profile?.company_address ? (
            <p style={{ margin: "3px 0 0", fontSize: "10px", color: "#555555", whiteSpace: "pre-line", lineHeight: 1.4 }}>
              {profile.company_address}
            </p>
          ) : null}
          {paymentTerms ? (
            <p style={{ margin: "6px 0 0", fontSize: "10px", color: "#555555" }}>Payment terms: {paymentTerms}</p>
          ) : null}
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
        <thead>
          <tr style={{ backgroundColor: color }}>
            <th style={{ ...th, width: "38%" }}>Product / Service</th>
            <th style={{ ...th, width: "10%", textAlign: "right" }}>Qty</th>
            <th style={{ ...th, width: "17%", textAlign: "right" }}>Unit Price</th>
            <th style={{ ...th, width: "10%", textAlign: "right" }}>Disc %</th>
            <th style={{ ...th, width: "10%", textAlign: "right" }}>Tax %</th>
            <th style={{ ...th, width: "18%", textAlign: "right" }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={`${item.description}-${index}`}>
              <td style={td}>
                <span style={{ fontWeight: 600 }}>{item.description || "—"}</span>
                {item.details ? (
                  <span style={{ display: "block", fontSize: "10px", color: "#777777", marginTop: "2px" }}>{item.details}</span>
                ) : null}
              </td>
              <td style={{ ...td, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{Number(item.quantity || 0)}</td>
              <td style={{ ...td, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                {formatMoney(Number(item.rate || 0), currencySymbol)}
              </td>
              <td style={{ ...td, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{Number(item.discount || 0)}%</td>
              <td style={{ ...td, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{Number(item.taxRate || 0)}%</td>
              <td style={{ ...td, textAlign: "right", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                {formatMoney(purchaseOrderLineNet(item), currencySymbol)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <table style={{ marginLeft: "auto", marginTop: "16px", borderCollapse: "collapse", width: "46%" }}>
        <tbody>
          <tr>
            <td style={{ padding: "4px 0", fontSize: "11px", color: "#555555" }}>Subtotal</td>
            <td style={{ padding: "4px 0", fontSize: "11px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
              {formatMoney(totals.subtotal, currencySymbol)}
            </td>
          </tr>
          {totals.discountAmount > 0 ? (
            <tr>
              <td style={{ padding: "4px 0", fontSize: "11px", color: "#555555" }}>Discount</td>
              <td style={{ padding: "4px 0", fontSize: "11px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                -{formatMoney(totals.discountAmount, currencySymbol)}
              </td>
            </tr>
          ) : null}
          {totals.taxAmount > 0 ? (
            <tr>
              <td style={{ padding: "4px 0", fontSize: "11px", color: "#555555" }}>VAT</td>
              <td style={{ padding: "4px 0", fontSize: "11px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                {formatMoney(totals.taxAmount, currencySymbol)}
              </td>
            </tr>
          ) : null}
          <tr>
            <td style={{ padding: "8px 10px", fontSize: "12px", fontWeight: 700, backgroundColor: color, color: "#ffffff" }}>
              Grand Total
            </td>
            <td
              style={{
                padding: "8px 10px",
                fontSize: "12px",
                fontWeight: 700,
                textAlign: "right",
                backgroundColor: color,
                color: "#ffffff",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {formatMoney(totals.total, currencySymbol)}
            </td>
          </tr>
        </tbody>
      </table>

      {notes ? (
        <div style={{ marginTop: "22px" }}>
          <p style={{ margin: 0, fontSize: "9px", letterSpacing: "0.6px", color: "#777777", fontWeight: 700 }}>NOTES</p>
          <p style={{ margin: "5px 0 0", fontSize: "10px", color: "#555555", whiteSpace: "pre-line", lineHeight: 1.5 }}>{notes}</p>
        </div>
      ) : null}

      <div style={{ marginTop: "34px", display: "flex", gap: "40px" }}>
        <div style={{ flex: 1, borderTop: "1px solid #BBBBBB", paddingTop: "5px" }}>
          <p style={{ margin: 0, fontSize: "9px", color: "#777777" }}>Authorised by</p>
        </div>
        <div style={{ flex: 1, borderTop: "1px solid #BBBBBB", paddingTop: "5px" }}>
          <p style={{ margin: 0, fontSize: "9px", color: "#777777" }}>Date</p>
        </div>
      </div>
    </PrintShell>
  );
};

export default PurchaseOrderPrint;
