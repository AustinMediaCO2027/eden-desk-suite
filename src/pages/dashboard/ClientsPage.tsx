import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Pencil, X, Check, Users } from "lucide-react";

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string | null;
}

const emptyClient = { name: "", email: "", phone: "", address: "" };

const ClientsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [editing, setEditing] = useState<(typeof emptyClient & { id?: string }) | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const fetchClients = async () => {
    if (!user) return;
    const { data } = await supabase.from("clients").select("*").eq("user_id", user.id).order("name");
    if (data) setClients(data as Client[]);
  };

  useEffect(() => { fetchClients(); }, [user]);

  const save = async () => {
    if (!user || !editing || !editing.name.trim()) return;
    setSaving(true);
    const payload = { user_id: user.id, name: editing.name, email: editing.email, phone: editing.phone, address: editing.address };
    let error;
    if (editing.id) {
      ({ error } = await supabase.from("clients").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("clients").insert(payload));
    }
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editing.id ? "Client updated" : "Client added" });
      setEditing(null);
      fetchClients();
    }
  };

  const remove = async (id: string) => {
    await supabase.from("clients").delete().eq("id", id);
    toast({ title: "Client deleted" });
    fetchClients();
  };

  const filtered = clients.filter(c =>
    `${c.name} ${c.email} ${c.phone} ${c.address}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Clients</h1>
        <Button onClick={() => setEditing({ ...emptyClient })}><Plus className="h-4 w-4 mr-1" /> Add Client</Button>
      </div>

      {editing && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">{editing.id ? "Edit Client" : "New Client"}</h2>
            <Button variant="ghost" size="sm" onClick={() => setEditing(null)}><X className="h-4 w-4" /></Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Name *</Label>
              <Input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} className="bg-secondary" placeholder="Client name" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Email</Label>
              <Input value={editing.email} onChange={e => setEditing({ ...editing, email: e.target.value })} className="bg-secondary" placeholder="Email" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Phone</Label>
              <Input value={editing.phone} onChange={e => setEditing({ ...editing, phone: e.target.value })} className="bg-secondary" placeholder="Phone" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Address</Label>
              <Input value={editing.address} onChange={e => setEditing({ ...editing, address: e.target.value })} className="bg-secondary" placeholder="Address" />
            </div>
          </div>
          <Button onClick={save} disabled={saving || !editing.name.trim()}>
            <Check className="h-4 w-4 mr-1" /> {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      )}

      <Input placeholder="Search clients..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm bg-secondary" />

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Users className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">{clients.length === 0 ? "No clients yet. Add your first one." : "No clients match your search."}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(c => (
            <div key={c.id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">
                  {[c.email, c.phone, c.address].filter(Boolean).join(" • ") || "No details"}
                </p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => setEditing({ id: c.id, name: c.name, email: c.email || "", phone: c.phone || "", address: c.address || "" })}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => remove(c.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientsPage;
