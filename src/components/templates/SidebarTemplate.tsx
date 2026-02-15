import { calculateTotals } from "@/lib/document-utils";
import type { TemplateProps } from "./ClassicTemplate";

const SidebarTemplate = ({
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
      className="bg-white text-black max-w-[210mm] mx-auto flex flex-col"
      style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif", minHeight: "297mm" }}
    >
      {/* Top section: Sidebar + Invoice details */}
      <div className="flex">
        {/* Vertical colored sidebar with rotated text */}
        <div
          className="w-10 flex-shrink-0 flex items-center justify-center relative"
          style={{ backgroundColor: brandColor, minHeight: "120px" }}
        >
          <span
            className="text-white text-xs font-bold tracking-[0.3em] uppercase"
            style={{
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
              letterSpacing: "0.3em",
            }}
          >
            {title}
          </span>
        </div>

        {/* Invoice details next to sidebar */}
        <div className="py-6 px-6 text-xs space-y-1.5">
          <div className="flex gap-6">
            <span className="text-gray-500 w-24">{title}</span>
            <span style={{ color: brandColor }}>N° {documentNumber}</span>
          </div>
          <div className="flex gap-6">
            <span className="text-gray-500 w-24">{type === "invoice" ? "INVOICE DATE" : "QUOTE DATE"}</span>
            <span style={{ color: brandColor }}>{date}</span>
          </div>
          {type === "invoice" && dueDate && (
            <div className="flex gap-6">
              <span className="text-gray-500 w-24">Due Date</span>
              <span style={{ color: brandColor }}>{dueDate}</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-10 pt-6 pb-6 flex-1">
        {/* Bill To + Client Details side by side */}
        <div className="flex justify-between gap-8 mb-8">
          <div className="flex-1">
            <p className="text-[10px] text-gray-400 mb-3">Bill To</p>
            {profile?.logo_url && (
              <img src={profile.logo_url} alt="Logo" className="h-12 mb-3 object-contain" />
            )}
            <p className="text-sm text-gray-700">{profile?.company_name || "Your Company"}</p>
            {profile?.company_address && (
              <p className="text-xs text-gray-500 whitespace-pre-line mt-0.5">{profile.company_address}</p>
            )}
            {profile?.company_email && <p className="text-xs text-gray-500">{profile.company_email}</p>}
          </div>
          <div>
            <p className="text-[10px] text-gray-400 mb-3">Client Details</p>
            <p className="text-sm font-bold text-gray-900">{clientName}</p>
            {clientAddress && <p className="text-xs text-gray-500 whitespace-pre-line mt-0.5">{clientAddress}</p>}
            {clientEmail && <p className="text-xs text-gray-500">{clientEmail}</p>}
          </div>
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

        {/* Totals */}
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
            <span className="text-red-500 text-xl">❤️</span>
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

export default SidebarTemplate;
