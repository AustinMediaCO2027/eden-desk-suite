import {
  LayoutDashboard,
  Receipt,
  FileText,
  Mail,
  CalendarDays,
  Bot,
  CreditCard,
  Settings,
} from "lucide-react";
import edenLogo from "@/assets/eden_desk_logo_hero.png";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Receipt, label: "Invoices" },
  { icon: FileText, label: "Quotes" },
  { icon: Mail, label: "Letterhead" },
  { icon: CalendarDays, label: "Tasks" },
  { icon: Bot, label: "AI Agent" },
  { icon: CreditCard, label: "Billing" },
  { icon: Settings, label: "Settings" },
];

const stats = [
  { label: "Invoices", value: "12", desc: "Total created" },
  { label: "Quotes", value: "8", desc: "Total created" },
  { label: "Letterheads", value: "5", desc: "Total created" },
  { label: "Tasks", value: "3", desc: "Pending" },
];

export const DashboardMockup = () => {
  return (
    <div className="rounded-t-2xl border border-border border-b-0 overflow-hidden shadow-2xl shadow-foreground/5 bg-background text-left select-none pointer-events-none">
      <div className="flex h-[420px] md:h-[480px]">
        {/* Sidebar */}
        <aside className="hidden sm:flex w-48 shrink-0 flex-col border-r border-border bg-eden-surface">
          <div className="h-12 flex items-center px-4 border-b border-border">
            <img src={edenLogo} alt="Eden Desk" className="h-5 invert" />
          </div>
          <nav className="flex-1 py-3 px-2 space-y-0.5">
            {sidebarItems.map(({ icon: Icon, label, active }) => (
              <div
                key={label}
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs ${
                  active
                    ? "bg-sidebar-accent text-foreground font-medium"
                    : "text-muted-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <div className="flex-1 p-5 md:p-6 overflow-hidden">
          <div className="mb-1">
            <h3 className="text-sm font-semibold">Welcome back</h3>
            <p className="text-[10px] text-muted-foreground">user@company.com</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            {stats.map(({ label, value, desc }) => (
              <div key={label} className="rounded-lg border border-border bg-card p-4">
                <p className="text-[10px] text-muted-foreground mb-2">{label}</p>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-[9px] text-muted-foreground mt-1">{desc}</p>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-border bg-card p-5 mt-4 text-center">
            <p className="text-xs font-medium mb-1">Get Started</p>
            <p className="text-[10px] text-muted-foreground max-w-xs mx-auto">
              Upload your company logo in Settings to personalise your documents, then create your first invoice or quote.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
