import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Download, FileText, AlertTriangle } from "lucide-react";

const SharedFilePage = () => {
  const { token } = useParams<{ token: string }>();
  const [file, setFile] = useState<any>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "expired" | "revoked">("loading");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchFile = async () => {
      if (!token) { setStatus("revoked"); return; }

      const { data, error } = await supabase
        .from("user_files")
        .select("*")
        .eq("share_token", token)
        .maybeSingle();

      if (error || !data) { setStatus("revoked"); return; }

      if (data.share_expiry && new Date(data.share_expiry) < new Date()) {
        setStatus("expired");
        return;
      }

      setFile(data);
      setStatus("ok");

      // Get download URL for preview
      const { data: dlData } = await supabase.storage
        .from("user-files")
        .createSignedUrl(data.storage_path, 3600);

      if (dlData?.signedUrl) setPreviewUrl(dlData.signedUrl);
    };

    fetchFile();
  }, [token]);

  const handleDownload = async () => {
    if (!file) return;
    const { data } = await supabase.storage.from("user-files").download(file.storage_path);
    if (data) {
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.file_name;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const isImage = file?.file_type?.startsWith("image/");
  const isPdf = file?.file_type === "application/pdf";

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <AlertTriangle className="h-12 w-12 text-yellow-500" />
        <h1 className="text-xl font-bold">This file link has expired.</h1>
        <p className="text-sm text-muted-foreground">Please request a new link from the file owner.</p>
      </div>
    );
  }

  if (status === "revoked") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h1 className="text-xl font-bold">This file is no longer available.</h1>
        <p className="text-sm text-muted-foreground">The link may have been revoked by the owner.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <div>
            <h1 className="text-sm font-semibold">{file?.file_name}</h1>
            <p className="text-xs text-muted-foreground">Shared file</p>
          </div>
        </div>
        <Button size="sm" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-1.5" /> Download
        </Button>
      </div>

      {/* Preview */}
      <div className="flex-1 flex items-center justify-center p-6 bg-black/50">
        {isPdf && previewUrl ? (
          <iframe src={previewUrl} className="w-full max-w-4xl h-[80vh] rounded-lg bg-white" />
        ) : isImage && previewUrl ? (
          <img src={previewUrl} alt={file?.file_name} className="max-w-full max-h-[80vh] rounded-lg object-contain" />
        ) : (
          <div className="text-center space-y-3">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">Preview not available. Please download file.</p>
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-1.5" /> Download
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedFilePage;
