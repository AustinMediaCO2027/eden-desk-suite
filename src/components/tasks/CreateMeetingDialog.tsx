import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { Meeting } from "@/hooks/useTasks";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (meeting: Partial<Meeting>) => Promise<any>;
  editMeeting?: Meeting | null;
}

export const CreateMeetingDialog = ({ open, onOpenChange, onSubmit, editMeeting }: Props) => {
  const [title, setTitle] = useState(editMeeting?.title || "");
  const [clientName, setClientName] = useState(editMeeting?.client_name || "");
  const [locationType, setLocationType] = useState(editMeeting?.location_type || "online");
  const [meetingLink, setMeetingLink] = useState(editMeeting?.meeting_link || "");
  const [date, setDate] = useState(editMeeting?.date || new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState(editMeeting?.time?.slice(0, 5) || "09:00");
  const [duration, setDuration] = useState(String(editMeeting?.duration || 30));
  const [notes, setNotes] = useState(editMeeting?.notes || "");
  const [reminderEnabled, setReminderEnabled] = useState(editMeeting?.reminder_enabled || false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    await onSubmit({
      title,
      client_name: clientName,
      location_type: locationType,
      meeting_link: meetingLink,
      date,
      time,
      duration: parseInt(duration) || 30,
      notes,
      reminder_enabled: reminderEnabled,
    });
    setSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{editMeeting ? "Edit Meeting" : "Schedule Meeting"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5">Meeting Title</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Meeting title..." className="bg-secondary" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5">Client Name</Label>
            <Input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Client name..." className="bg-secondary" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5">Location</Label>
              <Select value={locationType} onValueChange={setLocationType}>
                <SelectTrigger className="bg-secondary"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="physical">Physical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5">Duration (min)</Label>
              <Input type="number" value={duration} onChange={e => setDuration(e.target.value)} className="bg-secondary" />
            </div>
          </div>
          {locationType === "online" && (
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5">Meeting Link</Label>
              <Input value={meetingLink} onChange={e => setMeetingLink(e.target.value)} placeholder="https://meet.google.com/..." className="bg-secondary" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5">Date</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-secondary" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5">Time</Label>
              <Input type="time" value={time} onChange={e => setTime(e.target.value)} className="bg-secondary" />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5">Notes</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Meeting notes..." className="bg-secondary resize-none" rows={2} />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <Label className="text-sm">Enable Reminder</Label>
            <Switch checked={reminderEnabled} onCheckedChange={setReminderEnabled} />
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={submitting || !title.trim()}>
            {submitting ? "Saving..." : editMeeting ? "Update Meeting" : "Schedule Meeting"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
