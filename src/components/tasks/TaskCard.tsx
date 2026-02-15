import { Check, Trash2, Edit2, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Task } from "@/hooks/useTasks";

const priorityStyles: Record<string, string> = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  low: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
};

const categoryLabels: Record<string, string> = {
  work: "Work",
  client: "Client",
  admin: "Admin",
  personal: "Personal",
};

interface Props {
  task: Task;
  onToggle: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  compact?: boolean;
}

export const TaskCard = ({ task, onToggle, onDelete, onEdit, compact }: Props) => {
  const isCompleted = task.status === "completed";
  const isOverdue = task.status === "overdue" || (
    task.due_date && new Date(task.due_date) < new Date(new Date().toISOString().split("T")[0]) && !isCompleted
  );

  return (
    <div className={`group rounded-xl border bg-card p-${compact ? "3" : "4"} flex items-start gap-3 eden-card-hover ${
      isOverdue ? "border-destructive/30" : "border-border"
    }`}>
      <button
        onClick={() => onToggle(task.id, task.status)}
        className={`mt-0.5 h-5 w-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
          isCompleted
            ? "bg-foreground border-foreground"
            : "border-muted-foreground hover:border-foreground"
        }`}
      >
        {isCompleted && <Check className="h-3 w-3 text-background" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-sm font-medium truncate ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
            {task.title}
          </span>
          {isOverdue && !isCompleted && (
            <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />
          )}
        </div>
        {!compact && task.description && (
          <p className="text-xs text-muted-foreground truncate mb-1.5">{task.description}</p>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md border ${priorityStyles[task.priority] || priorityStyles.medium}`}>
            {task.priority}
          </span>
          <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 rounded-md bg-secondary">
            {categoryLabels[task.category] || task.category}
          </span>
          {task.due_time && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
              <Clock className="h-2.5 w-2.5" />{task.due_time.slice(0, 5)}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(task)}>
          <Edit2 className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(task.id)}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};
