import { Link } from "react-router-dom";
import { Profile } from "@/hooks/useProfile";
import { AlertCircle, Building2, Settings, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CompanyProfileBannerProps {
  profile: Profile | null;
  loading?: boolean;
}

const CompanyProfileBanner = ({ profile, loading }: CompanyProfileBannerProps) => {
  if (loading) return null;

  const hasLogo = !!profile?.logo_url;
  const hasCompanyName = !!profile?.company_name;
  const hasEmail = !!profile?.company_email;
  const hasPhone = !!profile?.company_phone;
  const hasAddress = !!profile?.company_address;
  const hasBanking = !!profile?.bank_name && !!profile?.bank_account_number;

  const isComplete = hasLogo && hasCompanyName && hasEmail && hasPhone && hasAddress && hasBanking;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start gap-4">
        {/* Logo */}
        <div className="shrink-0">
          {hasLogo ? (
            <img
              src={profile!.logo_url}
              alt="Company logo"
              className="h-14 w-14 rounded-lg object-contain bg-secondary p-1.5"
            />
          ) : (
            <div className="h-14 w-14 rounded-lg bg-secondary flex items-center justify-center">
              <Building2 className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Company Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-sm truncate">
              {hasCompanyName ? profile!.company_name : "Company Name Not Set"}
            </h3>
            {!isComplete && (
              <span className="shrink-0 flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                <AlertCircle className="h-3 w-3" /> Incomplete
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground space-y-0.5">
            {hasEmail && <p>{profile!.company_email}</p>}
            {hasPhone && <p>{profile!.company_phone}</p>}
            {hasAddress && <p className="truncate">{profile!.company_address}</p>}
            {!hasEmail && !hasPhone && (
              <p className="text-accent-foreground">Add your company details in Settings to appear on documents.</p>
            )}
          </div>
        </div>

        {/* Settings Link */}
        <Link to="/dashboard/settings" className="shrink-0">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Settings className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{isComplete ? "Edit" : "Setup"}</span>
          </Button>
        </Link>
      </div>

      {/* Missing items hint */}
      {!isComplete && (
        <div className="mt-3 pt-3 border-t border-border flex flex-wrap gap-2 text-[10px]">
          {!hasLogo && <span className="px-2 py-1 rounded-md bg-secondary text-muted-foreground">⬜ Logo</span>}
          {!hasCompanyName && <span className="px-2 py-1 rounded-md bg-secondary text-muted-foreground">⬜ Company Name</span>}
          {!hasEmail && <span className="px-2 py-1 rounded-md bg-secondary text-muted-foreground">⬜ Email</span>}
          {!hasPhone && <span className="px-2 py-1 rounded-md bg-secondary text-muted-foreground">⬜ Phone</span>}
          {!hasAddress && <span className="px-2 py-1 rounded-md bg-secondary text-muted-foreground">⬜ Address</span>}
          {!hasBanking && <span className="px-2 py-1 rounded-md bg-secondary text-muted-foreground">⬜ Banking</span>}
        </div>
      )}
    </div>
  );
};

export default CompanyProfileBanner;
