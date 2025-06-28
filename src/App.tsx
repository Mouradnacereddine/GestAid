
import * as React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Articles from "./pages/Articles";
import Beneficiaries from "./pages/Beneficiaries";
import Loans from "./pages/Loans";
import Donors from "./pages/Donors";
import Reports from "./pages/Reports";
import Finances from "./pages/Finances";
import Management from "./pages/Management";
import AdminRequests from "./pages/AdminRequests";
import AppLayout from "./components/AppLayout";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <AuthProvider>
              <div className="min-h-screen w-full">
                <Toaster />
                <Sonner />
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  
                  {/* Protected routes with layout */}
                  <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                    <Route index element={<Index />} />
                    <Route path="articles" element={<Articles />} />
                    <Route path="beneficiaires" element={<Beneficiaries />} />
                    <Route path="prets" element={<Loans />} />
                    <Route path="donateurs" element={<Donors />} />
                    <Route path="rapports" element={<Reports />} />
                    <Route path="finances" element={<Finances />} />
                    <Route path="gestion" element={<Management />} />
                    <Route path="parametres" element={<Settings />} />
                    <Route
                      path="admin-requests"
                      element={
                        <ProtectedRoute allowedRoles={['superadmin']}>
                          <AdminRequests />
                        </ProtectedRoute>
                      }
                    />
                  </Route>

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
