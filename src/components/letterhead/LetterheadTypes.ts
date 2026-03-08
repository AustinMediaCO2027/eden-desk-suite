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
  signatureUrl?: string;
}

export const LETTERHEAD_COLORS = [
  { value: "#1A5276", label: "Blue" },
  { value: "#1A1A1A", label: "Black" },
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
