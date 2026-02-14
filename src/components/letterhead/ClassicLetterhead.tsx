import type { LetterheadTemplateProps } from "./LetterheadTypes";

/** Classic — Inspired by Template 1: Logo top-left, subject top-right, clean footer with contact icons */
const ClassicLetterhead = ({ profile, recipientName, recipientTitle, recipientCompany, recipientAddress, recipientPhone, recipientEmail, date, subject, body, closing, senderName, senderTitle, colorOverride }: LetterheadTemplateProps) => {
  const brandColor = colorOverride || profile?.brand_color || "#1A5276";

  return (
    <div className="bg-white text-black max-w-[210mm] mx-auto flex flex-col" style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif", minHeight: "297mm" }}>
      {/* Header */}
      <div className="px-10 pt-8 pb-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            {profile?.logo_url && <img src={profile.logo_url} alt="Logo" className="h-14 object-contain" />}
            <div>
              <h1 className="text-xl font-bold" style={{ color: brandColor }}>{profile?.company_name || "Your Company"}</h1>
              {profile?.company_address && <p className="text-[10px] text-gray-500">{profile.company_address}</p>}
            </div>
          </div>
          {subject && (
            <div className="text-right">
              <h2 className="text-lg font-bold" style={{ color: brandColor }}>{subject}</h2>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-10 flex-1">
        {/* Date */}
        {date && <p className="text-sm text-gray-700 mb-6">{date}</p>}

        {/* Recipient */}
        {recipientName && (
          <div className="mb-6 text-sm">
            <p className="font-semibold text-gray-900">{recipientName}</p>
            {recipientTitle && <p className="text-gray-600">{recipientTitle}</p>}
            {recipientCompany && <p className="text-gray-600">{recipientCompany}</p>}
            {recipientAddress && <p className="text-gray-600">{recipientAddress}</p>}
            {recipientPhone && <p className="text-gray-600">{recipientPhone}</p>}
          </div>
        )}

        {/* Greeting */}
        {recipientName && (
          <p className="text-sm text-gray-800 mb-6">Dear {recipientName},</p>
        )}

        {/* Body */}
        <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap mb-8" style={{ textAlign: "justify" }}>
          {body}
        </div>

        {/* Closing */}
        <div className="mb-16">
          <p className="text-sm text-gray-800 mb-8">{closing}</p>
          <p className="text-sm font-semibold text-gray-900">{senderName || profile?.company_name}</p>
          {senderTitle && <p className="text-sm text-gray-600">{senderTitle}</p>}
        </div>
      </div>

      {/* Footer */}
      <div className="px-10 pb-6">
        <div className="flex justify-center gap-8 text-xs text-gray-500 border-t pt-4" style={{ borderColor: `${brandColor}30` }}>
          {profile?.company_phone && <span>📞 {profile.company_phone}</span>}
          {profile?.company_address && <span>📍 {profile.company_address}</span>}
          {profile?.company_email && <span>✉ {profile.company_email}</span>}
        </div>
      </div>
    </div>
  );
};

export default ClassicLetterhead;
