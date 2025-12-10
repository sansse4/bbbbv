import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Target, Award, RefreshCw } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { SalesForm } from "@/components/SalesForm";
import { SalesRecentList } from "@/components/SalesRecentList";
import { LeadsTracker } from "@/components/LeadsTracker";
import { useImportedSales } from "@/hooks/useImportedSales";

const Sales = () => {
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const { sales: salesData, isLoading, error, refetch } = useImportedSales();

  const handleSaleAdded = (sale: any) => {
    setRecentSales((prev) => [sale, ...prev]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "closed":
        return "bg-success text-success-foreground";
      case "pending":
        return "bg-warning text-warning-foreground";
      case "negotiation":
        return "bg-accent text-accent-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sales Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage property sales performance
          </p>
        </div>
        <Button className="gap-2">
          <TrendingUp className="h-4 w-4" />
          New Sale
        </Button>
      </div>

      <LeadsTracker />

      <SalesForm onSaleAdded={handleSaleAdded} />

      {recentSales.length > 0 && <SalesRecentList sales={recentSales} />}

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Sales Activity</CardTitle>
          <Button variant="outline" size="sm" onClick={refetch} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-destructive text-center py-4">{error}</div>
          )}
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">جاري تحميل البيانات...</div>
          ) : salesData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">لا توجد بيانات مبيعات</div>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
              <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم</TableHead>
                    <TableHead>العنوان</TableHead>
                    <TableHead>الهاتف</TableHead>
                    <TableHead>المهنة</TableHead>
                    <TableHead>عدد افراد الاسرة</TableHead>
                    <TableHead>فئة الدار</TableHead>
                    <TableHead>رقم الدار</TableHead>
                    <TableHead>المصدر</TableHead>
                    <TableHead>التاريخ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesData.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{sale.name}</TableCell>
                      <TableCell>{sale.address}</TableCell>
                      <TableCell dir="ltr">{sale.phone}</TableCell>
                      <TableCell>{sale.profession}</TableCell>
                      <TableCell>{sale.familyMembers}</TableCell>
                      <TableCell>{sale.houseCategory}</TableCell>
                      <TableCell>{sale.houseNumber}</TableCell>
                      <TableCell>{sale.source}</TableCell>
                      <TableCell>{sale.timestamp}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Sales;
