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
  MoreHorizontal,
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
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
          isActive
            ? "bg-primary text-primary-foreground font-medium shadow-sm"
            : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
        }`}
      >
        <Icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? "text-primary-foreground" : ""}`} />
        <span>{label}</span>
      </Link>
    );
  };

  const renderGroupLabel = (label: string) => (
    <p className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-[0.12em] px-3 mb-1.5 mt-6 first:mt-0">
      {label}
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
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[240px] bg-sidebar border-r border-sidebar-border flex flex-col transform transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo section */}
        <div className="px-5 pt-5 pb-1 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <img src={edenLogo} alt="Eden Desk" className="h-7 w-7 rounded-lg" />
            <span className="text-[15px] font-bold tracking-tight">eden desk</span>
          </Link>
          <button className="lg:hidden text-sidebar-foreground" onClick={() => setSidebarOpen(false)}>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 pt-5 overflow-y-auto space-y-0.5">
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
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/60 w-full transition-all duration-150"
            >
              {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
              <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            </button>
          </div>
        </nav>

        {/* User card at bottom */}
        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-sidebar-accent/60 transition-colors cursor-pointer">
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate leading-tight">{displayName}</p>
              <p className="text-[11px] text-muted-foreground truncate leading-tight">{displayRole}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); signOut(); }}
              title="Logout"
              className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
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
