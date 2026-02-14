import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useTheme } from "@/hooks/useTheme";
import {
  LayoutDashboard,
  Receipt,
  FileText,
  Mail,
  CalendarDays,
  Bot,
  Settings,
  CreditCard,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const mainNav = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/dashboard/invoices", icon: Receipt, label: "Invoices" },
  { to: "/dashboard/quotes", icon: FileText, label: "Quotes" },
  { to: "/dashboard/letterhead", icon: Mail, label: "Letterheads" },
  { to: "/dashboard/tasks", icon: CalendarDays, label: "Tasks" },
  { to: "/dashboard/ai", icon: Bot, label: "AI Agent" },
];

const accountNav = [
  { to: "/dashboard/billing", icon: CreditCard, label: "Billing" },
  { to: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export const DashboardLayout = () => {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userInitials = profile?.company_name
    ? profile.company_name.slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || "ED";

  const renderNavItem = ({ to, icon: Icon, label }: typeof mainNav[0]) => {
    const isActive = location.pathname === to;
    return (
      <Link
        key={to}
        to={to}
        onClick={() => setSidebarOpen(false)}
        className={`relative flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-colors ${
          isActive
            ? "bg-sidebar-accent text-sidebar-foreground font-medium"
            : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
        }`}
      >
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-foreground rounded-r-full" />
        )}
        <Icon className="h-4 w-4 shrink-0" />
        {label}
      </Link>
    );
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-background/80 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-60 bg-sidebar border-r border-sidebar-border flex flex-col transform transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo section */}
        <div className="px-5 pt-6 pb-2">
          <div className="flex items-center justify-between">
            <Link to="/dashboard">
              <h1 className="text-base font-bold tracking-tight">eden desk</h1>
            </Link>
            <button className="lg:hidden text-sidebar-foreground" onClick={() => setSidebarOpen(false)}>
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Your Business. Organized.</p>
        </div>

        {/* User profile card */}
        <div className="mx-3 mt-4 mb-2 p-3 rounded-lg bg-sidebar-accent/50 border border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-foreground text-background text-xs font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium truncate">
                {profile?.company_name || user?.email?.split("@")[0] || "User"}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                {profile?.subscription_plan === "trial" ? "Free Trial" : "Admin"}
              </p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 pt-4 overflow-y-auto">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-2">Main</p>
          <div className="space-y-0.5">
            {mainNav.map(renderNavItem)}
          </div>

          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-2 mt-6">Account</p>
          <div className="space-y-0.5">
            {accountNav.map(renderNavItem)}
          </div>
        </nav>

        {/* Bottom actions */}
        <div className="p-3 border-t border-sidebar-border space-y-0.5">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50 w-full transition-colors"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-muted-foreground hover:text-destructive hover:bg-sidebar-accent/50 w-full transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden h-12 border-b border-border flex items-center px-4">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-bold mx-auto">eden desk</span>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
