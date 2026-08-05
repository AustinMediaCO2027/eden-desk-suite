import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useTheme } from "@/hooks/useTheme";
import { useSubscription, type PlanPermissions } from "@/hooks/useSubscription";
import UpgradeDialog from "@/components/UpgradeDialog";
import {
  LayoutDashboard,
  FileSpreadsheet,
  FileText,
  Mail,
  CalendarDays,
  Bot,
  Settings,
  CreditCard,
  LogOut,
  Menu,
  X,
  Users,
  FolderOpen,
  Gift,
  Shield,
  Crown,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import edenLogo from "@/assets/eden_desk_logo.png";
import edenIcon from "@/assets/eden_desk_icon.png";
import { useAffiliate } from "@/hooks/useAffiliate";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import { SocialBar } from "@/components/ads/SocialBar";
import aiAgentIcon from "@/assets/ai-agent-icon.png.asset.json";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/dashboard/invoices", icon: FileSpreadsheet, label: "Invoices" },
  { to: "/dashboard/quotes", icon: FileText, label: "Quotes" },
  { to: "/dashboard/letterhead", icon: Mail, label: "Letterheads" },
  { to: "/dashboard/clients", icon: Users, label: "Clients" },
  { to: "/dashboard/files", icon: FolderOpen, label: "Files", feature: "fileManager" as keyof PlanPermissions },
  { to: "/dashboard/tasks", icon: CalendarDays, label: "Tasks", feature: "tasks" as keyof PlanPermissions },
  { to: "/dashboard/referrals", icon: Gift, label: "Referrals" },
  { to: "/dashboard/ai", icon: Bot, iconSrc: aiAgentIcon.url, label: "AI Agent", feature: "aiAgent" as keyof PlanPermissions },
  { to: "/dashboard/billing", icon: CreditCard, label: "Billing" },
  { to: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export const DashboardLayout = () => {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const { theme, toggleTheme } = useTheme();
  const { isAdmin } = useAffiliate();
  const { canUseFeature } = useSubscription();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState<string | null>(null);

  const allNavItems = [
    ...navItems,
    ...(isAdmin ? [{ to: "/dashboard/admin/affiliates", icon: Shield, label: "Admin Affiliates" }] : []),
  ];


  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Adsterra Social Bar — free (Standard) users only */}
      <SocialBar />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col w-[240px] shrink-0 transform transition-transform duration-300 lg:translate-x-0 bg-sidebar border-r border-sidebar-border ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 pt-5 pb-4">
          <img src={edenIcon} alt="Eden Desk" className="h-8 w-8 rounded-lg" />
          <span className="text-lg font-bold text-sidebar-foreground tracking-tight">Eden Desk</span>
          <div className="ml-auto flex items-center gap-1">
            <NotificationBell />
            {/* Mobile close */}
            <button className="lg:hidden text-sidebar-foreground/60" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 pt-2 overflow-y-auto space-y-1">
          {allNavItems.map(({ to, icon: Icon, label, iconSrc, feature }: any) => {
            const isActive = location.pathname === to;
            const locked = feature ? !canUseFeature(feature) : false;
            const inner = (
              <>
                {iconSrc ? (
                  <img src={iconSrc} alt="" aria-hidden className="h-[18px] w-[18px] shrink-0 object-contain" />
                ) : (
                  <Icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? "text-sidebar-primary" : ""}`} />
                )}
                <span className="flex items-center gap-1.5">
                  <span>{label}</span>
                  {locked && <Crown className="h-3.5 w-3.5 shrink-0 text-amber-500" aria-label="Premium feature" />}
                </span>
              </>
            );
            const className = `flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 text-left ${
              isActive
                ? "bg-sidebar-primary/10 text-sidebar-primary border-l-[3px] border-sidebar-primary -ml-[3px] pl-[calc(0.75rem+3px)]"
                : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
            }`;

            if (locked) {
              return (
                <button
                  key={to}
                  type="button"
                  className={className}
                  onClick={() => {
                    setSidebarOpen(false);
                    setUpgradeFeature(label);
                  }}
                >
                  {inner}
                </button>
              );
            }

            return (
              <Link key={to} to={to} onClick={() => setSidebarOpen(false)} className={className}>
                {inner}
              </Link>
            );
          })}

        </nav>

        {/* Bottom section */}
        <div className="px-3 pb-4 space-y-3 mt-auto">
          {/* Dark mode toggle */}
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-3 text-sm text-sidebar-foreground/60">
              <span className="text-lg">🌙</span>
              <span className="font-medium">Dark Mode</span>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={theme === "dark"}
                onCheckedChange={toggleTheme}
                className="data-[state=checked]:bg-sidebar-primary"
              />
              <span className="text-[11px] font-semibold text-sidebar-foreground/40 uppercase">
                {theme === "dark" ? "On" : "Off"}
              </span>
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={signOut}
            className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium bg-sidebar-accent/60 text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-all duration-150"
          >
            <LogOut className="h-[18px] w-[18px]" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden h-12 border-b border-border flex items-center px-4">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 mx-auto">
            <img src={edenIcon} alt="Eden Desk" className="h-5 w-5 rounded" />
            <span className="text-sm font-bold">Eden Desk</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      <UpgradeDialog
        open={!!upgradeFeature}
        onOpenChange={(open) => !open && setUpgradeFeature(null)}
        feature={upgradeFeature ?? ""}
        requiredPlan="Silver"
      />
    </div>

  );
};
