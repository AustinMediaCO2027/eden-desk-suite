import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Upload, PenTool, X } from "lucide-react";

interface SignatureUploadWidgetProps {
  signatureUrl?: string | null;
  onUploaded: (url: string) => void;
  onRemoved: () => void;
}

const SignatureUploadWidget = ({ signatureUrl, onUploaded, onRemoved }: SignatureUploadWidgetProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/signature.${ext}`;
    const { error: uploadError } = await supabase.storage.from("logos").upload(path, file, { upsert: true });
    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("logos").getPublicUrl(path);
    onUploaded(data.publicUrl);
    toast({ title: "Signature uploaded" });
    setUploading(false);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-4">
        {signatureUrl ? (
          <img src={signatureUrl} alt="Signature" className="h-12 w-24 rounded-lg object-contain bg-secondary p-1" />
        ) : (
          <div className="h-12 w-24 rounded-lg bg-secondary flex items-center justify-center">
            <PenTool className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{signatureUrl ? "Signature" : "Add Signature"}</p>
          <p className="text-xs text-muted-foreground">Upload a handwritten signature image (PNG with transparent background works best)</p>
        </div>
        <div className="flex gap-2 shrink-0">
          {signatureUrl && (
            <Button variant="ghost" size="sm" onClick={onRemoved}>
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
          <label className="cursor-pointer">
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleUpload} className="hidden" />
            <Button variant="outline" size="sm" asChild disabled={uploading}>
              <span><Upload className="h-3.5 w-3.5 mr-1.5" /> {uploading ? "Uploading..." : signatureUrl ? "Change" : "Upload"}</span>
            </Button>
          </label>
        </div>
      </div>
    </div>
  );
};

export default SignatureUploadWidget;
