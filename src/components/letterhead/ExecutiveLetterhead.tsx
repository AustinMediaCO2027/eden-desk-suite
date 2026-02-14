import type { LetterheadTemplateProps } from "./LetterheadTypes";

/** Executive — Inspired by Template 3: Dark header band with logo and contact details */
const ExecutiveLetterhead = ({ profile, recipientName, recipientTitle, recipientCompany, recipientAddress, recipientPhone, recipientEmail, date, subject, body, closing, senderName, senderTitle, colorOverride }: LetterheadTemplateProps) => {
  const brandColor = colorOverride || profile?.brand_color || "#1A1A1A";

  return (
    <div className="bg-white text-black max-w-[210mm] mx-auto flex flex-col" style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif", minHeight: "297mm" }}>
      {/* Dark header band */}
      <div className="px-10 py-8" style={{ backgroundColor: brandColor }}>
        <div className="flex items-center gap-6">
          {profile?.logo_url && <img src={profile.logo_url} alt="Logo" className="h-16 object-contain brightness-0 invert" />}
          <div className="border-l-2 border-white/30 pl-6 space-y-0.5">
            {profile?.company_phone && <p className="text-sm text-white/80">{profile.company_phone}</p>}
            {profile?.company_email && <p className="text-sm text-white/80">{profile.company_email}</p>}
            {profile?.company_address && <p className="text-sm text-white/80">{profile.company_address}</p>}
            {profile?.company_website && <p className="text-sm text-white/80">{profile.company_website}</p>}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-10 flex-1 pt-8">
        {/* Recipient */}
        {recipientName && (
          <div className="mb-5 text-sm">
            <p className="text-gray-500 mb-1">To</p>
            <p className="font-bold text-gray-900">{recipientName}</p>
            {recipientTitle && <p className="text-gray-600">{recipientTitle}</p>}
            {recipientCompany && <p className="text-gray-600">{recipientCompany}</p>}
            {recipientAddress && <p className="text-gray-600">{recipientAddress}</p>}
            {recipientPhone && <p className="text-gray-600">{recipientPhone}</p>}
          </div>
        )}

        {/* Date right-aligned */}
        {date && (
          <p className="text-sm text-gray-700 text-right mb-6">Date: {date}</p>
        )}

        {subject && (
          <p className="text-sm font-bold text-gray-900 mb-4">Subject: {subject}</p>
        )}

        {/* Body */}
        <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap mb-8" style={{ textAlign: "justify" }}>
          {body}
        </div>

        {/* Closing */}
        <div className="mb-16">
          <p className="text-sm text-gray-800 mb-10">{closing}</p>
          <p className="text-sm font-bold text-gray-900">{senderName || profile?.company_name}</p>
          {senderTitle && <p className="text-sm text-gray-600">{senderTitle}</p>}
        </div>
      </div>

      {/* Footer accent */}
      <div className="h-2 w-full" style={{ backgroundColor: brandColor }} />
    </div>
  );
};

export default ExecutiveLetterhead;
