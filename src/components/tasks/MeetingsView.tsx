import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Video, MapPin, Clock, Trash2, Edit2, ExternalLink } from "lucide-react";
import type { Meeting } from "@/hooks/useTasks";

interface Props {
  meetings: Meeting[];
  onAdd: () => void;
  onEdit: (meeting: Meeting) => void;
  onDelete: (id: string) => void;
}

export const MeetingsView = ({ meetings, onAdd, onEdit, onDelete }: Props) => {
  const today = new Date().toISOString().split("T")[0];

  const { upcoming, past } = useMemo(() => {
    const upcoming = meetings.filter(m => m.date >= today).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
    const past = meetings.filter(m => m.date < today).sort((a, b) => b.date.localeCompare(a.date));
    return { upcoming, past };
  }, [meetings, today]);

  const renderMeeting = (m: Meeting) => (
    <div key={m.id} className="group rounded-xl border border-border bg-card p-4 eden-card-hover">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
            m.location_type === "online" ? "bg-blue-500/10" : "bg-amber-500/10"
          }`}>
            {m.location_type === "online" ? (
              <Video className="h-5 w-5 text-blue-500" />
            ) : (
              <MapPin className="h-5 w-5 text-amber-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{m.title}</p>
            {m.client_name && <p className="text-xs text-muted-foreground">{m.client_name}</p>}
            <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
              <span>{new Date(m.date + "T00:00").toLocaleDateString("en-ZA", { month: "short", day: "numeric" })}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{m.time.slice(0, 5)}</span>
              <span>{m.duration}min</span>
            </div>
            {m.meeting_link && (
              <a href={m.meeting_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-500 hover:underline mt-1">
                <ExternalLink className="h-3 w-3" />Join Meeting
              </a>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(m)}>
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(m.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Upcoming ({upcoming.length})</h3>
        <Button variant="outline" size="sm" onClick={onAdd} className="h-8 gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Schedule Meeting
        </Button>
      </div>
      {upcoming.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <p className="text-muted-foreground text-sm">No upcoming meetings.</p>
        </div>
      ) : (
        <div className="space-y-2">{upcoming.map(renderMeeting)}</div>
      )}
      {past.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Past ({past.length})</h3>
          <div className="space-y-2 opacity-60">{past.map(renderMeeting)}</div>
        </div>
      )}
    </div>
  );
};
