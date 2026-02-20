import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { CurrencyProvider } from "@/hooks/useCurrency";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import DashboardHome from "./pages/dashboard/DashboardHome";
import InvoicesPage from "./pages/dashboard/InvoicesPage";
import QuotesPage from "./pages/dashboard/QuotesPage";
import LetterheadPage from "./pages/dashboard/LetterheadPage";
import TasksPage from "./pages/dashboard/TasksPage";
import AIAgentPage from "./pages/dashboard/AIAgentPage";
import BillingPage from "./pages/dashboard/BillingPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import ClientsPage from "./pages/dashboard/ClientsPage";
import FilesPage from "./pages/dashboard/FilesPage";
import ReferralsPage from "./pages/dashboard/ReferralsPage";
import AdminAffiliatesPage from "./pages/dashboard/AdminAffiliatesPage";
import AffiliatePage from "./pages/AffiliatePage";
import NotFound from "./pages/NotFound";
import SharedFilePage from "./pages/SharedFilePage";
import { useReferralTracking } from "./hooks/useReferralTracking";

const queryClient = new QueryClient();

const ReferralTracker = ({ children }: { children: React.ReactNode }) => {
  useReferralTracking();
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
    <CurrencyProvider>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ReferralTracker>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/affiliate" element={<AffiliatePage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardHome />} />
              <Route path="invoices" element={<InvoicesPage />} />
              <Route path="quotes" element={<QuotesPage />} />
              <Route path="letterhead" element={<LetterheadPage />} />
              <Route path="clients" element={<ClientsPage />} />
              <Route path="files" element={<FilesPage />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="referrals" element={<ReferralsPage />} />
              <Route path="ai" element={<AIAgentPage />} />
              <Route path="billing" element={<BillingPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="admin/affiliates" element={<AdminAffiliatesPage />} />
            </Route>
            <Route path="/shared/:token" element={<SharedFilePage />} />
            <Route path="/share/:token" element={<SharedFilePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </ReferralTracker>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
    </CurrencyProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
