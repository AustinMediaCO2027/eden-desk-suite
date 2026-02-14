import { Profile } from "@/hooks/useProfile";

export interface LetterheadTemplateProps {
  profile: Profile | null;
  recipientName: string;
  recipientTitle: string;
  recipientCompany: string;
  recipientAddress: string;
  recipientPhone: string;
  recipientEmail: string;
  date: string;
  subject: string;
  body: string;
  closing: string;
  senderName: string;
  senderTitle: string;
  colorOverride?: string;
}

export const LETTERHEAD_TEMPLATES = [
  { value: "classic", label: "Classic", desc: "Logo left, title right. Blue accent. Clean footer with contact icons." },
  { value: "corporate", label: "Corporate", desc: "Bold logo header with horizontal rule. Orange accent wave footer." },
  { value: "executive", label: "Executive", desc: "Dark header band with logo and contact. Formal professional style." },
];

export const LETTERHEAD_COLORS = [
  { value: "#1A5276", label: "Blue" },
  { value: "#1A1A1A", label: "Black" },
  { value: "#1E6B4A", label: "Green" },
  { value: "#9B2C5E", label: "Pink" },
  { value: "#6B4226", label: "Brown" },
];
