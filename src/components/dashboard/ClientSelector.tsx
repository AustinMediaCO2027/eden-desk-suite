import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Users, Check } from "lucide-react";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface ClientSelectorProps {
  onSelect: (client: { name: string; email: string; address: string }) => void;
}

const ClientSelector = ({ onSelect }: ClientSelectorProps) => {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", email: "", phone: "", address: "" });
  const [showNew, setShowNew] = useState(false);

  const fetchClients = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("clients")
      .select("*")
      .eq("user_id", user.id)
      .order("name");
    if (data) setClients(data as Client[]);
  };

  useEffect(() => {
    if (open) fetchClients();
  }, [open, user]);

  const saveNewClient = async () => {
    if (!user || !newClient.name.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("clients").insert({
      user_id: user.id,
      name: newClient.name,
      email: newClient.email,
      phone: newClient.phone,
      address: newClient.address,
    });
    setSaving(false);
    if (!error) {
      onSelect({ name: newClient.name, email: newClient.email, address: newClient.address });
      setNewClient({ name: "", email: "", phone: "", address: "" });
      setShowNew(false);
      setOpen(false);
      fetchClients();
    }
  };

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-1.5">
        <Users className="h-3.5 w-3.5" /> Select Client
      </Button>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Saved Clients</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowNew(!showNew)} className="gap-1">
            <UserPlus className="h-3.5 w-3.5" /> New
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>✕</Button>
        </div>
      </div>

      {showNew && (
        <div className="space-y-2 p-3 rounded-lg bg-secondary">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Name</Label>
              <Input value={newClient.name} onChange={e => setNewClient({ ...newClient, name: e.target.value })} className="h-8 text-sm bg-background" placeholder="Client name" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Email</Label>
              <Input value={newClient.email} onChange={e => setNewClient({ ...newClient, email: e.target.value })} className="h-8 text-sm bg-background" placeholder="Email" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Phone</Label>
              <Input value={newClient.phone} onChange={e => setNewClient({ ...newClient, phone: e.target.value })} className="h-8 text-sm bg-background" placeholder="Phone" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Address</Label>
              <Input value={newClient.address} onChange={e => setNewClient({ ...newClient, address: e.target.value })} className="h-8 text-sm bg-background" placeholder="Address" />
            </div>
          </div>
          <Button size="sm" onClick={saveNewClient} disabled={saving || !newClient.name.trim()} className="gap-1">
            <Check className="h-3.5 w-3.5" /> Save & Select
          </Button>
        </div>
      )}

      {clients.length === 0 && !showNew ? (
        <p className="text-xs text-muted-foreground py-2">No saved clients yet. Add one above.</p>
      ) : (
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {clients.map(c => (
            <button
              key={c.id}
              onClick={() => { onSelect({ name: c.name, email: c.email, address: c.address }); setOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-sm"
            >
              <p className="font-medium">{c.name}</p>
              <p className="text-xs text-muted-foreground">{c.email}{c.phone && ` • ${c.phone}`}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientSelector;
