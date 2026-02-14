import { calculateTotals } from "@/lib/document-utils";
import type { TemplateProps } from "./ClassicTemplate";

const BoldTemplate = ({ type, profile, documentNumber, date, dueDate, clientName, clientEmail, clientAddress, items, taxRate, notes, colorOverride }: TemplateProps) => {
  const { subtotal, taxAmount, total } = calculateTotals(items, taxRate);
  const brandColor = colorOverride || profile?.brand_color || "#1A5276";
  const title = type === "invoice" ? "INVOICE" : "QUOTE";

  return (
    <div className="bg-white text-black max-w-[210mm] mx-auto" style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif", minHeight: "297mm" }}>
      {/* Full-width colored header */}
      <div className="px-10 pt-10 pb-8" style={{ backgroundColor: brandColor }}>
        <div className="flex justify-between items-start">
          <div>
            {profile?.logo_url && <img src={profile.logo_url} alt="Logo" className="h-12 mb-3 object-contain brightness-0 invert" />}
            <h2 className="text-lg font-bold text-white">{profile?.company_name || "Your Company"}</h2>
            <p className="text-xs text-white/60 mt-0.5">{profile?.company_address}</p>
          </div>
          <div className="text-right">
            <h1 className="text-5xl font-black text-white tracking-tight">{title}</h1>
            <p className="text-sm text-white/70 mt-2">#{documentNumber}</p>
            <p className="text-xs text-white/60 mt-0.5">{date}</p>
          </div>
        </div>
      </div>

      <div className="px-10 py-8">
        {/* Client + Dates */}
        <div className="flex justify-between mb-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">{type === "invoice" ? "BILL TO" : "QUOTE FOR"}</p>
            <p className="text-sm font-bold text-gray-900">{clientName}</p>
            {clientEmail && <p className="text-xs text-gray-500">{clientEmail}</p>}
            {clientAddress && <p className="text-xs text-gray-500 whitespace-pre-line">{clientAddress}</p>}
          </div>
          <div className="text-right space-y-2">
            {type === "invoice" && dueDate && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Due Date</p>
                <p className="text-sm font-medium text-gray-900">{dueDate}</p>
              </div>
            )}
            {(profile?.registration_number || profile?.vat_number) && (
              <div className="text-xs text-gray-400 mt-2">
                {profile?.registration_number && <p>Reg: {profile.registration_number}</p>}
                {profile?.vat_number && <p>VAT: {profile.vat_number}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Items */}
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

        {/* Notes + Totals */}
        <div className="flex justify-between items-start mb-8">
          <div className="max-w-[55%]">
            {notes && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Notes:</p>
                <p className="text-xs text-gray-500 whitespace-pre-line leading-relaxed">{notes}</p>
              </div>
            )}
          </div>
          <div className="w-56">
            <div className="flex justify-between text-sm py-1.5"><span className="font-bold text-gray-700">Subtotal</span><span>R{subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm py-1.5"><span className="font-bold text-gray-700">Tax ({taxRate}%)</span><span>R{taxAmount.toFixed(2)}</span></div>
            <div className="flex justify-between py-2.5 px-3 mt-2 rounded font-black text-white text-base" style={{ backgroundColor: brandColor }}>
              <span>TOTAL</span><span>R{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Banking */}
        {type === "invoice" && profile?.bank_name && (
          <div className="border-l-4 pl-4 mb-6" style={{ borderColor: brandColor }}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Banking Details</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
              <p className="text-gray-500">Bank: <span className="text-gray-800 font-medium">{profile.bank_name}</span></p>
              <p className="text-gray-500">Holder: <span className="text-gray-800 font-medium">{profile.bank_account_holder}</span></p>
              <p className="text-gray-500">Account: <span className="text-gray-800 font-medium">{profile.bank_account_number}</span></p>
              <p className="text-gray-500">Branch: <span className="text-gray-800 font-medium">{profile.bank_branch_code}</span></p>
              {profile.bank_account_type && <p className="text-gray-500">Type: <span className="text-gray-800 font-medium">{profile.bank_account_type}</span></p>}
            </div>
          </div>
        )}

        <div className="mt-auto pt-6 text-center">
          <p className="text-xs text-gray-400">Thank you for your business.</p>
        </div>
      </div>
    </div>
  );
};

export default BoldTemplate;
