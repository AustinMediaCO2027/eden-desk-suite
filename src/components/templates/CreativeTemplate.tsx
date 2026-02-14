import { calculateTotals } from "@/lib/document-utils";
import type { TemplateProps } from "./ClassicTemplate";

const CreativeTemplate = ({ type, profile, documentNumber, date, dueDate, clientName, clientEmail, clientAddress, items, taxRate, notes, colorOverride }: TemplateProps) => {
  const { subtotal, taxAmount, total } = calculateTotals(items, taxRate);
  const brandColor = colorOverride || profile?.brand_color || "#9B2C5E";
  const title = type === "invoice" ? "INVOICE" : "QUOTE";

  return (
    <div className="bg-white text-black max-w-[210mm] mx-auto flex" style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif", minHeight: "297mm" }}>
      {/* Side accent bar */}
      <div className="w-[60px] flex-shrink-0 flex flex-col items-center py-10" style={{ backgroundColor: brandColor }}>
        {profile?.logo_url && <img src={profile.logo_url} alt="Logo" className="w-10 h-10 object-contain brightness-0 invert mb-4" />}
        <div className="flex-1 flex items-center">
          <p className="text-white text-[10px] font-bold tracking-[0.3em] uppercase" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
            {profile?.company_name || "Your Company"}
          </p>
        </div>
      </div>

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">{title}</h1>
            <p className="text-xs text-gray-400 mt-1">#{documentNumber}</p>
          </div>
          <div className="text-right text-xs text-gray-500 space-y-0.5">
            <p className="font-semibold text-sm text-gray-900">{profile?.company_name}</p>
            {profile?.company_address && <p>{profile.company_address}</p>}
            {profile?.company_email && <p>{profile.company_email}</p>}
            {profile?.company_phone && <p>{profile.company_phone}</p>}
            {profile?.registration_number && <p className="text-gray-400 mt-1">Reg: {profile.registration_number}</p>}
            {profile?.vat_number && <p className="text-gray-400">VAT: {profile.vat_number}</p>}
          </div>
        </div>

        {/* Details + Bill To */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="rounded-lg p-4" style={{ backgroundColor: `${brandColor}08` }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: brandColor }}>Details</p>
            <div className="space-y-1 text-sm">
              <p className="text-gray-600">Date: <span className="text-gray-900 font-medium">{date}</span></p>
              {type === "invoice" && dueDate && <p className="text-gray-600">Due: <span className="text-gray-900 font-medium">{dueDate}</span></p>}
            </div>
          </div>
          <div className="rounded-lg p-4" style={{ backgroundColor: `${brandColor}08` }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: brandColor }}>{type === "invoice" ? "Bill To" : "Quote For"}</p>
            <p className="text-sm font-semibold text-gray-900">{clientName}</p>
            {clientEmail && <p className="text-xs text-gray-500">{clientEmail}</p>}
            {clientAddress && <p className="text-xs text-gray-500 whitespace-pre-line">{clientAddress}</p>}
          </div>
        </div>

        {/* Items */}
        <table className="w-full mb-6 text-sm">
          <thead>
            <tr>
              <th className="text-left py-2.5 px-3 text-[10px] font-bold uppercase tracking-widest border-b-2 rounded-l" style={{ color: brandColor, borderColor: brandColor }}>Description</th>
              <th className="text-center py-2.5 px-2 text-[10px] font-bold uppercase tracking-widest w-14 border-b-2" style={{ color: brandColor, borderColor: brandColor }}>Qty</th>
              <th className="text-right py-2.5 px-2 text-[10px] font-bold uppercase tracking-widest w-24 border-b-2" style={{ color: brandColor, borderColor: brandColor }}>Price</th>
              <th className="text-right py-2.5 px-3 text-[10px] font-bold uppercase tracking-widest w-24 border-b-2 rounded-r" style={{ color: brandColor, borderColor: brandColor }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-2.5 px-3">
                  <p className="text-gray-800">{item.description}</p>
                  {item.details && <p className="text-[11px] text-gray-400 mt-0.5">{item.details}</p>}
                </td>
                <td className="py-2.5 px-2 text-center text-gray-600">{item.quantity}</td>
                <td className="py-2.5 px-2 text-right text-gray-600">R{Number(item.rate).toFixed(2)}</td>
                <td className="py-2.5 px-3 text-right text-gray-800 font-medium">R{Number(item.amount).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Notes + Totals */}
        <div className="flex justify-between items-start mb-8">
          <div className="max-w-[50%]">
            {notes && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Notes</p>
                <p className="text-xs text-gray-500 whitespace-pre-line">{notes}</p>
              </div>
            )}
          </div>
          <div className="w-52">
            <div className="flex justify-between text-sm py-1 text-gray-500"><span>Subtotal</span><span>R{subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm py-1 text-gray-500"><span>Tax ({taxRate}%)</span><span>R{taxAmount.toFixed(2)}</span></div>
            <div className="h-[2px] my-2" style={{ backgroundColor: brandColor }} />
            <div className="flex justify-between text-lg font-black text-gray-900"><span>Total</span><span style={{ color: brandColor }}>R{total.toFixed(2)}</span></div>
          </div>
        </div>

        {/* Banking */}
        {type === "invoice" && profile?.bank_name && (
          <div className="rounded-lg p-4 mb-6" style={{ backgroundColor: `${brandColor}06`, borderLeft: `3px solid ${brandColor}` }}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Banking Details</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <p className="text-gray-500">{profile.bank_name}</p>
              <p className="text-gray-500">{profile.bank_account_holder}</p>
              <p className="text-gray-500">Acc: {profile.bank_account_number}</p>
              <p className="text-gray-500">Branch: {profile.bank_branch_code}</p>
              {profile.bank_account_type && <p className="text-gray-500">Type: {profile.bank_account_type}</p>}
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

export default CreativeTemplate;
