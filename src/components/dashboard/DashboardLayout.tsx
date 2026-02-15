import { useState, useEffect } from "react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  const isHome = location.pathname === "/dashboard";
  const [collapsed, setCollapsed] = useState(!isHome);

  // Auto-expand on dashboard home, auto-collapse on subpages
  useEffect(() => {
    setCollapsed(!isHome);
  }, [isHome]);

  const userInitials = profile?.company_name
    ? profile.company_name.slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || "ED";

  const displayName = profile?.company_name || user?.email?.split("@")[0] || "User";
  const planLabel = profile?.subscription_plan;
  const displayRole = planLabel === "trial" ? "Free Trial" 
    : planLabel && planLabel !== "free" ? `${planLabel.charAt(0).toUpperCase() + planLabel.slice(1)} Plan` 
    : "Free";

  const renderNavItem = ({ to, icon: Icon, label }: typeof mainNav[0]) => {
    const isActive = location.pathname === to;
    const link = (
      <Link
        to={to}
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center gap-2.5 rounded-lg text-[13px] transition-all duration-200 ${
          collapsed ? "justify-center p-2" : "px-2.5 py-1.5"
        } ${
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
            : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/40"
        }`}
      >
        <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-sidebar-primary" : ""}`} />
        {!collapsed && <span>{label}</span>}
      </Link>
    );

    if (collapsed) {
      return (
        <Tooltip key={to} delayDuration={0}>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent
            side="right"
            sideOffset={8}
            className="bg-sidebar border-sidebar-border text-sidebar-foreground font-medium text-sm px-3 py-1.5 shadow-xl z-[9999]"
          >
            {label}
          </TooltipContent>
        </Tooltip>
      );
    }
    return <div key={to}>{link}</div>;
  };

  const renderGroupLabel = (label: string) => (
    <p className={`text-[9px] font-semibold uppercase tracking-[0.15em] mb-1 mt-3 first:mt-0 text-[hsl(var(--sidebar-group-label))] ${
      collapsed ? "text-center px-0" : "px-2.5"
    }`}>
      {collapsed ? label.slice(0, 1) : label}
    </p>
  );

  const themeButton = (
    <button
      onClick={toggleTheme}
      className={`flex items-center gap-2.5 rounded-lg text-[13px] text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/40 w-full transition-all duration-200 ${collapsed ? "justify-center p-2" : "px-2.5 py-1.5"}`}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      {!collapsed && <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
    </button>
  );

  const logoutButton = (
    <button
      onClick={signOut}
      className={`flex items-center gap-2.5 rounded-lg text-[13px] text-sidebar-foreground/40 hover:text-destructive w-full transition-colors ${collapsed ? "justify-center p-2" : "px-2.5 py-1.5"}`}
    >
      <LogOut className="h-4 w-4" />
      {!collapsed && <span>Logout</span>}
    </button>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <TooltipProvider delayDuration={0}>
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col shrink-0 transform transition-all duration-300 lg:translate-x-0 bg-sidebar overflow-hidden relative ${
            collapsed ? "w-[60px]" : "w-[220px]"
          } ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          {/* Aurora background effect */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full bg-[hsl(15_80%_40%/0.15)] blur-[80px]" />
            <div className="absolute top-1/3 -right-10 w-40 h-40 rounded-full bg-[hsl(210_70%_35%/0.1)] blur-[60px]" />
            <div className="absolute bottom-20 left-1/4 w-48 h-48 rounded-full bg-[hsl(25_90%_45%/0.08)] blur-[70px]" />
            <div className="absolute -bottom-10 -right-10 w-36 h-36 rounded-full bg-[hsl(200_60%_30%/0.08)] blur-[50px]" />
          </div>
          {/* User profile section at top */}
          <div className={`relative z-10 pt-3 pb-3 border-b border-sidebar-border ${collapsed ? "px-2" : "px-3"}`}>
            <div className={`flex items-center ${collapsed ? "justify-center" : "gap-2.5"}`}>
              <Avatar className="h-8 w-8 shrink-0 ring-2 ring-sidebar-primary/30 ring-offset-1 ring-offset-sidebar">
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
                className="hidden lg:flex items-center justify-center h-5 w-5 rounded-full bg-sidebar-accent hover:bg-sidebar-accent/80 text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
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
          <nav className={`relative z-10 flex-1 pt-2 overflow-y-auto sidebar-scroll space-y-0.5 ${collapsed ? "px-1.5" : "px-2"}`}>
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
              {collapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>{themeButton}</TooltipTrigger>
                  <TooltipContent
                    side="right"
                    sideOffset={8}
                    className="bg-sidebar border-sidebar-border text-sidebar-foreground font-medium text-sm px-3 py-1.5 shadow-xl z-[9999]"
                  >
                    {theme === "dark" ? "Light Mode" : "Dark Mode"}
                  </TooltipContent>
                </Tooltip>
              ) : (
                themeButton
              )}
            </div>
          </nav>

          {/* Bottom section */}
          <div className={`relative z-10 p-2 ${collapsed ? "px-1.5" : ""}`}>
            {!collapsed && (
              <div className="rounded-lg bg-sidebar-accent/60 border border-sidebar-border p-3 mb-2">
                <p className="text-xs font-semibold text-sidebar-foreground mb-0.5">Let's start!</p>
                <p className="text-[10px] text-sidebar-foreground/50 leading-relaxed mb-2">
                  Creating or adding new tasks couldn't be easier
                </p>
                <Link
                  to="/dashboard/tasks"
                  className="flex items-center justify-center gap-1.5 w-full rounded-md bg-sidebar-primary text-sidebar-primary-foreground py-1.5 text-[11px] font-semibold hover:opacity-90 transition-opacity"
                >
                  + Add New Task
                </Link>
              </div>
            )}
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>{logoutButton}</TooltipTrigger>
                <TooltipContent
                  side="right"
                  sideOffset={8}
                  className="bg-sidebar border-sidebar-border text-sidebar-foreground font-medium text-sm px-3 py-1.5 shadow-xl z-[9999]"
                >
                  Logout
                </TooltipContent>
              </Tooltip>
            ) : (
              logoutButton
            )}
          </div>
        </aside>
      </TooltipProvider>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
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

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
