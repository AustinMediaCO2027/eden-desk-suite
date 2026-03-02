import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Upload, Check } from "lucide-react";
import { INVOICE_TEMPLATE_OPTIONS, QUOTE_TEMPLATE_OPTIONS } from "@/components/templates/DocumentPreview";
import EmailDiagnosticsPanel from "@/components/settings/EmailDiagnosticsPanel";

const COLOR_PRESETS = ["#2563EB", "#0F172A", "#16A34A", "#DC2626", "#7C3AED", "#0891B2", "#CA8A04", "#E11D48", "#1B2A4A", "#6B1D1D", "#B8860B", "#4B5563"];

// Mini visual thumbnail for template picker
const TemplateThumbnail = ({ style, brandColor }: { style: string; brandColor: string }) => {
  const base = "w-full h-28 bg-white rounded-t-lg p-2 flex flex-col";
  
  if (style === "bold") return (
    <div className={base}>
      <div className="h-8 rounded-sm mb-1.5 flex items-center px-2" style={{ backgroundColor: brandColor }}>
        <div className="w-6 h-2 bg-white/60 rounded-sm" />
        <div className="ml-auto w-10 h-3 bg-white/80 rounded-sm" />
      </div>
      <div className="flex-1 px-1 space-y-1">
        <div className="flex gap-1"><div className="w-8 h-1.5 bg-gray-200 rounded-sm" /><div className="w-12 h-1.5 bg-gray-200 rounded-sm" /></div>
        <div className="h-[1px] bg-gray-200" />
        <div className="space-y-0.5"><div className="w-full h-1 bg-gray-100 rounded-sm" /><div className="w-full h-1 bg-gray-100 rounded-sm" /></div>
        <div className="ml-auto w-12 h-3 rounded-sm" style={{ backgroundColor: brandColor }} />
      </div>
    </div>
  );

  if (style === "modern") return (
    <div className={base}>
      <div className="h-1 w-full rounded-t-sm" style={{ backgroundColor: brandColor }} />
      <div className="flex-1 flex flex-col items-center pt-2 space-y-1">
        <div className="w-6 h-3 bg-gray-200 rounded-sm" />
        <div className="w-16 h-1.5 bg-gray-300 rounded-sm" />
        <div className="w-full rounded-sm p-1 mt-1" style={{ backgroundColor: `${brandColor}10` }}>
          <div className="flex justify-between"><div className="w-10 h-2 rounded-sm" style={{ backgroundColor: `${brandColor}40` }} /><div className="w-8 h-1.5 bg-gray-200 rounded-sm" /></div>
        </div>
        <div className="w-full space-y-0.5"><div className="h-2 rounded-sm" style={{ backgroundColor: brandColor }} /><div className="w-full h-1 bg-gray-100 rounded-sm" /><div className="w-full h-1 bg-gray-50 rounded-sm" /></div>
      </div>
      <div className="h-1 w-full rounded-b-sm" style={{ backgroundColor: brandColor }} />
    </div>
  );

  if (style === "minimal") return (
    <div className={base}>
      <div className="flex justify-between items-start px-1 pt-1">
        <div><div className="w-14 h-2 bg-gray-200 rounded-sm mb-1" /><div className="w-6 h-1 bg-gray-100 rounded-sm" /></div>
        <div className="space-y-0.5 text-right"><div className="w-10 h-1.5 bg-gray-300 rounded-sm ml-auto" /><div className="w-8 h-1 bg-gray-100 rounded-sm ml-auto" /></div>
      </div>
      <div className="h-[1px] bg-gray-200 my-2" />
      <div className="flex-1 space-y-1 px-1">
        <div className="flex gap-4"><div className="w-6 h-1 bg-gray-100 rounded-sm" /><div className="w-8 h-1 bg-gray-100 rounded-sm" /></div>
        <div className="h-[1px] bg-gray-100" />
        <div className="space-y-0.5"><div className="w-full h-1 bg-gray-100 rounded-sm" /><div className="w-full h-1 bg-gray-100 rounded-sm" /></div>
        <div className="ml-auto w-10 h-1.5 rounded-sm" style={{ backgroundColor: brandColor }} />
      </div>
    </div>
  );

  if (style === "elegant") return (
    <div className={base}>
      <div className="h-[2px] w-full" style={{ backgroundColor: brandColor }} />
      <div className="flex-1 flex flex-col items-center pt-2 space-y-1">
        <div className="w-4 h-3 bg-gray-200 rounded-sm" />
        <div className="w-10 h-2 bg-gray-200 rounded-sm" style={{ fontStyle: "italic" }} />
        <div className="w-6 h-[2px]" style={{ backgroundColor: brandColor }} />
        <div className="flex justify-between w-full px-2 pt-1"><div className="space-y-0.5"><div className="w-6 h-1 bg-gray-200 rounded-sm" /><div className="w-10 h-1 bg-gray-100 rounded-sm" /></div><div className="space-y-0.5 text-right"><div className="w-6 h-1 bg-gray-200 rounded-sm ml-auto" /><div className="w-10 h-1 bg-gray-100 rounded-sm ml-auto" /></div></div>
        <div className="h-[1px] w-full bg-gray-200" />
        <div className="space-y-0.5 w-full"><div className="w-full h-1 bg-gray-100 rounded-sm" /><div className="w-full h-1 bg-gray-100 rounded-sm" /></div>
      </div>
      <div className="h-[2px] w-full" style={{ backgroundColor: brandColor }} />
    </div>
  );

  if (style === "creative") return (
    <div className={`${base} !flex-row !p-0`}>
      <div className="w-4 h-full rounded-l-lg" style={{ backgroundColor: brandColor }} />
      <div className="flex-1 p-2 space-y-1">
        <div className="flex justify-between"><div className="w-14 h-2.5 bg-gray-300 rounded-sm" /><div className="space-y-0.5"><div className="w-10 h-1 bg-gray-200 rounded-sm" /><div className="w-8 h-1 bg-gray-100 rounded-sm" /></div></div>
        <div className="grid grid-cols-2 gap-1 mt-1"><div className="rounded-sm p-1" style={{ backgroundColor: `${brandColor}08` }}><div className="w-8 h-1 rounded-sm" style={{ backgroundColor: `${brandColor}30` }} /><div className="w-6 h-1 bg-gray-100 rounded-sm mt-0.5" /></div><div className="rounded-sm p-1" style={{ backgroundColor: `${brandColor}08` }}><div className="w-8 h-1 rounded-sm" style={{ backgroundColor: `${brandColor}30` }} /><div className="w-10 h-1 bg-gray-100 rounded-sm mt-0.5" /></div></div>
        <div className="space-y-0.5"><div className="w-full h-1 bg-gray-100 rounded-sm" /><div className="w-full h-1 bg-gray-100 rounded-sm" /></div>
        <div className="ml-auto w-10 h-1.5 rounded-sm" style={{ backgroundColor: brandColor }} />
      </div>
    </div>
  );

  // Natural (template7) – olive header band, warm bg, table with colored header
  if (style === "template7") return (
    <div className={base} style={{ backgroundColor: "#fefff8" }}>
      <div className="h-1 w-full rounded-t-sm" style={{ backgroundColor: brandColor }} />
      <div className="h-6 w-full flex items-center px-2 gap-1" style={{ backgroundColor: brandColor }}>
        <div className="w-4 h-3 bg-white/40 rounded-sm" />
        <div className="w-10 h-1.5 bg-white/70 rounded-sm" />
        <div className="ml-auto w-12 h-2.5 bg-white/30 rounded-sm" />
      </div>
      <div className="flex-1 p-1.5 space-y-1">
        <div className="flex justify-between"><div className="space-y-0.5"><div className="w-8 h-1 bg-gray-200 rounded-sm" /><div className="w-6 h-1 bg-gray-100 rounded-sm" /></div><div className="space-y-0.5 text-right"><div className="w-10 h-1 bg-gray-200 rounded-sm ml-auto" /><div className="w-8 h-1 bg-gray-100 rounded-sm ml-auto" /></div></div>
        <div className="w-full h-2 rounded-sm flex items-center px-1 gap-2" style={{ backgroundColor: brandColor }}>
          <div className="w-8 h-1 bg-white/60 rounded-sm" /><div className="w-4 h-1 bg-white/40 rounded-sm ml-auto" />
        </div>
        <div className="space-y-0.5"><div className="w-full h-1 bg-gray-100 rounded-sm" /><div className="w-full h-1 bg-gray-100 rounded-sm" /></div>
        <div className="ml-auto w-12 h-2 rounded-sm" style={{ backgroundColor: brandColor }} />
      </div>
    </div>
  );

  // Classic (default)
  return (
    <div className={base}>
      <div className="flex justify-between items-start px-1 pt-1">
        <div className="w-6 h-4 bg-gray-200 rounded-sm" />
        <div className="space-y-0.5 text-right"><div className="w-12 h-1.5 bg-gray-300 rounded-sm" /><div className="w-8 h-1 bg-gray-100 rounded-sm ml-auto" /></div>
      </div>
      <div className="h-[2px] w-full my-2" style={{ backgroundColor: brandColor }} />
      <div className="flex-1 space-y-1 px-1">
        <div className="flex justify-between"><div className="w-12 h-2 rounded-sm" style={{ backgroundColor: `${brandColor}30` }} /><div className="space-y-0.5"><div className="w-10 h-1 bg-gray-200 rounded-sm" /><div className="w-8 h-1 bg-gray-100 rounded-sm" /></div></div>
        <div className="w-full h-2 rounded-sm" style={{ backgroundColor: `${brandColor}10` }} />
        <div className="space-y-0.5"><div className="w-full h-1 bg-gray-100 rounded-sm" /><div className="w-full h-1 bg-gray-100 rounded-sm" /></div>
        <div className="ml-auto w-10 h-1.5 rounded-sm" style={{ backgroundColor: `${brandColor}30` }} />
      </div>
    </div>
  );
};

const SettingsPage = () => {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const { toast } = useToast();
  const [form, setForm] = useState({
    company_name: "",
    company_email: "",
    company_phone: "",
    company_address: "",
    company_website: "",
    registration_number: "",
    vat_number: "",
    brand_color: "#2563EB",
    template_style: "classic",
    bank_name: "",
    bank_account_holder: "",
    bank_account_number: "",
    bank_branch_code: "",
    bank_account_type: "",
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        company_name: profile.company_name || "",
        company_email: profile.company_email || "",
        company_phone: profile.company_phone || "",
        company_address: profile.company_address || "",
        company_website: profile.company_website || "",
        registration_number: profile.registration_number || "",
        vat_number: profile.vat_number || "",
        brand_color: profile.brand_color || "#2563EB",
        template_style: profile.template_style || "classic",
        bank_name: profile.bank_name || "",
        bank_account_holder: profile.bank_account_holder || "",
        bank_account_number: profile.bank_account_number || "",
        bank_branch_code: profile.bank_branch_code || "",
        bank_account_type: profile.bank_account_type || "",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    const error = await updateProfile(form);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Settings saved" });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/logo.${ext}`;
    const { error: uploadError } = await supabase.storage.from("logos").upload(path, file, { upsert: true });
    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("logos").getPublicUrl(path);
    await updateProfile({ logo_url: data.publicUrl });
    toast({ title: "Logo uploaded" });
    setUploading(false);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Logo Upload */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h3 className="font-semibold">Company Logo</h3>
        <div className="flex items-center gap-4">
          {profile?.logo_url ? (
            <img src={profile.logo_url} alt="Logo" className="h-16 w-16 rounded-lg object-contain bg-secondary p-2" />
          ) : (
            <div className="h-16 w-16 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground text-xs">No logo</div>
          )}
          <label className="cursor-pointer">
            <input type="file" accept="image/png,image/jpeg" onChange={handleLogoUpload} className="hidden" />
            <Button variant="outline" size="sm" asChild disabled={uploading}>
              <span><Upload className="h-4 w-4 mr-1" /> {uploading ? "Uploading..." : "Upload Logo"}</span>
            </Button>
          </label>
        </div>
      </div>

      {/* Company Details */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h3 className="font-semibold">Company Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Company Name</Label><Input value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} className="bg-secondary" /></div>
          <div className="space-y-2"><Label>Email</Label><Input value={form.company_email} onChange={e => setForm({ ...form, company_email: e.target.value })} className="bg-secondary" /></div>
          <div className="space-y-2"><Label>Phone</Label><Input value={form.company_phone} onChange={e => setForm({ ...form, company_phone: e.target.value })} className="bg-secondary" /></div>
          <div className="space-y-2"><Label>Website</Label><Input value={form.company_website} onChange={e => setForm({ ...form, company_website: e.target.value })} className="bg-secondary" /></div>
          <div className="space-y-2"><Label>Registration Number</Label><Input value={form.registration_number} onChange={e => setForm({ ...form, registration_number: e.target.value })} className="bg-secondary" placeholder="e.g. 2024/123456/07" /></div>
          <div className="space-y-2"><Label>VAT Number</Label><Input value={form.vat_number} onChange={e => setForm({ ...form, vat_number: e.target.value })} className="bg-secondary" placeholder="e.g. 4123456789" /></div>
        </div>
        <div className="space-y-2"><Label>Address</Label><Input value={form.company_address} onChange={e => setForm({ ...form, company_address: e.target.value })} className="bg-secondary" /></div>
      </div>

      {/* Banking Details */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h3 className="font-semibold">Banking Details</h3>
        <p className="text-xs text-muted-foreground">Displayed on invoices for client payments.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Bank Name</Label><Input value={form.bank_name} onChange={e => setForm({ ...form, bank_name: e.target.value })} className="bg-secondary" /></div>
          <div className="space-y-2"><Label>Account Holder</Label><Input value={form.bank_account_holder} onChange={e => setForm({ ...form, bank_account_holder: e.target.value })} className="bg-secondary" /></div>
          <div className="space-y-2"><Label>Account Number</Label><Input value={form.bank_account_number} onChange={e => setForm({ ...form, bank_account_number: e.target.value })} className="bg-secondary" /></div>
          <div className="space-y-2"><Label>Branch Code</Label><Input value={form.bank_branch_code} onChange={e => setForm({ ...form, bank_branch_code: e.target.value })} className="bg-secondary" /></div>
          <div className="space-y-2"><Label>Account Type</Label>
            <select value={form.bank_account_type} onChange={e => setForm({ ...form, bank_account_type: e.target.value })} className="w-full h-10 rounded-lg border border-border bg-secondary px-3 text-sm">
              <option value="">Select type</option>
              <option value="Cheque">Cheque</option>
              <option value="Savings">Savings</option>
              <option value="Current">Current</option>
              <option value="Transmission">Transmission</option>
            </select>
          </div>
        </div>
      </div>

      {/* Brand Color */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h3 className="font-semibold">Brand Color</h3>
        <p className="text-xs text-muted-foreground">Used for dividers, headers, and accents on your invoices & quotes.</p>
        <div className="flex items-center gap-3 flex-wrap">
          {COLOR_PRESETS.map(c => (
            <button
              key={c}
              onClick={() => setForm({ ...form, brand_color: c })}
              className="w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all"
              style={{ backgroundColor: c, borderColor: form.brand_color === c ? "#fff" : "transparent" }}
            >
              {form.brand_color === c && <Check className="h-4 w-4 text-white" />}
            </button>
          ))}
          <div className="flex items-center gap-2 ml-2">
            <input
              type="color"
              value={form.brand_color}
              onChange={e => setForm({ ...form, brand_color: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer border-0 p-0"
            />
            <span className="text-xs text-muted-foreground font-mono">{form.brand_color}</span>
          </div>
        </div>
      </div>

      {/* Template Style */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h3 className="font-semibold">Invoice Template</h3>
        <p className="text-xs text-muted-foreground">Choose a layout style for your invoices and quotes. You can also switch templates when previewing.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {INVOICE_TEMPLATE_OPTIONS.map(t => (
            <button
              key={t.value}
              onClick={() => setForm({ ...form, template_style: t.value })}
              className={`rounded-xl border-2 overflow-hidden transition-all ${
                form.template_style === t.value
                  ? "border-foreground ring-2 ring-foreground/20"
                  : "border-border hover:border-muted-foreground/50"
              }`}
            >
              {/* Mini preview visual */}
              <TemplateThumbnail style={t.value} brandColor={form.brand_color} />
              <div className="p-3 text-left">
                <p className="font-medium text-xs">{t.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{t.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Email Diagnostics */}
      <EmailDiagnosticsPanel />

      {/* Account */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h3 className="font-semibold">Account</h3>
        <p className="text-sm text-muted-foreground">Logged in as {user?.email}</p>
        <p className="text-sm text-muted-foreground">
          Plan: <span className="capitalize font-medium text-foreground">{profile?.subscription_plan || "trial"}</span>
        </p>
      </div>

      <Button onClick={handleSave} className="w-full md:w-auto"><Save className="h-4 w-4 mr-1" /> Save All Settings</Button>
    </div>
  );
};

export default SettingsPage;
