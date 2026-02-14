import { Profile } from "@/hooks/useProfile";
import { LineItem } from "@/lib/document-utils";
import ClassicTemplate from "./ClassicTemplate";
import ModernTemplate from "./ModernTemplate";
import MinimalTemplate from "./MinimalTemplate";
import type { TemplateProps } from "./ClassicTemplate";

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
}

const DocumentPreview = ({ id, templateStyle, ...rest }: DocumentPreviewProps) => {
  const style = templateStyle || "classic";
  const props: TemplateProps = rest;

  return (
    <div id={id}>
      {style === "modern" ? (
        <ModernTemplate {...props} />
      ) : style === "minimal" ? (
        <MinimalTemplate {...props} />
      ) : (
        <ClassicTemplate {...props} />
      )}
    </div>
  );
};

export default DocumentPreview;
