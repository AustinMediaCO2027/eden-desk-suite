import { submitPayFastForm } from "@/lib/payfast";
import { useState, useRef, useCallback } from "react";
import { useFileManager, Folder, UserFile } from "@/hooks/useFileManager";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import UpgradeDialog from "@/components/UpgradeDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  FolderPlus,
  Search,
  Folder as FolderIcon,
  FileText,
  Image,
  FileSpreadsheet,
  MoreVertical,
  Download,
  Pencil,
  Trash2,
  Share2,
  FolderInput,
  Copy,
  Link,
  X,
  Package,
  ArrowRight,
  Lock,
  Eye,
} from "lucide-react";

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
};

const getFileIcon = (type: string) => {
  if (type.startsWith("image/")) return <Image className="h-6 w-6 text-sidebar-primary" />;
  if (type.includes("spreadsheet") || type.includes("xlsx")) return <FileSpreadsheet className="h-6 w-6 text-emerald-500" />;
  return <FileText className="h-6 w-6 text-blue-500" />;
};

const STORAGE_ADDONS = [
  { label: "5 GB", bytes: 5 * 1024 * 1024 * 1024, price: "R185", amount: "185.00" },
  { label: "10 GB", bytes: 10 * 1024 * 1024 * 1024, price: "R250", amount: "250.00" },
  { label: "30 GB", bytes: 30 * 1024 * 1024 * 1024, price: "R400", amount: "400.00" },
];

const FilesPage = () => {
  const {
    folders,
    files,
    loading,
    uploading,
    uploadProgress,
    hasAccess,
    storageUsed,
    totalStorageLimit,
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
  } = useFileManager();

  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();

  const [showUpgrade, setShowUpgrade] = useState(!hasAccess);
  const [search, setSearch] = useState("");
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [renameDialog, setRenameDialog] = useState<{ type: "file" | "folder"; id: string; name: string } | null>(null);
  const [moveDialog, setMoveDialog] = useState<{ fileId: string; currentFolder: string | null } | null>(null);
  const [shareDialog, setShareDialog] = useState<{ fileId: string; token?: string } | null>(null);
  const [shareExpiry, setShareExpiry] = useState("7");
  const [storageLimitDialog, setStorageLimitDialog] = useState(false);
  const [addonLoading, setAddonLoading] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [previewFile, setPreviewFile] = useState<UserFile | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // If no access, show upgrade modal
  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <Lock className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-bold">File Manager</h2>
        <p className="text-muted-foreground max-w-sm text-sm">
          File Manager is available on Silver and Premium plans. Upgrade to unlock secure file storage.
        </p>
        <UpgradeDialog
          open={showUpgrade}
          onOpenChange={setShowUpgrade}
          feature="File Manager"
          requiredPlan="Silver"
        />
        <Button onClick={() => setShowUpgrade(true)}>Upgrade Plan</Button>
      </div>
    );
  }

  const storagePercent = totalStorageLimit > 0 ? Math.min(100, (storageUsed / totalStorageLimit) * 100) : 0;

  const filteredFiles = files.filter((f) => {
    const matchesFolder = activeFolderId ? f.folder_id === activeFolderId : true;
    const matchesSearch = search ? f.file_name.toLowerCase().includes(search.toLowerCase()) : true;
    return matchesFolder && matchesSearch;
  });

  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList) return;
    for (const file of Array.from(fileList)) {
      const result = await uploadFile(file, activeFolderId || undefined);
      if (result?.limitReached) {
        setStorageLimitDialog(true);
        break;
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    await createFolder(newFolderName.trim());
    setNewFolderName("");
    setNewFolderOpen(false);
  };

  const handleRename = async () => {
    if (!renameDialog || !renameDialog.name.trim()) return;
    if (renameDialog.type === "folder") await renameFolder(renameDialog.id, renameDialog.name);
    else await renameFile(renameDialog.id, renameDialog.name);
    setRenameDialog(null);
  };

  const handleMove = async (targetFolderId: string) => {
    if (!moveDialog) return;
    await moveFile(moveDialog.fileId, targetFolderId === "root" ? null : targetFolderId);
    setMoveDialog(null);
  };

  const handleShare = async () => {
    if (!shareDialog) return;
    const token = await shareFile(shareDialog.fileId, parseInt(shareExpiry));
    setShareDialog({ ...shareDialog, token });
  };

  const handleCopyLink = (token: string) => {
    const url = `https://eden-desk.com/share/${token}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied!" });
  };

  const handlePreview = async (file: UserFile) => {
    setPreviewFile(file);
    const { data } = await supabase.storage
      .from("user-files")
      .createSignedUrl(file.storage_path, 3600);
    if (data?.signedUrl) setPreviewUrl(data.signedUrl);
  };

  const closePreview = () => {
    setPreviewFile(null);
    setPreviewUrl(null);
  };

  const handleAddonPurchase = async (addon: typeof STORAGE_ADDONS[0]) => {
    if (!user) return;
    setAddonLoading(addon.label);
    try {
      const { data, error } = await supabase.functions.invoke("payfast-checkout", {
        body: {
          planName: `Storage Add-on ${addon.label}`,
          planId: `storage-${addon.label.toLowerCase().replace(" ", "")}`,
          amount: addon.amount,
          period: "/month",
          userEmail: user.email,
          userId: user.id,
          companyName: profile?.company_name,
          returnUrl: `${window.location.origin}/dashboard/files?storage=success`,
          cancelUrl: `${window.location.origin}/dashboard/files?storage=cancelled`,
        },
      });
      if (error) throw error;
      submitPayFastForm(data.paymentUrl, data.params as Record<string, string>);
    } catch (err: any) {
      toast({ title: "Payment error", description: err.message, variant: "destructive" });
    } finally {
      setAddonLoading(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">File Manager</h1>
          <p className="text-sm text-muted-foreground">Manage your business documents securely.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setNewFolderOpen(true)}>
            <FolderPlus className="h-4 w-4 mr-1.5" /> New Folder
          </Button>
          <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            <Upload className="h-4 w-4 mr-1.5" /> Upload
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg"
            multiple
            onChange={(e) => handleUpload(e.target.files)}
          />
        </div>
      </div>

      {/* Storage Usage Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Storage Used</span>
            <span className="text-sm text-muted-foreground">
              {formatBytes(storageUsed)} / {formatBytes(totalStorageLimit)}
            </span>
          </div>
          <Progress value={storagePercent} className="h-2.5" />
          {storagePercent > 90 && (
            <p className="text-xs text-destructive mt-1.5">Storage almost full. Consider upgrading.</p>
          )}
        </CardContent>
      </Card>

      {/* Upload progress */}
      {uploading && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Upload className="h-4 w-4 text-sidebar-primary animate-pulse" />
              <div className="flex-1">
                <Progress value={uploadProgress} className="h-2" />
              </div>
              <span className="text-xs text-muted-foreground">{uploadProgress}%</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Storage Upsell */}
      <Card className="border-sidebar-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Package className="h-4 w-4 text-sidebar-primary" />
            <span className="text-sm font-semibold">Need More Storage?</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {STORAGE_ADDONS.map((addon) => (
              <div
                key={addon.label}
                className="rounded-lg border border-border bg-card p-3 flex flex-col items-center text-center eden-card-hover"
              >
                <span className="text-lg font-bold">{addon.label}</span>
                <span className="text-sm text-muted-foreground mb-2">{addon.price}/month</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs"
                  onClick={() => handleAddonPurchase(addon)}
                  disabled={addonLoading === addon.label}
                >
                  {addonLoading === addon.label ? "Processing..." : "Add Storage"}
                  {!addonLoading && <ArrowRight className="h-3 w-3 ml-1" />}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search files..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Drag & Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragOver ? "border-sidebar-primary bg-sidebar-primary/5" : "border-border"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">Drag & drop files here, or click Upload above</p>
        <p className="text-xs text-muted-foreground/60 mt-1">PDF, DOCX, XLSX, PNG, JPG — Max 20MB each</p>
      </div>

      {/* Folders */}
      <div>
        <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">Folders</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <button
            onClick={() => setActiveFolderId(null)}
            className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center text-sm transition-all eden-card-hover ${
              !activeFolderId ? "border-sidebar-primary bg-sidebar-primary/5" : "border-border"
            }`}
          >
            <FolderIcon className="h-8 w-8 text-sidebar-primary" />
            <span className="truncate w-full font-medium">All Files</span>
          </button>
          {folders.map((folder) => (
            <div
              key={folder.id}
              className={`relative flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center text-sm transition-all eden-card-hover cursor-pointer ${
                activeFolderId === folder.id ? "border-sidebar-primary bg-sidebar-primary/5" : "border-border"
              }`}
              onClick={() => setActiveFolderId(folder.id)}
            >
              <FolderIcon className="h-8 w-8 text-sidebar-primary" />
              <span className="truncate w-full font-medium">{folder.name}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <button className="absolute top-1.5 right-1.5 p-1 rounded hover:bg-accent">
                    <MoreVertical className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setRenameDialog({ type: "folder", id: folder.id, name: folder.name }); }}>
                    <Pencil className="h-3.5 w-3.5 mr-2" /> Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); deleteFolder(folder.id); }} className="text-destructive">
                    <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </div>

      {/* Files */}
      <div>
        <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
          Files {activeFolderId && `in ${folders.find((f) => f.id === activeFolderId)?.name || ""}`}
        </h3>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : filteredFiles.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No files found. Upload your first file above.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredFiles.map((file) => (
              <Card key={file.id} className="eden-card-hover">
                <CardContent className="p-4 flex items-center gap-3">
                  {getFileIcon(file.file_type)}
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => handlePreview(file)}
                  >
                    <p className="text-sm font-medium truncate hover:underline">{file.file_name}</p>
                    <p className="text-xs text-muted-foreground">{formatBytes(file.file_size)}</p>
                  </div>
                  <Button size="sm" variant="ghost" className="shrink-0" onClick={() => handlePreview(file)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1.5 rounded hover:bg-accent shrink-0">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => downloadFile(file)}>
                        <Download className="h-3.5 w-3.5 mr-2" /> Download
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setRenameDialog({ type: "file", id: file.id, name: file.file_name })}>
                        <Pencil className="h-3.5 w-3.5 mr-2" /> Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setMoveDialog({ fileId: file.id, currentFolder: file.folder_id })}>
                        <FolderInput className="h-3.5 w-3.5 mr-2" /> Move
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShareDialog({ fileId: file.id, token: file.share_token || undefined })}>
                        <Share2 className="h-3.5 w-3.5 mr-2" /> Share
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => deleteFile(file.id)} className="text-destructive">
                        <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* New Folder Dialog */}
      <Dialog open={newFolderOpen} onOpenChange={setNewFolderOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Folder</DialogTitle></DialogHeader>
          <Input value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} placeholder="Folder name" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewFolderOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateFolder}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={!!renameDialog} onOpenChange={() => setRenameDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rename {renameDialog?.type}</DialogTitle></DialogHeader>
          <Input value={renameDialog?.name || ""} onChange={(e) => renameDialog && setRenameDialog({ ...renameDialog, name: e.target.value })} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialog(null)}>Cancel</Button>
            <Button onClick={handleRename}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move Dialog */}
      <Dialog open={!!moveDialog} onOpenChange={() => setMoveDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Move File</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => handleMove("root")}>
              <FolderIcon className="h-4 w-4 mr-2" /> Root (No Folder)
            </Button>
            {folders.map((f) => (
              <Button key={f.id} variant="outline" className="w-full justify-start" onClick={() => handleMove(f.id)} disabled={f.id === moveDialog?.currentFolder}>
                <FolderIcon className="h-4 w-4 mr-2" /> {f.name}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={!!shareDialog} onOpenChange={() => setShareDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Share File</DialogTitle></DialogHeader>
          {shareDialog?.token ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-2 rounded bg-muted">
                <Link className="h-4 w-4 shrink-0 text-sidebar-primary" />
                <span className="text-xs truncate flex-1">{`https://eden-desk.com/share/${shareDialog.token}`}</span>
                <Button size="sm" variant="ghost" onClick={() => handleCopyLink(shareDialog.token!)}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
              <Button variant="destructive" size="sm" onClick={async () => { await revokeShare(shareDialog.fileId); setShareDialog(null); }}>
                Revoke Link
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Link expires in</label>
                <Select value={shareExpiry} onValueChange={setShareExpiry}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={handleShare}>Generate Shareable Link</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Storage Limit Dialog */}
      <Dialog open={storageLimitDialog} onOpenChange={setStorageLimitDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Storage Limit Reached</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            You've reached your storage limit. Upgrade your storage to continue uploading files.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStorageLimitDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* File Preview Modal */}
      <Dialog open={!!previewFile} onOpenChange={closePreview}>
        <DialogContent className="max-w-4xl h-[85vh] p-0 overflow-hidden bg-background">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              {previewFile && getFileIcon(previewFile.file_type)}
              <span className="text-sm font-medium truncate">{previewFile?.file_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => previewFile && downloadFile(previewFile)}>
                <Download className="h-4 w-4 mr-1.5" /> Download
              </Button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center p-4 overflow-auto bg-black/30" style={{ height: 'calc(85vh - 60px)' }}>
            {previewFile?.file_type === "application/pdf" && previewUrl ? (
              <iframe src={previewUrl} className="w-full h-full rounded bg-white" />
            ) : previewFile?.file_type?.startsWith("image/") && previewUrl ? (
              <img src={previewUrl} alt={previewFile.file_name} className="max-w-full max-h-full object-contain rounded" />
            ) : (
              <div className="text-center space-y-3">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">Preview not available. Please download file.</p>
                <Button onClick={() => previewFile && downloadFile(previewFile)}>
                  <Download className="h-4 w-4 mr-1.5" /> Download
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FilesPage;
