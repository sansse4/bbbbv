import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface RecentSale {
  timestamp: string;
  customer_name: string;
  mobile: string;
  block_number: string;
  house_number: string;
  paid_amount: number;
  remaining_amount: number;
  sales_agent: string;
}

interface SalesRecentListProps {
  sales: RecentSale[];
}

export const SalesRecentList = ({ sales }: SalesRecentListProps) => {
  if (sales.length === 0) {
    return null;
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("ar-IQ", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ar-IQ").format(amount);
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>آخر العمليات</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">التاريخ والوقت</TableHead>
                <TableHead className="text-right">اسم الزبون</TableHead>
                <TableHead className="text-right">الموبايل</TableHead>
                <TableHead className="text-right">بلوك</TableHead>
                <TableHead className="text-right">بيت</TableHead>
                <TableHead className="text-right">المدفوع</TableHead>
                <TableHead className="text-right">المتبقي</TableHead>
                <TableHead className="text-right">الموظف</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.slice(0, 10).map((sale, index) => (
                <TableRow key={index}>
                  <TableCell className="text-right">{formatDate(sale.timestamp)}</TableCell>
                  <TableCell className="text-right font-medium">{sale.customer_name}</TableCell>
                  <TableCell className="text-right" dir="ltr">{sale.mobile}</TableCell>
                  <TableCell className="text-right">{sale.block_number}</TableCell>
                  <TableCell className="text-right">{sale.house_number}</TableCell>
                  <TableCell className="text-right">{formatCurrency(sale.paid_amount)} IQD</TableCell>
                  <TableCell className="text-right">{formatCurrency(sale.remaining_amount)} IQD</TableCell>
                  <TableCell className="text-right">{sale.sales_agent}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
