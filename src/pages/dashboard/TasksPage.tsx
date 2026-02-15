import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useTasks, useMeetings, useGoals } from "@/hooks/useTasks";
import type { Task, Meeting, Goal } from "@/hooks/useTasks";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TodayView } from "@/components/tasks/TodayView";
import { CalendarView } from "@/components/tasks/CalendarView";
import { TodoListView } from "@/components/tasks/TodoListView";
import { GoalsView } from "@/components/tasks/GoalsView";
import { MeetingsView } from "@/components/tasks/MeetingsView";
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog";
import { CreateMeetingDialog } from "@/components/tasks/CreateMeetingDialog";
import { CreateGoalDialog } from "@/components/tasks/CreateGoalDialog";
import PaywallDialog from "@/components/PaywallDialog";
import { CalendarDays, ListTodo, Target, Users, LayoutGrid } from "lucide-react";

const TasksPage = () => {
  const { profile } = useProfile();
  const { tasks, createTask, updateTask, deleteTask } = useTasks();
  const { meetings, createMeeting, updateMeeting, deleteMeeting } = useMeetings();
  const { goals, createGoal, updateGoal, deleteGoal } = useGoals();

  const [activeTab, setActiveTab] = useState("today");
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [initialTaskDate, setInitialTaskDate] = useState<string | undefined>();
  const [showPaywall, setShowPaywall] = useState(false);

  const plan = profile?.subscription_plan || "trial";
  const hasTaskAccess = ["silver", "premium", "yearly", "trial"].includes(plan);
  const hasMeetingAccess = ["silver", "premium", "yearly", "trial"].includes(plan);
  const hasGoalAccess = ["premium", "yearly"].includes(plan);
  const hasAIAccess = ["premium", "yearly"].includes(plan);

  // Auto-mark overdue
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    tasks.forEach(t => {
      if (t.due_date && t.due_date < today && t.status !== "completed" && t.status !== "overdue" && t.status !== "cancelled") {
        updateTask(t.id, { status: "overdue" });
      }
    });
  }, [tasks]);

  if (!hasTaskAccess) {
    return (
      <div className="p-6 md:p-8">
        <div className="max-w-lg mx-auto text-center py-20">
          <CalendarDays className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-bold mb-2">Task Management</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Upgrade to Silver plan or higher to access task management, meetings, and more.
          </p>
          <PaywallDialog open={true} onOpenChange={() => {}} />
        </div>
      </div>
    );
  }

  const handleToggleTask = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "completed" ? "not_started" : "completed";
    await updateTask(id, { status: newStatus });
  };

  const handleAddTask = (date?: string) => {
    setEditingTask(null);
    setInitialTaskDate(date);
    setTaskDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setInitialTaskDate(undefined);
    setTaskDialogOpen(true);
  };

  const handleTaskSubmit = async (data: Partial<Task>) => {
    if (editingTask) {
      return updateTask(editingTask.id, data);
    }
    return createTask(data);
  };

  const handleAddMeeting = () => {
    setEditingMeeting(null);
    setMeetingDialogOpen(true);
  };

  const handleMeetingSubmit = async (data: Partial<Meeting>) => {
    if (editingMeeting) {
      return updateMeeting(editingMeeting.id, data);
    }
    return createMeeting(data);
  };

  const handleAddGoal = () => {
    if (!hasGoalAccess) {
      setShowPaywall(true);
      return;
    }
    setEditingGoal(null);
    setGoalDialogOpen(true);
  };

  const handleGoalSubmit = async (data: Partial<Goal>) => {
    if (editingGoal) {
      return updateGoal(editingGoal.id, data);
    }
    return createGoal(data);
  };

  const tabItems = [
    { value: "today", label: "Today", icon: LayoutGrid },
    { value: "calendar", label: "Calendar", icon: CalendarDays },
    { value: "todo", label: "To-Do List", icon: ListTodo },
    { value: "goals", label: "Goals", icon: Target, premium: true },
    { value: "meetings", label: "Meetings", icon: Users },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your tasks, meetings, and goals.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-secondary/50 h-10 p-1 mb-6 w-full sm:w-auto overflow-x-auto">
          {tabItems.map(tab => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="gap-1.5 text-xs data-[state=active]:bg-background"
              onClick={() => {
                if (tab.premium && !hasGoalAccess) {
                  setShowPaywall(true);
                }
              }}
              disabled={tab.premium && !hasGoalAccess}
            >
              <tab.icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.premium && !hasGoalAccess && (
                <span className="text-[9px] bg-foreground text-background rounded px-1 py-0.5 font-bold ml-0.5">PRO</span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="today">
          <TodayView
            tasks={tasks}
            onToggle={handleToggleTask}
            onDelete={deleteTask}
            onEdit={handleEditTask}
            onAdd={() => handleAddTask()}
          />
        </TabsContent>

        <TabsContent value="calendar">
          <CalendarView
            tasks={tasks}
            meetings={meetings}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
            onToggleTask={handleToggleTask}
          />
        </TabsContent>

        <TabsContent value="todo">
          <TodoListView
            tasks={tasks}
            onToggle={handleToggleTask}
            onDelete={deleteTask}
            onEdit={handleEditTask}
            onAdd={() => handleAddTask()}
          />
        </TabsContent>

        <TabsContent value="goals">
          {hasGoalAccess && (
            <GoalsView
              goals={goals}
              tasks={tasks}
              onAdd={handleAddGoal}
              onEdit={g => { setEditingGoal(g); setGoalDialogOpen(true); }}
              onDelete={deleteGoal}
            />
          )}
        </TabsContent>

        <TabsContent value="meetings">
          <MeetingsView
            meetings={meetings}
            onAdd={handleAddMeeting}
            onEdit={m => { setEditingMeeting(m); setMeetingDialogOpen(true); }}
            onDelete={deleteMeeting}
          />
        </TabsContent>
      </Tabs>

      <CreateTaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        onSubmit={handleTaskSubmit}
        goals={goals}
        initialDate={initialTaskDate}
        editTask={editingTask}
      />

      <CreateMeetingDialog
        open={meetingDialogOpen}
        onOpenChange={setMeetingDialogOpen}
        onSubmit={handleMeetingSubmit}
        editMeeting={editingMeeting}
      />

      <CreateGoalDialog
        open={goalDialogOpen}
        onOpenChange={setGoalDialogOpen}
        onSubmit={handleGoalSubmit}
        editGoal={editingGoal}
      />

      <PaywallDialog open={showPaywall} onOpenChange={setShowPaywall} />
    </div>
  );
};

export default TasksPage;
