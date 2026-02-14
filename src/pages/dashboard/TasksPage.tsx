import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Check, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

const TasksPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<"today" | "week">("today");

  const fetchTasks = async () => {
    if (!user) return;
    const { data } = await supabase.from("tasks").select("*").eq("user_id", user.id).order("date", { ascending: true });
    if (data) setTasks(data);
  };

  useEffect(() => { fetchTasks(); }, [user]);

  const addTask = async () => {
    if (!newTask.trim() || !user) return;
    const { error } = await supabase.from("tasks").insert({
      user_id: user.id,
      title: newTask,
      date: selectedDate.toISOString().split("T")[0],
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { setNewTask(""); fetchTasks(); }
  };

  const toggleTask = async (id: string, currentStatus: string) => {
    await supabase.from("tasks").update({ status: currentStatus === "completed" ? "pending" : "completed" }).eq("id", id);
    fetchTasks();
  };

  const deleteTask = async (id: string) => {
    await supabase.from("tasks").delete().eq("id", id);
    fetchTasks();
  };

  const formatDate = (d: Date) => d.toISOString().split("T")[0];
  const today = formatDate(selectedDate);

  const getWeekDates = () => {
    const start = new Date(selectedDate);
    start.setDate(start.getDate() - start.getDay() + 1);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  };

  const filteredTasks = view === "today"
    ? tasks.filter(t => t.date === today)
    : tasks.filter(t => {
        const week = getWeekDates();
        return t.date >= formatDate(week[0]) && t.date <= formatDate(week[6]);
      });

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <div className="flex items-center gap-2">
          <Button variant={view === "today" ? "default" : "outline"} size="sm" onClick={() => setView("today")}>Today</Button>
          <Button variant={view === "week" ? "default" : "outline"} size="sm" onClick={() => setView("week")}>Week</Button>
        </div>
      </div>

      {/* Date navigation */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => {
          const d = new Date(selectedDate);
          d.setDate(d.getDate() - (view === "week" ? 7 : 1));
          setSelectedDate(d);
        }}><ChevronLeft className="h-4 w-4" /></Button>
        <span className="text-sm font-medium">
          {view === "today"
            ? selectedDate.toLocaleDateString("en-ZA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
            : `Week of ${getWeekDates()[0].toLocaleDateString("en-ZA", { month: "short", day: "numeric" })} - ${getWeekDates()[6].toLocaleDateString("en-ZA", { month: "short", day: "numeric" })}`}
        </span>
        <Button variant="ghost" size="sm" onClick={() => {
          const d = new Date(selectedDate);
          d.setDate(d.getDate() + (view === "week" ? 7 : 1));
          setSelectedDate(d);
        }}><ChevronRight className="h-4 w-4" /></Button>
        <Button variant="ghost" size="sm" onClick={() => setSelectedDate(new Date())}>Today</Button>
      </div>

      {/* Add task */}
      <div className="flex gap-2">
        <Input placeholder="Add a new task..." value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key === "Enter" && addTask()} className="bg-secondary" />
        {view === "today" || (
          <Input type="date" value={formatDate(selectedDate)} onChange={e => setSelectedDate(new Date(e.target.value))} className="bg-secondary w-40" />
        )}
        <Button onClick={addTask}><Plus className="h-4 w-4" /></Button>
      </div>

      {/* Tasks list */}
      {view === "today" ? (
        <div className="space-y-2">
          {filteredTasks.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center"><p className="text-muted-foreground">No tasks for this day.</p></div>
          ) : (
            filteredTasks.map(task => (
              <div key={task.id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between eden-card-hover">
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleTask(task.id, task.status)} className={`h-5 w-5 rounded-md border flex items-center justify-center transition-colors ${task.status === "completed" ? "bg-foreground border-foreground" : "border-muted-foreground"}`}>
                    {task.status === "completed" && <Check className="h-3 w-3 text-background" />}
                  </button>
                  <span className={`text-sm ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>{task.title}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => deleteTask(task.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {getWeekDates().map((date, i) => {
            const dateStr = formatDate(date);
            const dayTasks = tasks.filter(t => t.date === dateStr);
            const isToday = dateStr === formatDate(new Date());
            return (
              <div key={i} className={`rounded-xl border p-3 min-h-[200px] ${isToday ? "border-foreground/30 bg-secondary" : "border-border bg-card"}`}>
                <div className="text-xs font-medium text-muted-foreground mb-1">{dayNames[i]}</div>
                <div className={`text-lg font-bold mb-3 ${isToday ? "" : "text-muted-foreground"}`}>{date.getDate()}</div>
                <div className="space-y-1">
                  {dayTasks.map(task => (
                    <div key={task.id} className="flex items-center gap-1.5">
                      <button onClick={() => toggleTask(task.id, task.status)} className={`h-3.5 w-3.5 rounded border shrink-0 flex items-center justify-center ${task.status === "completed" ? "bg-foreground border-foreground" : "border-muted-foreground"}`}>
                        {task.status === "completed" && <Check className="h-2 w-2 text-background" />}
                      </button>
                      <span className={`text-xs truncate ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>{task.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TasksPage;
