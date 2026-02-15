import type { LetterheadTemplateProps } from "./LetterheadTypes";

/** Executive — Figma-inspired: Dark header band with logo, clean content, structured footer */
const ExecutiveLetterhead = ({ profile, recipientName, recipientTitle, recipientCompany, recipientAddress, recipientPhone, recipientEmail, date, subject, body, closing, senderName, senderTitle, colorOverride }: LetterheadTemplateProps) => {
  const brandColor = colorOverride || profile?.brand_color || "#1A1A1A";

  return (
    <div className="bg-white text-black max-w-[210mm] mx-auto flex flex-col" style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif", minHeight: "297mm" }}>
      {/* Dark header band */}
      <div className="px-10 py-6" style={{ backgroundColor: brandColor }}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {profile?.logo_url && <img src={profile.logo_url} alt="Logo" className="h-12 object-contain brightness-0 invert" />}
            <h1 className="text-lg font-bold text-white tracking-tight">{profile?.company_name || "Your Company"}</h1>
          </div>
          <div className="text-right text-[9px] uppercase tracking-wider text-white/70 leading-relaxed">
            {profile?.company_address && <p>{profile.company_address}</p>}
            {profile?.company_phone && <p>{profile.company_phone}</p>}
            {profile?.company_email && <p>{profile.company_email}</p>}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-10 flex-1 pt-8">
        {/* Subject */}
        {subject && (
          <div className="mb-6">
            <h2 className="text-base font-bold text-gray-900 mb-1.5">{subject}</h2>
            <div className="h-[3px] w-12 rounded-full" style={{ backgroundColor: brandColor }} />
          </div>
        )}

        {/* Date */}
        {date && <p className="text-xs text-gray-500 mb-4">{date}</p>}

        {/* Recipient */}
        {recipientName && (
          <div className="mb-5 text-sm">
            <p className="text-gray-400 text-[10px] uppercase tracking-widest mb-1">To</p>
            <p className="font-bold text-gray-900">{recipientName}</p>
            {recipientTitle && <p className="text-xs text-gray-600">{recipientTitle}</p>}
            {recipientCompany && <p className="text-xs text-gray-600">{recipientCompany}</p>}
            {recipientAddress && <p className="text-xs text-gray-500">{recipientAddress}</p>}
          </div>
        )}

        {/* Body */}
        <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap mb-8" style={{ textAlign: "justify" }}>
          {body}
        </div>

        {/* Closing */}
        <div className="mb-16">
          <p className="text-sm text-gray-800 mb-1">{closing}</p>
          <p className="text-sm font-bold text-gray-900">{senderName || profile?.company_name}</p>
          {senderTitle && <p className="text-xs text-gray-600">{senderTitle}</p>}
        </div>
      </div>

      {/* Footer */}
      <div className="px-10 pb-6 mt-auto">
        <div className="h-[1px] w-full bg-gray-200 mb-3" />
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

export default ExecutiveLetterhead;
