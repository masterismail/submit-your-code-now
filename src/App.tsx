
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DataProvider } from "./context/DataContext";
import MainLayout from "./components/layout/MainLayout";
import { useEffect, useState } from "react";
import { isAuthenticated } from "./services/authService";

import LandingPage from "./pages/LandingPage";
import VerifyOTP from "./pages/VerifyOTP";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import AddExpense from "./pages/AddExpense";
import Expenses from "./pages/Expenses";
import Wallet from "./pages/Wallet";
import Goals from "./pages/Goals";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Check authentication status
  const [authChecked, setAuthChecked] = useState(false);
  const [userAuthenticated, setUserAuthenticated] = useState(false);

  useEffect(() => {
    // Check if the user is authenticated
    const authStatus = isAuthenticated();
    setUserAuthenticated(authStatus);
    setAuthChecked(true);
  }, []);

  // Protected route component
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!authChecked) {
      // Show loading state while checking authentication
      return <div>Loading...</div>;
    }
    
    if (!userAuthenticated) {
      // Redirect to landing page if not authenticated
      return <Navigate to="/landing" replace />;
    }
    
    return <>{children}</>;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <DataProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />
              <Route path="/auth/callback" element={<AuthCallback />} />

              {/* Protected routes */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="add-expense" element={<AddExpense />} />
                <Route path="expenses" element={<Expenses />} />
                <Route path="wallet" element={<Wallet />} />
                <Route path="goals" element={<Goals />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </DataProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
