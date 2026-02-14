import { Profile } from "@/hooks/useProfile";
import { LineItem } from "@/lib/document-utils";
import ClassicTemplate from "./ClassicTemplate";
import ModernTemplate from "./ModernTemplate";
import MinimalTemplate from "./MinimalTemplate";
import BoldTemplate from "./BoldTemplate";
import ElegantTemplate from "./ElegantTemplate";
import CreativeTemplate from "./CreativeTemplate";
import type { TemplateProps } from "./ClassicTemplate";

export const TEMPLATE_OPTIONS = [
  { value: "classic", label: "Classic", desc: "Logo left, details right. Traditional corporate layout." },
  { value: "modern", label: "Modern", desc: "Brand color banner. Centered logo. Bold headers." },
  { value: "minimal", label: "Minimal", desc: "Ultra clean. Thin lines. Light typography." },
  { value: "bold", label: "Bold", desc: "Dark header block. Strong brand presence. High contrast." },
  { value: "elegant", label: "Elegant", desc: "Serif typography. Refined borders. Sophisticated feel." },
  { value: "creative", label: "Creative", desc: "Side color bar. Asymmetric layout. Standout design." },
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
}

const DocumentPreview = ({ id, templateStyle, ...rest }: DocumentPreviewProps) => {
  const style = templateStyle || "classic";
  const props: TemplateProps = rest;

  const renderTemplate = () => {
    switch (style) {
      case "modern": return <ModernTemplate {...props} />;
      case "minimal": return <MinimalTemplate {...props} />;
      case "bold": return <BoldTemplate {...props} />;
      case "elegant": return <ElegantTemplate {...props} />;
      case "creative": return <CreativeTemplate {...props} />;
      default: return <ClassicTemplate {...props} />;
    }
  };

  return <div id={id}>{renderTemplate()}</div>;
};

export default DocumentPreview;
