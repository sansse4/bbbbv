import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import { AuthProvider } from "@/contexts/AuthContext";
import { DashboardSettingsProvider } from "@/contexts/DashboardSettingsContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PageTransition } from "@/components/PageTransition";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { DashboardSkeleton } from "@/components/LoadingSkeleton";

// Lazy load pages for better performance
const Dashboard = lazy(() => import("./pages/Dashboard"));
const MyDashboard = lazy(() => import("./pages/MyDashboard"));
const Media = lazy(() => import("./pages/Media"));
const Sales = lazy(() => import("./pages/Sales"));
const CallCenter = lazy(() => import("./pages/CallCenter"));
const Reception = lazy(() => import("./pages/Reception"));
const Login = lazy(() => import("./pages/Login"));
const UserManagement = lazy(() => import("./pages/UserManagement"));
const Employees = lazy(() => import("./pages/Employees"));
const EmployeeProfile = lazy(() => import("./pages/EmployeeProfile"));
const Map = lazy(() => import("./pages/Map"));
const Appointments = lazy(() => import("./pages/Appointments"));
const NotFound = lazy(() => import("./pages/NotFound"));

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
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
                  <Login />
                </Suspense>
              } />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <DashboardSettingsProvider>
                      <SidebarProvider>
                        <div className="min-h-screen flex w-full bg-background">
                          <AppSidebar />
                          <div className="flex-1 flex flex-col w-full">
                            <Header />
                            <main className="flex-1 p-3 md:p-6 overflow-auto">
                              <PageTransition>
                                <Suspense fallback={<DashboardSkeleton />}>
                                  <Routes>
                                    <Route path="/" element={<Dashboard />} />
                                    <Route path="/my-dashboard" element={<MyDashboard />} />
                                    <Route path="/map" element={<Map />} />
                                    <Route path="/media" element={<Media />} />
                                    <Route path="/sales" element={<Sales />} />
                                    <Route path="/call-center" element={<CallCenter />} />
                                    <Route path="/appointments" element={<Appointments />} />
                                    <Route path="/reception" element={<Reception />} />
                                    <Route path="/users" element={<UserManagement />} />
                                    <Route path="/employees" element={<Employees />} />
                                    <Route path="/employees/:employeeId" element={<EmployeeProfile />} />
                                    <Route path="*" element={<NotFound />} />
                                  </Routes>
                                </Suspense>
                              </PageTransition>
                            </main>
                          </div>
                        </div>
                      </SidebarProvider>
                    </DashboardSettingsProvider>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
  );
}

export default App;
