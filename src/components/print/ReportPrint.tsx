import type { CSSProperties } from "react";
import type { Profile } from "@/hooks/useProfile";
import PrintShell from "@/components/print/PrintShell";

export interface ReportColumn {
  key: string;
  label: string;
  align?: "left" | "right";
  width?: string;
}

export interface ReportSection {
  heading?: string;
  columns: ReportColumn[];
  rows: Record<string, string | number>[];
  totals?: Record<string, string | number>;
}

export interface ReportPrintProps {
  profile: Profile | null;
  title: string;
  subtitle?: string;
  meta?: { label: string; value: string }[];
  summary?: { label: string; value: string; emphasis?: boolean }[];
  sections: ReportSection[];
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
};

const td: CSSProperties = {
  padding: "7px 10px",
  fontSize: "11px",
  borderBottom: "1px solid #EDEDED",
  verticalAlign: "top",
};

const ReportPrint = ({
  profile,
  title,
  subtitle,
  meta = [],
  summary = [],
  sections,
  accent,
  generatedBy,
}: ReportPrintProps) => {
  const color = accent || profile?.brand_color || "#1A1A1A";

  return (
    <PrintShell profile={profile} title={title.toUpperCase()} subtitle={subtitle} meta={meta} accent={color} generatedBy={generatedBy}>
      {summary.length > 0 ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "18px" }}>
          {summary.map((card) => (
            <div
              key={card.label}
              style={{
                flex: "1 1 150px",
                backgroundColor: card.emphasis ? color : "#F7F7F7",
                color: card.emphasis ? "#ffffff" : "#1A1A1A",
                padding: "12px 14px",
                borderRadius: "6px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "9px",
                  letterSpacing: "0.5px",
                  fontWeight: 700,
                  color: card.emphasis ? "#EEEEEE" : "#777777",
                }}
              >
                {card.label.toUpperCase()}
              </p>
              <p style={{ margin: "6px 0 0", fontSize: "15px", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                {card.value}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {sections.map((section, sectionIndex) => (
        <div key={section.heading || `section-${sectionIndex}`} style={{ marginBottom: "22px" }}>
          {section.heading ? (
            <p style={{ margin: "0 0 8px", fontSize: "12px", fontWeight: 700 }}>{section.heading}</p>
          ) : null}
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <thead>
              <tr style={{ backgroundColor: color }}>
                {section.columns.map((column) => (
                  <th
                    key={column.key}
                    style={{ ...th, width: column.width, textAlign: column.align === "right" ? "right" : "left" }}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.rows.map((row, rowIndex) => (
                <tr key={`row-${rowIndex}`}>
                  {section.columns.map((column) => (
                    <td
                      key={column.key}
                      style={{
                        ...td,
                        textAlign: column.align === "right" ? "right" : "left",
                        fontVariantNumeric: column.align === "right" ? "tabular-nums" : "normal",
                      }}
                    >
                      {row[column.key] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))}
              {section.rows.length === 0 ? (
                <tr>
                  <td style={{ ...td, textAlign: "center", color: "#888888" }} colSpan={section.columns.length}>
                    No data for this period.
                  </td>
                </tr>
              ) : null}
              {section.totals ? (
                <tr style={{ backgroundColor: "#F2F2F2" }}>
                  {section.columns.map((column) => (
                    <td
                      key={column.key}
                      style={{
                        ...td,
                        fontWeight: 700,
                        borderBottom: "none",
                        textAlign: column.align === "right" ? "right" : "left",
                        fontVariantNumeric: column.align === "right" ? "tabular-nums" : "normal",
                      }}
                    >
                      {section.totals?.[column.key] ?? ""}
                    </td>
                  ))}
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ))}
    </PrintShell>
  );
};

export default ReportPrint;
