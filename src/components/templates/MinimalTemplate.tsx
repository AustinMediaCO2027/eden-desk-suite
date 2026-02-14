import { calculateTotals } from "@/lib/document-utils";
import type { TemplateProps } from "./ClassicTemplate";

const MinimalTemplate = ({ type, profile, documentNumber, date, dueDate, clientName, clientEmail, clientAddress, items, taxRate, notes, colorOverride }: TemplateProps) => {
  const { subtotal, taxAmount, total } = calculateTotals(items, taxRate);
  const brandColor = colorOverride || profile?.brand_color || "#1A1A1A";
  const title = type === "invoice" ? "INVOICE" : "QUOTE";

  return (
    <div className="bg-white text-black p-12 max-w-[210mm] mx-auto" style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif", minHeight: "297mm" }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-12">
        <div>
          {profile?.logo_url && <img src={profile.logo_url} alt="Logo" className="h-10 mb-3 object-contain" />}
          <h2 className="text-sm font-semibold text-gray-900">{profile?.company_name}</h2>
          <p className="text-xs text-gray-400 mt-0.5">{profile?.company_address}</p>
        </div>
        <div className="text-right">
          <h1 className="text-3xl font-extralight tracking-[0.2em] text-gray-800">{title}</h1>
          <p className="text-xs text-gray-400 mt-2">#{documentNumber}</p>
        </div>
      </div>

      <div className="h-[1px] w-full bg-gray-200 mb-8" />

      {/* Dates + Bill To */}
      <div className="flex justify-between mb-10">
        <div className="space-y-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-400">Date</p>
            <p className="text-sm text-gray-800 mt-0.5">{date}</p>
          </div>
          {type === "invoice" && dueDate && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400">Due Date</p>
              <p className="text-sm text-gray-800 mt-0.5">{dueDate}</p>
            </div>
          )}
        </div>
        <div className="text-right max-w-[220px]">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Bill To</p>
          <p className="text-sm font-medium text-gray-900">{clientName}</p>
          {clientEmail && <p className="text-xs text-gray-500">{clientEmail}</p>}
          {clientAddress && <p className="text-xs text-gray-500 whitespace-pre-line">{clientAddress}</p>}
        </div>
      </div>

      {/* Items */}
      <table className="w-full mb-8 text-sm">
        <thead>
          <tr className="border-b border-gray-300">
            <th className="text-left py-2.5 font-medium text-gray-400 text-[10px] uppercase tracking-widest">Description</th>
            <th className="text-center py-2.5 font-medium text-gray-400 text-[10px] uppercase tracking-widest w-16">Qty</th>
            <th className="text-right py-2.5 font-medium text-gray-400 text-[10px] uppercase tracking-widest w-24">Price</th>
            <th className="text-right py-2.5 font-medium text-gray-400 text-[10px] uppercase tracking-widest w-24">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} className="border-b border-gray-100">
              <td className="py-3">
                <p className="text-gray-800">{item.description}</p>
                {item.details && <p className="text-[11px] text-gray-400 mt-0.5">{item.details}</p>}
              </td>
              <td className="py-3 text-center text-gray-600">{item.quantity}</td>
              <td className="py-3 text-right text-gray-600">R{Number(item.rate).toFixed(2)}</td>
              <td className="py-3 text-right text-gray-800">R{Number(item.amount).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-10">
        <div className="w-56">
          <div className="flex justify-between text-sm py-1.5 text-gray-500"><span>Subtotal</span><span>R{subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between text-sm py-1.5 text-gray-500"><span>Tax ({taxRate}%)</span><span>R{taxAmount.toFixed(2)}</span></div>
          <div className="h-[1px] my-2" style={{ backgroundColor: brandColor }} />
          <div className="flex justify-between text-lg font-light text-gray-900"><span>Total</span><span style={{ color: brandColor }}>R{total.toFixed(2)}</span></div>
        </div>
      </div>

      {/* Banking */}
      {type === "invoice" && profile?.bank_name && (
        <div className="mb-8">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">Banking Details</p>
          <div className="text-xs text-gray-600 space-y-0.5">
            <p>{profile.bank_name} • {profile.bank_account_holder}</p>
            <p>Acc: {profile.bank_account_number} • Branch: {profile.bank_branch_code}</p>
            {profile.bank_account_type && <p>Type: {profile.bank_account_type}</p>}
          </div>
        </div>
      )}

      {notes && (
        <div className="mb-8">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Notes</p>
          <p className="text-xs text-gray-500 whitespace-pre-line">{notes}</p>
        </div>
      )}

      <div className="mt-auto pt-8">
        <div className="h-[1px] w-full bg-gray-200 mb-3" />
        <p className="text-[10px] text-gray-400 text-center tracking-wide">Thank you for your business.</p>
      </div>
    </div>
  );
};

export default MinimalTemplate;
