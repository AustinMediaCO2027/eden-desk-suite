import { calculateTotals } from "@/lib/document-utils";
import type { TemplateProps } from "./ClassicTemplate";

const ElegantTemplate = ({ type, profile, documentNumber, date, dueDate, clientName, clientEmail, clientAddress, items, taxRate, notes, colorOverride }: TemplateProps) => {
  const { subtotal, taxAmount, total } = calculateTotals(items, taxRate);
  const brandColor = colorOverride || profile?.brand_color || "#6B4226";
  const title = type === "invoice" ? "Invoice" : "Quote";

  return (
    <div className="bg-white text-black w-[210mm] mx-auto flex flex-col" style={{ fontFamily: "'Georgia', 'Times New Roman', serif", height: "297mm", overflow: "hidden" }}>
      <div className="h-1 w-full" style={{ backgroundColor: brandColor }} />
      <div className="p-10">
        {/* Header */}
        <div className="text-center mb-10 pt-4">
          {profile?.logo_url && <img src={profile.logo_url} alt="Logo" className="h-14 mx-auto mb-4 object-contain" />}
          <h1 className="text-3xl font-normal tracking-[0.25em] text-gray-900">{title}</h1>
          <div className="w-16 h-[2px] mx-auto mt-3" style={{ backgroundColor: brandColor }} />
          <p className="text-xs mt-3 tracking-wider text-gray-400" style={{ fontFamily: "Inter, sans-serif" }}>#{documentNumber}</p>
        </div>

        {/* From / To */}
        <div className="flex justify-between mb-10 pb-8 border-b border-gray-200">
          <div className="space-y-1" style={{ fontFamily: "Inter, sans-serif" }}>
            <p className="text-[10px] uppercase tracking-[0.15em] text-gray-400 mb-2">From</p>
            <p className="text-sm font-semibold text-gray-900">{profile?.company_name}</p>
            {profile?.company_address && <p className="text-xs text-gray-500">{profile.company_address}</p>}
            {profile?.company_email && <p className="text-xs text-gray-500">{profile.company_email}</p>}
            {profile?.company_phone && <p className="text-xs text-gray-500">{profile.company_phone}</p>}
            {profile?.registration_number && <p className="text-xs text-gray-400 mt-2">Reg: {profile.registration_number}</p>}
            {profile?.vat_number && <p className="text-xs text-gray-400">VAT: {profile.vat_number}</p>}
          </div>
          <div className="text-right space-y-1" style={{ fontFamily: "Inter, sans-serif" }}>
            <p className="text-[10px] uppercase tracking-[0.15em] text-gray-400 mb-2">Bill To</p>
            <p className="text-sm font-semibold text-gray-900">{clientName}</p>
            {clientEmail && <p className="text-xs text-gray-500">{clientEmail}</p>}
            {clientAddress && <p className="text-xs text-gray-500 whitespace-pre-line">{clientAddress}</p>}
          </div>
        </div>

        {/* Dates */}
        <div className="flex gap-8 mb-8 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Date</p>
            <p className="font-medium text-gray-900">{date}</p>
          </div>
          {type === "invoice" && dueDate && (
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Due Date</p>
              <p className="font-medium text-gray-900">{dueDate}</p>
            </div>
          )}
        </div>

        {/* Items */}
        <table className="w-full mb-8 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
          <thead>
            <tr className="border-y border-gray-300">
              <th className="text-left py-3 font-medium text-gray-600 text-xs">Description</th>
              <th className="text-center py-3 font-medium text-gray-600 text-xs w-16">Qty</th>
              <th className="text-right py-3 font-medium text-gray-600 text-xs w-24">Price</th>
              <th className="text-right py-3 font-medium text-gray-600 text-xs w-24">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-3">
                  <p className="text-gray-800">{item.description}</p>
                  {item.details && <p className="text-[11px] text-gray-400 mt-0.5 italic">{item.details}</p>}
                </td>
                <td className="py-3 text-center text-gray-600">{item.quantity}</td>
                <td className="py-3 text-right text-gray-600">R{Number(item.rate).toFixed(2)}</td>
                <td className="py-3 text-right text-gray-800">R{Number(item.amount).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-10" style={{ fontFamily: "Inter, sans-serif" }}>
          <div className="w-56">
            <div className="flex justify-between text-sm py-1.5 text-gray-500"><span>Subtotal</span><span>R{subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm py-1.5 text-gray-500"><span>Tax ({taxRate}%)</span><span>R{taxAmount.toFixed(2)}</span></div>
            <div className="border-t border-gray-300 mt-2 pt-2">
              <div className="flex justify-between text-xl">
                <span className="text-gray-600" style={{ fontFamily: "'Georgia', serif" }}>Total</span>
                <span className="font-semibold" style={{ color: brandColor }}>R{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Banking */}
        {type === "invoice" && profile?.bank_name && (
          <div className="border border-gray-200 rounded p-4 mb-6" style={{ fontFamily: "Inter, sans-serif" }}>
            <p className="text-[10px] uppercase tracking-[0.15em] text-gray-400 mb-2">Banking Details</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
              <p className="text-gray-500">Bank: <span className="text-gray-800">{profile.bank_name}</span></p>
              <p className="text-gray-500">Holder: <span className="text-gray-800">{profile.bank_account_holder}</span></p>
              <p className="text-gray-500">Account: <span className="text-gray-800">{profile.bank_account_number}</span></p>
              <p className="text-gray-500">Branch: <span className="text-gray-800">{profile.bank_branch_code}</span></p>
              {profile.bank_account_type && <p className="text-gray-500">Type: <span className="text-gray-800">{profile.bank_account_type}</span></p>}
            </div>
          </div>
        )}

        {notes && (
          <div className="mb-6" style={{ fontFamily: "Inter, sans-serif" }}>
            <p className="text-[10px] uppercase tracking-[0.15em] text-gray-400 mb-1">Notes</p>
            <p className="text-xs text-gray-600 whitespace-pre-line italic">{notes}</p>
          </div>
        )}

        <div className="mt-auto pt-8 text-center">
          <div className="w-16 h-[1px] mx-auto mb-3" style={{ backgroundColor: brandColor }} />
          <p className="text-xs text-gray-400 italic" style={{ fontFamily: "'Georgia', serif" }}>Thank you for your business.</p>
        </div>
      </div>
      <div className="h-1 w-full" style={{ backgroundColor: brandColor }} />
    </div>
  );
};

export default ElegantTemplate;
