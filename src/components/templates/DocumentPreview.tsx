import { Profile } from "@/hooks/useProfile";
import { LineItem } from "@/lib/document-utils";
import ClassicTemplate from "./ClassicTemplate";
import ModernTemplate from "./ModernTemplate";
import MinimalTemplate from "./MinimalTemplate";
import BoldTemplate from "./BoldTemplate";
import ElegantTemplate from "./ElegantTemplate";
import CreativeTemplate from "./CreativeTemplate";
import FreelancerTemplate from "./FreelancerTemplate";
import AccounteerTemplate from "./AccounteerTemplate";
import CorporateDetailTemplate from "./CorporateDetailTemplate";
import SidebarTemplate from "./SidebarTemplate";
import type { TemplateProps } from "./ClassicTemplate";

export const TEMPLATE_OPTIONS = [
  { value: "classic", label: "Classic", desc: "Clean corporate layout with colored header bar and side-by-side details." },
  { value: "modern", label: "Modern", desc: "Minimalist black & white with bold table headers." },
  { value: "minimal", label: "Minimal", desc: "Ultra clean. Light typography. Maximum whitespace." },
  { value: "bold", label: "Bold", desc: "Full-width colored header. High contrast. Strong brand." },
  { value: "elegant", label: "Elegant", desc: "Serif accents. Refined borders. Sophisticated feel." },
  { value: "creative", label: "Creative", desc: "Side accent bar. Asymmetric layout. Standout design." },
  { value: "freelancer", label: "Freelancer", desc: "Clean Mular-style layout. Green accents. Professional freelancer feel." },
  { value: "accounteer", label: "Accounteer", desc: "Circle bullets. Client details with dates. Account details & note footer." },
  { value: "corporate-detail", label: "Corporate Detail", desc: "Centered logo. Client info & details boxes. Detailed items with descriptions." },
  { value: "sidebar", label: "Sidebar", desc: "Vertical colored sidebar. Invoice details prominent. Bill To & Client Details split." },
];

export const COLOR_OPTIONS = [
  { value: "#1A1A1A", label: "Black" },
  { value: "#1A5276", label: "Blue" },
  { value: "#1E6B4A", label: "Green" },
  { value: "#9B2C5E", label: "Pink" },
  { value: "#6B4226", label: "Brown" },
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

const DocumentPreview = ({ id, templateStyle, colorOverride, ...rest }: DocumentPreviewProps) => {
  const style = templateStyle || "classic";
  const props: TemplateProps = { ...rest, colorOverride };

  const renderTemplate = () => {
    switch (style) {
      case "modern": return <ModernTemplate {...props} />;
      case "minimal": return <MinimalTemplate {...props} />;
      case "bold": return <BoldTemplate {...props} />;
      case "elegant": return <ElegantTemplate {...props} />;
      case "creative": return <CreativeTemplate {...props} />;
      case "freelancer": return <FreelancerTemplate {...props} />;
      case "accounteer": return <AccounteerTemplate {...props} />;
      case "corporate-detail": return <CorporateDetailTemplate {...props} />;
      case "sidebar": return <SidebarTemplate {...props} />;
      default: return <ClassicTemplate {...props} />;
    }
  };

  return <div id={id}>{renderTemplate()}</div>;
};

export default DocumentPreview;
