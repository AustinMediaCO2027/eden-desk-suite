import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
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
              <Route path="tasks" element={<TasksPage />} />
              <Route path="ai" element={<AIAgentPage />} />
              <Route path="billing" element={<BillingPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
