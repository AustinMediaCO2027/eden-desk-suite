import {
  LayoutDashboard,
  Receipt,
  FileText,
  Mail,
  CalendarDays,
  Bot,
  CreditCard,
  Settings,
  LogOut,
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
  { icon: Receipt, label: "Invoices", value: "12", desc: "Total created" },
  { icon: FileText, label: "Quotes", value: "8", desc: "Total created" },
  { icon: Mail, label: "Letterheads", value: "5", desc: "Total created" },
  { icon: CalendarDays, label: "Tasks", value: "3", desc: "Pending" },
];

const recentInvoices = [
  { number: "INV-001", client: "Acme Corp", total: "R12,500.00", status: "paid" },
  { number: "INV-002", client: "Zylker Ltd", total: "R8,200.00", status: "sent" },
  { number: "INV-003", client: "Nova Holdings", total: "R3,750.00", status: "draft" },
];

export const DashboardMockup = () => {
  return (
    <div className="rounded-t-2xl border border-border border-b-0 overflow-hidden shadow-2xl shadow-foreground/5 bg-background text-left select-none pointer-events-none">
      <div className="flex h-[440px] md:h-[500px]">
        {/* Sidebar */}
        <aside className="hidden md:flex w-52 shrink-0 flex-col border-r border-border" style={{ background: "hsl(0 0% 4%)" }}>
          <div className="h-12 flex items-center px-4 border-b border-border">
            <img src={edenLogo} alt="Eden Desk" className="h-5 invert" />
          </div>
          <nav className="flex-1 py-3 px-2.5 space-y-0.5">
            {sidebarItems.map(({ icon: Icon, label, active }) => (
              <div
                key={label}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors ${
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
          <div className="px-2.5 pb-3 border-t border-border pt-3">
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-muted-foreground">
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 p-5 md:p-6 overflow-hidden">
          <div className="mb-5">
            <h3 className="text-base font-bold">Welcome back</h3>
            <p className="text-[11px] text-muted-foreground">user@company.com</p>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {stats.map(({ icon: Icon, label, value, desc }) => (
              <div key={label} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-7 w-7 rounded-md bg-secondary flex items-center justify-center">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[10px] font-medium">{label}</span>
                </div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">{desc}</p>
              </div>
            ))}
          </div>

          {/* Recent invoices */}
          <div className="mt-4 rounded-xl border border-border bg-card p-4">
            <p className="text-xs font-semibold mb-3">Recent Invoices</p>
            <div className="space-y-2">
              {recentInvoices.map((inv) => (
                <div key={inv.number} className="flex items-center justify-between py-1.5">
                  <div>
                    <p className="text-[11px] font-medium">{inv.number}</p>
                    <p className="text-[9px] text-muted-foreground">{inv.client}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-[11px] font-semibold">{inv.total}</p>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                      inv.status === "paid" ? "bg-green-900/30 text-green-400" :
                      inv.status === "sent" ? "bg-blue-900/30 text-blue-400" :
                      "bg-secondary text-muted-foreground"
                    }`}>
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
