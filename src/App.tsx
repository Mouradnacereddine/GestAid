import * as React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
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
import UpdatePassword from "./pages/UpdatePassword";
import VolunteerRequests from "./pages/VolunteerRequests";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppRoutes = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        navigate('/update-password');
      } else if (event === 'SIGNED_IN' && !session?.user.last_sign_in_at) {
        // This condition catches the first sign-in of an invited user.
        // Their last_sign_in_at is null until they set a password and log in normally.
        navigate('/update-password');
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <AuthProvider>
      <CurrencyProvider>
        <div className="min-h-screen w-full">
          <Toaster />
          <Sonner />
          <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/update-password" element={<UpdatePassword />} />

          {/* Protected routes with layout */}
          <Route element={<AppLayout />}>
            <Route index element={<ProtectedRoute allowedRoles={['superadmin', 'admin', 'benevole']}><Index /></ProtectedRoute>} />
            <Route path="articles" element={<ProtectedRoute allowedRoles={['superadmin', 'admin', 'benevole']}><Articles /></ProtectedRoute>} />
            <Route path="beneficiaires" element={<ProtectedRoute allowedRoles={['superadmin', 'admin', 'benevole']}><Beneficiaries /></ProtectedRoute>} />
            <Route path="prets" element={<ProtectedRoute allowedRoles={['superadmin', 'admin', 'benevole']}><Loans /></ProtectedRoute>} />
            
            <Route path="donateurs" element={<ProtectedRoute allowedRoles={['superadmin', 'admin']}><Donors /></ProtectedRoute>} />
            <Route path="rapports" element={<ProtectedRoute allowedRoles={['superadmin', 'admin']}><Reports /></ProtectedRoute>} />
            <Route path="finances" element={<ProtectedRoute allowedRoles={['superadmin', 'admin']}><Finances /></ProtectedRoute>} />
            <Route path="gestion" element={<ProtectedRoute allowedRoles={['superadmin', 'admin']}><Management /></ProtectedRoute>} />
            <Route path="parametres" element={<ProtectedRoute allowedRoles={['superadmin', 'admin']}><Settings /></ProtectedRoute>} />
            
            <Route path="/admin-requests" element={<ProtectedRoute allowedRoles={['superadmin']}><AdminRequests /></ProtectedRoute>} />
            <Route path="/volunteer-requests" element={<ProtectedRoute allowedRoles={['superadmin', 'admin']}><VolunteerRequests /></ProtectedRoute>} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      </CurrencyProvider>
    </AuthProvider>
  );
};

const App = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
