import { calculateTotals } from "@/lib/document-utils";
import type { TemplateProps } from "./ClassicTemplate";

const FreelancerTemplate = ({
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
  const brandColor = colorOverride || profile?.brand_color || "#1E6B4A";
  const title = type === "invoice" ? "Invoice" : "Quote";
  const lightBg = `${brandColor}0D`;

  return (
    <div
      className="bg-white text-black max-w-[210mm] mx-auto flex flex-col"
      style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif", minHeight: "297mm" }}
    >
      <div className="px-10 pt-10 pb-6 flex-1">
        {/* Header */}
        <div className="flex justify-between items-start mb-1">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: brandColor }}>
              {title}
            </h1>
            <p className="text-xs text-gray-400 mt-1">No: #{documentNumber}</p>
            {profile?.company_name && (
              <p className="text-xs text-gray-400">{profile.company_name}</p>
            )}
          </div>
          <div className="text-right text-xs text-gray-500 space-y-0.5">
            <div className="flex justify-end gap-8">
              <div>
                <p className="font-semibold text-gray-700">Issue Date</p>
                <p>{date}</p>
              </div>
              {type === "invoice" && dueDate && (
                <div>
                  <p className="font-semibold text-gray-700">Due Date</p>
                  <p>{dueDate}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-[1px] w-full bg-gray-200 my-6" />

        {/* Bill To + Total Due */}
        <div className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
            Bill to:
          </p>
          <div className="flex justify-between items-start">
            <div className="flex gap-10">
              <div>
                <p className="text-sm font-bold" style={{ color: brandColor }}>
                  {clientName}
                </p>
                {clientEmail && (
                  <p className="text-xs text-gray-500">{clientEmail}</p>
                )}
                {profile?.company_phone && (
                  <p className="text-xs text-gray-500">
                    {profile.company_phone}
                  </p>
                )}
              </div>
              {clientAddress && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                    Billing Address
                  </p>
                  <p className="text-xs text-gray-500 whitespace-pre-line">
                    {clientAddress}
                  </p>
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                Total Due:
              </p>
              <p className="text-3xl font-bold text-gray-900">
                R{total.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-6 text-sm">
          <thead>
            <tr>
              <th
                className="text-left py-2.5 px-3 font-bold text-white text-[10px] uppercase tracking-wider rounded-l-md w-8"
                style={{ backgroundColor: brandColor }}
              >
                #
              </th>
              <th
                className="text-left py-2.5 px-3 font-bold text-white text-[10px] uppercase tracking-wider"
                style={{ backgroundColor: brandColor }}
              >
                Item Name
              </th>
              <th
                className="text-center py-2.5 px-2 font-bold text-white text-[10px] uppercase tracking-wider w-12"
                style={{ backgroundColor: brandColor }}
              >
                Qty
              </th>
              <th
                className="text-right py-2.5 px-3 font-bold text-white text-[10px] uppercase tracking-wider w-24"
                style={{ backgroundColor: brandColor }}
              >
                Unit Price
              </th>
              <th
                className="text-right py-2.5 px-3 font-bold text-white text-[10px] uppercase tracking-wider w-24"
                style={{ backgroundColor: brandColor }}
              >
                Tax ({taxRate}% VAT)
              </th>
              <th
                className="text-right py-2.5 px-3 font-bold text-white text-[10px] uppercase tracking-wider w-24 rounded-r-md"
                style={{ backgroundColor: brandColor }}
              >
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => {
              const itemTax =
                Number(item.amount) * (taxRate / 100);
              return (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-3 px-3 text-gray-400 text-xs">
                    {i + 1}
                  </td>
                  <td className="py-3 px-3">
                    <p className="text-gray-800 font-medium">
                      {item.description}
                    </p>
                    {item.details && (
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {item.details}
                      </p>
                    )}
                  </td>
                  <td className="py-3 px-2 text-center text-gray-600">
                    {item.quantity}
                  </td>
                  <td className="py-3 px-3 text-right text-gray-600">
                    R{Number(item.rate).toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right text-gray-500">
                    R{itemTax.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right text-gray-800 font-medium">
                    R{Number(item.amount).toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64">
            {notes && (
              <div className="flex justify-between text-sm py-1 text-gray-500">
                <span>Custom Charges</span>
                <span>—</span>
              </div>
            )}
            <div className="flex justify-between text-sm py-1 text-gray-500">
              <span>Subtotal</span>
              <span>R{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm py-1 text-gray-500">
              <span>Tax ({taxRate}%)</span>
              <span>R{taxAmount.toFixed(2)}</span>
            </div>
            <div className="h-[1px] my-2 bg-gray-200" />
            <div className="flex justify-between text-lg font-bold text-gray-900 py-1">
              <span>Grand Total</span>
              <span>R{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {notes && (
          <div className="mb-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
              Notes
            </p>
            <p className="text-xs text-gray-500 whitespace-pre-line">
              {notes}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto">
        <div className="mx-10 rounded-lg px-6 py-4 flex justify-between items-start" style={{ backgroundColor: lightBg }}>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
              Payment Details
            </p>
            {profile?.bank_name && (
              <div className="text-xs text-gray-600 space-y-0.5">
                <p>
                  <span className="font-semibold" style={{ color: brandColor }}>
                    {profile.bank_account_holder || profile.company_name}
                  </span>
                </p>
                <p>Account: {profile.bank_account_number}</p>
                <p>Bank: {profile.bank_name}</p>
                <p>Branch: {profile.bank_branch_code}</p>
                {profile.bank_account_type && (
                  <p>Type: {profile.bank_account_type}</p>
                )}
              </div>
            )}
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
              Contact
            </p>
            <div className="text-xs text-gray-600 space-y-0.5">
              {profile?.company_name && (
                <p className="font-semibold" style={{ color: brandColor }}>
                  {profile.company_name}
                </p>
              )}
              {profile?.company_email && <p>{profile.company_email}</p>}
              {profile?.company_phone && <p>{profile.company_phone}</p>}
            </div>
          </div>
          <div>
            {(profile?.registration_number || profile?.vat_number) && (
              <div className="text-xs text-gray-500">
                {profile?.registration_number && (
                  <p>Reg: {profile.registration_number}</p>
                )}
                {profile?.vat_number && <p>VAT: {profile.vat_number}</p>}
              </div>
            )}
          </div>
        </div>

        <div className="px-10 py-4">
          <p className="text-xs text-gray-400 text-center">
            Thank you for doing business with us. Have a good day!
          </p>
        </div>
      </div>
    </div>
  );
};

export default FreelancerTemplate;
