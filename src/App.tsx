
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
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <Index />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/articles"
                    element={
                      <ProtectedRoute>
                        <Articles />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/beneficiaires"
                    element={
                      <ProtectedRoute>
                        <Beneficiaries />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/prets"
                    element={
                      <ProtectedRoute>
                        <Loans />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/donateurs"
                    element={
                      <ProtectedRoute>
                        <Donors />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/rapports"
                    element={
                      <ProtectedRoute>
                        <Reports />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/finances"
                    element={
                      <ProtectedRoute>
                        <Finances />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/gestion"
                    element={
                      <ProtectedRoute>
                        <Management />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/parametres"
                    element={
                      <ProtectedRoute>
                        <Settings />
                      </ProtectedRoute>
                    }
                  />
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
