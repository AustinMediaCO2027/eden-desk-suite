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
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
      // Fetch recent invoices
      const { data: invData } = await supabase
        .from("invoices")
        .select("id, invoice_number, status, date, client_name, total")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(8);

      if (invData) setInvoices(invData);

      // Fetch upcoming tasks
      const { data: taskData } = await supabase
        .from("tasks")
        .select("id, title, date, status")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .order("date", { ascending: true })
        .limit(5);

      if (taskData) setTasks(taskData);

      // Calculate stats
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
          <Badge variant="outline" className="border-foreground/20 text-foreground text-[11px] font-medium">
            Paid
          </Badge>
        );
      case "overdue":
        return (
          <Badge variant="outline" className="border-destructive/40 text-destructive text-[11px] font-medium">
            Overdue
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-[11px] font-medium">
            Draft
          </Badge>
        );
    }
  };

  const analyticsCards = [
    {
      title: "Outstanding",
      value: formatCurrency(stats.outstanding),
      label: "Total unpaid invoices",
      icon: AlertCircle,
    },
    {
      title: "Due in 30 Days",
      value: formatCurrency(stats.dueSoon),
      label: "Upcoming payments",
      icon: Clock,
    },
    {
      title: "Revenue This Month",
      value: formatCurrency(stats.revenueMonth),
      label: "Paid this month",
      icon: TrendingUp,
    },
    {
      title: "Tasks Due Today",
      value: stats.tasksDue.toString(),
      label: "Pending tasks",
      icon: CalendarDays,
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

      {/* Top bar */}
      <div className="px-6 lg:px-8 py-5 border-b border-border flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Welcome back, {profile?.company_name || user?.email?.split("@")[0] || "there"}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => {}} className="text-xs">
          <Plus className="h-3.5 w-3.5 mr-1" />
          Create Invoice
        </Button>
      </div>

      <div className="px-6 lg:px-8 py-6 space-y-6">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {analyticsCards.map(({ title, value, label, icon: Icon }) => (
            <div
              key={title}
              className="rounded-xl border border-border bg-card p-5 transition-colors hover:bg-accent/50"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">{title}</span>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold tracking-tight">{value}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col xl:flex-row gap-6">
          {/* Recent Invoices */}
          <div className="flex-1 rounded-xl border border-border bg-card">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold">Recent Invoices</h2>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground">
                  <Filter className="h-3.5 w-3.5 mr-1" />
                  Filter
                </Button>
                <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground">
                  <Search className="h-3.5 w-3.5 mr-1" />
                  Search
                </Button>
                <Link to="/dashboard/invoices">
                  <Button size="sm" className="h-8 text-xs">
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Create Invoice
                  </Button>
                </Link>
              </div>
            </div>

            {invoices.length === 0 ? (
              <div className="p-12 text-center">
                <Receipt className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No invoices yet</p>
                <Link to="/dashboard/invoices">
                  <Button size="sm" className="mt-4 text-xs">
                    Create Your First Invoice
                  </Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Invoice #</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Status</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Date</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Client</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv) => (
                    <TableRow key={inv.id} className="hover:bg-accent/30 transition-colors">
                      <TableCell className="text-[13px] font-medium">{inv.invoice_number}</TableCell>
                      <TableCell>{getStatusBadge(inv.status)}</TableCell>
                      <TableCell className="text-[13px] text-muted-foreground">
                        {inv.date ? format(new Date(inv.date), "dd MMM yyyy") : "—"}
                      </TableCell>
                      <TableCell className="text-[13px]">{inv.client_name}</TableCell>
                      <TableCell className="text-[13px] font-medium text-right">
                        {inv.total ? formatCurrency(inv.total) : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Upcoming Tasks - hidden on smaller screens */}
          <div className="hidden xl:block w-72 shrink-0 rounded-xl border border-border bg-card">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold">Upcoming Tasks</h2>
            </div>
            {tasks.length === 0 ? (
              <div className="p-8 text-center">
                <CalendarDays className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No pending tasks</p>
              </div>
            ) : (
              <div className="p-3 space-y-1">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-accent/30 transition-colors"
                  >
                    <Checkbox className="mt-0.5 h-4 w-4 border-border" />
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium truncate">{task.title}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {task.date ? format(new Date(task.date), "dd MMM yyyy") : "No date"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="px-5 py-3 border-t border-border">
              <Link to="/dashboard/tasks" className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">
                View all tasks →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
