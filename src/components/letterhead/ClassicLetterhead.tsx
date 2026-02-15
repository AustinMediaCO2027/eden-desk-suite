import type { LetterheadTemplateProps } from "./LetterheadTypes";

/** Classic — Inspired by Figma: Logo left, company details right, blue accent line, clean footer */
const ClassicLetterhead = ({ profile, recipientName, recipientTitle, recipientCompany, recipientAddress, recipientPhone, recipientEmail, date, subject, body, closing, senderName, senderTitle, colorOverride, signatureUrl }: LetterheadTemplateProps) => {
  const brandColor = colorOverride || profile?.brand_color || "#1A5276";

  return (
    <div className="bg-white text-black max-w-[210mm] mx-auto flex flex-col" style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif", minHeight: "297mm" }}>
      {/* Header */}
      <div className="px-10 pt-8 pb-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            {profile?.logo_url && <img src={profile.logo_url} alt="Logo" className="h-12 object-contain" />}
            <h1 className="text-xl font-bold tracking-tight text-gray-900">{profile?.company_name || "Your Company"}</h1>
          </div>
          <div className="text-right text-[9px] uppercase tracking-wider text-gray-500 leading-relaxed">
            {profile?.company_name && <p className="font-semibold text-gray-700">{profile.company_name}</p>}
            {profile?.company_address && <p>{profile.company_address}</p>}
            {profile?.registration_number && <p>Trade Register No. {profile.registration_number}</p>}
            {profile?.vat_number && <p>VAT No. {profile.vat_number}</p>}
          </div>
        </div>
        {/* Accent line */}
        <div className="h-[2px] w-full mt-4" style={{ backgroundColor: brandColor }} />
      </div>

      {/* Content */}
      <div className="px-10 flex-1 pt-4">
        {/* Subject */}
        {subject && (
          <div className="mb-6">
            <h2 className="text-base font-bold text-gray-900 mb-1.5">{subject}</h2>
            <div className="h-[3px] w-12 rounded-full" style={{ backgroundColor: brandColor }} />
          </div>
        )}

        {/* Date */}
        {date && <p className="text-xs text-gray-500 mb-4">{date}</p>}

        {/* Greeting */}
        {recipientName && (
          <p className="text-sm text-gray-800 mb-1">{recipientCompany ? `Hello ${recipientCompany},` : `Dear ${recipientName},`}</p>
        )}

        {/* Recipient details (subtle) */}
        {recipientName && (
          <div className="mb-5 text-xs text-gray-500">
            {recipientTitle && <p>{recipientTitle}</p>}
            {recipientAddress && <p>{recipientAddress}</p>}
            {recipientPhone && <p>{recipientPhone}</p>}
          </div>
        )}

        {/* Body */}
        <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap mb-8" style={{ textAlign: "justify" }}>
          {body}
        </div>

        {/* Closing */}
        <div className="mb-16">
          <p className="text-sm text-gray-800 mb-1">{closing}</p>
          {signatureUrl && <img src={signatureUrl} alt="Signature" className="h-14 object-contain my-2" />}
          <p className="text-sm font-semibold text-gray-900">{senderName || profile?.company_name}</p>
          {senderTitle && <p className="text-xs text-gray-600">{senderTitle}</p>}
        </div>
      </div>

      {/* Footer */}
      <div className="px-10 pb-6 mt-auto">
        <div className="h-[1px] w-full bg-gray-300 mb-3" />
        <div className="flex justify-between text-[10px] text-gray-500">
          {profile?.company_website && (
            <span><span className="font-bold" style={{ color: brandColor }}>W.</span>  {profile.company_website}</span>
          )}
          {profile?.company_email && (
            <span><span className="font-bold" style={{ color: brandColor }}>E.</span>  {profile.company_email}</span>
          )}
          {profile?.company_phone && (
            <span><span className="font-bold" style={{ color: brandColor }}>T.</span>  {profile.company_phone}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassicLetterhead;
