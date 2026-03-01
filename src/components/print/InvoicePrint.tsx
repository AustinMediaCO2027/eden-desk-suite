import { forwardRef } from "react";
import type { Profile } from "@/hooks/useProfile";
import type { LineItem } from "@/lib/document-utils";
import InvoiceTemplate1 from "@/components/invoices/InvoiceTemplate1";
import InvoiceTemplate2 from "@/components/invoices/InvoiceTemplate2";
import InvoiceTemplate3 from "@/components/invoices/InvoiceTemplate3";
import InvoiceTemplate4 from "@/components/invoices/InvoiceTemplate4";

interface InvoicePrintProps {
  profile: Profile | null;
  templateStyle?: string;
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

/**
 * InvoicePrint – delegates to the selected invoice template.
 * This is the single entry point used by DocumentPreview and the PDF pipeline.
 */
const InvoicePrint = forwardRef<HTMLDivElement, InvoicePrintProps>(
  ({ templateStyle = "template1", ...props }, ref) => {
    const commonProps = { ...props, ref };

    switch (templateStyle) {
      case "template2":
        return <InvoiceTemplate2 {...commonProps} />;
      case "template3":
        return <InvoiceTemplate3 {...commonProps} />;
      case "template4":
        return <InvoiceTemplate4 {...commonProps} />;
      case "template1":
      default:
        return <InvoiceTemplate1 {...commonProps} />;
    }
  }
);

InvoicePrint.displayName = "InvoicePrint";

export default InvoicePrint;
