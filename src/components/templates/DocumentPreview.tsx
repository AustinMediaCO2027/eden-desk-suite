import type { CSSProperties } from "react";
import { Profile } from "@/hooks/useProfile";
import { LineItem } from "@/lib/document-utils";
import InvoicePrint from "@/components/print/InvoicePrint";
import QuotePrint from "@/components/print/QuotePrint";

export const TEMPLATE_OPTIONS = [
  { value: "classic", label: "Classic", desc: "Locked professional print layout" },
  { value: "modern", label: "Modern", desc: "Locked professional print layout" },
  { value: "minimal", label: "Minimal", desc: "Locked professional print layout" },
  { value: "bold", label: "Bold", desc: "Locked professional print layout" },
  { value: "elegant", label: "Elegant", desc: "Locked professional print layout" },
  { value: "creative", label: "Creative", desc: "Locked professional print layout" },
  { value: "freelancer", label: "Freelancer", desc: "Locked professional print layout" },
  { value: "accounteer", label: "Accounteer", desc: "Locked professional print layout" },
  { value: "corporate-detail", label: "Corporate Detail", desc: "Locked professional print layout" },
  { value: "sidebar", label: "Sidebar", desc: "Locked professional print layout" },
];

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

const DocumentPreview = ({ id, templateStyle: _templateStyle, ...props }: DocumentPreviewProps) => {
  return (
    <div id={id} style={PREVIEW_CANVAS_STYLE}>
      {props.type === "invoice" ? (
        <InvoicePrint
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
};

export default DocumentPreview;

