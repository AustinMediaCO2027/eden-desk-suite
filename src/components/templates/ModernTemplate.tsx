import { calculateTotals } from "@/lib/document-utils";
import type { TemplateProps } from "./ClassicTemplate";

const ModernTemplate = ({ type, profile, documentNumber, date, dueDate, clientName, clientEmail, clientAddress, items, taxRate, notes }: TemplateProps) => {
  const { subtotal, taxAmount, total } = calculateTotals(items, taxRate);
  const brandColor = profile?.brand_color || "#2563EB";
  const title = type === "invoice" ? "INVOICE" : "QUOTE";

  return (
    <div className="bg-white text-black max-w-[210mm] mx-auto" style={{ fontFamily: "Inter, sans-serif", minHeight: "297mm" }}>
      <div className="h-3 w-full" style={{ backgroundColor: brandColor }} />
      <div className="p-10">
        <div className="text-center mb-8">
          {profile?.logo_url && <img src={profile.logo_url} alt="Logo" className="h-16 mx-auto mb-3 object-contain" />}
          <h2 className="text-xl font-bold text-gray-900">{profile?.company_name || "Your Company"}</h2>
          <p className="text-xs text-gray-500 mt-1">{profile?.company_address} {profile?.company_phone && `• ${profile.company_phone}`}</p>
          <p className="text-xs text-gray-500">{profile?.company_email} {profile?.company_website && `• ${profile.company_website}`}</p>
          {(profile?.registration_number || profile?.vat_number) && (
            <p className="text-xs text-gray-400 mt-1">
              {profile?.registration_number && `Reg: ${profile.registration_number}`}
              {profile?.registration_number && profile?.vat_number && " • "}
              {profile?.vat_number && `VAT: ${profile.vat_number}`}
            </p>
          )}
        </div>

        <div className="flex justify-between items-start mb-8 rounded-lg p-5" style={{ backgroundColor: `${brandColor}08`, border: `1px solid ${brandColor}20` }}>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: brandColor }}>{title}</h1>
            <p className="text-sm text-gray-600 mt-1">#{documentNumber}</p>
          </div>
          <div className="text-right text-sm space-y-0.5">
            <p className="text-gray-600">Date: <span className="font-medium text-gray-800">{date}</span></p>
            {type === "invoice" && dueDate && <p className="text-gray-600">Due: <span className="font-medium text-gray-800">{dueDate}</span></p>}
          </div>
        </div>

        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: brandColor }}>Bill To</p>
          <p className="text-sm font-semibold text-gray-900">{clientName}</p>
          <p className="text-xs text-gray-500">{clientEmail}</p>
          <p className="text-xs text-gray-500 whitespace-pre-line">{clientAddress}</p>
        </div>

        <table className="w-full mb-6 text-sm">
          <thead>
            <tr>
              <th className="text-left py-3 px-3 font-semibold text-white rounded-l-md" style={{ backgroundColor: brandColor }}>Description</th>
              <th className="text-center py-3 px-3 font-semibold text-white w-20" style={{ backgroundColor: brandColor }}>Qty</th>
              <th className="text-right py-3 px-3 font-semibold text-white w-28" style={{ backgroundColor: brandColor }}>Unit Price</th>
              <th className="text-right py-3 px-3 font-semibold text-white w-20" style={{ backgroundColor: brandColor }}>Tax</th>
              <th className="text-right py-3 px-3 font-semibold text-white w-28 rounded-r-md" style={{ backgroundColor: brandColor }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
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

        <div className="flex justify-end mb-8">
          <div className="w-64 rounded-lg overflow-hidden border border-gray-200">
            <div className="flex justify-between text-sm py-2 px-4 text-gray-600 bg-gray-50"><span>Subtotal</span><span>R{subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm py-2 px-4 text-gray-600"><span>Tax ({taxRate}%)</span><span>R{taxAmount.toFixed(2)}</span></div>
            <div className="flex justify-between py-3 px-4 text-lg font-bold text-white" style={{ backgroundColor: brandColor }}><span>Total</span><span>R{total.toFixed(2)}</span></div>
          </div>
        </div>

        {type === "invoice" && profile?.bank_name && (
          <div className="rounded-lg p-4 mb-6" style={{ backgroundColor: `${brandColor}05`, border: `1px solid ${brandColor}15` }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: brandColor }}>Banking Details</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
              <p className="text-gray-500">Bank: <span className="text-gray-800 font-medium">{profile.bank_name}</span></p>
              <p className="text-gray-500">Account Holder: <span className="text-gray-800 font-medium">{profile.bank_account_holder}</span></p>
              <p className="text-gray-500">Account Number: <span className="text-gray-800 font-medium">{profile.bank_account_number}</span></p>
              <p className="text-gray-500">Branch Code: <span className="text-gray-800 font-medium">{profile.bank_branch_code}</span></p>
              {profile.bank_account_type && <p className="text-gray-500">Account Type: <span className="text-gray-800 font-medium">{profile.bank_account_type}</span></p>}
            </div>
          </div>
        )}

        {notes && (
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: brandColor }}>Notes</p>
            <p className="text-sm text-gray-600 whitespace-pre-line">{notes}</p>
          </div>
        )}

        <div className="mt-auto pt-6 text-center">
          <p className="text-xs text-gray-400">Thank you for your business.</p>
        </div>
      </div>
      <div className="h-3 w-full" style={{ backgroundColor: brandColor }} />
    </div>
  );
};

export default ModernTemplate;
