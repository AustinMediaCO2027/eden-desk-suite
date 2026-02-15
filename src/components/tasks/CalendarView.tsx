import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, Clock, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Task, Meeting } from "@/hooks/useTasks";

interface Props {
  tasks: Task[];
  meetings: Meeting[];
  onAddTask: (date?: string) => void;
  onEditTask: (task: Task) => void;
  onToggleTask: (id: string, status: string) => void;
  onRescheduleTask?: (id: string, newDate: string) => void;
}

type CalendarViewMode = "month" | "week" | "day";

export const CalendarView = ({ tasks, meetings, onAddTask, onEditTask, onToggleTask, onRescheduleTask }: Props) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const { toast } = useToast();

  const today = new Date().toISOString().split("T")[0];
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const navigate = (dir: number) => {
    const d = new Date(currentDate);
    if (viewMode === "month") d.setMonth(d.getMonth() + dir);
    else if (viewMode === "week") d.setDate(d.getDate() + dir * 7);
    else d.setDate(d.getDate() + dir);
    setCurrentDate(d);
  };

  const formatDate = (d: Date) => d.toISOString().split("T")[0];

  const getMonthDays = useCallback(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;

    const days: (Date | null)[] = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
    return days;
  }, [currentDate]);

  const getWeekDays = useCallback(() => {
    const d = new Date(currentDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(d.setDate(diff));
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date;
    });
  }, [currentDate]);

  const getTasksForDate = useCallback((dateStr: string) =>
    tasks.filter(t => t.due_date === dateStr || t.date === dateStr), [tasks]);

  const getMeetingsForDate = useCallback((dateStr: string) =>
    meetings.filter(m => m.date === dateStr), [meetings]);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverDate(dateStr);
  };

  const handleDragLeave = () => {
    setDragOverDate(null);
  };

  const handleDrop = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    setDragOverDate(null);
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId && onRescheduleTask) {
      onRescheduleTask(taskId, dateStr);
      toast({ title: "Task rescheduled", description: `Moved to ${new Date(dateStr + "T00:00").toLocaleDateString("en-ZA", { month: "short", day: "numeric" })}` });
    }
  };

  const headerLabel = viewMode === "month"
    ? currentDate.toLocaleDateString("en-ZA", { year: "numeric", month: "long" })
    : viewMode === "week"
    ? (() => { const w = getWeekDays(); return `${w[0].toLocaleDateString("en-ZA", { month: "short", day: "numeric" })} – ${w[6].toLocaleDateString("en-ZA", { month: "short", day: "numeric", year: "numeric" })}`; })()
    : currentDate.toLocaleDateString("en-ZA", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const renderDayCell = (date: Date | null) => {
    if (!date) return <div key={Math.random()} className="min-h-[80px]" />;
    const dateStr = formatDate(date);
    const isToday = dateStr === today;
    const dayTasks = getTasksForDate(dateStr);
    const dayMeetings = getMeetingsForDate(dateStr);
    const isDragOver = dragOverDate === dateStr;

    return (
      <div
        key={dateStr}
        className={`min-h-[80px] md:min-h-[100px] rounded-lg border p-1.5 cursor-pointer transition-all ${
          isDragOver ? "border-foreground bg-accent/60 ring-2 ring-foreground/20" :
          isToday ? "border-foreground/30 bg-accent/30" : "border-border hover:bg-accent/30"
        }`}
        onClick={() => onAddTask(dateStr)}
        onDragOver={(e) => handleDragOver(e, dateStr)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, dateStr)}
      >
        <div className={`text-xs font-medium mb-1 ${isToday ? "text-foreground" : "text-muted-foreground"}`}>
          {date.getDate()}
        </div>
        <div className="space-y-0.5">
          {dayTasks.slice(0, 3).map(t => (
            <div
              key={t.id}
              draggable
              onDragStart={(e) => handleDragStart(e, t.id)}
              onClick={e => { e.stopPropagation(); onEditTask(t); }}
              className={`text-[10px] truncate px-1 py-0.5 rounded cursor-grab active:cursor-grabbing select-none ${
                t.status === "completed" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 line-through" :
                t.priority === "high" ? "bg-destructive/10 text-destructive" :
                "bg-secondary text-foreground"
              }`}
            >
              {t.title}
            </div>
          ))}
          {dayMeetings.slice(0, 2).map(m => (
            <div key={m.id} className="text-[10px] truncate px-1 py-0.5 rounded bg-accent text-foreground flex items-center gap-0.5">
              <Video className="h-2 w-2 shrink-0" />
              {m.title}
            </div>
          ))}
          {(dayTasks.length > 3 || dayMeetings.length > 2) && (
            <div className="text-[9px] text-muted-foreground px-1">+{Math.max(0, dayTasks.length - 3) + Math.max(0, dayMeetings.length - 2)} more</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold min-w-[200px] text-center">{headerLabel}</span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
        </div>
        <div className="flex items-center gap-1">
          {(["month", "week", "day"] as CalendarViewMode[]).map(v => (
            <Button
              key={v}
              variant={viewMode === v ? "default" : "outline"}
              size="sm"
              className="h-8 text-xs capitalize"
              onClick={() => setViewMode(v)}
            >
              {v}
            </Button>
          ))}
        </div>
      </div>

      {(viewMode === "month" || viewMode === "week") && (
        <div>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {dayNames.map(d => (
              <div key={d} className="text-[10px] font-semibold text-muted-foreground text-center py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {(viewMode === "month" ? getMonthDays() : getWeekDays()).map((d) => renderDayCell(d))}
          </div>
        </div>
      )}

      {viewMode === "day" && (
        <div className="space-y-3">
          {(() => {
            const dateStr = formatDate(currentDate);
            const dayTasks = getTasksForDate(dateStr);
            const dayMeetings = getMeetingsForDate(dateStr);
            return (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Tasks ({dayTasks.length})</h3>
                  <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={() => onAddTask(dateStr)}>
                    <Plus className="h-3.5 w-3.5" /> Add
                  </Button>
                </div>
                {dayTasks.length === 0 ? (
                  <div className="rounded-xl border border-border bg-card p-8 text-center">
                    <p className="text-muted-foreground text-sm">No tasks for this day.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {dayTasks.map(t => (
                      <div key={t.id} onClick={() => onEditTask(t)} className="rounded-xl border border-border bg-card p-3 flex items-center gap-3 cursor-pointer eden-card-hover">
                        <button
                          onClick={e => { e.stopPropagation(); onToggleTask(t.id, t.status); }}
                          className={`h-5 w-5 rounded-md border flex items-center justify-center shrink-0 ${t.status === "completed" ? "bg-foreground border-foreground" : "border-muted-foreground"}`}
                        >
                          {t.status === "completed" && <span className="text-background text-[10px]">✓</span>}
                        </button>
                        <div className="flex-1 min-w-0">
                          <span className={`text-sm ${t.status === "completed" ? "line-through text-muted-foreground" : ""}`}>{t.title}</span>
                          {t.due_time && <span className="text-xs text-muted-foreground ml-2">{t.due_time.slice(0, 5)}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {dayMeetings.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold mb-3">Meetings ({dayMeetings.length})</h3>
                    <div className="space-y-2">
                      {dayMeetings.map(m => (
                        <div key={m.id} className="rounded-xl border border-border bg-card p-3 flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
                            <Video className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium">{m.title}</span>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {m.time.slice(0, 5)} · {m.duration}min
                              {m.client_name && <span>· {m.client_name}</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};
