import { forwardRef } from "react";
import type { Profile } from "@/hooks/useProfile";
import type { LineItem } from "@/lib/document-utils";
import QuoteTemplate1 from "@/components/quotes/QuoteTemplate1";
import QuoteTemplate2 from "@/components/quotes/QuoteTemplate2";
import QuoteTemplate3 from "@/components/quotes/QuoteTemplate3";
import QuoteTemplate4 from "@/components/quotes/QuoteTemplate4";

interface QuotePrintProps {
  profile: Profile | null;
  templateStyle?: string;
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

/**
 * QuotePrint – delegates to the selected quote template.
 * Single entry point used by DocumentPreview and the PDF pipeline.
 */
const QuotePrint = forwardRef<HTMLDivElement, QuotePrintProps>(
  ({ templateStyle = "template1", ...props }, ref) => {
    const commonProps = { ...props, ref };

    switch (templateStyle) {
      case "template2":
        return <QuoteTemplate2 {...commonProps} />;
      case "template3":
        return <QuoteTemplate3 {...commonProps} />;
      case "template4":
        return <QuoteTemplate4 {...commonProps} />;
      case "template1":
      default:
        return <QuoteTemplate1 {...commonProps} />;
    }
  }
);

QuotePrint.displayName = "QuotePrint";

export default QuotePrint;
