import { forwardRef, type CSSProperties } from "react";
import { Profile } from "@/hooks/useProfile";
import { LineItem } from "@/lib/document-utils";
import InvoicePrint from "@/components/print/InvoicePrint";
import QuotePrint from "@/components/print/QuotePrint";

export const INVOICE_TEMPLATE_OPTIONS = [
  { value: "template1", label: "Executive", desc: "Warm accent, logo header, billing card" },
  { value: "template2", label: "Modern", desc: "Blue metadata bar, total due highlight" },
  { value: "template3", label: "Classic", desc: "Sidebar metadata, bordered table card" },
  { value: "template4", label: "Creative", desc: "Serif title, accent border, bank details" },
];

export const QUOTE_TEMPLATE_OPTIONS = [
  { value: "classic", label: "Classic", desc: "Professional print layout" },
  { value: "modern", label: "Modern", desc: "Professional print layout" },
  { value: "minimal", label: "Minimal", desc: "Professional print layout" },
  { value: "bold", label: "Bold", desc: "Professional print layout" },
  { value: "elegant", label: "Elegant", desc: "Professional print layout" },
  { value: "creative", label: "Creative", desc: "Professional print layout" },
  { value: "freelancer", label: "Freelancer", desc: "Professional print layout" },
  { value: "accounteer", label: "Accounteer", desc: "Professional print layout" },
  { value: "corporate-detail", label: "Corporate Detail", desc: "Professional print layout" },
  { value: "sidebar", label: "Sidebar", desc: "Professional print layout" },
];

export const TEMPLATE_OPTIONS = INVOICE_TEMPLATE_OPTIONS;

export const COLOR_OPTIONS = [
  { value: "#1A1A1A", label: "Black" },
  { value: "#1A5276", label: "Blue" },
  { value: "#1E6B4A", label: "Green" },
  { value: "#9B2C5E", label: "Pink" },
  { value: "#6B4226", label: "Brown" },
];

const PREVIEW_CANVAS_STYLE: CSSProperties = {
  width: "210mm",
  minWidth: "210mm",
  height: "297mm",
  overflow: "hidden",
  backgroundColor: "white",
  boxSizing: "border-box",
  margin: "0 auto",
};

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
    );
  }
);

DocumentPreview.displayName = "DocumentPreview";

export default DocumentPreview;

