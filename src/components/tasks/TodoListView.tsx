import { useState, useMemo } from "react";
import { TaskCard } from "./TaskCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Filter } from "lucide-react";
import type { Task } from "@/hooks/useTasks";

interface Props {
  tasks: Task[];
  onToggle: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onAdd: () => void;
}

export const TodoListView = ({ tasks, onToggle, onDelete, onEdit, onAdd }: Props) => {
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  const filtered = useMemo(() => {
    return tasks.filter(t => {
      if (filterPriority !== "all" && t.priority !== filterPriority) return false;
      if (filterCategory !== "all" && t.category !== filterCategory) return false;
      return true;
    });
  }, [tasks, filterPriority, filterCategory]);

  const grouped = useMemo(() => {
    const notStarted = filtered.filter(t => t.status === "not_started" || t.status === "pending");
    const inProgress = filtered.filter(t => t.status === "in_progress");
    const completed = filtered.filter(t => t.status === "completed");
    const overdue = filtered.filter(t => t.status === "overdue" || (t.due_date && t.due_date < new Date().toISOString().split("T")[0] && t.status !== "completed"));
    return { notStarted, inProgress, completed, overdue };
  }, [filtered]);

  const renderGroup = (title: string, items: Task[], dotColor: string) => {
    if (items.length === 0) return null;
    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className={`h-2 w-2 rounded-full ${dotColor}`} />
          <h3 className="text-sm font-semibold">{title} ({items.length})</h3>
        </div>
        <div className="space-y-2">
          {items.map(t => (
            <TaskCard key={t.id} task={t} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="h-8 w-28 text-xs bg-secondary"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="h-8 w-28 text-xs bg-secondary"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Category</SelectItem>
              <SelectItem value="work">Work</SelectItem>
              <SelectItem value="client">Client</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={onAdd} className="h-8 gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Add Task
        </Button>
      </div>

      {grouped.overdue.length === 0 && grouped.notStarted.length === 0 && grouped.inProgress.length === 0 && grouped.completed.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <p className="text-muted-foreground text-sm">No tasks found. Create your first task to get started.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {renderGroup("Overdue", grouped.overdue, "bg-destructive")}
          {renderGroup("Not Started", grouped.notStarted, "bg-muted-foreground")}
          {renderGroup("In Progress", grouped.inProgress, "bg-amber-500")}
          {renderGroup("Completed", grouped.completed, "bg-emerald-500")}
        </div>
      )}
    </div>
  );
};
