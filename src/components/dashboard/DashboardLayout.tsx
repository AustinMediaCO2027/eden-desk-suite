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
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import edenLogo from "@/assets/eden_desk_icon.png";

const mainNav = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/dashboard/invoices", icon: Receipt, label: "Invoices" },
  { to: "/dashboard/quotes", icon: FileText, label: "Quotes" },
  { to: "/dashboard/letterhead", icon: Mail, label: "Letterheads" },
  { to: "/dashboard/clients", icon: Users, label: "Clients" },
  { to: "/dashboard/tasks", icon: CalendarDays, label: "Tasks" },
];

const toolsNav = [
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
  const [collapsed, setCollapsed] = useState(false);

  const userInitials = profile?.company_name
    ? profile.company_name.slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || "ED";

  const displayName = profile?.company_name || user?.email?.split("@")[0] || "User";
  const displayRole = profile?.subscription_plan === "trial" ? "Free Trial" : "Admin";

  const renderNavItem = ({ to, icon: Icon, label }: typeof mainNav[0]) => {
    const isActive = location.pathname === to;
    return (
      <Link
        key={to}
        to={to}
        onClick={() => setSidebarOpen(false)}
        title={collapsed ? label : undefined}
        className={`group flex items-center gap-3 rounded-xl text-sm transition-all duration-200 ${
          collapsed ? "justify-center p-2.5" : "px-3 py-2.5"
        } ${
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
            : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/40"
        }`}
      >
        <Icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? "text-sidebar-primary" : ""}`} />
        {!collapsed && <span>{label}</span>}
      </Link>
    );
  };

  const renderGroupLabel = (label: string) => (
    <p className={`text-[10px] font-semibold uppercase tracking-[0.15em] mb-2 mt-6 first:mt-0 text-[hsl(var(--sidebar-group-label))] ${
      collapsed ? "text-center px-0" : "px-3"
    }`}>
      {collapsed ? label.slice(0, 1) : label}
    </p>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col transform transition-all duration-300 lg:translate-x-0 bg-sidebar border-r border-sidebar-border ${
          collapsed ? "w-[72px]" : "w-[250px]"
        } ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* User profile section at top */}
        <div className={`pt-5 pb-4 border-b border-sidebar-border ${collapsed ? "px-3" : "px-4"}`}>
          <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
            <Avatar className="h-10 w-10 shrink-0 ring-2 ring-sidebar-primary/30 ring-offset-2 ring-offset-sidebar">
              <AvatarFallback className="bg-sidebar-accent text-sidebar-primary text-xs font-bold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--sidebar-group-label))]">
                  {displayRole}
                </p>
                <p className="text-sm font-semibold text-sidebar-foreground truncate leading-tight">
                  {displayName}
                </p>
              </div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex items-center justify-center h-6 w-6 rounded-full bg-sidebar-accent hover:bg-sidebar-accent/80 text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
            >
              {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
            </button>
          </div>
          {/* Mobile close */}
          <button className="lg:hidden absolute top-4 right-3 text-sidebar-foreground/60" onClick={() => setSidebarOpen(false)}>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 pt-4 overflow-y-auto space-y-0.5 ${collapsed ? "px-2" : "px-3"}`}>
          {renderGroupLabel("Documents")}
          <div className="space-y-0.5">
            {mainNav.map(renderNavItem)}
          </div>

          {renderGroupLabel("Tools")}
          <div className="space-y-0.5">
            {toolsNav.map(renderNavItem)}
          </div>

          {renderGroupLabel("Account")}
          <div className="space-y-0.5">
            {accountNav.map(renderNavItem)}
            <button
              onClick={toggleTheme}
              title={collapsed ? (theme === "dark" ? "Light Mode" : "Dark Mode") : undefined}
              className={`flex items-center gap-3 rounded-xl text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/40 w-full transition-all duration-200 ${
                collapsed ? "justify-center p-2.5" : "px-3 py-2.5"
              }`}
            >
              {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
              {!collapsed && <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
            </button>
          </div>
        </nav>

        {/* Bottom section */}
        <div className={`p-3 ${collapsed ? "px-2" : ""}`}>
          {!collapsed && (
            <div className="rounded-xl bg-sidebar-accent/60 border border-sidebar-border p-4 mb-3">
              <p className="text-sm font-semibold text-sidebar-foreground mb-1">Let's start!</p>
              <p className="text-[11px] text-sidebar-foreground/50 leading-relaxed mb-3">
                Creating or adding new tasks couldn't be easier
              </p>
              <Link
                to="/dashboard/tasks"
                className="flex items-center justify-center gap-1.5 w-full rounded-lg bg-sidebar-primary text-sidebar-primary-foreground py-2 text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                + Add New Task
              </Link>
            </div>
          )}
          <button
            onClick={signOut}
            title={collapsed ? "Logout" : undefined}
            className={`flex items-center gap-3 rounded-xl text-sm text-sidebar-foreground/40 hover:text-destructive w-full transition-colors ${
              collapsed ? "justify-center p-2.5" : "px-3 py-2.5"
            }`}
          >
            <LogOut className="h-[18px] w-[18px]" />
            {!collapsed && <span>Logout</span>}
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
          <div className="flex items-center gap-2 mx-auto">
            <img src={edenLogo} alt="Eden Desk" className="h-5 w-5 rounded" />
            <span className="text-sm font-bold">eden desk</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};