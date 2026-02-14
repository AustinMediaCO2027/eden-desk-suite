import { useAuth } from "@/hooks/useAuth";
import { Receipt, FileText, Mail, CalendarDays } from "lucide-react";

const stats = [
  { icon: Receipt, label: "Invoices", value: "0", desc: "Total created" },
  { icon: FileText, label: "Quotes", value: "0", desc: "Total created" },
  { icon: Mail, label: "Letterheads", value: "0", desc: "Total created" },
  { icon: CalendarDays, label: "Tasks", value: "0", desc: "Pending" },
];

const DashboardHome = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-muted-foreground text-sm mt-1">{user?.email}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ icon: Icon, label, value, desc }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-6 eden-card-hover">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium">{label}</span>
            </div>
            <div className="text-3xl font-bold">{value}</div>
            <div className="text-xs text-muted-foreground mt-1">{desc}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <h3 className="text-lg font-semibold mb-2">Get Started</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Create your first invoice, quote, or letterhead using the sidebar navigation. Upload your company logo in Settings to personalize your documents.
        </p>
      </div>
    </div>
  );
};

export default DashboardHome;
