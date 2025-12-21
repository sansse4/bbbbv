import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { LayoutDashboard, Image, TrendingUp, Phone, Users, ClipboardCheck, UserCircle, Home, MapIcon, CalendarClock } from "lucide-react";
import roayaLogo from "@/assets/roaya-logo.png";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const menuItems = [{
  title: "Dashboard",
  url: "/",
  icon: LayoutDashboard,
  department: null,
  adminOnly: true
}, {
  title: "لوحتي",
  url: "/my-dashboard",
  icon: Home,
  department: null,
  forEmployees: true
}, {
  title: "Map",
  url: "/map",
  icon: MapIcon,
  department: null,
  forAll: true
}, {
  title: "حجز المواعيد",
  url: "/appointments",
  icon: CalendarClock,
  department: null,
  forAll: true
}, {
  title: "Media",
  url: "/media",
  icon: Image,
  department: "Media"
}, {
  title: "Sales",
  url: "/sales",
  icon: TrendingUp,
  department: "Sales"
}, {
  title: "Call Center",
  url: "/call-center",
  icon: Phone,
  department: "Call Center"
}, {
  title: "Reception",
  url: "/reception",
  icon: ClipboardCheck,
  department: "Reception"
}, {
  title: "Employees",
  url: "/employees",
  icon: UserCircle,
  department: null
}, {
  title: "User Management",
  url: "/users",
  icon: Users,
  department: null,
  adminOnly: true
}];

export function AppSidebar() {
  const { open, setOpen } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const { role, profile, user } = useAuth();
  const [supervisedDepartments, setSupervisedDepartments] = useState<string[]>([]);

  useEffect(() => {
    if (user?.id && role?.role === 'assistant_manager') {
      fetchSupervisedDepartments();
    }
  }, [user?.id, role?.role]);

  const fetchSupervisedDepartments = async () => {
    if (!user?.id) return;
    
    const { data, error } = await supabase
      .from('assistant_manager_departments')
      .select('department')
      .eq('user_id', user.id);
    
    if (!error && data) {
      setSupervisedDepartments(data.map(d => d.department));
    }
  };

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  const handleMenuClick = () => {
    setOpen(false);
  };

  // Filter menu items based on role and department
  const getVisibleMenuItems = () => {
    if (!role) return [];
    
    // Admin sees everything except employee-only items
    if (role.role === 'admin') {
      return menuItems.filter(item => !item.forEmployees);
    }

    // Assistant manager sees their supervised departments + employees + user management + my dashboard + forAll items
    if (role.role === 'assistant_manager') {
      return menuItems.filter(item => {
        // Show My Dashboard for assistant managers
        if (item.forEmployees) return true;
        // Show items available for all users
        if (item.forAll) return true;
        // Always show Employees
        if (item.url === '/employees') return true;
        // Show User Management for assistant managers
        if (item.url === '/users') return true;
        // Show departments they supervise (single department)
        if (item.department && supervisedDepartments.includes(item.department)) return true;
        // Hide main dashboard from assistant managers
        if (item.adminOnly) return false;
        return false;
      });
    }

    // Regular employees - show their department + my dashboard + forAll items
    const userDepartment = profile?.department;
    return menuItems.filter(item => {
      // Show My Dashboard for employees
      if (item.forEmployees) return true;
      // Show items available for all users
      if (item.forAll) return true;
      // Show their own department (single department)
      if (item.department && item.department === userDepartment) return true;
      // Hide admin-only items
      if (item.adminOnly) return false;
      return false;
    });
  };

  const visibleMenuItems = getVisibleMenuItems();

  return (
    <Sidebar className={open ? "w-64" : "w-16"} collapsible="icon">
      <SidebarContent className="bg-sidebar transition-all duration-300">
        <div className="p-4 border-b border-sidebar-border transition-all duration-300">
          <div className="flex items-center gap-3">
            <img src={roayaLogo} alt="Roaya Real Estate" className={`transition-all duration-300 ${open ? "h-12 w-auto" : "h-10 w-10 object-contain"}`} />
            <span className={`text-2xl brand-text transition-all duration-300 ${open ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 absolute pointer-events-none'}`}>
              R<span className="brand-o"></span>AYA
            </span>
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleMenuItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/"} 
                      className="hover:bg-sidebar-accent transition-all duration-200" 
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                      onClick={handleMenuClick}
                    >
                      <item.icon className={`h-5 w-5 transition-all duration-300 ${!open && 'scale-110'}`} />
                      <span className={`transition-all duration-300 ${open ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 absolute'}`}>
                        {item.title}
                      </span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}