import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Upload } from "lucide-react";

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
    <div className="space-y-6 max-w-2xl">
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
          <div className="space-y-2">
            <Label>Company Name</Label>
            <Input value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} className="bg-secondary" />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={form.company_email} onChange={e => setForm({ ...form, company_email: e.target.value })} className="bg-secondary" />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={form.company_phone} onChange={e => setForm({ ...form, company_phone: e.target.value })} className="bg-secondary" />
          </div>
          <div className="space-y-2">
            <Label>Website</Label>
            <Input value={form.company_website} onChange={e => setForm({ ...form, company_website: e.target.value })} className="bg-secondary" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Address</Label>
          <Input value={form.company_address} onChange={e => setForm({ ...form, company_address: e.target.value })} className="bg-secondary" />
        </div>
        <Button onClick={handleSave}><Save className="h-4 w-4 mr-1" /> Save Settings</Button>
      </div>

      {/* Account */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h3 className="font-semibold">Account</h3>
        <p className="text-sm text-muted-foreground">Logged in as {user?.email}</p>
        <p className="text-sm text-muted-foreground">
          Plan: <span className="capitalize font-medium text-foreground">{profile?.subscription_plan || "trial"}</span>
        </p>
      </div>
    </div>
  );
};

export default SettingsPage;
