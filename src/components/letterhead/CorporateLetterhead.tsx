import type { LetterheadTemplateProps } from "./LetterheadTypes";

/** Corporate — Figma-inspired: Bold logo header, accent line, structured footer with company info */
const CorporateLetterhead = ({ profile, recipientName, recipientTitle, recipientCompany, recipientAddress, recipientPhone, recipientEmail, date, subject, body, closing, senderName, senderTitle, colorOverride, signatureUrl }: LetterheadTemplateProps) => {
  const brandColor = colorOverride || profile?.brand_color || "#E67E22";

  return (
    <div className="bg-white text-black max-w-[210mm] mx-auto flex flex-col" style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif", minHeight: "297mm" }}>
      {/* Header */}
      <div className="px-10 pt-8 pb-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            {profile?.logo_url && <img src={profile.logo_url} alt="Logo" className="h-14 object-contain" />}
            <div>
              <h1 className="text-xl font-black tracking-tight text-gray-900">{profile?.company_name || "Your Company"}</h1>
              {profile?.company_address && <p className="text-[10px] text-gray-400 mt-0.5">{profile.company_address}</p>}
            </div>
          </div>
          <div className="text-right text-[9px] uppercase tracking-wider text-gray-500 leading-relaxed">
            {profile?.company_phone && <p>{profile.company_phone}</p>}
            {profile?.company_email && <p>{profile.company_email}</p>}
            {profile?.company_website && <p>{profile.company_website}</p>}
          </div>
        </div>
        {/* Accent line */}
        <div className="h-[3px] w-full mt-4" style={{ backgroundColor: brandColor }} />
      </div>

      {/* Content */}
      <div className="px-10 flex-1 pt-4">
        {/* Subject */}
        {subject && (
          <div className="mb-5">
            <h2 className="text-base font-bold text-gray-900 mb-1.5">Re: {subject}</h2>
            <div className="h-[3px] w-14 rounded-full" style={{ backgroundColor: brandColor }} />
          </div>
        )}

        {/* Date */}
        {date && <p className="text-xs text-gray-500 mb-4">{date}</p>}

        {/* Recipient */}
        {recipientName && (
          <div className="mb-5 text-sm">
            <p className="font-bold text-gray-900">{recipientName}</p>
            {recipientTitle && <p className="text-xs text-gray-600">{recipientTitle}</p>}
            {recipientCompany && <p className="text-xs text-gray-600">{recipientCompany}</p>}
            {recipientAddress && <p className="text-xs text-gray-500">{recipientAddress}</p>}
          </div>
        )}

        {/* Greeting */}
        {recipientName && (
          <p className="text-sm text-gray-800 mb-5">Dear {recipientName.split(' ').length > 1 ? `Mr./Ms. ${recipientName.split(' ').pop()}` : recipientName},</p>
        )}

        {/* Body */}
        <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap mb-8" style={{ textAlign: "justify" }}>
          {body}
        </div>

        {/* Closing */}
        <div className="mb-16">
          <p className="text-sm text-gray-800 mb-1">{closing}</p>
          {signatureUrl && <img src={signatureUrl} alt="Signature" className="h-14 object-contain my-2" />}
          <p className="text-sm font-bold text-gray-900">{senderName || profile?.company_name}</p>
          {senderTitle && <p className="text-xs text-gray-600">{senderTitle}</p>}
        </div>
      </div>

      {/* Footer */}
      <div className="px-10 pb-6 mt-auto">
        <div className="h-[1px] w-full bg-gray-200 mb-3" />
        <div className="flex justify-between items-center text-[10px] text-gray-500">
          <div className="flex gap-6">
            {profile?.company_name && <span className="font-semibold text-gray-700">{profile.company_name}</span>}
            {profile?.company_website && <span>{profile.company_website}</span>}
          </div>
          <div className="flex gap-4">
            {profile?.registration_number && <span>Reg: {profile.registration_number}</span>}
            {profile?.vat_number && <span>VAT: {profile.vat_number}</span>}
          </div>
        </div>
        <div className="h-[3px] w-full mt-3" style={{ backgroundColor: brandColor }} />
      </div>
    </div>
  );
};

export default CorporateLetterhead;
