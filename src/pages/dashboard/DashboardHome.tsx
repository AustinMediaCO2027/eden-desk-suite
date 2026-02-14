import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import {
  Receipt,
  FileText,
  CalendarDays,
  Check,
  Plus,
  Search,
  Filter,
  Clock,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  Mail,
  Users,
  Bot,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import edenIcon from "@/assets/eden_desk_icon.png";
import { format } from "date-fns";

interface Invoice {
  id: string;
  invoice_number: string;
  status: string | null;
  date: string | null;
  client_name: string;
  total: number | null;
}

interface Task {
  id: string;
  title: string;
  date: string | null;
  status: string | null;
}

const DashboardHome = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [stats, setStats] = useState({
    outstanding: 0,
    dueSoon: 0,
    revenueMonth: 0,
    tasksDue: 0,
  });
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showTrial, setShowTrial] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const { data: invData } = await supabase
        .from("invoices")
        .select("id, invoice_number, status, date, client_name, total")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(8);

      if (invData) setInvoices(invData);

      const { data: taskData } = await supabase
        .from("tasks")
        .select("id, title, date, status")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .order("date", { ascending: true })
        .limit(5);

      if (taskData) setTasks(taskData);

      const allInvoices = invData || [];
      const outstanding = allInvoices
        .filter((i) => i.status !== "paid")
        .reduce((sum, i) => sum + (i.total || 0), 0);

      const now = new Date();
      const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const dueSoon = allInvoices
        .filter(
          (i) =>
            i.status !== "paid" &&
            i.date &&
            new Date(i.date) <= in30
        )
        .reduce((sum, i) => sum + (i.total || 0), 0);

      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const revenueMonth = allInvoices
        .filter(
          (i) =>
            i.status === "paid" &&
            i.date &&
            new Date(i.date) >= monthStart
        )
        .reduce((sum, i) => sum + (i.total || 0), 0);

      setStats({
        outstanding,
        dueSoon,
        revenueMonth,
        tasksDue: taskData?.length || 0,
      });
    };

    fetchData();

    if (profile?.subscription_plan === "trial") {
      setShowTrial(true);
    }
  }, [user, profile]);

  const trialFeatures = [
    "Invoices & Quotes",
    "Letterheads with AI drafting",
    "PDF download & email",
    "5 AI prompts per day",
  ];

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 2,
    }).format(val);

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "paid":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Paid
          </span>
        );
      case "overdue":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Overdue
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
            Draft
          </span>
        );
    }
  };

  const quickActions = [
    { label: "New Invoice", icon: Receipt, to: "/dashboard/invoices", color: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" },
    { label: "New Quote", icon: FileText, to: "/dashboard/quotes", color: "bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400" },
    { label: "Letterhead", icon: Mail, to: "/dashboard/letterhead", color: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400" },
    { label: "AI Agent", icon: Bot, to: "/dashboard/ai", color: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  ];

  const analyticsCards = [
    {
      title: "Outstanding",
      value: formatCurrency(stats.outstanding),
      label: "Total unpaid invoices",
      icon: AlertCircle,
      iconColor: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-500/10",
    },
    {
      title: "Due in 30 Days",
      value: formatCurrency(stats.dueSoon),
      label: "Upcoming payments",
      icon: Clock,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-500/10",
    },
    {
      title: "Revenue",
      value: formatCurrency(stats.revenueMonth),
      label: "Paid this month",
      icon: TrendingUp,
      iconColor: "text-emerald-500",
      bgColor: "bg-emerald-50 dark:bg-emerald-500/10",
    },
    {
      title: "Tasks Due",
      value: stats.tasksDue.toString(),
      label: "Pending tasks",
      icon: CalendarDays,
      iconColor: "text-violet-500",
      bgColor: "bg-violet-50 dark:bg-violet-500/10",
    },
  ];

  return (
    <div className="h-full">
      {/* Trial popup */}
      <Dialog open={showTrial} onOpenChange={setShowTrial}>
        <DialogContent className="bg-card border-border p-0 overflow-hidden max-w-md">
          <div className="h-1 w-full bg-gradient-to-r from-foreground/20 via-foreground to-foreground/20" />
          <div className="px-8 pt-8 pb-6 flex flex-col items-center text-center">
            <div className="mb-6">
              <img src={edenIcon} alt="Eden Desk" className="h-14 w-14 invert dark:invert" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">Welcome to Eden Desk</h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Your <span className="text-foreground font-medium">7-day free trial</span> of the Silver plan is active.
              Continue after for just <span className="text-foreground font-medium">R59.99/month</span>.
            </p>
            <div className="w-full mt-6 space-y-2.5">
              {trialFeatures.map((feature) => (
                <div key={feature} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="h-5 w-5 rounded-full bg-foreground/10 flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 text-foreground" />
                  </div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
            <Button className="w-full mt-8 h-11 text-sm font-medium" onClick={() => setShowTrial(false)}>
              Start Exploring
            </Button>
            <button
              onClick={() => setShowTrial(false)}
              className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Maybe later
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="px-6 lg:px-8 pt-8 pb-2">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, {profile?.company_name || user?.email?.split("@")[0] || "there"} 👋
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Here's what's happening with your business today.
            </p>
          </div>
          <Link to="/dashboard/invoices">
            <Button size="sm" className="text-xs shadow-sm">
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Create Invoice
            </Button>
          </Link>
        </div>
      </div>

      <div className="px-6 lg:px-8 py-6 space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map(({ label, icon: Icon, to, color }) => (
            <Link
              key={label}
              to={to}
              className="group flex items-center gap-3 p-4 rounded-2xl border border-border bg-card hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className={`h-10 w-10 rounded-xl ${color} flex items-center justify-center shrink-0`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{label}</p>
                <p className="text-[11px] text-muted-foreground">Create new</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {analyticsCards.map(({ title, value, label, icon: Icon, iconColor, bgColor }) => (
            <div
              key={title}
              className="rounded-2xl border border-border bg-card p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</span>
                <div className={`h-8 w-8 rounded-lg ${bgColor} flex items-center justify-center`}>
                  <Icon className={`h-4 w-4 ${iconColor}`} />
                </div>
              </div>
              <p className="text-2xl font-bold tracking-tight">{value}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col xl:flex-row gap-6">
          {/* Recent Invoices */}
          <div className="flex-1 rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-base font-semibold">Recent Invoices</h2>
              <Link to="/dashboard/invoices">
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1">
                  View all <ArrowUpRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            {invoices.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <Receipt className="h-7 w-7 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium mb-1">No invoices yet</p>
                <p className="text-xs text-muted-foreground mb-4">Create your first invoice to start tracking payments.</p>
                <Link to="/dashboard/invoices">
                  <Button size="sm" className="text-xs">
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Create Invoice
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {invoices.map((inv) => (
                  <Link
                    key={inv.id}
                    to="/dashboard/invoices"
                    className="flex items-center justify-between px-6 py-3.5 hover:bg-accent/40 transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="h-9 w-9 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{inv.invoice_number}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{inv.client_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      {getStatusBadge(inv.status)}
                      <span className="text-sm font-semibold tabular-nums w-28 text-right">
                        {inv.total ? formatCurrency(inv.total) : "—"}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Tasks */}
          <div className="hidden xl:flex xl:flex-col w-80 shrink-0 rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-base font-semibold">Upcoming Tasks</h2>
              <Link to="/dashboard/tasks">
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1">
                  View all <ArrowUpRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
            {tasks.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
                  <CalendarDays className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium mb-1">All caught up!</p>
                <p className="text-xs text-muted-foreground">No pending tasks right now.</p>
              </div>
            ) : (
              <div className="flex-1 p-3 space-y-1">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-accent/40 transition-colors"
                  >
                    <Checkbox className="mt-0.5 h-4 w-4 rounded border-border" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {task.date ? format(new Date(task.date), "dd MMM yyyy") : "No date"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
