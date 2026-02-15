import { useMemo } from "react";
import { TaskCard } from "./TaskCard";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Task } from "@/hooks/useTasks";

interface Props {
  tasks: Task[];
  onToggle: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onAdd: () => void;
}

export const TodayView = ({ tasks, onToggle, onDelete, onEdit, onAdd }: Props) => {
  const today = new Date().toISOString().split("T")[0];

  const { overdue, todayTasks } = useMemo(() => {
    const overdue: Task[] = [];
    const todayTasks: Task[] = [];
    tasks.forEach(t => {
      if (t.status === "completed") {
        if (t.due_date === today || t.date === today) todayTasks.push(t);
      } else if (t.due_date && t.due_date < today) {
        overdue.push(t);
      } else if (t.due_date === today || t.date === today) {
        todayTasks.push(t);
      }
    });
    // Sort by priority: high first
    const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
    const sortFn = (a: Task, b: Task) => (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1);
    overdue.sort(sortFn);
    todayTasks.sort(sortFn);
    return { overdue, todayTasks };
  }, [tasks, today]);

  return (
    <div className="space-y-6">
      {overdue.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-2 w-2 rounded-full bg-destructive" />
            <h3 className="text-sm font-semibold text-destructive">Overdue ({overdue.length})</h3>
          </div>
          <div className="space-y-2">
            {overdue.map(t => (
              <TaskCard key={t.id} task={t} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} />
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Today's Tasks ({todayTasks.length})</h3>
          <Button variant="outline" size="sm" onClick={onAdd} className="h-8 gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Add Task
          </Button>
        </div>
        {todayTasks.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-10 text-center">
            <p className="text-muted-foreground text-sm">No tasks for today. Click "Add Task" to get started.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayTasks.map(t => (
              <TaskCard key={t.id} task={t} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
