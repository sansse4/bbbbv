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
import Media from "./pages/Media";
import Sales from "./pages/Sales";
import CallCenter from "./pages/CallCenter";
import Contracts from "./pages/Contracts";
import Analytics from "./pages/Analytics";
import Reception from "./pages/Reception";
import Login from "./pages/Login";
import UserManagement from "./pages/UserManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
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
                      <div className="flex-1 flex flex-col">
                        <Header />
                        <main className="flex-1 p-6 overflow-auto">
                          <PageTransition>
                            <Routes>
                              <Route path="/" element={<Dashboard />} />
                              <Route path="/media" element={<Media />} />
                              <Route path="/sales" element={<Sales />} />
                              <Route path="/call-center" element={<CallCenter />} />
                              <Route path="/contracts" element={<Contracts />} />
                              <Route path="/analytics" element={<Analytics />} />
                              <Route path="/reception" element={<Reception />} />
                              <Route path="/users" element={<UserManagement />} />
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

export default App;
