import { Profile } from "@/hooks/useProfile";
import { LineItem, calculateTotals } from "@/lib/document-utils";

interface TemplateProps {
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

const ClassicTemplate = ({ type, profile, documentNumber, date, dueDate, clientName, clientEmail, clientAddress, items, taxRate, notes }: TemplateProps) => {
  const { subtotal, taxAmount, total } = calculateTotals(items, taxRate);
  const brandColor = profile?.brand_color || "#2563EB";
  const title = type === "invoice" ? "INVOICE" : "QUOTE";

  return (
    <div className="bg-white text-black p-10 max-w-[210mm] mx-auto" style={{ fontFamily: "Inter, sans-serif", minHeight: "297mm" }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div>
          {profile?.logo_url && <img src={profile.logo_url} alt="Logo" className="h-14 mb-3 object-contain" />}
        </div>
        <div className="text-right">
          <h2 className="text-lg font-bold text-gray-900">{profile?.company_name || "Your Company"}</h2>
          {profile?.registration_number && <p className="text-xs text-gray-500">Reg: {profile.registration_number}</p>}
          {profile?.vat_number && <p className="text-xs text-gray-500">VAT: {profile.vat_number}</p>}
          <p className="text-xs text-gray-500 mt-1">{profile?.company_address}</p>
          <p className="text-xs text-gray-500">{profile?.company_phone}</p>
          <p className="text-xs text-gray-500">{profile?.company_email}</p>
          {profile?.company_website && <p className="text-xs text-gray-500">{profile.company_website}</p>}
        </div>
      </div>

      {/* Brand divider */}
      <div className="h-[2px] w-full my-6" style={{ backgroundColor: brandColor }} />

      {/* Document title + Bill To */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-wide" style={{ color: brandColor }}>{title}</h1>
          <div className="mt-2 space-y-0.5 text-sm text-gray-600">
            <p><span className="font-medium text-gray-800">{title} #:</span> {documentNumber}</p>
            <p><span className="font-medium text-gray-800">Date:</span> {date}</p>
            {type === "invoice" && dueDate && <p><span className="font-medium text-gray-800">Due Date:</span> {dueDate}</p>}
          </div>
        </div>
        <div className="text-right max-w-[200px]">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Bill To</p>
          <p className="text-sm font-semibold text-gray-900">{clientName}</p>
          <p className="text-xs text-gray-500">{clientEmail}</p>
          <p className="text-xs text-gray-500 whitespace-pre-line">{clientAddress}</p>
        </div>
      </div>

      {/* Items table */}
      <table className="w-full mb-6 text-sm">
        <thead>
          <tr style={{ backgroundColor: `${brandColor}10` }}>
            <th className="text-left py-2.5 px-3 font-semibold text-gray-700 rounded-l-md">Description</th>
            <th className="text-center py-2.5 px-3 font-semibold text-gray-700 w-20">Qty</th>
            <th className="text-right py-2.5 px-3 font-semibold text-gray-700 w-28">Unit Price</th>
            <th className="text-right py-2.5 px-3 font-semibold text-gray-700 w-20">Tax</th>
            <th className="text-right py-2.5 px-3 font-semibold text-gray-700 w-28 rounded-r-md">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} className="border-b border-gray-100">
              <td className="py-2.5 px-3">
                <p className="text-gray-800">{item.description}</p>
                {item.details && <p className="text-xs text-gray-400 mt-0.5">{item.details}</p>}
              </td>
              <td className="py-2.5 px-3 text-center text-gray-600">{item.quantity}</td>
              <td className="py-2.5 px-3 text-right text-gray-600">R{Number(item.rate).toFixed(2)}</td>
              <td className="py-2.5 px-3 text-right text-gray-600">{taxRate}%</td>
              <td className="py-2.5 px-3 text-right text-gray-800 font-medium">R{Number(item.amount).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between text-sm py-1.5 text-gray-600"><span>Subtotal</span><span>R{subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between text-sm py-1.5 text-gray-600"><span>Tax ({taxRate}%)</span><span>R{taxAmount.toFixed(2)}</span></div>
          <div className="h-[1px] my-1" style={{ backgroundColor: brandColor }} />
          <div className="flex justify-between py-2 text-lg font-bold" style={{ color: brandColor }}><span>Total</span><span>R{total.toFixed(2)}</span></div>
        </div>
      </div>

      {/* Banking Details (Invoice only) */}
      {type === "invoice" && profile?.bank_name && (
        <div className="border border-gray-200 rounded-lg p-4 mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Banking Details</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
            <p className="text-gray-500">Bank: <span className="text-gray-800 font-medium">{profile.bank_name}</span></p>
            <p className="text-gray-500">Account Holder: <span className="text-gray-800 font-medium">{profile.bank_account_holder}</span></p>
            <p className="text-gray-500">Account Number: <span className="text-gray-800 font-medium">{profile.bank_account_number}</span></p>
            <p className="text-gray-500">Branch Code: <span className="text-gray-800 font-medium">{profile.bank_branch_code}</span></p>
            {profile.bank_account_type && <p className="text-gray-500">Account Type: <span className="text-gray-800 font-medium">{profile.bank_account_type}</span></p>}
          </div>
        </div>
      )}

      {/* Notes */}
      {notes && (
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Notes</p>
          <p className="text-sm text-gray-600 whitespace-pre-line">{notes}</p>
        </div>
      )}

      {/* Footer divider */}
      <div className="mt-auto pt-6">
        <div className="h-[1px] w-full mb-3" style={{ backgroundColor: brandColor }} />
        <p className="text-xs text-gray-400 text-center">Thank you for your business.</p>
      </div>
    </div>
  );
};

export default ClassicTemplate;
export type { TemplateProps };
