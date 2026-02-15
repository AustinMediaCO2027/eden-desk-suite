import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, Target, Trash2, Edit2, CalendarDays } from "lucide-react";
import type { Goal, Task } from "@/hooks/useTasks";

interface Props {
  goals: Goal[];
  tasks: Task[];
  onAdd: () => void;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
}

export const GoalsView = ({ goals, tasks, onAdd, onEdit, onDelete }: Props) => {
  const goalsWithProgress = useMemo(() => {
    return goals.map(g => {
      const linkedTasks = tasks.filter(t => t.goal_id === g.id);
      const completedCount = linkedTasks.filter(t => t.status === "completed").length;
      const progress = linkedTasks.length > 0 ? Math.round((completedCount / linkedTasks.length) * 100) : 0;
      const daysLeft = g.target_date ? Math.max(0, Math.ceil((new Date(g.target_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : null;
      return { ...g, progress, linkedTasks: linkedTasks.length, completedCount, daysLeft };
    });
  }, [goals, tasks]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Your Goals ({goals.length})</h3>
        <Button variant="outline" size="sm" onClick={onAdd} className="h-8 gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Create Goal
        </Button>
      </div>
      {goalsWithProgress.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <p className="text-muted-foreground text-sm">No goals yet. Create one to start tracking your progress.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {goalsWithProgress.map(g => (
            <div key={g.id} className="group rounded-xl border border-border bg-card p-5 eden-card-hover">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center">
                    <Target className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{g.title}</p>
                    {g.description && <p className="text-xs text-muted-foreground truncate max-w-[200px]">{g.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(g)}>
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(g.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{g.completedCount}/{g.linkedTasks} tasks completed</span>
                  <span className="font-semibold text-foreground">{g.progress}%</span>
                </div>
                <Progress value={g.progress} className="h-2" />
                {g.daysLeft !== null && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <CalendarDays className="h-3 w-3" />
                    {g.daysLeft === 0 ? "Due today" : g.daysLeft > 0 ? `${g.daysLeft} days left` : "Overdue"}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
