import type { CSSProperties } from "react";
import type { Profile } from "@/hooks/useProfile";
import PrintShell from "@/components/print/PrintShell";
import { formatDisplayDate, formatMoney } from "@/lib/accounting-utils";
import type { StatementResult } from "@/lib/statements";

export interface StatementPrintProps {
  profile: Profile | null;
  clientName: string;
  clientEmail?: string | null;
  clientAddress?: string | null;
  fromDate: string;
  toDate: string;
  statement: StatementResult;
  currencySymbol?: string;
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
  padding: "7px 10px",
  fontSize: "11px",
  borderBottom: "1px solid #EDEDED",
  verticalAlign: "top",
};

const StatementPrint = ({
  profile,
  clientName,
  clientEmail,
  clientAddress,
  fromDate,
  toDate,
  statement,
  currencySymbol = "R",
  accent,
  generatedBy,
}: StatementPrintProps) => {
  const color = accent || profile?.brand_color || "#1A1A1A";

  return (
    <PrintShell
      profile={profile}
      title="CLIENT STATEMENT"
      accent={color}
      generatedBy={generatedBy}
      subtitle={`${formatDisplayDate(fromDate)} — ${formatDisplayDate(toDate)}`}
      meta={[
        { label: "Client", value: clientName },
        { label: "Closing Balance", value: formatMoney(statement.closingBalance, currencySymbol) },
      ]}
    >
      <div style={{ display: "flex", gap: "20px", marginBottom: "18px" }}>
        <div style={{ flex: 1, backgroundColor: "#F7F7F7", padding: "12px 14px", borderRadius: "6px" }}>
          <p style={{ margin: 0, fontSize: "9px", letterSpacing: "0.6px", color: "#777777", fontWeight: 700 }}>STATEMENT FOR</p>
          <p style={{ margin: "6px 0 0", fontSize: "13px", fontWeight: 700 }}>{clientName}</p>
          {clientAddress ? (
            <p style={{ margin: "3px 0 0", fontSize: "10px", color: "#555555", whiteSpace: "pre-line", lineHeight: 1.4 }}>
              {clientAddress}
            </p>
          ) : null}
          {clientEmail ? <p style={{ margin: "3px 0 0", fontSize: "10px", color: "#555555" }}>{clientEmail}</p> : null}
        </div>
        <div style={{ flex: 1, backgroundColor: "#F7F7F7", padding: "12px 14px", borderRadius: "6px" }}>
          <p style={{ margin: 0, fontSize: "9px", letterSpacing: "0.6px", color: "#777777", fontWeight: 700 }}>SUMMARY</p>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "6px" }}>
            <tbody>
              {[
                { label: "Opening balance", value: statement.openingBalance },
                { label: "Invoiced", value: statement.totalInvoiced },
                { label: "Payments received", value: -statement.totalPaid },
                { label: "Credit notes", value: -statement.totalCredited },
              ].map((row) => (
                <tr key={row.label}>
                  <td style={{ fontSize: "10px", color: "#555555", padding: "2px 0" }}>{row.label}</td>
                  <td style={{ fontSize: "10px", padding: "2px 0", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                    {formatMoney(row.value, currencySymbol)}
                  </td>
                </tr>
              ))}
              <tr>
                <td style={{ fontSize: "11px", fontWeight: 700, padding: "6px 0 0", borderTop: "1px solid #DDDDDD" }}>
                  Closing balance
                </td>
                <td
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "6px 0 0",
                    textAlign: "right",
                    borderTop: "1px solid #DDDDDD",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {formatMoney(statement.closingBalance, currencySymbol)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
        <thead>
          <tr style={{ backgroundColor: color }}>
            <th style={{ ...th, width: "14%" }}>Date</th>
            <th style={{ ...th, width: "14%" }}>Type</th>
            <th style={{ ...th, width: "16%" }}>Reference</th>
            <th style={{ ...th, width: "22%" }}>Description</th>
            <th style={{ ...th, width: "11%", textAlign: "right" }}>Debit</th>
            <th style={{ ...th, width: "11%", textAlign: "right" }}>Credit</th>
            <th style={{ ...th, width: "12%", textAlign: "right" }}>Balance</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ backgroundColor: "#FAFAFA" }}>
            <td style={{ ...td, fontWeight: 600 }}>{formatDisplayDate(fromDate)}</td>
            <td style={{ ...td, fontWeight: 600 }} colSpan={3}>
              Opening Balance
            </td>
            <td style={{ ...td, textAlign: "right" }}>—</td>
            <td style={{ ...td, textAlign: "right" }}>—</td>
            <td style={{ ...td, textAlign: "right", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
              {formatMoney(statement.openingBalance, currencySymbol)}
            </td>
          </tr>
          {statement.lines.map((line, index) => (
            <tr key={`${line.type}-${line.reference}-${index}`}>
              <td style={td}>{formatDisplayDate(line.date)}</td>
              <td style={td}>{line.type}</td>
              <td style={td}>{line.reference}</td>
              <td style={td}>{line.description}</td>
              <td style={{ ...td, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                {line.debit ? formatMoney(line.debit, currencySymbol) : "—"}
              </td>
              <td style={{ ...td, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                {line.credit ? formatMoney(line.credit, currencySymbol) : "—"}
              </td>
              <td style={{ ...td, textAlign: "right", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                {formatMoney(line.balance, currencySymbol)}
              </td>
            </tr>
          ))}
          {statement.lines.length === 0 ? (
            <tr>
              <td style={{ ...td, textAlign: "center", color: "#888888" }} colSpan={7}>
                No transactions in this period.
              </td>
            </tr>
          ) : null}
          <tr style={{ backgroundColor: color }}>
            <td style={{ ...td, color: "#ffffff", fontWeight: 700, borderBottom: "none" }} colSpan={6}>
              Closing Balance
            </td>
            <td
              style={{
                ...td,
                color: "#ffffff",
                fontWeight: 700,
                textAlign: "right",
                borderBottom: "none",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {formatMoney(statement.closingBalance, currencySymbol)}
            </td>
          </tr>
        </tbody>
      </table>

      {profile?.bank_name ? (
        <div style={{ marginTop: "22px" }}>
          <p style={{ margin: 0, fontSize: "9px", letterSpacing: "0.6px", color: "#777777", fontWeight: 700 }}>BANKING DETAILS</p>
          <p style={{ margin: "5px 0 0", fontSize: "10px", color: "#555555", lineHeight: 1.5 }}>
            {profile.bank_name}
            {profile.bank_account_holder ? ` · ${profile.bank_account_holder}` : ""}
            {profile.bank_account_number ? ` · Acc ${profile.bank_account_number}` : ""}
            {profile.bank_branch_code ? ` · Branch ${profile.bank_branch_code}` : ""}
            {profile.bank_account_type ? ` · ${profile.bank_account_type}` : ""}
          </p>
        </div>
      ) : null}
    </PrintShell>
  );
};

export default StatementPrint;
