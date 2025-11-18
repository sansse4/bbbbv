import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { LayoutDashboard, Image, TrendingUp, Phone, FileText, BarChart3, Users, ClipboardCheck } from "lucide-react";
import roayaLogo from "@/assets/roaya-logo.png";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
const menuItems = [{
  title: "Dashboard",
  url: "/",
  icon: LayoutDashboard
}, {
  title: "Media",
  url: "/media",
  icon: Image
}, {
  title: "Sales",
  url: "/sales",
  icon: TrendingUp
}, {
  title: "Call Center",
  url: "/call-center",
  icon: Phone
}, {
  title: "Contract Registration",
  url: "/contracts",
  icon: FileText
}, {
  title: "Growth Analytics",
  url: "/analytics",
  icon: BarChart3
}, {
  title: "Reception",
  url: "/reception",
  icon: ClipboardCheck
}, {
  title: "User Management",
  url: "/users",
  icon: Users
}];
export function AppSidebar() {
  const {
    open
  } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const { role, profile } = useAuth();
  
  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  // Filter menu items based on role and department
  const getVisibleMenuItems = () => {
    if (!role) return [];
    
    if (role.role === 'admin') {
      return menuItems;
    }
    
    // For employees, show Dashboard and their department only (exclude User Management)
    const departmentPaths: { [key: string]: string } = {
      'Media': '/media',
      'Sales': '/sales',
      'Call Center': '/call-center',
      'Contract Registration': '/contracts',
      'Growth Analytics': '/analytics',
      'Reception': '/reception',
    };
    
    const userDepartmentPath = profile?.department ? departmentPaths[profile.department] : null;
    
    return menuItems.filter(item => 
      (item.url === '/' || item.url === userDepartmentPath) && item.url !== '/users'
    );
  };

  const visibleMenuItems = getVisibleMenuItems();
  return <Sidebar className={open ? "w-64" : "w-16"} collapsible="icon">
      <SidebarContent className="bg-slate-50">
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <img src={roayaLogo} alt="Roaya Real Estate" className={open ? "h-12 w-auto" : "h-10 w-10 object-contain"} />
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleMenuItems.map(item => <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end={item.url === "/"} className="hover:bg-sidebar-accent" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                      <item.icon className="h-5 w-5" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>;
}