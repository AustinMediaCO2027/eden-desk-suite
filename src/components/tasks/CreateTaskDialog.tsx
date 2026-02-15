import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { Task, Goal } from "@/hooks/useTasks";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (task: Partial<Task>) => Promise<any>;
  goals?: Goal[];
  initialDate?: string;
  editTask?: Task | null;
}

export const CreateTaskDialog = ({ open, onOpenChange, onSubmit, goals = [], initialDate, editTask }: Props) => {
  const [title, setTitle] = useState(editTask?.title || "");
  const [description, setDescription] = useState(editTask?.description || "");
  const [category, setCategory] = useState(editTask?.category || "work");
  const [priority, setPriority] = useState(editTask?.priority || "medium");
  const [dueDate, setDueDate] = useState(editTask?.due_date || initialDate || new Date().toISOString().split("T")[0]);
  const [dueTime, setDueTime] = useState(editTask?.due_time || "");
  const [recurring, setRecurring] = useState(editTask?.recurring || "none");
  const [reminderEnabled, setReminderEnabled] = useState(editTask?.reminder_enabled || false);
  const [goalId, setGoalId] = useState(editTask?.goal_id || "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    await onSubmit({
      title,
      description,
      category,
      priority,
      due_date: dueDate,
      due_time: dueTime || null,
      recurring,
      reminder_enabled: reminderEnabled,
      goal_id: goalId || null,
      status: editTask?.status || "not_started",
    });
    setSubmitting(false);
    onOpenChange(false);
    // Reset
    if (!editTask) {
      setTitle(""); setDescription(""); setCategory("work"); setPriority("medium");
      setDueTime(""); setRecurring("none"); setReminderEnabled(false); setGoalId("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{editTask ? "Edit Task" : "Create Task"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5">Title</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Task title..." className="bg-secondary" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5">Description</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional description..." className="bg-secondary resize-none" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-secondary"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="bg-secondary"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5">Due Date</Label>
              <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="bg-secondary" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5">Due Time</Label>
              <Input type="time" value={dueTime} onChange={e => setDueTime(e.target.value)} className="bg-secondary" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5">Recurring</Label>
              <Select value={recurring} onValueChange={setRecurring}>
                <SelectTrigger className="bg-secondary"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {goals.length > 0 && (
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5">Link to Goal</Label>
                <Select value={goalId} onValueChange={setGoalId}>
                  <SelectTrigger className="bg-secondary"><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {goals.map(g => <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <Label className="text-sm">Enable Reminder</Label>
            <Switch checked={reminderEnabled} onCheckedChange={setReminderEnabled} />
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={submitting || !title.trim()}>
            {submitting ? "Saving..." : editTask ? "Update Task" : "Create Task"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
