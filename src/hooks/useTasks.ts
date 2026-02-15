import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string;
  priority: string;
  status: string;
  date: string | null;
  start_date: string | null;
  due_date: string | null;
  due_time: string | null;
  recurring: string;
  reminder_enabled: boolean;
  reminder_time: string | null;
  reminder_sent: boolean;
  goal_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Meeting {
  id: string;
  user_id: string;
  title: string;
  client_name: string;
  location_type: string;
  meeting_link: string;
  date: string;
  time: string;
  duration: number;
  notes: string;
  reminder_enabled: boolean;
  reminder_time: string | null;
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string;
  target_date: string | null;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
}

export const useTasks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setTasks((data as unknown as Task[]) || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const createTask = async (task: Partial<Task>) => {
    if (!user) return;
    const { error } = await supabase.from("tasks").insert({
      user_id: user.id,
      title: task.title || "Untitled",
      description: task.description || "",
      category: task.category || "work",
      priority: task.priority || "medium",
      status: task.status || "not_started",
      date: task.due_date || task.date || new Date().toISOString().split("T")[0],
      due_date: task.due_date || null,
      due_time: task.due_time || null,
      start_date: task.start_date || null,
      recurring: task.recurring || "none",
      reminder_enabled: task.reminder_enabled || false,
      reminder_time: task.reminder_time || null,
      goal_id: task.goal_id || null,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      await fetchTasks();
    }
    return error;
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const { error } = await supabase.from("tasks").update(updates).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      await fetchTasks();
    }
    return error;
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (!error) await fetchTasks();
    return error;
  };

  return { tasks, loading, createTask, updateTask, deleteTask, refetch: fetchTasks };
};

export const useMeetings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMeetings = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("meetings")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: true });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setMeetings((data as unknown as Meeting[]) || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchMeetings(); }, [fetchMeetings]);

  const createMeeting = async (meeting: Partial<Meeting>) => {
    if (!user) return;
    const { error } = await supabase.from("meetings").insert({
      user_id: user.id,
      title: meeting.title || "Untitled Meeting",
      client_name: meeting.client_name || "",
      location_type: meeting.location_type || "online",
      meeting_link: meeting.meeting_link || "",
      date: meeting.date || new Date().toISOString().split("T")[0],
      time: meeting.time || "09:00",
      duration: meeting.duration || 30,
      notes: meeting.notes || "",
      reminder_enabled: meeting.reminder_enabled || false,
      reminder_time: meeting.reminder_time || null,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      await fetchMeetings();
    }
    return error;
  };

  const updateMeeting = async (id: string, updates: Partial<Meeting>) => {
    const { error } = await supabase.from("meetings").update(updates).eq("id", id);
    if (!error) await fetchMeetings();
    return error;
  };

  const deleteMeeting = async (id: string) => {
    const { error } = await supabase.from("meetings").delete().eq("id", id);
    if (!error) await fetchMeetings();
    return error;
  };

  return { meetings, loading, createMeeting, updateMeeting, deleteMeeting, refetch: fetchMeetings };
};

export const useGoals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setGoals((data as unknown as Goal[]) || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  const createGoal = async (goal: Partial<Goal>) => {
    if (!user) return;
    const { error } = await supabase.from("goals").insert({
      user_id: user.id,
      title: goal.title || "Untitled Goal",
      description: goal.description || "",
      target_date: goal.target_date || null,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      await fetchGoals();
    }
    return error;
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    const { error } = await supabase.from("goals").update(updates).eq("id", id);
    if (!error) await fetchGoals();
    return error;
  };

  const deleteGoal = async (id: string) => {
    const { error } = await supabase.from("goals").delete().eq("id", id);
    if (!error) await fetchGoals();
    return error;
  };

  return { goals, loading, createGoal, updateGoal, deleteGoal, refetch: fetchGoals };
};
