import { Search, Settings, User, LogOut, Eye, EyeOff, ChevronDown } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import NotificationBell from "@/components/NotificationBell";
import { useDashboardSettings } from "@/contexts/DashboardSettingsContext";

const visibilityLabels: Record<string, { label: string; category: string }> = {
  showCustomersCard: { label: "بطاقة عدد العملاء", category: "البطاقات" },
  showSalesCard: { label: "بطاقة إجمالي المبيعات", category: "البطاقات" },
  showRealPriceCard: { label: "بطاقة السعر الحقيقي", category: "البطاقات" },
  showDepositsCard: { label: "بطاقة مجموع المقدمات", category: "البطاقات" },
  showFinancialSummary: { label: "قسم الملخص المالي", category: "الأقسام" },
  showFinanceRealPrice: { label: "السعر الحقيقي (مالي)", category: "الملخص المالي" },
  showFinanceSalePrice: { label: "سعر البيع (مالي)", category: "الملخص المالي" },
  showFinanceDownPayment: { label: "قيمة المقدمة (مالي)", category: "الملخص المالي" },
  showFinanceAdminCommission: { label: "العمولة الإدارية", category: "الملخص المالي" },
  showFinanceRoayaCommission: { label: "عمولة شركة رؤية", category: "الملخص المالي" },
  showFinanceNetIncome: { label: "صافي الدخل", category: "الملخص المالي" },
  showSalesTable: { label: "جدول المبيعات", category: "الأقسام" },
  showLeadsList: { label: "قائمة العملاء المحتملين", category: "الأقسام" },
  showCallsList: { label: "قائمة المكالمات", category: "الأقسام" },
  showSitePlan: { label: "المخطط التفاعلي", category: "الأقسام" },
  showCharts: { label: "الرسوم البيانية", category: "الأقسام" },
};

export function Header() {
  const { profile, role, signOut } = useAuth();
  const { visibility, toggleVisibility, showAllSections, hideAllSections } = useDashboardSettings();
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const categories = ["البطاقات", "الأقسام", "الملخص المالي"];

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 gap-4">
      <div className="flex items-center gap-4 flex-1">
        <SidebarTrigger />
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search properties, clients..."
            className="pl-9 bg-background"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <NotificationBell />
        
        {/* Settings Dropdown - Only visible for admins */}
        {role?.role === 'admin' && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel>إعدادات لوحة التحكم</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <div className="flex gap-2 px-2 py-1.5">
                <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={showAllSections}>
                  <Eye className="h-3 w-3 ml-1" />
                  إظهار الكل
                </Button>
                <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={hideAllSections}>
                  <EyeOff className="h-3 w-3 ml-1" />
                  إخفاء الكل
                </Button>
              </div>
              
              <DropdownMenuSeparator />
              
              <ScrollArea className="h-64">
                {categories.map(category => (
                  <div key={category}>
                    <DropdownMenuLabel className="text-xs text-muted-foreground">{category}</DropdownMenuLabel>
                    {Object.entries(visibilityLabels)
                      .filter(([_, value]) => value.category === category)
                      .map(([key, value]) => (
                        <DropdownMenuItem
                          key={key}
                          className="cursor-pointer flex items-center justify-between"
                          onSelect={(e) => e.preventDefault()}
                        >
                          <span className="text-sm">{value.label}</span>
                          <Switch
                            checked={visibility[key as keyof typeof visibility]}
                            onCheckedChange={() => toggleVisibility(key as keyof typeof visibility)}
                          />
                        </DropdownMenuItem>
                      ))}
                  </div>
                ))}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <ThemeToggle />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {profile ? getInitials(profile.full_name) : <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{profile?.full_name}</p>
                <p className="text-xs text-muted-foreground">
                  {role?.role === 'admin' ? 'Administrator' : profile?.department}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
