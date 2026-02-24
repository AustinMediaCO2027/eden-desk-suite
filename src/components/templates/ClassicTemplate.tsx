import { Profile } from "@/hooks/useProfile";
import { LineItem, calculateTotals } from "@/lib/document-utils";

export interface TemplateProps {
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

const ClassicTemplate = ({ type, profile, documentNumber, date, dueDate, clientName, clientEmail, clientAddress, items, taxRate, notes, colorOverride }: TemplateProps) => {
  const { subtotal, taxAmount, total } = calculateTotals(items, taxRate);
  const brandColor = colorOverride || profile?.brand_color || "#1A5276";
  const title = type === "invoice" ? "INVOICE" : "QUOTE";

  return (
    <div className="bg-white text-black w-[210mm] mx-auto flex flex-col" style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif", height: "297mm", overflow: "hidden" }}>
      {/* Top accent bar */}
      <div className="h-2 w-full" style={{ backgroundColor: brandColor }} />

      <div className="px-10 pt-8 pb-6">
        {/* Header: Logo + Company left, Title right */}
        <div className="flex justify-between items-start mb-10">
          <div>
            {profile?.logo_url && <img src={profile.logo_url} alt="Logo" className="h-14 mb-2 object-contain" />}
            <h2 className="text-base font-bold text-gray-900">{profile?.company_name || "Your Company"}</h2>
            {profile?.company_address && <p className="text-xs text-gray-500 mt-0.5">{profile.company_address}</p>}
          </div>
          <div className="text-right">
            <h1 className="text-4xl font-black tracking-tight" style={{ color: brandColor }}>{title}</h1>
            <p className="text-sm text-gray-500 mt-2">Number: {documentNumber}</p>
            <p className="text-sm text-gray-500">Date: {date}</p>
            {type === "invoice" && dueDate && <p className="text-sm text-gray-500">Due: {dueDate}</p>}
          </div>
        </div>

        {/* Bill To + Bank Details */}
        <div className="flex justify-between mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">{type === "invoice" ? "PAYABLE TO" : "QUOTE FOR"}</p>
            <p className="text-sm font-semibold text-gray-900">{clientName}</p>
            {clientEmail && <p className="text-xs text-gray-500">{clientEmail}</p>}
            {clientAddress && <p className="text-xs text-gray-500 whitespace-pre-line">{clientAddress}</p>}

            {type === "invoice" && profile?.bank_name && (
              <div className="mt-4">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">BANK DETAILS</p>
                <p className="text-xs text-gray-600">{profile.bank_name}</p>
                <p className="text-xs text-gray-600">{profile.bank_account_holder}</p>
                <p className="text-xs text-gray-600">Acc: {profile.bank_account_number}</p>
                <p className="text-xs text-gray-600">Branch: {profile.bank_branch_code}</p>
                {profile.bank_account_type && <p className="text-xs text-gray-600">Type: {profile.bank_account_type}</p>}
              </div>
            )}
          </div>
          <div className="text-right text-xs text-gray-500 max-w-[200px]">
            {(profile?.registration_number || profile?.vat_number) && (
              <div className="mb-2">
                {profile?.registration_number && <p>Reg: {profile.registration_number}</p>}
                {profile?.vat_number && <p>VAT: {profile.vat_number}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-6 text-sm">
          <thead>
            <tr>
              <th className="text-left py-3 px-4 font-bold text-white text-xs uppercase tracking-wider rounded-l-md" style={{ backgroundColor: brandColor }}>Item Description</th>
              <th className="text-center py-3 px-3 font-bold text-white text-xs uppercase tracking-wider w-16" style={{ backgroundColor: brandColor }}>Qty</th>
              <th className="text-right py-3 px-3 font-bold text-white text-xs uppercase tracking-wider w-24" style={{ backgroundColor: brandColor }}>Price</th>
              <th className="text-right py-3 px-4 font-bold text-white text-xs uppercase tracking-wider w-24 rounded-r-md" style={{ backgroundColor: brandColor }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-3 px-4">
                  <p className="text-gray-800">{item.description}</p>
                  {item.details && <p className="text-[11px] text-gray-400 mt-0.5">{item.details}</p>}
                </td>
                <td className="py-3 px-3 text-center text-gray-600">{item.quantity}</td>
                <td className="py-3 px-3 text-right text-gray-600">R{Number(item.rate).toFixed(2)}</td>
                <td className="py-3 px-4 text-right text-gray-800 font-medium">R{Number(item.amount).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Notes + Totals side by side */}
        <div className="flex justify-between items-start mb-10">
          <div className="max-w-[55%]">
            {notes && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Notes:</p>
                <p className="text-xs text-gray-500 whitespace-pre-line leading-relaxed">{notes}</p>
              </div>
            )}
          </div>
          <div className="w-56">
            <div className="flex justify-between text-sm py-1.5"><span className="font-bold text-gray-700">SUB TOTAL</span><span className="text-gray-700">R{subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm py-1.5"><span className="font-bold text-gray-700">TAX ({taxRate}%)</span><span className="text-gray-700">R{taxAmount.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm py-2.5 px-3 mt-1 rounded font-black text-white" style={{ backgroundColor: brandColor }}>
              <span>GRAND TOTAL</span><span>R{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto">
        <div className="mx-10 border-t border-gray-200 pt-4 pb-4 flex justify-center gap-8 text-xs text-gray-500">
          {profile?.company_website && <span>{profile.company_website}</span>}
          {profile?.company_phone && <span>{profile.company_phone}</span>}
          {profile?.company_email && <span>{profile.company_email}</span>}
        </div>
        <div className="h-2 w-full" style={{ backgroundColor: brandColor }} />
      </div>
    </div>
  );
};

export default ClassicTemplate;

