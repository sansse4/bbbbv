import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown, ChevronUp, Phone, RefreshCw, Loader2 } from "lucide-react";
import { useImportedCalls, ImportedCall } from "@/hooks/useImportedCalls";

export const CollapsibleCallsList = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { calls, isLoading, error, refetch } = useImportedCalls();

  const getStatusColor = (status: ImportedCall["status"]) => {
    switch (status) {
      case "contacted":
        return "bg-success text-success-foreground";
      case "no-answer":
        return "bg-destructive text-destructive-foreground";
      case "wrong-number":
        return "bg-muted text-muted-foreground";
      case "pending":
        return "bg-destructive/80 text-destructive-foreground font-bold";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getStatusLabel = (status: ImportedCall["status"]) => {
    switch (status) {
      case "contacted":
        return "تم الاتصال";
      case "no-answer":
        return "لم يتم الرد";
      case "wrong-number":
        return "رقم خطأ";
      case "pending":
        return "لم يتم الاتصال";
      default:
        return status;
    }
  };

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                مكالمات الكول سنتر
                <Badge variant="secondary" className="mr-2">
                  {calls.length}
                </Badge>
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    refetch();
                  }}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
                {isOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="text-center py-8 text-destructive">{error}</div>
            ) : calls.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                لا توجد مكالمات
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الاسم</TableHead>
                      <TableHead>رقم الهاتف</TableHead>
                      <TableHead>حالة الزبون</TableHead>
                      <TableHead>ملاحظات</TableHead>
                      <TableHead>الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {calls.map((call, index) => (
                      <TableRow key={`${call.phone}-${index}`}>
                        <TableCell className="font-medium">{call.name}</TableCell>
                        <TableCell>{call.phone}</TableCell>
                        <TableCell>{call.customerStatus || "-"}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{call.notes || "-"}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(call.status)}>
                            {getStatusLabel(call.status)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
