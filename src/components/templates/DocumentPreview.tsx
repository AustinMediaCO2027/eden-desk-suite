import { forwardRef } from "react";
import { Profile } from "@/hooks/useProfile";
import { LineItem } from "@/lib/document-utils";
import InvoicePrint from "@/components/print/InvoicePrint";
import QuotePrint from "@/components/print/QuotePrint";
import ScaledPage from "@/components/templates/ScaledPage";
import { A4_CANVAS_STYLE } from "@/components/templates/a4";



export const INVOICE_TEMPLATE_OPTIONS = [
  { value: "template1", label: "Executive", desc: "Warm accent, logo header, billing card" },
  { value: "template2", label: "Modern", desc: "Blue metadata bar, total due highlight" },
  { value: "template3", label: "Classic", desc: "Sidebar metadata, bordered table card" },
  { value: "template4", label: "Creative", desc: "Serif title, accent border, bank details" },
  { value: "template5", label: "Corporate", desc: "Clean layout, payment instructions footer" },
  { value: "template6", label: "Digital", desc: "Card-based, gray bg, modern feel" },
  { value: "template7", label: "Natural", desc: "Olive header band, warm bg, signature line" },
];

export const QUOTE_TEMPLATE_OPTIONS = [
  { value: "template1", label: "Executive", desc: "Warm accent, logo header, billing card" },
  { value: "template2", label: "Modern", desc: "Blue metadata bar, total highlight" },
  { value: "template3", label: "Classic", desc: "Sidebar metadata, bordered table card" },
  { value: "template4", label: "Creative", desc: "Serif title, accent border, editorial" },
  { value: "template5", label: "Bold Minimal", desc: "Black & white, bold header band, monogram" },
];

export const TEMPLATE_OPTIONS = INVOICE_TEMPLATE_OPTIONS;

export const COLOR_OPTIONS = [
  { value: "#1A1A1A", label: "Black" },
  { value: "#1A5276", label: "Blue" },
  { value: "#1E6B4A", label: "Green" },
  { value: "#9B2C5E", label: "Pink" },
  { value: "#6B4226", label: "Brown" },
  { value: "#1B2A4A", label: "Navy" },
  { value: "#DC2626", label: "Red" },
  { value: "#6B1D1D", label: "Maroon" },
  { value: "#B8860B", label: "Gold" },
  { value: "#4B5563", label: "Grey" },
  { value: "#7C3AED", label: "Purple" },
  { value: "#0891B2", label: "Teal" },
];




interface DocumentPreviewProps {
  id: string;
  templateStyle?: string;
  type: "invoice" | "quote";
  profile: Profile | null;
  documentNumber: string;
  date: string;
  dueDate?: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  items: LineItem[];
  taxRate: number;
  notes: string;
  status: string;
  colorOverride?: string;
}

const DocumentPreview = forwardRef<HTMLDivElement, DocumentPreviewProps>(
  ({ id, templateStyle = "classic", ...props }, ref) => {
    return (
      <ScaledPage>
        <div id={id} ref={ref} style={PREVIEW_CANVAS_STYLE}>
          {props.type === "invoice" ? (
            <InvoicePrint
              templateStyle={templateStyle}
              profile={props.profile}
              documentNumber={props.documentNumber}
              date={props.date}
              dueDate={props.dueDate}
              clientName={props.clientName}
              clientEmail={props.clientEmail}
              clientAddress={props.clientAddress}
              items={props.items}
              taxRate={props.taxRate}
              notes={props.notes}
              status={props.status}
              colorOverride={props.colorOverride}
            />
          ) : (
            <QuotePrint
              templateStyle={templateStyle}
              profile={props.profile}
              documentNumber={props.documentNumber}
              date={props.date}
              clientName={props.clientName}
              clientEmail={props.clientEmail}
              clientAddress={props.clientAddress}
              items={props.items}
              taxRate={props.taxRate}
              notes={props.notes}
              status={props.status}
              colorOverride={props.colorOverride}
            />
          )}
        </div>
      </ScaledPage>
    );
  }
);


DocumentPreview.displayName = "DocumentPreview";

export default DocumentPreview;

