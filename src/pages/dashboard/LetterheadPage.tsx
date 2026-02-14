import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Download, Save, ArrowLeft, X, Bot } from "lucide-react";
import { downloadPDF } from "@/lib/pdf";

interface LetterheadForm {
  id?: string;
  title: string;
  body: string;
}

const LetterheadPage = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const [letterheads, setLetterheads] = useState<any[]>([]);
  const [editing, setEditing] = useState<LetterheadForm | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");

  const fetchLetterheads = async () => {
    if (!user) return;
    const { data } = await supabase.from("letterheads").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (data) setLetterheads(data);
  };

  useEffect(() => { fetchLetterheads(); }, [user]);

  const saveLetterhead = async () => {
    if (!editing || !user) return;
    const payload = { user_id: user.id, title: editing.title, body: editing.body };
    let error;
    if (editing.id) {
      ({ error } = await supabase.from("letterheads").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("letterheads").insert(payload));
    }
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved" });
      setEditing(null);
      fetchLetterheads();
    }
  };

  const deleteLetterhead = async (id: string) => {
    await supabase.from("letterheads").delete().eq("id", id);
    fetchLetterheads();
  };

  const handleAIDraft = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const resp = await supabase.functions.invoke("ai-draft", {
        body: { prompt: aiPrompt, type: "letterhead" },
      });
      if (resp.error) throw new Error(resp.error.message);
      const text = resp.data?.text || resp.data?.content || "";
      if (text && editing) {
        setEditing({ ...editing, body: editing.body ? editing.body + "\n\n" + text : text });
        toast({ title: "AI Draft generated" });
      }
    } catch (err: any) {
      toast({ title: "AI Error", description: err.message, variant: "destructive" });
    } finally {
      setAiLoading(false);
      setAiPrompt("");
    }
  };

  if (previewing && editing) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setPreviewing(false)}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
          <Button size="sm" onClick={() => downloadPDF("letterhead-preview", `letterhead-${editing.title}`)}><Download className="h-4 w-4 mr-1" /> Download PDF</Button>
        </div>
        <div id="letterhead-preview" className="bg-white text-black p-8 rounded-lg max-w-3xl mx-auto min-h-[800px] flex flex-col" style={{ fontFamily: "Inter, sans-serif" }}>
          {/* Header */}
          <div className="border-b-2 border-gray-200 pb-4 mb-6">
            <div className="flex items-center gap-4">
              {profile?.logo_url && <img src={profile.logo_url} alt="Logo" className="h-16" />}
              <div>
                <h1 className="text-2xl font-bold">{profile?.company_name || "Your Company"}</h1>
                {profile?.company_address && <p className="text-sm text-gray-600">{profile.company_address}</p>}
              </div>
            </div>
          </div>
          {/* Body */}
          <div className="flex-1 whitespace-pre-wrap text-sm leading-relaxed">{editing.body}</div>
          {/* Footer */}
          <div className="border-t-2 border-gray-200 pt-4 mt-6 text-xs text-gray-500 flex justify-between">
            <div>
              {profile?.company_address && <p>{profile.company_address}</p>}
              {profile?.company_phone && <p>Tel: {profile.company_phone}</p>}
            </div>
            <div className="text-right">
              {profile?.company_email && <p>{profile.company_email}</p>}
              {profile?.company_website && <p>{profile.company_website}</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (editing) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{editing.id ? "Edit Letterhead" : "New Letterhead"}</h1>
          <Button variant="ghost" size="sm" onClick={() => setEditing(null)}><X className="h-4 w-4" /></Button>
        </div>
        <div className="space-y-2">
          <Label>Title</Label>
          <Input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} className="bg-secondary" />
        </div>
        <div className="space-y-2">
          <Label>Content</Label>
          <Textarea value={editing.body} onChange={e => setEditing({ ...editing, body: e.target.value })} className="bg-secondary min-h-[300px]" />
        </div>

        {/* AI Draft */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <h3 className="font-medium">AI Draft Assistant</h3>
          </div>
          <div className="flex gap-2">
            <Input placeholder="Describe what you need drafted..." value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} className="bg-secondary" onKeyDown={e => e.key === "Enter" && handleAIDraft()} />
            <Button onClick={handleAIDraft} disabled={aiLoading || !aiPrompt.trim()}>
              {aiLoading ? "Drafting..." : "Draft"}
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={saveLetterhead}><Save className="h-4 w-4 mr-1" /> Save</Button>
          <Button variant="outline" onClick={() => setPreviewing(true)}>Preview & Download</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Letterheads</h1>
        <Button onClick={() => setEditing({ title: "Untitled", body: "" })}><Plus className="h-4 w-4 mr-1" /> New Letterhead</Button>
      </div>
      {letterheads.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center"><p className="text-muted-foreground">No letterheads yet. Create your first one.</p></div>
      ) : (
        <div className="space-y-3">
          {letterheads.map(l => (
            <div key={l.id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between eden-card-hover cursor-pointer" onClick={() => setEditing({ id: l.id, title: l.title || "", body: l.body || "" })}>
              <div><p className="font-medium">{l.title}</p><p className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleDateString()}</p></div>
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); deleteLetterhead(l.id); }}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LetterheadPage;
