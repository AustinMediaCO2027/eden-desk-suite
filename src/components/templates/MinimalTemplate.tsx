import { Profile } from "@/hooks/useProfile";
import { LineItem, calculateTotals } from "@/lib/document-utils";
import type { TemplateProps } from "./ClassicTemplate";

const MinimalTemplate = ({ type, profile, documentNumber, date, dueDate, clientName, clientEmail, clientAddress, items, taxRate, notes }: TemplateProps) => {
  const { subtotal, taxAmount, total } = calculateTotals(items, taxRate);
  const brandColor = profile?.brand_color || "#2563EB";
  const title = type === "invoice" ? "INVOICE" : "QUOTE";

  return (
    <div className="bg-white text-black p-10 max-w-[210mm] mx-auto" style={{ fontFamily: "Inter, sans-serif", minHeight: "297mm" }}>
      {/* Minimal header */}
      <div className="flex justify-between items-start mb-10">
        <div>
          {profile?.logo_url && <img src={profile.logo_url} alt="Logo" className="h-10 mb-4 object-contain" />}
          <h1 className="text-3xl font-light tracking-widest text-gray-900">{title}</h1>
          <p className="text-xs text-gray-400 mt-1 tracking-wider">#{documentNumber}</p>
        </div>
        <div className="text-right text-xs text-gray-500 space-y-0.5 mt-2">
          <p className="font-semibold text-sm text-gray-900">{profile?.company_name}</p>
          {profile?.registration_number && <p>Reg: {profile.registration_number}</p>}
          {profile?.vat_number && <p>VAT: {profile.vat_number}</p>}
          <p>{profile?.company_address}</p>
          <p>{profile?.company_phone}</p>
          <p>{profile?.company_email}</p>
          {profile?.company_website && <p>{profile.company_website}</p>}
        </div>
      </div>

      {/* Thin divider */}
      <div className="h-[1px] w-full bg-gray-200 mb-8" />

      {/* Dates + Bill To row */}
      <div className="flex justify-between mb-10">
        <div className="text-sm space-y-1">
          <p className="text-gray-400 text-xs uppercase tracking-wider">Date</p>
          <p className="text-gray-800">{date}</p>
          {type === "invoice" && dueDate && (
            <>
              <p className="text-gray-400 text-xs uppercase tracking-wider mt-3">Due Date</p>
              <p className="text-gray-800">{dueDate}</p>
            </>
          )}
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Bill To</p>
          <p className="text-sm font-medium text-gray-900">{clientName}</p>
          <p className="text-xs text-gray-500">{clientEmail}</p>
          <p className="text-xs text-gray-500 whitespace-pre-line">{clientAddress}</p>
        </div>
      </div>

      {/* Items */}
      <table className="w-full mb-8 text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 font-medium text-gray-400 text-xs uppercase tracking-wider">Description</th>
            <th className="text-center py-2 font-medium text-gray-400 text-xs uppercase tracking-wider w-16">Qty</th>
            <th className="text-right py-2 font-medium text-gray-400 text-xs uppercase tracking-wider w-24">Price</th>
            <th className="text-right py-2 font-medium text-gray-400 text-xs uppercase tracking-wider w-24">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} className="border-b border-gray-100">
              <td className="py-3 text-gray-800">{item.description}</td>
              <td className="py-3 text-center text-gray-600">{item.quantity}</td>
              <td className="py-3 text-right text-gray-600">R{Number(item.rate).toFixed(2)}</td>
              <td className="py-3 text-right text-gray-800">R{Number(item.amount).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-10">
        <div className="w-56 space-y-1">
          <div className="flex justify-between text-sm text-gray-500"><span>Subtotal</span><span>R{subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between text-sm text-gray-500"><span>Tax ({taxRate}%)</span><span>R{taxAmount.toFixed(2)}</span></div>
          <div className="h-[1px] my-2" style={{ backgroundColor: brandColor }} />
          <div className="flex justify-between text-xl font-light text-gray-900"><span>Total</span><span style={{ color: brandColor }}>R{total.toFixed(2)}</span></div>
        </div>
      </div>

      {/* Banking Details */}
      {type === "invoice" && profile?.bank_name && (
        <div className="mb-8">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Banking Details</p>
          <div className="text-sm text-gray-600 space-y-0.5">
            <p>{profile.bank_name} • {profile.bank_account_holder}</p>
            <p>Acc: {profile.bank_account_number} • Branch: {profile.bank_branch_code}</p>
            {profile.bank_account_type && <p>Type: {profile.bank_account_type}</p>}
          </div>
        </div>
      )}

      {/* Notes */}
      {notes && (
        <div className="mb-8">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Notes</p>
          <p className="text-sm text-gray-600 whitespace-pre-line">{notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto pt-8">
        <div className="h-[1px] w-full bg-gray-200 mb-3" />
        <p className="text-[10px] text-gray-400 text-center tracking-wide">Thank you for your business.</p>
      </div>
    </div>
  );
};

export default MinimalTemplate;
