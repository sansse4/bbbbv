import { useState } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { MetricCard } from "@/components/MetricCard";
import { InteractiveSitePlan } from "@/components/InteractiveSitePlan";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTotalDeposits } from "@/hooks/useTotalDeposits";
import { useSalesSheetData } from "@/hooks/useSalesSheetData";
import { cn } from "@/lib/utils";
import {
  Users,
  TrendingUp,
  FileText,
  DollarSign,
  Phone,
  Wallet,
  RefreshCw,
  Banknote,
  CalendarIcon,
  X,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

const Dashboard = () => {
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);

  const { total: totalDeposits, isLoading: depositsLoading, refetch: refetchDeposits } = useTotalDeposits();
  
  const filters = {
    dateFrom: dateFrom ? format(dateFrom, "yyyy-MM-dd") : undefined,
    dateTo: dateTo ? format(dateTo, "yyyy-MM-dd") : undefined,
  };
  
  const { totals, customersCount, rows, isLoading: salesLoading, refetch: refetchSales } = useSalesSheetData(filters);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("ar-IQ", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate sales person performance data
  const salesPersonData = rows.reduce((acc, row) => {
    const person = row.salesPerson;
    if (!person) return acc;
    if (!acc[person]) {
      acc[person] = { name: person, sales: 0, revenue: 0 };
    }
    acc[person].sales += 1;
    acc[person].revenue += typeof row.salePrice === 'number' ? row.salePrice : 0;
    return acc;
  }, {} as Record<string, { name: string; sales: number; revenue: number }>);

  const salesByPerson = Object.values(salesPersonData);

  // Calculate payment type distribution
  const paymentTypeData = rows.reduce((acc, row) => {
    const type = row.paymentType?.trim() || "غير محدد";
    if (!acc[type]) {
      acc[type] = { name: type, value: 0 };
    }
    acc[type].value += 1;
    return acc;
  }, {} as Record<string, { name: string; value: number }>);

  const paymentDistribution = Object.values(paymentTypeData);

  const handleRefreshAll = () => {
    refetchDeposits();
    refetchSales();
  };

  const clearDateFilter = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">
            Real-time insights into your real estate operations
          </p>
        </div>
        
        {/* Date Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !dateFrom && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="ml-2 h-4 w-4" />
                {dateFrom ? format(dateFrom, "yyyy/MM/dd", { locale: ar }) : "من تاريخ"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateFrom}
                onSelect={setDateFrom}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !dateTo && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="ml-2 h-4 w-4" />
                {dateTo ? format(dateTo, "yyyy/MM/dd", { locale: ar }) : "إلى تاريخ"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateTo}
                onSelect={setDateTo}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>

          {(dateFrom || dateTo) && (
            <Button variant="ghost" size="icon" onClick={clearDateFilter}>
              <X className="h-4 w-4" />
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAll}
            disabled={depositsLoading || salesLoading}
          >
            <RefreshCw className={cn("h-4 w-4 ml-1", (depositsLoading || salesLoading) && "animate-spin")} />
            تحديث
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="عدد العملاء"
          value={salesLoading ? "..." : customersCount.toString()}
          icon={Users}
        />
        <MetricCard
          title="إجمالي المبيعات"
          value={salesLoading ? "..." : formatCurrency(totals?.salePrice || 0)}
          icon={DollarSign}
        />
        <MetricCard
          title="السعر الحقيقي"
          value={salesLoading ? "..." : formatCurrency(totals?.realPrice || 0)}
          icon={Banknote}
        />
        <Card className="hover:shadow-lg transition-shadow bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-2">مجموع المقدمات</p>
                <h3 className="text-3xl font-bold text-foreground mb-1">
                  {depositsLoading ? "..." : formatCurrency(totalDeposits)}
                </h3>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshAll}
                  disabled={depositsLoading || salesLoading}
                  className="text-xs"
                >
                  <RefreshCw className={`h-3 w-3 mr-1 ${depositsLoading || salesLoading ? "animate-spin" : ""}`} />
                  تحديث
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Site Plan - Prominent Display */}
      <div className="my-8">
        <InteractiveSitePlan />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              أداء موظفي المبيعات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesByPerson}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
                <Bar dataKey="sales" name="عدد المبيعات" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-accent" />
              إيرادات حسب الموظف
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesByPerson}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => `${(value / 1000000000).toFixed(1)}B`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Bar dataKey="revenue" name="الإيرادات" fill="hsl(var(--chart-2))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-success" />
              توزيع طرق الدفع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default Dashboard;
