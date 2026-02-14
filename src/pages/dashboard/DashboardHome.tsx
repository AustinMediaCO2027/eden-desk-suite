import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Receipt, FileText, Mail, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const DashboardHome = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [stats, setStats] = useState({ invoices: 0, quotes: 0, letterheads: 0, tasks: 0 });
  const [showTrial, setShowTrial] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const [inv, qt, lt, tk] = await Promise.all([
        supabase.from("invoices").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("quotes").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("letterheads").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("tasks").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "pending"),
      ]);
      setStats({
        invoices: inv.count || 0,
        quotes: qt.count || 0,
        letterheads: lt.count || 0,
        tasks: tk.count || 0,
      });
    };
    fetchStats();

    // Show trial popup for new users
    if (profile?.subscription_plan === "trial") {
      setShowTrial(true);
    }
  }, [user, profile]);

  const statCards = [
    { icon: Receipt, label: "Invoices", value: stats.invoices, desc: "Total created", to: "/dashboard/invoices" },
    { icon: FileText, label: "Quotes", value: stats.quotes, desc: "Total created", to: "/dashboard/quotes" },
    { icon: Mail, label: "Letterheads", value: stats.letterheads, desc: "Total created", to: "/dashboard/letterhead" },
    { icon: CalendarDays, label: "Tasks", value: stats.tasks, desc: "Pending", to: "/dashboard/tasks" },
  ];

  return (
    <div className="space-y-8">
      {/* Trial popup */}
      <Dialog open={showTrial} onOpenChange={setShowTrial}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-xl">🎉 Welcome to Eden Desk!</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              You have a <span className="font-semibold text-foreground">7-day free trial</span> of the Silver plan.
              After your trial, continue for just <span className="font-semibold text-foreground">R59.99/month</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <p className="text-sm text-muted-foreground">Your trial includes:</p>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>✓ Invoices & Quotes</li>
              <li>✓ Letterheads with AI drafting</li>
              <li>✓ PDF download & email</li>
              <li>✓ 5 AI prompts per day</li>
            </ul>
          </div>
          <Button className="w-full mt-4" onClick={() => setShowTrial(false)}>
            Start Exploring
          </Button>
        </DialogContent>
      </Dialog>

      <div>
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-muted-foreground text-sm mt-1">{user?.email}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ icon: Icon, label, value, desc, to }) => (
          <Link key={label} to={to}>
            <div className="rounded-xl border border-border bg-card p-6 eden-card-hover">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">{label}</span>
              </div>
              <div className="text-3xl font-bold">{value}</div>
              <div className="text-xs text-muted-foreground mt-1">{desc}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <h3 className="text-lg font-semibold mb-2">Get Started</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Upload your company logo in <Link to="/dashboard/settings" className="text-foreground underline">Settings</Link> to personalize your documents, then create your first invoice or quote.
        </p>
      </div>
    </div>
  );
};

export default DashboardHome;
