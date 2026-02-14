import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Upload, Check } from "lucide-react";

const TEMPLATE_OPTIONS = [
  { value: "classic", label: "Classic Professional", desc: "Logo left, details right. Traditional corporate layout." },
  { value: "modern", label: "Modern Split", desc: "Brand color banner strip. Centered logo. Bold headers." },
  { value: "minimal", label: "Minimal", desc: "Ultra clean. Thin lines. Light typography." },
];

const COLOR_PRESETS = ["#2563EB", "#0F172A", "#16A34A", "#DC2626", "#7C3AED", "#0891B2", "#CA8A04", "#E11D48"];

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
        <p className="text-xs text-muted-foreground">Choose a layout style for your invoices and quotes.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {TEMPLATE_OPTIONS.map(t => (
            <button
              key={t.value}
              onClick={() => setForm({ ...form, template_style: t.value })}
              className={`rounded-xl border-2 p-4 text-left transition-all ${
                form.template_style === t.value
                  ? "border-foreground bg-secondary"
                  : "border-border hover:border-muted-foreground/50"
              }`}
            >
              <p className="font-medium text-sm">{t.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

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
