import type { LetterheadTemplateProps } from "./LetterheadTypes";

/** Corporate — Inspired by Template 2: Bold logo header, horizontal rule, colored accent wave footer */
const CorporateLetterhead = ({ profile, recipientName, recipientTitle, recipientCompany, recipientAddress, recipientPhone, recipientEmail, date, subject, body, closing, senderName, senderTitle, colorOverride }: LetterheadTemplateProps) => {
  const brandColor = colorOverride || profile?.brand_color || "#E67E22";

  return (
    <div className="bg-white text-black max-w-[210mm] mx-auto flex flex-col" style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif", minHeight: "297mm" }}>
      {/* Header */}
      <div className="px-10 pt-8 pb-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            {profile?.logo_url && <img src={profile.logo_url} alt="Logo" className="h-16 object-contain" />}
            <div>
              <h1 className="text-2xl font-black tracking-tight text-gray-900">{profile?.company_name || "Your Company"}</h1>
            </div>
          </div>
          <div className="text-right text-xs text-gray-500 space-y-0.5">
            {profile?.company_address && <p>{profile.company_address}</p>}
            {profile?.company_phone && <p>{profile.company_phone}</p>}
            {profile?.company_email && <p>{profile.company_email}</p>}
          </div>
        </div>
        <div className="h-[2px] w-full mt-4" style={{ backgroundColor: brandColor }} />
      </div>

      {/* Content */}
      <div className="px-10 flex-1 pt-4">
        {date && <p className="text-sm text-gray-700 mb-6">{date}</p>}

        {recipientName && (
          <div className="mb-5 text-sm">
            <p className="font-bold text-gray-900">{recipientName}</p>
            {recipientTitle && <p className="text-gray-600">{recipientTitle}</p>}
            {recipientCompany && <p className="text-gray-600">{recipientCompany}</p>}
            {recipientAddress && <p className="text-gray-600">{recipientAddress}</p>}
            {recipientPhone && <p className="text-gray-600">{recipientPhone}</p>}
            {recipientEmail && <p className="text-gray-600">{recipientEmail}</p>}
          </div>
        )}

        {subject && (
          <p className="text-sm font-bold text-gray-900 mb-4">Re: {subject}</p>
        )}

        {recipientName && (
          <p className="text-sm text-gray-800 mb-5">Dear {recipientName.split(' ')[0] ? `Mr./Ms. ${recipientName.split(' ').pop()}` : recipientName},</p>
        )}

        <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap mb-8" style={{ textAlign: "justify" }}>
          {body}
        </div>

        <div className="mb-12">
          <p className="text-sm text-gray-800 mb-8">{closing}</p>
          <p className="text-sm font-bold text-gray-900">{senderName || profile?.company_name}</p>
          {senderTitle && <p className="text-sm text-gray-600">{senderTitle}</p>}
          {profile?.company_name && <p className="text-xs text-gray-400 mt-0.5">{profile.company_name}{profile?.company_website && ` | ${profile.company_website}`}</p>}
          {profile?.registration_number && <p className="text-xs text-gray-400">Company Registration No. {profile.registration_number}</p>}
        </div>
      </div>

      {/* Footer — colored accent bar */}
      <div className="mt-auto">
        <div className="h-[2px] mx-10" style={{ backgroundColor: `${brandColor}40` }} />
        <div className="text-center text-xs text-gray-500 py-3">
          {profile?.company_name}{profile?.company_website && ` | ${profile.company_website}`}
          {profile?.registration_number && <span> | Reg: {profile.registration_number}</span>}
        </div>
        <div className="h-3 w-full" style={{ backgroundColor: brandColor }} />
      </div>
    </div>
  );
};

export default CorporateLetterhead;
