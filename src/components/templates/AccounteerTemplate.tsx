import { calculateTotals } from "@/lib/document-utils";
import type { TemplateProps } from "./ClassicTemplate";

const AccounteerTemplate = ({
  type,
  profile,
  documentNumber,
  date,
  dueDate,
  clientName,
  clientEmail,
  clientAddress,
  items,
  taxRate,
  notes,
  colorOverride,
}: TemplateProps) => {
  const { subtotal, taxAmount, total } = calculateTotals(items, taxRate);
  const brandColor = colorOverride || profile?.brand_color || "#29B6F6";
  const title = type === "invoice" ? "INVOICE" : "QUOTE";

  return (
    <div
      className="bg-white text-black w-[210mm] mx-auto flex flex-col"
      style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif", height: "297mm", overflow: "hidden" }}
    >
      <div className="px-10 pt-10 pb-6 flex-1">
        {/* Header: Logo left, INVOICE N° right */}
        <div className="flex justify-between items-start mb-6">
          <div>
            {profile?.logo_url && (
              <img src={profile.logo_url} alt="Logo" className="h-14 mb-3 object-contain" />
            )}
            <p className="text-sm text-gray-700">{profile?.company_name || "Your Company"}</p>
            {profile?.company_address && (
              <p className="text-xs text-gray-500 whitespace-pre-line mt-0.5">{profile.company_address}</p>
            )}
            {profile?.company_email && <p className="text-xs text-gray-500">{profile.company_email}</p>}
          </div>
          <p className="text-xs text-gray-400">
            {title}{" "}
            <span style={{ color: brandColor }}>{documentNumber}</span>
          </p>
        </div>

        {/* Spacer */}
        <div className="h-12" />

        {/* Client Details + Dates */}
        <div className="flex justify-between items-start mb-1">
          <p className="text-xs" style={{ color: brandColor }}>
            Client Details
          </p>
          <div className="text-xs text-right">
            <div className="flex gap-6 justify-end">
              <span style={{ color: brandColor }}>
                {type === "invoice" ? "Invoice Date" : "Quote Date"}
              </span>
              <span className="text-gray-700 w-20">{date}</span>
            </div>
            {type === "invoice" && dueDate && (
              <div className="flex gap-6 justify-end mt-1">
                <span style={{ color: brandColor }}>Due Date</span>
                <span className="text-gray-700 w-20">{dueDate}</span>
              </div>
            )}
          </div>
        </div>

        <div className="mb-10">
          <p className="text-sm font-semibold text-gray-800">{clientName}</p>
          {clientAddress && <p className="text-xs text-gray-500 whitespace-pre-line mt-0.5">{clientAddress}</p>}
          {clientEmail && <p className="text-xs text-gray-500">{clientEmail}</p>}
        </div>

        {/* Thick colored divider */}
        <div className="h-[3px] w-full mb-8" style={{ backgroundColor: brandColor }} />

        {/* Items Table */}
        <table className="w-full mb-6 text-sm">
          <thead>
            <tr>
              <th className="w-8"></th>
              <th className="text-left py-2 px-2 font-normal text-gray-400 text-xs">Description</th>
              <th className="text-center py-2 px-2 font-normal text-gray-400 text-xs w-14">Qty</th>
              <th className="text-right py-2 px-2 font-normal text-gray-400 text-xs w-24">Unit Price</th>
              <th className="text-right py-2 px-2 font-normal text-gray-400 text-xs w-24">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-4 px-2">
                  <div
                    className="w-3.5 h-3.5 rounded-full border-2"
                    style={{ borderColor: brandColor }}
                  />
                </td>
                <td className="py-4 px-2">
                  <p className="text-gray-800 font-medium">{item.description}</p>
                  {item.details && (
                    <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">{item.details}</p>
                  )}
                </td>
                <td className="py-4 px-2 text-center text-gray-600">{item.quantity}</td>
                <td className="py-4 px-2 text-right text-gray-700">R{Number(item.rate).toFixed(2)}</td>
                <td className="py-4 px-2 text-right text-gray-800 font-semibold">R{Number(item.amount).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Thin divider */}
        <div className="h-[1px] w-full bg-gray-200 mb-6" />

        {/* Totals - right aligned */}
        <div className="flex justify-end mb-12">
          <div className="w-60">
            <div className="flex justify-between text-sm py-1.5 text-gray-500">
              <span>Sub Total :</span>
              <span className="text-gray-700">R{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm py-1.5 text-gray-500">
              <span>VAT ({taxRate}%) :</span>
              <span className="text-gray-700">R{taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-baseline py-2 mt-1">
              <span className="text-base font-bold text-gray-900">Total :</span>
              <span className="text-2xl font-bold text-gray-900">R{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Thin divider */}
        <div className="h-[1px] w-full bg-gray-200 mb-6" />

        {/* Account Details + Note */}
        <div className="flex justify-between gap-12 mb-8">
          {type === "invoice" && profile?.bank_name && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: brandColor }}>
                ACCOUNT DETAILS
              </p>
              <div className="text-xs text-gray-600 space-y-1.5">
                <div className="flex">
                  <span className="text-gray-500 w-28">Bank Name:</span>
                  <span className="text-gray-800">{profile.bank_name}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-28">Account Name:</span>
                  <span className="text-gray-800">{profile.bank_account_holder || profile.company_name}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-28">Account Number:</span>
                  <span className="text-gray-800">{profile.bank_account_number}</span>
                </div>
                {profile.bank_branch_code && (
                  <div className="flex">
                    <span className="text-gray-500 w-28">Branch Code:</span>
                    <span className="text-gray-800">{profile.bank_branch_code}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          {notes && (
            <div className="max-w-[45%]">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: brandColor }}>
                NOTE
              </p>
              <p className="text-xs text-gray-600 whitespace-pre-line leading-relaxed">{notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto px-10 pb-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-800">Thank You!</span>
          </div>
          <div className="text-xs flex gap-2" style={{ color: brandColor }}>
            {profile?.company_email && <span>{profile.company_email}</span>}
            {profile?.company_phone && <span>/ {profile.company_phone}</span>}
            {profile?.company_website && <span>/ {profile.company_website}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccounteerTemplate;
