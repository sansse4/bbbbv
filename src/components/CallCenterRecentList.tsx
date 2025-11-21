import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface CallRecord {
  name: string;
  phone: string;
  appointment: string;
  status: string;
  notes?: string;
  timestamp: string;
}

interface CallCenterRecentListProps {
  calls: CallRecord[];
}

export const CallCenterRecentList = ({ calls }: CallCenterRecentListProps) => {
  if (calls.length === 0) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "مهتم جداً":
        return "bg-success text-success-foreground";
      case "مهتم":
        return "bg-primary text-primary-foreground";
      case "متردد":
        return "bg-secondary text-secondary-foreground";
      case "غير مهتم":
        return "bg-muted text-muted-foreground";
      case "رقم خاطئ":
      case "لا يرد":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          آخر المكالمات
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الوقت</TableHead>
                <TableHead>الاسم</TableHead>
                <TableHead>رقم الهاتف</TableHead>
                <TableHead>حجز موعد</TableHead>
                <TableHead>حالة الزبون</TableHead>
                <TableHead>ملاحظات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {calls.map((call, index) => (
                <TableRow key={index}>
                  <TableCell className="text-sm text-muted-foreground">
                    {call.timestamp}
                  </TableCell>
                  <TableCell className="font-medium">{call.name}</TableCell>
                  <TableCell>{call.phone}</TableCell>
                  <TableCell>{call.appointment}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(call.status)}>
                      {call.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                    {call.notes || "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
