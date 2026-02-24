import { calculateTotals } from "@/lib/document-utils";
import type { TemplateProps } from "./ClassicTemplate";

const ModernTemplate = ({ type, profile, documentNumber, date, dueDate, clientName, clientEmail, clientAddress, items, taxRate, notes, colorOverride }: TemplateProps) => {
  const { subtotal, taxAmount, total } = calculateTotals(items, taxRate);
  const brandColor = colorOverride || profile?.brand_color || "#1A1A1A";
  const title = type === "invoice" ? "INVOICE" : "QUOTE";

  return (
    <div className="bg-white text-black w-[210mm] mx-auto flex flex-col" style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif", height: "297mm", overflow: "hidden" }}>
      <div className="p-10 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div>
            {profile?.logo_url && <img src={profile.logo_url} alt="Logo" className="h-14 mb-2 object-contain" />}
          </div>
          <div className="text-right">
            <h1 className="text-4xl font-light tracking-[0.15em] text-gray-900">{title}</h1>
            <p className="text-sm text-gray-400 mt-2">{title} ID: <span className="text-gray-600">#{documentNumber}</span></p>
          </div>
        </div>

        {/* Invoice To */}
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">{title} TO</p>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-gray-900">{clientName}</p>
              {clientEmail && <p className="text-xs text-gray-500 mt-0.5">{clientEmail}</p>}
            </div>
            <div className="text-right text-xs text-gray-500">
              {clientAddress && <p className="whitespace-pre-line">{clientAddress}</p>}
              <p className="mt-1">Date: {date}</p>
              {type === "invoice" && dueDate && <p>Due: {dueDate}</p>}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-8 text-sm">
          <thead>
            <tr>
              <th className="text-left py-3 px-4 font-bold text-white text-xs uppercase tracking-wider" style={{ backgroundColor: brandColor }}>Product</th>
              <th className="text-right py-3 px-3 font-bold text-white text-xs uppercase tracking-wider w-24" style={{ backgroundColor: brandColor }}>Price</th>
              <th className="text-center py-3 px-3 font-bold text-white text-xs uppercase tracking-wider w-16" style={{ backgroundColor: brandColor }}>Qty</th>
              <th className="text-right py-3 px-4 font-bold text-white text-xs uppercase tracking-wider w-24" style={{ backgroundColor: brandColor }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b border-gray-200">
                <td className="py-4 px-4">
                  <p className="text-gray-800">{item.description}</p>
                  {item.details && <p className="text-[11px] text-gray-400 mt-0.5">{item.details}</p>}
                </td>
                <td className="py-4 px-3 text-right text-gray-600">R{Number(item.rate).toFixed(2)}</td>
                <td className="py-4 px-3 text-center text-gray-600">{item.quantity}</td>
                <td className="py-4 px-4 text-right text-gray-800 font-medium">R{Number(item.amount).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Payment Method + Totals */}
        <div className="flex justify-between items-start mb-12">
          <div>
            {type === "invoice" && profile?.bank_name && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">PAYMENT METHOD</p>
                <div className="text-xs text-gray-600 space-y-0.5">
                  <p>Name: {profile.bank_account_holder}</p>
                  <p>Account: {profile.bank_account_number}</p>
                  <p>Bank: {profile.bank_name}</p>
                  <p>Branch: {profile.bank_branch_code}</p>
                  {profile.bank_account_type && <p>Type: {profile.bank_account_type}</p>}
                </div>
              </div>
            )}
            {notes && (
              <div className="mt-4">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Notes</p>
                <p className="text-xs text-gray-500 whitespace-pre-line max-w-[280px]">{notes}</p>
              </div>
            )}
          </div>
          <div className="w-56">
            <div className="flex justify-between text-sm py-1.5 font-bold"><span className="text-gray-700">SUB-TOTAL</span><span className="text-gray-800">R{subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm py-1.5"><span className="text-gray-700 font-bold">TAX ({taxRate}%)</span><span className="text-gray-800">R{taxAmount.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm py-2.5 px-3 mt-2 font-black text-white" style={{ backgroundColor: brandColor }}>
              <span>TOTAL</span><span>R{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Company info */}
        {(profile?.registration_number || profile?.vat_number) && (
          <div className="text-xs text-gray-400 mb-6">
            {profile?.registration_number && <span>Reg: {profile.registration_number} </span>}
            {profile?.vat_number && <span>• VAT: {profile.vat_number}</span>}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-8 flex justify-between items-end border-t border-gray-200 pt-6">
          <p className="text-lg italic text-gray-400" style={{ fontFamily: "'Georgia', serif" }}>Thank You For Your Business</p>
          <div className="text-right">
            <div className="w-32 h-[1px] bg-gray-300 mb-1 ml-auto" />
            <p className="text-xs font-bold text-gray-700">{profile?.company_name}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernTemplate;
