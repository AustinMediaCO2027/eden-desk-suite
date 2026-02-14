import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Upload, Image } from "lucide-react";

interface LogoUploadWidgetProps {
  logoUrl?: string | null;
}

const LogoUploadWidget = ({ logoUrl }: LogoUploadWidgetProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    await supabase.from("profiles").update({ logo_url: data.publicUrl }).eq("user_id", user.id);
    toast({ title: "Logo uploaded successfully" });
    setUploading(false);
    window.location.reload();
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-4">
        {logoUrl ? (
          <img src={logoUrl} alt="Logo" className="h-14 w-14 rounded-xl object-contain bg-secondary p-2" />
        ) : (
          <div className="h-14 w-14 rounded-xl bg-secondary flex items-center justify-center">
            <Image className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{logoUrl ? "Company Logo" : "Add Company Logo"}</p>
          <p className="text-xs text-muted-foreground">{logoUrl ? "Your logo will appear on documents" : "Upload a logo to brand your documents"}</p>
        </div>
        <label className="cursor-pointer shrink-0">
          <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleUpload} className="hidden" />
          <Button variant="outline" size="sm" asChild disabled={uploading}>
            <span><Upload className="h-3.5 w-3.5 mr-1.5" /> {uploading ? "Uploading..." : logoUrl ? "Change" : "Upload"}</span>
          </Button>
        </label>
      </div>
    </div>
  );
};

export default LogoUploadWidget;
