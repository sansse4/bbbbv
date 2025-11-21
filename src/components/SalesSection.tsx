import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, TrendingUp, Package, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth, subMonths, startOfYear } from 'date-fns';
import { ar } from 'date-fns/locale';

interface SaleRecord {
  id: string;
  sale_date: string;
  customer_name: string;
  customer_phone: string | null;
  block_number: string;
  house_number: string;
  payment_method: string;
  paid_amount: number;
  remaining_amount: number;
  total_amount: number;
  status: string;
  notes: string | null;
}

interface SalesSectionProps {
  employeeId: string;
  dateRange: { from: Date; to: Date };
  onDateRangeChange: (range: { from: Date; to: Date }) => void;
}

export function SalesSection({ employeeId, dateRange, onDateRangeChange }: SalesSectionProps) {
  const { toast } = useToast();
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalValue: 0,
    avgDeal: 0,
    wonDeals: 0
  });

  useEffect(() => {
    fetchSales();
  }, [employeeId, dateRange]);

  const fetchSales = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .eq('employee_id', employeeId)
        .gte('sale_date', format(dateRange.from, 'yyyy-MM-dd'))
        .lte('sale_date', format(dateRange.to, 'yyyy-MM-dd'))
        .order('sale_date', { ascending: false });

      if (error) throw error;

      setSales(data || []);

      // Calculate stats
      const totalValue = data?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;
      const wonDeals = data?.filter(s => s.status === 'won').length || 0;

      setStats({
        totalSales: data?.length || 0,
        totalValue,
        avgDeal: data?.length ? totalValue / data.length : 0,
        wonDeals
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: error.message || 'فشل في جلب بيانات المبيعات'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (period: string) => {
    const now = new Date();
    let from: Date, to: Date;

    switch (period) {
      case 'this_month':
        from = startOfMonth(now);
        to = now;
        break;
      case 'last_month':
        from = startOfMonth(subMonths(now, 1));
        to = endOfMonth(subMonths(now, 1));
        break;
      case 'this_year':
        from = startOfYear(now);
        to = now;
        break;
      default:
        from = startOfMonth(now);
        to = now;
    }

    onDateRangeChange({ from, to });
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      won: 'مكتمل',
      pending: 'قيد المعالجة',
      cancelled: 'ملغي'
    };
    return labels[status] || status;
  };

  const getStatusVariant = (status: string) => {
    const variants: Record<string, any> = {
      won: 'default',
      pending: 'secondary',
      cancelled: 'destructive'
    };
    return variants[status] || 'secondary';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-IQ', {
      style: 'currency',
      currency: 'IQD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: 'كاش',
      real_estate_bank_initiative: 'مبادرة المصرف العقاري',
      installments: 'دفعات'
    };
    return labels[method] || method;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">أداء المبيعات</h2>
        <Select defaultValue="this_month" onValueChange={handlePeriodChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="this_month">هذا الشهر</SelectItem>
            <SelectItem value="last_month">الشهر الماضي</SelectItem>
            <SelectItem value="this_year">هذا العام</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المبيعات</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSales}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">القيمة الإجمالية</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط الصفقة</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.avgDeal)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الصفقات المكتملة</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.wonDeals}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>سجل المبيعات</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : sales.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد مبيعات للفترة المحددة
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>العميل</TableHead>
                  <TableHead>العقار</TableHead>
                  <TableHead>طريقة الدفع</TableHead>
                  <TableHead>المبلغ المدفوع</TableHead>
                  <TableHead>المبلغ المتبقي</TableHead>
                  <TableHead>الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>
                      {format(new Date(sale.sale_date), 'dd/MM/yyyy', { locale: ar })}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{sale.customer_name}</div>
                        {sale.customer_phone && (
                          <div className="text-xs text-muted-foreground">{sale.customer_phone}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>بلوك {sale.block_number}</div>
                        <div className="text-muted-foreground">دار {sale.house_number}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getPaymentMethodLabel(sale.payment_method)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-green-600">
                      {formatCurrency(Number(sale.paid_amount))}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatCurrency(Number(sale.remaining_amount))}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(sale.status)}>
                        {getStatusLabel(sale.status)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
