import { calculateTotals } from "@/lib/document-utils";
import type { TemplateProps } from "./ClassicTemplate";

const BoldTemplate = ({ type, profile, documentNumber, date, dueDate, clientName, clientEmail, clientAddress, items, taxRate, notes }: TemplateProps) => {
  const { subtotal, taxAmount, total } = calculateTotals(items, taxRate);
  const brandColor = profile?.brand_color || "#2563EB";
  const title = type === "invoice" ? "INVOICE" : "QUOTE";

  return (
    <div className="bg-white text-black max-w-[210mm] mx-auto" style={{ fontFamily: "Inter, sans-serif", minHeight: "297mm" }}>
      <div className="px-10 pt-10 pb-8" style={{ backgroundColor: brandColor }}>
        <div className="flex justify-between items-start">
          <div>
            {profile?.logo_url && <img src={profile.logo_url} alt="Logo" className="h-12 mb-3 object-contain brightness-0 invert" />}
            <h2 className="text-lg font-bold text-white">{profile?.company_name || "Your Company"}</h2>
            <p className="text-xs text-white/70 mt-1">{profile?.company_address}</p>
            <p className="text-xs text-white/70">{profile?.company_email} {profile?.company_phone && `• ${profile.company_phone}`}</p>
          </div>
          <div className="text-right">
            <h1 className="text-4xl font-black text-white tracking-tight">{title}</h1>
            <p className="text-sm text-white/80 mt-2 font-medium">#{documentNumber}</p>
          </div>
        </div>
      </div>

      <div className="px-10 py-8">
        <div className="flex justify-between mb-8">
          <div className="space-y-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Issue Date</p>
              <p className="text-sm font-medium text-gray-900">{date}</p>
            </div>
            {type === "invoice" && dueDate && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Due Date</p>
                <p className="text-sm font-medium text-gray-900">{dueDate}</p>
              </div>
            )}
            {(profile?.registration_number || profile?.vat_number) && (
              <div className="text-xs text-gray-400">
                {profile?.registration_number && <p>Reg: {profile.registration_number}</p>}
                {profile?.vat_number && <p>VAT: {profile.vat_number}</p>}
              </div>
            )}
          </div>
          <div className="text-right max-w-[220px]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Bill To</p>
            <p className="text-sm font-bold text-gray-900">{clientName}</p>
            <p className="text-xs text-gray-500">{clientEmail}</p>
            <p className="text-xs text-gray-500 whitespace-pre-line">{clientAddress}</p>
          </div>
        </div>

        <table className="w-full mb-6 text-sm">
          <thead>
            <tr className="border-b-2" style={{ borderColor: brandColor }}>
              <th className="text-left py-3 font-bold text-gray-900 text-xs uppercase tracking-wider">Description</th>
              <th className="text-center py-3 font-bold text-gray-900 text-xs uppercase tracking-wider w-16">Qty</th>
              <th className="text-right py-3 font-bold text-gray-900 text-xs uppercase tracking-wider w-24">Rate</th>
              <th className="text-right py-3 font-bold text-gray-900 text-xs uppercase tracking-wider w-16">Tax</th>
              <th className="text-right py-3 font-bold text-gray-900 text-xs uppercase tracking-wider w-24">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-3">
                  <p className="text-gray-800">{item.description}</p>
                  {item.details && <p className="text-xs text-gray-400 mt-0.5">{item.details}</p>}
                </td>
                <td className="py-3 text-center text-gray-600">{item.quantity}</td>
                <td className="py-3 text-right text-gray-600">R{Number(item.rate).toFixed(2)}</td>
                <td className="py-3 text-right text-gray-600">{taxRate}%</td>
                <td className="py-3 text-right text-gray-800 font-medium">R{Number(item.amount).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="flex justify-between text-sm py-1.5 text-gray-500"><span>Subtotal</span><span>R{subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm py-1.5 text-gray-500"><span>Tax ({taxRate}%)</span><span>R{taxAmount.toFixed(2)}</span></div>
            <div className="flex justify-between py-3 px-4 mt-2 rounded-lg text-lg font-black text-white" style={{ backgroundColor: brandColor }}>
              <span>TOTAL</span><span>R{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {type === "invoice" && profile?.bank_name && (
          <div className="border-l-4 pl-4 mb-6" style={{ borderColor: brandColor }}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Banking Details</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
              <p className="text-gray-500">Bank: <span className="text-gray-800 font-medium">{profile.bank_name}</span></p>
              <p className="text-gray-500">Holder: <span className="text-gray-800 font-medium">{profile.bank_account_holder}</span></p>
              <p className="text-gray-500">Account: <span className="text-gray-800 font-medium">{profile.bank_account_number}</span></p>
              <p className="text-gray-500">Branch: <span className="text-gray-800 font-medium">{profile.bank_branch_code}</span></p>
              {profile.bank_account_type && <p className="text-gray-500">Type: <span className="text-gray-800 font-medium">{profile.bank_account_type}</span></p>}
            </div>
          </div>
        )}

        {notes && (
          <div className="mb-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Notes</p>
            <p className="text-sm text-gray-600 whitespace-pre-line">{notes}</p>
          </div>
        )}

        <div className="mt-auto pt-8 text-center">
          <p className="text-xs text-gray-400">Thank you for your business.</p>
        </div>
      </div>
    </div>
  );
};

export default BoldTemplate;
