import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Goal } from "@/hooks/useTasks";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (goal: Partial<Goal>) => Promise<any>;
  editGoal?: Goal | null;
}

export const CreateGoalDialog = ({ open, onOpenChange, onSubmit, editGoal }: Props) => {
  const [title, setTitle] = useState(editGoal?.title || "");
  const [description, setDescription] = useState(editGoal?.description || "");
  const [targetDate, setTargetDate] = useState(editGoal?.target_date || "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    await onSubmit({ title, description, target_date: targetDate || null });
    setSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{editGoal ? "Edit Goal" : "Create Goal"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5">Goal Title</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="What do you want to achieve?" className="bg-secondary" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5">Description</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your goal..." className="bg-secondary resize-none" rows={3} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5">Target Date</Label>
            <Input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} className="bg-secondary" />
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={submitting || !title.trim()}>
            {submitting ? "Saving..." : editGoal ? "Update Goal" : "Create Goal"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
