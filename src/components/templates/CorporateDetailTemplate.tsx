import { calculateTotals } from "@/lib/document-utils";
import type { TemplateProps } from "./ClassicTemplate";

const CorporateDetailTemplate = ({
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
  const brandColor = colorOverride || profile?.brand_color || "#00BCD4";
  const title = type === "invoice" ? "Invoice" : "Quote";

  return (
    <div
      className="bg-white text-black max-w-[210mm] mx-auto flex flex-col"
      style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif", minHeight: "297mm" }}
    >
      <div className="px-10 pt-10 pb-6 flex-1">
        {/* Centered Header */}
        <div className="text-center mb-8">
          {profile?.logo_url && (
            <img src={profile.logo_url} alt="Logo" className="h-14 mx-auto mb-3 object-contain" />
          )}
          <p className="text-sm text-gray-700 font-semibold">{profile?.company_name || "Your Company"}</p>
          {profile?.company_address && (
            <p className="text-xs text-gray-500 mt-0.5">{profile.company_address}</p>
          )}
          {profile?.company_email && <p className="text-xs text-gray-500">{profile.company_email}</p>}
        </div>

        {/* Client Information + Details side by side */}
        <div className="flex justify-between gap-8 mb-8">
          {/* CLIENT INFORMATION */}
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
              CLIENT INFORMATION
            </p>
            <table className="text-sm">
              <tbody>
                <tr>
                  <td className="py-1.5 pr-4 text-gray-500 font-medium text-xs">Name:</td>
                  <td className="py-1.5 text-gray-800 font-semibold text-xs">{clientName}</td>
                </tr>
                <tr>
                  <td className="py-1.5 pr-4 text-gray-500 font-medium text-xs align-top">Address:</td>
                  <td className="py-1.5 text-gray-700 text-xs whitespace-pre-line">
                    {clientAddress || "—"}
                  </td>
                </tr>
                {clientEmail && (
                  <tr>
                    <td className="py-1.5 pr-4 text-gray-500 font-medium text-xs">Email:</td>
                    <td className="py-1.5 text-gray-700 text-xs">{clientEmail}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* DETAILS */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">DETAILS</p>
            <table className="text-sm">
              <tbody>
                <tr>
                  <td className="py-1.5 pr-4 text-gray-500 font-medium text-xs">
                    {type === "invoice" ? "Invoice No:" : "Quote No:"}
                  </td>
                  <td className="py-1.5 text-gray-800 font-semibold text-xs">N° {documentNumber}</td>
                </tr>
                <tr>
                  <td className="py-1.5 pr-4 text-gray-500 font-medium text-xs">
                    {type === "invoice" ? "Invoice Date:" : "Quote Date:"}
                  </td>
                  <td className="py-1.5 text-gray-700 text-xs">{date}</td>
                </tr>
                {type === "invoice" && dueDate && (
                  <tr>
                    <td className="py-1.5 pr-4 text-gray-500 font-medium text-xs">Due Date:</td>
                    <td className="py-1.5 text-gray-700 text-xs">{dueDate}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-6 text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-2.5 px-2 font-semibold text-gray-500 text-xs w-8"></th>
              <th className="text-left py-2.5 px-2 font-semibold text-gray-500 text-xs">Item/Description</th>
              <th className="text-center py-2.5 px-2 font-semibold text-gray-500 text-xs w-12">Qty</th>
              <th className="text-right py-2.5 px-2 font-semibold text-gray-500 text-xs w-24">Unit Price</th>
              <th className="text-right py-2.5 px-2 font-semibold text-gray-500 text-xs w-24">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-3 px-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: brandColor, opacity: 0.6 }}
                  />
                </td>
                <td className="py-3 px-2">
                  <p className="text-gray-800 font-medium">{item.description}</p>
                  {item.details && (
                    <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{item.details}</p>
                  )}
                </td>
                <td className="py-3 px-2 text-center text-gray-600">{item.quantity}</td>
                <td className="py-3 px-2 text-right text-gray-600">R{Number(item.rate).toFixed(2)}</td>
                <td className="py-3 px-2 text-right text-gray-800 font-medium">R{Number(item.amount).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-10">
          <div className="w-56">
            <div className="flex justify-between text-sm py-1 text-gray-500">
              <span>Sub Total :</span>
              <span>R{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm py-1 text-gray-500">
              <span>VAT ({taxRate}%) :</span>
              <span>R{taxAmount.toFixed(2)}</span>
            </div>
            <div className="h-[1px] my-1 bg-gray-200" />
            <div className="flex justify-between text-lg font-bold text-gray-900 py-1.5">
              <span>Total :</span>
              <span>R{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Account Details + Note */}
        <div className="flex justify-between gap-10 mb-8">
          {type === "invoice" && profile?.bank_name && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: brandColor }}>
                ACCOUNT DETAILS
              </p>
              <div className="text-xs text-gray-600 space-y-1">
                <div className="flex gap-6">
                  <span className="text-gray-400 w-28">Bank Name:</span>
                  <span>{profile.bank_name}</span>
                </div>
                <div className="flex gap-6">
                  <span className="text-gray-400 w-28">Account Name:</span>
                  <span>{profile.bank_account_holder || profile.company_name}</span>
                </div>
                <div className="flex gap-6">
                  <span className="text-gray-400 w-28">Account Number:</span>
                  <span>{profile.bank_account_number}</span>
                </div>
                {profile.bank_branch_code && (
                  <div className="flex gap-6">
                    <span className="text-gray-400 w-28">Branch Code:</span>
                    <span>{profile.bank_branch_code}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          {notes && (
            <div className="max-w-[45%]">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: brandColor }}>
                NOTE
              </p>
              <p className="text-xs text-gray-500 whitespace-pre-line leading-relaxed">{notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto px-10 pb-6">
        <div className="h-[1px] w-full bg-gray-200 mb-4" />
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-red-500 text-lg">❤️</span>
            <span className="text-base font-bold text-gray-800">Thank You!</span>
          </div>
          <div className="text-xs text-gray-400 flex gap-4">
            {profile?.company_email && <span>{profile.company_email}</span>}
            {profile?.company_phone && <span>{profile.company_phone}</span>}
            {profile?.company_website && <span>{profile.company_website}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorporateDetailTemplate;
