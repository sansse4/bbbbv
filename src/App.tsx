import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PageTransition } from "@/components/PageTransition";
import Dashboard from "./pages/Dashboard";
import MyDashboard from "./pages/MyDashboard";
import Media from "./pages/Media";
import Sales from "./pages/Sales";
import CallCenter from "./pages/CallCenter";
import Reception from "./pages/Reception";
import Login from "./pages/Login";
import UserManagement from "./pages/UserManagement";
import Employees from "./pages/Employees";
import EmployeeProfile from "./pages/EmployeeProfile";
import Map from "./pages/Map";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function App() {
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <SidebarProvider>
                    <div className="min-h-screen flex w-full bg-background">
                      <AppSidebar />
                      <div className="flex-1 flex flex-col w-full">
                        <Header />
                        <main className="flex-1 p-3 md:p-6 overflow-auto">
                          <PageTransition>
                            <Routes>
                              <Route path="/" element={<Dashboard />} />
                              <Route path="/my-dashboard" element={<MyDashboard />} />
                              <Route path="/map" element={<Map />} />
                              <Route path="/media" element={<Media />} />
                              <Route path="/sales" element={<Sales />} />
                              <Route path="/call-center" element={<CallCenter />} />
                              <Route path="/reception" element={<Reception />} />
                              <Route path="/users" element={<UserManagement />} />
                              <Route path="/employees" element={<Employees />} />
                              <Route path="/employees/:employeeId" element={<EmployeeProfile />} />
                              <Route path="*" element={<NotFound />} />
                            </Routes>
                          </PageTransition>
                        </main>
                      </div>
                    </div>
                  </SidebarProvider>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
}

export default App;
