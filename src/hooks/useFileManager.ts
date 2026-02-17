import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";

export interface Folder {
  id: string;
  user_id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
}

export interface UserFile {
  id: string;
  user_id: string;
  folder_id: string | null;
  file_name: string;
  file_size: number;
  file_type: string;
  storage_path: string;
  share_token: string | null;
  share_expiry: string | null;
  created_at: string;
}

const BASE_STORAGE: Record<string, number> = {
  silver: 100 * 1024 * 1024, // 100MB
  premium: 1024 * 1024 * 1024, // 1GB
  yearly: 1024 * 1024 * 1024, // 1GB
};

const DEFAULT_FOLDERS = ["Invoices", "Quotes", "Contracts", "General"];

export const useFileManager = () => {
  const { user } = useAuth();
  const { profile, updateProfile, refetch: refetchProfile } = useProfile();
  const { currentPlan } = useSubscription();
  const { toast } = useToast();

  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<UserFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const hasAccess = ["silver", "premium", "yearly"].includes(currentPlan);

  const baseStorageLimit = BASE_STORAGE[currentPlan] || 0;
  const addOnStorage = (profile as any)?.add_on_storage ?? 0;
  const totalStorageLimit = baseStorageLimit + addOnStorage;
  const storageUsed = (profile as any)?.storage_used ?? 0;

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [foldersRes, filesRes] = await Promise.all([
      supabase.from("folders").select("*").eq("user_id", user.id).order("name"),
      supabase.from("user_files").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]);
    if (foldersRes.data) setFolders(foldersRes.data as unknown as Folder[]);
    if (filesRes.data) setFiles(filesRes.data as unknown as UserFile[]);
    setLoading(false);
  }, [user]);

  // Create default folders on first load
  const ensureDefaultFolders = useCallback(async () => {
    if (!user || !hasAccess) return;
    const { data: existing } = await supabase.from("folders").select("name").eq("user_id", user.id);
    const existingNames = (existing || []).map((f: any) => f.name);
    const missing = DEFAULT_FOLDERS.filter((n) => !existingNames.includes(n));
    if (missing.length > 0) {
      await supabase.from("folders").insert(missing.map((name) => ({ user_id: user.id, name })));
      await fetchData();
    }
  }, [user, hasAccess, fetchData]);

  useEffect(() => {
    if (hasAccess) {
      fetchData().then(() => ensureDefaultFolders());
    }
  }, [hasAccess, fetchData, ensureDefaultFolders]);

  const createFolder = async (name: string, parentId?: string) => {
    if (!user) return;
    const { error } = await supabase.from("folders").insert({
      user_id: user.id,
      name,
      parent_id: parentId || null,
    });
    if (error) toast({ title: "Error creating folder", variant: "destructive" });
    else await fetchData();
  };

  const renameFolder = async (id: string, name: string) => {
    const { error } = await supabase.from("folders").update({ name }).eq("id", id);
    if (!error) await fetchData();
  };

  const deleteFolder = async (id: string) => {
    // Delete files in folder first
    const folderFiles = files.filter((f) => f.folder_id === id);
    for (const file of folderFiles) {
      await deleteFile(file.id);
    }
    await supabase.from("folders").delete().eq("id", id);
    await fetchData();
  };

  const uploadFile = async (file: File, folderId?: string) => {
    if (!user) return;
    if (file.size > 20 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 20MB per file", variant: "destructive" });
      return;
    }
    if (storageUsed + file.size > totalStorageLimit) {
      toast({ title: "Storage limit reached", description: "Upgrade your storage to continue uploading.", variant: "destructive" });
      return { limitReached: true };
    }

    setUploading(true);
    setUploadProgress(10);

    const path = `${user.id}/${Date.now()}_${file.name}`;
    const { error: storageError } = await supabase.storage.from("user-files").upload(path, file);
    setUploadProgress(60);

    if (storageError) {
      toast({ title: "Upload failed", description: storageError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { error: dbError } = await supabase.from("user_files").insert({
      user_id: user.id,
      folder_id: folderId || null,
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
      storage_path: path,
    });
    setUploadProgress(80);

    if (dbError) {
      toast({ title: "Error saving file record", variant: "destructive" });
    } else {
      // Update storage used
      await updateProfile({ storage_used: storageUsed + file.size } as any);
      await refetchProfile();
    }

    setUploadProgress(100);
    setTimeout(() => {
      setUploading(false);
      setUploadProgress(0);
    }, 500);
    await fetchData();
  };

  const deleteFile = async (fileId: string) => {
    const file = files.find((f) => f.id === fileId);
    if (!file) return;
    await supabase.storage.from("user-files").remove([file.storage_path]);
    await supabase.from("user_files").delete().eq("id", fileId);
    const newUsed = Math.max(0, storageUsed - file.file_size);
    await updateProfile({ storage_used: newUsed } as any);
    await refetchProfile();
    await fetchData();
  };

  const renameFile = async (fileId: string, newName: string) => {
    await supabase.from("user_files").update({ file_name: newName }).eq("id", fileId);
    await fetchData();
  };

  const moveFile = async (fileId: string, folderId: string | null) => {
    await supabase.from("user_files").update({ folder_id: folderId }).eq("id", fileId);
    await fetchData();
  };

  const downloadFile = async (file: UserFile) => {
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

  const shareFile = async (fileId: string, expiryDays: number = 7) => {
    const token = crypto.randomUUID().replace(/-/g, "");
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + expiryDays);
    await supabase.from("user_files").update({ share_token: token, share_expiry: expiry.toISOString() }).eq("id", fileId);
    await fetchData();
    return token;
  };

  const revokeShare = async (fileId: string) => {
    await supabase.from("user_files").update({ share_token: null, share_expiry: null }).eq("id", fileId);
    await fetchData();
  };

  return {
    folders,
    files,
    loading,
    uploading,
    uploadProgress,
    hasAccess,
    storageUsed,
    totalStorageLimit,
    baseStorageLimit,
    addOnStorage,
    currentPlan,
    createFolder,
    renameFolder,
    deleteFolder,
    uploadFile,
    deleteFile,
    renameFile,
    moveFile,
    downloadFile,
    shareFile,
    revokeShare,
    fetchData,
  };
};
